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

describe('Student AddCourse Component', () => {
  const mockSearchCourses = vi.fn();
  const mockClearSearch = vi.fn();
  const mockRequestEnrollment = vi.fn();
  const mockSelfEnroll = vi.fn();
  const mockClearEnrollmentMessages = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useCourseStore.mockReturnValue({
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
    });
  });

  const renderComponent = () => {
    render(
      <BrowserRouter>
        <AddNewCourseStudent />
      </BrowserRouter>
    );
  };

  it('renders initial empty search state', () => {
    renderComponent();
    expect(screen.getByText('Start Your Search')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter course code (e.g., CS101, 0002)')).toBeInTheDocument();
  });

  it('handles searching for a course', () => {
    renderComponent();
    
    const input = screen.getByPlaceholderText('Enter course code (e.g., CS101, 0002)');
    const searchBtn = screen.getByRole('button', { name: /Search/i });
    
    fireEvent.change(input, { target: { value: 'TESTCODE' } });
    fireEvent.click(searchBtn);
    
    expect(mockSearchCourses).toHaveBeenCalledWith('TESTCODE');
  });

  it('displays search results correctly', () => {
    useCourseStore.mockReturnValue({
      newCourses: [
        {
          data: {
            id: 1,
            name: 'Demo Course',
            code: 'DEMO',
            enrollment_status: 'can_enroll_open',
          }
        }
      ],
      loading: false,
      error: null,
      searchCourses: mockSearchCourses,
      clearSearch: mockClearSearch,
      clearEnrollmentMessages: mockClearEnrollmentMessages,
    });
    
    renderComponent();
    expect(screen.getByText('Search Results')).toBeInTheDocument();
    expect(screen.getByText('Demo Course')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enroll Now/i })).toBeInTheDocument();
  });

  it('triggers self enroll action when clicking enroll', async () => {
    mockSelfEnroll.mockResolvedValue({ success: true, data: { message: 'Enrolled' } });
    
    useCourseStore.mockReturnValue({
      newCourses: [{ data: { id: 10, name: 'Auto Enroll', enrollment_status: 'can_enroll_open' } }],
      loading: false,
      error: null,
      searchCourses: mockSearchCourses,
      clearSearch: mockClearSearch,
      selfEnroll: mockSelfEnroll,
      clearEnrollmentMessages: mockClearEnrollmentMessages,
    });
    
    renderComponent();
    const enrollBtn = screen.getByRole('button', { name: /Enroll Now/i });
    fireEvent.click(enrollBtn);
    
    expect(mockClearEnrollmentMessages).toHaveBeenCalled();
    expect(mockSelfEnroll).toHaveBeenCalledWith(10);
  });
});