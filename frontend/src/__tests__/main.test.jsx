
// We need to mock react-dom/client
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn(),
  })),
}));

// We also should mock App so we don't accidentally render the whole app
vi.mock('../App.jsx', () => ({
  default: () => <div data-testid="app">App</div>
}));

describe('main.jsx', () => {
  beforeEach(() => {
    // Reset modules to ensure main.jsx runs on import
    vi.resetModules();
    
    // Set up document body with root element
    document.body.innerHTML = '<div id="root"></div>';
  });

  it('renders the App component inside root', async () => {
    const { createRoot } = await import('react-dom/client');
    
    // Dynamically import main.jsx so it executes
    await import('../main.jsx');
    
    expect(createRoot).toHaveBeenCalledWith(document.getElementById('root'));
    
    // Get the mock instance
    const mockRoot = createRoot.mock.results[0].value;
    expect(mockRoot.render).toHaveBeenCalled();
  });
});
