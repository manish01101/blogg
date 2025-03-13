import { useLocation, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";

const BlogPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const blog = location.state?.blog;

  if (!blog) {
    navigate("/blogs");
    return null;
  }

  return (
    <div className="flex flex-col">
      <div className="max-w-4xl md:min-w-4xl mx-auto p-6 mb-6 bg-white shadow-lg rounded-lg mt-10">
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
        <div className="text-gray-500 pt-2 text-sm">
          <span>
            By <strong>Unknown Author</strong> • Published Today
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
