import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

// Middleware to Authenticate User and Extract userId
blogRouter.use("*", async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) {
    c.status(401);
    return c.json({ error: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = await verify(token, c.env.JWT_SECRET);
    c.set("userId", payload.id as string);
    await next();
  } catch {
    c.status(401);
    return c.json({ error: "Invalid token" });
  }
});

// Create a New Blog Post
blogRouter.post("/", async (c) => {
  const userId = c.get("userId");
  const { title, content } = await c.req.json();

  if (!title || !content) {
    c.status(400);
    return c.json({ error: "Title and content are required" });
  }

  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const post = await prisma.post.create({
      data: { title, content, authorId: userId },
    });

    return c.json({ id: post.id });
  } catch (error) {
    console.error(error);
    c.status(500);
    return c.json({ error: "Internal server error" });
  }
});

// Update a Blog Post (Only Author Can Edit)
blogRouter.put("/:id", async (c) => {
  const userId = c.get("userId");
  const postId = c.req.param("id");
  const { title, content } = await c.req.json();

  if (!title || !content) {
    c.status(400);
    return c.json({ error: "Title and content are required" });
  }

  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const updatedPost = await prisma.post.update({
      where: { id: postId, authorId: userId },
      data: { title, content },
    });

    return c.text("Post updated successfully");
  } catch (error) {
    console.error(error);
    c.status(500);
    return c.json({ error: "Internal server error" });
  }
});

// get all blogs
blogRouter.get("/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const blogs = await prisma.post.findMany();

  return c.json({ blogs });
});

// Get a Blog Post by ID
blogRouter.get("/:id", async (c) => {
  const postId = c.req.param("id");

  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      c.status(404);
      return c.json({ error: "Post not found" });
    }
    c.status(200);
    return c.json({ post });
  } catch (error) {
    console.error(error);
    c.status(500);
    return c.json({ error: "Internal server error" });
  }
});

export default blogRouter;
