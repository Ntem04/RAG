import React, { useState } from 'react';
import {
  Lock,
  User,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  Eye,
  EyeOff,
  GraduationCap,
  BookOpen,
  Headphones,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';

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
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
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

  const handleGoogleMock = () => {
    setUsername('admin');
    setPassword('AdminPassword2026!');
    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  return (
    <div className="min-h-screen lg:h-screen w-full flex flex-col lg:flex-row bg-[#071526] text-white relative overflow-y-auto lg:overflow-hidden select-none">
      {/* Back button (floating top-left) */}
      <button
        onClick={onCancel}
        className="absolute top-4 left-4 z-30 inline-flex items-center gap-2 text-xs font-bold text-slate-200 hover:text-white bg-slate-900/80 hover:bg-slate-900 px-3 py-1.5 rounded-md backdrop-blur-xs transition border border-slate-700/60 cursor-pointer shadow-sm"
      >
        <ArrowLeft size={14} />
        <span>{isEn ? "Back to Portal" : "Retour au portail"}</span>
      </button>

      {/* LEFT SECTION: Vertically centered form container with clean responsive padding */}
      <div className="w-full lg:w-[42%] xl:w-[38%] min-h-screen lg:min-h-0 lg:h-full flex flex-col justify-center items-center px-4 sm:px-8 lg:px-10 py-12 lg:py-4 z-20 relative bg-gradient-to-br from-[#061222] via-[#091b33] to-[#0a1e38] border-r border-[#1a2d48]/40 shadow-2xl overflow-y-auto lg:overflow-hidden no-scrollbar">
        {/* Decorative background glow */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-b from-[#d4af37]/20 to-transparent blur-3xl transform rotate-45" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 blur-2xl" />
        </div>

        {/* Centered Form Wrapper */}
        <div className="w-full max-w-sm sm:max-w-md my-auto flex flex-col justify-center space-y-3 sm:space-y-4 relative z-10">
          {/* Logo & Headline */}
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <img
                src="/images/enspd-logo.webp"
                alt="ENSPD Logo"
                className="w-11 h-11 object-contain shrink-0 drop-shadow-md"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-white font-sans">
                    ENSPD
                  </span>
                  <span className="font-serif font-black text-xl tracking-wider text-[#d4af37] uppercase">
                    POLY
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 leading-tight">
                  École Nationale Supérieure Polytechnique de Douala
                </p>
              </div>
            </div>

            <div className="pt-2">
              <div className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-none">
                Bienvenue sur <span className="font-serif font-black text-[#d4af37] text-2xl sm:text-3xl ml-1">POLY</span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 pt-1 font-normal leading-relaxed">
                Votre assistant intelligent pour une orientation réussie à l'ENSPD.
              </p>
            </div>
          </div>

          {/* White Card with Explicit Crisp Dark Text */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 text-slate-900 shadow-2xl space-y-3.5 w-full border border-slate-100">
            {/* Header inside card */}
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                <User size={18} />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                  Connexion à votre espace
                </h2>
                <p className="text-[11px] text-slate-500 font-medium">
                  Accédez à votre compte pour continuer
                </p>
              </div>
            </div>

            {error && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2 font-medium">
                <AlertCircle size={14} className="shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Identifiant */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User size={15} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Identifiant ou Matricule"
                  className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent transition font-semibold"
                />
              </div>

              {/* Mot de passe */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={15} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe"
                  className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg pl-9 pr-9 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent transition font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ border: 'none', outline: 'none', background: 'transparent', boxShadow: 'none' }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer border-0 outline-none focus:outline-none focus:ring-0 bg-transparent ring-0 shadow-none appearance-none"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Se souvenir de moi & Mot de passe oublié */}
              <div className="flex items-center justify-between text-[11px] sm:text-xs pt-0.5">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-[#d4af37] focus:ring-[#d4af37] cursor-pointer"
                  />
                  <span>Se souvenir de moi</span>
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Pour réinitialiser votre mot de passe, contactez la direction du Datacenter ENSPD.");
                  }}
                  className="text-[#b8861b] hover:text-[#94680e] hover:underline font-bold"
                >
                  Mot de passe oublié ?
                </a>
              </div>

              {/* Se connecter button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#d4af37] hover:bg-[#c49f2b] active:bg-[#b08d20] text-white font-extrabold text-xs sm:text-sm py-2.5 rounded-lg transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <span>{loading ? "Vérification en cours..." : "Se connecter"}</span>
                <ArrowRight size={15} />
              </button>
            </form>

            {/* Ou divider */}
            <div className="relative flex items-center justify-center py-0.5">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-2.5 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                Ou
              </span>
              <div className="border-t border-slate-200 w-full" />
            </div>

            {/* Se connecter avec Google */}
            <button
              type="button"
              onClick={handleGoogleMock}
              className="w-full bg-[#0a192f] hover:bg-[#071324] text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-2.5 border border-slate-700 transition cursor-pointer shadow-2xs"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Se connecter avec Google</span>
            </button>
          </div>

          {/* Footnote: Connexion sécurisée */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-300 font-medium">
            <ShieldCheck size={13} className="text-[#d4af37]" />
            <span>Connexion sécurisée • Données protégées</span>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION: Campus courtyard photograph */}
      <div className="hidden lg:block lg:w-[58%] xl:w-[62%] h-full relative overflow-hidden">
        {/* Campus Courtyard Photograph */}
        <img
          src="/images/campus-courtyard-hq.webp"
          alt="Campus ENSPD Douala Courtyard"
          className="w-full h-full object-cover object-center transform scale-102"
        />

        {/* Gradient overlays for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/60 pointer-events-none" />

        {/* Gold accent line at left edge */}
        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-[#d4af37] via-[#d4af37]/60 to-transparent pointer-events-none" />

        {/* Top Right Motto */}
        <div className="absolute top-8 right-8 text-right z-10">
          <div className="font-serif italic font-bold text-xl xl:text-2xl text-white tracking-wider drop-shadow-lg">
            Former • Innover • Réussir
          </div>
          <div className="mt-1.5 h-0.5 w-40 bg-gradient-to-l from-[#d4af37] to-transparent ml-auto" />
        </div>

        {/* Bottom Area: 3 Gold Feature Badges + Pin Location + Gold Corner Polygon */}
        <div className="absolute bottom-6 left-8 right-8 z-10 space-y-4">
          {/* 3 Badges in row */}
          <div className="flex items-center justify-around bg-black/45 backdrop-blur-md border border-white/15 rounded-xl py-2.5 px-3 shadow-xl">
            <div className="flex items-center gap-2.5 text-center sm:text-left">
              <div className="w-8 h-8 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shrink-0">
                <GraduationCap size={16} />
              </div>
              <div>
                <div className="text-[11px] font-extrabold text-white">Orientation</div>
                <div className="text-[10px] text-slate-300">personnalisée</div>
              </div>
            </div>

            <div className="h-6 w-px bg-white/20" />

            <div className="flex items-center gap-2.5 text-center sm:text-left">
              <div className="w-8 h-8 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shrink-0">
                <BookOpen size={16} />
              </div>
              <div>
                <div className="text-[11px] font-extrabold text-white">Informations</div>
                <div className="text-[10px] text-slate-300">fiables</div>
              </div>
            </div>

            <div className="h-6 w-px bg-white/20" />

            <div className="flex items-center gap-2.5 text-center sm:text-left">
              <div className="w-8 h-8 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shrink-0">
                <Headphones size={16} />
              </div>
              <div>
                <div className="text-[11px] font-extrabold text-white">Assistance</div>
                <div className="text-[10px] text-slate-300">24h/24</div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Gold Line + Location Pin */}
          <div className="flex items-center justify-between text-xs text-white">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#d4af37]/60 to-[#d4af37] mr-4" />
            <div className="flex items-center gap-1.5 font-bold shrink-0 text-[11px]">
              <MapPin size={13} className="text-[#d4af37]" />
              <span>ENSPD – Douala, Cameroun</span>
            </div>
          </div>
        </div>

        {/* Bottom Right Gold Geometric Triangle Polygon */}
        <div
          className="absolute bottom-0 right-0 w-28 h-28 bg-[#d4af37] pointer-events-none z-20 shadow-2xl"
          style={{
            clipPath: 'polygon(100% 0, 0 100%, 100% 100%)'
          }}
        />
      </div>
    </div>
  );
};
