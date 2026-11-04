import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  MessageSquare,
  FileText,
  HelpCircle,
  Settings,
  LogOut,
  Users,
  CheckCircle2,
  Calendar,
  Search,
  Plus,
  Eye,
  Edit3,
  Trash2,
  Power,
  ShieldCheck,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
  RotateCcw
} from 'lucide-react';
import { api } from '../../services/api';
import { KnowledgeSheet, DashboardStats, CallbackRequest, UnansweredQuestion, TimelineDataPoint } from '../../types';
import { SkeletonStatCard, SkeletonTableRow, Skeleton } from '../common/Skeleton';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

interface AdminDashboardProps {
  token: string;
  role: string;
  username: string;
  onLogout: () => void;
  language: 'fr' | 'en';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  token,
  role,
  username,
  onLogout,
  language
}) => {
  const isEn = language === 'en';

  // Active Admin Section from Mockup:
  // 'overview' (07) | 'sheets' (08) | 'unanswered' (09) | 'settings' (10) | 'callbacks'
  const [currentSection, setCurrentSection] = useState<'overview' | 'sheets' | 'unanswered' | 'settings' | 'callbacks'>('overview');

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [sheets, setSheets] = useState<KnowledgeSheet[]>([]);
  const [callbacks, setCallbacks] = useState<CallbackRequest[]>([]);
  const [unanswered, setUnanswered] = useState<UnansweredQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [emergencyActive, setEmergencyActive] = useState(false);

  // Timeline Chart State (Connecté aux données réelles & plusieurs mois)
  const [timelinePeriod, setTimelinePeriod] = useState<'7d' | '30d' | '90d' | '180d' | '365d'>('7d');
  const [timelineData, setTimelineData] = useState<TimelineDataPoint[]>([]);
  const [timelineGrowth, setTimelineGrowth] = useState<number>(18.4);
  const [timelineTotal, setTimelineTotal] = useState<number>(2485);
  const [timelineLoading, setTimelineLoading] = useState<boolean>(false);

  // Search & Filters
  const [sheetSearch, setSheetSearch] = useState('');
  const [unansweredSearch, setUnansweredSearch] = useState('');
  const [unansweredStatusFilter, setUnansweredStatusFilter] = useState('all');

  // Sheet creation/edit modal
  const [editingSheet, setEditingSheet] = useState<KnowledgeSheet | null>(null);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [sheetFormData, setSheetFormData] = useState({
    code: '',
    title: '',
    category: 'filiere',
    language: 'fr',
    content: '',
    official_source: '',
    sensitivity: 'normal'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, sheetsData, callbacksData, unansweredData] = await Promise.all([
        api.getDashboard(token),
        api.getSheets(token),
        api.getCallbacks(token),
        api.getUnanswered(token)
      ]);
      setStats(statsData);
      setEmergencyActive(statsData.emergency_active);
      setSheets(sheetsData);
      setCallbacks(callbacksData);
      setUnanswered(unansweredData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const fetchTimeline = async (p: '7d' | '30d' | '90d' | '180d' | '365d') => {
    setTimelineLoading(true);
    try {
      const res = await api.getTimeline(token, p);
      setTimelineData(res.data);
      setTimelineGrowth(res.growth_rate);
      setTimelineTotal(res.total_in_period);
    } catch (e) {
      console.error("Erreur timeline:", e);
    } finally {
      setTimelineLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTimeline(timelinePeriod);
    }
  }, [timelinePeriod, token]);

  const handleToggleEmergency = async () => {
    const nextState = !emergencyActive;
    try {
      const res = await api.toggleEmergency(token, nextState);
      setEmergencyActive(res.is_active);
    } catch (e) {
      console.error(e);
    }
  };

  const handleValidateSheet = async (sheetId: string) => {
    try {
      await api.validateSheet(token, sheetId);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSheet = async (sheetId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette fiche ?")) return;
    try {
      await api.deleteSheet(token, sheetId);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSheet) {
        await api.updateSheet(token, editingSheet.id, sheetFormData);
      } else {
        await api.createSheet(token, sheetFormData);
      }
      setIsCreatingSheet(false);
      setEditingSheet(null);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenEdit = (sheet: KnowledgeSheet) => {
    setEditingSheet(sheet);
    setSheetFormData({
      code: sheet.code,
      title: sheet.title,
      category: sheet.category,
      language: sheet.language,
      content: sheet.content,
      official_source: sheet.official_source,
      sensitivity: sheet.sensitivity
    });
    setIsCreatingSheet(true);
  };

  // Filtered sheets
  const filteredSheets = sheets.filter(s =>
    s.title.toLowerCase().includes(sheetSearch.toLowerCase()) ||
    s.code.toLowerCase().includes(sheetSearch.toLowerCase()) ||
    s.category.toLowerCase().includes(sheetSearch.toLowerCase())
  );

  // Filtered unanswered
  const filteredUnanswered = unanswered.filter(u => {
    const matchesQuery = u.user_text.toLowerCase().includes(unansweredSearch.toLowerCase());
    const matchesStatus = unansweredStatusFilter === 'all' || u.status === unansweredStatusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-left">
      {/* Dark Navy Sidebar from Mockups 07, 08, 09, 10 */}
      <aside className="w-64 bg-poly-sidebar text-slate-300 hidden lg:flex flex-col justify-between p-5 shrink-0 border-r border-slate-800">
        <div className="space-y-6">
          {/* Logo brand */}
          <div className="flex items-center gap-3 px-2">
            <img src="/images/enspd-logo.webp" alt="Logo" className="w-9 h-9 object-contain" />
            <div>
              <div className="text-white font-extrabold text-base tracking-tight">ENSPD</div>
              <div className="text-[10px] text-poly-gold uppercase font-bold tracking-wider">Administration</div>
            </div>
          </div>

          {/* Navigation Links matching Mockups 07-10 */}
          <nav className="space-y-1 text-xs font-semibold">
            <button
              onClick={() => setCurrentSection('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md transition ${
                currentSection === 'overview'
                  ? 'bg-poly-gold text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <BarChart3 size={16} />
              <span>{isEn ? "Dashboard" : "Tableau de bord"}</span>
            </button>

            <button
              onClick={() => setCurrentSection('callbacks')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md transition ${
                currentSection === 'callbacks'
                  ? 'bg-poly-gold text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <MessageSquare size={16} />
              <span>{isEn ? "Callback Requests" : "Demandes de rappel"}</span>
              {callbacks.filter(c => c.status === 'pending').length > 0 && (
                <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-md">
                  {callbacks.filter(c => c.status === 'pending').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentSection('sheets')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md transition ${
                currentSection === 'sheets'
                  ? 'bg-poly-gold text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <FileText size={16} />
              <span>{isEn ? "Knowledge Base" : "Base de connaissances"}</span>
            </button>

            <button
              onClick={() => setCurrentSection('unanswered')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md transition ${
                currentSection === 'unanswered'
                  ? 'bg-poly-gold text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <HelpCircle size={16} />
              <span>{isEn ? "Unanswered Questions" : "Questions non traitées"}</span>
              {unanswered.filter(u => u.status === 'pending').length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-md">
                  {unanswered.filter(u => u.status === 'pending').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentSection('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md transition ${
                currentSection === 'settings'
                  ? 'bg-poly-gold text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Settings size={16} />
              <span>{isEn ? "Settings" : "Paramètres"}</span>
            </button>
          </nav>
        </div>

        {/* User Info & Déconnexion */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="px-2">
            <div className="text-xs text-white font-bold">{username}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{isEn ? "Role" : "Rôle"} : {role}</div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-md text-xs text-slate-400 hover:text-red-400 hover:bg-red-950/20 transition cursor-pointer"
          >
            <LogOut size={15} />
            <span>{isEn ? "Logout" : "Déconnexion"}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-5 sm:p-8 space-y-8 overflow-y-auto">
        {/* Screen 07. Vue d'ensemble (Tableau de bord) */}
        {currentSection === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Header with Title & Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-poly-navy dark:text-white">
                  {isEn ? "Overview Dashboard" : "Vue d'ensemble"}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isEn ? "Statistics and consultation metrics of Poly assistant" : "Statistiques et métriques de consultation du tuteur Poly"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={timelinePeriod}
                  onChange={(e) => setTimelinePeriod(e.target.value as any)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer shadow-2xs"
                >
                  <option value="7d">{isEn ? "Last 7 days" : "7 derniers jours"}</option>
                  <option value="30d">{isEn ? "Last 30 days (1 month)" : "30 derniers jours (1 mois)"}</option>
                  <option value="90d">{isEn ? "Last 3 months" : "3 derniers mois"}</option>
                  <option value="180d">{isEn ? "Last 6 months" : "6 derniers mois"}</option>
                  <option value="365d">{isEn ? "Full Year (1 Year)" : "1 an (Toute l'année)"}</option>
                </select>
              </div>
            </div>

            {/* 4 Metric Cards from Mockup 07 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {loading ? (
                <>
                  <SkeletonStatCard />
                  <SkeletonStatCard />
                  <SkeletonStatCard />
                  <SkeletonStatCard />
                </>
              ) : (
                <>
                  {/* Card 1: Questions */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-poly-navy dark:text-blue-300 flex items-center justify-center">
                      <MessageSquare size={20} />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-poly-navy dark:text-white">
                      {stats ? (stats.total_questions ?? stats.total_messages ?? 0) : 0}
                    </div>
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {isEn ? "Questions asked" : "Questions posées"}
                    </div>
                  </div>

                  {/* Card 2: Taux de satisfaction */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 size={20} />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-poly-navy dark:text-white">
                      {stats && (stats.positive_ratings + stats.negative_ratings) > 0
                        ? `${stats.satisfaction_rate}%`
                        : "0%"}
                    </div>
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {stats && (stats.positive_ratings + stats.negative_ratings) > 0
                        ? (isEn ? `Satisfaction rate (${stats.positive_ratings} 👍 / ${stats.positive_ratings + stats.negative_ratings})` : `Taux de satisfaction (${stats.positive_ratings} 👍 / ${stats.positive_ratings + stats.negative_ratings})`)
                        : (isEn ? "Satisfaction rate (0 reviews)" : "Taux de satisfaction (0 avis)")}
                    </div>
                  </div>

                  {/* Card 3: Utilisateurs */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <Users size={20} />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-poly-navy dark:text-white">
                      {stats ? stats.total_conversations : 0}
                    </div>
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {isEn ? "Unique visitors" : "Utilisateurs uniques"}
                    </div>
                  </div>

                  {/* Card 4: Événements / Fiches */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-poly-gold/10 text-poly-goldDark dark:text-poly-gold flex items-center justify-center">
                      <Calendar size={20} />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-poly-navy dark:text-white">
                      {sheets.length}
                    </div>
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {isEn ? "Validated official sheets" : "Fiches officielles validées"}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Real Interactive Chart with Recharts matching Mockup 07 with multi-month periods */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base sm:text-lg font-black text-poly-navy dark:text-white">
                      {isEn ? "Conversation Activity" : "Activité des conversations"}
                    </h3>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      {isEn
                        ? `${timelineGrowth >= 0 ? `+${timelineGrowth}%` : `${timelineGrowth}%`} over period`
                        : `${timelineGrowth >= 0 ? `+${timelineGrowth}%` : `${timelineGrowth}%`} sur la période`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {isEn ? "Volume: " : "Volume : "}<span className="font-bold text-poly-navy dark:text-white">{timelineTotal.toLocaleString()}</span> {isEn ? "consultations recorded" : "consultations enregistrées"}
                  </p>
                </div>

                {/* Period Selector (7J, 1 Mois, 3 Mois, 6 Mois, 1 An) */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-md border border-slate-200 dark:border-slate-700/60 text-xs font-bold">
                  {[
                    { id: '7d' as const, label: isEn ? '7D' : '7J' },
                    { id: '30d' as const, label: isEn ? '1 Month' : '1 Mois' },
                    { id: '90d' as const, label: isEn ? '3 Months' : '3 Mois' },
                    { id: '180d' as const, label: isEn ? '6 Months' : '6 Mois' },
                    { id: '365d' as const, label: isEn ? '1 Year' : '1 An' }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => setTimelinePeriod(btn.id)}
                      className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                        timelinePeriod === btn.id
                          ? 'bg-poly-gold text-white font-extrabold shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:text-white hover:bg-poly-navy dark:hover:bg-white/10'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart container */}
              <div className="w-full h-64 sm:h-72">
                {timelineLoading ? (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                    Chargement des données analytiques...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={timelineData}
                      margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="chartGradientGold" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#c59b27" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#c59b27" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="chartGradientBlue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.25} />
                      <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload as TimelineDataPoint;
                            return (
                              <div className="bg-slate-900 text-white p-3 rounded-md shadow-xl border border-slate-700 text-xs space-y-1">
                                <div className="font-bold text-poly-gold">{data.label || data.date}</div>
                                <div className="flex items-center justify-between gap-4">
                                  <span className="text-slate-300">Conversations:</span>
                                  <span className="font-extrabold text-white">{data.conversations.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                  <span className="text-slate-300">Questions traitées:</span>
                                  <span className="font-extrabold text-blue-400">{data.messages.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-800 text-[11px]">
                                  <span className="text-slate-400">Satisfaction:</span>
                                  <span className="font-bold text-emerald-400">{data.satisfaction.toFixed(1)}%</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="conversations"
                        stroke="#c59b27"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#chartGradientGold)"
                        dot={{ fill: '#c59b27', stroke: '#fff', strokeWidth: 1.5, r: 4 }}
                        activeDot={{ r: 6, fill: '#fff', stroke: '#c59b27', strokeWidth: 2.5 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="messages"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        fillOpacity={1}
                        fill="url(#chartGradientBlue)"
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Screen 08. Base de connaissances (Matching Mockup 08) */}
        {currentSection === 'sheets' && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Bar: Search & + Ajouter button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-poly-navy dark:text-white">
                  {isEn ? "Knowledge Base" : "Base de connaissances"}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isEn ? "Management and validation of official knowledge sheets" : "Gestion et validation des fiches officielles exploitées par Poly"}
                </p>
              </div>

              {(role === 'admin' || role === 'contributeur') && (
                <button
                  onClick={() => {
                    setEditingSheet(null);
                    setSheetFormData({
                      code: `FICHE-${Date.now().toString().slice(-4)}`,
                      title: '',
                      category: 'filiere',
                      language: 'fr',
                      content: '',
                      official_source: 'Direction ENSPD - enspd-udo.cm',
                      sensitivity: 'normal'
                    });
                    setIsCreatingSheet(true);
                  }}
                  className="bg-poly-navy hover:bg-poly-deepNavy text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus size={16} className="text-poly-gold" />
                  <span>{isEn ? "Add sheet" : "Ajouter un article"}</span>
                </button>
              )}
            </div>

            {/* Search Input from Mockup 08 */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
              <input
                type="text"
                value={sheetSearch}
                onChange={(e) => setSheetSearch(e.target.value)}
                placeholder={isEn ? "Search knowledge sheet..." : "Rechercher un article..."}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-poly-navy"
              />
            </div>

            {/* Table from Mockup 08 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-4">{isEn ? "Title" : "Titre"}</th>
                      <th className="p-4">{isEn ? "Category" : "Catégorie"}</th>
                      <th className="p-4">{isEn ? "Status" : "Statut"}</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {loading ? (
                      <>
                        <SkeletonTableRow />
                        <SkeletonTableRow />
                        <SkeletonTableRow />
                        <SkeletonTableRow />
                        <SkeletonTableRow />
                      </>
                    ) : (
                      filteredSheets.map((sheet) => (
                        <tr key={sheet.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                          <td className="p-4">
                            <div className="font-bold text-poly-navy dark:text-slate-100">{sheet.title}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{sheet.code} • {sheet.official_source}</div>
                          </td>
                          <td className="p-4">
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] font-semibold">
                              {sheet.category}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md inline-flex items-center gap-1 ${
                              sheet.status === 'validated'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                            }`}>
                              <span className="w-1.5 h-1.5 rounded-xs bg-current" />
                              {sheet.status === 'validated' ? (isEn ? 'Validated' : 'Validé') : (isEn ? 'In review' : 'En révision')}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {role === 'admin' && sheet.status !== 'validated' && (
                                <button
                                  onClick={() => handleValidateSheet(sheet.id)}
                                  className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition"
                                  title={isEn ? "Validate sheet" : "Valider la fiche"}
                                >
                                  <Check size={14} />
                                </button>
                              )}
                              {(role === 'admin' || role === 'contributeur') && (
                                <button
                                  onClick={() => handleOpenEdit(sheet)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-poly-navy dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                  title={isEn ? "Edit" : "Modifier"}
                                >
                                  <Edit3 size={14} />
                                </button>
                              )}
                              {role === 'admin' && (
                                <button
                                  onClick={() => handleDeleteSheet(sheet.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                                  title={isEn ? "Delete" : "Supprimer"}
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination from Mockup 08 */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>{filteredSheets.length} {isEn ? "registered sheets" : "fiches enregistrées"}</span>
                <div className="flex items-center space-x-1 font-semibold">
                  <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30">
                    <ChevronLeft size={14} />
                  </button>
                  <span className="px-2.5 py-1 rounded bg-poly-navy text-white text-[11px]">1</span>
                  <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Screen 09. Questions non répondues (Matching Mockup 09) */}
        {currentSection === 'unanswered' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-poly-navy dark:text-white">
                {isEn ? "Unanswered Questions" : "Questions non traitées"}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isEn ? "Queries below similarity threshold requiring new sheets (EA-07)" : "Questions sous le seuil de similarité nécessitant la création de nouvelles fiches (EA-07)"}
              </p>
            </div>

            {/* Search and Filters Bar from Mockup 09 */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
                <input
                  type="text"
                  value={unansweredSearch}
                  onChange={(e) => setUnansweredSearch(e.target.value)}
                  placeholder={isEn ? "Search question..." : "Rechercher une question..."}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-poly-navy"
                />
              </div>

              <select
                value={unansweredStatusFilter}
                onChange={(e) => setUnansweredStatusFilter(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="all">{isEn ? "All statuses" : "Tous statuts"}</option>
                <option value="pending">{isEn ? "Pending" : "Non traitée"}</option>
                <option value="reviewed">{isEn ? "Reviewed" : "Traitée"}</option>
              </select>
            </div>

            {/* Table from Mockup 09 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-4">#</th>
                      <th className="p-4">Question</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">{isEn ? "Status" : "Statut"}</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {loading ? (
                      <>
                        <SkeletonTableRow />
                        <SkeletonTableRow />
                        <SkeletonTableRow />
                      </>
                    ) : filteredUnanswered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400">
                          {isEn ? "No unanswered questions recorded." : "Aucune question sans réponse enregistrée."}
                        </td>
                      </tr>
                    ) : (
                      filteredUnanswered.map((q, idx) => (
                        <tr key={q.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                          <td className="p-4 font-mono text-slate-400">{idx + 1}</td>
                          <td className="p-4 font-medium text-slate-900 dark:text-slate-100 max-w-md">
                            {q.user_text}
                          </td>
                          <td className="p-4 text-slate-400 text-[11px] whitespace-nowrap">
                            {new Date(q.created_at).toLocaleDateString()} {new Date(q.created_at).toLocaleTimeString().slice(0, 5)}
                          </td>
                          <td className="p-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              q.status === 'reviewed'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                : 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400'
                            }`}>
                              {q.status === 'reviewed' ? (isEn ? 'Reviewed' : 'Traitée') : (isEn ? 'Pending' : 'Non traitée')}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => {
                                setSheetFormData({
                                  code: `FICHE-${Date.now().toString().slice(-4)}`,
                                  title: `Réponse à : ${q.user_text.slice(0, 40)}`,
                                  category: 'faq',
                                  language: 'fr',
                                  content: '',
                                  official_source: 'Direction ENSPD',
                                  sensitivity: 'normal'
                                });
                                setIsCreatingSheet(true);
                              }}
                              className="text-[11px] font-bold text-poly-navy dark:text-poly-gold hover:underline"
                            >
                              {isEn ? "Create sheet" : "Créer fiche"}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Screen 10. Paramètres (Matching Mockup 10) */}
        {currentSection === 'settings' && (
          <div className="space-y-6 animate-fade-in max-w-4xl">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-poly-navy dark:text-white">
                {isEn ? "Settings" : "Paramètres"}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isEn ? "General configuration and emergency switch of Poly" : "Configuration générale et interrupteur d'urgence du tuteur Poly"}
              </p>
            </div>

            {/* Tabs from Mockup 10 */}
            <div className="flex items-center space-x-1 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
              <button className="px-3.5 py-1.5 rounded-lg bg-poly-navy text-white shadow-2xs">
                {isEn ? "General" : "Général"}
              </button>
              <button className="px-3.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white">
                {isEn ? "Security" : "Sécurité"}
              </button>
              <button className="px-3.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white">
                {isEn ? "Roles & Access" : "Rôles & Accès"}
              </button>
              <button className="px-3.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white">
                {isEn ? "Languages" : "Langues"}
              </button>
            </div>

            {/* Card 1: Informations de l'assistant (Mockup 10) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <div>
                <h3 className="font-extrabold text-base text-poly-navy dark:text-white">
                  {isEn ? "Guide Profile" : "Informations du guide"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isEn ? "Configure the identity and persona of Poly." : "Personnalisez le comportement et l'identité de Poly."}
                </p>
              </div>

              <div className="space-y-3 max-w-lg">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isEn ? "Service Name" : "Nom du service"}
                  </label>
                  <input
                    type="text"
                    defaultValue="Poly – Tuteur officiel ENSPD"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isEn ? "Default Greeting" : "Message d'accueil par défaut"}
                  </label>
                  <textarea
                    rows={2}
                    defaultValue={isEn ? "Hello! I am Poly, your ENSPD academic guide. Ask me any question." : "Bonjour ! Je suis Poly, votre guide d'orientation. Posez-moi vos questions sur l'ENSPD."}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <button className="bg-poly-gold hover:bg-poly-goldHover text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-xs cursor-pointer">
                  {isEn ? "Save changes" : "Enregistrer les modifications"}
                </button>
              </div>
            </div>

            {/* Card 2: Maintenance & Interrupteur d'urgence EA-10 (Mockup 10) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Power size={17} className={emergencyActive ? "text-red-500" : "text-slate-400"} />
                    <h3 className="font-extrabold text-base text-poly-navy dark:text-white">
                      {isEn ? "Maintenance & Emergency Switch (EA-10)" : "Maintenance & Interrupteur d'urgence (EA-10)"}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                    {isEn
                      ? "Activate this mode during unexpected incidents to immediately display the maintenance alert to all campus kiosks."
                      : "Activez ce mode en cas d'incident ou de maintenance imprévue pour afficher immédiatement le message d'interruption aux visiteurs."}
                  </p>
                </div>

                {/* Toggle switch from Mockup 10 */}
                <button
                  onClick={handleToggleEmergency}
                  className={`w-14 h-8 flex items-center rounded-xl p-1 transition cursor-pointer ${
                    emergencyActive ? 'bg-red-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                  }`}
                >
                  <div className="w-6 h-6 rounded-lg bg-white shadow-md" />
                </button>
              </div>

              {emergencyActive && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 font-medium">
                  {isEn
                    ? "⚠️ Maintenance mode active: chat conversations are paused and direct visitors to the ENSPD welcome desk."
                    : "⚠️ Mode maintenance actif : les conversations sont suspendues et renvoient vers le stand d'accueil de l'ENSPD."}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section Callbacks */}
        {currentSection === 'callbacks' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-poly-navy dark:text-white">
                {isEn ? "Telephone Callback Requests" : "Demandes de rappel téléphonique"}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isEn ? "Contact details left by visitors to be reached by an ENSPD advisor" : "Coordonnées laissées par les visiteurs pour être recontactés par un conseiller ENSPD"}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-4">{isEn ? "Visitor" : "Visiteur"}</th>
                      <th className="p-4">{isEn ? "Phone" : "Téléphone"}</th>
                      <th className="p-4">{isEn ? "Subject" : "Sujet"}</th>
                      <th className="p-4">{isEn ? "Status" : "Statut"}</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {callbacks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400 font-medium">
                          {isEn ? "No callback requests recorded yet." : "Aucune demande de rappel enregistrée pour le moment."}
                        </td>
                      </tr>
                    ) : (
                      callbacks.map((cb) => {
                        const visitorName = cb.visitor_name || (cb as any).full_name || (isEn ? "Anonymous Visitor" : "Visiteur anonyme");
                        const phone = cb.contact_info || (cb as any).phone_number || "—";
                        const subject = cb.interested_field || (cb as any).topic || (isEn ? "General Orientation" : "Orientation générale");
                        const isProcessed = cb.status === 'resolved' || cb.status === ('processed' as any);

                        return (
                          <tr key={cb.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition">
                            <td className="p-4 font-bold text-slate-900 dark:text-white">
                              {visitorName}
                            </td>
                            <td className="p-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                              {phone}
                            </td>
                            <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                              {subject}
                            </td>
                            <td className="p-4">
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${
                                isProcessed
                                  ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                                  : 'bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                              }`}>
                                {isProcessed ? (isEn ? 'Processed' : 'Traité') : (isEn ? 'Pending' : 'En attente')}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={async () => {
                                  const targetStatus = isProcessed ? 'pending' : 'resolved';
                                  await api.updateCallbackStatus(token, cb.id, targetStatus);
                                  loadData();
                                }}
                                className="text-xs font-bold text-poly-navy dark:text-poly-gold hover:underline cursor-pointer"
                              >
                                {isProcessed ? (isEn ? 'Mark pending' : 'Marquer en attente') : (isEn ? 'Mark processed' : 'Marquer traité')}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Sheet Create / Edit Modal */}
      {isCreatingSheet && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 text-left">
            <h3 className="text-lg font-black text-poly-navy dark:text-white">
              {editingSheet ? "Modifier la fiche" : "Nouvelle fiche de connaissances"}
            </h3>

            <form onSubmit={handleSaveSheet} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Code</label>
                <input
                  type="text"
                  required
                  value={sheetFormData.code}
                  onChange={(e) => setSheetFormData({ ...sheetFormData, code: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Titre</label>
                <input
                  type="text"
                  required
                  value={sheetFormData.title}
                  onChange={(e) => setSheetFormData({ ...sheetFormData, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Catégorie</label>
                  <select
                    value={sheetFormData.category}
                    onChange={(e) => setSheetFormData({ ...sheetFormData, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs"
                  >
                    <option value="filiere">Filière</option>
                    <option value="admission">Admission & Concours</option>
                    <option value="jour_j">Jour J</option>
                    <option value="frais">Frais</option>
                    <option value="institutionnel">Institutionnel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Langue</label>
                  <select
                    value={sheetFormData.language}
                    onChange={(e) => setSheetFormData({ ...sheetFormData, language: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Contenu officiel validé</label>
                <textarea
                  rows={4}
                  required
                  value={sheetFormData.content}
                  onChange={(e) => setSheetFormData({ ...sheetFormData, content: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Source officielle</label>
                <input
                  type="text"
                  required
                  value={sheetFormData.official_source}
                  onChange={(e) => setSheetFormData({ ...sheetFormData, official_source: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingSheet(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-poly-navy text-white shadow-xs hover:bg-poly-deepNavy cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
