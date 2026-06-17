import { Link } from "react-router-dom";
import { LoadingScreen } from "components/ui/LoadingScreen";
export const Loader = () => {
  return (
    <div className="relative min-h-screen ice-background px-4 pb-10 pt-5 text-white light:text-gray-900 sm:px-6 sm:py-8">
      <LoadingScreen />
      <p className="pointer-events-auto absolute bottom-6 left-0 right-0 z-10 px-4 text-center text-sm text-gray-500 light:text-slate-500">
        Preview of the initial database load screen.{" "}
        <Link to="/" className="link-accent font-semibold">
          Back to home
        </Link>
      </p>
    </div>
  );
};
