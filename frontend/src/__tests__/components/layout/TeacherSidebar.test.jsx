import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TeacherSidebar from '../../../components/layout/TeacherSidebar';

const mockLocation = { pathname: '/teacher/dashboard' };

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useLocation: () => mockLocation,
  };
});

describe('TeacherSidebar Component', () => {
  const renderComponent = () => {
    render(
      <BrowserRouter>
        <TeacherSidebar />
      </BrowserRouter>
    );
  };

  it('renders all teacher navigation items', () => {
    renderComponent();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Quizzes')).toBeInTheDocument();
    expect(screen.getByText('Courses')).toBeInTheDocument();
    expect(screen.getByText('Questions')).toBeInTheDocument();
  });

  it('highlights the active navigation item', () => {
    renderComponent();
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    
    expect(dashboardLink.className).toContain('bg-blue-600');
    expect(dashboardLink.className).toContain('text-white');
  });
});