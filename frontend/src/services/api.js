// Mock API for initial development
export default {
  getTopMovies: () => {
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        resolve([
          {
            id: "1",
            title: "Inception",
            year: 2010,
            imdbRating: 8.8,
            coverImage:
              "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg",
          },
          {
            id: "2",
            title: "The Shawshank Redemption",
            year: 1994,
            imdbRating: 9.3,
            coverImage:
              "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg",
          },
          {
            id: "3",
            title: "The Dark Knight",
            year: 2008,
            imdbRating: 9.0,
            coverImage:
              "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg",
          },
          {
            id: "4",
            title: "Pulp Fiction",
            year: 1994,
            imdbRating: 8.9,
            coverImage:
              "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
          },
        ]);
      }, 800);
    });
  },
};
