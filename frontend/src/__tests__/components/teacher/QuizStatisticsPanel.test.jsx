import React from 'react';
import { render, screen } from '@testing-library/react';

import QuizStatisticsPanel from '../../../components/teacher/QuizStatisticsPanel';

describe('QuizStatisticsPanel', () => {
  it('renders correctly with stats data', () => {
    const mockData = {
      quiz: { id: 1 },
      total_attempts_count: 5,
      statistics: [
        {
          question: { id: 1, summary: 'Q1', type: 'MCQ', points: 10 },
          total_attempts: 5,
          correct_attempts: 3,
          correct_percentage: 60
        }
      ]
    };
    render(
      <QuizStatisticsPanel
        statsData={mockData}
        onBack={vi.fn()}
        attempts={[{ id: 1, attempt_number: 1 }]}
        currentAttempt={1}
        onAttemptChange={vi.fn()}
        loading={false}
      />
    );
    
    // Use getAllByText because there is a header and a button with "Attempt 1"
    expect(screen.getAllByText('Attempt 1')[0]).toBeInTheDocument();
    expect(screen.getByText(/Total Participants/)).toBeInTheDocument();
  });
});