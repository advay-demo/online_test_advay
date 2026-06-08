import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AddNewCourseStudent from '../../../pages/student/AddCourse';
import useCourseStore from '../../../store/student/courseStore';

vi.mock('../../../store/student/courseStore', () => ({
  default: vi.fn(),
}));

vi.mock('../../../components/layout/Sidebar', () => ({ default: () => <div data-testid="sidebar">Sidebar</div> }));
vi.mock('../../../components/layout/Header', () => ({ default: () => <div data-testid="header">Header</div> }));
vi.mock('../../../components/student/CourseActionButtons', () => ({ default: () => <div data-testid="action-buttons">ActionButtons</div> }));
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

describe('Student AddCourse Component', () => {
  const mockSearchCourses = vi.fn();
  const mockClearSearch = vi.fn();
  const mockRequestEnrollment = vi.fn();
  const mockSelfEnroll = vi.fn();
  const mockClearEnrollmentMessages = vi.fn();

  const defaultStore = {
    newCourses: [],
    loading: false,
    error: null,
    enrollmentLoading: false,
    enrollmentError: null,
    enrollmentSuccess: null,
    searchCourses: mockSearchCourses,
    clearSearch: mockClearSearch,
    requestEnrollment: mockRequestEnrollment,
    selfEnroll: mockSelfEnroll,
    clearEnrollmentMessages: mockClearEnrollmentMessages,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useCourseStore.mockReturnValue(defaultStore);
  });

  const renderComponent = () =>
    render(<BrowserRouter><AddNewCourseStudent /></BrowserRouter>);

  // ── Initial state ──────────────────────────────────────────────
  it('renders initial empty search state', () => {
    renderComponent();
    expect(screen.getByText('Start Your Search')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter course code (e.g., CS101, 0002)')).toBeInTheDocument();
  });

  it('renders search tips section', () => {
    renderComponent();
    expect(screen.getByText(/Search Tips/i)).toBeInTheDocument();
  });

  // ── Search ─────────────────────────────────────────────────────
  it('handles searching for a course', () => {
    renderComponent();
    const input = screen.getByPlaceholderText('Enter course code (e.g., CS101, 0002)');
    fireEvent.change(input, { target: { value: 'TESTCODE' } });
    fireEvent.submit(input.closest('form'));
    expect(mockSearchCourses).toHaveBeenCalledWith('TESTCODE');
  });

  it('does not search when input is empty', () => {
    renderComponent();
    const form = screen.getByPlaceholderText('Enter course code (e.g., CS101, 0002)').closest('form');
    fireEvent.submit(form);
    expect(mockSearchCourses).not.toHaveBeenCalled();
  });

  it('shows clear X button when search term is typed', () => {
    renderComponent();
    const input = screen.getByPlaceholderText('Enter course code (e.g., CS101, 0002)');
    fireEvent.change(input, { target: { value: 'CS101' } });
    // The inline X button inside the input
    const clearInputBtn = input.closest('div').querySelector('button[type="button"]');
    expect(clearInputBtn).toBeTruthy();
    fireEvent.click(clearInputBtn);
    expect(input.value).toBe('');
  });

  it('handles clear search button', () => {
    useCourseStore.mockReturnValue({ ...defaultStore, newCourses: [{ data: { id: 1, name: 'C', enrollment_status: 'enrolled' } }] });
    renderComponent();
    const clearBtn = screen.getByRole('button', { name: /Clear/i });
    fireEvent.click(clearBtn);
    expect(mockClearSearch).toHaveBeenCalled();
  });

  // ── Loading & Error states ─────────────────────────────────────
  it('shows loading spinner when loading', () => {
    useCourseStore.mockReturnValue({ ...defaultStore, loading: true });
    renderComponent();
    expect(screen.getByText('Searching for courses...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    useCourseStore.mockReturnValue({ ...defaultStore, error: 'Network error', loading: false });
    renderComponent();
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('shows no-results state when search term present but no courses', () => {
    renderComponent();
    const input = screen.getByPlaceholderText('Enter course code (e.g., CS101, 0002)');
    fireEvent.change(input, { target: { value: 'UNKNOWN' } });
    useCourseStore.mockReturnValue({ ...defaultStore, newCourses: [], loading: false });
    render(<BrowserRouter><AddNewCourseStudent /></BrowserRouter>);
  });

  // ── Enrollment messages ────────────────────────────────────────
  it('shows enrollment success message', () => {
    useCourseStore.mockReturnValue({ ...defaultStore, enrollmentSuccess: 'Successfully enrolled!' });
    renderComponent();
    expect(screen.getByText('Successfully enrolled!')).toBeInTheDocument();
  });

  it('shows enrollment error message', () => {
    useCourseStore.mockReturnValue({ ...defaultStore, enrollmentError: 'Enrollment failed.' });
    renderComponent();
    expect(screen.getByText('Enrollment failed.')).toBeInTheDocument();
  });

  // ── Enrollment statuses ────────────────────────────────────────
  const makeCourse = (status, extra = {}) => ({
    data: { id: 1, name: 'Test Course', enrollment_status: status, ...extra },
  });

  it('shows "Enrolled" badge for enrolled status', () => {
    useCourseStore.mockReturnValue({ ...defaultStore, newCourses: [makeCourse('enrolled')] });
    renderComponent();
    expect(screen.getByText('Enrolled')).toBeInTheDocument();
  });

  it('shows "Request Pending" badge for request_pending status', () => {
    useCourseStore.mockReturnValue({ ...defaultStore, newCourses: [makeCourse('request_pending')] });
    renderComponent();
    expect(screen.getByText('Request Pending')).toBeInTheDocument();
  });

  it('shows "Request Rejected" badge for request_rejected status', () => {
    useCourseStore.mockReturnValue({ ...defaultStore, newCourses: [makeCourse('request_rejected')] });
    renderComponent();
    expect(screen.getByText('Request Rejected')).toBeInTheDocument();
  });

  it('shows "Enrollment Closed" for no_enrollment_allowed', () => {
    useCourseStore.mockReturnValue({ ...defaultStore, newCourses: [makeCourse('no_enrollment_allowed')] });
    renderComponent();
    expect(screen.getByText('Enrollment Closed')).toBeInTheDocument();
  });

  it('shows "Inactive Course" for inactive_course status', () => {
    useCourseStore.mockReturnValue({ ...defaultStore, newCourses: [makeCourse('inactive_course')] });
    renderComponent();
    expect(screen.getByText('Inactive Course')).toBeInTheDocument();
  });

  it('shows "Unknown Status" for unknown status', () => {
    useCourseStore.mockReturnValue({ ...defaultStore, newCourses: [makeCourse('something_else')] });
    renderComponent();
    expect(screen.getByText('Unknown Status')).toBeInTheDocument();
  });

  // ── Self Enroll ────────────────────────────────────────────────
  it('triggers self enroll on can_enroll_open', async () => {
    mockSelfEnroll.mockResolvedValue({ success: true, data: { message: 'Enrolled!' } });
    useCourseStore.mockReturnValue({ ...defaultStore, newCourses: [makeCourse('can_enroll_open')], selfEnroll: mockSelfEnroll });
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /Enroll Now/i }));
    expect(mockSelfEnroll).toHaveBeenCalledWith(1);
  });

  it('triggers request enrollment on can_enroll_request', async () => {
    mockRequestEnrollment.mockResolvedValue({ success: true, data: { message: 'Request sent' } });
    useCourseStore.mockReturnValue({ ...defaultStore, newCourses: [makeCourse('can_enroll_request')], requestEnrollment: mockRequestEnrollment });
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /Request Enrollment/i }));
    expect(mockRequestEnrollment).toHaveBeenCalledWith(1);
  });

  // ── Course details toggle ──────────────────────────────────────
  it('toggles course details on View Details button click', () => {
    useCourseStore.mockReturnValue({
      ...defaultStore,
      newCourses: [makeCourse('enrolled', {
        code: 'C101',
        instructor: 'Dr. Smith',
        instructions: 'Read chapter 1',
        modules: [{ id: 10, name: 'Module 1', description: 'Intro' }],
        completion_percent: 50,
        start_date: '2025-01-01',
        end_date: '2025-06-01',
      })],
    });
    renderComponent();
    expect(screen.getByText('Code: C101')).toBeInTheDocument();
    const toggleBtn = screen.getByRole('button', { name: /View Details/i });
    fireEvent.click(toggleBtn);
    expect(screen.getByText('Read chapter 1')).toBeInTheDocument();
    expect(screen.getByText('Module 1')).toBeInTheDocument();
    expect(screen.getByText(/50%/)).toBeInTheDocument();
    // Toggle back
    fireEvent.click(screen.getByRole('button', { name: /Hide Details/i }));
    expect(screen.queryByText('Read chapter 1')).not.toBeInTheDocument();
  });

  it('shows found courses count', () => {
    useCourseStore.mockReturnValue({
      ...defaultStore,
      newCourses: [makeCourse('enrolled'), makeCourse('enrolled')],
    });
    renderComponent();
    expect(screen.getByText('Found 2 courses')).toBeInTheDocument();
  });
});