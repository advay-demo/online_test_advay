import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import GradingSystems from '../../../pages/teacher/GradingSystems';
import useGradingSystemStore from '../../../store/teacherGradeStore';

vi.mock('../../../store/teacherGradeStore', () => ({
  default: vi.fn(),
}));

vi.mock('../../../components/layout/TeacherSidebar', () => ({
  default: () => <div data-testid="teacher-sidebar">Sidebar</div>,
}));

vi.mock('../../../components/layout/Header', () => ({
  default: () => <div data-testid="header">Header</div>,
}));

vi.mock('../../../components/teacher/CourseActionButtons', () => ({
  default: () => <div data-testid="action-buttons">ActionButtons</div>,
}));

vi.mock('../../../components/teacher/AddGradingSystem', () => ({
  default: ({ onCancel, isEdit }) => (
    <div data-testid="add-grading-system">
      <p>{isEdit ? 'Edit Mode' : 'Add Mode'}</p>
      <button onClick={onCancel}>Cancel Add</button>
    </div>
  ),
}));

vi.mock('../../../components/teacher/GradingSystemDetail', () => ({
  default: ({ onBack }) => (
    <div data-testid="grading-system-detail">
      <button onClick={onBack}>Back to List</button>
    </div>
  ),
}));

describe('GradingSystems Component', () => {
  const mockLoadGradingSystems = vi.fn();
  const mockSelect = vi.fn();
  const mockClearSelected = vi.fn();
  const mockDeleteGradingSystem = vi.fn();

  const mockGradingSystems = [
    {
      id: 1,
      name: 'Standard Letter Grades',
      description: 'A-F grading scale',
      is_default: true,
      grade_ranges: [{ grade: 'A' }, { grade: 'B' }],
    },
    {
      id: 2,
      name: 'Pass/Fail',
      description: 'Simple pass or fail',
      is_default: false,
      grade_ranges: [{ grade: 'Pass' }, { grade: 'Fail' }],
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useGradingSystemStore.mockReturnValue({
      gradingSystems: mockGradingSystems,
      loadGradingSystems: mockLoadGradingSystems,
      loading: false,
      error: null,
      selected: null,
      select: mockSelect,
      clearSelected: mockClearSelected,
      deleteGradingSystem: mockDeleteGradingSystem,
    });
    
    // Mock window.confirm
    window.confirm = vi.fn(() => true);
  });

  const renderComponent = () => {
    render(
      <BrowserRouter>
        <GradingSystems />
      </BrowserRouter>
    );
  };

  it('renders loading state', () => {
    useGradingSystemStore.mockReturnValueOnce({
      loading: true,
      loadGradingSystems: mockLoadGradingSystems,
      gradingSystems: [],
    });
    
    renderComponent();
    expect(screen.getByTestId('teacher-sidebar')).toBeInTheDocument();
  });

  it('renders error state', () => {
    useGradingSystemStore.mockReturnValueOnce({
      loading: false,
      error: 'Failed to load grading systems',
      loadGradingSystems: mockLoadGradingSystems,
      gradingSystems: [],
    });
    
    renderComponent();
    expect(screen.getByText('Failed to load grading systems')).toBeInTheDocument();
  });

  it('renders list of grading systems', () => {
    renderComponent();
    
    expect(mockLoadGradingSystems).toHaveBeenCalled();
    expect(screen.getByText('Standard Letter Grades')).toBeInTheDocument();
    expect(screen.getByText('A-F grading scale')).toBeInTheDocument();
    expect(screen.getByText('Pass/Fail')).toBeInTheDocument();
    expect(screen.getByText('Default')).toBeInTheDocument(); // only on the first one
  });

  it('filters grading systems by search query', () => {
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText('Search grading systems...');
    fireEvent.change(searchInput, { target: { value: 'pass' } });
    
    expect(screen.queryByText('Standard Letter Grades')).not.toBeInTheDocument();
    expect(screen.getByText('Pass/Fail')).toBeInTheDocument();
  });

  it('switches to add mode', () => {
    renderComponent();
    
    // Desktop and mobile add buttons
    const addButtons = screen.getAllByRole('button');
    const addBtn = addButtons.find(btn => btn.textContent.includes('Add Grading System') || btn.textContent.includes('Add'));
    
    fireEvent.click(addBtn);
    
    expect(screen.getByTestId('add-grading-system')).toBeInTheDocument();
    expect(screen.getByText('Add Mode')).toBeInTheDocument();
    
    // Cancel add
    fireEvent.click(screen.getByText('Cancel Add'));
    expect(screen.queryByTestId('add-grading-system')).not.toBeInTheDocument();
  });

  it('switches to detail mode when manage is clicked', () => {
    useGradingSystemStore.mockReturnValue({
      gradingSystems: mockGradingSystems,
      loadGradingSystems: mockLoadGradingSystems,
      loading: false,
      error: null,
      selected: mockGradingSystems[0],
      select: mockSelect,
      clearSelected: mockClearSelected,
    });
    
    renderComponent();
    
    // Two manage buttons
    const manageBtns = screen.getAllByText('Manage');
    fireEvent.click(manageBtns[0]);
    
    expect(mockSelect).toHaveBeenCalledWith(mockGradingSystems[0]);
    expect(screen.getByTestId('grading-system-detail')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Back to List'));
    expect(mockClearSelected).toHaveBeenCalled();
  });

  it('opens action menu and handles edit', () => {
    useGradingSystemStore.mockReturnValue({
      gradingSystems: mockGradingSystems,
      loadGradingSystems: mockLoadGradingSystems,
      loading: false,
      selected: mockGradingSystems[0], // assume it's selected after edit click
      select: mockSelect,
    });

    renderComponent();
    
    // Click action menu for the first item
    const actionBtns = screen.getAllByLabelText('Actions');
    fireEvent.click(actionBtns[0]);
    
    const editBtn = screen.getByText('Edit');
    fireEvent.click(editBtn);
    
    expect(mockSelect).toHaveBeenCalledWith(mockGradingSystems[0]);
    expect(screen.getByTestId('add-grading-system')).toBeInTheDocument();
    expect(screen.getByText('Edit Mode')).toBeInTheDocument();
  });

  it('handles delete grading system', async () => {
    renderComponent();
    
    const actionBtns = screen.getAllByLabelText('Actions');
    fireEvent.click(actionBtns[0]);
    
    const deleteBtn = screen.getByText('Delete');
    fireEvent.click(deleteBtn);
    
    expect(window.confirm).toHaveBeenCalledWith('Delete grading system "Standard Letter Grades"?');
    expect(mockDeleteGradingSystem).toHaveBeenCalledWith(1);
    await waitFor(() => {
      expect(mockClearSelected).toHaveBeenCalled();
    });
  });
});
