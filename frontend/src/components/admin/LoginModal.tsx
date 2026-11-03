import React, { useState } from 'react';
import { X, Lock, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string, role: string, username: string) => void;
  language: 'fr' | 'en';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  language
}) => {
  const isEn = language === 'en';
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('AdminPassword2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(username.trim(), password);
      onLoginSuccess(res.access_token, res.role, res.username);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 relative transition-colors">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X size={18} />
        </button>

        <div className="flex items-center space-x-2.5 mb-5">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/60 text-poly-blue dark:text-blue-300 rounded-2xl flex items-center justify-center shrink-0">
            <Lock size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {isEn ? 'ENSPD Back-Office Login' : 'Connexion Back-Office'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isEn ? 'Role-based administration access' : 'Accès sécurisé par rôles (EA-01)'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-300 flex items-center gap-1.5">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isEn ? 'Username' : 'Identifiant'}
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-poly-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isEn ? 'Password' : 'Mot de passe'}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-poly-blue"
            />
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700 text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5">
            <div className="font-semibold text-slate-600 dark:text-slate-300">Comptes de test préconfigurés :</div>
            <div>• <span className="font-mono">admin</span> / <span className="font-mono">AdminPassword2026!</span> (Admin)</div>
            <div>• <span className="font-mono">contributeur</span> / <span className="font-mono">ContribPassword2026!</span></div>
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              {isEn ? 'Cancel' : 'Annuler'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-poly-blue hover:bg-blue-900 text-white px-5 py-2 text-xs font-bold rounded-xl shadow-md transition"
            >
              {loading ? '...' : isEn ? 'Sign In' : 'Se connecter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
