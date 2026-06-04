import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CourseActionButtons from '../../../components/student/CourseActionButtons';

describe('CourseActionButtons Component', () => {
  const renderComponent = (props = {}) => {
    render(
      <BrowserRouter>
        <CourseActionButtons {...props} />
      </BrowserRouter>
    );
  };

  it('renders all action buttons correctly', () => {
    renderComponent();
    expect(screen.getByText('Course Library')).toBeInTheDocument();
    expect(screen.getByText('Search New Course')).toBeInTheDocument();
  });

  it('highlights the active button based on props', () => {
    renderComponent({ activeButton: 'enrolled' });
    const libraryLink = screen.getByText('Course Library').closest('a');
    expect(libraryLink.className).toContain('bg-gradient-to-r');
  });
});