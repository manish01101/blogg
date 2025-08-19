import { ChangeEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useSetRecoilState } from "recoil";
import { userAtom } from "../store/atoms/user";
import Loading from "./Loading";
import { SignupInput } from "../types";
import toast from "react-hot-toast";

const Auth = ({ type }: { type: "signup" | "signin" }) => {
  const setUser = useSetRecoilState(userAtom);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [postInputs, setPostInputs] = useState<SignupInput>({
    email: "",
    password: "",
  });

  async function sendRequest() {
    setLoading(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/user/${type === "signup" ? "signup" : "signin"}`,
        postInputs
      );
      // console.log("hi res", response);
      const { email, userId, jwt, message } = response.data;

      if (jwt) {
        localStorage.setItem("token", jwt);
        localStorage.setItem("email", email);
        setUser({
          userEmail: email,
          userId: userId,
        });
        toast.success(message);
        navigate("/");
      } else {
        toast.error("Unexpected response from server.");
      }
    } catch (error: unknown) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || error.message);
      } else {
        toast.error("Something went wrong!");
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="px-4 h-full flex justify-center flex-col">
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
