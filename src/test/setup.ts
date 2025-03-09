import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Mock Supabase responses
export const handlers = [
  http.get('*/forum_categories*', () => {
    return HttpResponse.json({
      data: [
        {
          id: '1',
          name: 'Test Category',
          description: 'Test Description',
          order_position: 1
        }
      ]
    });
  }),

  http.get('*/forum_topics*', () => {
    return HttpResponse.json({
      data: [
        {
          id: '1',
          title: 'Test Topic',
          content: 'Test Content',
          category_id: '1',
          created_by: 'user-1',
          created_at: new Date().toISOString()
        }
      ]
    });
  })
];

const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

//  Close server after all tests
afterAll(() => server.close());

// Reset handlers after each test
afterEach(() => server.resetHandlers());