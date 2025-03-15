import { useEffect, useRef, useState } from "react";
import { Blog } from "../types";
import axios from "axios";
import { BACKEND_URL } from "../config";
import BlogPreviewCard from "../components/BlogPreviewCard";
import { useRecoilState } from "recoil";
import { homeBlogState } from "../store/atoms/blogs";

const Home = () => {
  const [homeBlogs, setHomeBlogs] = useRecoilState(homeBlogState);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastBlogRef = useRef<HTMLDivElement | null>(null);

  const token = localStorage.getItem("token");

  // Fetch blogs with cursor-based pagination
  const fetchBlogs = async () => {
    if (loading || cursor === "end") return;
    setLoading(true);

    try {
      if (!token) {
        setError("You are logged out, Please sign in!");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${BACKEND_URL}/api/v1/blog/bulk?cursor=${cursor || ""}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newBlogs = response.data.posts;
      const nextCursor = response.data.nextCursor || "end";

      setHomeBlogs((prev) => {
        const blogMap = new Map(prev.map((blog) => [blog.id, blog]));
        newBlogs.forEach((blog: Blog) => blogMap.set(blog.id, blog));
        return Array.from(blogMap.values());
      });

      setCursor(nextCursor);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setError(
        axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : "Something went wrong!"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch blogs only on initial load if Recoil state is empty
  useEffect(() => {
    if (homeBlogs.length === 0) fetchBlogs();
  }, []);

  // Infinite Scroll Observer
  useEffect(() => {
    if (!lastBlogRef.current) return;

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading) {
        fetchBlogs();
      }
    });

    observer.current.observe(lastBlogRef.current);
    return () => observer.current?.disconnect();
  }, [homeBlogs, cursor]);

  return (
    <main className="flex-grow">
      {!token || error ? (
        <div className="flex flex-col items-start justify-start p-20">
          <header className="">
            <h2 className="text-6xl md:text-7xl lg:text-8xl max-w-3/5">
              Where Words Find Their Home.
            </h2>

            <p className="pt-4 text-xl text-gray-700">
              A place to read, write, and deepen your understanding
            </p>
          </header>

          {/* Align button to the left */}
          <div className="flex justify-start pt-10">
            <button
              onClick={() => {}}
              className="px-10 py-3 text-white text-lg bg-green-700 lg:bg-gray-700 rounded-full cursor-pointer transform transition duration-300 hover:scale-[1.05] hover:shadow-2xl"
            >
              Start reading
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h3 className="text-3xl font-semibold text-gray-800 m-6">
            Latest Posts...
          </h3>
          {/* Blog Previews */}
          {homeBlogs.length === 0 ? (
            <p className="text-center text-gray-500 mt-6">
              No blogs available.
            </p>
          ) : (
            <section className="container max-w-4xl mx-auto px-6 py-12">
              <div className="grid gap-6">
                {homeBlogs.map((blog, index) => (
                  <div
                    key={blog.id}
                    ref={index === homeBlogs.length - 1 ? lastBlogRef : null}
                  >
                    <BlogPreviewCard blog={blog} />
                  </div>
                ))}
              </div>
              {loading && <p className="text-center">Loading more...</p>}
            </section>
          )}
        </div>
      )}
    </main>
  );
};

export default Home;
