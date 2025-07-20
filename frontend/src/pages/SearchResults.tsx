import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaSearch,
  FaPlay,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";
import { MdDownload } from "react-icons/md";
import { RiMovie2Line } from "react-icons/ri";

interface Movie {
  imdbId: string;
  title: string;
  coverImage: string;
  year: number;
  imdbRating: number;
  genres: string[];
  duration: number;
  synopsis: string;
  isWatched: boolean;
  cast: {
    actors: string[];
    directors: string[];
    producers: string[];
  };
  torrents: unknown[];
  subtitles: unknown[];
  comments: unknown[];
  downloadStatus: string;
  streamUrl: string;
  lastWatched: string | null;
}

interface SearchResponse {
  movies: Movie[];
  totalResults: number;
}

// Movie Card Component for Search Results
const SearchMovieCard: React.FC<{ movie: Movie }> = ({ movie }) => {
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
              <button className="w-10 h-10 bg-gradient-to-r from-red-600 to-purple-600 rounded-full flex items-center justify-center hover:opacity-90 transition">
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

        {movie.imdbRating && (
          <div className="absolute top-2 right-2 bg-yellow-600 text-xs font-bold px-2 py-1 rounded">
            {movie.imdbRating.toFixed(1)}
          </div>
        )}

        {movie.isWatched && (
          <div className="absolute top-2 left-2 bg-green-600 text-xs font-bold px-2 py-1 rounded">
            Watched
          </div>
        )}
      </div>

      <div className="mt-3">
        <h3 className="font-semibold truncate" title={movie.title}>
          {movie.title}
        </h3>
        <div className="flex justify-between text-sm text-gray-400">
          <span>{movie.year}</span>
          <span className="flex items-center">
            <MdDownload className="mr-1" />
            {movie.torrents?.length > 0 ? "Available" : "N/A"}
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-1 truncate">
          {movie.genres.join(", ")}
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton Component
const SearchLoadingSkeleton: React.FC = () => (
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

const SearchResults: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated
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

        if (!response.ok) {
          navigate("/login");
          return;
        }
      } catch {
        navigate("/login");
        return;
      }
    };

    checkAuthStatus();
  }, [navigate]);

  // Function to search movies
  const searchMovies = useCallback(
    async (searchQuery: string, page: number, append: boolean = false) => {
      try {
        if (page === 1 && !append) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError(null);

        const response = await fetch(
          `http://localhost:3000/movies/search?query=${encodeURIComponent(
            searchQuery
          )}&page=${page}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(`Search failed: ${response.statusText}`);
        }

        const data: SearchResponse = await response.json();

        if (append) {
          setMovies((prev) => {
            const newMovies = [...prev, ...data.movies];
            // Set hasMore based on whether we received any movies
            // If we got 0 movies, there are no more results
            const newHasMore = data.movies.length > 0;
            setHasMore(newHasMore);
            return newMovies;
          });
        } else {
          setMovies(data.movies);
          // For initial search, assume there are more results if we got any movies
          // We'll only know for sure when we get an empty response on page 2+
          const initialHasMore = data.movies.length > 0;
          setHasMore(initialHasMore);
        }

        setTotalResults(data.totalResults);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while searching"
        );
        console.error("Search error:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [] // No dependencies needed since we use functional updates
  );

  // Initial search when component mounts or query changes
  useEffect(() => {
    if (query.trim()) {
      setMovies([]);
      setCurrentPage(1);
      setHasMore(true);
      searchMovies(query, 1, false);
    }
  }, [query, searchMovies]);

  // Infinite scroll handler with throttling
  useEffect(() => {
    let scrollTimeout: number;

    const handleScroll = () => {
      // Clear existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      // Throttle scroll events to prevent excessive calls
      scrollTimeout = setTimeout(() => {
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const distanceFromBottom = documentHeight - (scrollTop + windowHeight);

        // Only trigger if we're near the bottom (within 500px), not loading, and have more results
        if (
          distanceFromBottom <= 500 &&
          !loading &&
          !loadingMore &&
          hasMore &&
          query.trim()
        ) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          searchMovies(query, nextPage, true);
        }
      }, 200); // 200ms throttle
    };

    // Add scroll listener
    window.addEventListener("scroll", handleScroll);

    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [currentPage, hasMore, loading, loadingMore, query, searchMovies]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-full hover:bg-gray-800 transition"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <div className="flex items-center">
            <FaPlay className="text-red-600 text-2xl mr-2" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
              Hypertube
            </h1>
          </div>
        </div>

        {/* Search Info */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Search Results for "{query}"
          </h2>
          {totalResults > 0 && (
            <p className="text-gray-400">
              Found {totalResults} result{totalResults !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-300">{error}</p>
            <button
              onClick={() => searchMovies(query, 1, false)}
              className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <SearchLoadingSkeleton />
        ) : totalResults === 0 && !loading ? (
          <div className="text-center py-12">
            <FaSearch className="mx-auto text-4xl text-gray-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">No movies found</h3>
            <p className="text-gray-500">
              Try searching with different keywords or check your spelling
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {movies.map((movie) => (
                <SearchMovieCard key={movie.imdbId} movie={movie} />
              ))}
            </div>

            {/* Load More Indicator */}
            {loadingMore && (
              <div className="mt-8">
                <SearchLoadingSkeleton />
                <div className="text-center mt-4">
                  <p className="text-gray-400">Loading page {currentPage}...</p>
                </div>
              </div>
            )}

            {/* End of Results */}
            {!hasMore && movies.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  You've reached the end of the search results ({totalResults}{" "}
                  total)
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
