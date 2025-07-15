// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaPlay,
  FaHeart,
  FaRegHeart,
  FaHistory,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaDownload,
} from "react-icons/fa";
import { MdMovie, MdLocalMovies, MdWhatshot } from "react-icons/md";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState({
    id: "1",
    username: "movie_lover",
    firstName: "Alex",
    lastName: "Johnson",
    email: "alex@example.com",
    profilePicture: null,
    preferredLanguage: "en",
    createdAt: "2023-01-15",
    lastActive: new Date(),
    watchedMovies: ["1", "2", "3"],
  });

  const [movies, setMovies] = useState([
    {
      id: "1",
      title: "Inception",
      year: 2010,
      imdbRating: 8.8,
      genres: ["Sci-Fi", "Action", "Thriller"],
      duration: 148,
      coverImage:
        "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg",
      downloadStatus: "completed",
      lastWatched: "2023-08-20T14:30:00Z",
      progress: 65,
    },
    {
      id: "2",
      title: "The Dark Knight",
      year: 2008,
      imdbRating: 9.0,
      genres: ["Action", "Crime", "Drama"],
      duration: 152,
      coverImage:
        "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg",
      downloadStatus: "not_started",
    },
    {
      id: "3",
      title: "Interstellar",
      year: 2014,
      imdbRating: 8.6,
      genres: ["Adventure", "Drama", "Sci-Fi"],
      duration: 169,
      coverImage:
        "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
      downloadStatus: "downloading",
      progress: 42,
    },
    {
      id: "4",
      title: "Pulp Fiction",
      year: 1994,
      imdbRating: 8.9,
      genres: ["Crime", "Drama"],
      duration: 154,
      coverImage:
        "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
      downloadStatus: "not_started",
    },
    {
      id: "5",
      title: "The Matrix",
      year: 1999,
      imdbRating: 8.7,
      genres: ["Action", "Sci-Fi"],
      duration: 136,
      coverImage:
        "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
      downloadStatus: "not_started",
    },
    {
      id: "6",
      title: "Parasite",
      year: 2019,
      imdbRating: 8.6,
      genres: ["Comedy", "Drama", "Thriller"],
      duration: 132,
      coverImage:
        "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_.jpg",
      downloadStatus: "completed",
    },
  ]);

  const [favorites, setFavorites] = useState(["1", "3"]);
  const [continueWatching, setContinueWatching] = useState([]);

  useEffect(() => {
    // Filter movies that are in progress or partially watched
    const watching = movies.filter(
      (movie) =>
        movie.downloadStatus === "downloading" ||
        (movie.progress && movie.progress > 0 && movie.progress < 100)
    );
    setContinueWatching(watching);
  }, [movies]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  const toggleFavorite = (movieId) => {
    if (favorites.includes(movieId)) {
      setFavorites(favorites.filter((id) => id !== movieId));
    } else {
      setFavorites([...favorites, movieId]);
    }
  };

  const startStreaming = (movieId) => {
    // Implement streaming functionality
    console.log("Starting stream for movie:", movieId);
  };

  const startDownload = (movieId) => {
    // Implement download functionality
    console.log("Starting download for movie:", movieId);
    setMovies(
      movies.map((movie) =>
        movie.id === movieId
          ? { ...movie, downloadStatus: "downloading", progress: 0 }
          : movie
      )
    );
  };

  const renderMovieCard = (movie) => (
    <div
      key={movie.id}
      className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative">
        <img
          src={movie.coverImage}
          alt={movie.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2">
          <button
            onClick={() => toggleFavorite(movie.id)}
            className="bg-gray-900 bg-opacity-70 p-2 rounded-full hover:bg-red-600 transition"
          >
            {favorites.includes(movie.id) ? (
              <FaHeart className="text-red-500" />
            ) : (
              <FaRegHeart className="text-white" />
            )}
          </button>
        </div>

        {movie.downloadStatus === "downloading" && (
          <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-80 p-2">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${movie.progress}%` }}
              ></div>
            </div>
            <div className="text-xs text-center mt-1">
              Downloading {movie.progress}%
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg truncate">{movie.title}</h3>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-400">{movie.year}</span>
          <div className="flex items-center bg-yellow-600 px-2 py-1 rounded">
            <span className="text-xs font-bold">{movie.imdbRating}</span>
            <span className="text-xs ml-1">IMDb</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mt-3">
          {movie.genres.slice(0, 2).map((genre, idx) => (
            <span
              key={idx}
              className="text-xs bg-gray-700 px-2 py-1 rounded-full"
            >
              {genre}
            </span>
          ))}
        </div>

        <div className="flex mt-4 space-x-2">
          {movie.downloadStatus === "completed" ? (
            <button
              onClick={() => startStreaming(movie.id)}
              className="flex-1 bg-gradient-to-r from-red-600 to-purple-600 hover:opacity-90 py-2 rounded-lg flex items-center justify-center"
            >
              <FaPlay className="mr-2" /> Play
            </button>
          ) : (
            <button
              onClick={() => startDownload(movie.id)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-teal-500 hover:opacity-90 py-2 rounded-lg flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 p-4 hidden md:block">
        <div className="flex items-center mb-8">
          <div className="bg-gradient-to-r from-red-600 to-purple-600 p-2 rounded-lg">
            <MdMovie className="text-2xl" />
          </div>
          <h1 className="text-xl font-bold ml-2">Hypertube</h1>
        </div>

        <div className="mb-8 flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
          <div className="bg-gray-600 border-2 border-dashed rounded-xl w-16 h-16" />
          <div>
            <h2 className="font-bold">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-sm text-gray-400">@{user.username}</p>
          </div>
        </div>

        <nav className="space-y-2">
          <button
            className={`w-full flex items-center space-x-3 p-3 rounded-lg ${
              activeTab === "home"
                ? "bg-gradient-to-r from-red-600 to-purple-600"
                : "hover:bg-gray-700"
            }`}
            onClick={() => setActiveTab("home")}
          >
            <MdWhatshot className="text-xl" />
            <span>Home</span>
          </button>

          <button
            className={`w-full flex items-center space-x-3 p-3 rounded-lg ${
              activeTab === "browse"
                ? "bg-gradient-to-r from-red-600 to-purple-600"
                : "hover:bg-gray-700"
            }`}
            onClick={() => setActiveTab("browse")}
          >
            <MdLocalMovies className="text-xl" />
            <span>Browse Movies</span>
          </button>

          <button
            className={`w-full flex items-center space-x-3 p-3 rounded-lg ${
              activeTab === "library"
                ? "bg-gradient-to-r from-red-600 to-purple-600"
                : "hover:bg-gray-700"
            }`}
            onClick={() => setActiveTab("library")}
          >
            <FaHistory className="text-xl" />
            <span>My Library</span>
          </button>

          <button
            className={`w-full flex items-center space-x-3 p-3 rounded-lg ${
              activeTab === "favorites"
                ? "bg-gradient-to-r from-red-600 to-purple-600"
                : "hover:bg-gray-700"
            }`}
            onClick={() => setActiveTab("favorites")}
          >
            <FaHeart className="text-xl" />
            <span>Favorites</span>
          </button>

          <div className="border-t border-gray-700 my-4"></div>

          <button
            className={`w-full flex items-center space-x-3 p-3 rounded-lg ${
              activeTab === "profile"
                ? "bg-gradient-to-r from-red-600 to-purple-600"
                : "hover:bg-gray-700"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            <FaUser className="text-xl" />
            <span>Profile</span>
          </button>

          <button
            className={`w-full flex items-center space-x-3 p-3 rounded-lg ${
              activeTab === "settings"
                ? "bg-gradient-to-r from-red-600 to-purple-600"
                : "hover:bg-gray-700"
            }`}
            onClick={() => setActiveTab("settings")}
          >
            <FaCog className="text-xl" />
            <span>Settings</span>
          </button>

          <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700">
            <FaSignOutAlt className="text-xl" />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Top Navigation */}
        <div className="bg-gray-800 p-4 flex items-center justify-between">
          <div className="flex items-center">
            <button className="md:hidden mr-4 text-xl">☰</button>
            <h1 className="text-xl font-bold">
              {activeTab === "home" && "Home"}
              {activeTab === "browse" && "Browse Movies"}
              {activeTab === "library" && "My Library"}
              {activeTab === "favorites" && "Favorites"}
              {activeTab === "profile" && "Profile"}
              {activeTab === "settings" && "Settings"}
            </h1>
          </div>

          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-700 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>
          </form>

          <div className="flex items-center space-x-4 ml-4">
            <div className="relative">
              <button className="bg-gray-700 p-2 rounded-full">
                <FaHeart className="text-red-500" />
              </button>
              <span className="absolute -top-1 -right-1 bg-red-600 text-xs w-5 h-5 flex items-center justify-center rounded-full">
                3
              </span>
            </div>
            <div className="bg-gray-600 border-2 border-dashed rounded-xl w-10 h-10" />
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-purple-900 to-red-900 rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold">
              Welcome back, {user.firstName}!
            </h2>
            <p className="text-gray-300 mt-2">
              Ready to continue your movie journey? Pick up where you left off
              or discover new favorites.
            </p>
            <button className="mt-4 bg-white text-gray-900 px-6 py-2 rounded-full font-medium hover:bg-opacity-90 transition">
              Explore Movies
            </button>
          </div>

          {/* Continue Watching */}
          {continueWatching.length > 0 && (
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Continue Watching</h3>
                <button className="text-gray-400 hover:text-white">
                  View All
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {continueWatching.map((movie) => (
                  <div
                    key={movie.id}
                    className="bg-gray-800 rounded-xl overflow-hidden"
                  >
                    <div className="relative">
                      <img
                        src={movie.coverImage}
                        alt={movie.title}
                        className="w-full h-40 object-cover"
                      />
                      {movie.progress && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-80">
                          <div className="w-full bg-gray-700 h-1.5">
                            <div
                              className="bg-red-600 h-1.5"
                              style={{ width: `${movie.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold truncate">{movie.title}</h4>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-400">
                          {movie.duration} min
                        </span>
                        <button
                          onClick={() => startStreaming(movie.id)}
                          className="bg-gradient-to-r from-red-600 to-purple-600 p-2 rounded-full hover:opacity-90"
                        >
                          <FaPlay />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Popular Movies */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Popular Movies</h3>
              <button className="text-gray-400 hover:text-white">
                View All
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {movies.slice(0, 5).map(renderMovieCard)}
            </div>
          </div>

          {/* Recently Added */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Recently Added</h3>
              <button className="text-gray-400 hover:text-white">
                View All
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {movies.slice(2, 7).map(renderMovieCard)}
            </div>
          </div>

          {/* Your Favorites */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Your Favorites</h3>
              <button className="text-gray-400 hover:text-white">
                View All
              </button>
            </div>
            {favorites.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {movies
                  .filter((movie) => favorites.includes(movie.id))
                  .slice(0, 4)
                  .map(renderMovieCard)}
              </div>
            ) : (
              <div className="bg-gray-800 rounded-xl p-8 text-center">
                <FaHeart className="text-4xl mx-auto text-gray-600" />
                <h4 className="text-xl font-bold mt-4">No favorites yet</h4>
                <p className="text-gray-500 mt-2">
                  Click the heart icon on any movie to add it to your favorites
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
