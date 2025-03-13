import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { FiMenu, FiX } from "react-icons/fi";
import { useRecoilState } from "recoil";
import { userAtom } from "../store/atoms/user";
import Loading from "./Loading";

const Appbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useRecoilState(userAtom);
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
      setUser(response.data.email);
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
    setUser("");
    axios.defaults.headers.common["Authorization"] = ""; // Secure logout
    navigate("/");
  };

  if (loading) return <Loading />;

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

          {!user ? (
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
                  Blogs
                </Link>
              </li>
              <li>
                <Link
                  to={"/write"}
                  className="text-gray-600 hover:text-green-500"
                >
                  Write
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
        <div className="md:hidden bg-white shadow-lg rounded-lg absolute top-16 right-5 w-2/4 sm:w-1/2 md:w-1/3 flex flex-col items-center space-y-4 py-6 px-4 transition-transform transform scale-100">
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

          {!user ? (
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
                Blogs
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
      )}
    </nav>
  );
};

export default Appbar;
