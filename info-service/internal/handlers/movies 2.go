package handlers

import (
	"net/http"
	"strconv"

	"hypertube-info-service/internal/db"

	"github.com/gin-gonic/gin"
)

type MovieHandler struct {
	db *db.Database
}

func NewMovieHandler(db *db.Database) *MovieHandler {
	return &MovieHandler{db: db}
}

// GetMovies returns the list of movies available on the frontpage, with their id and their name
func (h *MovieHandler) GetMovies(c *gin.Context) {
	movies, err := h.db.GetMovies(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch movies"})
		return
	}

	c.JSON(http.StatusOK, movies)
}

// GetMovieByID returns a movie's name, id, imdb mark, production year, length, available subtitles, number of comments
func (h *MovieHandler) GetMovieByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid movie ID"})
		return
	}

	movie, err := h.db.GetMovieByID(c.Request.Context(), int32(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Movie not found"})
		return
	}

	c.JSON(http.StatusOK, movie)
}
