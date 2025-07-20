export interface YtsTorrentInterface {
  url: string;
  hash: string;
  quality: string;
  type: string;
  is_repack: string;
  video_codec: string;
  bit_depth: string;
  audio_channels: string;
  seeds: number;
  peers: number;
  size: string;
  size_bytes: number;
  date_uploaded: string;
  date_uploaded_unix: number;
}

export interface YtsMovieInterface {
  id: number;
  url: string;
  imdb_code: string;
  title: string;
  title_english: string;
  title_long: string;
  slug: string;
  year: number;
  rating: number;
  runtime: number;
  genres: string[];
  summary: string;
  description_full: string;
  synopsis: string;
  yt_trailer_code: string;
  language: string;
  mpa_rating: string;
  background_image: string;
  background_image_original: string;
  small_cover_image: string;
  medium_cover_image: string;
  large_cover_image: string;
  state: string;
  torrents: YtsTorrentInterface[];
}

export interface YtsListMoviesResponse {
  status: string;
  status_message: string;
  data: {
    movie_count: number;
    limit: number;
    page_number: number;
    movies: YtsMovieInterface[];
  };
}

export interface YtsCastMember {
  name: string;
  character_name: string;
  imdb_code: string;
}

export interface YtsDetailedMovie {
  id: number;
  url: string;
  imdb_code: string;
  title: string;
  title_english: string;
  title_long: string;
  slug: string;
  year: number;
  rating: number;
  runtime: number;
  genres: string[];
  like_count: number;
  description_intro: string;
  description_full: string;
  yt_trailer_code: string;
  language: string;
  mpa_rating: string;
  background_image: string;
  background_image_original: string;
  small_cover_image: string;
  medium_cover_image: string;
  large_cover_image: string;
  medium_screenshot_image1: string;
  medium_screenshot_image2: string;
  medium_screenshot_image3: string;
  large_screenshot_image1: string;
  large_screenshot_image2: string;
  large_screenshot_image3: string;
  cast: YtsCastMember[];
  torrents: YtsTorrentInterface[];
  date_uploaded: string;
  date_uploaded_unix: number;
}
