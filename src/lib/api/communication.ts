import { supabase } from '../supabase';
import type {
  Announcement,
  FAQItem,
  FAQCategory,
  FAQSuggestion,
  AnnouncementPriority,
  AnnouncementCategory
} from '../../types';

// Announcements
export async function getAnnouncements() {
  const { data, error } = await supabase
    .from('announcements')
    .select(`
      *,
      created_by:users(firstName, lastName),
      acknowledgments:announcement_acknowledgments(user_id)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createAnnouncement({
  title,
  content,
  priority,
  category,
  expiresAt,
  acknowledgmentRequired,
  targetAudience
}: {
  title: string;
  content: string;
  priority: AnnouncementPriority;
  category: AnnouncementCategory;
  expiresAt?: string;
  acknowledgmentRequired?: boolean;
  targetAudience?: string[];
}) {
  const { data, error } = await supabase
    .from('announcements')
    .insert({
      title,
      content,
      priority,
      category,
      expires_at: expiresAt,
      acknowledgment_required: acknowledgmentRequired,
      target_audience: targetAudience
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function acknowledgeAnnouncement(announcementId: string) {
  const { data, error } = await supabase
    .from('announcement_acknowledgments')
    .insert({
      announcement_id: announcementId
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// FAQ
export async function getFAQCategories() {
  const { data, error } = await supabase
    .from('faq_categories')
    .select('*')
    .order('order');

  if (error) throw error;
  return data;
}

export async function getFAQItems(categoryId?: string) {
  const query = supabase
    .from('faq_items')
    .select(`
      *,
      category:faq_categories(*),
      votes:faq_votes(vote_type)
    `)
    .eq('status', 'published');

  if (categoryId) {
    query.eq('category_id', categoryId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createFAQSuggestion({
  question,
  context
}: {
  question: string;
  context: string;
}) {
  const { data, error } = await supabase
    .from('faq_suggestions')
    .insert({
      question,
      context
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function voteFAQItem(itemId: string, voteType: 'up' | 'down') {
  const { error } = await supabase
    .from('faq_votes')
    .upsert({
      faq_item_id: itemId,
      vote_type: voteType
    }, {
      onConflict: 'faq_item_id,user_id'
    });

  if (error) throw error;

  // Recalculate votes
  const { data: votes, error: votesError } = await supabase
    .from('faq_votes')
    .select('vote_type')
    .eq('faq_item_id', itemId);

  if (votesError) throw votesError;

  const totalVotes = votes.reduce((acc, vote) => 
    acc + (vote.vote_type === 'up' ? 1 : -1), 0
  );

  const { error: updateError } = await supabase
    .from('faq_items')
    .update({ votes: totalVotes })
    .eq('id', itemId);

  if (updateError) throw updateError;
}