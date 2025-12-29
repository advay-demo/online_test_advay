import React, { useEffect, useState } from 'react';
import useForumStore from '../../store/forumStore';
import { FaPlus, FaChevronDown, FaTimes, FaPaperPlane, FaComments, FaEllipsisV, FaEdit, FaTrash } from 'react-icons/fa';

export default function CourseDiscussionsTab({ courseId, showAddPostModal, setShowAddPostModal, closeCreatePost }) {
  const {
    coursePosts,
    lessonPosts,
    comments,
    loadCoursePosts,
    loadLessonPosts,
    loadCourseComments,
    addCoursePost,
    deleteCoursePost,
    addCourseComment,
    clearComments,
    deleteCourseComment,
    // loading,
    // error,
  } = useForumStore();

  const [selectedPostId, setSelectedPostId] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [activeForumTab, setActiveForumTab] = useState('Course Forum');
  const [showAddCommentModal, setShowAddCommentModal] = useState(false);

  useEffect(() => {
    if (courseId) {
      if (activeForumTab === 'Course Forum') {
        loadCoursePosts(courseId);
      } else {
        loadLessonPosts(courseId);
      }
      clearComments();
      setSelectedPostId(null);
    }
  }, [courseId, activeForumTab, loadCoursePosts, loadLessonPosts, clearComments]);

  const posts = activeForumTab === 'Course Forum' ? coursePosts : lessonPosts;

  const handleShowComments = (postId) => {
    if (selectedPostId === postId) {
      setSelectedPostId(null);
      clearComments();
    } else {
      setSelectedPostId(postId);
      loadCourseComments(courseId, postId);
    }
  };

  // Add Post
  const handleAddPost = async (postData) => {
    let formData;
    if (postData instanceof FormData) {
      formData = postData;
    } else {
      formData = new FormData();
      formData.append('title', postData.title);
      formData.append('description', postData.description);
      formData.append('anonymous', postData.anonymous);
      if (postData.image) {
        formData.append('image', postData.image);
      }
    }
    await addCoursePost(courseId, formData);
    await loadCoursePosts(courseId);
    setShowAddPostModal(false);
  };

  // Delete Post
  const handleDelete = async (post) => {
    setActionMenuOpen(null);
    if (window.confirm(`Are you sure you want to delete the post "${post.title}"?`)) {
      await deleteCoursePost(courseId, post.id);
      if (selectedPostId === post.id) {
        setSelectedPostId(null);
        clearComments();
      }
    }
  };

  // Add Comment
  const handleAddComment = async (commentData) => {
    await addCourseComment(courseId, selectedPostId, commentData);
    setShowAddCommentModal(false);
  };

  // Delete Comment
  const handleDeleteComment = async (comment) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      await deleteCourseComment(courseId, selectedPostId, comment.id);
    }
  };

  return (
    <div>
      <div className="text-cyan-400 text-sm sm:text-base font-medium mb-6 flex items-center gap-2">
        DISCUSSION FORUM <span>&rarr;</span>
      </div>

      
      {showAddPostModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm px-1 sm:px-2">
          <div className="card-strong w-full max-w-full sm:max-w-2xl p-2 sm:p-6 relative rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              className="absolute right-4 top-4 text-lg sm:text-xl p-2 rounded-full border border-[var(--border-color)] bg-[var(--input-bg)] hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
              onClick={closeCreatePost}
              aria-label="Close"
            >
              <FaTimes />
            </button>
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4 sm:mt-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <FaPaperPlane className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-2xl font-bold mb-1 line-clamp-1">
                  Create New Post
                </h2>
                <p className="text-xs sm:text-sm muted line-clamp-2">
                  Add a new discussion post to your course.
                </p>
              </div>
            </div>
            {/* Form */}
            <form
              onSubmit={async e => {
                e.preventDefault();
                const formData = new FormData(e.target);
                formData.set('anonymous', formData.get('anonymous') ? 'true' : 'false');
                await handleAddPost(formData);
                closeCreatePost();
              }}
              className="space-y-4 mt-2"
            >
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium mb-1" htmlFor="post-title">Title:</label>
                <input
                  className="input bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus-visible:outline-none"
                  name="title"
                  id="post-title"
                  placeholder="Post Title *"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium mb-1" htmlFor="post-description">Description:</label>
                <textarea
                  className="input bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus-visible:outline-none"
                  name="description"
                  id="post-description"
                  placeholder="Description"
                  rows={6}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium mb-1" htmlFor="post-image">Image:</label>
                <input
                  type="file"
                  name="image"
                  id="post-image"
                  accept="image/*"
                  className="input"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="anonymous"
                  id="post-anonymous"
                  className="toggle-checkbox"
                />
                <label htmlFor="post-anonymous" className="text-sm">Anonymous</label>
              </div>
              <div className="flex gap-2 justify-end mt-6 flex-wrap">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/10 font-medium transition"
                  onClick={closeCreatePost}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                >
                  Create Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Forum Tabs */}
      <div className="flex bg-black/20 p-1 rounded-lg mb-6 w-max">
        {['Course Forum', 'Lesson Forum'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveForumTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              activeForumTab === tab
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-muted hover:text-white hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      {/* MAIN UI */}
      <div className="p-2 sm:p-4 bg-[var(--surface)] rounded-lg border border-[var(--border-subtle)] mt-4 space-y-8">
        <div>
          <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Posts ({posts.length})
          </h3>
          {posts.length === 0 ? (
            <div className="text-center py-8 text-muted">No posts yet.</div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="card p-2 sm:p-4 flex flex-col gap-2 border border-[var(--border-color)] rounded-lg group"
                >
                  <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0 border border-blue-500/20 group-hover:border-blue-500/30 transition-all duration-200">
                      <FaPaperPlane className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0 w-full sm:w-auto">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-base sm:text-lg line-clamp-1 group-hover:text-blue-400 transition-colors duration-200">
                          {post.title}
                        </h3>
                        {post.author && (
                          <span className="text-xs text-gray-400 ml-2">by {post.author}</span>
                        )}
                      </div>
                      <div
                        className="text-xs sm:text-sm muted mb-2 sm:mb-3 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: post.description }}
                      />
                      {post.image && (
                        <div className="my-2">
                          <img
                            src={post.image}
                            alt="Post"
                            className="max-h-48 rounded-lg border border-gray-200 shadow"
                            style={{ objectFit: 'contain', maxWidth: '100%' }}
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs muted">
                        {post.created_at && (
                          <span className="ml-2 text-gray-400">
                            {new Date(post.created_at).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto sm:self-start mt-2 sm:mt-0">
                      <button
                        onClick={() => handleShowComments(post.id)}
                        className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-[var(--border-color)] rounded-lg text-xs sm:text-sm font-medium hover:bg-[var(--input-bg)] active:scale-95 transition-all duration-200 text-center whitespace-nowrap"
                      >
                        {selectedPostId === post.id ? 'Hide Comments' : 'Comments'}
                      </button>
                      <div className="relative post-action-menu">
                        <button
                          className="p-2 border border-[var(--border-color)] rounded-lg hover:bg-[var(--input-bg)] active:scale-95 transition-all duration-200 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                          onClick={() => setActionMenuOpen(actionMenuOpen === post.id ? null : post.id)}
                          aria-label="Actions"
                          tabIndex={0}
                        >
                          <FaEllipsisV className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        {actionMenuOpen === post.id && (
                          <div className="absolute right-0 mt-2 z-50 w-32 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg shadow-lg py-1 flex flex-col text-sm animate-fade-in">
                            <button
                              className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-500/10 transition"
                              onClick={() => handleDelete(post)}
                            >
                              <FaTrash className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {selectedPostId === post.id && (
                    <div className="mt-2 border-t pt-2">
                      <h4 className="text-xs sm:text-sm font-semibold mb-2 flex items-center gap-1">
                        <FaComments className="text-blue-400" /> Comments
                      </h4>
                      <div
                        className="overflow-x-auto sm:overflow-y-auto"
                        style={{ maxHeight: '220px' }}
                      >
                        {comments.length === 0 ? (
                          <div className="text-xs text-gray-400">No comments.</div>
                        ) : (
                          <ul className="space-y-3">
                            {comments.map((comment) => (
                              <li
                                key={comment.id}
                                className="bg-white/5 border border-blue-100/20 rounded-lg px-2 sm:px-3 py-2 flex flex-col shadow-sm relative"
                              >
                                <div className="text-xs sm:text-sm text-gray-100" style={{ wordBreak: 'break-word' }}>
                                  <span dangerouslySetInnerHTML={{ __html: comment.description }} />
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                                  {comment.created_at && (
                                    <span>
                                      {new Date(comment.created_at).toLocaleString()}
                                    </span>
                                  )}
                                  {comment.author && (
                                    <span>--      {comment.author}</span>
                                  )}
                                </div>
                                <div className="absolute top-2 right-2">
                                  <button
                                    className="p-1 rounded hover:bg-red-100/20 text-red-500"
                                    onClick={() => handleDeleteComment(comment)}
                                    aria-label="Delete Comment"
                                    title="Delete Comment"
                                  >
                                    <FaTrash />
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <button
                        className="w-full sm:w-auto mt-3 px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs font-medium"
                        onClick={() => setShowAddCommentModal(true)}
                      >
                        + Add Comment
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      
      {showAddCommentModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm px-1 sm:px-2">
          <div className="card-strong w-full max-w-full sm:max-w-md p-2 sm:p-6 relative rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              className="absolute right-4 top-4 text-lg sm:text-xl p-2 rounded-full border border-[var(--border-color)] bg-[var(--input-bg)] hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
              onClick={() => setShowAddCommentModal(false)}
              aria-label="Close"
            >
              <FaTimes />
            </button>
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4 sm:mt-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <FaComments className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-2xl font-bold mb-1 line-clamp-1">
                  Add Comment
                </h2>
                <p className="text-xs sm:text-sm muted line-clamp-2">
                  Share your thoughts on this post.
                </p>
              </div>
            </div>
            {/* Form */}
            <form
              onSubmit={async e => {
                e.preventDefault();
                const formData = new FormData(e.target);
                await handleAddComment({
                  description: formData.get('description')
                });
              }}
              className="space-y-4 mt-2"
            >
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium mb-1" htmlFor="comment-description">Comment:</label>
                <textarea
                  name="description"
                  id="comment-description"
                  className="input bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus-visible:outline-none"
                  placeholder="Write your comment..."
                  rows={4}
                  required
                />
              </div>
              <div className="flex gap-2 justify-end mt-6 flex-wrap">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/10 font-medium transition"
                  onClick={() => setShowAddCommentModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}