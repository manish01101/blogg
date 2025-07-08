import { Hono } from "hono";
import { sign, verify } from "hono/jwt";
import bcrypt from "bcryptjs"; // Secure password hashing
import { getPrisma } from "../utils/prisma";

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
    const prisma = getPrisma(c.env.DATABASE_URL);

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
    const prisma = getPrisma(c.env.DATABASE_URL);

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
      {
        jwt: token,
        message: "User created successfully!",
        email,
        userId: user.id,
      },
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
    const prisma = getPrisma(c.env.DATABASE_URL);

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
      {
        jwt: token,
        message: "User signed in successfully!",
        email,
        userId: user.id,
      },
      200
    );
  } catch (error) {
    console.error("Signin error:", error);
    return c.json({ message: "Internal server error" }, 500);
  }
});

// update profile
userRouter.put("/auth/profile", async (c) => {
  const userId = c.get("userId");
  const { name, email, profileImage } = await c.req.json();

  if (!name && !email && !profileImage) {
    return c.json({ message: "Nothing to update." }, 400);
  }

  const prisma = getPrisma(c.env.DATABASE_URL);

  // Check for email uniqueness if updating email
  if (email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== userId) {
      return c.json({ message: "Email already in use." }, 409);
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      name: name || undefined,
      email: email || undefined,
      profileImage: profileImage || undefined,
    },
    select: {
      id: true,
      name: true,
      email: true,
      profileImage: true,
    },
  });

  return c.json({ message: "Profile updated", userId: updated.id });
});

// change password
userRouter.put("/auth/password", async (c) => {
  const userId = c.get("userId");
  const { oldPassword, newPassword } = await c.req.json();

  if (!oldPassword || !newPassword) {
    return c.json({ message: "Old and new password required." }, 400);
  }

  const prisma = getPrisma(c.env.DATABASE_URL);
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
    return c.json({ message: "Incorrect current password." }, 403);
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  });

  return c.json({ message: "Password updated." });
});
