import { ChangeEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios"; // Import AxiosError
import { BACKEND_URL } from "../config";
import { userAtom } from "../store/atoms/user";
import { useAtomState } from "@zedux/react";

interface SignupInput {
  email: string;
  password: string;
}

const Auth = ({ type }: { type: "signup" | "signin" }) => {
  const [userState, setUserState] = useAtomState(userAtom);
  const navigate = useNavigate();
  const [postInputs, setPostInputs] = useState<SignupInput>({
    email: "",
    password: "",
  });

  async function sendRequest() {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/user/${type === "signup" ? "signup" : "signin"}`,
        postInputs
      );
      // console.log("hi res", response);
      const { email, jwt, message } = response.data;

      if (jwt) {
        localStorage.setItem("token", jwt);
        localStorage.setItem("email", email);
        setUserState(email); // Update user state correctly
        alert(message);
        navigate("/");
      } else {
        alert("Unexpected response from server.");
      }
    } catch (error) {
      const axiosError = error as AxiosError; // Type assertion
      const msg =
        axiosError.response?.data?.message || "An unknown error occurred";
      alert(`Error while ${type}! \n${msg}`);
      console.log(axiosError);
    }
  }

  return (
    <div className="px-4 h-screen flex justify-center flex-col">
      <div className="flex justify-center">
        <div>
          <div className="px-10">
            <div className="text-4xl font-bold">
              {type === "signup" ? "Create an account" : "Welcome Back"}
            </div>
            <div className="text-slate-400">
              {type === "signup"
                ? "Already have an account?"
                : "Don't have an account"}
              <Link
                className="pl-2 underline"
                to={type === "signup" ? "/signin" : "/signup"}
              >
                {type === "signup" ? "Sign in" : "Sign up"}
              </Link>
            </div>
          </div>
          <div>
            <LabelledInput
              label="Email"
              placeholder="user@gmail.com"
              onChange={(e) => {
                setPostInputs((c) => ({
                  ...c,
                  email: e.target.value,
                }));
              }}
            />
            <LabelledInput
              label="Password"
              type={"password"}
              placeholder="password"
              onChange={(e) => {
                setPostInputs((c) => ({
                  ...c,
                  password: e.target.value,
                }));
              }}
            />
            <button
              type="button"
              onClick={sendRequest}
              className="mt-6 w-full text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
            >
              {type === "signup" ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

interface LabelledInputType {
  label: string;
  placeholder: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}

function LabelledInput({
  label,
  placeholder,
  onChange,
  type,
}: LabelledInputType) {
  return (
    <div className="pt-3">
      <label className="block mb-1 text-lg font-medium font-semibold text-black">
        {label}
      </label>
      <input
        onChange={onChange}
        type={type || "text"}
        id={label}
        className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        placeholder={placeholder}
        required
      />
    </div>
  );
}
