import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Courses from '../../../pages/teacher/Courses';
import { fetchTeacherCourses, createDemoCourse } from '../../../api/api';
import useGradingSystemStore from '../../../store/teacherGradeStore';

vi.mock('../../../api/api', () => ({
  fetchTeacherCourses: vi.fn(),
  getTeacherCourse: vi.fn(),
  updateCourse: vi.fn(),
  createDemoCourse: vi.fn(),
}));

vi.mock('../../../store/teacherGradeStore', () => ({
  default: vi.fn(),
}));

vi.mock('../../../components/layout/TeacherSidebar', () => ({
  default: () => <div data-testid="teacher-sidebar">Sidebar</div>,
}));

vi.mock('../../../components/layout/Header', () => ({
  default: () => <div data-testid="header">Header</div>,
}));

vi.mock('../../../components/teacher/CourseActionButtons', () => ({
  default: () => <div data-testid="action-buttons">ActionButtons</div>,
}));

vi.mock('../../../components/teacher/AddCourseModal', () => ({
  default: ({ onCancel, onSuccess }) => (
    <div data-testid="add-course-modal">
      <button onClick={onCancel}>Cancel</button>
      <button onClick={onSuccess}>Success</button>
    </div>
  ),
}));

describe('Teacher Courses Component', () => {
  const mockLoadGradingSystems = vi.fn();

  const mockCourses = [
    {
      id: 1,
      name: 'Test Course 1',
      code: 'TC101',
      status: 'Active',
      modules_count: 5,
      students_count: 20,
      completions: 10,
      created_on: '2023-01-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'Test Course 2',
      status: 'Draft',
      modules_count: 0,
      students_count: 0,
      completions: 0,
      created_on: '2023-02-01T00:00:00Z',
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useGradingSystemStore.mockReturnValue({
      gradingSystems: [],
      loadGradingSystems: mockLoadGradingSystems,
      loading: false,
    });
    fetchTeacherCourses.mockResolvedValue(mockCourses);
  });

  const renderComponent = () => {
    render(
      <BrowserRouter>
        <Courses />
      </BrowserRouter>
    );
  };

  it('renders loading state initially', () => {
    fetchTeacherCourses.mockImplementationOnce(() => new Promise(() => {}));
    renderComponent();
    expect(screen.getByTestId('teacher-sidebar')).toBeInTheDocument();
  });

  it('renders list of courses', async () => {
    fetchTeacherCourses.mockResolvedValue(mockCourses);
    renderComponent();
    
    const courseTitle = await screen.findByText('Test Course 1');
    expect(courseTitle).toBeInTheDocument();
    expect(screen.getByText('Code: TC101')).toBeInTheDocument();
    expect(screen.getByText('Test Course 2')).toBeInTheDocument();
    
    expect(mockLoadGradingSystems).toHaveBeenCalled();
  });

  it('handles search input', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Test Course 1')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search courses...');
    fireEvent.change(searchInput, { target: { value: 'React' } });

    await waitFor(() => {
      expect(fetchTeacherCourses).toHaveBeenCalledWith('all courses', 'React');
    });
  });

  it('handles tab changes', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Test Course 1')).toBeInTheDocument();
    });

    const activeTabBtn = screen.getByRole('button', { name: 'Active' });
    fireEvent.click(activeTabBtn);

    await waitFor(() => {
      expect(fetchTeacherCourses).toHaveBeenCalledWith('active', '');
    });
  });

  it('opens and closes add course modal', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Test Course 1')).toBeInTheDocument();
    });

    const addButtons = screen.getAllByRole('button');
    const addButton = addButtons.find(btn => btn.textContent.includes('Add Course') || btn.textContent.includes('Add'));
    
    fireEvent.click(addButton);
    
    expect(screen.getByTestId('add-course-modal')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByTestId('add-course-modal')).not.toBeInTheDocument();
  });

  it('handles creating demo course', async () => {
    createDemoCourse.mockResolvedValue({ message: 'Demo course created!' });
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Test Course 1')).toBeInTheDocument();
    });

    const addButtons = screen.getAllByRole('button');
    const demoBtn = addButtons.find(btn => btn.textContent.includes('Demo Course') || btn.textContent.includes('Demo'));
    
    fireEvent.click(demoBtn);

    await waitFor(() => {
      expect(createDemoCourse).toHaveBeenCalled();
      expect(screen.getByText('Demo course created!')).toBeInTheDocument();
      expect(fetchTeacherCourses).toHaveBeenCalledTimes(2); // once initial, once after success
    });
  });
});
