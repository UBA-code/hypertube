import React from "react";
import { FaHistory } from "react-icons/fa";
import { MdLocalMovies } from "react-icons/md";
import WatchedMovieItem from "./WatchedMovieItem";

interface Movie {
  id: string;
  title: string;
  year: number;
  coverImage?: string;
  genres: string[];
  duration?: number;
  isFavorite: boolean;
}

interface WatchedMoviesSectionProps {
  activeTab: string;
  watchedMovies: Movie[];
}

const WatchedMoviesSection: React.FC<WatchedMoviesSectionProps> = ({
  activeTab,
  watchedMovies,
}) => {
  if (activeTab !== "watched") {
    return null;
  }

  return (
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
  );
};

export default WatchedMoviesSection;
