import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlay, FaHeart, FaArrowRight, FaStar } from "react-icons/fa";
import { MdDownload } from "react-icons/md";
import SearchBar from "./SearchBar";

interface Movie {
  imdbId: string;
  title: string;
  year: number;
  coverImage?: string;
  imdbRating?: number;
  genres: string[];
  duration: number;
  synopsis: string;
}

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the first popular movie for the hero section
  useEffect(() => {
    const fetchFeaturedMovie = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/movies/popular?page=1",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.movies && data.movies.length > 0) {
            setFeaturedMovie(data.movies[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching featured movie:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedMovie();
  }, []);

  const handleStartWatching = () => {
    navigate("/dashboard");
  };

  const handleHowItWorks = () => {
    const element = document.getElementById("how-it-works");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };
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
          <button
            onClick={handleStartWatching}
            className="bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105"
          >
            Start Watching Free
          </button>
          <button
            onClick={handleHowItWorks}
            className="px-8 py-4 bg-gray-800 rounded-lg text-lg font-semibold hover:bg-gray-700 transition flex items-center"
          >
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
              {loading ? (
                <div className="bg-gray-700 animate-pulse w-full h-full flex items-center justify-center">
                  <FaPlay className="text-white text-4xl opacity-50" />
                </div>
              ) : featuredMovie?.coverImage ? (
                <img
                  src={featuredMovie.coverImage}
                  alt={featuredMovie.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="bg-gradient-to-br from-purple-900 to-red-900 w-full h-full flex items-center justify-center">
                  <FaPlay className="text-white text-4xl" />
                </div>
              )}
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">
                {loading ? (
                  <div className="bg-gray-700 animate-pulse h-6 w-48 rounded mx-auto"></div>
                ) : (
                  `${featuredMovie?.title || "Featured Movie"} (${
                    featuredMovie?.year || "2024"
                  })`
                )}
              </h3>
              <div className="flex justify-center space-x-2 mb-3">
                <span className="bg-red-600 px-2 py-1 rounded text-sm">HD</span>
                {!loading && featuredMovie?.duration && (
                  <span className="bg-gray-700 px-2 py-1 rounded text-sm">
                    {formatDuration(featuredMovie.duration)}
                  </span>
                )}
                {!loading &&
                  featuredMovie?.genres &&
                  featuredMovie.genres.length > 0 && (
                    <span className="bg-gray-700 px-2 py-1 rounded text-sm">
                      {featuredMovie.genres[0]}
                    </span>
                  )}
                {!loading && featuredMovie?.imdbRating && (
                  <span className="bg-yellow-600 px-2 py-1 rounded text-sm flex items-center">
                    <FaStar className="mr-1 text-xs" />
                    {featuredMovie.imdbRating.toFixed(1)}
                  </span>
                )}
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
