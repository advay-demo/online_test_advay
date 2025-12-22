import { create } from 'zustand';
import {
  getCourseForumPosts,
  createCourseForumPost,
  getForumPostComments,
  createForumPostComment,
  getLessonForumPosts,
  createLessonForumPost,
  getLessonForumPostComments,
  createLessonForumPostComment,
} from '../api/api';

const useForumStore = create((set, get) => ({
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
      console.log('API response for course posts:', res);
      const posts = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
      console.log('Setting coursePosts to:', posts);
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

  // Lesson forum
  loadLessonPosts: async (lessonId) => {
    set({ loading: true, error: null });
    try {
      const res = await getLessonForumPosts(lessonId);
      set({ lessonPosts: res.data || res, loading: false });
    } catch (error) {
      set({ error: 'Failed to load lesson posts', loading: false });
    }
  },

  addLessonPost: async (lessonId, postData) => {
    set({ loading: true, error: null });
    try {
      await createLessonForumPost(lessonId, postData);
      await get().loadLessonPosts(lessonId);
      set({ loading: false });
    } catch (error) {
      set({ error: 'Failed to add lesson post', loading: false });
    }
  },

  loadLessonComments: async (lessonId, postId) => {
    set({ loading: true, error: null });
    try {
      const res = await getLessonForumPostComments(lessonId, postId);
      set({ comments: res.data || res, loading: false });
    } catch (error) {
      set({ error: 'Failed to load lesson comments', loading: false });
    }
  },

  addLessonComment: async (lessonId, postId, commentData) => {
    set({ loading: true, error: null });
    try {
      await createLessonForumPostComment(lessonId, postId, commentData);
      await get().loadLessonComments(lessonId, postId);
      set({ loading: false });
    } catch (error) {
      set({ error: 'Failed to add lesson comment', loading: false });
    }
  },

  clearComments: () => set({ comments: [] }),
}));

export default useForumStore;