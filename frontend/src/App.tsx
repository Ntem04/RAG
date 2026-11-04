import React, { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar';
import { KioskBanner } from './components/common/KioskBanner';
import { WelcomeScreen } from './components/visitor/WelcomeScreen';
import { ChatWindow } from './components/visitor/ChatWindow';
import { OrientationWizard } from './components/visitor/OrientationWizard';
import { DayJProgram } from './components/visitor/DayJProgram';
import { CallbackModal } from './components/visitor/CallbackModal';
import { LoginPage } from './components/admin/LoginPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ChatMessage } from './types';
import { api } from './services/api';
import { Building2, GraduationCap, ShieldCheck, MapPin, CheckCircle2 } from 'lucide-react';

type TabType = 'home' | 'chat' | 'orientation' | 'jour_j' | 'apropos' | 'admin';

const getInitialTab = (): TabType => {
  if (typeof window === 'undefined') return 'home';
  const hash = window.location.hash.replace('#', '').toLowerCase();
  const validTabs: TabType[] = ['home', 'chat', 'orientation', 'jour_j', 'apropos', 'admin'];
  if (hash === 'events') return 'jour_j';
  if (validTabs.includes(hash as TabType)) {
    return hash as TabType;
  }
  const saved = localStorage.getItem('poly_current_tab');
  if (saved && validTabs.includes(saved as TabType)) {
    return saved as TabType;
  }
  return 'home';
};

export const App: React.FC = () => {
  const [language, setLanguage] = useState<'fr' | 'en'>(() => {
    const saved = localStorage.getItem('poly_language');
    return saved === 'en' ? 'en' : 'fr';
  });
  const [profile, setProfile] = useState<string>('eleve');
  const [currentTab, setCurrentTab] = useState<TabType>(getInitialTab);
  const [isKiosk, setIsKiosk] = useState(false);
  const [kioskCountdown, setKioskCountdown] = useState(90);

  // Sync tab with URL hash and localStorage
  useEffect(() => {
    localStorage.setItem('poly_current_tab', currentTab);
    const targetHash = currentTab === 'jour_j' ? 'events' : currentTab;
    if (window.location.hash.replace('#', '') !== targetHash) {
      window.history.replaceState(null, '', `#${targetHash}`);
    }
  }, [currentTab]);

  // Support browser Back / Forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      const validTabs: TabType[] = ['home', 'chat', 'orientation', 'jour_j', 'apropos', 'admin'];
      if (hash === 'events') {
        setCurrentTab('jour_j');
      } else if (validTabs.includes(hash as TabType)) {
        setCurrentTab(hash as TabType);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync language with localStorage
  useEffect(() => {
    localStorage.setItem('poly_language', language);
  }, [language]);

  // Dark / Light Mode State
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('poly_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('poly_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('poly_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  // Modals
  const [isCallbackOpen, setIsCallbackOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Admin Auth with Session Persistence across reloads
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return sessionStorage.getItem('poly_admin_token') || null;
  });
  const [authRole, setAuthRole] = useState<string>(() => {
    return sessionStorage.getItem('poly_admin_role') || 'lecteur';
  });
  const [authUsername, setAuthUsername] = useState<string>(() => {
    return sessionStorage.getItem('poly_admin_user') || '';
  });

  // Chat State
  const [sessionId, setSessionId] = useState<string>(() => `poly-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const isEn = language === 'en';

  useEffect(() => {
    const welcomeText = isEn
      ? "Hello! I am Poly, your ENSPD orientation guide. How can I guide you today? Ask me about our 10 engineering departments, admissions, fees or schedule."
      : "Bonjour ! Je suis Poly, votre guide d'orientation pour l'ENSPD. Comment puis-je vous aider aujourd'hui ? Interrogez-moi sur nos 10 départements d'ingénieurs, les épreuves du concours ou le programme des conférences.";

    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: welcomeText,
        sources: [
          {
            code: 'ACCUEIL-001',
            title: isEn ? 'ENSPD Welcome Charter' : "Charte d'Accueil Officielle ENSPD",
            official_source: 'Direction ENSPD - enspd-udo.cm'
          }
        ]
      }
    ]);
  }, [language]);

  // Kiosk Inactivity Timer (EF-18 : 90 seconds auto-reset)
  useEffect(() => {
    if (!isKiosk) return;

    const resetCountdown = () => setKioskCountdown(90);
    window.addEventListener('mousemove', resetCountdown);
    window.addEventListener('keydown', resetCountdown);
    window.addEventListener('touchstart', resetCountdown);

    const interval = setInterval(() => {
      setKioskCountdown((prev) => {
        if (prev <= 1) {
          handleResetSession();
          return 90;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', resetCountdown);
      window.removeEventListener('keydown', resetCountdown);
      window.removeEventListener('touchstart', resetCountdown);
    };
  }, [isKiosk]);

  const handleResetSession = () => {
    setSessionId(`poly-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
    setCurrentTab('home');
    setSuggestions([]);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const channel = isKiosk ? 'kiosk' : 'pwa';
      const res = await api.sendMessage(sessionId, text, language, profile, channel);
      const assistantMsg: ChatMessage = {
        id: res.messageId,
        role: 'assistant',
        content: res.reply,
        sources: res.sources,
        relevance_score: res.relevanceScore,
        latency_ms: res.latencyMs
      };
      setMessages(prev => [...prev, assistantMsg]);
      setSuggestions(res.suggestions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendFeedback = (messageId: string, rating: 'up' | 'down', comment?: string) => {
    setMessages(prev =>
      prev.map(m => (m.id === messageId ? { ...m, rating } : m))
    );
    api.submitFeedback(messageId, rating, comment);
  };

  const handleAskAboutTrack = (trackTitle: string) => {
    setCurrentTab('chat');
    handleSendMessage(`Parle-moi en détail de la filière ${trackTitle} : débouchés, stages et compétences requises.`);
  };

  const handleTabChange = (tab: 'home' | 'chat' | 'orientation' | 'jour_j' | 'apropos' | 'admin') => {
    setCurrentTab(tab);
  };

  // Fullscreen Login Page matching mockup exactly without navbar
  if (currentTab === 'admin' && !authToken) {
    return (
      <LoginPage
        onLoginSuccess={(token, role, user) => {
          setAuthToken(token);
          setAuthRole(role);
          setAuthUsername(user);
        }}
        onCancel={() => setCurrentTab('home')}
        language={language}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        language={language}
        setLanguage={setLanguage}
        isKiosk={isKiosk}
        setIsKiosk={setIsKiosk}
        onResetSession={handleResetSession}
        isDark={isDark}
        toggleTheme={toggleTheme}
      />

      <KioskBanner countdown={kioskCountdown} isKiosk={isKiosk} language={language} />

      <main className="flex-1 flex flex-col">
        {/* 01. Accueil */}
        {currentTab === 'home' && (
          <WelcomeScreen
            language={language}
            profile={profile}
            setProfile={setProfile}
            onStartChat={(q) => {
              setCurrentTab('chat');
              if (q) handleSendMessage(q);
            }}
            onOpenOrientation={() => setCurrentTab('orientation')}
            onOpenCallback={() => setIsCallbackOpen(true)}
            onOpenEvents={() => setCurrentTab('jour_j')}
          />
        )}

        {/* 02. Chat */}
        {currentTab === 'chat' && (
          <ChatWindow
            messages={messages}
            onSendMessage={handleSendMessage}
            onSendFeedback={handleSendFeedback}
            onOpenCallback={() => setIsCallbackOpen(true)}
            onNavigateTab={handleTabChange}
            language={language}
            loading={loading}
            suggestions={suggestions}
          />
        )}

        {/* 03 & 04. Orientation & Résultats */}
        {currentTab === 'orientation' && (
          <OrientationWizard
            language={language}
            onAskAboutTrack={handleAskAboutTrack}
          />
        )}

        {/* 05. Journées d'orientation (Événements) */}
        {currentTab === 'jour_j' && (
          <DayJProgram
            language={language}
            onAskPoly={(topic) => {
              setCurrentTab('chat');
              handleSendMessage(`Donne-moi les informations détaillées concernant : ${topic}`);
            }}
          />
        )}

        {/* À propos de l'ENSPD */}
        {currentTab === 'apropos' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-fade-in text-left">
            <div className="space-y-3">
              <span className="text-xs uppercase font-bold tracking-wider text-poly-gold bg-amber-50 dark:bg-poly-gold/10 px-3 py-1 rounded-md">
                Institution Officielle
              </span>
              <h1 className="text-3xl font-black text-poly-navy dark:text-white">
                À propos de l'ENSPD
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-200 font-medium max-w-2xl">
                L'École Nationale Supérieure Polytechnique de Douala est la grande école d'ingénieurs de référence de l'Université de Douala.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-poly-gold/10 text-poly-gold flex items-center justify-center">
                  <GraduationCap size={24} />
                </div>
                <h3 className="font-extrabold text-lg text-poly-navy dark:text-white">
                  Direction de l'École
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  L'ENSPD est dirigée par le <strong>Professeur Ruben Martin MOUANGUE</strong> (Professeur Titulaire des Universités).
                  L'école est sous la tutelle de l'Université de Douala, dont le Recteur est le <strong>Professeur Magloire ONDOA</strong>.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-poly-navy dark:text-blue-300 flex items-center justify-center">
                  <Building2 size={24} />
                </div>
                <h3 className="font-extrabold text-lg text-poly-navy dark:text-white">
                  Création et Historique
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  L'école a été officiellement créée et réorganisée par les <strong>décrets présidentiels n° 2020/272 et 2020/273 du 11 mai 2020</strong> signés par le Président de la République Paul BIYA, transformant l'ancienne Faculté de Génie Industriel (FGI) en École Polytechnique.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-3">
              <h3 className="font-extrabold text-base text-poly-navy dark:text-white flex items-center gap-2">
                <MapPin size={18} className="text-poly-gold" />
                <span>Localisation du Campus</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Le campus principal est situé à PK17 à Douala, Cameroun. Il abrite les amphithéâtres, les laboratoires technologiques, le Datacenter GIT, les bancs d'essais automobiles et les ateliers de génie civil.
              </p>
            </div>
          </div>
        )}

        {/* 07 - 10. Espace Administration */}
        {currentTab === 'admin' && (
          authToken ? (
            <AdminDashboard
              token={authToken}
              role={authRole}
              username={authUsername}
              onLogout={() => {
                setAuthToken(null);
                setAuthRole('lecteur');
                setAuthUsername('');
                sessionStorage.removeItem('poly_admin_token');
                sessionStorage.removeItem('poly_admin_role');
                sessionStorage.removeItem('poly_admin_user');
                setCurrentTab('home');
              }}
              language={language}
            />
          ) : (
            <LoginPage
              onLoginSuccess={(token, role, user) => {
                setAuthToken(token);
                setAuthRole(role);
                setAuthUsername(user);
                sessionStorage.setItem('poly_admin_token', token);
                sessionStorage.setItem('poly_admin_role', role);
                sessionStorage.setItem('poly_admin_user', user);
              }}
              onCancel={() => setCurrentTab('home')}
              language={language}
            />
          )
        )}
      </main>

      {/* Modals */}
      <CallbackModal
        isOpen={isCallbackOpen}
        onClose={() => setIsCallbackOpen(false)}
        language={language}
        profile={profile}
      />
    </div>
  );
};

export default App;
