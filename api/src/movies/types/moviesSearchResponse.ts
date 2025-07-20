export default interface MoviesSearchResponse {
  movies: SearchMovie[];
  totalResults: number;
}

export interface SearchMovie {
  id: number;
  imdb_id: string;
  title: string;
  year: number;
  imdbRating: number;
  genres: string[];
  duration: number;
  coverImage: string;
  isWatched: boolean;
}
