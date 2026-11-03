import React, { useRef } from 'react';
import { Calendar, MapPin, Clock, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

interface DayJProgramProps {
  language: 'fr' | 'en';
  onAskPoly: (topic: string) => void;
}

export const DayJProgram: React.FC<DayJProgramProps> = ({ language, onAskPoly }) => {
  const isEn = language === 'en';
  const scheduleRef = useRef<HTMLDivElement>(null);

  const schedule = [
    {
      time: "08h30 - 09h15",
      title_fr: "Accueil & Enregistrement des Visiteurs",
      title_en: "Visitor Welcome & Registration",
      location: "Stand Central - Bâtiment A",
      desc_fr: "Remise du badge, dépliant officiel, connexion au Wi-Fi campus et consultation de Poly.",
      desc_en: "Badge delivery, official guide, campus Wi-Fi access, and Poly consultation."
    },
    {
      time: "09h30 - 11h00",
      title_fr: "Conférence Plénière d'Orientation",
      title_en: "Plenary Orientation Conference",
      location: "Amphithéâtre 300",
      desc_fr: "Mot d'ouverture du Directeur de l'ENSPD, Pr Ruben Martin MOUANGUE, et présentation des 10 départements d'ingénieurs.",
      desc_en: "Opening address by Director Prof. Ruben Martin MOUANGUE, and overview of all 10 engineering departments."
    },
    {
      time: "11h30 - 15h30",
      title_fr: "Visites Guidées des Laboratoires & FabLab",
      title_en: "Guided Tours of Scientific Labs & FabLab",
      location: "Bâtiment Numérique & Ateliers Technologiques",
      desc_fr: "Démonstrations de robotique mobile, datacenter GIT, bancs de génie civil et ateliers automobiles.",
      desc_en: "Live robotics demos, GIT datacenter tour, civil engineering testing benches and automotive workshops."
    },
    {
      time: "14h00 - 16h30",
      title_fr: "Rencontres Étudiants Ambassadeurs & Scolarité",
      title_en: "Meetings with Student Ambassadors & Admissions",
      location: "Village des Filières (Cour Principale)",
      desc_fr: "Échanges directs sur le concours, la vie associative, les stages et les débouchés professionnels.",
      desc_en: "Direct exchanges on entrance competitions, campus life, internships, and career pathways."
    }
  ];

  const stands = [
    {
      name: "Stand Génie Informatique & Télécommunications (GIT)",
      location: "1er étage, Bâtiment Numérique",
      highlight: "Démos logicielles, cybersécurité, réseaux & projets étudiants"
    },
    {
      name: "Stand Génie Électrique & Systèmes Intelligents (GESI)",
      location: "Laboratoire d'Électronique, Bâtiment B",
      highlight: "Banc solaire photovoltaïque & automatismes industriels"
    },
    {
      name: "Stand Génie Automobile & Mécatronique (GAM)",
      location: "Ateliers Technologiques (Cour Sud)",
      highlight: "Diagnostic embarqué, banc moteur & robotique mobile"
    },
    {
      name: "Stand Génie Civil (GC)",
      location: "Hall Laboratoire Matériaux",
      highlight: "Essais béton, maquettes d'ouvrages d'art et topographie"
    },
    {
      name: "Stand Scolarité & Concours",
      location: "Hall Amphithéâtre 300",
      highlight: "Dossiers de candidature, vérification des reçus UBA et inscription"
    }
  ];

  const scrollToSchedule = () => {
    scheduleRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10 animate-fade-in text-left">
      {/* 05. Journées d'orientation - Top Card matching Mockup 05 */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Left Photo */}
        <div className="relative h-64 md:h-auto min-h-[260px] overflow-hidden">
          <img
            src="/images/campus-balcony.webp"
            alt="Campus ENSPD"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/50 via-transparent to-transparent flex items-end p-6">
            <span className="text-white text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-poly-gold" />
              Événement officiel ENSPD • Campus de Douala
            </span>
          </div>
        </div>

        {/* Right Info Card matching Mockup 05 */}
        <div className="p-6 sm:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-poly-gold bg-amber-50 dark:bg-poly-gold/10 px-3 py-1 rounded-md">
              <Sparkles size={13} />
              {isEn ? "Annual Open Days" : "Portes Ouvertes 2026"}
            </span>

            <h1 className="text-2xl sm:text-3xl font-black text-poly-navy dark:text-white">
              {isEn ? "ENSPD Orientation Days 2026" : "Journées d'orientation 2026"}
            </h1>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {isEn
                ? "Discover ENSPD, meet our pedagogical teams, explore career tracks, and prepare your entrance into the leading engineering school."
                : "Découvrez l'ENSPD, rencontrez nos équipes pédagogiques et explorez vos opportunités pour réussir votre concours d'entrée."}
            </p>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Calendar size={16} className="text-poly-gold shrink-0" />
                <span>15 – 17 Novembre 2026 (08h30 - 17h00)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <MapPin size={16} className="text-poly-gold shrink-0" />
                <span>Campus ENSPD – Douala (Quartier Ndogbong)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={scrollToSchedule}
              className="bg-poly-navy hover:bg-poly-deepNavy text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span>{isEn ? "View schedule" : "Voir le programme"}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Detail Section */}
      <div ref={scheduleRef} className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-poly-navy dark:text-white">
            {isEn ? "Hourly Program" : "Programme détaillé des journées"}
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Accès libre & gratuit
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schedule.map((slot, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 hover:border-poly-gold/60 transition group"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-mono text-xs font-bold text-poly-goldDark dark:text-poly-gold bg-amber-50 dark:bg-poly-gold/10 px-2.5 py-1 rounded-md">
                  <Clock size={13} />
                  {slot.time}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <MapPin size={12} className="text-poly-gold" />
                  {slot.location}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-poly-navy dark:text-white">
                  {isEn ? slot.title_en : slot.title_fr}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {isEn ? slot.desc_en : slot.desc_fr}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => onAskPoly(slot.title_fr)}
                  className="text-[11px] font-bold text-poly-navy dark:text-blue-300 hover:text-poly-gold flex items-center gap-1 transition"
                >
                  <span>{isEn ? "Ask Poly about this" : "En savoir plus avec Poly"}</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Department Stands Section */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-black text-poly-navy dark:text-white">
          {isEn ? "Engineering Department Stands" : "Localisation des Stands & Laboratoires"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {stands.map((stand, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-1.5"
            >
              <h4 className="font-bold text-xs text-poly-navy dark:text-white">
                {stand.name}
              </h4>
              <p className="text-[11px] text-poly-goldDark dark:text-poly-gold font-medium">
                📍 {stand.location}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {stand.highlight}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
