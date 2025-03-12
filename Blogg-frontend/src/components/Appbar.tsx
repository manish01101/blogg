import { useEffect } from "react";
import { useAtomState } from "@zedux/react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { userAtom } from "../store/atoms/user";
import { BACKEND_URL } from "../config";

const Appbar = () => {
  const navigate = useNavigate();
  const [userState, setUserState] = useAtomState(userAtom);

  // Fetch user profile
  const initUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get(`${BACKEND_URL}/api/v1/user/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log(response)
      setUserState(response.data.email);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      handleLogout(); // Auto logout if token is invalid
    }
  };

  useEffect(() => {
    initUser();
  }, []);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setUserState("");
    axios.defaults.headers.common["Authorization"] = ""; // Secure logout
    navigate("/");
  };

  return (
    <nav className="drop-shadow-sm shadow-md py-4">
      <div className="container mx-auto flex justify-between items-center px-6">
        <Link to={"/"}>
          <h1 className="text-2xl font-bold text-gray-800">Blogg</h1>
        </Link>
        <ul className="flex items-center space-x-6">
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

          {!userState ? (
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
      </div>
    </nav>
  );
};

export default Appbar;
