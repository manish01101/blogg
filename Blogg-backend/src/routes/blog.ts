import { Hono } from "hono";
import { verify } from "hono/jwt";
import { getPrisma } from "../utils/prisma";
import { uploadImageToCloudinaryREST } from "../utils/cloudinary";

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
    CLOUDINARY_UPLOAD_PRESET: String;
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
    console.log(authorName);

    if (!title || !content) {
      return c.json({ message: "Title and content are required!" }, 400);
    }

    // default img url
    let coverImageUrl: string | null =
      "https://static.vecteezy.com/system/resources/previews/000/578/699/non_2x/vector-feather-pen-write-sign-logo-template-app-icons.jpg";

    // If a file was uploaded, upload to Cloudinary
    if (coverImage) {
      if (!coverImage.type.startsWith("image/")) {
        return c.json(
          { message: "Invalid file type. Only images allowed." },
          400
        );
      }
      if (coverImage.size > 5 * 1024 * 1024) {
        return c.json({ message: "Image too large. Max 5MB." }, 400);
      }
      // Use the REST upload function
      const uploadResult = await uploadImageToCloudinaryREST({
        file: coverImage,
        filename: Date.now().toString(),
        cloudName: c.env.CLOUDINARY_CLOUD_NAME,
        apiKey: c.env.CLOUDINARY_API_KEY,
        uploadPreset: c.env.CLOUDINARY_UPLOAD_PRESET.toString(),
      });
      coverImageUrl = uploadResult.secure_url;
    }

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
blogRouter.put("/update/:id", async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);

  try {
    const userId = c.get("userId");
    const postId = c.req.param("id");
    const { title, content, coverImage } = await c.req.json();

    if (!title || !content) {
      return c.json({ message: "Title and content are required" }, 400);
    }

    const existingPost = await prisma.post.findFirst({
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
    const limit = 10; // Number of blogs per request

    const posts = await prisma.post.findMany({
      where: {
        isDeleted: false,
      },
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

// get user's specific blogs
blogRouter.get("/user/bulk", async (c) => {
  const authorId = c.get("userId");

  try {
    const prisma = getPrisma(c.env.DATABASE_URL);

    const posts = await prisma.post.findMany({
      where: {
        authorId,
        isDeleted: false,
      },
      select: {
        id: true,
        title: true,
        content: true,
        coverImage: true,
        authorName: true,
        authorId: true,
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
      where: { id: postId, isDeleted: false },
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

// soft delete blog
blogRouter.put("/delete/:id", async (c) => {
  const postId = c.req.param("id");
  try {
    const prisma = getPrisma(c.env.DATABASE_URL);
    const userId = c.get("userId");

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return c.json({ message: "Post not found." }, 404);

    if (post.authorId !== userId)
      return c.json({ message: "Unauthorized." }, 403);

    await prisma.post.update({
      where: { id: postId },
      data: { isDeleted: true },
    });

    return c.json({ message: "Post deleted (soft delete)." });
  } catch (error) {
    console.error(error);
    c.status(500);
    return c.json({ message: "Internal server error" });
  }
});

// Get user's soft-deleted blogs (Trash)
blogRouter.get("/user/trash", async (c) => {
  const authorId = c.get("userId");

  try {
    const prisma = getPrisma(c.env.DATABASE_URL);

    const posts = await prisma.post.findMany({
      where: {
        authorId,
        isDeleted: true,
      },
      select: {
        id: true,
        title: true,
        content: true,
        coverImage: true,
        authorName: true,
        authorId: true,
        likes: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return c.json({ posts });
  } catch (error) {
    console.error("Error fetching trash:", error);
    return c.json({ message: "Internal server error" }, 500);
  }
});

// bulk restore and delete
// Bulk Restore Blogs
blogRouter.put("/restore/bulk", async (c) => {
  const { ids } = await c.req.json<{ ids: string[] }>();
  const userId = c.get("userId");
  const prisma = getPrisma(c.env.DATABASE_URL);

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return c.json({ message: "No IDs provided" }, 400);
  }

  try {
    await prisma.post.updateMany({
      where: {
        id: { in: ids },
        authorId: userId,
        isDeleted: true,
      },
      data: { isDeleted: false },
    });

    return c.json({ message: "Posts restored successfully" });
  } catch (error) {
    console.error("Error bulk restoring:", error);
    return c.json({ message: "Internal server error" }, 500);
  }
});

// Bulk Permanently Delete Blogs
blogRouter.delete("/permanent/bulk", async (c) => {
  const { ids } = await c.req.json<{ ids: string[] }>();
  const userId = c.get("userId");
  const prisma = getPrisma(c.env.DATABASE_URL);

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return c.json({ message: "No IDs provided" }, 400);
  }

  try {
    await prisma.post.deleteMany({
      where: {
        id: { in: ids },
        authorId: userId,
        isDeleted: true, // Only allow deleting from trash
      },
    });

    return c.json({ message: "Posts permanently deleted" });
  } catch (error) {
    console.error("Error bulk permanent delete:", error);
    return c.json({ message: "Internal server error" }, 500);
  }
});

// Restore a soft-deleted blog
blogRouter.put("/restore/:id", async (c) => {
  const postId = c.req.param("id");
  const userId = c.get("userId");
  const prisma = getPrisma(c.env.DATABASE_URL);

  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return c.json({ message: "Post not found." }, 404);

    if (post.authorId !== userId)
      return c.json({ message: "Unauthorized." }, 403);

    const restoredPost = await prisma.post.update({
      where: { id: postId },
      data: { isDeleted: false },
    });

    return c.json({ message: "Post restored successfully", restoredPost });
  } catch (error) {
    console.error("Error restoring post:", error);
    return c.json({ message: "Internal server error" }, 500);
  }
});

// Permanently delete a blog (hard delete)
blogRouter.delete("/permanent/:id", async (c) => {
  const postId = c.req.param("id");
  const userId = c.get("userId");
  const prisma = getPrisma(c.env.DATABASE_URL);

  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return c.json({ message: "Post not found." }, 404);

    if (post.authorId !== userId)
      return c.json({ message: "Unauthorized." }, 403);

    await prisma.post.delete({ where: { id: postId } });

    return c.json({ message: "Post permanently deleted." });
  } catch (error) {
    console.error("Error deleting permanently:", error);
    return c.json({ message: "Internal server error" }, 500);
  }
});

export default blogRouter;
