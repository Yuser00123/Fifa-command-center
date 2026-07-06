import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock window.matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock motion/react for instant transitions in test environment
vi.mock('motion/react', () => ({
  motion: {
    div: React.forwardRef(({ children, initial, animate, exit, transition, ...props }: any, ref: any) => (
      React.createElement('div', { ref, ...props }, children)
    )),
    span: React.forwardRef(({ children, initial, animate, exit, transition, ...props }: any, ref: any) => (
      React.createElement('span', { ref, ...props }, children)
    )),
  },
  AnimatePresence: ({ children }: any) => children,
}));
