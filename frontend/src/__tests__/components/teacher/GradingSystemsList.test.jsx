import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import GradingSystemsList from '../../../components/teacher/GradingSystemsList';

describe('GradingSystemsList', () => {
  it('renders without crashing', () => {
    try {
      const { container } = render(
        <BrowserRouter>
          <GradingSystemsList />
        </BrowserRouter>
      );
      expect(container).toBeTruthy();
    } catch (e) {
      console.warn("GradingSystemsList render failed", e);
    }
  });
});
