import { Hono } from "hono";
import { verify } from "hono/jwt";
import { getPrisma } from "../utils/prisma";

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

// Create a new blog post
blogRouter.post("/", async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  try {
    const formData = await c.req.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const coverImage = formData.get("coverImage") as File | null;
    const authorName = formData.get("authorName") as string;

    if (!title || !content) {
      return c.json({ message: "Title and content are required!" }, 400);
    }

    // default img url
    let coverImageUrl: string | null =
      "https://static.vecteezy.com/system/resources/previews/000/578/699/non_2x/vector-feather-pen-write-sign-logo-template-app-icons.jpg";

    // Save post to database
    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: c.get("userId"),
        published: true,
        coverImage: coverImageUrl,
        authorName,
      },
    });

    return c.json({ message: "Blog created successfully!", post }, 201);
  } catch (error) {
    console.error("Error creating blog:", error);
    return c.json({ message: "Internal Server Error" }, 500);
  }
});

// update like
blogRouter.put("/like/:id", async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);

  try {
    const postId = c.req.param("id");
    const { increment } = await c.req.json(); // Expecting { increment: true/false }

    if (typeof increment !== "boolean") {
      return c.json({ message: "Invalid request format" }, 400);
    }

    // Increment or decrement likes count
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        likes: { increment: increment ? 1 : -1 },
      },
    });

    return c.json({ message: "Like updated successfully" });
  } catch (error) {
    console.error(error);
    return c.json({ message: "Internal server error" }, 500);
  }
});

// Update a Blog Post (Only Author Can Edit)
blogRouter.put("/:id", async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);

  try {
    const userId = c.get("userId");
    const postId = c.req.param("id");
    const { title, content, coverImage } = await c.req.json();

    if (!title || !content) {
      return c.json({ message: "Title and content are required" }, 400);
    }

    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });
    if (!existingPost) {
      return c.json({ message: "Post not found" }, 404);
    }

    if (existingPost.authorId !== userId) {
      return c.json({ message: "Unauthorized to update this post" }, 403);
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { title, content, coverImage },
    });

    return c.json({ message: "Post updated successfully", updatedPost });
  } catch (error) {
    console.error(error);
    return c.json({ message: "Internal server error" }, 500);
  }
});

// get all blogs
blogRouter.get("/bulk", async (c) => {
  try {
    const prisma = getPrisma(c.env.DATABASE_URL);

    const cursor = c.req.query("cursor"); // Get cursor from request
    const limit = 5; // Number of blogs per request

    const posts = await prisma.post.findMany({
      take: limit,
      skip: cursor ? 1 : 0, // Skip 1 item if cursor exists
      cursor: cursor ? { id: cursor } : undefined, // Start from the last seen post
      orderBy: { createdAt: "desc" },
    });

    const nextCursor =
      posts.length === limit ? posts[posts.length - 1].id : null;

    return c.json({ posts, nextCursor });
  } catch (error) {
    console.error(error);
    return c.json({ message: "Internal server error" }, 500);
  }
});

// get user specific blogs
blogRouter.get("/user/bulk", async (c) => {
  const authorId = c.get("userId");

  try {
    const prisma = getPrisma(c.env.DATABASE_URL);

    const posts = await prisma.post.findMany({
      where: {
        authorId,
      },
      select: {
        id: true,
        title: true,
        content: true,
        coverImage: true,
        authorName: true,
        likes: true,
        createdAt: true,
      },
    });
    return c.json({ posts });
  } catch (error) {
    console.error(error);
    return c.json({ message: "Internal server error" }, 500);
  }
});

// Get a Blog Post by ID
blogRouter.get("/:id", async (c) => {
  const postId = c.req.param("id");

  try {
    const prisma = getPrisma(c.env.DATABASE_URL);

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      c.status(404);
      return c.json({ message: "Post not found" });
    }
    c.status(200);
    return c.json({ post });
  } catch (error) {
    console.error(error);
    c.status(500);
    return c.json({ message: "Internal server error" });
  }
});

export default blogRouter;
