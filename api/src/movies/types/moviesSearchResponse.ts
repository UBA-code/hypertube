import { ApiProperty } from '@nestjs/swagger';
import SubtitleDto from '../dto/subtitles.dto';
import CommentDto from 'src/comments/dto/comments.dto';

export default class MoviesSearchResponse {
  @ApiProperty()
  movies: MovieDto[];
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
  @ApiProperty()
  torrents?: TorrentDto[];
}

export class TorrentDto {
  @ApiProperty()
  id?: number;
  @ApiProperty()
  magnetLink: string;
  @ApiProperty()
  seeders: number;
  @ApiProperty()
  leechers: number;
  @ApiProperty()
  size: string;
  @ApiProperty()
  quality: string;
}

export class MovieDto {
  @ApiProperty()
  imdb_id: string;
  @ApiProperty()
  title: string;
  @ApiProperty()
  year: number;
  @ApiProperty()
  imdbRating: number;
  @ApiProperty()
  genres: string[];
  @ApiProperty()
  duration: number;
  @ApiProperty()
  synopsis: string;
  @ApiProperty()
  coverImage: string;
  @ApiProperty()
  cast: {
    directors: string[];
    producers: string[];
    actors: string[];
  };
  @ApiProperty()
  torrents: TorrentDto[];
  @ApiProperty()
  subtitles: SubtitleDto[];
  @ApiProperty()
  comments: CommentDto[];
  @ApiProperty()
  downloadStatus: 'not_started' | 'downloading' | 'completed';
  @ApiProperty()
  streamUrl: string;
  @ApiProperty()
  isWatched: boolean;
  @ApiProperty()
  lastWatched?: Date | null;
}
