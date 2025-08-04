import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaPlay,
  FaDownload,
  FaHeart,
  FaRegHeart,
  FaStar,
} from "react-icons/fa";
import { MdAccessTime, MdDateRange } from "react-icons/md";
import { CommentsSection, DashboardTopBar } from "../components";

interface Movie {
  imdbId: string;
  title: string;
  coverImage: string;
  year: number;
  genres: string[];
  synopsis: string;
  duration: number;
  imdbRating: number;
  isWatched: boolean;
  isFavorite: boolean;
  cast: {
    actors: string[];
    producers: string[];
    directors: string[];
  };
  torrents: Array<{
    quality?: string;
    size?: string;
    seeders?: number;
    leechers?: number;
  }>;
  subtitles: Array<{
    language: string;
    url: string;
  }>;
  comments: Array<{
    id: string;
    content: string;
    user: string;
    timestamp: string;
  }>;
  streamUrl: string;
  lastWatched: string | null;
}

const MovieDetails: React.FC = () => {
  const { imdbId } = useParams<{ imdbId: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);
  const [showQualityPopup, setShowQualityPopup] = useState(false);
  const [availableQualities, setAvailableQualities] = useState<string[]>([]);
  const [loadingQualities, setLoadingQualities] = useState(false);
  const [qualitiesError, setQualitiesError] = useState<string | null>(null);
  const [streamingQuality, setStreamingQuality] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    id: number;
    username: string;
    userName: string;
    firstName?: string;
    profilePicture?: string;
  } | null>(null);

  // Check if user is authenticated and get user data
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch("http://localhost:3000/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
        }
        // If not authenticated, currentUser stays null but we don't redirect
        // Users can still view movie details without being logged in
      } catch (error) {
        console.error("Error checking auth status:", error);
        // If there's an error, currentUser stays null
      }
    };

    checkAuthStatus();
  }, []);

  // Function to get rating color based on IMDB score (0.0 = red, 10.0 = green)
  const getRatingColor = (rating: number): string => {
    const normalized = Math.max(0, Math.min(10, rating)) / 10;
    const red = Math.round(239 - (239 - 34) * normalized);
    const green = Math.round(68 + (197 - 68) * normalized);
    const blue = Math.round(68 + (94 - 68) * normalized);
    return `rgb(${red}, ${green}, ${blue})`;
  };

  // Format duration from minutes to hours and minutes
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Function to toggle favorite status
  const toggleFavorite = async () => {
    if (!movie || isUpdatingFavorite) return; // Prevent multiple clicks

    setIsUpdatingFavorite(true);
    const newFavoriteStatus = !isFavorite;

    try {
      const response = await fetch(
        `http://localhost:3000/movies/favorite/${movie.imdbId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ setTo: newFavoriteStatus }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to update favorite status: ${response.statusText}`
        );
      }

      // Update local state only if API call was successful
      setIsFavorite(newFavoriteStatus);
    } catch (error) {
      console.error("Error updating favorite status:", error);
      // Optionally show a notification to the user about the error
    } finally {
      setIsUpdatingFavorite(false);
    }
  };

  // Function to fetch available streaming qualities
  const fetchAvailableQualities = async () => {
    if (!movie) return;

    try {
      setLoadingQualities(true);
      setQualitiesError(null);
      const response = await fetch(
        `http://localhost:3000/torrent/availableQualities/${movie.imdbId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        // Try to get the error message from the response
        try {
          const errorData = await response.json();
          throw new Error(
            errorData.message ||
              `Failed to fetch qualities: ${response.statusText}`
          );
        } catch {
          throw new Error(`Failed to fetch qualities: ${response.statusText}`);
        }
      }

      const qualities: string[] = await response.json();
      setAvailableQualities(qualities);
      setShowQualityPopup(true);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while fetching available qualities";
      setQualitiesError(errorMessage);
      setShowQualityPopup(true); // Still show popup to display the error
      console.error("Error fetching available qualities:", error);
    } finally {
      setLoadingQualities(false);
    }
  };

  // Function to start streaming with selected quality
  const startStreaming = async (quality: string) => {
    if (!movie) return;

    try {
      setIsStreaming(true);
      setStreamingQuality(quality);

      const response = await fetch(
        `http://localhost:3000/torrent/stream/${movie.imdbId}?quality=${quality}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to start streaming: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.streamUrl) {
        // Redirect to video player with the stream URL
        const streamUrl = encodeURIComponent(result.streamUrl);
        navigate(
          `/player?stream=${streamUrl}&title=${encodeURIComponent(movie.title)}`
        );
      } else {
        throw new Error(result.message || "Failed to start streaming");
      }
    } catch (error) {
      console.error("Error starting stream:", error);
      // You could show an error message to the user here
    } finally {
      setIsStreaming(false);
      setStreamingQuality(null);
      setShowQualityPopup(false);
      setQualitiesError(null);
    }
  };

  // Function to handle Watch Now button click
  const handleWatchNow = () => {
    fetchAvailableQualities();
  };

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!imdbId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`http://localhost:3000/movies/${imdbId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Movie not found");
          }
          throw new Error(
            `Failed to fetch movie details: ${response.statusText}`
          );
        }

        const movieData: Movie = await response.json();
        setMovie(movieData);
        setIsFavorite(movieData.isFavorite);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching movie details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [imdbId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-32 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="aspect-[2/3] bg-gray-800 rounded-lg"></div>
              </div>
              <div className="lg:col-span-2 space-y-4">
                <div className="h-12 bg-gray-800 rounded w-3/4"></div>
                <div className="h-6 bg-gray-800 rounded w-1/2"></div>
                <div className="h-24 bg-gray-800 rounded"></div>
                <div className="h-6 bg-gray-800 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-8 flex items-center text-gray-300 hover:text-white transition"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Error Loading Movie</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-8 flex items-center text-gray-300 hover:text-white transition"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold">Movie Not Found</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Top Bar */}
      <div className="bg-gray-900 px-4 md:px-6 py-4">
        <DashboardTopBar
          currentUser={currentUser}
          showMobileMenu={false}
          showNotification={false}
        />
      </div>

      {/* Hero Section with Background */}
      <div
        className="relative h-96 bg-cover bg-center"
        style={{
          backgroundImage: movie.coverImage
            ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${movie.coverImage})`
            : "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
        <div className="relative max-w-6xl mx-auto p-4 md:p-6 h-full flex items-end">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-6 left-6 flex items-center text-white hover:text-gray-300 transition bg-black bg-opacity-50 px-4 py-2 rounded-lg"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
        </div>
      </div>

      {/* Movie Details */}
      <div className="max-w-6xl mx-auto p-4 md:p-6 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Poster */}
          <div className="lg:col-span-1">
            <div className="aspect-[2/3] bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
              {movie.coverImage ? (
                <img
                  src={movie.coverImage}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
            </div>
          </div>

          {/* Movie Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
              <div className="flex items-center space-x-4 text-gray-300">
                <div className="flex items-center">
                  <MdDateRange className="mr-1" />
                  <span>{movie.year}</span>
                </div>
                <div className="flex items-center">
                  <MdAccessTime className="mr-1" />
                  <span>{formatDuration(movie.duration)}</span>
                </div>
                <div
                  className="flex items-center px-3 py-1 rounded-full text-white font-bold"
                  style={{ backgroundColor: getRatingColor(movie.imdbRating) }}
                >
                  <FaStar className="mr-1 text-sm" />
                  <span>{movie.imdbRating.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {movie.genres.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 bg-gray-800 rounded-full text-sm"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleWatchNow}
                disabled={loadingQualities}
                className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaPlay className="mr-2" />
                {loadingQualities ? "Loading..." : "Watch Now"}
              </button>
              <button className="flex items-center px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition">
                <FaDownload className="mr-2" />
                Download
              </button>
              <button
                onClick={toggleFavorite}
                disabled={isUpdatingFavorite}
                className={`flex items-center px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition ${
                  isUpdatingFavorite ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isFavorite ? (
                  <FaHeart className="mr-2 text-red-500" />
                ) : (
                  <FaRegHeart className="mr-2" />
                )}
                {isUpdatingFavorite
                  ? "Updating..."
                  : isFavorite
                  ? "Favorited"
                  : "Add to Favorites"}
              </button>
            </div>

            {/* Synopsis */}
            <div>
              <h2 className="text-2xl font-bold mb-3">Synopsis</h2>
              <p className="text-gray-300 leading-relaxed">
                {movie.synopsis || "No synopsis available."}
              </p>
            </div>

            {/* Cast */}
            {(movie.cast.directors.length > 0 ||
              movie.cast.actors.length > 0 ||
              movie.cast.producers.length > 0) && (
              <div>
                <h2 className="text-2xl font-bold mb-3">Cast & Crew</h2>
                <div className="space-y-3">
                  {movie.cast.directors.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-300 mb-1">
                        Directors
                      </h3>
                      <p className="text-gray-400">
                        {movie.cast.directors.join(", ")}
                      </p>
                    </div>
                  )}
                  {movie.cast.actors.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-300 mb-1">
                        Actors
                      </h3>
                      <p className="text-gray-400">
                        {movie.cast.actors.join(", ")}
                      </p>
                    </div>
                  )}
                  {movie.cast.producers.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-300 mb-1">
                        Producers
                      </h3>
                      <p className="text-gray-400">
                        {movie.cast.producers.join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-800">
              <div>
                <h3 className="font-semibold text-gray-300 mb-1">Watched</h3>
                <p className="text-gray-400">
                  {movie.isWatched ? "Yes" : "No"}
                </p>
              </div>
            </div>

            {/* Comments Section */}
            {movie.imdbId && (
              <CommentsSection
                movieImdbId={movie.imdbId}
                currentUser={currentUser}
              />
            )}
          </div>
        </div>
      </div>

      {/* Quality Selection Popup */}
      {showQualityPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Select Quality</h3>
              <button
                onClick={() => {
                  setShowQualityPopup(false);
                  setQualitiesError(null);
                }}
                className="text-gray-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {qualitiesError ? (
                <div className="bg-red-900 border border-red-700 rounded-lg p-4">
                  <p className="text-red-300 text-sm">{qualitiesError}</p>
                </div>
              ) : availableQualities.length > 0 ? (
                availableQualities.map((quality) => (
                  <button
                    key={quality}
                    onClick={() => startStreaming(quality)}
                    disabled={isStreaming && streamingQuality === quality}
                    className="w-full flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center">
                      <FaPlay className="mr-3 text-red-500" />
                      <span className="text-white font-medium">{quality}</span>
                    </div>
                    {isStreaming && streamingQuality === quality && (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                    )}
                  </button>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400">
                    No qualities available for this movie
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;
