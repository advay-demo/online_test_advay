import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Lesson from '../../../pages/student/Lesson';
import useManageCourseStore from '../../../store/student/manageCourseStore';
import { fetchLessonDetail, markLessonComplete } from '../../../api/api';

vi.mock('../../../store/student/manageCourseStore', () => ({
  default: vi.fn(),
}));

vi.mock('../../../api/api', () => ({
  fetchLessonDetail: vi.fn(),
  markLessonComplete: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ lessonId: '1' }),
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../../components/layout/Sidebar', () => ({ default: () => <div data-testid="sidebar">Sidebar</div> }));
vi.mock('../../../components/layout/Header', () => ({ default: () => <div data-testid="header">Header</div> }));

const baseLesson = {
  id: 1,
  name: 'Test Lesson',
  course_id: 2,
  course_name: 'Test Course',
  module_name: 'Module 1',
  description: 'Lesson content here',
  is_completed: false,
  video_url: null,
  video_file: null,
  files: [],
};

describe('Student Lesson Component', () => {
  const mockLoadCourseModules = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useManageCourseStore.mockReturnValue({ loadCourseModules: mockLoadCourseModules });
  });

  const renderComponent = () =>
    render(<BrowserRouter><Lesson /></BrowserRouter>);

  // ── Loading state ──────────────────────────────────────────────
  it('renders loading state initially', () => {
    fetchLessonDetail.mockReturnValue(new Promise(() => {}));
    renderComponent();
    expect(screen.getByText('Loading lesson...')).toBeInTheDocument();
  });

  // ── Error state ────────────────────────────────────────────────
  it('renders error state when fetch fails', async () => {
    fetchLessonDetail.mockRejectedValue(new Error('Network error'));
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Failed to load lesson')).toBeInTheDocument();
    });
    expect(screen.getByText('Back to Courses')).toBeInTheDocument();
  });

  // ── Successful load ────────────────────────────────────────────
  it('renders lesson data after successful fetch', async () => {
    fetchLessonDetail.mockResolvedValue(baseLesson);
    markLessonComplete.mockResolvedValue({});
    renderComponent();
    await waitFor(() => expect(screen.getByText('Test Lesson')).toBeInTheDocument());
    expect(screen.getByText('Test Course')).toBeInTheDocument();
    expect(screen.getByText('Module 1')).toBeInTheDocument();
    expect(screen.getByText('Lesson content here')).toBeInTheDocument();
  });

  // ── Mark complete ──────────────────────────────────────────────
  it('marks lesson as complete and shows completion message', async () => {
    fetchLessonDetail.mockResolvedValue(baseLesson);
    markLessonComplete.mockResolvedValue({});
    renderComponent();
    await waitFor(() => expect(screen.getByRole('button', { name: /Mark as Complete/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /Mark as Complete/i }));
    expect(markLessonComplete).toHaveBeenCalledWith('1');
    await waitFor(() => expect(screen.getByText('Lesson Completed!')).toBeInTheDocument());
    expect(mockLoadCourseModules).toHaveBeenCalledWith(2);
  });

  // ── Already completed ──────────────────────────────────────────
  it('does not show complete button if already completed', async () => {
    fetchLessonDetail.mockResolvedValue({ ...baseLesson, is_completed: true });
    renderComponent();
    await waitFor(() => expect(screen.getByText('Lesson Completed!')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /Mark as Complete/i })).not.toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  // ── Back navigation ────────────────────────────────────────────
  it('navigates to course page on back button with course_id', async () => {
    fetchLessonDetail.mockResolvedValue(baseLesson);
    renderComponent();
    await waitFor(() => expect(screen.getByText('Test Lesson')).toBeInTheDocument());
    const backBtn = screen.getAllByRole('button').find(b => b.querySelector('svg'));
    fireEvent.click(backBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/courses/2/manage');
  });

  it('navigates to /courses on back button without course_id', async () => {
    fetchLessonDetail.mockResolvedValue({ ...baseLesson, course_id: null });
    renderComponent();
    await waitFor(() => expect(screen.getByText('Test Lesson')).toBeInTheDocument());
    const backBtn = screen.getAllByRole('button').find(b => b.querySelector('svg'));
    fireEvent.click(backBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/courses');
  });

  // ── Video embed: YouTube ───────────────────────────────────────
  it('embeds YouTube video URL', async () => {
    fetchLessonDetail.mockResolvedValue({
      ...baseLesson,
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    });
    renderComponent();
    await waitFor(() => expect(screen.getByText('Test Lesson')).toBeInTheDocument());
    expect(screen.getByTitle('Test Lesson')).toBeInTheDocument(); // iframe title
  });

  it('embeds Vimeo video URL', async () => {
    fetchLessonDetail.mockResolvedValue({
      ...baseLesson,
      video_url: 'https://vimeo.com/123456789',
    });
    renderComponent();
    await waitFor(() => expect(screen.getByText('Test Lesson')).toBeInTheDocument());
    const iframe = screen.getByTitle('Test Lesson');
    expect(iframe.src).toContain('player.vimeo.com/video/123456789');
  });

  it('embeds direct video file', async () => {
    fetchLessonDetail.mockResolvedValue({
      ...baseLesson,
      video_file: '/media/videos/lesson.mp4',
    });
    renderComponent();
    await waitFor(() => expect(screen.getByText('Test Lesson')).toBeInTheDocument());
    expect(document.querySelector('video')).toBeInTheDocument();
  });

  // ── Attached files ─────────────────────────────────────────────
  it('renders attached files section', async () => {
    fetchLessonDetail.mockResolvedValue({
      ...baseLesson,
      files: [
        { id: 1, name: 'lecture_notes.pdf', file: '/media/files/lecture_notes.pdf' },
        { id: 2, name: 'slides.pptx', file: '/media/files/slides.pptx' },
      ],
    });
    renderComponent();
    await waitFor(() => expect(screen.getByText('Attached Files')).toBeInTheDocument());
    expect(screen.getByText('lecture_notes.pdf')).toBeInTheDocument();
    expect(screen.getByText('slides.pptx')).toBeInTheDocument();
    expect(screen.getByText('2 Files')).toBeInTheDocument();
  });

  it('renders "1 File" for a single attached file', async () => {
    fetchLessonDetail.mockResolvedValue({
      ...baseLesson,
      files: [{ id: 1, name: 'doc.pdf', file: '/media/files/doc.pdf' }],
    });
    renderComponent();
    await waitFor(() => expect(screen.getByText('1 File')).toBeInTheDocument());
  });

  // ── Complete failure alert ─────────────────────────────────────
  it('calls alert when markLessonComplete fails', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    fetchLessonDetail.mockResolvedValue(baseLesson);
    markLessonComplete.mockRejectedValue(new Error('Server error'));
    renderComponent();
    await waitFor(() => expect(screen.getByRole('button', { name: /Mark as Complete/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /Mark as Complete/i }));
    await waitFor(() => expect(alertMock).toHaveBeenCalledWith('Failed to mark lesson as complete'));
    alertMock.mockRestore();
  });
});