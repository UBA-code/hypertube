import React, { useState, useEffect, useCallback } from "react";
import { FaSearch } from "react-icons/fa";
import { MdTrendingUp } from "react-icons/md";
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

interface PopularResponse {
  movies: Movie[];
  totalResults: number;
}

interface PopularMoviesSectionProps {
  activeTab: string;
}

// Loading Skeleton Component
const PopularLoadingSkeleton: React.FC = () => (
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

const PopularMoviesSection: React.FC<PopularMoviesSectionProps> = ({
  activeTab,
}) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Function to fetch popular movies
  const fetchPopularMovies = useCallback(
    async (page: number, append: boolean = false) => {
      try {
        if (page === 1 && !append) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError(null);

        const response = await fetch(
          `http://localhost:3000/movies/popular?page=${page}`,
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
            `Failed to fetch popular movies: ${response.statusText}`
          );
        }

        const data: PopularResponse = await response.json();

        if (append) {
          setMovies((prev) => {
            const newMovies = [...prev, ...data.movies];
            // Set hasMore based on whether we received any movies
            const newHasMore = data.movies.length > 0;
            setHasMore(newHasMore);
            return newMovies;
          });
          // Don't update totalResults on pagination - keep the original count
        } else {
          setMovies(data.movies);
          // For initial load, assume there are more results if we got any movies
          const initialHasMore = data.movies.length > 0;
          setHasMore(initialHasMore);
          // Only update totalResults on initial load
          setTotalResults(data.totalResults);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching popular movies"
        );
        console.error("Popular movies fetch error:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  // Initial load when component mounts and tab is active
  useEffect(() => {
    if (activeTab === "popular" && !initialized) {
      setMovies([]);
      setCurrentPage(1);
      setHasMore(true);
      fetchPopularMovies(1, false);
      setInitialized(true);
    }
  }, [activeTab, initialized, fetchPopularMovies]);

  // Infinite scroll handler with throttling
  useEffect(() => {
    if (activeTab !== "popular") return;

    let scrollTimeout: number;

    const handleScroll = () => {
      // Clear existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      // Throttle scroll events to prevent excessive calls
      scrollTimeout = setTimeout(() => {
        // Get the scrollable container - try both window and main content container
        const mainContent = document.querySelector(".overflow-y-auto");
        const isMainContentScrollable =
          mainContent && mainContent.scrollHeight > mainContent.clientHeight;

        let scrollTop, windowHeight, documentHeight;

        if (isMainContentScrollable) {
          // If main content is scrollable, use its dimensions
          scrollTop = mainContent.scrollTop;
          windowHeight = mainContent.clientHeight;
          documentHeight = mainContent.scrollHeight;
        } else {
          // Fallback to window
          scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          windowHeight = window.innerHeight;
          documentHeight = document.documentElement.scrollHeight;
        }

        const distanceFromBottom = documentHeight - (scrollTop + windowHeight);

        // Load more results when user is still 1500px from bottom (about 3-4 screen heights)
        // This ensures results are ready before user reaches the end
        if (distanceFromBottom <= 1500 && !loading && !loadingMore && hasMore) {
          console.log("Triggering load more...");
          setCurrentPage((prevPage) => {
            const nextPage = prevPage + 1;
            console.log(`Loading page ${nextPage}`);
            fetchPopularMovies(nextPage, true);
            return nextPage;
          });
        }
      }, 200); // 200ms throttle
    };

    console.log("Adding scroll listener for popular movies");

    // Try to attach to the main scrollable container first
    const mainContent = document.querySelector(".overflow-y-auto");
    const scrollElement = mainContent || window;

    // Add scroll listener to the appropriate element
    scrollElement.addEventListener("scroll", handleScroll);

    // Cleanup
    return () => {
      console.log("Removing scroll listener for popular movies");
      scrollElement.removeEventListener("scroll", handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [activeTab, hasMore, loading, loadingMore, fetchPopularMovies]);

  if (activeTab !== "popular") {
    return null;
  }

  return (
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

      {/* Error State */}
      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
          <p className="text-red-300">{error}</p>
          <button
            onClick={() => fetchPopularMovies(1, false)}
            className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <PopularLoadingSkeleton />
      ) : movies.length === 0 && !loading ? (
        <div className="text-center py-12">
          <FaSearch className="mx-auto text-4xl text-gray-600 mb-4" />
          <h3 className="text-xl font-bold">No popular movies found</h3>
          <p className="text-gray-500">
            Unable to load popular movies at this time
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.imdbId} movie={movie} />
            ))}
          </div>

          {/* Load More Indicator */}
          {loadingMore && (
            <div className="mt-8">
              <PopularLoadingSkeleton />
              <div className="text-center mt-4">
                <p className="text-gray-400">Loading page {currentPage}...</p>
              </div>
            </div>
          )}

          {/* End of Results */}
          {!hasMore && movies.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                You've reached the end of popular movies ({totalResults} total)
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default PopularMoviesSection;
