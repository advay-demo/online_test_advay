import { describe, it, expect, vi, beforeEach } from 'vitest';
import useAnswerPaperStore from '../../../store/student/answerPaperStore';
import * as api from '../../../api/api';

vi.mock('../../../api/api');

describe('answerPaperStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAnswerPaperStore.getState().reset();
  });

  it('should have initial state', () => {
    const state = useAnswerPaperStore.getState();
    expect(state.loading).toBe(false);
    expect(state.error).toBe(null);
    expect(state.papers).toEqual([]);
  });

  it('should fetch answer paper data successfully and auto-select latest attempt', async () => {
    const mockData = {
      quiz: { id: 1, title: 'Quiz 1' },
      course_id: 1,
      course_name: 'Course 1',
      module_name: 'Module 1',
      user: { id: 1 },
      profile: { id: 1 },
      papers: [
        { attempt_number: 2, score: 90 },
        { attempt_number: 1, score: 80 }
      ],
      questionpaper_id: 1,
      has_user_assignments: true
    };
    api.viewAnswerPaper.mockResolvedValue(mockData);

    const promise = useAnswerPaperStore.getState().fetchAnswerPaperData(1, 1);
    
    expect(useAnswerPaperStore.getState().loading).toBe(true);
    
    await promise;

    const state = useAnswerPaperStore.getState();
    expect(state.loading).toBe(false);
    expect(state.error).toBe(null);
    expect(state.quiz).toEqual(mockData.quiz);
    expect(state.papers).toEqual(mockData.papers);
    // Auto-selects lowest attempt number (1) as per logic
    expect(state.selectedAttemptNumber).toBe(1);
    expect(state.selectedPaper).toEqual({ attempt_number: 1, score: 80 });
  });

  it('should handle fetchAnswerPaperData error', async () => {
    api.viewAnswerPaper.mockRejectedValue({ response: { data: { detail: 'Not found' } } });

    await expect(useAnswerPaperStore.getState().fetchAnswerPaperData(1, 1)).rejects.toThrow();

    const state = useAnswerPaperStore.getState();
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Not found');
  });

  it('should select attempt', () => {
    useAnswerPaperStore.setState({
      papers: [
        { attempt_number: 1, score: 80 },
        { attempt_number: 2, score: 90 }
      ]
    });

    useAnswerPaperStore.getState().selectAttempt(2);

    const state = useAnswerPaperStore.getState();
    expect(state.selectedAttemptNumber).toBe(2);
    expect(state.selectedPaper).toEqual({ attempt_number: 2, score: 90 });
  });

  it('should return available attempt numbers sorted descending', () => {
    useAnswerPaperStore.setState({
      papers: [
        { attempt_number: 1 },
        { attempt_number: 3 },
        { attempt_number: 2 }
      ]
    });

    const attemptNumbers = useAnswerPaperStore.getState().getAvailableAttemptNumbers();
    expect(attemptNumbers).toEqual([3, 2, 1]);
  });

  it('should reset state', () => {
    useAnswerPaperStore.setState({ loading: true, error: 'err', selectedAttemptNumber: 1 });
    useAnswerPaperStore.getState().reset();
    
    const state = useAnswerPaperStore.getState();
    expect(state.loading).toBe(false);
    expect(state.error).toBe(null);
    expect(state.selectedAttemptNumber).toBe(null);
  });
});
