import React, { useState } from 'react';
import { Lock, User, AlertCircle, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { Reveal } from '../common/Reveal';

interface LoginPageProps {
  onLoginSuccess: (token: string, role: string, username: string) => void;
  onCancel: () => void;
  language: 'fr' | 'en';
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onCancel,
  language
}) => {
  const isEn = language === 'en';
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('AdminPassword2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(username.trim(), password);
      onLoginSuccess(res.access_token, res.role, res.username);
    } catch (err: any) {
      setError(err.message || (isEn ? 'Invalid credentials' : 'Identifiants incorrects'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 animate-fade-in">
      {/* Left Column: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-16 z-10">
        <div>
          {/* Top Back Button */}
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-poly-navy dark:hover:text-white transition cursor-pointer mb-8"
          >
            <ArrowLeft size={15} />
            <span>{isEn ? "Back to Portal" : "Retour au portail"}</span>
          </button>

          <Reveal direction="up" delay={50}>
            {/* Branding Header */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src="/images/enspd-logo.webp"
                  alt="ENSPD Logo"
                  className="w-12 h-12 object-contain shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                      ENSPD
                    </span>
                    <span className="font-display font-bold text-base tracking-wider text-poly-goldDark dark:text-poly-gold uppercase">
                      POLY
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isEn ? "Polytechnic Higher National School" : "École Nationale Supérieure Polytechnique de Douala"}
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <h1 className="text-2xl sm:text-3xl font-black text-poly-navy dark:text-white tracking-tight">
                  {isEn ? "Administrative Portal" : "Espace Administration"}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {isEn
                    ? "Secure sign-in for admissions committee, teachers and administrators (EA-01)."
                    : "Accès sécurisé pour la scolarité, la direction et les enseignants (EA-01)."}
                </p>
              </div>
            </div>
          </Reveal>

          {/* Login Form */}
          <Reveal direction="up" delay={150}>
            <div className="mt-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
              {error && (
                <div className="p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-md text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isEn ? "Username or Matricule" : "Identifiant ou Matricule"}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={isEn ? "Enter your username" : "Ex: admin, contributeur, lecteur"}
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-md pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-poly-navy dark:focus:ring-poly-gold transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      {isEn ? "Security Password" : "Mot de passe sécurisé"}
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {isEn ? "Encrypted" : "Chiffré SHA-256"}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-md pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-poly-navy dark:focus:ring-poly-gold transition"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-poly-navy hover:bg-poly-deepNavy dark:bg-poly-gold dark:hover:bg-poly-goldHover text-white font-bold text-xs sm:text-sm py-3 rounded-md transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Lock size={15} />
                    <span>{loading ? (isEn ? "Authenticating..." : "Vérification en cours...") : (isEn ? "Access Admin Dashboard" : "Se connecter")}</span>
                  </button>
                </div>
              </form>

              {/* Demo hints */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Comptes de test :</span>
                <span className="font-mono text-poly-navy dark:text-poly-gold font-bold">admin / AdminPassword2026!</span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Bottom Security Footer */}
        <div className="pt-8 text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-2">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Accès sous protocole HTTPS et authentification JWT RBAC conforme MINESUP.</span>
        </div>
      </div>

      {/* Right Column: ENSPD Building Photography & Prestige Presentation */}
      <div className="w-full lg:w-1/2 relative min-h-[420px] lg:min-h-auto overflow-hidden hidden md:block">
        <img
          src="/images/campus-balcony.webp"
          alt="Bâtiment Campus ENSPD Ndogbong"
          className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-poly-deepNavy/95 via-poly-navy/80 to-poly-deepNavy/70 flex flex-col justify-between p-8 sm:p-12 lg:p-16 text-white">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-poly-gold bg-black/40 backdrop-blur-xs px-3 py-1 rounded-md border border-poly-gold/30">
              Campus de Ndogbong, Douala
            </span>
          </div>

          <Reveal direction="left" delay={200} className="space-y-6 max-w-lg">
            <div className="space-y-3">
              <span className="font-display text-poly-gold text-2xl font-bold tracking-widest block">
                POLY
              </span>
              <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">
                L'Excellence Polytechnique au cœur de Douala
              </h2>
              <p className="text-sm text-slate-200 leading-relaxed">
                Supervisez en temps réel les flux d'orientation, validez les fiches officielles de formation et pilotez les inscriptions de l'ENSPD.
              </p>
            </div>

            {/* Badges bar */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-white/10 backdrop-blur-sm border border-white/15 p-3.5 rounded-md space-y-1">
                <div className="text-xl font-black text-poly-gold">10</div>
                <div className="text-xs font-semibold text-slate-200">Départements d'Ingénierie</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/15 p-3.5 rounded-md space-y-1">
                <div className="text-xl font-black text-poly-gold">+5 000</div>
                <div className="text-xs font-semibold text-slate-200">Élèves-Ingénieurs</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-300 pt-2">
              <CheckCircle2 size={15} className="text-poly-gold shrink-0" />
              <span>Système officiel d'assistance et de supervision ENSPD</span>
            </div>
          </Reveal>

          <div className="text-[11px] text-slate-400">
            © 2026 École Nationale Supérieure Polytechnique de Douala - Tous droits réservés.
          </div>
        </div>
      </div>
    </div>
  );
};

