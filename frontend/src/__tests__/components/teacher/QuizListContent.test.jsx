import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import QuizListContent from '../../../components/teacher/QuizListContent';

describe('QuizListContent', () => {
  it('renders with courses and tests user interactions', () => {
    const mockCourses = [
      {
        course_id: 1,
        course_name: 'Math 101',
        quizzes: [{ id: 1, name: 'Quiz 1', module_name: 'Algebra', is_exercise: false, active: true, attempts: 5, start_date: '2023-01-01' }]
      }
    ];

    const props = {
      courses: mockCourses,
      filteredCourses: mockCourses,
      loading: false,
      error: null,
      activeFilter: 'all',
      expandedCourseId: 1, // Keep expanded to render quiz items
      toggleCourseDetails: vi.fn(),
      getQuizTypeIcon: vi.fn(),
      getQuizTypeColor: vi.fn(),
      onGradeClick: vi.fn(),
      onMonitorClick: vi.fn(),
      toggleMenu: vi.fn()
    };

    render(
      <BrowserRouter>
        <QuizListContent {...props} />
      </BrowserRouter>
    );

    // Verify course & quiz rendered
    expect(screen.getByText('Math 101')).toBeInTheDocument();
    expect(screen.getByText('Quiz 1')).toBeInTheDocument();

    // Click buttons to fire events
    fireEvent.click(screen.getByText('Grade'));
    expect(props.onGradeClick).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Monitor'));
    expect(props.onMonitorClick).toHaveBeenCalled();
  });
});