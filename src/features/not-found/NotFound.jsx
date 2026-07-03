import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { Header } from "components/layout/Header";
import { Footer } from "components/layout/Footer";

export const NotFound = () => {
  useEffect(() => {
    document.title = "Page Not Found | Blue Line Breakdown";
    return () => {
      document.title = "Blue Line Breakdown";
    };
  }, []);
  return (
    <div className="min-h-screen ice-background px-4 pb-10 pt-5 text-white light:text-gray-900 sm:px-6 sm:py-8">
      <div className="max-w-6xl mx-auto relative z-10">
        <Header />
        <div className="liquid-glass rounded-[32px] px-5 py-16 text-center">
          <p className="text-6xl font-black tracking-display text-white light:text-gray-900">
            404
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-display text-white light:text-slate-900 sm:text-3xl">
            This play was offside
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-400 light:text-gray-500 sm:text-base">
            The page you're looking for doesn't exist or has moved.
          </p>
          <Link
            to="/"
            className="btn-search-primary btn-search-primary-inline mt-6 inline-flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Back to home
          </Link>
        </div>
        <Footer />
      </div>
    </div>
  );
};
