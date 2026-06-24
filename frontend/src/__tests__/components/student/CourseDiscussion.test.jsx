import React from 'react';
import { render, screen } from '@testing-library/react';
import CourseDiscussion from '../../../components/student/CourseDiscussion';
import useStudentForumStore from '../../../store/student/forumStore';
import useManageCourseStore from '../../../store/student/manageCourseStore';

vi.mock('../../../store/student/forumStore');
vi.mock('../../../store/student/manageCourseStore');

describe('CourseDiscussion Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useManageCourseStore.mockReturnValue({
      activeForumTab: 'Course Forum',
      setActiveForumTab: vi.fn(),
    });
  });

  it('renders empty discussion state', () => {
    useStudentForumStore.mockReturnValue({
      coursePosts: [],
      lessonPosts: [],
      comments: [],
      loadCoursePosts: vi.fn(),
      clearComments: vi.fn(),
    });

    render(<CourseDiscussion courseId="1" showAddPostModal={false} />);
    expect(screen.getByText('No posts yet.')).toBeInTheDocument();
  });

  it('renders forum posts with title and author', () => {
    useStudentForumStore.mockReturnValue({
      coursePosts: [
        { id: 1, title: 'Test Post', description: 'This is a test post', author: 'John Doe' }
      ],
      lessonPosts: [],
      comments: [],
      loadCoursePosts: vi.fn(),
      clearComments: vi.fn(),
    });

    render(<CourseDiscussion courseId="1" showAddPostModal={false} />);
    expect(screen.getByText('Test Post')).toBeInTheDocument();
    expect(screen.getByText('This is a test post')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('opens add post modal when showAddPostModal is true', () => {
    useStudentForumStore.mockReturnValue({
      coursePosts: [],
      lessonPosts: [],
      comments: [],
      loadCoursePosts: vi.fn(),
      clearComments: vi.fn(),
    });

    render(<CourseDiscussion courseId="1" showAddPostModal={true} closeCreatePost={vi.fn()} />);
    expect(screen.getByText('Create New Post')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Post Title *')).toBeInTheDocument();
  });
});