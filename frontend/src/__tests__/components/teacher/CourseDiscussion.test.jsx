import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import CourseDiscussionsTab from '../../../components/teacher/CourseDiscussion';
import useForumStore from '../../../store/forumStore';
import useManageCourseStore from '../../../store/manageCourseStore';

vi.mock('../../../store/forumStore', () => ({
    default: vi.fn(),
}));

vi.mock('../../../store/manageCourseStore', () => ({
    default: vi.fn(),
}));

describe('CourseDiscussionsTab Component', () => {
    const mockLoadCoursePosts = vi.fn();
    const mockLoadLessonPosts = vi.fn();
    const mockLoadCourseComments = vi.fn();
    const mockAddCoursePost = vi.fn();
    const mockDeleteCoursePost = vi.fn();
    const mockAddCourseComment = vi.fn();
    const mockClearComments = vi.fn();
    const mockDeleteCourseComment = vi.fn();
    const mockLoadLessonComments = vi.fn();
    const mockAddLessonComment = vi.fn();
    const mockDeleteLessonComment = vi.fn();

    const mockSetActiveForumTab = vi.fn();

    const mockCoursePosts = [
        { id: 1, title: 'Course Post 1', description: 'Desc 1', author: 'Teacher 1', created_at: '2023-01-01T00:00:00Z', is_me: true },
        { id: 2, title: 'Course Post 2', description: 'Desc 2', author: 'Student 2', created_at: '2023-01-02T00:00:00Z' },
    ];

    const mockLessonPosts = [
        { id: 3, title: 'Lesson Post 1', description: 'Desc 3', author: 'Student 3', target_id: 10 },
    ];

    const mockComments = [
        { id: 101, description: 'Comment 1', author: 'Student 2', created_at: '2023-01-01T01:00:00Z' },
        { id: 102, description: 'My Comment', author: 'Me', is_me: true, created_at: '2023-01-01T02:00:00Z' },
    ];

    beforeEach(() => {
        vi.clearAllMocks();

        useForumStore.mockReturnValue({
            coursePosts: mockCoursePosts,
            lessonPosts: mockLessonPosts,
            comments: [],
            loadCoursePosts: mockLoadCoursePosts,
            loadLessonPosts: mockLoadLessonPosts,
            loadCourseComments: mockLoadCourseComments,
            addCoursePost: mockAddCoursePost,
            deleteCoursePost: mockDeleteCoursePost,
            addCourseComment: mockAddCourseComment,
            clearComments: mockClearComments,
            deleteCourseComment: mockDeleteCourseComment,
            loadLessonComments: mockLoadLessonComments,
            addLessonComment: mockAddLessonComment,
            deleteLessonComment: mockDeleteLessonComment,
        });

        useManageCourseStore.mockReturnValue({
            activeForumTab: 'Course Forum',
            setActiveForumTab: mockSetActiveForumTab,
        });
    });

    const renderComponent = (props = {}) => {
        return render(
            <CourseDiscussionsTab 
                courseId={1} 
                showAddPostModal={false} 
                setShowAddPostModal={vi.fn()} 
                closeCreatePost={vi.fn()} 
                {...props} 
            />
        );
    };

    it('renders and loads course posts on mount', () => {
        renderComponent();
        expect(mockLoadCoursePosts).toHaveBeenCalledWith(1);
        expect(screen.getByText('Discussion Forum')).toBeInTheDocument();
        expect(screen.getByText('Course Post 1')).toBeInTheDocument();
        expect(screen.getByText('Course Post 2')).toBeInTheDocument();
    });

    it('renders lesson posts when active tab is Lesson Forum', () => {
        useManageCourseStore.mockReturnValue({
            activeForumTab: 'Lesson Forum',
            setActiveForumTab: mockSetActiveForumTab,
        });
        renderComponent();
        expect(mockLoadLessonPosts).toHaveBeenCalledWith(1);
        expect(screen.getByText('Lesson Discussions')).toBeInTheDocument();
        expect(screen.getByText('Lesson Post 1')).toBeInTheDocument();
    });

    it('switches tabs', () => {
        renderComponent();
        const lessonTabBtn = screen.getByRole('button', { name: 'Lesson Forum' });
        fireEvent.click(lessonTabBtn);
        expect(mockSetActiveForumTab).toHaveBeenCalledWith('Lesson Forum');
    });

    it('opens add post modal and submits new post', async () => {
        const setShowAddPostModal = vi.fn();
        const closeCreatePost = vi.fn();
        
        renderComponent({ showAddPostModal: true, setShowAddPostModal, closeCreatePost });
        
        expect(screen.getByText('Create New Post')).toBeInTheDocument();

        const titleInput = screen.getByPlaceholderText('Post Title *');
        const descInput = screen.getByPlaceholderText('Description');
        
        fireEvent.change(titleInput, { target: { value: 'New Test Post' } });
        fireEvent.change(descInput, { target: { value: 'New Test Desc' } });
        
        const submitBtn = screen.getByRole('button', { name: 'Create Post' });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(mockAddCoursePost).toHaveBeenCalledWith(1, expect.any(FormData));
            expect(mockLoadCoursePosts).toHaveBeenCalledWith(1);
            expect(closeCreatePost).toHaveBeenCalled();
        });
    });

    it('deletes a post', async () => {
        window.confirm = vi.fn().mockReturnValue(true);
        renderComponent();
        const actionBtns = screen.getAllByRole('button', { name: 'Actions' });
        fireEvent.click(actionBtns[0]);

        const deleteBtn = screen.getByRole('button', { name: /Delete/i });
        fireEvent.click(deleteBtn);

        await waitFor(() => {
            expect(mockDeleteCoursePost).toHaveBeenCalledWith(1, 1);
        });
    });

    it('loads and shows comments for a post', () => {
        renderComponent();
        
        const commentsBtns = screen.getAllByRole('button', { name: 'Comments' });
        fireEvent.click(commentsBtns[0]);

        expect(mockLoadCourseComments).toHaveBeenCalledWith(1, 1);
    });

    it('shows add comment modal and adds comment', async () => {
        useForumStore.mockReturnValue({
            ...useForumStore(),
            comments: mockComments,
        });

        renderComponent();
        
        const commentsBtns = screen.getAllByRole('button', { name: 'Comments' });
        fireEvent.click(commentsBtns[0]);
        const addCommentBtn = screen.getByRole('button', { name: /Add Comment/i });
        fireEvent.click(addCommentBtn);

        expect(screen.getByRole('heading', { name: 'Add Comment' })).toBeInTheDocument();

        const commentInput = screen.getByPlaceholderText('Write your comment...');
        fireEvent.change(commentInput, { target: { value: 'Nice post!' } });
        const submitBtn = screen.getAllByRole('button', { name: 'Submit' })[0];
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(mockAddCourseComment).toHaveBeenCalledWith(1, 1, { description: 'Nice post!', anonymous: 'false' });
        });
    });

    it('deletes a comment', async () => {
        window.confirm = vi.fn().mockReturnValue(true);
        useForumStore.mockReturnValue({
            ...useForumStore(),
            comments: mockComments,
        });

        renderComponent();
        
        const commentsBtns = screen.getAllByRole('button', { name: 'Comments' });
        fireEvent.click(commentsBtns[0]);
        const deleteCommentBtns = screen.getAllByRole('button', { name: 'Delete Comment' });
        fireEvent.click(deleteCommentBtns[0]);

        await waitFor(() => {
            expect(mockDeleteCourseComment).toHaveBeenCalledWith(1, 1, 101);
        });
    });
});
