import Auth from "../components/Auth";
import Quote from "../components/Quote";

export const Signin = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 h-[85vh]">
      <div className="h-full">
        <Auth type="signin" />
      </div>
      <div className="hidden lg:block">
        <Quote />
      </div>
    </div>
  );
};
