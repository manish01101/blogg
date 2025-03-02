import { useNavigate } from "react-router-dom";

const Appbar = () => {
  const navigate = useNavigate();
  return (
    <nav className="drop-shadow-sm shadow-md py-4">
      <div className="container mx-auto flex justify-between items-center px-6">
        <h1
          className="text-2xl  font-bold text-gray-800"
          onClick={() => navigate("/")}
        >
          Blogg
        </h1>
        <ul className="flex space-x-6">
          <li>
            <a
              href=""
              className="text-gray-600 hover:text-green-500"
              onClick={() => navigate("/")}
            >
              Home
            </a>
          </li>
          <li>
            <a
              href=""
              className="text-gray-600 hover:text-green-500"
              onClick={() => navigate("/about")}
            >
              About
            </a>
          </li>
          <li>
            <a
              href=""
              className="text-gray-600 hover:text-green-500"
              onClick={() => navigate("/contact")}
            >
              Contact
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Appbar;
