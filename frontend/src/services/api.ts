import { searchOfflineFaq } from './offlineFaq';
import {
  ChatMessage,
  CallbackRequest,
  KnowledgeSheet,
  DashboardStats,
  UnansweredQuestion,
  OrientationResult,
  AnalyticsTimelineResponse
} from '../types';

const API_BASE = '/api/v1';

export const api = {
  // Chat
  async sendMessage(
    sessionId: string,
    message: string,
    language: string = 'fr',
    profile: string = 'visiteur',
    channel: string = 'pwa'
  ): Promise<{
    messageId: string;
    reply: string;
    sources: any[];
    suggestions: string[];
    relevanceScore: number;
    latencyMs: number;
    intent: string;
    isOffline?: boolean;
  }> {
    try {
      const res = await fetch(`${API_BASE}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message,
          language,
          profile,
          channel
        })
      });
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      return {
        messageId: data.message_id,
        reply: data.reply,
        sources: data.sources || [],
        suggestions: data.suggestions || [],
        relevanceScore: data.relevance_score,
        latencyMs: data.latency_ms,
        intent: data.intent
      };
    } catch (err) {
      // Offline fallback mode (ENF-04)
      const offlineMatch = searchOfflineFaq(message, language);
      if (offlineMatch) {
        return {
          messageId: `offline-${Date.now()}`,
          reply: `[Mode hors-ligne] ${offlineMatch.answer}`,
          sources: [{ code: 'FAQ-LOCAL', title: offlineMatch.source, official_source: 'Cache PWA', sensitivity: 'normal' }],
          suggestions: language === 'en' ? ['What are the engineering tracks?', 'How to apply?'] : ['Quelles sont les filières ?', 'Comment postuler ?'],
          relevanceScore: 0.9,
          latencyMs: 5,
          intent: 'faq_offline',
          isOffline: true
        };
      }
      return {
        messageId: `offline-${Date.now()}`,
        reply: language === 'en'
          ? "You are currently offline. Please check your connection or visit the welcome desk at Building A."
          : "Tu sembles déconnecté d'Internet. Veuillez vérifier votre réseau ou vous adresser au stand d'accueil au Bâtiment A.",
        sources: [],
        suggestions: [],
        relevanceScore: 0.0,
        latencyMs: 0,
        intent: 'offline',
        isOffline: true
      };
    }
  },

  async submitFeedback(messageId: string, rating: 'up' | 'down', comment?: string) {
    try {
      await fetch(`${API_BASE}/chat/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: messageId, rating, comment })
      });
    } catch (e) {
      console.warn('Feedback could not be submitted', e);
    }
  },

  // Callbacks
  async submitCallback(payload: {
    visitor_name: string;
    contact_info: string;
    consent_given: boolean;
    parental_consent_confirmed?: boolean;
    interested_field?: string;
    profile?: string;
  }): Promise<CallbackRequest> {
    const res = await fetch(`${API_BASE}/callbacks/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Erreur lors de la soumission');
    }
    return res.json();
  },

  // Orientation
  async getOrientationQuestions(language: string = 'fr') {
    const res = await fetch(`${API_BASE}/orientation/questions?language=${language}`);
    return res.json();
  },

  async evaluateOrientation(answers: { question_id: number; selected_option: string }[], language: string = 'fr'): Promise<OrientationResult> {
    const res = await fetch(`${API_BASE}/orientation/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers, language })
    });
    return res.json();
  },

  // Auth
  async login(username: string, password: string): Promise<{ access_token: string; role: string; username: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Identifiants incorrects');
    }
    return res.json();
  },

  // Admin: Knowledge Sheets
  async getSheets(token: string): Promise<KnowledgeSheet[]> {
    const res = await fetch(`${API_BASE}/sheets/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  async createSheet(token: string, sheetData: any): Promise<KnowledgeSheet> {
    const res = await fetch(`${API_BASE}/sheets/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(sheetData)
    });
    if (!res.ok) throw new Error('Erreur de création de la fiche');
    return res.json();
  },

  async updateSheet(token: string, sheetId: string, sheetData: any): Promise<KnowledgeSheet> {
    const res = await fetch(`${API_BASE}/sheets/${sheetId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(sheetData)
    });
    if (!res.ok) throw new Error('Erreur de mise à jour');
    return res.json();
  },

  async validateSheet(token: string, sheetId: string): Promise<KnowledgeSheet> {
    const res = await fetch(`${API_BASE}/sheets/${sheetId}/validate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Validation impossible');
    return res.json();
  },

  async deleteSheet(token: string, sheetId: string) {
    const res = await fetch(`${API_BASE}/sheets/${sheetId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  // Admin: Analytics & Supervision
  async getDashboard(token: string): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  async getTimeline(token: string, period: string = '7d'): Promise<AnalyticsTimelineResponse> {
    const res = await fetch(`${API_BASE}/analytics/timeline?period=${period}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Erreur lors de la récupération des métriques');
    return res.json();
  },

  async getUnanswered(token: string): Promise<UnansweredQuestion[]> {
    const res = await fetch(`${API_BASE}/analytics/unanswered`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  async getCallbacks(token: string): Promise<CallbackRequest[]> {
    const res = await fetch(`${API_BASE}/callbacks/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  async updateCallbackStatus(token: string, id: string, newStatus: string) {
    const res = await fetch(`${API_BASE}/callbacks/${id}/status?new_status=${newStatus}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  async toggleEmergency(token: string, active: boolean) {
    const res = await fetch(`${API_BASE}/emergency/toggle?active=${active}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  }
};

