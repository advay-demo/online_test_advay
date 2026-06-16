import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AddQuestion from '../../../pages/teacher/AddQuestion';
import useQuestionsStore from '../../../store/questionsStore';

// Mock the store
vi.mock('../../../store/questionsStore', () => ({
    default: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal();
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

    const renderComponent = () => {
        return render(
            <BrowserRouter>
                <AddQuestion />
            </BrowserRouter>
        );
    };

    it('renders the initial form elements', () => {
        renderComponent();
        expect(screen.getByText('Create New Question')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter question summary')).toBeInTheDocument();
        expect(screen.getByText('Type')).toBeInTheDocument();
    });

    it('updates form fields when typed into', () => {
        const { container } = renderComponent();
        const summaryInput = screen.getByPlaceholderText('Enter question summary');
        fireEvent.change(summaryInput, { target: { value: 'New Test Question' } });
        expect(summaryInput.value).toBe('New Test Question');

        const descriptionInput = screen.getByPlaceholderText('Enter question description');
        fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
        expect(descriptionInput.value).toBe('Test Description');

        const typeSelect = container.querySelector('select[name="type"]');
        fireEvent.change(typeSelect, { target: { value: 'mcq' } });
        expect(typeSelect.value).toBe('mcq');
    });

    it('adds and removes test cases based on selected type', async () => {
        const { container } = renderComponent();
        
        // Select 'integer' type first so the test case structure is simpler
        const typeSelect = container.querySelector('select[name="type"]');
        fireEvent.change(typeSelect, { target: { value: 'integer' } });

        // Click Add Test Case
        const addBtn = screen.getByRole('button', { name: /Add Test Case/i });
        fireEvent.click(addBtn);

        // Verify test case was added
        await waitFor(() => {
            expect(screen.getByText('Test Case 1')).toBeInTheDocument();
        });

        // Click Remove Test Case (trash icon)
        // Find the specific trash icon for the test case
        const trashIcons = screen.getAllByRole('button').filter(btn => btn.className.includes('text-red-400'));
        fireEvent.click(trashIcons[0]);

        await waitFor(() => {
            expect(screen.queryByText('Test Case 1')).not.toBeInTheDocument();
        });
    });

    it('submits the form and navigates on success', async () => {
        mockCreateQuestion.mockResolvedValueOnce({ id: 123 });
        const { container } = renderComponent();

        // Fill out required fields
        fireEvent.change(screen.getByPlaceholderText('Enter question summary'), { target: { value: 'Test Q' } });
        
        const typeSelect = container.querySelector('select[name="type"]');
        fireEvent.change(typeSelect, { target: { value: 'string' } });

        // Submit form
        const form = container.querySelector('form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(mockCreateQuestion).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/teacher/questions');
        });
    });

    it('displays error if submission fails', async () => {
        mockCreateQuestion.mockRejectedValueOnce({ response: { data: { error: 'Failed to save' } } });
        const { container } = renderComponent();

        fireEvent.change(screen.getByPlaceholderText('Enter question summary'), { target: { value: 'Test Q' } });
        const typeSelect = container.querySelector('select[name="type"]');
        fireEvent.change(typeSelect, { target: { value: 'string' } });

        const form = container.querySelector('form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getByText('Failed to save')).toBeInTheDocument();
        });
    });

    it('handles file selection and upload', async () => {
        mockCreateQuestion.mockResolvedValueOnce({ id: 123 });
        mockUploadQuestionFile.mockResolvedValueOnce({});
        
        const { container } = renderComponent();

        const fileInput = document.querySelector('input[type="file"]');
        
        // Mock a file
        const file = new File(['hello'], 'hello.png', { type: 'image/png' });
        
        // Add file
        Object.defineProperty(fileInput, 'files', {
            value: [file]
        });
        fireEvent.change(fileInput);

        await waitFor(() => {
            expect(screen.getByText('hello.png')).toBeInTheDocument();
        });

        // Submit form with file
        fireEvent.change(screen.getByPlaceholderText('Enter question summary'), { target: { value: 'Test Q' } });
        const typeSelect = container.querySelector('select[name="type"]');
        fireEvent.change(typeSelect, { target: { value: 'string' } });

        const form = container.querySelector('form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(mockCreateQuestion).toHaveBeenCalled();
            expect(mockUploadQuestionFile).toHaveBeenCalledWith(123, expect.any(File));
        });
    });
});
