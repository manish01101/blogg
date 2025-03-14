import { useLocation, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useState, useEffect } from "react";
import { blogState } from "../store/atoms/blogs";
import { useRecoilState } from "recoil";

const BlogPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useRecoilState(blogState);
  const token = localStorage.getItem("token");

  // Find blog from global state
  const blogId = location.state?.blog?.id;
  const blog = blogs.find((b) => b.id === blogId);

  // If blog is not found, navigate back
  useEffect(() => {
    if (!blog) {
      navigate("/blogs");
    }
  }, [blog, navigate]);

  // Local like state
  const [liked, setLiked] = useState(false);
  const [totalLikes, setTotalLikes] = useState(blog?.likes || 0);

  useEffect(() => {
    if (blog) {
      setTotalLikes(blog.likes);
    }
  }, [blog?.likes]); // Only runs when blog.likes changes

  if (!blog) return null; // Ensures no errors if blog is null

  const handleLike = async () => {
    try {
      const newLikedState = !liked;
      const updatedTotalLikes = newLikedState ? totalLikes + 1 : totalLikes - 1;

      // Optimistically update state before sending request
      setLiked(newLikedState);
      setTotalLikes(updatedTotalLikes);

      const response = await axios.put(
        `${BACKEND_URL}/api/v1/blog/like/${blog.id}`,
        { increment: newLikedState }, // Change "liked" to "increment"
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // Update global state
        setBlogs((prevBlogs) =>
          prevBlogs.map((b) =>
            b.id === blog.id ? { ...b, likes: updatedTotalLikes } : b
          )
        );
      }
    } catch (error) {
      console.error("Error updating like status", error);
      alert("Failed to update like. Please try again.");

      // Revert state if API call fails
      setLiked((prev) => !prev);
      setTotalLikes((prev) => (liked ? prev - 1 : prev + 1));
    }
  };

  return (
    <div className="flex flex-col">
      <div className="w-full bg-gray-50 sm:max-w-xl md:max-w-3xl lg-max-w-5xl mx-auto p-6 mb-6 shadow-lg rounded-lg mt-10">
        {/* Cover Image */}
        {blog.coverImage && (
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="w-full h-66 object-cover rounded-md"
          />
        )}

        {/* Blog Title */}
        <h1 className="text-5xl font-extrabold text-gray-900 mt-6 leading-snug">
          {blog.title}
        </h1>

        {/* Author & Date */}
        <div className="text-gray-500 pt-2 text-sm flex flex-row">
          <span>
            By <strong>{blog.authorName || "Unknown"}</strong> •{" "}
            {blog.createdAt
              ? new Date(blog.createdAt)
                  .toDateString()
                  .split(" ")
                  .slice(1, 3)
                  .join(" ")
              : "Unknown Date"}
          </span>
          <span className="mx-2">•</span>
          <span
            className="flex items-center cursor-pointer"
            onClick={handleLike}
          >
            {liked ? "❤️ Liked" : "🤍 Like"} ({totalLikes})
          </span>
        </div>

        {/* Blog Content */}
        <div
          className="prose max-w-none text-gray-800 pt-6 pb-10 text-lg leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(blog.content),
          }}
        />
      </div>
    </div>
  );
};

export default BlogPage;
