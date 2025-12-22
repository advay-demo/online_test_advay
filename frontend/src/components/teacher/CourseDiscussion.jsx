import React, { useEffect, useState } from 'react';
import useForumStore from '../../store/forumStore';

export default function CourseDiscussionsTab({ courseId }) {
  const {
    coursePosts,
    comments,
    loadCoursePosts,
    loadCourseComments,
    clearComments,
  } = useForumStore();
  const [selectedPostId, setSelectedPostId] = useState(null);

  useEffect(() => {
    if (courseId) {
      loadCoursePosts(courseId);
      clearComments();
      setSelectedPostId(null);
    }
  }, [courseId, loadCoursePosts, clearComments]);

  const handleShowComments = (postId) => {
    setSelectedPostId(postId);
    loadCourseComments(courseId, postId);
  };

  return (
    <div className="p-4 bg-[var(--surface)] rounded-lg border border-[var(--border-subtle)] mt-4">
      <h2 className="text-lg font-bold mb-2">Course Discussions</h2>
      <ul className="mb-4">
        {coursePosts.length === 0 && <li className="text-sm text-gray-500">No posts yet.</li>}
        {coursePosts.map((post) => (
          <li key={post.id} className="mb-2">
            <div className="font-semibold">{post.title}</div>
            <div className="text-sm text-gray-700 mb-1" dangerouslySetInnerHTML={{ __html: post.description }} />
            <button
              className="text-xs text-blue-600 underline"
              onClick={() => handleShowComments(post.id)}
            >
              View Comments
            </button>
            {selectedPostId === post.id && (
              <ul className="ml-4 mt-2 border-l pl-2">
                {comments.length === 0 && <li className="text-xs text-gray-400">No comments.</li>}
                {comments.map((comment) => (
                  <li key={comment.id} className="text-xs text-gray-700 mb-1">
                    {comment.description}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}