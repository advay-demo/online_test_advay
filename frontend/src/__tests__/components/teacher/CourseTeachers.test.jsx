import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CourseTeachers from '../../../components/teacher/CourseTeachers';
import * as api from '../../../api/api';

vi.mock('../../../api/api');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ courseId: '123' })
  };
});

describe('CourseTeachers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders and handles searching for teachers', async () => {
    api.getCourseTeachers.mockResolvedValue({ teachers: [] });

    render(
      <BrowserRouter>
        <CourseTeachers />
      </BrowserRouter>
    );

    // Initial state
    expect(screen.getByPlaceholderText(/Search teachers/i)).toBeInTheDocument();

    // Type in search
    const searchInput = screen.getByPlaceholderText(/Search teachers/i);
    fireEvent.change(searchInput, { target: { value: 'alice' } });

    // Mock search results
    api.searchTeachers.mockResolvedValue({
      success: true,
      teachers: [
        { id: 3, first_name: 'Alice', last_name: 'Wonderland', email: 'alice@example.com', username: 'alice' }
      ]
    });

    // Submit search
    fireEvent.submit(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(api.searchTeachers).toHaveBeenCalledWith('123', 'alice'); // courseId is 123
      expect(screen.getByText('Alice Wonderland')).toBeInTheDocument();
    });
  });

  it('handles adding selected teachers', async () => {
    api.getCourseTeachers.mockResolvedValue({ teachers: [] });
    api.searchTeachers.mockResolvedValue({
      success: true,
      teachers: [
        { id: 3, first_name: 'Alice', last_name: 'Wonderland', email: 'alice@example.com', username: 'alice' }
      ]
    });

    render(
      <BrowserRouter>
        <CourseTeachers />
      </BrowserRouter>
    );

    // Perform search
    fireEvent.change(screen.getByPlaceholderText(/Search teachers/i), { target: { value: 'alice' } });
    fireEvent.submit(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText('Alice Wonderland')).toBeInTheDocument();
    });

    // Select the teacher
    const checkboxes = screen.getAllByRole('checkbox');
    // Index 0 is select all, Index 1 is Alice
    fireEvent.click(checkboxes[1]);

    api.addTeachersToCourse.mockResolvedValue({ success: true, message: 'Added' });

    // Click Add
    const addButton = screen.getByText(/Add Selected/i);
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(api.addTeachersToCourse).toHaveBeenCalled();
      expect(screen.getByText('Added')).toBeInTheDocument();
    });
  });

  it('handles search errors', async () => {
    api.getCourseTeachers.mockResolvedValue({ teachers: [] });
    api.searchTeachers.mockRejectedValue(new Error('Search failed'));

    render(
      <BrowserRouter>
        <CourseTeachers />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Search teachers/i), { target: { value: 'fail' } });
    fireEvent.submit(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText(/Failed to search teachers/i)).toBeInTheDocument();
    });
  });
});
