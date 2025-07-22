export default interface MoviesSearchResponse {
  movies: SearchMovie[];
  totalResults: number;
}

export interface SearchMovie {
  imdb_id: string;
  source: 'yts' | 'tmdb';
  title: string;
  year: string;
  imdbRating: number;
  genres: string[];
  duration: string;
  coverImage: string;
  isWatched: boolean;
}
