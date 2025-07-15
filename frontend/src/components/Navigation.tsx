import React from "react";
import { FaPlay } from "react-icons/fa";
import { Link } from "react-router-dom";

interface NavigationProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({
  isMenuOpen,
  setIsMenuOpen,
}) => {
  return (
    <>
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <FaPlay className="text-red-600 text-3xl" />
          <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
            Hypertube
          </span>
        </Link>

        <div className="hidden md:flex space-x-8">
          <a href="#features" className="hover:text-red-500 transition">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-red-500 transition">
            How It Works
          </a>
          <a href="#testimonials" className="hover:text-red-500 transition">
            Testimonials
          </a>
          <a href="#faq" className="hover:text-red-500 transition">
            FAQ
          </a>
        </div>

        <div className="hidden md:flex space-x-4">
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg hover:opacity-90 transition"
          >
            Sign Up
          </Link>
        </div>

        <button
          className="md:hidden text-xl"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800 p-4 absolute w-full z-10">
          <div className="flex flex-col space-y-4">
            <a href="#features" className="hover:text-red-500 transition">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-red-500 transition">
              How It Works
            </a>
            <a href="#testimonials" className="hover:text-red-500 transition">
              Testimonials
            </a>
            <a href="#faq" className="hover:text-red-500 transition">
              FAQ
            </a>
            <div className="flex space-x-4 pt-4">
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg bg-gray-700 w-full text-center"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg w-full text-center"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
