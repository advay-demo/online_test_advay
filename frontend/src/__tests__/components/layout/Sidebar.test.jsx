import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../../../components/layout/Sidebar';

const mockLocation = { pathname: '/dashboard' };

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useLocation: () => mockLocation,
  };
});

describe('Sidebar Component', () => {
  const renderComponent = () => {
    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );
  };

  it('renders all navigation items', () => {
    renderComponent();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Courses')).toBeInTheDocument();
    expect(screen.getByText('Insights')).toBeInTheDocument();
  });

  it('highlights the active navigation item based on location', () => {
    renderComponent();
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink.className).toContain('bg-blue-600');
    expect(dashboardLink.className).toContain('text-white');
  });

  it('toggles mobile menu overlay when button is clicked', () => {
    renderComponent();
    const toggleButton = screen.getByLabelText('Open menu');
    fireEvent.click(toggleButton);

    const closeButtons = screen.getAllByRole('button').filter(b => b.className.includes('lg:hidden'));
    expect(closeButtons.length).toBeGreaterThan(0);
  });
});