// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import Appbar from "../components/Appbar";
// import Footer from "../components/Footer";
// import { BACKEND_URL } from "../config";

// const Blog = () => {
//   const navigate = useNavigate();
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let isMounted = true; // Prevents memory leaks if component unmounts

//     const validateUser = async () => {
//       const token = localStorage.getItem("token");

//       if (!token) {
//         if (isMounted) {
//           setLoading(false);
//           navigate("/signin");
//         }
//         return;
//       }

//       try {
//         const response = await axios.get(`${BACKEND_URL}/api/v1/user/auth/validate`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         if (isMounted && response.status === 200) {
//           setIsAuthenticated(true);
//         } else {
//           localStorage.removeItem("token");
//           if (isMounted) navigate("/signin");
//         }
//       } catch (error) {
//         console.error("Token validation failed:", error);
//         localStorage.removeItem("token");
//         if (isMounted) navigate("/signin");
//       } finally {
//         if (isMounted) setLoading(false);
//       }
//     };

//     validateUser();

//     return () => {
//       isMounted = false; // Cleanup to prevent state updates after unmounting
//     };
//   }, [navigate]);

//   if (loading) {
//     return <div className="text-center mt-20">Loading...</div>;
//   }

//   if (!isAuthenticated) {
//     return null; // Prevents flickering UI before redirect
//   }

//   // Dummy blog posts
//   const blogs = [
//     {
//       id: 1,
//       title: "Understanding React Hooks",
//       author: "John Doe",
//       date: "Feb 20, 2025",
//     },
//     {
//       id: 2,
//       title: "10 Tailwind CSS Tricks",
//       author: "Jane Smith",
//       date: "Feb 18, 2025",
//     },
//     {
//       id: 3,
//       title: "Why TypeScript is the Future",
//       author: "Alice Johnson",
//       date: "Feb 15, 2025",
//     },
//   ];

//   return (
//     <div className="min-h-screen flex flex-col">
//       <Appbar />

//       <main className="flex-grow">
//         <div className="p-6 text-center">
//           <h1 className="text-4xl font-bold text-center text-blue-600">
//             Blog Posts
//           </h1>
//           <div className="mt-6 space-y-4 max-w-3xl mx-auto">
//             {blogs.map((blog) => (
//               <div
//                 key={blog.id}
//                 className="p-4 bg-gray-100 rounded-lg shadow-md"
//               >
//                 <h2 className="text-2xl font-semibold text-gray-800">
//                   {blog.title}
//                 </h2>
//                 <p className="text-gray-600">
//                   By {blog.author} - {blog.date}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </main>

//       <Footer />
//     </div>
//   );
// };

// export default Blog;

const Blog = () => {
  return <div>Blog</div>;
};

export default Blog;
