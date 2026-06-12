import useCourseStore from '../../../store/student/courseStore';
import * as api from '../../../api/api';

vi.mock('../../../api/api');

describe('courseStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCourseStore.getState().resetStore();
  });

  it('should have initial state', () => {
    const state = useCourseStore.getState();
    expect(state.courses).toEqual([]);
    expect(state.newCourses).toEqual([]);
    expect(state.loading).toBe(false);
  });

  it('should fetch enrolled courses', async () => {
    const mockData = { courses: [{ id: 1, name: 'Course 1' }] };
    api.fetchCoursesList.mockResolvedValue(mockData);

    await useCourseStore.getState().fetchCourses();

    const state = useCourseStore.getState();
    expect(state.courses).toEqual(mockData.courses);
    expect(state.loading).toBe(false);
  });

  it('should search courses', async () => {
    const mockData = { courses: [{ id: 2, name: 'Course 2' }] };
    api.searchNewCourses.mockResolvedValue(mockData);

    await useCourseStore.getState().searchCourses('CODE');

    const state = useCourseStore.getState();
    expect(state.newCourses).toEqual(mockData.courses);
    expect(state.loading).toBe(false);
  });

  it('should fetch available courses', async () => {
    const mockData = { courses: [{ id: 3, name: 'Course 3' }] };
    api.fetchAvailableCourses.mockResolvedValue(mockData);

    await useCourseStore.getState().fetchAvailableCourses();

    const state = useCourseStore.getState();
    expect(state.newCourses).toEqual(mockData.courses);
  });

  it('should request enrollment', async () => {
    api.requestCourseEnrollment.mockResolvedValue({ message: 'Success' });

    const result = await useCourseStore.getState().requestEnrollment(1);

    const state = useCourseStore.getState();
    expect(result.success).toBe(true);
    expect(state.enrollmentSuccess).toBe('Success');
    expect(state.enrollmentLoading).toBe(false);
  });

  it('should handle request enrollment error', async () => {
    api.requestCourseEnrollment.mockRejectedValue({ response: { data: { error: 'Failed' } } });

    const result = await useCourseStore.getState().requestEnrollment(1);

    const state = useCourseStore.getState();
    expect(result.success).toBe(false);
    expect(state.enrollmentError).toBe('Failed');
    expect(state.enrollmentLoading).toBe(false);
  });

  it('should self enroll', async () => {
    api.selfEnrollInCourse.mockResolvedValue({ message: 'Enrolled' });

    const result = await useCourseStore.getState().selfEnroll(1);

    const state = useCourseStore.getState();
    expect(result.success).toBe(true);
    expect(state.enrollmentSuccess).toBe('Enrolled');
  });

  it('should clear search', () => {
    useCourseStore.setState({ newCourses: [{ id: 1 }] });
    useCourseStore.getState().clearSearch();
    expect(useCourseStore.getState().newCourses).toEqual([]);
  });

  it('should clear enrollment messages', () => {
    useCourseStore.setState({ enrollmentError: 'err', enrollmentSuccess: 'ok' });
    useCourseStore.getState().clearEnrollmentMessages();
    expect(useCourseStore.getState().enrollmentError).toBe(null);
    expect(useCourseStore.getState().enrollmentSuccess).toBe(null);
  });
});
