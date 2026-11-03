export type UserRole = 'admin' | 'contributeur' | 'lecteur';

export interface SheetSource {
  code: string;
  title: string;
  official_source: string;
  validated_at?: string;
  sensitivity?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: SheetSource[];
  suggestions?: string[];
  relevance_score?: number;
  latency_ms?: number;
  created_at?: string;
  rating?: 'up' | 'down' | null;
}

export interface RecommendedTrack {
  field_code: string;
  title: string;
  match_score: number;
  justification: string;
  key_subjects: string[];
  careers: string[];
}

export interface OrientationResult {
  recommended_tracks: RecommendedTrack[];
  summary_advice: string;
}

export interface CallbackRequest {
  id: string;
  visitor_name: string;
  contact_info: string;
  consent_given: boolean;
  parental_consent_confirmed: boolean;
  interested_field?: string;
  profile: string;
  status: 'pending' | 'in_progress' | 'resolved';
  notes?: string;
  created_at: string;
}

export interface KnowledgeSheet {
  id: string;
  code: string;
  title: string;
  category: string;
  language: string;
  content: string;
  official_source: string;
  sensitivity: string;
  version: number;
  status: 'draft' | 'validated' | 'archived';
  validated_by?: string;
  validated_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_conversations: number;
  total_messages: number;
  positive_ratings: number;
  negative_ratings: number;
  satisfaction_rate: number;
  unanswered_count: number;
  pending_callbacks_count: number;
  top_categories: { category: string; count: number }[];
  emergency_active: boolean;
}

export interface UnansweredQuestion {
  id: string;
  user_text: string;
  reason: string;
  suggested_action?: string;
  status: 'pending' | 'reviewed' | 'sheet_created';
  created_at: string;
}

