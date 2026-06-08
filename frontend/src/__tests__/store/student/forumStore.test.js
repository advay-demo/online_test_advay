import { describe, it, expect, vi, beforeEach } from 'vitest';
import useStudentForumStore from '../../../store/student/forumStore';
import * as api from '../../../api/api';

vi.mock('../../../api/api');

describe('forumStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useStudentForumStore.setState({
      coursePosts: [],
      lessonPosts: [],
      comments: [],
      loading: false,
      error: null,
    });
  });

  it('should have initial state', () => {
    const state = useStudentForumStore.getState();
    expect(state.coursePosts).toEqual([]);
    expect(state.lessonPosts).toEqual([]);
    expect(state.comments).toEqual([]);
  });

  it('should load course posts', async () => {
    const mockData = [{ id: 1, content: 'Post 1' }];
    api.getCourseForumPosts.mockResolvedValue(mockData);

    await useStudentForumStore.getState().loadCoursePosts(1);

    const state = useStudentForumStore.getState();
    expect(state.coursePosts).toEqual(mockData);
    expect(state.loading).toBe(false);
  });

  it('should load course comments', async () => {
    const mockData = { data: [{ id: 1, content: 'Comment 1' }] };
    api.getForumPostComments.mockResolvedValue(mockData);

    await useStudentForumStore.getState().loadCourseComments(1, 1);

    const state = useStudentForumStore.getState();
    expect(state.comments).toEqual(mockData.data);
    expect(state.loading).toBe(false);
  });

  it('should add course post', async () => {
    api.createCourseForumPost.mockResolvedValue({});
    api.getCourseForumPosts.mockResolvedValue([{ id: 1 }]);

    await useStudentForumStore.getState().addCoursePost(1, { content: 'Test' });

    const state = useStudentForumStore.getState();
    expect(state.coursePosts).toEqual([{ id: 1 }]);
    expect(api.createCourseForumPost).toHaveBeenCalledWith(1, { content: 'Test' });
  });

  it('should delete course post', async () => {
    api.deleteCourseForumPost.mockResolvedValue({});
    api.getCourseForumPosts.mockResolvedValue([]);

    await useStudentForumStore.getState().deleteCoursePost(1, 1);

    const state = useStudentForumStore.getState();
    expect(state.coursePosts).toEqual([]);
    expect(api.deleteCourseForumPost).toHaveBeenCalledWith(1, 1);
  });

  it('should add course comment', async () => {
    api.createForumPostComment.mockResolvedValue({});
    api.getForumPostComments.mockResolvedValue({ data: [{ id: 1 }] });

    await useStudentForumStore.getState().addCourseComment(1, 1, { content: 'Test' });

    const state = useStudentForumStore.getState();
    expect(state.comments).toEqual([{ id: 1 }]);
    expect(api.createForumPostComment).toHaveBeenCalledWith(1, 1, { content: 'Test' });
  });

  it('should load lesson posts', async () => {
    const mockData = { data: [{ id: 1, content: 'Lesson Post 1' }] };
    api.getCourseLessonForumPosts.mockResolvedValue(mockData);

    await useStudentForumStore.getState().loadLessonPosts(1);

    const state = useStudentForumStore.getState();
    expect(state.lessonPosts).toEqual(mockData.data);
  });

  it('should clear comments', () => {
    useStudentForumStore.setState({ comments: [{ id: 1 }] });
    useStudentForumStore.getState().clearComments();
    expect(useStudentForumStore.getState().comments).toEqual([]);
  });
});
