package middleware

import (
	"fmt"
	"net/http"
	"time"

	"hypertube-info-service/internal/services"

	"github.com/gin-gonic/gin"
)

// Logger middleware for request logging
func Logger() gin.HandlerFunc {
	return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		return fmt.Sprintf("%s - [%s] \"%s %s %s %d %s \"%s\" %s\"\n",
			param.ClientIP,
			param.TimeStamp.Format(time.RFC1123),
			param.Method,
			param.Path,
			param.Request.Proto,
			param.StatusCode,
			param.Latency,
			param.Request.UserAgent(),
			param.ErrorMessage,
		)
	})
}

// Recovery middleware for panic recovery
func Recovery() gin.HandlerFunc {
	return gin.Recovery()
}

// AuthMiddleware validates JWT tokens and sets user context
func AuthMiddleware(authService *services.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")

		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization token required"})
			c.Abort()
			return
		}

		// Remove "Bearer " prefix if present
		if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
			tokenString = tokenString[7:]
		}

		// Validate token
		claims, err := authService.ValidateToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			c.Abort()
			return
		}

		// Set user context
		c.Set("user_id", claims.Sub)
		c.Set("username", claims.Username)

		c.Next()
	}
}

// AdminMiddleware checks if user has admin role
func AdminMiddleware(authService *services.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("user_role")
		if !exists || role != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
			c.Abort()
			return
		}
		c.Next()
	}
}

// RateLimitMiddleware implements basic rate limiting
func RateLimitMiddleware(limit int, window time.Duration) gin.HandlerFunc {
	limiter := make(map[string][]time.Time)

	return func(c *gin.Context) {
		clientIP := c.ClientIP()
		now := time.Now()

		// Clean old timestamps
		if timestamps, exists := limiter[clientIP]; exists {
			var valid []time.Time
			for _, ts := range timestamps {
				if now.Sub(ts) < window {
					valid = append(valid, ts)
				}
			}
			limiter[clientIP] = valid
		}

		// Check rate limit
		if len(limiter[clientIP]) >= limit {
			c.JSON(http.StatusTooManyRequests, gin.H{"error": "Rate limit exceeded"})
			c.Abort()
			return
		}

		// Add current timestamp
		limiter[clientIP] = append(limiter[clientIP], now)
		c.Next()
	}
}
