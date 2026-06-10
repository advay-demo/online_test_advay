import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import CourseMembers from '../../../components/teacher/CourseMembers';
import * as api from '../../../api/api';

vi.mock('../../../api/api');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ courseId: '123' })
  };
});

describe('CourseMembers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly and loads teachers', async () => {
    api.getCourseTeachers.mockResolvedValue({
      teachers: [
        { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@example.com' },
        { id: 2, first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com' }
      ]
    });

    render(
      <BrowserRouter>
        <CourseMembers />
      </BrowserRouter>
    );

    // Initial loading state
    expect(screen.getByText('Course Members')).toBeInTheDocument();

    // Wait for teachers to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('handles teacher selection and removal', async () => {
    api.getCourseTeachers.mockResolvedValue({
      teachers: [
        { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@example.com' }
      ]
    });

    render(
      <BrowserRouter>
        <CourseMembers />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Select all / toggle select
    const checkboxes = screen.getAllByRole('checkbox');
    // Index 0 is the "select all" in header, index 1 is John Doe
    fireEvent.click(checkboxes[1]);

    // Mock confirm dialog
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
    api.removeTeachersFromCourse.mockResolvedValue({ success: true, message: 'Removed' });

    // Click remove button
    fireEvent.click(screen.getByText('Remove Teachers'));

    await waitFor(() => {
      expect(api.removeTeachersFromCourse).toHaveBeenCalled();
      expect(screen.getByText('Removed')).toBeInTheDocument();
    });
  });

  it('handles errors when loading teachers', async () => {
    api.getCourseTeachers.mockRejectedValue(new Error('Network error'));

    render(
      <BrowserRouter>
        <CourseMembers />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load teachers')).toBeInTheDocument();
    });
  });
});
