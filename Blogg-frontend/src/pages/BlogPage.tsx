import { useLocation, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import Appbar from "../components/Appbar";
import Footer from "../components/Footer";

const BlogPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const blog = location.state?.blog;

  if (!blog) {
    navigate("/blogs");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Appbar */}
      <Appbar />

      {/* Main Content - Uses flex-grow to push the footer down if content is short */}
      <div className="flex-grow">
        <div className="max-w-4xl md:min-w-4xl mx-auto px-6 py-12 bg-white shadow-lg rounded-lg mt-10">
          {/* Cover Image */}
          {blog.coverImage && (
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="w-full h-96 object-cover rounded-md"
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

      {/* Footer with padding to separate from content */}
      <div className="pt-6 bg-gray-100">
        <Footer />
      </div>
    </div>
  );
};

export default BlogPage;
