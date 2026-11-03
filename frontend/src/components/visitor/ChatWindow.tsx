import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  GraduationCap,
  User,
  ThumbsUp,
  ThumbsDown,
  FileText,
  ChevronDown,
  ChevronUp,
  Share2,
  PhoneCall,
  Loader2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Home,
  MessageSquare,
  Compass,
  Calendar,
  BookOpen,
  Settings,
  LogOut,
  ArrowRight
} from 'lucide-react';
import { ChatMessage } from '../../types';

interface ChatWindowProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onSendFeedback: (messageId: string, rating: 'up' | 'down', comment?: string) => void;
  onOpenCallback: () => void;
  onNavigateTab: (tab: 'home' | 'chat' | 'orientation' | 'jour_j' | 'apropos' | 'admin') => void;
  language: 'fr' | 'en';
  loading: boolean;
  suggestions: string[];
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  onSendMessage,
  onSendFeedback,
  onOpenCallback,
  onNavigateTab,
  language,
  loading,
  suggestions
}) => {
  const [inputText, setInputText] = useState('');
  const [expandedSources, setExpandedSources] = useState<{ [msgId: string]: boolean }>({});
  const [commentModalMsgId, setCommentModalMsgId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isEn = language === 'en';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || loading) return;
    onSendMessage(inputText.trim());
    setInputText('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const toggleSource = (msgId: string) => {
    setExpandedSources(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const handleFeedbackClick = (msgId: string, rating: 'up' | 'down') => {
    onSendFeedback(msgId, rating);
    if (rating === 'down') {
      setCommentModalMsgId(msgId);
    }
  };

  const submitComment = () => {
    if (commentModalMsgId) {
      onSendFeedback(commentModalMsgId, 'down', commentText);
      setCommentModalMsgId(null);
      setCommentText('');
    }
  };

  const handleExportSummary = () => {
    const text = messages
      .map(m => `[${m.role.toUpperCase()}] ${m.content}`)
      .join('\n\n---\n\n');
    const blob = new Blob([`Poly – ENSPD Résumé de l'échange\nDate : ${new Date().toLocaleDateString()}\n\n${text}`], {
      type: 'text/plain;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `poly-recapitulatif-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Mockup 02 prompt suggestions
  const initialSuggestions = isEn
    ? [
        "What engineering tracks are available?",
        "How do I apply for the entrance competition?",
        "What are the career opportunities?"
      ]
    : [
        "Quelles sont les filières disponibles ?",
        "Comment s'inscrire au concours ?",
        "Quels sont les débouchés après l'ENSPD ?"
      ];

  const activeSuggestions = suggestions.length > 0 ? suggestions : initialSuggestions;

  return (
    <div className="flex h-[calc(100vh-4.5rem)] bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* 02. Chat IA - Left Dark Sidebar (Matching Mockup 02. Chat IA) */}
      <aside className="w-56 bg-poly-sidebar text-slate-300 hidden md:flex flex-col justify-between p-4 shrink-0 border-r border-slate-800">
        <div className="space-y-6">
          {/* Logo badge in sidebar */}
          <div className="flex items-center gap-2.5 px-2">
            <img src="/images/enspd-logo.webp" alt="Logo" className="w-8 h-8 object-contain" />
            <div>
              <div className="text-white font-extrabold text-sm tracking-tight">ENSPD</div>
              <div className="text-[10px] text-poly-gold uppercase font-semibold">Tuteur Poly</div>
            </div>
          </div>

          {/* Navigation Links from Mockup */}
          <nav className="space-y-1 text-xs font-semibold">
            <button
              onClick={() => onNavigateTab('home')}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition"
            >
              <Home size={15} />
              <span>{isEn ? "Home" : "Accueil"}</span>
            </button>

            <button
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-md bg-poly-gold text-white font-bold shadow-xs transition"
            >
              <MessageSquare size={15} />
              <span>{isEn ? "Chat" : "Chat"}</span>
            </button>

            <button
              onClick={() => onNavigateTab('orientation')}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition"
            >
              <Compass size={15} />
              <span>{isEn ? "Orientation" : "Orientation"}</span>
            </button>

            <button
              onClick={() => onNavigateTab('jour_j')}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition"
            >
              <Calendar size={15} />
              <span>{isEn ? "Events" : "Événements"}</span>
            </button>

            <button
              onClick={() => onSendMessage(isEn ? "Give me a summary of ENSPD academic resources and departments" : "Donne-moi les ressources et départements de l'ENSPD")}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition"
            >
              <BookOpen size={15} />
              <span>{isEn ? "Resources" : "Ressources"}</span>
            </button>

            <button
              onClick={() => onNavigateTab('admin')}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition"
            >
              <Settings size={15} />
              <span>{isEn ? "Settings" : "Paramètres"}</span>
            </button>
          </nav>
        </div>

        {/* Bottom Sidebar Action: Déconnexion / Reset */}
        <div className="pt-4 border-t border-slate-800/80">
          <button
            onClick={() => onNavigateTab('home')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-slate-400 hover:text-red-400 hover:bg-red-950/20 transition"
          >
            <LogOut size={14} />
            <span>{isEn ? "Quit Chat" : "Déconnexion"}</span>
          </button>
        </div>
      </aside>

      {/* Main Chat Conversation Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header of Chat Area */}
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0 shadow-2xs z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500 animate-pulse shrink-0" />
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 dark:text-slate-100">
                {isEn ? "Poly • ENSPD Orientation Guide" : "Poly • Guide d'Orientation ENSPD"}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/70 text-poly-navy dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/50">
                <ShieldCheck size={11} />
                {isEn ? "Official Data" : "Sources Officielles"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenCallback}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-poly-gold/10 text-poly-navy dark:text-slate-200 font-semibold text-xs border border-transparent hover:border-poly-gold/40 transition"
            >
              <PhoneCall size={13} className="text-poly-gold" />
              <span className="hidden sm:inline">{isEn ? "Advisor Callback" : "Demande de rappel"}</span>
              <span className="sm:hidden">{isEn ? "Callback" : "Rappel"}</span>
            </button>

            <button
              onClick={handleExportSummary}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs border border-transparent"
              title={isEn ? "Download summary" : "Télécharger le récapitulatif"}
            >
              <Share2 size={13} />
              <span className="hidden md:inline">{isEn ? "Export" : "Exporter"}</span>
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Welcome Message Card (Matching Mockup 02) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs max-w-2xl space-y-3 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-poly-navy text-poly-gold flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                <GraduationCap size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-poly-navy dark:text-white">
                  Bonjour ! 👋
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {isEn
                    ? "I am Poly, your ENSPD orientation guide. Ask me any question regarding programs, admissions, fees or student life."
                    : "Je suis Poly, votre guide d'orientation. Posez-moi vos questions sur l'ENSPD, l'orientation ou nos formations."}
                </p>
              </div>
            </div>

            {/* 3 Prompt Cards from Mockup 02 */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              {activeSuggestions.slice(0, 3).map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => onSendMessage(prompt)}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-amber-50/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-poly-navy dark:hover:text-white border border-slate-200/80 dark:border-slate-700 text-xs font-medium transition flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-poly-gold font-bold">•</span>
                    <span>{prompt}</span>
                  </span>
                  <ArrowRight size={13} className="text-slate-400 group-hover:text-poly-gold group-hover:translate-x-0.5 transition" />
                </button>
              ))}
            </div>
          </div>

          {/* Conversation history */}
          {messages.filter(m => m.id !== 'welcome').map((msg) => {
            const isAssistant = msg.role === 'assistant';
            const sources = msg.sources || [];
            const hasSources = sources.length > 0;
            const isSourcesOpen = !!expandedSources[msg.id];

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 sm:gap-4 ${
                  isAssistant ? '' : 'flex-row-reverse'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs text-sm font-bold ${
                    isAssistant
                      ? 'bg-poly-navy text-poly-gold border border-poly-gold/30'
                      : 'bg-slate-700 text-white'
                  }`}
                >
                  {isAssistant ? <GraduationCap size={18} /> : <User size={18} />}
                </div>

                <div className="max-w-[88%] sm:max-w-[80%] space-y-2 text-left">
                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed transition-colors shadow-xs ${
                      isAssistant
                        ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200/90 dark:border-slate-800 rounded-tl-xs'
                        : 'bg-poly-navy text-white rounded-tr-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {/* Sources Accordion */}
                  {isAssistant && hasSources && (
                    <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs space-y-2 transition-colors">
                      <button
                        onClick={() => toggleSource(msg.id)}
                        className="w-full flex items-center justify-between text-poly-navy dark:text-blue-300 font-bold text-xs hover:opacity-80 transition"
                      >
                        <span className="flex items-center gap-1.5">
                          <FileText size={14} className="text-poly-gold" />
                          <span>
                            {isEn
                              ? `${sources.length} Verified ENSPD Source${sources.length > 1 ? 's' : ''}`
                              : `${sources.length} Fiche${sources.length > 1 ? 's' : ''} Officielle${sources.length > 1 ? 's' : ''} ENSPD`}
                          </span>
                        </span>
                        {isSourcesOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>

                      {isSourcesOpen && (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                          {sources.map((s, idx) => (
                            <div
                              key={idx}
                              className="bg-white dark:bg-slate-800/80 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1.5 shadow-2xs"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-bold text-poly-navy dark:text-blue-300 text-xs">
                                  {s.title}
                                </span>
                                {s.validated_at && (
                                  <span className="text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md shrink-0 border border-emerald-200 dark:border-emerald-800">
                                    {isEn ? 'Validated' : 'Validé'}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                                <span className="font-mono bg-slate-100 dark:bg-slate-700/60 px-1.5 py-0.5 rounded-md text-slate-700 dark:text-slate-300 font-semibold">
                                  {s.code}
                                </span>
                                <span>•</span>
                                <span className="truncate max-w-[280px]">
                                  {s.official_source}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Feedback Controls */}
                  {isAssistant && (
                    <div className="flex items-center justify-between text-slate-400 text-xs px-1">
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleFeedbackClick(msg.id, 'up')}
                          className={`p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 transition ${
                            msg.rating === 'up' ? 'text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40' : ''
                          }`}
                          title={isEn ? 'Helpful answer' : 'Réponse utile'}
                        >
                          <ThumbsUp size={13} />
                        </button>
                        <button
                          onClick={() => handleFeedbackClick(msg.id, 'down')}
                          className={`p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-500 transition ${
                            msg.rating === 'down' ? 'text-red-500 font-bold bg-red-50 dark:bg-red-950/40' : ''
                          }`}
                          title={isEn ? 'Not helpful' : 'Réponse à améliorer'}
                        >
                          <ThumbsDown size={13} />
                        </button>
                      </div>

                      {msg.latency_ms && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {msg.latency_ms} ms
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-9 h-9 rounded-xl bg-poly-navy text-poly-gold flex items-center justify-center shrink-0 border border-poly-gold/30">
                <GraduationCap size={18} />
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-2xl rounded-tl-xs shadow-xs flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs">
                <Loader2 size={15} className="animate-spin text-poly-gold" />
                <span>
                  {isEn
                    ? "Poly is retrieving verified official ENSPD data..."
                    : "Poly consulte les fiches officielles de l'ENSPD..."}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area (Matching Mockup 02 with Gold Send Button '>') */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0 transition-colors">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 focus-within:border-poly-navy dark:focus-within:border-poly-gold rounded-2xl p-2 transition shadow-xs focus-within:shadow-md flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={handleInputResize}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder={
                  isEn
                    ? "Type your message..."
                    : "Écrivez votre message..."
                }
                maxLength={1000}
                className="flex-1 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none resize-none px-3 py-2 max-h-32"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || loading}
                className="bg-poly-gold hover:bg-poly-goldHover disabled:opacity-30 text-slate-950 font-black p-2.5 rounded-xl transition shadow-xs flex items-center justify-center shrink-0 cursor-pointer disabled:cursor-not-allowed"
                title={isEn ? "Send message" : "Envoyer"}
              >
                <ArrowRight size={17} />
              </button>
            </div>
          </form>

          <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 mt-2">
            {isEn
              ? "Poly answers only from official ENSPD verified documents."
              : "Poly répond exclusivement à partir des fiches officielles de l'ENSPD."}
          </p>
        </div>
      </div>

      {/* Feedback Comment Modal */}
      {commentModalMsgId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-200 dark:border-slate-800 text-left">
            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
              <AlertCircle size={18} className="text-amber-500" />
              <span>{isEn ? "Help us improve" : "Aide-nous à améliorer Poly"}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isEn
                ? "What was missing or inaccurate in this response?"
                : "Qu'est-ce qui manquait ou n'était pas clair dans cette réponse ?"}
            </p>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
              className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-poly-navy"
              placeholder={isEn ? "Your comment..." : "Commentaire facultatif..."}
            />
            <div className="flex justify-end space-x-2 pt-1">
              <button
                onClick={() => setCommentModalMsgId(null)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {isEn ? "Cancel" : "Annuler"}
              </button>
              <button
                onClick={submitComment}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-poly-navy text-white shadow-xs hover:bg-poly-deepNavy transition"
              >
                {isEn ? "Submit" : "Envoyer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
