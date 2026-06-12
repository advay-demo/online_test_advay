import { describe, it, expect, vi, beforeEach } from 'vitest';
import useForumStore from '../../store/forumStore';
import * as api from '../../api/api';

vi.mock('../../api/api', () => ({
  getCourseForumPosts: vi.fn(),
  createCourseForumPost: vi.fn(),
  deleteCourseForumPost: vi.fn(),
  getForumPostComments: vi.fn(),
  createForumPostComment: vi.fn(),
  deleteForumPostComment: vi.fn(),
  getCourseLessonForumPosts: vi.fn(),
  getLessonForumComments: vi.fn(),
  createLessonForumComment: vi.fn(),
  deleteLessonForumComment: vi.fn(),
  deleteLessonForumPost: vi.fn(),
}));

describe('forumStore', () => {
  beforeEach(() => {
    useForumStore.setState({
      coursePosts: [],
      lessonPosts: [],
      comments: [],
      loading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  describe('Course Forum Actions', () => {
    it('loadCoursePosts success', async () => {
      const mockPosts = [{ id: 1, content: 'Test post' }];
      api.getCourseForumPosts.mockResolvedValue({ data: mockPosts });

      await useForumStore.getState().loadCoursePosts(123);
      const state = useForumStore.getState();

      expect(api.getCourseForumPosts).toHaveBeenCalledWith(123);
      expect(state.coursePosts).toEqual(mockPosts);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('loadCoursePosts success with array directly', async () => {
      const mockPosts = [{ id: 1, content: 'Test post' }];
      api.getCourseForumPosts.mockResolvedValue(mockPosts);

      await useForumStore.getState().loadCoursePosts(123);
      const state = useForumStore.getState();

      expect(state.coursePosts).toEqual(mockPosts);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('loadCoursePosts failure', async () => {
      api.getCourseForumPosts.mockRejectedValue(new Error('Network error'));
      await useForumStore.getState().loadCoursePosts(123);
      const state = useForumStore.getState();

      expect(state.error).toBe('Failed to load course posts');
      expect(state.loading).toBe(false);
    });

    it('addCoursePost success', async () => {
      api.createCourseForumPost.mockResolvedValue({});
      api.getCourseForumPosts.mockResolvedValue({ data: [{ id: 1 }] });

      await useForumStore.getState().addCoursePost(123, { content: 'New' });
      const state = useForumStore.getState();

      expect(api.createCourseForumPost).toHaveBeenCalledWith(123, { content: 'New' });
      expect(api.getCourseForumPosts).toHaveBeenCalledWith(123);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('addCoursePost failure', async () => {
      api.createCourseForumPost.mockRejectedValue(new Error('Failed'));
      await useForumStore.getState().addCoursePost(123, { content: 'New' });
      const state = useForumStore.getState();

      expect(state.error).toBe('Failed to add course post');
      expect(state.loading).toBe(false);
    });

    it('deleteCoursePost success', async () => {
      api.deleteCourseForumPost.mockResolvedValue({});
      api.getCourseForumPosts.mockResolvedValue({ data: [] });

      await useForumStore.getState().deleteCoursePost(123, 456);
      const state = useForumStore.getState();

      expect(api.deleteCourseForumPost).toHaveBeenCalledWith(123, 456);
      expect(api.getCourseForumPosts).toHaveBeenCalledWith(123);
      expect(state.loading).toBe(false);
    });

    it('deleteCoursePost failure', async () => {
      api.deleteCourseForumPost.mockRejectedValue(new Error('Failed'));
      await useForumStore.getState().deleteCoursePost(123, 456);
      const state = useForumStore.getState();

      expect(state.error).toBe('Failed to delete course post');
    });

    it('loadCourseComments success', async () => {
      const mockComments = [{ id: 1, text: 'Hi' }];
      api.getForumPostComments.mockResolvedValue({ data: mockComments });

      await useForumStore.getState().loadCourseComments(123, 456);
      const state = useForumStore.getState();

      expect(api.getForumPostComments).toHaveBeenCalledWith(123, 456);
      expect(state.comments).toEqual(mockComments);
      expect(state.loading).toBe(false);
    });

    it('loadCourseComments failure', async () => {
      api.getForumPostComments.mockRejectedValue(new Error('Failed'));
      await useForumStore.getState().loadCourseComments(123, 456);
      expect(useForumStore.getState().error).toBe('Failed to load comments');
    });

    it('addCourseComment success', async () => {
      api.createForumPostComment.mockResolvedValue({});
      api.getForumPostComments.mockResolvedValue({ data: [] });

      await useForumStore.getState().addCourseComment(123, 456, { text: 'New' });
      expect(api.createForumPostComment).toHaveBeenCalledWith(123, 456, { text: 'New' });
      expect(api.getForumPostComments).toHaveBeenCalledWith(123, 456);
      expect(useForumStore.getState().loading).toBe(false);
    });

    it('addCourseComment failure', async () => {
      api.createForumPostComment.mockRejectedValue(new Error('Error'));
      await useForumStore.getState().addCourseComment(123, 456, {});
      expect(useForumStore.getState().error).toBe('Failed to add comment');
    });

    it('deleteCourseComment success', async () => {
      api.deleteForumPostComment.mockResolvedValue({});
      api.getForumPostComments.mockResolvedValue({ data: [] });

      await useForumStore.getState().deleteCourseComment(123, 456, 789);
      expect(api.deleteForumPostComment).toHaveBeenCalledWith(123, 789);
      expect(api.getForumPostComments).toHaveBeenCalledWith(123, 456);
      expect(useForumStore.getState().loading).toBe(false);
    });

    it('deleteCourseComment failure', async () => {
      api.deleteForumPostComment.mockRejectedValue(new Error('Error'));
      await useForumStore.getState().deleteCourseComment(123, 456, 789);
      expect(useForumStore.getState().error).toBe('Failed to delete comment');
    });
  });

  describe('Lesson Forum Actions', () => {
    it('loadLessonPosts success', async () => {
      const mockPosts = [{ id: 1 }];
      api.getCourseLessonForumPosts.mockResolvedValue({ data: mockPosts });

      await useForumStore.getState().loadLessonPosts(123);
      expect(api.getCourseLessonForumPosts).toHaveBeenCalledWith(123);
      expect(useForumStore.getState().lessonPosts).toEqual(mockPosts);
    });

    it('loadLessonPosts failure', async () => {
      api.getCourseLessonForumPosts.mockRejectedValue(new Error('Error'));
      await useForumStore.getState().loadLessonPosts(123);
      expect(useForumStore.getState().error).toBe('Failed to load lesson posts');
    });

    it('loadLessonComments success', async () => {
      api.getLessonForumComments.mockResolvedValue({ data: [{ id: 1 }] });
      await useForumStore.getState().loadLessonComments(123, 456);
      expect(api.getLessonForumComments).toHaveBeenCalledWith(123, 456);
      expect(useForumStore.getState().comments).toEqual([{ id: 1 }]);
    });

    it('loadLessonComments failure', async () => {
      api.getLessonForumComments.mockRejectedValue(new Error('Error'));
      await useForumStore.getState().loadLessonComments(123, 456);
      expect(useForumStore.getState().error).toBe('Failed to load lesson comments');
    });

    it('deleteLessonPost success', async () => {
      api.deleteLessonForumPost.mockResolvedValue({});
      api.getCourseLessonForumPosts.mockResolvedValue({ data: [] });

      await useForumStore.getState().deleteLessonPost(123, 456);
      expect(api.deleteLessonForumPost).toHaveBeenCalledWith(123, 456);
      expect(api.getCourseLessonForumPosts).toHaveBeenCalledWith(123);
      expect(useForumStore.getState().loading).toBe(false);
    });

    it('deleteLessonPost failure', async () => {
      api.deleteLessonForumPost.mockRejectedValue(new Error('Error'));
      await useForumStore.getState().deleteLessonPost(123, 456);
      expect(useForumStore.getState().error).toBe('Failed to delete lesson post');
    });

    it('addLessonComment success', async () => {
      api.createLessonForumComment.mockResolvedValue({});
      api.getLessonForumComments.mockResolvedValue({ data: [] });

      await useForumStore.getState().addLessonComment(123, 456, {});
      expect(api.createLessonForumComment).toHaveBeenCalledWith(123, 456, {});
      expect(useForumStore.getState().loading).toBe(false);
    });

    it('addLessonComment failure', async () => {
      api.createLessonForumComment.mockRejectedValue(new Error('Error'));
      await useForumStore.getState().addLessonComment(123, 456, {});
      expect(useForumStore.getState().error).toBe('Failed to add lesson comment');
    });

    it('deleteLessonComment success', async () => {
      api.deleteLessonForumComment.mockResolvedValue({});
      api.getLessonForumComments.mockResolvedValue({ data: [] });

      await useForumStore.getState().deleteLessonComment(123, 456, 789);
      expect(api.deleteLessonForumComment).toHaveBeenCalledWith(123, 789);
      expect(useForumStore.getState().loading).toBe(false);
    });

    it('deleteLessonComment failure', async () => {
      api.deleteLessonForumComment.mockRejectedValue(new Error('Error'));
      await useForumStore.getState().deleteLessonComment(123, 456, 789);
      expect(useForumStore.getState().error).toBe('Failed to delete lesson comment');
    });
  });

  describe('Misc', () => {
    it('clearComments', () => {
      useForumStore.setState({ comments: [{ id: 1 }] });
      useForumStore.getState().clearComments();
      expect(useForumStore.getState().comments).toEqual([]);
    });
  });
});
