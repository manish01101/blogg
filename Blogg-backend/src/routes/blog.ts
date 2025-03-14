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
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

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
      "https://png.pngtree.com/png-vector/20231114/ourmid/pngtree-red-blog-logo-title-graphic-png-image_10558747.png";

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
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

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
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

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
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const posts = await prisma.post.findMany();
    return c.json({ posts });
  } catch (error) {
    console.error(error);
    return c.json({ message: "Internal server error" }, 500);
  }
});

// get user specific blogs
blogRouter.get("/user/bulk", async (c) => {
  const authorId = c.get("userId");

  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

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
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

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
