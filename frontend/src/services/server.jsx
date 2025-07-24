// src/services/server.jsx
// This file mocks API responses with the exact structure from your plan PDF

// Mock data that matches your defined interfaces
const mockUser = {
  id: "1",
  username: "johndoe",
  email: "john@example.com",
  firstName: "John",
  lastName: "Doe",
  profilePicture: "https://randomuser.me/api/portraits/men/1.jpg",
  preferredLanguage: "en",
  createdAt: new Date("2023-01-15"),
  lastActive: new Date(),
  watchedMovies: ["1", "2", "3", "4", "5"],
};

const mockMovies = [
  {
    id: "1",
    title: "Inception",
    year: 2010,
    imdbRating: 8.8,
    genres: ["Action", "Adventure", "Sci-Fi"],
    duration: 148,
    synopsis:
      "A thief who steals corporate secrets through dream-sharing technology is given the task of planting an idea into the mind of a C.E.O.",
    coverImage:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_FMjpg_UX1000_.jpg",
    cast: {
      director: "Christopher Nolan",
      actors: [
        "Leonardo DiCaprio",
        "Joseph Gordon-Levitt",
        "Ellen Page",
        "Tom Hardy",
      ],
    },
    torrents: [
      {
        quality: "1080p",
        size: "1.8 GB",
        seeders: 124,
        leechers: 42,
        magnetLink:
          "magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10",
      },
    ],
    subtitles: [
      { language: "English", url: "/subtitles/en.vtt" },
      { language: "French", url: "/subtitles/fr.vtt" },
    ],
    comments: [],
    downloadStatus: "completed",
    streamUrl: "/stream/1",
    lastWatched: new Date(),
  },
  {
    id: "2",
    title: "The Dark Knight",
    year: 2008,
    imdbRating: 9.0,
    genres: ["Action", "Crime", "Drama"],
    duration: 152,
    synopsis:
      "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    coverImage:
      "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_FMjpg_UX1000_.jpg",
    cast: {
      director: "Christopher Nolan",
      actors: [
        "Christian Bale",
        "Heath Ledger",
        "Aaron Eckhart",
        "Michael Caine",
      ],
    },
    torrents: [
      {
        quality: "720p",
        size: "1.2 GB",
        seeders: 98,
        leechers: 31,
        magnetLink:
          "magnet:?xt=urn:btih:06ada5a7a6183aae1e09d831df6748d566095a11",
      },
    ],
    subtitles: [
      { language: "English", url: "/subtitles/en.vtt" },
      { language: "Spanish", url: "/subtitles/es.vtt" },
    ],
    comments: [],
    downloadStatus: "downloading",
    streamUrl: "/stream/2",
    lastWatched: new Date(),
  },
  {
    id: "3",
    title: "Interstellar",
    year: 2014,
    imdbRating: 8.6,
    genres: ["Adventure", "Drama", "Sci-Fi"],
    duration: 169,
    synopsis:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    coverImage:
      "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_FMjpg_UX1000_.jpg",
    cast: {
      director: "Christopher Nolan",
      actors: [
        "Matthew McConaughey",
        "Anne Hathaway",
        "Jessica Chastain",
        "Michael Caine",
      ],
    },
    torrents: [
      {
        quality: "4K",
        size: "4.5 GB",
        seeders: 201,
        leechers: 65,
        magnetLink:
          "magnet:?xt=urn:btih:09ada5a7a6183aae1e09d831df6748d566095a12",
      },
    ],
    subtitles: [
      { language: "English", url: "/subtitles/en.vtt" },
      { language: "German", url: "/subtitles/de.vtt" },
    ],
    comments: [],
    downloadStatus: "not_started",
    streamUrl: "/stream/3",
    lastWatched: new Date(),
  },
  {
    id: "4",
    title: "Pulp Fiction",
    year: 1994,
    imdbRating: 8.9,
    genres: ["Crime", "Drama"],
    duration: 154,
    synopsis:
      "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    coverImage:
      "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_FMjpg_UX1000_.jpg",
    cast: {
      director: "Quentin Tarantino",
      actors: [
        "John Travolta",
        "Uma Thurman",
        "Samuel L. Jackson",
        "Bruce Willis",
      ],
    },
    torrents: [
      {
        quality: "1080p",
        size: "1.7 GB",
        seeders: 87,
        leechers: 29,
        magnetLink:
          "magnet:?xt=urn:btih:07ada5a7a6183aae1e09d831df6748d566095a13",
      },
    ],
    subtitles: [
      { language: "English", url: "/subtitles/en.vtt" },
      { language: "French", url: "/subtitles/fr.vtt" },
    ],
    comments: [],
    downloadStatus: "completed",
    streamUrl: "/stream/4",
    lastWatched: new Date(),
  },
  {
    id: "5",
    title: "The Matrix",
    year: 1999,
    imdbRating: 8.7,
    genres: ["Action", "Sci-Fi"],
    duration: 136,
    synopsis:
      "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
    coverImage:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_FMjpg_UX1000_.jpg",
    cast: {
      director: "Lana Wachowski, Lilly Wachowski",
      actors: [
        "Keanu Reeves",
        "Laurence Fishburne",
        "Carrie-Anne Moss",
        "Hugo Weaving",
      ],
    },
    torrents: [
      {
        quality: "720p",
        size: "1.1 GB",
        seeders: 142,
        leechers: 38,
        magnetLink:
          "magnet:?xt=urn:btih:05ada5a7a6183aae1e09d831df6748d566095a14",
      },
    ],
    subtitles: [
      { language: "English", url: "/subtitles/en.vtt" },
      { language: "Spanish", url: "/subtitles/es.vtt" },
    ],
    comments: [],
    downloadStatus: "downloading",
    streamUrl: "/stream/5",
    lastWatched: new Date(),
  },
];

// API functions that return promises with mock data
export const getPopularMovies = async () => {
  try {
    const response = await fetch("http://localhost:3000/movies/popular", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies for authentication
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch popular movies: ${response.statusText}`);
    }

    const data = await response.json();
    return data.movies; // Return just the movies array
  } catch (error) {
    console.error("Error fetching popular movies:", error);
    // Return empty array on error to prevent crashes
    return [];
  }
};

export const getWatchedMovies = () => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      resolve([...mockMovies.slice(0, 3)]);
    }, 1200);
  });
};

export const getCurrentUser = () => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      resolve({ ...mockUser });
    }, 1000);
  });
};

// Search movies function - you can replace this with real API call
export const searchMovies = async (query, page = 1) => {
  try {
    const response = await fetch(
      `http://localhost:3000/movies/search?query=${encodeURIComponent(
        query
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

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
};
