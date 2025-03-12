import React from "react";
import { Link } from "react-router-dom";

interface Blog {
  id: string;
  title: string;
  content: string;
  coverImage?: string;
}

interface BlogCardProps {
  blog: Blog;
}

const BlogCard: React.FC<BlogCardProps> = ({ blog }) => {
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
        <p className="text-gray-700 mt-2 line-clamp-3">{blog.content}</p>
        <div className="mt-4">
          <Link
            to={`/blog/${blog.id}`}
            className="text-blue-600 font-medium hover:underline"
          >
            Read more →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
