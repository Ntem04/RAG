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
import { KnowledgeSheet, DashboardStats, CallbackRequest, UnansweredQuestion } from '../../types';

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
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                currentSection === 'overview'
                  ? 'bg-poly-gold text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart3 size={16} />
              <span>Tableau de bord</span>
            </button>

            <button
              onClick={() => setCurrentSection('callbacks')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                currentSection === 'callbacks'
                  ? 'bg-poly-gold text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <MessageSquare size={16} />
              <span>Demandes de rappel</span>
              {callbacks.filter(c => c.status === 'pending').length > 0 && (
                <span className="ml-auto bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-md">
                  {callbacks.filter(c => c.status === 'pending').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentSection('sheets')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                currentSection === 'sheets'
                  ? 'bg-poly-gold text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText size={16} />
              <span>Base de connaissances</span>
            </button>

            <button
              onClick={() => setCurrentSection('unanswered')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                currentSection === 'unanswered'
                  ? 'bg-poly-gold text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <HelpCircle size={16} />
              <span>Questions non traitées</span>
              {unanswered.filter(u => u.status === 'pending').length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-md">
                  {unanswered.filter(u => u.status === 'pending').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentSection('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                currentSection === 'settings'
                  ? 'bg-poly-gold text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings size={16} />
              <span>Paramètres</span>
            </button>
          </nav>
        </div>

        {/* User Info & Déconnexion */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="px-2">
            <div className="text-xs text-white font-bold">{username}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Rôle : {role}</div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-red-400 hover:bg-red-950/20 transition cursor-pointer"
          >
            <LogOut size={15} />
            <span>Déconnexion</span>
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
                  Vue d'ensemble
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Statistiques et métriques de consultation du tuteur Poly
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none">
                  <option>7 derniers jours</option>
                  <option>30 derniers jours</option>
                  <option>Toute la période</option>
                </select>
              </div>
            </div>

            {/* 4 Metric Cards from Mockup 07 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Questions */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-poly-navy dark:text-blue-300 flex items-center justify-center">
                  <MessageSquare size={20} />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-poly-navy dark:text-white">
                  {stats ? stats.total_questions : '2 485'}
                </div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Questions posées
                </div>
              </div>

              {/* Card 2: Taux de satisfaction */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 size={20} />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-poly-navy dark:text-white">
                  {stats && stats.satisfaction_rate ? `${stats.satisfaction_rate}%` : '94%'}
                </div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Taux de satisfaction
                </div>
              </div>

              {/* Card 3: Utilisateurs */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Users size={20} />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-poly-navy dark:text-white">
                  {stats ? stats.total_conversations : '842'}
                </div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Utilisateurs uniques
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
                  Fiches officielles validées
                </div>
              </div>
            </div>

            {/* Smooth SVG Activity Chart matching Mockup 07 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-poly-navy dark:text-white">
                    Activité des conversations
                  </h3>
                  <p className="text-xs text-slate-400">Volume de consultations journalières</p>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                  +18.4% cette semaine
                </span>
              </div>

              {/* SVG Line Chart */}
              <div className="w-full h-52 sm:h-64">
                <svg viewBox="0 0 700 240" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0f3b6c" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#0f3b6c" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  <line x1="50" y1="30" x2="680" y2="30" stroke="#e2e8f0" strokeDasharray="3 3" className="dark:stroke-slate-800" />
                  <line x1="50" y1="80" x2="680" y2="80" stroke="#e2e8f0" strokeDasharray="3 3" className="dark:stroke-slate-800" />
                  <line x1="50" y1="130" x2="680" y2="130" stroke="#e2e8f0" strokeDasharray="3 3" className="dark:stroke-slate-800" />
                  <line x1="50" y1="180" x2="680" y2="180" stroke="#e2e8f0" strokeDasharray="3 3" className="dark:stroke-slate-800" />

                  {/* Y Axis labels */}
                  <text x="25" y="34" className="text-[10px] fill-slate-400">3k</text>
                  <text x="25" y="84" className="text-[10px] fill-slate-400">2k</text>
                  <text x="25" y="134" className="text-[10px] fill-slate-400">1k</text>
                  <text x="30" y="184" className="text-[10px] fill-slate-400">0</text>

                  {/* Area fill */}
                  <path
                    d="M 60 170 Q 150 160, 240 140 T 420 110 T 560 70 T 670 45 L 670 190 L 60 190 Z"
                    fill="url(#chartGradient)"
                  />
                  {/* Line curve */}
                  <path
                    d="M 60 170 Q 150 160, 240 140 T 420 110 T 560 70 T 670 45"
                    fill="none"
                    stroke="#0f3b6c"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className="dark:stroke-poly-gold"
                  />
                  {/* Data points */}
                  <circle cx="60" cy="170" r="4.5" fill="#0f3b6c" className="dark:fill-poly-gold" />
                  <circle cx="160" cy="155" r="4.5" fill="#0f3b6c" className="dark:fill-poly-gold" />
                  <circle cx="260" cy="135" r="4.5" fill="#0f3b6c" className="dark:fill-poly-gold" />
                  <circle cx="360" cy="120" r="4.5" fill="#0f3b6c" className="dark:fill-poly-gold" />
                  <circle cx="460" cy="95" r="4.5" fill="#0f3b6c" className="dark:fill-poly-gold" />
                  <circle cx="560" cy="70" r="4.5" fill="#0f3b6c" className="dark:fill-poly-gold" />
                  <circle cx="670" cy="45" r="5.5" fill="#c59b27" stroke="#ffffff" strokeWidth="2" />

                  {/* X Axis days labels */}
                  <text x="50" y="215" className="text-[11px] fill-slate-400 font-semibold">Lun</text>
                  <text x="150" y="215" className="text-[11px] fill-slate-400 font-semibold">Mar</text>
                  <text x="250" y="215" className="text-[11px] fill-slate-400 font-semibold">Mer</text>
                  <text x="350" y="215" className="text-[11px] fill-slate-400 font-semibold">Jeu</text>
                  <text x="450" y="215" className="text-[11px] fill-slate-400 font-semibold">Ven</text>
                  <text x="550" y="215" className="text-[11px] fill-slate-400 font-semibold">Sam</text>
                  <text x="655" y="215" className="text-[11px] fill-slate-400 font-semibold">Dim</text>
                </svg>
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
                  Base de connaissances
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Gestion et validation des fiches officielles exploitées par Poly
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
                  <span>Ajouter un article</span>
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
                placeholder="Rechercher un article..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-poly-navy"
              />
            </div>

            {/* Table from Mockup 08 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-4">Titre</th>
                      <th className="p-4">Catégorie</th>
                      <th className="p-4">Statut</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredSheets.map((sheet) => (
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
                            {sheet.status === 'validated' ? 'Validé' : 'En révision'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {role === 'admin' && sheet.status !== 'validated' && (
                              <button
                                onClick={() => handleValidateSheet(sheet.id)}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition"
                                title="Valider la fiche"
                              >
                                <Check size={14} />
                              </button>
                            )}
                            {(role === 'admin' || role === 'contributeur') && (
                              <button
                                onClick={() => handleOpenEdit(sheet)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-poly-navy dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                title="Modifier"
                              >
                                <Edit3 size={14} />
                              </button>
                            )}
                            {role === 'admin' && (
                              <button
                                onClick={() => handleDeleteSheet(sheet.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                                title="Supprimer"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination from Mockup 08 */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>{filteredSheets.length} fiches enregistrées</span>
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
                Questions non répondues
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Questions sous le seuil de similarité nécessitant la création de nouvelles fiches (EA-07)
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
                  placeholder="Rechercher une question..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-poly-navy"
                />
              </div>

              <select
                value={unansweredStatusFilter}
                onChange={(e) => setUnansweredStatusFilter(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="all">Tous statuts</option>
                <option value="pending">Non traitée</option>
                <option value="reviewed">Traitée</option>
              </select>
            </div>

            {/* Table from Mockup 09 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-4">#</th>
                      <th className="p-4">Question</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Statut</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredUnanswered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400">
                          Aucune question sans réponse enregistrée.
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
                              {q.status === 'reviewed' ? 'Traitée' : 'Non traitée'}
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
                              Créer fiche
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
                Paramètres
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Configuration générale et interrupteur d'urgence du tuteur Poly
              </p>
            </div>

            {/* Tabs from Mockup 10 */}
            <div className="flex items-center space-x-1 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
              <button className="px-3.5 py-1.5 rounded-lg bg-poly-navy text-white shadow-2xs">
                Général
              </button>
              <button className="px-3.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white">
                Sécurité
              </button>
              <button className="px-3.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white">
                Rôles & Accès
              </button>
              <button className="px-3.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white">
                Langues
              </button>
            </div>

            {/* Card 1: Informations de l'assistant (Mockup 10) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <div>
                <h3 className="font-extrabold text-base text-poly-navy dark:text-white">
                  Informations du guide
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Personnalisez le comportement et l'identité de Poly.
                </p>
              </div>

              <div className="space-y-3 max-w-lg">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nom du service
                  </label>
                  <input
                    type="text"
                    defaultValue="Poly – Tuteur officiel ENSPD"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Message d'accueil par défaut
                  </label>
                  <textarea
                    rows={2}
                    defaultValue="Bonjour ! Je suis Poly, votre guide d'orientation. Posez-moi vos questions sur l'ENSPD."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <button className="bg-poly-gold hover:bg-poly-goldHover text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-xs cursor-pointer">
                  Enregistrer les modifications
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
                      Maintenance & Interrupteur d'urgence (EA-10)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                    Activez ce mode en cas d'incident ou de maintenance imprévue pour afficher immédiatement le message d'interruption aux visiteurs.
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
                  ⚠️ Mode maintenance actif : les conversations sont suspendues et renvoient vers le stand d'accueil de l'ENSPD.
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
                Demandes de rappel téléphonique
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Coordonnées laissées par les visiteurs pour être recontactés par un conseiller ENSPD
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-4">Visiteur</th>
                    <th className="p-4">Téléphone</th>
                    <th className="p-4">Sujet</th>
                    <th className="p-4">Statut</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {callbacks.map((cb) => (
                    <tr key={cb.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-4 font-bold text-poly-navy dark:text-white">{cb.full_name}</td>
                      <td className="p-4 font-mono font-bold text-slate-700 dark:text-slate-200">{cb.phone_number}</td>
                      <td className="p-4 text-slate-500">{cb.topic}</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          cb.status === 'processed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {cb.status === 'processed' ? 'Traité' : 'En attente'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={async () => {
                            await api.updateCallbackStatus(token, cb.id, cb.status === 'processed' ? 'pending' : 'processed');
                            loadData();
                          }}
                          className="text-[11px] font-bold text-poly-navy dark:text-poly-gold hover:underline"
                        >
                          {cb.status === 'processed' ? 'Marquer en attente' : 'Marquer traité'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
