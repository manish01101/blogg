import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import BlogPreviewCard from "../components/BlogPreviewCard";
import { blogState } from "../store/atoms/blogs";
import { useRecoilState } from "recoil";
import Loading from "../components/Loading";

const Blogs = () => {
  const [blogs, setBlogs] = useRecoilState(blogState);
  const [loading, setLoading] = useState(blogs.length === 0); // Show loading only if blogs are empty
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      // if (blogs.length > 0) return;

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Unauthorized: No token found.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/v1/blog/user/bulk`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setBlogs(response.data.posts);
      } catch (error: unknown) {
        console.error(error);
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.message || error.message);
        } else {
          setError("Something went wrong!");
        }
      } finally {
        setLoading(false);
      }
    };

    // Fetch only if blogs are empty
    if (blogs.length === 0) {
      fetchBlogs();
    }
  }, [blogs, setBlogs]); // Dependencies to prevent redundant requests

  if (loading) return <Loading />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="flex flex-col">
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-5xl font-bold text-center text-gray-800">
            Blog Posts
          </h1>
          <p className="text-lg text-center text-gray-600 mt-2">
            Discover stories, ideas, and thoughts from our writers.
          </p>

          {blogs.length === 0 ? (
            <p className="text-center text-gray-500 mt-6">
              No blogs available.
            </p>
          ) : (
            <div className="mt-10 grid gap-8">
              {blogs.map((blog) => (
                <BlogPreviewCard key={blog.id} blog={blog} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Blogs;
