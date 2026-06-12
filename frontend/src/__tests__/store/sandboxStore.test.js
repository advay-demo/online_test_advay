import { useSandboxStore } from '../../store/sandboxStore';
import * as api from '../../api/api';

vi.mock('../../api/api');

const mockNavigate = vi.fn();

describe('sandboxStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSandboxStore.setState({ isGenerating: false, error: null });
  });

  it('should generate test sandbox and navigate', async () => {
    api.testQuiz.mockResolvedValue({ trial_course_id: 1, trial_quiz_id: 2 });
    
    await useSandboxStore.getState().generateTestSandbox('godmode', 1, 1, mockNavigate);
    
    expect(mockNavigate).toHaveBeenCalledWith('/courses/1/quizzes/2');
    expect(useSandboxStore.getState().isGenerating).toBe(false);
  });

  it('should handle missing sandbox IDs', async () => {
    api.testQuiz.mockResolvedValue({});
    
    await useSandboxStore.getState().generateTestSandbox('godmode', 1, 1, mockNavigate);
    
    expect(useSandboxStore.getState().error).toBe('Invalid API response: Missing sandbox IDs.');
  });

  it('should handle API errors', async () => {
    // Mock alert
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    api.testQuiz.mockRejectedValue({ response: { data: { error: 'Failed' } } });
    
    await useSandboxStore.getState().generateTestSandbox('godmode', 1, 1, mockNavigate);
    
    expect(useSandboxStore.getState().error).toBe('Failed');
  });

  it('should clear error', () => {
    useSandboxStore.setState({ error: 'err' });
    useSandboxStore.getState().clearError();
    expect(useSandboxStore.getState().error).toBe(null);
  });
});
