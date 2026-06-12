import useRegradingStore from '../../store/quizRegradeStore';
import * as api from '../../api/api';

vi.mock('../../api/api');

describe('quizRegradeStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useRegradingStore.getState().reset();
  });

  it('should regrade by quiz', async () => {
    api.regradePaperByQuiz.mockResolvedValue({ message: 'Success' });

    await useRegradingStore.getState().regradeByQuiz(1, 1, 1);

    expect(useRegradingStore.getState().result).toEqual({ message: 'Success' });
  });

  it('should regrade by user', async () => {
    api.regradePaperByUser.mockResolvedValue({ message: 'Success' });

    await useRegradingStore.getState().regradeByUser(1, 1, 1);

    expect(useRegradingStore.getState().result).toEqual({ message: 'Success' });
  });

  it('should regrade by question', async () => {
    api.regradePaperByQuestion.mockResolvedValue({ message: 'Success' });

    await useRegradingStore.getState().regradeByQuestion(1, 1, 1, 1);

    expect(useRegradingStore.getState().result).toEqual({ message: 'Success' });
  });

  it('should reset state', () => {
    useRegradingStore.setState({ loading: true, error: 'err', result: 'res' });
    useRegradingStore.getState().reset();
    expect(useRegradingStore.getState().error).toBe(null);
  });
});
