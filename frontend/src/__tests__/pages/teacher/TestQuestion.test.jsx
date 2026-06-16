import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import TestQuestion from '../../../pages/teacher/TestQuestion';
import useQuizStore from '../../../store/quiz_QuestionStore';

vi.mock('../../../store/quiz_QuestionStore', () => ({
    default: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useParams: () => ({ questionpaperId: '1', moduleId: '2', courseId: '3' }),
        useNavigate: () => mockNavigate,
    };
});

describe('TestQuestion Component', () => {
    const mockStartQuiz = vi.fn();
    const mockSubmitAnswer = vi.fn();
    const mockCompleteQuiz = vi.fn();
    const mockQuitQuiz = vi.fn();
    const mockUpdateLeft = vi.fn();
    const mockResetQuiz = vi.fn();
    const mockClearError = vi.fn();

    beforeEach(() => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        vi.clearAllMocks();

        useQuizStore.mockReturnValue({
            currentQuestion: null,
            paper: null,
            loading: false,
            error: null,
            answerResult: null,
            timeLeft: 600,
            attemptNum: 1,
            startQuiz: mockStartQuiz,
            submitAnswer: mockSubmitAnswer,
            completeQuiz: mockCompleteQuiz,
            quitQuiz: mockQuitQuiz,
            updateTimeLeft: mockUpdateLeft,
            resetQuiz: mockResetQuiz,
            clearError: mockClearError,
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const renderComponent = () => {
        return render(
            <BrowserRouter>
                <TestQuestion />
            </BrowserRouter>
        );
    };

    it('renders loading state when loading', () => {
        useQuizStore.mockReturnValue({
            ...useQuizStore(),
            loading: true,
        });
        renderComponent();
        expect(screen.getByText('Initializing test mode...')).toBeInTheDocument();
    });

    it('renders error state', () => {
        useQuizStore.mockReturnValue({
            ...useQuizStore(),
            error: 'Test Error',
        });
        renderComponent();
        expect(screen.getByText('Test Error')).toBeInTheDocument();
    });

    it('renders integer question and submits', async () => {
        useQuizStore.mockReturnValue({
            ...useQuizStore(),
            currentQuestion: { id: 101, description: 'What is 2+2?', type: 'integer', points: 5 },
            paper: { name: 'Test Paper' }
        });

        mockSubmitAnswer.mockResolvedValueOnce({ next_question: null });

        renderComponent();

        const input = screen.getByPlaceholderText('e.g., 42');
        fireEvent.change(input, { target: { value: '4' } });

        const submitBtn = screen.getByRole('button', { name: /Check Answer/i });
        fireEvent.click(submitBtn);
        
        await waitFor(() => {
            expect(mockSubmitAnswer).toHaveBeenCalledWith(101, { answer: 4 });
        });
    });

    it('renders float question and submits', async () => {
        useQuizStore.mockReturnValue({
            ...useQuizStore(),
            currentQuestion: { id: 102, description: 'Float?', type: 'float', points: 5 },
        });

        mockSubmitAnswer.mockResolvedValueOnce({ next_question: null });

        renderComponent();

        const input = screen.getByPlaceholderText('e.g., 3.14159');
        fireEvent.change(input, { target: { value: '4.5' } });

        const submitBtn = screen.getByRole('button', { name: /Check Answer/i });
        fireEvent.click(submitBtn);
        
        await waitFor(() => {
            expect(mockSubmitAnswer).toHaveBeenCalledWith(102, { answer: 4.5 });
        });
    });

    it('renders mcq question and submits', async () => {
        useQuizStore.mockReturnValue({
            ...useQuizStore(),
            currentQuestion: { 
                id: 103, type: 'mcq', description: 'MCQ Test', 
                test_cases: [{ options: ['A', 'B', 'C'] }] 
            },
        });

        mockSubmitAnswer.mockResolvedValueOnce({ next_question: null });
        renderComponent();
        
        const optionB = screen.getByLabelText('B');
        fireEvent.click(optionB);

        const submitBtn = screen.getByRole('button', { name: /Check Answer/i });
        fireEvent.click(submitBtn);
        
        await waitFor(() => {
            expect(mockSubmitAnswer).toHaveBeenCalledWith(103, { answer: 'B' });
        });
    });

    it('handles completing test', async () => {
        useQuizStore.mockReturnValue({
            ...useQuizStore(),
            currentQuestion: { id: 101, description: 'Test', type: 'string' },
        });
        
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

        renderComponent();

        const finishBtn = screen.getByRole('button', { name: /Complete Test/i });
        fireEvent.click(finishBtn);

        await waitFor(() => {
            expect(mockCompleteQuiz).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/teacher/questions');
        });

        confirmSpy.mockRestore();
        alertSpy.mockRestore();
    });

    it('handles quitting test', async () => {
        useQuizStore.mockReturnValue({
            ...useQuizStore(),
            currentQuestion: { id: 101, description: 'Test', type: 'string' },
        });
        
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

        renderComponent();

        const quitBtn = screen.getByRole('button', { name: /Quit/i });
        fireEvent.click(quitBtn);

        await waitFor(() => {
            expect(mockQuitQuiz).toHaveBeenCalledWith('User quit test');
            expect(mockNavigate).toHaveBeenCalledWith('/teacher/questions');
        });

        confirmSpy.mockRestore();
    });
});