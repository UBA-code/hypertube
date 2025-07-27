import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FaUser,
  FaTrash,
  FaTimes,
  FaSortAmountDown,
  FaSortAmountUp,
} from "react-icons/fa";
import { MdSend } from "react-icons/md";

interface Comment {
  id: number;
  content: string;
  username: string;
  userId: number;
  createdAt: string;
}

interface CommentsSectionProps {
  movieImdbId: string;
  currentUser?: {
    id: number;
    username: string;
  } | null;
}

// Loading Skeleton Component for comments
const CommentsLoadingSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="animate-pulse bg-gray-800 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <div className="w-8 h-8 bg-gray-700 rounded-full mr-3"></div>
          <div className="h-4 bg-gray-700 rounded w-24"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    ))}
  </div>
);

// Delete Confirmation Modal Component
const DeleteConfirmationModal: React.FC<{
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}> = ({ isOpen, onConfirm, onCancel, isDeleting }) => {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isDeleting) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onCancel, isDeleting]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 transform animate-scaleIn">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Delete Comment</h3>
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <FaTimes />
          </button>
        </div>

        <p className="text-gray-300 mb-6 leading-relaxed">
          Are you sure you want to delete this comment? This action cannot be
          undone.
        </p>

        <div className="flex space-x-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Deleting...
              </>
            ) : (
              <>
                <FaTrash className="mr-2 text-sm" />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Individual Comment Component
const CommentItem: React.FC<{
  comment: Comment;
  currentUser?: { id: number; username: string } | null;
  onDelete: (commentId: number) => void;
}> = ({ comment, currentUser, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );
      return diffInMinutes < 1 ? "Just now" : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`;
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);

    try {
      const response = await fetch(
        `http://localhost:3000/movies/comments/${comment.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        onDelete(comment.id);
      } else {
        throw new Error("Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const canDelete = currentUser && currentUser.id === comment.userId;

  return (
    <div className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-center mb-2">
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center mr-3">
            <FaUser className="text-gray-400 text-sm" />
          </div>
          <div>
            <span className="font-semibold text-gray-200">
              {comment.username}
            </span>
            <span className="text-gray-500 text-sm ml-2">
              {formatDate(comment.createdAt)}
            </span>
          </div>
        </div>

        {canDelete && (
          <button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="text-gray-400 hover:text-red-400 transition-colors p-1 disabled:opacity-50"
            title="Delete comment"
          >
            <FaTrash className="text-sm" />
          </button>
        )}
      </div>

      <p className="text-gray-300 leading-relaxed pl-11">{comment.content}</p>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onConfirm={handleDelete}
        onCancel={handleCancelDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

const CommentsSection: React.FC<CommentsSectionProps> = ({
  movieImdbId,
  currentUser,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const currentPageRef = useRef(1);

  // Function to fetch comments
  const fetchComments = useCallback(
    async (page: number, append: boolean = false) => {
      try {
        console.log(
          `[Comments] Fetching page ${page}, append: ${append}, sortOrder: ${sortOrder}`
        );

        if (page === 1 && !append) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError(null);

        const response = await fetch(
          `http://localhost:3000/movies/${movieImdbId}/comments?page=${page}&limit=10&sortBy=${sortOrder}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch comments: ${response.statusText}`);
        }

        const data: Comment[] = await response.json();
        console.log(
          `[Comments] Received ${data.length} comments for page ${page}`
        );

        if (append) {
          setComments((prev) => {
            const newComments = [...prev, ...data];
            // If we received fewer than 10 comments, there are no more
            const newHasMore = data.length === 10;
            setHasMore(newHasMore);
            console.log(
              `[Comments] Total comments: ${newComments.length}, hasMore: ${newHasMore}`
            );
            return newComments;
          });
        } else {
          setComments(data);
          // Reset page counter when fetching first page
          currentPageRef.current = 1;
          // If we received fewer than 10 comments, there are no more
          const initialHasMore = data.length === 10;
          setHasMore(initialHasMore);
          console.log(
            `[Comments] Initial load: ${data.length} comments, hasMore: ${initialHasMore}`
          );
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching comments"
        );
        console.error("Comments fetch error:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [movieImdbId, sortOrder]
  );

  // Initial load when component mounts or sort order changes
  useEffect(() => {
    if (movieImdbId) {
      setComments([]);
      setHasMore(true);
      currentPageRef.current = 1;
      fetchComments(1, false);
    }
  }, [movieImdbId, fetchComments, sortOrder]);

  // Infinite scroll handler
  useEffect(() => {
    let scrollTimeout: number;

    const handleScroll = () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      scrollTimeout = setTimeout(() => {
        // Get the scrollable container
        const mainContent = document.querySelector(".overflow-y-auto");
        const isMainContentScrollable =
          mainContent && mainContent.scrollHeight > mainContent.clientHeight;

        let scrollTop, windowHeight, documentHeight;

        if (isMainContentScrollable) {
          scrollTop = mainContent.scrollTop;
          windowHeight = mainContent.clientHeight;
          documentHeight = mainContent.scrollHeight;
        } else {
          scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          windowHeight = window.innerHeight;
          documentHeight = document.documentElement.scrollHeight;
        }

        const distanceFromBottom = documentHeight - (scrollTop + windowHeight);

        // Load more comments when user is still 300px from bottom
        if (distanceFromBottom <= 300 && !loading && !loadingMore && hasMore) {
          const nextPage = currentPageRef.current + 1;
          console.log(
            `[Comments] Triggering infinite scroll: loading page ${nextPage}`
          );
          currentPageRef.current = nextPage;
          fetchComments(nextPage, true);
        }
      }, 200);
    };

    const mainContent = document.querySelector(".overflow-y-auto");
    const scrollElement = mainContent || window;

    scrollElement.addEventListener("scroll", handleScroll);

    return () => {
      scrollElement.removeEventListener("scroll", handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [loading, loadingMore, hasMore, fetchComments]);

  // Function to submit a new comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      alert("You must be logged in to comment");
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        `http://localhost:3000/movies/${movieImdbId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            content: newComment.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to post comment: ${response.statusText}`);
      }

      // Clear the input
      setNewComment("");

      // Refresh comments to show the new one
      setComments([]);
      setHasMore(true);
      currentPageRef.current = 1;
      fetchComments(1, false);
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Function to handle comment deletion
  const handleDeleteComment = (commentId: number) => {
    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
  };

  // Function to toggle sort order
  const handleSortToggle = () => {
    setSortOrder((prevOrder) => (prevOrder === "DESC" ? "ASC" : "DESC"));
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Comments ({comments.length})</h2>
        <button
          onClick={handleSortToggle}
          disabled={loading}
          className="flex items-center px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:cursor-not-allowed rounded-lg transition-colors text-sm font-medium"
          title={`Sort comments ${
            sortOrder === "DESC" ? "oldest first" : "newest first"
          }`}
        >
          {sortOrder === "DESC" ? (
            <>
              <FaSortAmountDown className="mr-2" />
              Newest First
            </>
          ) : (
            <>
              <FaSortAmountUp className="mr-2" />
              Oldest First
            </>
          )}
        </button>
      </div>

      {/* Add Comment Form */}
      {currentUser ? (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <FaUser className="text-gray-400 text-sm" />
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none"
                  rows={3}
                  disabled={submitting}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500">
                    Posting as {currentUser.username}
                  </span>
                  <button
                    type="submit"
                    disabled={!newComment.trim() || submitting}
                    className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition font-semibold text-sm"
                  >
                    {submitting ? (
                      "Posting..."
                    ) : (
                      <>
                        <MdSend className="mr-2" />
                        Post Comment
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-800 rounded-lg p-4 text-center mb-6">
          <p className="text-gray-400">Please log in to post a comment</p>
        </div>
      )}

      {/* Comments List */}
      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
          <p className="text-red-300">{error}</p>
          <button
            onClick={() => fetchComments(1, false)}
            className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition"
          >
            Try Again
          </button>
        </div>
      )}

      {loading ? (
        <CommentsLoadingSkeleton />
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No comments yet. Be the first to comment!
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUser={currentUser}
                onDelete={handleDeleteComment}
              />
            ))}
          </div>

          {/* Load More Indicator */}
          {loadingMore && (
            <div className="mt-6">
              <CommentsLoadingSkeleton />
              <div className="text-center mt-4">
                <p className="text-gray-400">Loading more comments...</p>
              </div>
            </div>
          )}

          {/* End of Comments */}
          {!hasMore && comments.length > 0 && (
            <div className="text-center py-6">
              <p className="text-gray-500">
                That's all the comments for this movie!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CommentsSection;
