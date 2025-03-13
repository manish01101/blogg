import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Quill styles
import { useRecoilValue } from "recoil";
import { userAtom } from "../store/atoms/user";

const CreateBlog = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const user = useRecoilValue(userAtom);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  let authorName = user;
  if (authorName) {
    authorName = user.split("@")[0];
    authorName = authorName[0].toUpperCase() + authorName.slice(1);
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCoverImage(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!title || !content) {
      alert("Title and content are required!");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (coverImage) {
      formData.append("coverImage", coverImage);
    }
    formData.append("authorName", authorName);

    try {
      setLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/blog`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        alert("Blog created successfully!");
        navigate("/blogs"); // Redirect to blogs page
      }
    } catch (error) {
      console.error("Blog creation failed:", error);
      alert("Failed to create blog. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl md:min-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h1 className="text-3xl font-bold text-center text-gray-600 mb-6">
        Create a New Blog
      </h1>

      {/* Title Input */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">
          Blog Title
        </label>
        <input
          type="text"
          placeholder="Enter blog title"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Content Editor */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">
          Blog Content
        </label>
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
          <ReactQuill
            value={content}
            onChange={setContent}
            className="h-60"
            placeholder="Write your blog here..."
          />
        </div>
      </div>

      {/* Cover Image Upload */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">
          Cover Image
        </label>
        <input
          type="file"
          accept="image/*"
          className="w-full p-2 border border-gray-300 rounded-lg cursor-pointer bg-gray-100"
          onChange={handleImageChange}
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 disabled:bg-blue-400"
        disabled={loading}
      >
        {loading ? "Publishing..." : "Publish Blog"}
      </button>
    </div>
  );
};

export default CreateBlog;
