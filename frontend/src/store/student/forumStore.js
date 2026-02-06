/* filepath: /home/bhotto/projects04/online_test/frontend/src/store/student/manageCourseForumStore.js */
import { create } from 'zustand';
import {
  getCourseForumPosts,
  createCourseForumPost,
  deleteCourseForumPost,
  getForumPostComments,
  createForumPostComment,
  getLessonForumPosts,
  createLessonForumPost,
  getLessonForumPostComments,
  createLessonForumPostComment,
  deleteForumPostComment,
} from '../../api/api'; // Adjust path if necessary

const useStudentForumStore = create((set, get) => ({
  coursePosts: [],
  lessonPosts: [],
  comments: [],
  loading: false,
  error: null,

  // Course forum
  loadCoursePosts: async (courseId) => {
    set({ loading: true, error: null });
    try {
      const res = await getCourseForumPosts(courseId);
      const posts = Array.isArray(res) ? res : (res.data || []);
      set({
        coursePosts: posts,
        loading: false
      });
    } catch (error) {
      console.error('Failed to load course posts:', error);
      set({ error: 'Failed to load course posts', loading: false });
    }
  },

  addCoursePost: async (courseId, postData) => {
    set({ loading: true, error: null });
    try {
      await createCourseForumPost(courseId, postData);
      await get().loadCoursePosts(courseId);
      set({ loading: false });
    } catch (error) {
      set({ error: 'Failed to add course post', loading: false });
    }
  },

  deleteCoursePost: async (courseId, postId) => {
    set({ loading: true, error: null });
    try {
      await deleteCourseForumPost(courseId, postId);
      await get().loadCoursePosts(courseId);
      set({ loading: false });
    } catch (error) {
      set({ error: 'Failed to delete course post', loading: false });
    }
  },

  loadCourseComments: async (courseId, postId) => {
    set({ loading: true, error: null });
    try {
      const res = await getForumPostComments(courseId, postId);
      set({ comments: res.data || res, loading: false });
    } catch (error) {
      set({ error: 'Failed to load comments', loading: false });
    }
  },

  addCourseComment: async (courseId, postId, commentData) => {
    set({ loading: true, error: null });
    try {
      await createForumPostComment(courseId, postId, commentData);
      await get().loadCourseComments(courseId, postId);
      set({ loading: false });
    } catch (error) {
      set({ error: 'Failed to add comment', loading: false });
    }
  },
   
  deleteCourseComment: async (courseId, postId, commentId) => {
    set({ loading: true, error: null });
    try {
      await deleteForumPostComment(courseId, commentId);
      await get().loadCourseComments(courseId, postId);
      set({ loading: false });
    } catch (error) {
      set({ error: 'Failed to delete comment', loading: false });
    }
  },

  // Lesson forum (Optional for this component, but good to have)
  loadLessonPosts: async (lessonId) => {
    set({ loading: true, error: null });
    try {
      const res = await getLessonForumPosts(lessonId);
      set({ lessonPosts: res.data || res, loading: false });
    } catch (error) {
      set({ error: 'Failed to load lesson posts', loading: false });
    }
  },
  
  clearComments: () => set({ comments: [] }),
}));

export default useStudentForumStore;