import React from "react";
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

interface PopularMoviesSectionProps {
  activeTab: string;
  filteredMovies: Movie[];
}

const PopularMoviesSection: React.FC<PopularMoviesSectionProps> = ({
  activeTab,
  filteredMovies,
}) => {
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

      {filteredMovies.length === 0 ? (
        <div className="text-center py-12">
          <FaSearch className="mx-auto text-4xl text-gray-600 mb-4" />
          <h3 className="text-xl font-bold">No movies found</h3>
          <p className="text-gray-500">Try adjusting your search query</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.imdbId} movie={movie} />
          ))}
        </div>
      )}
    </section>
  );
};

export default PopularMoviesSection;
