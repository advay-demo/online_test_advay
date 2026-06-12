import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AddCourse from '../../../pages/teacher/AddCourse';
import { createCourse, updateCourse, getTeacherCourse } from '../../../api/api';
import useGradingSystemStore from '../../../store/teacherGradeStore';

vi.mock('../../../api/api', () => ({
  createCourse: vi.fn(),
  updateCourse: vi.fn(),
  getTeacherCourse: vi.fn(),
}));

vi.mock('../../../store/teacherGradeStore', () => ({
  default: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({}),
    useSearchParams: () => [new URLSearchParams()],
  };
});

vi.mock('../../../components/layout/TeacherSidebar', () => ({ default: () => <div data-testid="sidebar">Sidebar</div> }));
vi.mock('../../../components/layout/Header', () => ({ default: () => <div data-testid="header">Header</div> }));
vi.mock('../../../components/teacher/CourseActionButtons', () => ({ default: () => <div data-testid="action-buttons">ActionButtons</div> }));

describe('AddCourse Component', () => {
  const mockLoadGradingSystems = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useGradingSystemStore.mockReturnValue({
      gradingSystems: [{ id: 1, name: 'Standard Letter Grades' }],
      loadGradingSystems: mockLoadGradingSystems,
      loading: false,
    });
  });

  const renderComponent = () => {
    render(
      <BrowserRouter>
        <AddCourse />
      </BrowserRouter>
    );
  };

  it('renders create mode correctly', () => {
    renderComponent();
    expect(screen.getByText('Create New Course')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
    expect(mockLoadGradingSystems).toHaveBeenCalled();
  });

  it('handles input changes', () => {
    renderComponent();
    
    const titleInput = screen.getByPlaceholderText('Enter course title');
    fireEvent.change(titleInput, { target: { name: 'name', value: 'New Test Course' } });
    expect(titleInput).toHaveValue('New Test Course');

    const codeInput = screen.getByPlaceholderText('xxxx');
    fireEvent.change(codeInput, { target: { name: 'code', value: '1234' } });
    expect(codeInput).toHaveValue('1234');
  });

  it('submits form in create mode', async () => {
    createCourse.mockResolvedValueOnce({ id: 99 });
    
    renderComponent();
    
    const titleInput = screen.getByPlaceholderText('Enter course title');
    fireEvent.change(titleInput, { target: { name: 'name', value: 'New Test Course' } });
    
    const createBtn = screen.getByRole('button', { name: 'Create' });
    fireEvent.click(createBtn);
    
    await waitFor(() => {
      expect(createCourse).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Test Course' }));
      expect(mockNavigate).toHaveBeenCalledWith('/teacher/courses/99/manage');
    });
  });
});
