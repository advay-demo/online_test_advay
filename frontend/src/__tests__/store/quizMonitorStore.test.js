import useMonitorStore from '../../store/quizMonitorStore';
import * as api from '../../api/api';

vi.mock('../../api/api');

describe('quizMonitorStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMonitorStore.getState().reset();
  });

  it('should monitor quiz', async () => {
    api.monitorQuizProgress.mockResolvedValue({ status: 'ok' });

    await useMonitorStore.getState().monitorQuiz(1, 1);

    expect(useMonitorStore.getState().result).toEqual({ status: 'ok' });
  });

  it('should fetch quiz statistics', async () => {
    api.getQuizStatistics.mockResolvedValue({ stats: 'ok' });

    await useMonitorStore.getState().fetchQuizStatistics(1, 1);

    expect(useMonitorStore.getState().result).toEqual({ stats: 'ok' });
  });

  it('should download csv', async () => {
    api.downloadQuizCSV.mockResolvedValue();

    await useMonitorStore.getState().downloadCSV(1, 1, 1);

    expect(api.downloadQuizCSV).toHaveBeenCalledWith(1, 1, 1);
  });

  it('should upload csv', async () => {
    api.uploadMarksCSV.mockResolvedValue();

    await useMonitorStore.getState().uploadCSV(1, 1, 'file');

    expect(api.uploadMarksCSV).toHaveBeenCalledWith(1, 1, 'file');
  });

  it('should fetch user data', async () => {
    api.getUserData.mockResolvedValue({ user: 'ok' });

    await useMonitorStore.getState().fetchUserData(1);

    expect(useMonitorStore.getState().result).toEqual({ user: 'ok' });
  });

  it('should extend time', async () => {
    api.extendAnswerPaperTime.mockResolvedValue({ time: 'ok' });

    await useMonitorStore.getState().extendTime(1, 10);

    expect(useMonitorStore.getState().result).toEqual({ time: 'ok' });
  });

  it('should allow special', async () => {
    api.allowSpecialAttempt.mockResolvedValue({ special: 'ok' });

    await useMonitorStore.getState().allowSpecial(1, 1, 1);

    expect(useMonitorStore.getState().result).toEqual({ special: 'ok' });
  });

  it('should start special', async () => {
    api.startSpecialAttempt.mockResolvedValue({ start: 'ok' });

    await useMonitorStore.getState().startSpecial(1);

    expect(useMonitorStore.getState().result).toEqual({ start: 'ok' });
  });

  it('should revoke special', async () => {
    api.revokeSpecialAttempt.mockResolvedValue({ revoke: 'ok' });

    await useMonitorStore.getState().revokeSpecial(1);

    expect(useMonitorStore.getState().result).toEqual({ revoke: 'ok' });
  });

  it('should handle errors gracefully', async () => {
    api.monitorQuizProgress.mockRejectedValue({ response: { data: { error: 'Failed' } } });

    await useMonitorStore.getState().monitorQuiz(1, 1);

    expect(useMonitorStore.getState().error).toBe('Failed');
  });
});
