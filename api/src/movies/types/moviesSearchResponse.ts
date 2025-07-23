import { ApiProperty } from '@nestjs/swagger';

export default class MoviesSearchResponse {
  @ApiProperty()
  movies: SearchMovie[];
  @ApiProperty()
  totalResults: number;
}
export class SearchMovie {
  @ApiProperty()
  imdb_id: string;
  @ApiProperty()
  source: 'yts' | 'tmdb';

  @ApiProperty()
  title: string;
  @ApiProperty()
  year: string;
  @ApiProperty()
  imdbRating: number;
  @ApiProperty()
  genres: string[];
  @ApiProperty()
  duration: string;
  @ApiProperty()
  coverImage: string;
  @ApiProperty()
  isWatched: boolean;
}

export class SearchMovieDetails {
  @ApiProperty()
  imdb_id: string;
  @ApiProperty()
  title: string;
  @ApiProperty()
  coverImage: string;
  @ApiProperty()
  releaseDate: string;
  @ApiProperty()
  genres: string[];
  @ApiProperty()
  summary: string;
  @ApiProperty()
  runtime: string;
  @ApiProperty()
  rating: number;
  @ApiProperty()
  isWatched: boolean;
  @ApiProperty()
  casts: {
    name: string;
    profileImage: string;
  }[];
  @ApiProperty()
  producers: {
    name: string;
    profileImage: string;
  }[];
  @ApiProperty()
  directors: {
    name: string;
    profileImage: string;
  }[];
  @ApiProperty()
  writers: {
    name: string;
    profileImage: string;
  }[];
}
