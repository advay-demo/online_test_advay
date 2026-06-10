import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AddQuestion from '../../../pages/teacher/AddQuestion';
import useQuestionsStore from '../../../store/questionsStore';

// Mock the components that might have complex internal states or API calls
vi.mock('../../../components/layout/TeacherSidebar', () => ({
  default: () => <div data-testid="teacher-sidebar">TeacherSidebar</div>
}));

vi.mock('../../../components/layout/Header', () => ({
  default: () => <div data-testid="header">Header</div>
}));

vi.mock('../../../components/teacher/QuestionActionButtons', () => ({
  default: () => <div data-testid="action-buttons">ActionButtons</div>
}));

// Mock the store
vi.mock('../../../store/questionsStore');

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('AddQuestion Component', () => {
  const mockCreateQuestion = vi.fn();
  const mockUploadQuestionFile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useQuestionsStore.mockReturnValue({
      createQuestion: mockCreateQuestion,
      uploadQuestionFile: mockUploadQuestionFile,
    });
  });

  it('renders correctly', () => {
    render(
      <BrowserRouter>
        <AddQuestion />
      </BrowserRouter>
    );

    expect(screen.getByTestId('teacher-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByText('Create New Question')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter question summary')).toBeInTheDocument();
  });

  it('updates form data on input change', () => {
    const { container } = render(
      <BrowserRouter>
        <AddQuestion />
      </BrowserRouter>
    );

    const summaryInput = screen.getByPlaceholderText('Enter question summary');
    fireEvent.change(summaryInput, { target: { value: 'New Summary' } });
    expect(summaryInput.value).toBe('New Summary');

    const pointsInput = container.querySelector('input[name="points"]');
    if (pointsInput) {
        fireEvent.change(pointsInput, { target: { value: '5' } });
        expect(pointsInput.value).toBe('5');
    }
  });

  it('adds and removes test cases based on selected type', () => {
    const { container } = render(
      <BrowserRouter>
        <AddQuestion />
      </BrowserRouter>
    );

    // Select type as 'code'
    const typeSelect = container.querySelector('select[name="type"]');
    fireEvent.change(typeSelect, { target: { value: 'code' } });

    // Add a test case
    const addTestCaseBtn = screen.getByText('Add Test Case');
    fireEvent.click(addTestCaseBtn);

    expect(screen.getByText('Test Case 1')).toBeInTheDocument();

    // Remove test case
    const deleteTestCaseBtns = container.querySelectorAll('button.opacity-0.group-hover\\:opacity-100');
    if(deleteTestCaseBtns.length > 0) {
        fireEvent.click(deleteTestCaseBtns[0]);
        expect(screen.queryByText('Test Case 1')).not.toBeInTheDocument();
    }
  });

  it('submits form data and navigates on success', async () => {
    mockCreateQuestion.mockResolvedValue({ id: 123 });

    const { container } = render(
      <BrowserRouter>
        <AddQuestion />
      </BrowserRouter>
    );

    // Fill required fields
    const summaryInput = screen.getByPlaceholderText('Enter question summary');
    fireEvent.change(summaryInput, { target: { value: 'Test Summary' } });

    const typeSelect = container.querySelector('select[name="type"]');
    fireEvent.change(typeSelect, { target: { value: 'mcq' } });

    // Submit form
    const form = container.querySelector('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockCreateQuestion).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/teacher/questions');
    });
  });

  it('handles submission errors', async () => {
    mockCreateQuestion.mockRejectedValue({ response: { data: { error: 'Failed to create' } } });

    const { container } = render(
      <BrowserRouter>
        <AddQuestion />
      </BrowserRouter>
    );

    const summaryInput = screen.getByPlaceholderText('Enter question summary');
    fireEvent.change(summaryInput, { target: { value: 'Test Summary' } });

    const form = container.querySelector('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Failed to create')).toBeInTheDocument();
    });
  });

  it('handles file selection', () => {
    const { container } = render(
      <BrowserRouter>
        <AddQuestion />
      </BrowserRouter>
    );

    const fileInput = container.querySelector('#file-upload');
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByText('Files to Upload')).toBeInTheDocument();
    expect(screen.getByText('hello.png')).toBeInTheDocument();
  });
});
