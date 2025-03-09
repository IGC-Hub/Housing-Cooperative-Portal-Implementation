import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { ForumCategory, ForumTopic, ForumReply } from '../types';

export function useForumCategories() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        const { data, error } = await supabase
          .from('forum_categories')
          .select('*')
          .order('order_position');

        if (error) throw error;
        setCategories(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load categories'));
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  return { categories, loading, error };
}

export function useForumTopics(categoryId?: string) {
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadTopics() {
      try {
        let query = supabase
          .from('forum_topics')
          .select(`
            *,
            category:forum_categories(name),
            created_by:users(firstName, lastName),
            last_reply_by:users(firstName, lastName),
            replies:forum_replies(count)
          `)
          .order('pinned', { ascending: false })
          .order('last_reply_at', { ascending: false });

        if (categoryId) {
          query = query.eq('category_id', categoryId);
        }

        const { data, error } = await query;

        if (error) throw error;
        setTopics(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load topics'));
      } finally {
        setLoading(false);
      }
    }

    loadTopics();
  }, [categoryId]);

  return { topics, loading, error };
}

export function useForumReplies(topicId: string) {
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadReplies() {
      try {
        const { data, error } = await supabase
          .from('forum_replies')
          .select(`
            *,
            created_by:users(firstName, lastName),
            edited_by:users(firstName, lastName)
          `)
          .eq('topic_id', topicId)
          .order('created_at');

        if (error) throw error;
        setReplies(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load replies'));
      } finally {
        setLoading(false);
      }
    }

    loadReplies();

    // Subscribe to new replies
    const subscription = supabase
      .channel(`topic:${topicId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'forum_replies',
        filter: `topic_id=eq.${topicId}`
      }, (payload) => {
        setReplies(current => [...current, payload.new as ForumReply]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [topicId]);

  return { replies, loading, error };
}

export function useForumActions() {
  const createTopic = async (
    categoryId: string,
    title: string,
    content: string,
    tags: string[] = [],
    attachments: Array<{ url: string; name: string; size: number; type: string }> = []
  ) => {
    const { data: topic, error: topicError } = await supabase
      .from('forum_topics')
      .insert({
        category_id: categoryId,
        title,
        content,
        tags
      })
      .select()
      .single();

    if (topicError) throw topicError;

    if (attachments.length > 0) {
      const { error: attachmentsError } = await supabase
        .from('forum_attachments')
        .insert(
          attachments.map(attachment => ({
            topic_id: topic.id,
            ...attachment
          }))
        );

      if (attachmentsError) throw attachmentsError;
    }

    return topic;
  };

  const createReply = async (
    topicId: string,
    content: string,
    parentId?: string,
    attachments: Array<{ url: string; name: string; size: number; type: string }> = []
  ) => {
    const { data: reply, error: replyError } = await supabase
      .from('forum_replies')
      .insert({
        topic_id: topicId,
        content,
        parent_id: parentId
      })
      .select()
      .single();

    if (replyError) throw replyError;

    if (attachments.length > 0) {
      const { error: attachmentsError } = await supabase
        .from('forum_attachments')
        .insert(
          attachments.map(attachment => ({
            reply_id: reply.id,
            ...attachment
          }))
        );

      if (attachmentsError) throw attachmentsError;
    }

    return reply;
  };

  const reportContent = async (
    contentType: 'topic' | 'reply',
    contentId: string,
    reason: string
  ) => {
    const { data, error } = await supabase
      .from('forum_reports')
      .insert({
        content_type: contentType,
        content_id: contentId,
        reason
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  return { createTopic, createReply, reportContent };
}