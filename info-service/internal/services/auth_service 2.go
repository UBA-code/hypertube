package services

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	// "net/url"
	// "time"

	"hypertube-info-service/internal/config"

	"github.com/golang-jwt/jwt/v5"
)

type AuthService struct {
	config *config.Config
}

type JWTClaims struct {
	Sub   int    `json:"sub"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

type UserProfile struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	Name     string `json:"name"`
	Role     string `json:"role"`
	Provider string `json:"provider"`
}

func NewAuthService(cfg *config.Config) *AuthService {
	return &AuthService{
		config: cfg,
	}
}

// GetAuthURL generates OAuth2 authorization URL
// func (s *AuthService) GetAuthURL() string {
// 	// For demo purposes, we'll use a mock OAuth2 flow
// 	// In production, you'd integrate with actual OAuth2 providers like Google, GitHub, etc.

// 	state := generateRandomState()

// 	params := url.Values{}
// 	params.Add("client_id", s.config.OAuth2ClientID)
// 	params.Add("redirect_uri", s.config.OAuth2Redirect)
// 	params.Add("response_type", "code")
// 	params.Add("scope", "read:user")
// 	params.Add("state", state)

// 	// Mock OAuth2 provider URL (replace with actual provider)
// 	baseURL := "https://oauth2-provider.com/oauth/authorize"
// 	return fmt.Sprintf("%s?%s", baseURL, params.Encode())
// }

// HandleCallback processes OAuth2 callback and returns JWT token
// func (s *AuthService) HandleCallback(code string) (string, error) {
// 	// In production, you'd exchange the code for an access token
// 	// and fetch user information from the OAuth2 provider

// 	// Mock user data for demo purposes
// 	userProfile := &UserProfile{
// 		ID:       "user_123",
// 		Email:    "user@example.com",
// 		Name:     "Demo User",
// 		Role:     "user",
// 		Provider: "oauth2",
// 	}

// 	// Generate JWT token
// 	token, err := s.generateJWT(userProfile)
// 	if err != nil {
// 		return "", fmt.Errorf("failed to generate JWT: %w", err)
// 	}

// 	return token, nil
// }

// ValidateToken validates JWT token and returns claims
func (s *AuthService) ValidateToken(tokenString string) (*JWTClaims, error) {
	// token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
	// 	// Require HS256 explicitly
	// 	if token.Method != jwt.SigningMethodHS256 {
	// 		return nil, fmt.Errorf("unexpected signing method: %v (expected HS256)", token.Header["alg"])
	// 	}
	// 	return []byte(s.config.JWTSecret), nil
	// })

	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(s.config.JWTSecret), nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, fmt.Errorf("invalid token")
}

// GetUserProfile returns user profile information
func (s *AuthService) GetUserProfile(userID string) (*UserProfile, error) {
	// In production, you'd fetch this from a database
	// For demo purposes, return mock data
	return &UserProfile{
		ID:       userID,
		Email:    "user@example.com",
		Name:     "Demo User",
		Role:     "user",
		Provider: "oauth2",
	}, nil
}

// generateJWT creates a new JWT token for the user
// func (s *AuthService) generateJWT(user *UserProfile) (string, error) {
// 	claims := &JWTClaims{
// 		Sub:   user.Sub,
// 		RegisteredClaims: jwt.RegisteredClaims{
// 			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
// 			IssuedAt:  jwt.NewNumericDate(time.Now()),
// 			NotBefore: jwt.NewNumericDate(time.Now()),
// 			Issuer:    "hypertube-info-service",
// 			Subject:   user.ID,
// 		},
// 	}

// 	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
// 	return token.SignedString([]byte(s.config.JWTSecret))
// }

// generateRandomState generates a random state parameter for OAuth2
func generateRandomState() string {
	b := make([]byte, 32)
	rand.Read(b)
	return base64.URLEncoding.EncodeToString(b)
}
