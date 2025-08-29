import React from "react";
import { FaHistory } from "react-icons/fa";
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
  streamUrl: string;
  lastWatched: string | null;
}

interface ContinueWatchingSectionProps {
  watchedMovies: Movie[];
  activeTab: string;
}

const ContinueWatchingSection: React.FC<ContinueWatchingSectionProps> = ({
  watchedMovies,
  activeTab,
}) => {
  if (watchedMovies.length === 0 || activeTab !== "popular") {
    return null;
  }

  return (
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
          <MovieCard key={movie.imdbId} movie={movie} />
        ))}
      </div>
    </section>
  );
};

export default ContinueWatchingSection;
