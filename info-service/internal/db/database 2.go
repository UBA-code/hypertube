package db

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	"hypertube-info-service/internal/config"

	_ "github.com/lib/pq"
)

type Database struct {
	*Queries
	db *sql.DB
}

func NewDatabase(cfg *config.Config) (*Database, error) {
	db, err := sql.Open("postgres", cfg.DatabaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Test the connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Set connection pool settings
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(5 * time.Minute)

	log.Println("Database connection established successfully")

	return &Database{
		Queries: New(db),
		db:      db,
	}, nil
}

func (d *Database) Close() error {
	return d.db.Close()
}

// ExecTx executes a function within a database transaction
func (d *Database) ExecTx(ctx context.Context, fn func(*Queries) error) error {
	tx, err := d.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}

	q := New(tx)
	err = fn(q)
	if err != nil {
		if rbErr := tx.Rollback(); rbErr != nil {
			return fmt.Errorf("tx err: %v, rb err: %v", err, rbErr)
		}
		return err
	}

	return tx.Commit()
}
