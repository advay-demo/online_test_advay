import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import QuizMonitorPanel from '../../../components/teacher/QuizMonitorPanel';

vi.mock('../../../store/quizMonitorStore', () => {
  const mockMonitorData = {
    papers: [{ id: 1, end_time: '2023-01-01T00:00:00.000Z', status: 'completed', user: { id: 1, first_name: 'John', last_name: 'Doe', roll_number: '123' }, marks_obtained: 80, questions_attempted_count: 5 }],
    stats: { total_papers: 1, completed_papers: 1, inprogress_papers: 0, questions_count: 5 },
    attempt_numbers: [1]
  };

  return {
    default: () => ({
      result: mockMonitorData,
      loading: false,
      error: null,
      monitorQuiz: vi.fn(),
      downloadCSV: vi.fn(),
      extendTime: vi.fn(),
      allowSpecial: vi.fn(),
      reset: vi.fn(),
      fetchQuizStatistics: vi.fn()
    })
  };
});

describe('QuizMonitorPanel', () => {
  it('renders and selects user and attempt to view results', async () => {
    const defaultProps = {
      courseId: 1, quizId: 1,
      quiz: { id: 1, description: 'Test Quiz', is_exercise: false, start_date: '2023-01-01', module_name: 'Mod' },
      course: { course_id: 1, course_name: 'Test Course' }, onBack: vi.fn()
    };

    render(
      <BrowserRouter>
        <QuizMonitorPanel {...defaultProps} />
      </BrowserRouter>
    );
    
    // Select attempt
    fireEvent.click(screen.getByText('Attempt 1'));
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});