import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import { BlogCardProps } from "../types";
import axios from "axios";
import { BACKEND_URL } from "../config";

const BlogPreviewCard: React.FC<BlogCardProps> = ({
  blog,
  currentUserId,
  onDelete,
}) => {
  const MAX_LENGTH = 80;
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  const truncatedContent =
    blog.content.length > MAX_LENGTH
      ? blog.content.substring(0, MAX_LENGTH) + "..."
      : blog.content;

  const handleReadMore = () => {
    navigate(`/blog/${blog.id}`, { state: { blog } }); // Pass full blog data as a state, When navigating from one page to another using useNavigate(), you can pass an object as state. This object will be available on the new page inside location.state. Only available for the current session (disappears on refresh).
  };

  const handleDelete = async (e: React.MouseEvent) => {
    setDeleting(true);
    e.stopPropagation(); // Prevent triggering handleReadMore
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BACKEND_URL}/api/v1/blog/${blog.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleting(false);
      if (onDelete) {
        onDelete(blog.id);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete blog. Please try again.");
    }
  };

  // Extract first letter from authorName
  const getAuthorInitial = (name?: string) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  return (
    <div
      key={blog.id}
      className="flex items-start justify-between rounded-lg shadow-md p-6 cursor-pointer transition duration-300 hover:scale-[1.02] hover:bg-gray-50"
      onClick={handleReadMore}
    >
      {/* Left Section: Blog Content */}
      <div className="flex flex-col w-full">
        {/* Profile Section */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-300 text-gray-700 font-bold text-lg">
            {getAuthorInitial(blog.authorName)}
          </div>
          <div className="text-gray-700 font-semibold text-sm">
            {blog.authorName}
          </div>
        </div>

        {/* Blog Content */}
        <h2 className="text-2xl font-bold text-gray-900">{blog.title}</h2>

        <p
          className="text-gray-600 text-sm mt-1"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(truncatedContent),
          }}
        />

        {/* Meta Info */}
        <div className="mt-3 flex items-center text-gray-500 text-xs">
          <span className="flex items-center">
            ⭐{" "}
            <span className="ml-1">
              {new Date(blog.createdAt)
                .toDateString()
                .split(" ")
                .slice(1, 3)
                .join(" ")}
              {/* {new Date(blog.createdAt).toLocaleDateString()} */}
            </span>
          </span>
          <span className="mx-2">•</span>
          <span className="flex items-center">👍 {blog.likes}</span>
          <span className="flex items-center">
            {/* Show Delete button if user is the creator */}
            {currentUserId === blog.authorId && (
              <button
                className="ml-4 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 w-max transition-colors duration-200"
                onClick={handleDelete}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            )}
          </span>
        </div>
      </div>

      {/* Right Section: Cover Image */}
      {blog.coverImage && (
        <img
          src={blog.coverImage}
          alt={blog.title}
          className="w-24 h-24 object-cover rounded-lg ml-4"
        />
      )}
    </div>
  );
};

export default BlogPreviewCard;
