import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useForumCategories, useForumTopics, useForumActions } from '../useForum';
import { supabase } from '../../lib/supabase';

describe('useForum hooks', () => {
  describe('useForumCategories', () => {
    it('should fetch categories', async () => {
      const { result } = renderHook(() => useForumCategories());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.categories).toHaveLength(1);
      expect(result.current.categories[0].name).toBe('Test Category');
    });

    it('should handle errors', async () => {
      vi.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        select: () => Promise.reject(new Error('Test error'))
      }));

      const { result } = renderHook(() => useForumCategories());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('useForumTopics', () => {
    it('should fetch topics', async () => {
      const { result } = renderHook(() => useForumTopics('1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.topics).toHaveLength(1);
      expect(result.current.topics[0].title).toBe('Test Topic');
    });
  });

  describe('useForumActions', () => {
    it('should create a topic with attachments', async () => {
      const { result } = renderHook(() => useForumActions());

      const mockTopic = {
        id: '1',
        title: 'New Topic',
        content: 'Content'
      };

      vi.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: mockTopic })
          })
        })
      }));

      const attachments = [{
        url: 'test.jpg',
        name: 'test.jpg',
        size: 1000,
        type: 'image/jpeg'
      }];

      await result.current.createTopic('1', 'New Topic', 'Content', [], attachments);

      expect(supabase.from).toHaveBeenCalledWith('forum_topics');
      expect(supabase.from).toHaveBeenCalledWith('forum_attachments');
    });
  });
});