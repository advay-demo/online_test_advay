import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CourseModules from '../../../components/student/CourseModules';
import useManageCourseStore from '../../../store/student/manageCourseStore';

vi.mock('../../../store/student/manageCourseStore');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ courseId: '1' }),
  };
});

describe('CourseModules Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    render(
      <BrowserRouter>
        <CourseModules />
      </BrowserRouter>
    );
  };

  it('renders loading state', () => {
    useManageCourseStore.mockReturnValue({
      modules: [],
      modulesLoading: true,
      modulesError: null,
    });
    renderComponent();
    expect(screen.getByText('Loading modules...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    useManageCourseStore.mockReturnValue({
      modules: [],
      modulesLoading: false,
      modulesError: 'Failed to load modules',
    });
    renderComponent();
    expect(screen.getByText('Failed to load modules')).toBeInTheDocument();
  });

  it('renders empty state when no modules', () => {
    useManageCourseStore.mockReturnValue({
      modules: [],
      modulesLoading: false,
      modulesError: null,
    });
    renderComponent();
    expect(screen.getByText('No modules available for this course yet.')).toBeInTheDocument();
  });

  it('renders modules and expands to show units successfully', () => {
    useManageCourseStore.mockReturnValue({
      modules: [
        {
          id: 1,
          name: 'Module 1: Introduction',
          progress: 50,
          units: [
            { id: 101, type: 'lesson', lesson: { name: 'Lesson 1' }, status: 'completed' }
          ]
        }
      ],
      modulesLoading: false,
      modulesError: null,
    });
    renderComponent();
    expect(screen.getByText('Module 1: Introduction')).toBeInTheDocument();

    const toggleBtn = screen.getByRole('button');
    fireEvent.click(toggleBtn);
    const elements = screen.getAllByText('Lesson 1');
    expect(elements.length).toBeGreaterThan(0);
  });
});