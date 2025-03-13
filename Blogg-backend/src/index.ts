import { Hono } from "hono";
import { userRouter } from "./routes/user";
import blogRouter from "./routes/blog";
import { cors } from "hono/cors";

export const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

app.use(
  "*",
  cors({
    origin: ["https://blogg-cyan-mu.vercel.app", "http://localhost:5173"],
    credentials: true, // Allow credentials like cookies & authentication headers
    allowMethods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
  })
);

app.get("/", (c) => {
  return c.text("Welcome to Blogg backend");
});

app.route("/api/v1/user", userRouter);
app.route("/api/v1/blog", blogRouter);

export default app;
