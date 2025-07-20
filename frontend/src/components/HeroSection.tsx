import React from "react";
import { FaPlay, FaHeart, FaArrowRight } from "react-icons/fa";
import { MdDownload } from "react-icons/md";
import SearchBar from "./SearchBar";

const HeroSection: React.FC = () => {
  return (
    <section className="container mx-auto px-4 py-16 md:py-28 flex flex-col md:flex-row items-center">
      <div className="md:w-1/2 mb-12 md:mb-0">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Stream{" "}
          <span className="bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
            Thousands
          </span>{" "}
          of Movies Instantly
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Hypertube brings the power of BitTorrent streaming to your browser.
          Watch your favorite movies in HD with no ads, no subscriptions, and no
          waiting.
        </p>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar
            placeholder="Search for movies, TV shows..."
            className="relative w-full max-w-lg"
          />
        </div>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <button className="px-8 py-4 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg text-lg font-semibold hover:opacity-90 transition">
            Start Watching Free
          </button>
          <button className="px-8 py-4 bg-gray-800 rounded-lg text-lg font-semibold hover:bg-gray-700 transition flex items-center">
            <span>How It Works</span>
            <FaArrowRight className="ml-2" />
          </button>
        </div>
      </div>
      <div className="md:w-1/2 flex justify-center">
        <div className="relative">
          <div className="absolute -top-8 -left-8 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-red-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="relative bg-gray-800 border border-gray-700 rounded-2xl p-4 w-80 h-96 flex flex-col justify-center items-center">
            <div className="bg-gray-900 rounded-lg w-full h-48 mb-6 overflow-hidden">
              <div className="bg-gradient-to-br from-purple-900 to-red-900 w-full h-full flex items-center justify-center">
                <FaPlay className="text-white text-4xl" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Inception (2010)</h3>
              <div className="flex justify-center space-x-2 mb-3">
                <span className="bg-red-600 px-2 py-1 rounded text-sm">HD</span>
                <span className="bg-gray-700 px-2 py-1 rounded text-sm">
                  2h 28m
                </span>
                <span className="bg-gray-700 px-2 py-1 rounded text-sm">
                  Action
                </span>
              </div>
              <div className="flex justify-center space-x-4">
                <button className="bg-gray-700 hover:bg-gray-600 p-2 rounded-full">
                  <FaHeart />
                </button>
                <button className="bg-gradient-to-r from-red-600 to-purple-600 p-2 rounded-full">
                  <FaPlay />
                </button>
                <button className="bg-gray-700 hover:bg-gray-600 p-2 rounded-full">
                  <MdDownload />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
