import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign, verify } from "hono/jwt";
import bcrypt from "bcryptjs"; // Secure password hashing

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

// Middleware to extract and verify JWT
userRouter.use("/auth/*", async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = await verify(token, c.env.JWT_SECRET);
    if (!payload) {
      return c.json({ message: "Unauthorized" }, 401);
    }
    c.set("userId", payload.id as string);
    await next();
  } catch {
    return c.json({ message: "Unauthorized" }, 401);
  }
});

// Validate JWT Token
userRouter.get("/auth/validate", async (c) => {
  return c.json({ valid: true });
});

// Fetch user details (authenticated user)
userRouter.get("/auth/me", async (c) => {
  const userId = c.get("userId");

  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }, // Fetch only email for security
    });

    if (!user) {
      return c.json({ message: "User not found" }, 404);
    }

    return c.json({ userId, email: user.email });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return c.json({ message: "Internal server error" }, 500);
  }
});

// Signup route (Register user)
userRouter.post("/signup", async (c) => {
  try {
    const { email, password } = await c.req.json();
    if (!email || !password) {
      return c.json({ message: "Email and password are required!" }, 400);
    }
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return c.json({ message: "User already exists!" }, 409);
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    // Generate JWT
    const token = await sign({ id: user.id }, c.env.JWT_SECRET);

    return c.json(
      { jwt: token, message: "User created successfully!", email },
      201
    );
  } catch (error) {
    console.error("Signup error:", error);
    return c.json({ message: "Internal server error" }, 500);
  }
});

// Sign-in route (Login user)
userRouter.post("/signin", async (c) => {
  try {
    const { email, password } = await c.req.json();
    if (!email || !password) {
      return c.json({ message: "Email and password are required!" }, 400);
    }
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return c.json({ message: "Invalid email or password!" }, 403);
    }

    // Compare hashed passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return c.json({ message: "Invalid email or password!" }, 403);
    }

    // Generate JWT
    const token = await sign({ id: user.id }, c.env.JWT_SECRET);

    return c.json(
      { jwt: token, message: "User signed in successfully!", email },
      200
    );
  } catch (error) {
    console.error("Signin error:", error);
    return c.json({ message: "Internal server error" }, 500);
  }
});
