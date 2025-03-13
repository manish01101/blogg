import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import BlogPreviewCard from "../components/BlogPreviewCard";

interface Blog {
  id: string;
  title: string;
  content: string;
  coverImage?: string;
}

const Blogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchBlogs = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/v1/blog/user/bulk`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBlogs(response.data.posts);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [token]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col ">
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-5xl font-bold text-center text-gray-800">
            Blog Posts
          </h1>
          <p className="text-lg text-center text-gray-600 mt-2">
            Discover stories, ideas, and thoughts from our writers.
          </p>

          <div className="mt-10 grid gap-8">
            {blogs.map((blog) => (
              <BlogPreviewCard key={blog.id} blog={blog} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Blogs;
