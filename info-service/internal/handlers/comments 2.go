package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"hypertube-info-service/internal/db"

	"github.com/gin-gonic/gin"
)

type CommentHandler struct {
	db *db.Database
}

func NewCommentHandler(db *db.Database) *CommentHandler {
	return &CommentHandler{db: db}
}

// GetComments returns a list of latest comments which includes comment's author username, date, content, and id
func (h *CommentHandler) GetComments(c *gin.Context) {
	comments, err := h.db.GetComments(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch comments"})
		return
	}

	c.JSON(http.StatusOK, comments)
}

// GetCommentByID returns comment, author's username, comment id, date posted
func (h *CommentHandler) GetCommentByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid comment ID"})
		return
	}

	comment, err := h.db.GetCommentByID(c.Request.Context(), int32(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comment not found"})
		return
	}

	c.JSON(http.StatusOK, comment)
}

// UpdateComment updates a comment
func (h *CommentHandler) UpdateComment(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid comment ID"})
		return
	}

	var req struct {
		Comment  string `json:"comment" binding:"required"`
		Username string `json:"username" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	err = h.db.UpdateComment(c.Request.Context(), db.UpdateCommentParams{
		ID:       int32(id),
		Content:  req.Comment,
		Username: req.Username,
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update comment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Comment updated successfully"})
}

// DeleteComment deletes a comment
func (h *CommentHandler) DeleteComment(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid comment ID"})
		return
	}

	err = h.db.DeleteComment(c.Request.Context(), int32(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete comment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Comment deleted successfully"})
}

// CreateComment creates a new comment
func (h *CommentHandler) CreateComment(c *gin.Context) {
	var r struct {
		Comment    string `json:"comment" binding:"required"`
		MovieID    int    `json:"movie_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	var req struct {
		Comment    string `json:"comment" binding:"required"`
		MovieID    int    `json:"movie_id" binding:"required"`
		Username   string `json:"username" binding:"required"`
		UserID     int    `json:"user_id" binding:"required"`
		UserAvatar string `json:"user_avatar" binding:"required"`
	}

	req.Comment = r.Comment
	req.MovieID = r.MovieID

	req.Username = c.GetString("username")
	req.UserID = c.GetInt("user_id")

	// get user avatar from database
	user, err := h.db.GetUserByID(c.Request.Context(), int32(req.UserID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user: " + strconv.Itoa(req.UserID) + " " + req.Username})
		return
	}
	req.UserAvatar = user.ProfilePicture.String
	var userAvatar sql.NullString
	if req.UserAvatar != "" {
		userAvatar.String = req.UserAvatar
		userAvatar.Valid = true
	}

	commentID, err := h.db.CreateComment(c.Request.Context(), db.CreateCommentParams{
		Content:    req.Comment,
		Username:   req.Username,
		UserId:     int32(req.UserID),
		MovieId:    int32(req.MovieID),
		UserAvatar: userAvatar,
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create comment"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": commentID, "message": "Comment created successfully"})
}

// GetCommentsByMovieID returns comments for a specific movie
func (h *CommentHandler) GetCommentsByMovieID(c *gin.Context) {
	movieIDStr := c.Param("id")
	movieID, err := strconv.Atoi(movieIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid movie ID"})
		return
	}

	comments, err := h.db.GetCommentsByMovieID(c.Request.Context(), int32(movieID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch comments"})
		return
	}

	c.JSON(http.StatusOK, comments)
}
