import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import Insights from '../../../pages/student/Insights';

vi.mock('../../../components/layout/Sidebar', () => ({ default: () => <div data-testid="sidebar">Sidebar</div> }));
vi.mock('../../../components/layout/Header', () => ({ default: () => <div data-testid="header">Header</div> }));

describe('Student Insights Component', () => {
  const renderComponent = () => {
    render(
      <BrowserRouter>
        <Insights />
      </BrowserRouter>
    );
  };

  it('renders loading state initially', () => {
    renderComponent();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders insights data after loading', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Insights')).toBeInTheDocument();
    });

    expect(screen.getByText('Recently Earned Badges')).toBeInTheDocument();
    expect(screen.getByText('Your Next Target')).toBeInTheDocument();
    expect(screen.getByText('Locked Achievements')).toBeInTheDocument();
    
    expect(screen.getByText('Wizard')).toBeInTheDocument();
    expect(screen.getByText('Bird')).toBeInTheDocument();
  });
});