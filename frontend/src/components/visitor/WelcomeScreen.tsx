import React from 'react';
import {
  Compass,
  PhoneCall,
  Calendar,
  Layers,
  Users,
  Award,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Reveal } from '../common/Reveal';

interface WelcomeScreenProps {
  language: 'fr' | 'en';
  profile: string;
  setProfile: (p: string) => void;
  onStartChat: (initialMessage?: string) => void;
  onOpenOrientation: () => void;
  onOpenCallback: () => void;
  onOpenEvents: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  language,
  profile,
  setProfile,
  onStartChat,
  onOpenOrientation,
  onOpenCallback,
  onOpenEvents
}) => {
  const isEn = language === 'en';

  const stats = [
    {
      value: "10",
      label: isEn ? "Engineering Tracks" : "Filières d'ingénieurs",
      sub: isEn ? "11 Academic Departments" : "11 Départements académiques",
      icon: <Layers className="w-5 h-5 text-poly-gold" />
    },
    {
      value: "+5 000",
      label: isEn ? "Students" : "Étudiants formés",
      sub: isEn ? "Active Campus Community" : "Communauté active",
      icon: <Users className="w-5 h-5 text-poly-gold" />
    },
    {
      value: "1er",
      label: isEn ? "Polytechnic of Cameroon" : "ENSPD du Cameroun",
      sub: isEn ? "Pioneer Center of Excellence" : "Pôle d'excellence national",
      icon: <Award className="w-5 h-5 text-poly-gold" />
    },
    {
      value: isEn ? "Excellence" : "Une formation",
      label: isEn ? "Accredited Programs" : "d'excellence",
      sub: isEn ? "MINESUP & International" : "Diplômes d'ingénieur d'État",
      icon: <GraduationCap className="w-5 h-5 text-poly-gold" />
    }
  ];

  return (
    <div className="space-y-10 pb-16 animate-fade-in">
      {/* 01. Accueil - Hero Section (Matching Mockup 01. Accueil) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <div className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white rounded-3xl p-5 sm:p-8 lg:p-12 shadow-lg border border-slate-200 dark:border-slate-800 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Subtle geometric lines in background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Left Text Column */}
          <Reveal direction="right" delay={50} className="w-full lg:max-w-xl space-y-4 z-10 text-left">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#d4af37] bg-amber-50 dark:bg-[#d4af37]/15 px-3 py-1 rounded-md border border-amber-200 dark:border-[#d4af37]/30">
              <Sparkles size={13} />
              {isEn ? "ENSPD Douala • Orientation Guide" : "ENSPD Douala • Tuteur d'Orientation"}
            </span>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
              {isEn ? "Welcome to ENSPD" : "Bienvenue à l'ENSPD"}
              <span className="block text-[#d4af37] mt-1 text-xl sm:text-3xl lg:text-4xl font-extrabold">
                {isEn ? "Your future begins here" : "Votre avenir commence ici"}
              </span>
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-base leading-relaxed max-w-lg font-medium">
              {isEn
                ? "Discover our 10 engineering tracks, receive personalized academic counseling, and prepare your entrance into the leading engineering school."
                : "Découvrez nos 10 filières d'ingénieurs, obtenez des conseils personnalisés et préparez votre orientation vers la grande école d'ingénieurs de référence."}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => onStartChat()}
                className="bg-[#d4af37] hover:bg-[#c29c29] text-white font-bold text-sm px-6 py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>{isEn ? "Start Consultation" : "Commencer"}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onOpenOrientation}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white font-bold text-sm px-5 py-3 rounded-xl transition border border-slate-300 dark:border-white/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Compass size={16} className="text-[#d4af37]" />
                <span>{isEn ? "Orientation Test" : "Test d'orientation"}</span>
              </button>
            </div>
          </Reveal>

          {/* Right Campus Courtyard Image Column */}
          <Reveal direction="left" delay={150} className="lg:max-w-lg w-full z-10">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border-2 border-slate-200 dark:border-white/15 group">
              <img
                src="/images/campus-courtyard-hq.webp"
                alt="Campus ENSPD PK17 Douala"
                className="w-full h-56 sm:h-72 lg:h-80 object-cover group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4">
                <span className="text-xs text-white font-medium flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-[#d4af37]" />
                  Campus ENSPD • PK17, Douala
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 4 Stats Cards Bar (Matching Mockup 01. Accueil) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((s, idx) => (
            <Reveal key={idx} direction="up" delay={100 + (idx * 60)}>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition text-left space-y-1 group">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-md bg-amber-50 dark:bg-poly-gold/10 flex items-center justify-center shrink-0 mb-2 sm:mb-3 group-hover:scale-105 transition-transform">
                  {s.icon}
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-black text-poly-navy dark:text-white truncate">
                  {s.value}
                </div>
                <div className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  {s.label}
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 leading-tight">
                  {s.sub}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Quick Launch Pathways (Mockup 05 & 06 Previews) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Card: Journées d'Orientation 2026 */}
        <Reveal direction="up" delay={250}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xs flex flex-col justify-between space-y-4 text-left h-full">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-poly-gold bg-amber-50 dark:bg-poly-gold/10 px-2.5 py-0.5 rounded-md">
                <Calendar size={13} />
                {isEn ? "Campus Event" : "Événement Campus"}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-poly-navy dark:text-white">
                {isEn ? "ENSPD Orientation Days 2026" : "Journées d'orientation 2026"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {isEn
                  ? "Discover the campus, attend plenary conferences in Amphitheatre 300, and meet department chairs and student ambassadors."
                  : "Découvrez l'ENSPD, rencontrez les chefs de départements et échangez avec les étudiants ambassadeurs lors des visites guidées."}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                15 - 17 Novembre 2026 • Campus PK17, Douala
              </div>
              <button
                onClick={onOpenEvents}
                className="bg-poly-navy hover:bg-poly-deepNavy text-white font-semibold text-xs px-4 py-2.5 rounded-md transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>{isEn ? "View schedule" : "Voir le programme"}</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </Reveal>

        {/* Card: Demande de Rappel */}
        <Reveal direction="up" delay={300}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-4 text-left h-full">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-md">
                <PhoneCall size={13} />
                {isEn ? "Direct Contact" : "Contact Direct"}
              </span>
              <h3 className="text-xl font-bold text-poly-navy dark:text-white">
                {isEn ? "Speak with an Advisor" : "Demande de rappel personnalisé"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {isEn
                  ? "Leave your details to receive an official callback from our pedagogical counselors regarding admission requirements."
                  : "Laissez vos coordonnées pour être recontacté(e) directement par les conseillers pédagogiques et la scolarité de l'ENSPD."}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {isEn ? "Free & Confidential" : "Gratuit et sans engagement"}
              </div>
              <button
                onClick={onOpenCallback}
                className="bg-poly-gold hover:bg-poly-goldHover text-white font-bold text-xs px-4 py-2.5 rounded-md transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>{isEn ? "Request Callback" : "Être rappelé(e)"}</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Bottom Campus Banner (Matching Mockup Bottom Right) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <Reveal direction="up" delay={350}>
          <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
            <img
              src="/images/campus-fountain.webp"
              alt="Campus ENSPD"
              className="w-full h-44 sm:h-52 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-poly-deepNavy/90 via-poly-navy/80 to-transparent flex items-center px-6 sm:px-12 text-left">
              <div className="max-w-md space-y-1.5">
                <span className="text-xs font-bold text-poly-gold uppercase tracking-wider">
                  POLY • ENSPD
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {isEn
                    ? "Together for your successful future at ENSPD"
                    : "Ensemble pour une orientation réussie à l'ENSPD"}
                </h2>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
};
