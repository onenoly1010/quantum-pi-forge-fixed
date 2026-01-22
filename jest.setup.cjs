require('@testing-library/jest-dom');

// Mock window.ethereum (MetaMask)
Object.defineProperty(window, 'ethereum', {
  writable: true,
  value: {
    request: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn(),
    isMetaMask: true,
  },
});

// Mock window.Pi (Pi Network SDK)
Object.defineProperty(window, 'Pi', {
  writable: true,
  value: null, // Will be set in individual tests
});

// Mock fetch for API tests
global.fetch = jest.fn();

// Mock console.error to keep test output clean
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
