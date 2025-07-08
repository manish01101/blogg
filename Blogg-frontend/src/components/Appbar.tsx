import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { FiMenu, FiX } from "react-icons/fi";
import { useRecoilState, useSetRecoilState } from "recoil";
import { userAtom } from "../store/atoms/user";
import Loading from "./Loading";
import { blogState, homeBlogState } from "../store/atoms/blogs";
import { TfiWrite } from "react-icons/tfi";

const Appbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useRecoilState(userAtom);
  const setBlogState = useSetRecoilState(blogState);
  const setHomeBlogState = useSetRecoilState(homeBlogState);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetching user profile
  const initUser = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false); // Ensure that loading stops if token is missing
      return;
    }

    try {
      const response = await axios.get(`${BACKEND_URL}/api/v1/user/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log(response)
      setUser({ userId: response.data.userId, userEmail: response.data.email });
    } catch (error: unknown) {
      console.error("Failed to fetch user:", error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || error.message);
      } else {
        alert("Something went wrong!");
      }
      handleLogout(); // auto logout if token is invalid
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initUser();
  }, []);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setUser({ userEmail: "", userId: "" }); // reset all things
    setBlogState([]);
    setHomeBlogState([]);
    axios.defaults.headers.common["Authorization"] = ""; // Secure logout
    navigate("/");
  };

  return (
    <nav className="drop-shadow-sm shadow-md py-4">
      <div className="container mx-auto flex justify-between items-center px-6">
        <Link to={"/"}>
          <h1 className="text-2xl font-bold text-gray-800">Blogg</h1>
        </Link>
        <ul className="hidden md:flex items-center space-x-6">
          <li>
            <Link to={"/"} className="text-gray-600 hover:text-green-500">
              Home
            </Link>
          </li>
          <li>
            <Link to={"/about"} className="text-gray-600 hover:text-green-500">
              About
            </Link>
          </li>
          <li>
            <Link
              to={"/contact"}
              className="text-gray-600 hover:text-green-500"
            >
              Contact
            </Link>
          </li>
          {loading ? (
            <li>
              <Loading />
            </li>
          ) : !user.userEmail ? (
            <>
              <li>
                <Link
                  to={"/signin"}
                  className="text-gray-600 hover:text-green-500"
                >
                  Sign in
                </Link>
              </li>
              <li>
                <Link to={"/signup"}>
                  <button className="w-full px-5 py-2 text-white bg-gray-800 hover:bg-gray-900 rounded-3xl text-sm">
                    Get started
                  </button>
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  to={"/blogs"}
                  className="text-gray-600 hover:text-green-500"
                >
                  Your Blogs
                </Link>
              </li>
              <li>
                <Link
                  to={"/write"}
                  className="text-gray-600 hover:text-green-500 flex items-center justify-center gap-1"
                >
                  <TfiWrite />
                  <span>Write</span>
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="w-full px-5 py-2 text-white bg-gray-800 hover:bg-gray-900 rounded-3xl text-sm"
                >
                  Log out
                </button>
              </li>
            </>
          )}
        </ul>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-2xl text-gray-800"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div>
          <div
            className="fixed inset-0 bg-opacity-50 z-30"
            onClick={() => setMenuOpen(false)} // Close menu when clicking outside
          ></div>
          <div className="md:hidden fixed top-16 right-5 w-2/4 sm:w-1/2 md:w-1/3 bg-gray-50 shadow-lg rounded-lg flex flex-col items-center space-y-4 py-6 px-4 z-[9999]">
            <Link
              to="/"
              className="text-gray-700 hover:text-green-500 font-medium text-lg"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-gray-700 hover:text-green-500 font-medium text-lg"
              onClick={() => setMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-gray-700 hover:text-green-500 font-medium text-lg"
              onClick={() => setMenuOpen(false)}
            >
              Contact
            </Link>

            <div className="border-t w-2/3 border-gray-200 my-3" />

            {loading ? (
              <Loading />
            ) : !user.userEmail ? (
              <>
                <Link
                  to="/signin"
                  className="text-gray-700 hover:text-green-500 font-medium text-lg"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)}>
                  <button className="w-full px-6 py-2 text-white bg-gray-800 hover:bg-gray-900 rounded-full text-lg font-semibold">
                    Get started
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/blogs"
                  className="text-gray-700 hover:text-green-500 font-medium text-lg"
                  onClick={() => setMenuOpen(false)}
                >
                  Your Blogs
                </Link>
                <Link
                  to="/write"
                  className="text-gray-700 hover:text-green-500 font-medium text-lg"
                  onClick={() => setMenuOpen(false)}
                >
                  Write
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="w-full px-6 py-2 text-white bg-red-600 hover:bg-red-700 rounded-full text-lg font-semibold"
                >
                  Log out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Appbar;
