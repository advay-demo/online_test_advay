import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QuizQuestionManager from '../../../components/teacher/QuizQuestionManager';
import * as api from '../../../api/api';

vi.mock('../../../api/api');

describe('QuizQuestionManager', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('loads, displays, and adds questions', async () => {
    api.getQuizQuestions.mockResolvedValue({
      fixed_questions: [{ id: 1, summary: 'Q1', type: 'MCQ', points: 10 }],
      total_marks: 10
    });
    
    api.fetchTeacherQuestions.mockResolvedValue([{ id: 2, summary: 'Q2', type: 'MCQ', points: 10 }]);
    
    render(<QuizQuestionManager quizId={1} onClose={vi.fn()} onUpdate={vi.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByText('Q1')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Add Questions'));
    
    await waitFor(() => {
      expect(screen.getByText('Q2')).toBeInTheDocument();
    });
    
    // Select Q2 by clicking the text, which triggers the div's onClick
    // (Clicking the checkbox directly fires both onChange and onClick due to bubbling)
    fireEvent.click(screen.getByText('Q2'));
    
    // Wait for the state update and button text to change
    const addButton = await screen.findByText('Add 1');
    
    api.addQuestionToQuiz.mockResolvedValue({});
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(api.addQuestionToQuiz).toHaveBeenCalled();
    });
  });
});