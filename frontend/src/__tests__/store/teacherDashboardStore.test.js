import { useTeacherDashboardStore } from '../../store/teacherDashboardStore';
import * as api from '../../api/api';

vi.mock('../../api/api');

describe('teacherDashboardStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTeacherDashboardStore.setState({ dashboardData: null, loading: false, error: null, message: null, errorDetails: null });
  });

  it('should load dashboard', async () => {
    const mockData = { courses: [] };
    api.fetchTeacherDashboard.mockResolvedValue(mockData);

    await useTeacherDashboardStore.getState().loadDashboard();

    expect(useTeacherDashboardStore.getState().dashboardData).toEqual(mockData);
  });

  it('should handle load dashboard error', async () => {
    api.fetchTeacherDashboard.mockRejectedValue({ response: { data: { error: 'Failed' } } });

    await useTeacherDashboardStore.getState().loadDashboard();

    expect(useTeacherDashboardStore.getState().error).toBe('Failed');
  });

  it('should create demo course', async () => {
    api.createDemoCourse.mockResolvedValue({ message: 'Success' });

    const result = await useTeacherDashboardStore.getState().createDemoCourse();

    expect(result).toEqual({ message: 'Success' });
    expect(useTeacherDashboardStore.getState().message).toBe('Success');
  });

  it('should handle create demo course error', async () => {
    api.createDemoCourse.mockRejectedValue(new Error('err'));

    const result = await useTeacherDashboardStore.getState().createDemoCourse();

    expect(result).toBe(null);
    expect(useTeacherDashboardStore.getState().error).toBe('Failed to create demo course');
  });

  it('should clear message', () => {
    useTeacherDashboardStore.setState({ message: 'msg' });
    useTeacherDashboardStore.getState().clearMessage();
    expect(useTeacherDashboardStore.getState().message).toBe(null);
  });
});
