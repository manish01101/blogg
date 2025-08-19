import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Signup } from "./pages/Signup";
import { Signin } from "./pages/Signin";
import Home from "./pages/Home";
import About from "./pages/About";
import Blogs from "./pages/Blogs";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import CreateBlog from "./pages/CreateBlog";
import BlogPage from "./pages/BlogPage";
import Appbar from "./components/Appbar";
import Footer from "./components/Footer";
import { RecoilRoot } from "recoil";
import Trash from "./pages/Trash";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <RecoilRoot>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Toaster position="top-right" reverseOrder={false} />
          <Appbar />
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/blog/:id" element={<BlogPage />} />
              <Route path="/write" element={<CreateBlog />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/signin" element={<Signin />} />
              <Route path="/trash" element={<Trash />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </RecoilRoot>
  );
}

export default App;
