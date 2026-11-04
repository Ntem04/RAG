import React, { useState } from 'react';
import {
  Calendar,
  GraduationCap,
  Megaphone,
  Trophy,
  Star,
  Clock,
  MapPin,
  ArrowRight,
  Info,
  ChevronLeft,
  ChevronRight,
  X,
  MessageSquare,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { Reveal } from '../common/Reveal';

interface DayJProgramProps {
  language: 'fr' | 'en';
  onAskPoly: (topic: string) => void;
}

interface EventItem {
  id: string;
  category: 'orientation' | 'conference' | 'academique' | 'autre';
  day: string;
  month: string;
  title_fr: string;
  title_en: string;
  desc_fr: string;
  desc_en: string;
  time: string;
  location: string;
  image: string;
  speakers?: string;
  agenda?: string[];
}

export const DayJProgram: React.FC<DayJProgramProps> = ({ language, onAskPoly }) => {
  const isEn = language === 'en';

  const [activeCategory, setActiveCategory] = useState<'all' | 'orientation' | 'conference' | 'academique' | 'autre'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  // Events list matching mockup exactly
  const allEvents: EventItem[] = [
    {
      id: 'evt-1',
      category: 'orientation',
      day: '15',
      month: 'NOV.',
      title_fr: "Journées d'Orientation 2026",
      title_en: "Orientation Days 2026",
      desc_fr: "Découvrez l'ENSPD, ses filières et ses opportunités de formation.",
      desc_en: "Discover ENSPD, its departments, labs and training opportunities.",
      time: "08h00 - 17h00",
      location: "Campus ENSPD",
      image: "/images/event-orientation.webp",
      speakers: "Direction de l'ENSPD, Chefs de départements & Enseignants-Chercheurs",
      agenda: [
        "08h00 - 09h00 : Accueil & enregistrement des délégations des lycées",
        "09h30 - 11h30 : Conférence plénière du Pr Ruben Martin MOUANGUE (Amphi 300)",
        "12h00 - 14h30 : Visite guidée des stands et démonstrations en direct",
        "15h00 - 17h00 : Séances d'orientation individualisées avec Poly"
      ]
    },
    {
      id: 'evt-2',
      category: 'conference',
      day: '22',
      month: 'NOV.',
      title_fr: "Conférence : L'ingénierie au service du développement",
      title_en: "Conference: Engineering Serving Sustainable Development",
      desc_fr: "Une conférence animée par des experts du domaine.",
      desc_en: "A distinguished panel discussion led by prominent industry engineers.",
      time: "10h00 - 12h00",
      location: "Amphi 300",
      image: "/images/event-conference.webp",
      speakers: "Ingénieurs polytechniciens de la diaspora et industriels partenaires",
      agenda: [
        "10h00 - 10h15 : Mot d'introduction sur la transition énergétique en Afrique",
        "10h15 - 11h15 : Table ronde sur l'intelligence artificielle et l'industrie 4.0",
        "11h15 - 12h00 : Session questions-réponses avec les étudiants"
      ]
    },
    {
      id: 'evt-3',
      category: 'academique',
      day: '05',
      month: 'DÉC.',
      title_fr: "Salon des Étudiants",
      title_en: "Student Fair & Innovations",
      desc_fr: "Rencontrez les associations, explorez les opportunités et construisez votre avenir.",
      desc_en: "Meet student associations, explore innovative tech prototypes and build your network.",
      time: "09h00 - 16h00",
      location: "Parvis de l'ENSPD",
      image: "/images/event-salon.webp",
      speakers: "Bureau des Élèves (BDE) & Clubs Scientifiques ENSPD",
      agenda: [
        "09h00 - 11h00 : Village associatif, FabLab et présentation des clubs robotique",
        "11h30 - 13h30 : Concours du meilleur prototype d'ingénierie étudiante",
        "14h00 - 16h00 : Rencontres avec les entreprises partenaires et recruteurs"
      ]
    },
    {
      id: 'evt-4',
      category: 'autre',
      day: '18',
      month: 'DÉC.',
      title_fr: "Cérémonie de remise des diplômes",
      title_en: "Graduation Ceremony 2026",
      desc_fr: "Célébrons ensemble l'excellence de nos diplômés.",
      desc_en: "Celebrating academic excellence and the conferring of engineering degrees.",
      time: "14h00 - 17h00",
      location: "Grand Amphi",
      image: "/images/event-diploma.webp",
      speakers: "Recteur de l'Université de Douala & Directeur de l'ENSPD",
      agenda: [
        "14h00 - 14h30 : Défilé académique des lauréats et cortège professoral",
        "14h30 - 15h45 : Remise officielle des parchemins d'Ingénieurs de Conception",
        "16h00 - 17h00 : Cocktail d'honneur et photo officielle de promotion"
      ]
    }
  ];

  // Filter events based on active category
  const filteredEvents = activeCategory === 'all'
    ? allEvents
    : allEvents.filter(e => e.category === activeCategory);

  const categories = [
    { id: 'all' as const, label_fr: "Tous les événements", label_en: "All Events", icon: <Calendar size={16} /> },
    { id: 'orientation' as const, label_fr: "Journées d'orientation", label_en: "Orientation Days", icon: <GraduationCap size={16} /> },
    { id: 'conference' as const, label_fr: "Conférences", label_en: "Conferences", icon: <Megaphone size={16} /> },
    { id: 'academique' as const, label_fr: "Activités académiques", label_en: "Academic Events", icon: <Trophy size={16} /> },
    { id: 'autre' as const, label_fr: "Autres", label_en: "Other", icon: <Star size={16} /> }
  ];

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col lg:flex-row bg-[#081528] text-white relative overflow-hidden select-none">
      {/* LEFT SECTION: Diagonal Angled Campus Photo with Motto matching mockup */}
      <div className="hidden lg:flex lg:w-[28%] xl:w-[25%] relative overflow-hidden flex-col justify-between p-8 border-r border-[#1a2d48]/50 shadow-2xl">
        {/* Background photo */}
        <img
          src="/images/campus-courtyard-hq.webp"
          alt="ENSPD Campus Courtyard"
          className="absolute inset-0 w-full h-full object-cover object-center transform scale-110 pointer-events-none"
        />

        {/* Deep blue gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#081528] via-[#0b2447]/85 to-[#071324]/90 pointer-events-none" />

        {/* Top subtle badge */}
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] text-xs font-bold uppercase tracking-wider">
            <Calendar size={14} />
            <span>{isEn ? "News & Schedule" : "Actualités & Agenda"}</span>
          </div>
        </div>

        {/* Bottom Motto in Serif Italics matching mockup */}
        <div className="relative z-10 mt-auto pb-4">
          <div className="font-serif italic text-2xl xl:text-3xl text-white font-bold leading-tight drop-shadow-lg">
            {isEn ? "Learn," : "S'informer,"}
            <div className="text-white font-serif italic text-2xl xl:text-3xl mt-1">
              {isEn ? "Orient, Succeed" : "S'orienter, Réussir"}
            </div>
          </div>
          <div className="h-1 w-20 bg-[#d4af37] mt-3.5 mb-6 rounded-full" />

          {/* Architectural Blueprint Line Illustration */}
          <div className="opacity-20 pointer-events-none">
            <svg viewBox="0 0 200 80" className="w-full text-white fill-none stroke-current stroke-1">
              <rect x="10" y="25" width="180" height="50" rx="2" />
              <rect x="30" y="10" width="140" height="15" />
              <line x1="10" y1="45" x2="190" y2="45" />
              <line x1="50" y1="45" x2="50" y2="75" />
              <line x1="90" y1="45" x2="90" y2="75" />
              <line x1="130" y1="45" x2="130" y2="75" />
              <line x1="170" y1="45" x2="170" y2="75" />
            </svg>
          </div>
        </div>
      </div>

      {/* RIGHT MAIN SECTION: Hero Banner + Event Cards Container */}
      <div className="flex-1 flex flex-col justify-between overflow-y-auto">
        {/* Top Hero Banner with Campus Building and Dark Blue Overlay */}
        <div className="relative h-44 sm:h-52 lg:h-60 w-full overflow-hidden flex items-center px-6 sm:px-12 lg:px-16 border-b border-[#1a2d48]/40 shadow-md">
          {/* Background image */}
          <img
            src="/images/event-hero-banner.webp"
            alt="Campus Facade"
            className="absolute inset-0 w-full h-full object-cover object-center transform scale-105 pointer-events-none"
          />

          {/* Blue gradient overlay for contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#071526]/95 via-[#092240]/85 to-[#071526]/80 pointer-events-none" />

          {/* Title and Subtitle Header matching mockup */}
          <Reveal direction="down" delay={40} className="relative z-10 max-w-2xl space-y-2 text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-white tracking-tight drop-shadow-md">
              {isEn ? "Events" : "Événements"}
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-slate-200 font-medium max-w-xl drop-shadow-xs">
              {isEn
                ? "Stay informed about the latest news and important events at ENSPD."
                : "Restez informé des actualités et événements importants de l'ENSPD."}
            </p>
          </Reveal>
        </div>

        {/* White / Light Content Area Card Container matching mockup */}
        <div className="flex-1 bg-[#f8fafc] dark:bg-[#071324] text-slate-900 dark:text-white p-5 sm:p-8 lg:p-10 flex flex-col justify-between">
          <div className="max-w-6xl mx-auto w-full space-y-6 sm:space-y-8">
            {/* Filter Tabs Bar matching mockup */}
            <Reveal direction="down" delay={60}>
              <div className="bg-white dark:bg-[#0c1a2e] border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 shadow-2xs flex items-center overflow-x-auto gap-1">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setCurrentPage(1);
                      }}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#d4af37] text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      {cat.icon}
                      <span>{isEn ? cat.label_en : cat.label_fr}</span>
                    </button>
                  );
                })}
              </div>
            </Reveal>

            {/* 2x2 Events Grid matching mockup */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {filteredEvents.map((evt, idx) => (
                <Reveal key={evt.id} direction="up" delay={idx * 70}>
                  <div
                    className="bg-white dark:bg-[#0c1a2e] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-[#d4af37]/60 transition-all flex flex-col sm:flex-row group text-left h-full"
                  >
                    {/* Left: Event Image with Date Badge */}
                    <div className="sm:w-44 h-44 sm:h-auto relative overflow-hidden shrink-0">
                      <img
                        src={evt.image}
                        alt={isEn ? evt.title_en : evt.title_fr}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Dark Navy Date Badge with Rounded Corners matching mockup */}
                      <div className="absolute top-3 left-3 bg-[#0a192f]/95 backdrop-blur-xs text-white rounded-lg px-2.5 py-1.5 text-center shadow-lg border border-white/10 select-none">
                        <div className="text-xl font-black leading-tight tracking-tight">
                          {evt.day}
                        </div>
                        <div className="text-[10px] font-extrabold tracking-wider uppercase text-slate-200">
                          {evt.month}
                        </div>
                      </div>
                    </div>

                    {/* Right: Content Section */}
                    <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 space-y-3">
                      <div className="space-y-1.5">
                        <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-snug group-hover:text-[#d4af37] transition-colors">
                          {isEn ? evt.title_en : evt.title_fr}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal">
                          {isEn ? evt.desc_en : evt.desc_fr}
                        </p>
                      </div>

                      {/* Metadata Row: Clock & MapPin */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300 font-medium pt-1">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-[#d4af37] shrink-0" />
                          <span>{evt.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-[#d4af37] shrink-0" />
                          <span>{evt.location}</span>
                        </div>
                      </div>

                      {/* Action link: Voir plus -> */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end">
                        <button
                          onClick={() => setSelectedEvent(evt)}
                          className="text-xs font-bold text-[#d4af37] hover:text-[#b89427] hover:underline flex items-center gap-1 cursor-pointer transition"
                        >
                          <span>{isEn ? "See more" : "Voir plus"}</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Empty state if category has no events */}
            {filteredEvents.length === 0 && (
              <div className="bg-white dark:bg-[#0c1a2e] border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-3">
                <Calendar size={32} className="mx-auto text-slate-400" />
                <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                  {isEn ? "No events found in this category" : "Aucun événement dans cette catégorie pour le moment"}
                </h4>
                <button
                  onClick={() => setActiveCategory('all')}
                  className="text-xs font-bold text-[#d4af37] hover:underline"
                >
                  {isEn ? "View all events" : "Voir tous les événements"}
                </button>
              </div>
            )}
          </div>

          {/* Bottom Footer Bar: Info Pill & Pagination Controls matching mockup */}
          <div className="max-w-6xl mx-auto w-full pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Left Info Pill */}
            <div className="inline-flex items-center gap-2 bg-white dark:bg-[#0c1a2e] border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs">
              <Info size={14} className="text-[#d4af37]" />
              <span>
                {filteredEvents.length}{' '}
                {isEn ? 'events found' : 'événements trouvés'}
              </span>
            </div>

            {/* Right Pagination Buttons */}
            <div className="flex items-center gap-1.5 select-none">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c1a2e] text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                onClick={() => setCurrentPage(1)}
                className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition cursor-pointer ${
                  currentPage === 1
                    ? 'bg-[#d4af37] text-white shadow-xs'
                    : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c1a2e] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                1
              </button>

              <button
                onClick={() => setCurrentPage(2)}
                className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition cursor-pointer ${
                  currentPage === 2
                    ? 'bg-[#d4af37] text-white shadow-xs'
                    : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c1a2e] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                2
              </button>

              <button
                onClick={() => setCurrentPage(3)}
                className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition cursor-pointer ${
                  currentPage === 3
                    ? 'bg-[#d4af37] text-white shadow-xs'
                    : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c1a2e] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                3
              </button>

              <button
                disabled={currentPage === 3}
                onClick={() => setCurrentPage(prev => Math.min(3, prev + 1))}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c1a2e] text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED EVENT MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in text-left">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl space-y-5 text-slate-900 dark:text-white">
            {/* Image Header with Close Button */}
            <div className="relative h-48 sm:h-56 w-full overflow-hidden">
              <img
                src={selectedEvent.image}
                alt={selectedEvent.title_fr}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X size={18} />
              </button>

              {/* Date Badge */}
              <div className="absolute bottom-4 left-5 bg-[#0a192f] text-white rounded-xl px-3 py-1.5 text-center shadow-lg border border-white/20">
                <div className="text-xl font-black">{selectedEvent.day}</div>
                <div className="text-[10px] font-extrabold uppercase">{selectedEvent.month}</div>
              </div>

              <div className="absolute bottom-4 left-24 right-5 text-white">
                <h3 className="font-serif font-black text-lg sm:text-xl leading-tight drop-shadow-md">
                  {isEn ? selectedEvent.title_en : selectedEvent.title_fr}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Clock size={15} className="text-[#d4af37]" />
                  <span>{selectedEvent.time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={15} className="text-[#d4af37]" />
                  <span>{selectedEvent.location}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {isEn ? selectedEvent.desc_en : selectedEvent.desc_fr}
              </p>

              {selectedEvent.speakers && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
                  <span className="font-extrabold text-[#d4af37] uppercase tracking-wider text-[10px]">
                    Intervenants & Encadrement
                  </span>
                  <p className="text-slate-700 dark:text-slate-200">
                    {selectedEvent.speakers}
                  </p>
                </div>
              )}

              {selectedEvent.agenda && (
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                    {isEn ? "Event Agenda" : "Programme prévisionnel"}
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {selectedEvent.agenda.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 size={13} className="text-[#d4af37] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action: Ask Poly about this event */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  {isEn ? "Close" : "Fermer"}
                </button>

                <button
                  onClick={() => {
                    const topic = isEn ? selectedEvent.title_en : selectedEvent.title_fr;
                    setSelectedEvent(null);
                    onAskPoly(topic);
                  }}
                  className="px-5 py-2.5 rounded-lg bg-[#0a192f] hover:bg-[#071324] text-white text-xs font-extrabold flex items-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <MessageSquare size={14} className="text-[#d4af37]" />
                  <span>{isEn ? "Ask Poly about this event" : "Poser une question à Poly"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
