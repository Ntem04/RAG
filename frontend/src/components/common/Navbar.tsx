import React from "react";
import {
  MessageSquare,
  Compass,
  Calendar,
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

  const navItems = [
    { id: "home" as const, label: isEn ? "Home" : "Accueil", icon: null },
    { id: "chat" as const, label: "Chat", icon: <MessageSquare size={15} /> },
    { id: "orientation" as const, label: "Orientation", icon: <Compass size={15} /> },
    { id: "jour_j" as const, label: isEn ? "Events" : "Événements", icon: <Calendar size={15} /> },
    { id: "apropos" as const, label: isEn ? "About" : "À propos", icon: <Info size={15} /> },
  ];

  return (
    <header className="bg-white dark:bg-[#0b1e33] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors shadow-2xs">
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
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                ENSPD
              </span>
              <span className="font-display font-bold text-base tracking-wider text-poly-goldDark dark:text-poly-gold uppercase">
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

        {/* Center Navigation Links - Clean, Professional (NO weird AI yellow pills) */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`relative px-3.5 py-2 rounded-md font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isActive
                    ? "text-poly-navy dark:text-white font-bold bg-slate-100 dark:bg-white/10"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-poly-gold rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Tools: Dark mode, Lang & [Espace admin] button */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
          >
            {isDark ? (
              <Sun size={16} className="text-poly-gold" />
            ) : (
              <Moon size={16} className="text-slate-600" />
            )}
          </button>

          {/* Language Switch Button */}
          <button
            onClick={() => setLanguage(language === "fr" ? "en" : "fr")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Globe size={13} className="text-poly-gold" />
            <span>{language.toUpperCase()}</span>
          </button>

          {/* Espace admin button (matching mockup design) */}
          <button
            onClick={() => setCurrentTab("admin")}
            className="bg-poly-navy hover:bg-[#0a233b] dark:bg-[#122e4d] dark:hover:bg-[#183c63] text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-lg transition shadow-xs flex items-center gap-2 border border-slate-700/40 cursor-pointer"
          >
            <Lock size={13} className="text-poly-gold" />
            <span>{isEn ? "Admin Portal" : "Espace admin"}</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation bottom bar */}
      <div className="md:hidden flex border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1e33] text-xs">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex-1 py-2.5 flex flex-col justify-center items-center gap-1 transition-colors ${
                isActive
                  ? "text-poly-gold font-bold border-b-2 border-poly-gold"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {item.icon}
              <span className="text-[11px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
