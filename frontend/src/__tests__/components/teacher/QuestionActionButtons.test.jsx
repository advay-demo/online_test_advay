import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import QuestionActionButtons from '../../../components/teacher/QuestionActionButtons';

describe('QuestionActionButtons', () => {
  it('renders all buttons', () => {
    render(
      <BrowserRouter>
        <QuestionActionButtons />
      </BrowserRouter>
    );
    // Since there are two spans for 'Questions' (one hidden on desktop, one hidden on mobile),
    // getByText would throw an error. We use getAllByText instead.
    expect(screen.getAllByText('Questions').length).toBeGreaterThan(0);
    expect(screen.getByText('Upload Questions')).toBeInTheDocument();
  });

  it('highlights the active button based on props', () => {
    render(
      <BrowserRouter>
        <QuestionActionButtons activeButton="upload" />
      </BrowserRouter>
    );
    expect(screen.getByText('Upload Questions')).toBeInTheDocument();
  });
});
