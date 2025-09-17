package handlers

import (
	"net/http"
	"time"

	"hypertube-info-service/internal/services"

	"github.com/gin-gonic/gin"
)

// HandleOAuthLogin handles OAuth2 login initiation
// func HandleOAuthLogin(authService *services.AuthService) gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		// Redirect to OAuth provider
// 		authURL := authService.GetAuthURL()
// 		c.Redirect(http.StatusTemporaryRedirect, authURL)
// 	}
// }

// HandleOAuthCallback handles OAuth2 callback
// func HandleOAuthCallback(authService *services.AuthService) gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		code := c.Query("code")
// 		if code == "" {
// 			c.JSON(http.StatusBadRequest, gin.H{"error": "Authorization code not provided"})
// 			return
// 		}

// 		token, err := authService.HandleCallback(code)
// 		if err != nil {
// 			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
// 			return
// 		}

// 		// Set JWT token in cookie
// 		c.SetCookie("jwt_token", token, 3600, "/", "", false, true)

// 		c.JSON(http.StatusOK, gin.H{
// 			"message": "Authentication successful",
// 			"token":   token,
// 		})
// 	}
// }

// HandlePublicInfo returns public information about the project
func HandlePublicInfo(infoService *services.InfoService) gin.HandlerFunc {
	return func(c *gin.Context) {
		info := infoService.GetPublicInfo()
		c.JSON(http.StatusOK, info)
	}
}

// HandleHealthCheck returns service health status
func HandleHealthCheck() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "healthy",
			"timestamp": time.Now().UTC(),
			"service":   "hypertube-info-service",
			"version":   "1.0.0",
		})
	}
}

// HandleProjectInfo returns detailed project information
func HandleProjectInfo(infoService *services.InfoService) gin.HandlerFunc {
	return func(c *gin.Context) {
		// info := infoService.GetProjectInfo()
		c.JSON(http.StatusOK, "project info")
	}
}

// HandleArchitectureInfo returns project architecture information
func HandleArchitectureInfo(infoService *services.InfoService) gin.HandlerFunc {
	return func(c *gin.Context) {
		info := infoService.GetArchitectureInfo()
		c.JSON(http.StatusOK, info)
	}
}

// HandleFeaturesInfo returns project features information
func HandleFeaturesInfo(infoService *services.InfoService) gin.HandlerFunc {
	return func(c *gin.Context) {
		info := infoService.GetFeaturesInfo()
		c.JSON(http.StatusOK, info)
	}
}

// HandleTechStackInfo returns project tech stack information
func HandleTechStackInfo(infoService *services.InfoService) gin.HandlerFunc {
	return func(c *gin.Context) {
		info := infoService.GetTechStackInfo()
		c.JSON(http.StatusOK, info)
	}
}

// HandleEndpointsInfo returns available API endpoints
func HandleEndpointsInfo(infoService *services.InfoService) gin.HandlerFunc {
	return func(c *gin.Context) {
		info := infoService.GetEndpointsInfo()
		c.JSON(http.StatusOK, info)
	}
}

// HandleUserProfile returns authenticated user profile
func HandleUserProfile(authService *services.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}

		profile, err := authService.GetUserProfile(userID.(string))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, profile)
	}
}

// HandleAdminStats returns admin statistics
func HandleAdminStats(infoService *services.InfoService) gin.HandlerFunc {
	return func(c *gin.Context) {
		stats := infoService.GetAdminStats()
		c.JSON(http.StatusOK, stats)
	}
}
