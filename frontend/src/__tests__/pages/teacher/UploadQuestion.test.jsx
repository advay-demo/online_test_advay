import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UploadQuestion from '../../../pages/teacher/UploadQuestion';
import useQuestionsStore from '../../../store/questionsStore';

vi.mock('../../../store/questionsStore', () => ({
  default: vi.fn(),
}));

vi.mock('../../../components/layout/TeacherSidebar', () => ({ default: () => <div data-testid="sidebar">Sidebar</div> }));
vi.mock('../../../components/layout/Header', () => ({ default: () => <div data-testid="header">Header</div> }));
vi.mock('../../../components/teacher/QuestionActionButtons', () => ({ default: () => <div data-testid="action-buttons">ActionButtons</div> }));

describe('UploadQuestion Component', () => {
  const mockBulkUploadQuestions = vi.fn();
  const mockDownloadQuestionTemplate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useQuestionsStore.mockReturnValue({
      bulkUploadQuestions: mockBulkUploadQuestions,
      downloadQuestionTemplate: mockDownloadQuestionTemplate,
      loading: false,
      uploadProgress: null,
      error: null,
    });
  });

  const renderComponent = () => {
    render(
      <BrowserRouter>
        <UploadQuestion />
      </BrowserRouter>
    );
  };

    it('renders initial state', () => {
    renderComponent();
    expect(screen.getByRole('heading', { name: 'Upload Questions' })).toBeInTheDocument();
    expect(screen.getByText('Upload Instructions')).toBeInTheDocument();
  });

  it('handles template download', () => {
    renderComponent();
    const downloadBtn = screen.getByRole('button', { name: /Download Template/i });
    fireEvent.click(downloadBtn);
    expect(mockDownloadQuestionTemplate).toHaveBeenCalled();
  });

  it('shows error for invalid file type', () => {
    renderComponent();
    
    // Simulate file input with invalid extension
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = document.getElementById('file-upload');
    Object.defineProperty(input, 'files', { value: [file] });
    
    fireEvent.change(input);
    
    expect(screen.getByText('Please select a valid file (.zip, .yaml, or .yml)')).toBeInTheDocument();
  });

  it('accepts valid yaml file', () => {
    renderComponent();
    
    const file = new File(['content'], 'test.yaml', { type: 'text/yaml' });
    const input = document.getElementById('file-upload');
    Object.defineProperty(input, 'files', { value: [file] });
    
    fireEvent.change(input);
    
    expect(screen.getByText('test.yaml')).toBeInTheDocument();
    
    const uploadBtn = screen.getByRole('button', { name: /Upload Questions/i });
    expect(uploadBtn).not.toBeDisabled();
    
    fireEvent.click(uploadBtn);
    expect(mockBulkUploadQuestions).toHaveBeenCalledWith(file);
  });
});