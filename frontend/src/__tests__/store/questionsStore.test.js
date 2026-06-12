import useQuestionsStore from '../../store/questionsStore';
import * as api from '../../api/api';

vi.mock('../../api/api');

describe('questionsStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useQuestionsStore.setState({ questions: [], loading: false, error: null });
  });

  it('should load questions', async () => {
    api.fetchTeacherQuestions.mockResolvedValue([{ id: 1 }]);

    await useQuestionsStore.getState().loadQuestions();

    expect(useQuestionsStore.getState().questions).toEqual([{ id: 1 }]);
  });

  it('should get question', async () => {
    api.getTeacherQuestion.mockResolvedValue({ id: 1 });

    const result = await useQuestionsStore.getState().getQuestion(1);

    expect(result).toEqual({ id: 1 });
  });

  it('should delete question', async () => {
    api.deleteQuestion.mockResolvedValue();
    api.fetchTeacherQuestions.mockResolvedValue([]);

    await useQuestionsStore.getState().deleteQuestion(1);

    expect(api.deleteQuestion).toHaveBeenCalledWith(1);
  });

  it('should update question', async () => {
    api.updateQuestion.mockResolvedValue({ id: 1 });

    const result = await useQuestionsStore.getState().updateQuestion(1, {});

    expect(result).toEqual({ id: 1 });
  });

  it('should create question', async () => {
    api.createQuestion.mockResolvedValue({ id: 1 });

    const result = await useQuestionsStore.getState().createQuestion({});

    expect(result).toEqual({ id: 1 });
  });

  it('should delete file', async () => {
    api.deleteQuestionFile.mockResolvedValue({ id: 1 });

    const result = await useQuestionsStore.getState().deleteQuestionFile(1);

    expect(result).toEqual({ id: 1 });
  });

  it('should upload file', async () => {
    api.uploadQuestionFile.mockResolvedValue({ id: 1 });

    const result = await useQuestionsStore.getState().uploadQuestionFile(1, 'file');

    expect(result).toEqual({ id: 1 });
  });

  it('should bulk upload', async () => {
    api.bulkUploadQuestions.mockResolvedValue({ message: 'Upload ok' });
    api.fetchTeacherQuestions.mockResolvedValue([]);

    const result = await useQuestionsStore.getState().bulkUploadQuestions('file');

    expect(result).toEqual({ message: 'Upload ok' });
    expect(useQuestionsStore.getState().uploadProgress).toBe('Upload ok');
  });

  it('should download template', async () => {
    api.downloadQuestionTemplate.mockResolvedValue();

    await useQuestionsStore.getState().downloadQuestionTemplate();

    expect(api.downloadQuestionTemplate).toHaveBeenCalled();
  });
});
