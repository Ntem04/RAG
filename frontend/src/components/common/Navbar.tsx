import React from "react";
import {
  MessageSquare,
  Compass,
  Calendar,
  ShieldCheck,
  Globe,
  Sun,
  Moon,
  Info,
  Lock,
} from "lucide-react";

interface NavbarProps {
  currentTab: "home" | "chat" | "orientation" | "jour_j" | "apropos" | "admin";
  setCurrentTab: (tab: "home" | "chat" | "orientation" | "jour_j" | "apropos" | "admin") => void;
  language: "fr" | "en";
  setLanguage: (lang: "fr" | "en") => void;
  isKiosk: boolean;
  setIsKiosk: (kiosk: boolean) => void;
  onResetSession: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  language,
  setLanguage,
  isDark,
  toggleTheme,
}) => {
  const isEn = language === "en";

  return (
    <header className="bg-white dark:bg-poly-deepNavy border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Brand with official ENSPD Logo */}
        <div
          onClick={() => setCurrentTab("home")}
          className="flex items-center space-x-3 cursor-pointer select-none group"
        >
          <img
            src="/images/enspd-logo.webp"
            alt="ENSPD Logo"
            className="w-11 h-11 object-contain shrink-0 group-hover:scale-105 transition-transform"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-poly-navy dark:text-white">
                ENSPD
              </span>
              <span className="text-[10px] uppercase font-bold bg-poly-gold text-slate-900 px-1.5 py-0.5 rounded-sm">
                POLY
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-none hidden sm:block">
              {isEn
                ? "National Higher Polytechnic School of Douala"
                : "École Nationale Supérieure Polytechnique de Douala"}
            </p>
          </div>
        </div>

        {/* Center Navigation Links (Matching Mockup 01. Accueil) */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm font-medium">
          <button
            onClick={() => setCurrentTab("home")}
            className={`px-3.5 py-2 rounded-lg transition-colors ${
              currentTab === "home"
                ? "text-poly-goldDark dark:text-poly-gold font-bold bg-amber-50/60 dark:bg-poly-gold/10"
                : "text-slate-700 dark:text-slate-200 hover:text-poly-navy dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {isEn ? "Home" : "Accueil"}
          </button>

          <button
            onClick={() => setCurrentTab("chat")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors ${
              currentTab === "chat"
                ? "text-poly-goldDark dark:text-poly-gold font-bold bg-amber-50/60 dark:bg-poly-gold/10"
                : "text-slate-700 dark:text-slate-200 hover:text-poly-navy dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <MessageSquare size={16} />
            <span>Chat</span>
          </button>

          <button
            onClick={() => setCurrentTab("orientation")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors ${
              currentTab === "orientation"
                ? "text-poly-goldDark dark:text-poly-gold font-bold bg-amber-50/60 dark:bg-poly-gold/10"
                : "text-slate-700 dark:text-slate-200 hover:text-poly-navy dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Compass size={16} />
            <span>Orientation</span>
          </button>

          <button
            onClick={() => setCurrentTab("jour_j")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors ${
              currentTab === "jour_j"
                ? "text-poly-goldDark dark:text-poly-gold font-bold bg-amber-50/60 dark:bg-poly-gold/10"
                : "text-slate-700 dark:text-slate-200 hover:text-poly-navy dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Calendar size={16} />
            <span>{isEn ? "Events" : "Événements"}</span>
          </button>

          <button
            onClick={() => setCurrentTab("apropos")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors ${
              currentTab === "apropos"
                ? "text-poly-goldDark dark:text-poly-gold font-bold bg-amber-50/60 dark:bg-poly-gold/10"
                : "text-slate-700 dark:text-slate-200 hover:text-poly-navy dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Info size={16} />
            <span>{isEn ? "About" : "À propos"}</span>
          </button>
        </nav>

        {/* Right Action Tools: Dark mode, Lang & [Espace admin] button */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
          >
            {isDark ? <Sun size={17} className="text-poly-gold" /> : <Moon size={17} />}
          </button>

          {/* Language Switch */}
          <button
            onClick={() => setLanguage(language === "fr" ? "en" : "fr")}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Globe size={13} className="text-poly-gold" />
            <span>{language.toUpperCase()}</span>
          </button>

          {/* Espace admin button (as styled on mockup) */}
          <button
            onClick={() => setCurrentTab("admin")}
            className="bg-poly-navy hover:bg-poly-deepNavy dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm px-3.5 sm:px-4 py-2 rounded-lg transition shadow-xs flex items-center gap-1.5 border border-slate-700/30"
          >
            <Lock size={13} className="text-poly-gold" />
            <span>{isEn ? "Admin Portal" : "Espace admin"}</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation bottom bar */}
      <div className="md:hidden flex border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-poly-deepNavy text-xs">
        <button
          onClick={() => setCurrentTab("home")}
          className={`flex-1 py-2.5 flex flex-col justify-center items-center gap-0.5 ${
            currentTab === "home"
              ? "text-poly-gold font-bold"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          <span>Accueil</span>
        </button>
        <button
          onClick={() => setCurrentTab("chat")}
          className={`flex-1 py-2.5 flex flex-col justify-center items-center gap-0.5 ${
            currentTab === "chat"
              ? "text-poly-gold font-bold"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          <MessageSquare size={15} />
          <span>Chat</span>
        </button>
        <button
          onClick={() => setCurrentTab("orientation")}
          className={`flex-1 py-2.5 flex flex-col justify-center items-center gap-0.5 ${
            currentTab === "orientation"
              ? "text-poly-gold font-bold"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          <Compass size={15} />
          <span>Orientation</span>
        </button>
        <button
          onClick={() => setCurrentTab("jour_j")}
          className={`flex-1 py-2.5 flex flex-col justify-center items-center gap-0.5 ${
            currentTab === "jour_j"
              ? "text-poly-gold font-bold"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          <Calendar size={15} />
          <span>Jour J</span>
        </button>
      </div>
    </header>
  );
};
