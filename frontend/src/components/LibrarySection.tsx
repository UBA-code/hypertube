import React, { useState, useEffect, useCallback } from "react";
import { FaHeart } from "react-icons/fa";
import MovieCard from "./MovieCard";

interface Movie {
  imdbId: string;
  title: string;
  year: number;
  coverImage?: string;
  imdbRating?: number;
  genres: string[];
  duration: number;
  isWatched: boolean;
  isFavorite: boolean;
  synopsis: string;
  cast: {
    actors: string[];
    directors: string[];
    producers: string[];
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
  downloadStatus: string;
  streamUrl: string;
  lastWatched: string | null;
}

interface FavoriteMovieResponse {
  id: number;
  title: string;
  year: number;
  imdbRating?: number;
  imdbId: string;
  duration: number;
  synopsis: string;
  coverImage?: string;
  downloadStatus: string;
  streamUrl: string;
  lastWatched: string | null;
}

// Loading Skeleton Component
const LibraryLoadingSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
    {[...Array(10)].map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="aspect-[2/3] bg-gray-800 rounded-lg mb-2"></div>
        <div className="h-4 bg-gray-800 rounded w-3/4 mb-1"></div>
        <div className="h-3 bg-gray-800 rounded w-1/2"></div>
      </div>
    ))}
  </div>
);

interface LibrarySectionProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const LibrarySection: React.FC<LibrarySectionProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Function to fetch favorite movies
  const fetchFavoriteMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        "http://localhost:3000/movies/library/favorites",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch favorite movies: ${response.statusText}`
        );
      }

      const data: FavoriteMovieResponse[] = await response.json();

      // Map the API response to our Movie interface
      const mappedMovies: Movie[] = data.map(
        (movie: FavoriteMovieResponse) => ({
          imdbId: movie.imdbId,
          title: movie.title,
          year: movie.year,
          coverImage: movie.coverImage,
          imdbRating: movie.imdbRating,
          genres: [], // API response doesn't include genres
          duration: movie.duration,
          isWatched: false, // This can be updated based on API response if available
          isFavorite: true, // These are favorite movies
          synopsis: movie.synopsis,
          cast: {
            actors: [],
            directors: [],
            producers: [],
          },
          torrents: [],
          subtitles: [],
          comments: [],
          downloadStatus: movie.downloadStatus,
          streamUrl: movie.streamUrl,
          lastWatched: movie.lastWatched,
        })
      );

      setFavoriteMovies(mappedMovies);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while fetching favorite movies"
      );
      console.error("Favorite movies fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load when component mounts and tab is active
  useEffect(() => {
    if (activeTab === "library" && !initialized) {
      fetchFavoriteMovies();
      setInitialized(true);
    }
  }, [activeTab, initialized, fetchFavoriteMovies]);

  if (activeTab !== "library") {
    return null;
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center">
          <FaHeart className="mr-2 text-red-500" />
          Your Favorite Movies
        </h2>
        <button
          onClick={fetchFavoriteMovies}
          className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700 transition text-sm"
        >
          Refresh
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
          <p className="text-red-300">{error}</p>
          <button
            onClick={fetchFavoriteMovies}
            className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <LibraryLoadingSkeleton />
      ) : favoriteMovies.length === 0 && !loading ? (
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <FaHeart className="mx-auto text-4xl text-gray-600 mb-4" />
          <h3 className="text-xl font-bold">No favorite movies yet</h3>
          <p className="text-gray-500 mb-4">
            Add movies to your favorites to see them here
          </p>
          <button
            onClick={() => setActiveTab("popular")}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg hover:opacity-90 transition"
          >
            Browse Movies
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {favoriteMovies.map((movie) => (
            <MovieCard key={movie.imdbId} movie={movie} />
          ))}
        </div>
      )}
    </section>
  );
};

export default LibrarySection;
