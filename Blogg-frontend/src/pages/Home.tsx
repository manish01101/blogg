import { useEffect, useRef, useState } from "react";
import { Blog } from "../types";
import axios from "axios";
import { BACKEND_URL } from "../config";
import BlogPreviewCard from "../components/BlogPreviewCard";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { homeBlogState } from "../store/atoms/blogs";

const Home = () => {
  const [homeBlogs, setHomeBlogs] = useRecoilState(homeBlogState);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastBlogRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // Fetch blogs with cursor-based pagination
  const fetchBlogs = async () => {
    if (loading || cursor === "end") return;
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are logged out, Please sign in!");
        setLoading(false);
        setTimeout(() => navigate("/signin"), 1000);
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

  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <header className="text-center py-20">
        <h2 className="text-4xl font-black">Welcome to Blogg</h2>
        <p className="text-lg mt-2">
          Discover amazing articles on various topics written by passionate
          bloggers.
        </p>
        <h3 className="text-3xl font-semibold text-gray-800 mb-6">
          Latest Posts
        </h3>
      </header>

      {/* Blog Previews */}
      {homeBlogs.length === 0 ? (
        <p className="text-center text-gray-500 mt-6">No blogs available.</p>
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
    </main>
  );
};

export default Home;
