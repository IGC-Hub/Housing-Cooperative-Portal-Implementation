export type UserRole = 'member' | 'board' | 'committee' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  unit?: string;
  phone?: string;
  created_at: string;
}

export interface Document {
  id: string;
  title: string;
  description: string;
  url: string;
  category: 'regulations' | 'contracts' | 'policies' | 'minutes' | 'reports' | 'other';
  type: 'official' | 'signed' | 'template' | 'form';
  version: string;
  status: 'draft' | 'active' | 'archived';
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  requires_signature?: boolean;
  signed_by?: string[];
  metadata?: {
    previous_version?: string;
    expiration_date?: string;
    approval_date?: string;
    approved_by?: string;
  };
}

export interface Form {
  id: string;
  title: string;
  description: string;
  type: 'board_application' | 'committee_application' | 'absence_request' | 'improvement_proposal' | 'evaluation';
  status: 'draft' | 'active' | 'archived';
  anonymous: boolean;
  fields: FormField[];
  created_at: string;
  created_by: string;
  deadline?: string;
  metadata?: {
    target_role?: UserRole;
    required_approval?: boolean;
    auto_notification?: boolean;
  };
}

export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'file' | 'signature';
  label: string;
  required: boolean;
  options?: string[];
  validation?: {
    min_length?: number;
    max_length?: number;
    pattern?: string;
    file_types?: string[];
    max_size?: number;
  };
}

export interface FormSubmission {
  id: string;
  form_id: string;
  submitted_by: string;
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
  responses: {
    field_id: string;
    value: string | string[];
  }[];
  files?: {
    field_id: string;
    file_url: string;
    file_name: string;
  }[];
  reviewed_by?: string;
  reviewed_at?: string;
  comments?: string;
}

export type AnnouncementPriority = 'urgent' | 'high' | 'medium' | 'low';
export type AnnouncementCategory = 'maintenance' | 'security' | 'event' | 'task' | 'other';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  category: AnnouncementCategory;
  created_at: string;
  created_by: string;
  expires_at?: string;
  target_audience?: UserRole[];
  acknowledgment_required?: boolean;
  acknowledged_by?: string[];
}

export interface FAQCategory {
  id: string;
  name: string;
  description: string;
  order: number;
}

export interface FAQItem {
  id: string;
  category_id: string;
  question: string;
  answer: string;
  created_at: string;
  updated_at: string;
  updated_by: string;
  status: 'published' | 'pending' | 'archived';
  votes: number;
  tags: string[];
}

export interface FAQSuggestion {
  id: string;
  question: string;
  context: string;
  submitted_by: string;
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  comments?: string;
}

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  order: number;
  moderators: string[];
  rules?: string[];
}

export interface ForumAttachment {
  id: string;
  topic_id?: string;
  reply_id?: string;
  url: string;
  name: string;
  size: number;
  type: string;
  created_at: string;
  created_by: string;
}

export interface ForumTopic {
  id: string;
  category_id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  status: 'open' | 'closed' | 'locked';
  pinned: boolean;
  views: number;
  last_reply_at?: string;
  last_reply_by?: string;
  tags: string[];
  attachments?: ForumAttachment[];
}

export interface ForumReply {
  id: string;
  topic_id: string;
  content: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
  edited_by?: string;
  status: 'active' | 'hidden' | 'deleted';
  parent_id?: string;
  likes: number;
  liked_by: string[];
  attachments?: ForumAttachment[];
}