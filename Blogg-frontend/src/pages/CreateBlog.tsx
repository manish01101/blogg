// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { BACKEND_URL } from "../config";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css"; // Quill styles
// import Appbar from "../components/Appbar";
// import Footer from "../components/Footer";

// const CreateBlog = () => {
//   const navigate = useNavigate();
//   const [title, setTitle] = useState("");
//   const [content, setContent] = useState("");
//   const [coverImage, setCoverImage] = useState<File | null>(null);
//   const [loading, setLoading] = useState(false);
//   const token = localStorage.getItem("token");

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       setCoverImage(e.target.files[0]);
//     }
//   };

//   const handleSubmit = async () => {
//     if (!title || !content) {
//       alert("Title and content are required!");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("title", title);
//     formData.append("content", content);
//     if (coverImage) {
//       formData.append("coverImage", coverImage);
//     }

//     try {
//       setLoading(true);
//       const response = await axios.post(`${BACKEND_URL}/api/v1/blogs`, formData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       if (response.status === 201) {
//         alert("Blog created successfully!");
//         navigate("/blogs"); // Redirect to blogs page
//       }
//     } catch (error) {
//       console.error("Blog creation failed:", error);
//       alert("Failed to create blog. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col">
//       <Appbar />
//       <div className="max-w-3xl mx-auto p-6">
//         <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
//           Create a New Blog
//         </h1>
//         <input
//           type="text"
//           placeholder="Enter blog title"
//           className="w-full p-3 border border-gray-300 rounded-md mb-4"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//         />
//         <ReactQuill
//           value={content}
//           onChange={setContent}
//           className="mb-4"
//           placeholder="Write your blog here..."
//         />
//         <input
//           type="file"
//           accept="image/*"
//           className="mb-4"
//           onChange={handleImageChange}
//         />
//         <button
//           onClick={handleSubmit}
//           className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700"
//           disabled={loading}
//         >
//           {loading ? "Publishing..." : "Publish Blog"}
//         </button>
//       </div>
//       <Footer />
//     </div>
//   );
// };

// export default CreateBlog;

const CreateBlog = () => {
  return <div>CreateBlog</div>;
};

export default CreateBlog;
