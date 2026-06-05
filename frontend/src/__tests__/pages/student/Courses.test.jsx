import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import CourseStudent from '../../../pages/student/Courses';
import useCourseStore from '../../../store/student/courseStore';

vi.mock('../../../store/student/courseStore', () => ({
  default: vi.fn(),
}));

vi.mock('../../../components/layout/Sidebar', () => ({ default: () => <div data-testid="sidebar">Sidebar</div> }));
vi.mock('../../../components/layout/Header', () => ({ default: () => <div data-testid="header">Header</div> }));
vi.mock('../../../components/student/CourseActionButtons', () => ({ default: () => <div data-testid="action-buttons">ActionButtons</div> }));

describe('Student Courses Component', () => {
  const mockFetchCourses = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useCourseStore.mockReturnValue({
      courses: [],
      loading: false,
      error: null,
      fetchCourses: mockFetchCourses,
    });
  });

  const renderComponent = () => {
    render(
      <BrowserRouter>
        <CourseStudent />
      </BrowserRouter>
    );
  };

  it('renders loading state initially', () => {
    useCourseStore.mockReturnValueOnce({
      courses: [],
      loading: true,
      error: null,
      fetchCourses: mockFetchCourses,
    });
    
    renderComponent();
    expect(screen.getByText('Courses')).toBeInTheDocument();
    expect(mockFetchCourses).toHaveBeenCalled();
  });

  it('renders list of courses', () => {
    useCourseStore.mockReturnValue({
      courses: [
        {
          data: {
            id: 1,
            name: 'React Basics',
            code: 'REACT101',
            active: true,
            modules: [1, 2],
            students_count: 50,
            completion_percentage: 10,
            end_date: '2024-12-31'
          }
        }
      ],
      loading: false,
      error: null,
      fetchCourses: mockFetchCourses,
    });
    
        renderComponent();
    expect(screen.getByText('React Basics')).toBeInTheDocument();
    expect(screen.getByText('Code: REACT101')).toBeInTheDocument();
    expect(screen.getAllByText('Active').length).toBeGreaterThan(0);
  });

  it('handles search filtering', () => {
    useCourseStore.mockReturnValue({
      courses: [
        { data: { id: 1, name: 'React', active: true } },
        { data: { id: 2, name: 'Python', active: false } }
      ],
      loading: false,
      error: null,
      fetchCourses: mockFetchCourses,
    });
    
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText('Search courses...');
    fireEvent.change(searchInput, { target: { value: 'python' } });
    
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.queryByText('React')).not.toBeInTheDocument();
  });
});