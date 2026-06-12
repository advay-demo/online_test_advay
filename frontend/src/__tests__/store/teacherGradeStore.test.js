import useGradingSystemStore from '../../store/teacherGradeStore';
import * as api from '../../api/api';

vi.mock('../../api/api');

describe('teacherGradeStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGradingSystemStore.setState({ gradingSystems: [], selected: null, loading: false, error: null });
  });

  it('should load grading systems', async () => {
    const mockData = [{ id: 1 }];
    api.fetchGradingSystems.mockResolvedValue(mockData);

    await useGradingSystemStore.getState().loadGradingSystems();

    expect(useGradingSystemStore.getState().gradingSystems).toEqual(mockData);
  });

  it('should add grading system', async () => {
    api.createGradingSystem.mockResolvedValue({});
    api.fetchGradingSystems.mockResolvedValue([{ id: 1 }]);

    await useGradingSystemStore.getState().addGradingSystem({ name: 'System 1' });

    expect(useGradingSystemStore.getState().gradingSystems).toEqual([{ id: 1 }]);
  });

  it('should update grading system', async () => {
    api.updateGradingSystem.mockResolvedValue({});
    api.fetchGradingSystems.mockResolvedValue([{ id: 1 }]);

    await useGradingSystemStore.getState().updateGradingSystem(1, { name: 'System 2' });

    expect(useGradingSystemStore.getState().gradingSystems).toEqual([{ id: 1 }]);
  });

  it('should delete grading system', async () => {
    api.deleteGradingSystem.mockResolvedValue({});
    api.fetchGradingSystems.mockResolvedValue([]);

    await useGradingSystemStore.getState().deleteGradingSystem(1);

    expect(useGradingSystemStore.getState().gradingSystems).toEqual([]);
  });

  it('should select and clear selected', () => {
    useGradingSystemStore.getState().select({ id: 1 });
    expect(useGradingSystemStore.getState().selected).toEqual({ id: 1 });

    useGradingSystemStore.getState().clearSelected();
    expect(useGradingSystemStore.getState().selected).toBe(null);
  });
});
