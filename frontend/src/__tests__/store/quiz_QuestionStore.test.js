import useQuizStore from '../../store/quiz_QuestionStore';
import * as api from '../../api/api';

vi.mock('../../api/api');

describe('quiz_QuestionStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useQuizStore.getState().resetQuiz();
  });

  it('should set quiz params', () => {
    useQuizStore.getState().setQuizParams({ questionpaperId: 1, moduleId: 2, courseId: 3, attemptNum: 4 });
    
    expect(useQuizStore.getState().questionpaperId).toBe(1);
    expect(useQuizStore.getState().moduleId).toBe(2);
  });

  it('should get quiz intro', async () => {
    api.apiStartQuiz.mockResolvedValue({ intro: 'hello' });
    
    await useQuizStore.getState().getQuizIntro(1, 1, 1, 1);
    
    expect(useQuizStore.getState().quizIntro).toEqual({ intro: 'hello' });
  });

  it('should start quiz', async () => {
    api.apiStartQuiz.mockResolvedValue({ current_question: { id: 1 }, answerpaper_id: 1, attempt_number: 1 });
    
    await useQuizStore.getState().startQuiz(1, 1, 1, 1);
    
    expect(useQuizStore.getState().currentQuestion).toEqual({ id: 1 });
    expect(useQuizStore.getState().paper.id).toBe(1);
  });

  it('should test question', async () => {
    api.testQuestion.mockResolvedValue({ current_question: { id: 2 }, answerpaper_id: 2 });
    
    await useQuizStore.getState().testQuestion(1);
    
    expect(useQuizStore.getState().currentQuestion).toEqual({ id: 2 });
  });

  it('should complete quiz', async () => {
    api.apiCompleteQuiz.mockResolvedValue({ result: 'done' });
    
    await useQuizStore.getState().completeQuiz();
    
    expect(useQuizStore.getState().quizResult).toEqual({ result: 'done' });
  });
});
