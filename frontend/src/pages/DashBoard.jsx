// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaPlay,
  FaHeart,
  FaRegHeart,
  FaHistory,
  FaUserCircle,
  FaBell,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { MdLocalMovies, MdDownload, MdTrendingUp } from "react-icons/md";
import { RiMovie2Line } from "react-icons/ri";

// Mock API service that returns promises with data matching your plan structure
import {
  getPopularMovies,
  getWatchedMovies,
  getCurrentUser,
} from "../services/server";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [popularMovies, setPopularMovies] = useState([]);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("popular");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all data simultaneously
        const [popular, watched, user] = await Promise.all([
          getPopularMovies(),
          getWatchedMovies(),
          getCurrentUser(),
        ]);

        setPopularMovies(popular);
        setWatchedMovies(watched);
        setCurrentUser(user);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter movies based on search query
  const filteredMovies = popularMovies.filter((movie) =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render loading skeleton
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900 text-white">
        {/* Sidebar Skeleton */}
        <div className="w-64 bg-gray-800 p-4 hidden md:block">
          <div className="animate-pulse flex flex-col space-y-8">
            <div className="h-12 bg-gray-700 rounded"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Search Bar Skeleton */}
          <div className="animate-pulse mb-8">
            <div className="h-12 bg-gray-800 rounded-lg"></div>
          </div>

          {/* Section Headers */}
          <div className="space-y-12">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="animate-pulse mb-6">
                  <div className="h-8 w-64 bg-gray-800 rounded"></div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="animate-pulse">
                      <div className="aspect-[2/3] bg-gray-800 rounded-lg mb-2"></div>
                      <div className="h-4 bg-gray-800 rounded w-3/4 mb-1"></div>
                      <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 p-4 hidden md:flex flex-col">
        <div className="flex items-center space-x-3 mb-10 mt-2">
          <RiMovie2Line className="text-red-500 text-3xl" />
          <h1 className="text-2xl font-bold">Hypertube</h1>
        </div>

        <div className="mb-8 flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
          {currentUser?.profilePicture ? (
            <img
              src={currentUser.profilePicture}
              alt={currentUser.username}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <FaUserCircle className="text-gray-400 text-3xl" />
          )}
          <div>
            <p className="font-semibold">{currentUser?.username}</p>
            <p className="text-sm text-gray-400">Premium Member</p>
          </div>
        </div>

        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <button
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition ${
                  activeTab === "popular" ? "bg-red-600" : "hover:bg-gray-700"
                }`}
                onClick={() => setActiveTab("popular")}
              >
                <MdTrendingUp className="text-xl" />
                <span>Popular Movies</span>
              </button>
            </li>
            <li>
              <button
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition ${
                  activeTab === "watched" ? "bg-red-600" : "hover:bg-gray-700"
                }`}
                onClick={() => setActiveTab("watched")}
              >
                <FaHistory className="text-xl" />
                <span>Watch History</span>
              </button>
            </li>
            <li>
              <button
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition ${
                  activeTab === "library" ? "bg-red-600" : "hover:bg-gray-700"
                }`}
                onClick={() => setActiveTab("library")}
              >
                <MdLocalMovies className="text-xl" />
                <span>My Library</span>
              </button>
            </li>
            <li>
              <button
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition ${
                  activeTab === "downloads" ? "bg-red-600" : "hover:bg-gray-700"
                }`}
                onClick={() => setActiveTab("downloads")}
              >
                <MdDownload className="text-xl" />
                <span>Downloads</span>
              </button>
            </li>
          </ul>
        </nav>

        <div className="mt-auto pt-4 border-t border-gray-700">
          <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition">
            <FaCog className="text-xl" />
            <span>Settings</span>
          </button>
          <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition">
            <FaSignOutAlt className="text-xl" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center md:hidden">
            <button
              className="mr-4 text-xl"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              ☰
            </button>
            <RiMovie2Line className="text-red-500 text-2xl mr-2" />
            <h1 className="text-xl font-bold">Hypertube</h1>
          </div>

          <div className="relative w-full max-w-md">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FaSearch />
            </div>
            <input
              type="text"
              placeholder="Search movies..."
              className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="hidden md:flex items-center space-x-4 ml-4">
            <button className="relative p-2 rounded-full hover:bg-gray-800">
              <FaBell className="text-xl" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            {currentUser?.profilePicture ? (
              <img
                src={currentUser.profilePicture}
                alt={currentUser.username}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <FaUserCircle className="text-gray-400 text-3xl" />
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-800 p-4 mb-6 rounded-lg">
            <div className="grid grid-cols-2 gap-2">
              <button
                className={`p-3 rounded-lg transition ${
                  activeTab === "popular" ? "bg-red-600" : "bg-gray-700"
                }`}
                onClick={() => setActiveTab("popular")}
              >
                Popular
              </button>
              <button
                className={`p-3 rounded-lg transition ${
                  activeTab === "watched" ? "bg-red-600" : "bg-gray-700"
                }`}
                onClick={() => setActiveTab("watched")}
              >
                History
              </button>
              <button
                className={`p-3 rounded-lg transition ${
                  activeTab === "library" ? "bg-red-600" : "bg-gray-700"
                }`}
                onClick={() => setActiveTab("library")}
              >
                Library
              </button>
              <button
                className={`p-3 rounded-lg transition ${
                  activeTab === "downloads" ? "bg-red-600" : "bg-gray-700"
                }`}
                onClick={() => setActiveTab("downloads")}
              >
                Downloads
              </button>
            </div>
          </div>
        )}

        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">
            Welcome back,{" "}
            <span className="text-red-500">
              {currentUser?.firstName || currentUser?.username}
            </span>
          </h1>
          <p className="text-gray-400">Ready to continue your movie journey?</p>
        </div>

        {/* Continue Watching Section */}
        {watchedMovies.length > 0 && activeTab === "popular" && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center">
                <FaHistory className="mr-2 text-red-500" />
                Continue Watching
              </h2>
              <button className="text-gray-400 hover:text-white transition">
                View All
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {watchedMovies.slice(0, 5).map((movie) => (
                <MovieCard key={movie.id} movie={movie} type="watched" />
              ))}
            </div>
          </section>
        )}

        {/* Popular Movies Section */}
        {activeTab === "popular" && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center">
                <MdTrendingUp className="mr-2 text-red-500" />
                Popular Movies
              </h2>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700 transition">
                  Movies
                </button>
                <button className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700 transition">
                  TV Shows
                </button>
              </div>
            </div>

            {filteredMovies.length === 0 ? (
              <div className="text-center py-12">
                <FaSearch className="mx-auto text-4xl text-gray-600 mb-4" />
                <h3 className="text-xl font-bold">No movies found</h3>
                <p className="text-gray-500">Try adjusting your search query</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {filteredMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Watched Movies Section */}
        {activeTab === "watched" && (
          <section>
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <FaHistory className="mr-2 text-red-500" />
              Your Watch History
            </h2>

            {watchedMovies.length === 0 ? (
              <div className="text-center py-12">
                <MdLocalMovies className="mx-auto text-4xl text-gray-600 mb-4" />
                <h3 className="text-xl font-bold">No watched movies yet</h3>
                <p className="text-gray-500">
                  Start watching movies to see them here
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {watchedMovies.map((movie) => (
                  <WatchedMovieItem key={movie.id} movie={movie} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* My Library Section */}
        {activeTab === "library" && (
          <section>
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <MdLocalMovies className="mr-2 text-red-500" />
              Your Movie Library
            </h2>

            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <MdLocalMovies className="mx-auto text-4xl text-gray-600 mb-4" />
              <h3 className="text-xl font-bold">Your library is empty</h3>
              <p className="text-gray-500 mb-4">
                Add movies to your library to watch later
              </p>
              <button className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition">
                Browse Movies
              </button>
            </div>
          </section>
        )}

        {/* Downloads Section */}
        {activeTab === "downloads" && (
          <section>
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <MdDownload className="mr-2 text-red-500" />
              Your Downloads
            </h2>

            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <MdDownload className="mx-auto text-4xl text-gray-600 mb-4" />
              <h3 className="text-xl font-bold">No downloads yet</h3>
              <p className="text-gray-500 mb-4">
                Download movies to watch offline
              </p>
              <button className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition">
                Find Movies to Download
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

// Movie Card Component
const MovieCard = ({ movie, type = "standard" }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="group relative">
      <div className="aspect-[2/3] bg-gray-800 rounded-lg overflow-hidden relative">
        {movie.coverImage ? (
          <img
            src={movie.coverImage}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
            <RiMovie2Line className="text-4xl text-gray-500" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="flex justify-between items-center">
              <button className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition">
                <FaPlay className="ml-1" />
              </button>

              <button
                className="w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center hover:bg-opacity-100 transition"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                {isFavorite ? (
                  <FaHeart className="text-red-500" />
                ) : (
                  <FaRegHeart className="text-white" />
                )}
              </button>
            </div>
          </div>
        </div>

        {type === "watched" && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
            <div
              className="h-full bg-red-500"
              style={{ width: `${Math.floor(Math.random() * 60) + 40}%` }}
            ></div>
          </div>
        )}

        {movie.imdbRating && (
          <div className="absolute top-2 right-2 bg-yellow-600 text-xs font-bold px-2 py-1 rounded">
            {movie.imdbRating}
          </div>
        )}
      </div>

      <div className="mt-3">
        <h3 className="font-semibold truncate">{movie.title}</h3>
        <div className="flex justify-between text-sm text-gray-400">
          <span>{movie.year}</span>
          <span className="flex items-center">
            <MdDownload className="mr-1" />
            {movie.torrents?.[0]?.size || "1.2 GB"}
          </span>
        </div>
      </div>
    </div>
  );
};

// Watched Movie Item Component
const WatchedMovieItem = ({ movie }) => {
  const progress = Math.floor(Math.random() * 60) + 40;

  return (
    <div className="flex items-center bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition">
      <div className="w-24 h-24 flex-shrink-0">
        {movie.coverImage ? (
          <img
            src={movie.coverImage}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
            <RiMovie2Line className="text-2xl text-gray-500" />
          </div>
        )}
      </div>

      <div className="flex-1 p-4">
        <div className="flex justify-between">
          <h3 className="font-bold">{movie.title}</h3>
          <span className="text-gray-400">
            {movie.duration
              ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m`
              : "2h 15m"}
          </span>
        </div>

        <div className="text-sm text-gray-400 mb-2">
          {movie.genres.slice(0, 3).join(", ")} • {movie.year}
        </div>

        <div className="flex items-center">
          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden mr-3">
            <div
              className="h-full bg-red-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="text-sm">{progress}%</span>
        </div>
      </div>

      <button className="mr-4 w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition">
        <FaPlay className="ml-1" />
      </button>
    </div>
  );
};

export default Dashboard;
