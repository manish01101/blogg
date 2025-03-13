import React from "react";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";

interface Blog {
  id: string;
  title: string;
  content: string;
  coverImage?: string;
}

interface BlogCardProps {
  blog: Blog;
}

const BlogPreviewCard: React.FC<BlogCardProps> = ({ blog }) => {
  const MAX_LENGTH = 40;
  const navigate = useNavigate();

  const truncatedContent =
    blog.content.length > MAX_LENGTH
      ? blog.content.substring(0, MAX_LENGTH) + "..."
      : blog.content;

  const handleReadMore = () => {
    navigate(`/blog/${blog.id}`, { state: { blog } }); // Pass full blog data as a state, When navigating from one page to another using useNavigate(), you can pass an object as state. This object will be available on the new page inside location.state. Only available for the current session (disappears on refresh).
  };

  return (
    <div
      key={blog.id}
      className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-[1.02]"
    >
      {blog.coverImage && (
        <img
          src={blog.coverImage}
          alt={blog.title}
          className="w-full h-60 object-cover"
        />
      )}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900">{blog.title}</h2>
        <div
          className="prose max-w-none text-gray-700 mt-2 line-clamp-3"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(truncatedContent),
          }}
        />
        <div className="mt-4">
          <button
            onClick={handleReadMore}
            className="text-blue-600 font-medium hover:underline"
          >
            Read more →
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogPreviewCard;
