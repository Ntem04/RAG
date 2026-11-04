import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  BookOpen,
  Cpu,
  Building,
  Zap,
  Car,
  Anchor,
  Beaker,
  SunMedium,
  Cog,
  ShieldCheck,
  Activity,
  Atom,
  Code2,
  HardHat,
  ChevronRight,
  MapPin,
  Check
} from 'lucide-react';
import { OrientationResult, RecommendedTrack } from '../../types';
import { api } from '../../services/api';
import { Reveal } from '../common/Reveal';

interface OrientationWizardProps {
  language: 'fr' | 'en';
  onAskAboutTrack: (trackTitle: string) => void;
}

export const OrientationWizard: React.FC<OrientationWizardProps> = ({
  language,
  onAskAboutTrack
}) => {
  const isEn = language === 'en';

  const questions = [
    {
      id: 1,
      stepKey: "profil",
      stepLabel: isEn ? "Profile" : "Profil",
      theme: isEn ? "Academic Background & Diploma" : "Profil Académique & Diplôme",
      title: isEn ? "What is your high school or current academic background?" : "Quel est votre cursus d'études ou diplôme préparé ?",
      subtitle: isEn ? "Select your series or origin to calibrate entrance competition requirements." : "Sélectionnez votre filière pour adapter le calibrage des épreuves et recommandations.",
      options: [
        {
          key: "A",
          icon: <Atom size={20} className="text-[#d4af37]" />,
          label: isEn ? "Bac C / D (Mathematics, Physics & Life Sciences)" : "Bac C / D (Mathématiques, Sciences Physiques & SVT)",
          sub: "Maths pures, physique et sciences appliquées"
        },
        {
          key: "B",
          icon: <Code2 size={20} className="text-[#d4af37]" />,
          label: isEn ? "Bac E / TI (Mathematics, Technology & Computer Science)" : "Bac E / TI (Maths, Technologies & Informatique)",
          sub: "Algorithmes, programmation et sciences de l'ingénieur"
        },
        {
          key: "C",
          icon: <HardHat size={20} className="text-[#d4af37]" />,
          label: isEn ? "Bac F (F1 Mechanical, F2/F3 Electrical, F4 Civil)" : "Bac F (F1 Mécanique, F2/F3 Électrique, F4 Génie Civil)",
          sub: "Spécialités technologiques industrielles et BTP"
        },
        {
          key: "D",
          icon: <GraduationCap size={20} className="text-[#d4af37]" />,
          label: isEn ? "GCE A-Level (Maths, Physics, Chemistry, Further Maths)" : "GCE A-Level (Maths, Physics, Chemistry, Further Maths)",
          sub: "Système anglophone ou baccalauréat international"
        },
        {
          key: "E",
          icon: <Briefcase size={20} className="text-[#d4af37]" />,
          label: isEn ? "Associate Degree / BTS / Bachelor transfer" : "Bac Pro / BT / BTS ou Licence Scientifique",
          sub: "Études supérieures scientifiques ou réorientation technique"
        }
      ]
    },
    {
      id: 2,
      stepKey: "domaine",
      stepLabel: isEn ? "Field" : "Domaine",
      theme: isEn ? "Preferred Engineering Domain" : "Domaine d'Ingénierie de Prédilection",
      title: isEn ? "Which engineering field excites you the most?" : "Quel grand domaine d'ingénierie vous passionne le plus ?",
      subtitle: isEn ? "Choose your primary technological interest among ENSPD's 10 departments." : "Choisissez votre domaine de prédilection parmi les 10 départements officiels de l'ENSPD.",
      options: [
        { key: "A", icon: <Cpu size={20} className="text-[#d4af37]" />, label: "Génie Informatique & Télécommunications (GIT)", sub: "Intelligence Artificielle, Cloud, Cybersécurité, Développement Logiciel & Données" },
        { key: "B", icon: <Building size={20} className="text-[#d4af37]" />, label: "Génie Civil (GCI)", sub: "Bâtiment, Ponts, Viaducs, Routes, Géotechnique & Grands Ouvrages d'Art" },
        { key: "C", icon: <Zap size={20} className="text-[#d4af37]" />, label: "Génie Électrique et Systèmes Intelligents (GESI)", sub: "Réseaux Smart Grids, Électronique de Puissance & Automates Industriels" },
        { key: "D", icon: <Car size={20} className="text-[#d4af37]" />, label: "Génie Automobile et Mécatronique (GAM)", sub: "Véhicules Hybrides/Électriques, Moteurs, Robotique Mobile & Diagnostic Embarqué" },
        { key: "E", icon: <Anchor size={20} className="text-[#d4af37]" />, label: "Génie Maritime et Portuaire (GMP)", sub: "Infrastructures Portuaires, Chantiers Navals, Génie Océanique & Logistique Maritime" },
        { key: "F", icon: <Beaker size={20} className="text-[#d4af37]" />, label: "Génie des Procédés (GPR)", sub: "Chimie Industrielle, Raffinage Pétrolier, Pharmacie & Bioprocédés Agroalimentaires" },
        { key: "G", icon: <SunMedium size={20} className="text-[#d4af37]" />, label: "Génie Énergétique (GEN)", sub: "Énergies Renouvelables, Solaire Photovoltaïque, Climatisation Industrielle & Froid" },
        { key: "H", icon: <Cog size={20} className="text-[#d4af37]" />, label: "Génie Mécanique (GME)", sub: "Conception CAO 3D, Usinage Numérique CNC, Chaudronnerie & Tuyauterie Industrielle" },
        { key: "I", icon: <ShieldCheck size={20} className="text-[#d4af37]" />, label: "Génie QHSE & Environnement Industriel (QHSEI)", sub: "Sûreté Industrielle, Prévention des Risques, Dépollution & Certification ISO" },
        { key: "J", icon: <Activity size={20} className="text-[#d4af37]" />, label: "Génie Physique & Technologies Biomédicales (GPH)", sub: "Capteurs Haute Précision, Photonique Laser, Physique Médicale & Radiothérapie" }
      ]
    },
    {
      id: 3,
      stepKey: "environnement",
      stepLabel: isEn ? "Environment" : "Environnement",
      theme: isEn ? "Workplace Environment" : "Environnement de Travail Idéal",
      title: isEn ? "Where do you envision yourself working on a daily basis?" : "Où vous imaginez-vous exercer avec le plus de plaisir au quotidien ?",
      subtitle: isEn ? "The day-to-day environment defines your professional comfort and impact." : "Votre lieu d'exercice quotidien reflète votre style d'ingénierie.",
      options: [
        { key: "A", icon: <Cpu size={20} className="text-[#d4af37]" />, label: "Datacenter, studio logiciel ou laboratoire d'architecture cloud", sub: "Environnement high-tech connecté et postes multi-écrans" },
        { key: "B", icon: <Building size={20} className="text-[#d4af37]" />, label: "Grands chantiers extérieurs, autoroutes et ponts en construction", sub: "Pilotage direct sur le terrain au contact des équipes BTP" },
        { key: "C", icon: <Zap size={20} className="text-[#d4af37]" />, label: "Centrale électrique, sous-station ou salle de commande automatisée", sub: "Supervision des flux de puissance et réseaux intelligents" },
        { key: "D", icon: <Car size={20} className="text-[#d4af37]" />, label: "Atelier mécatronique, banc d'essai moteur ou centre de diagnostic", sub: "Conception et tests dynamiques de systèmes robotisés et automobiles" },
        { key: "E", icon: <Anchor size={20} className="text-[#d4af37]" />, label: "Terminal portuaire, quai de manutention ou chantier naval", sub: "Environnement maritime international et logistique côtière" },
        { key: "F", icon: <Beaker size={20} className="text-[#d4af37]" />, label: "Unité pétrochimique, laboratoire pharmaceutique ou usine de synthèse", sub: "Transformation industrielle, réacteurs chimiques et salle blanche" },
        { key: "G", icon: <SunMedium size={20} className="text-[#d4af37]" />, label: "Parcs solaires photovoltaïques, éoliens ou centrales d'énergie", sub: "Déploiement d'équipements propres et audits énergétiques" },
        { key: "H", icon: <Cog size={20} className="text-[#d4af37]" />, label: "Atelier d'usinage numérique CNC, bureau de CAO 3D ou métallurgie", sub: "Fabrication de composants mécaniques et structures mécano-soudées" }
      ]
    },
    {
      id: 4,
      stepKey: "projet",
      stepLabel: isEn ? "Project" : "Projet",
      theme: isEn ? "Inspiring Engineering Challenge" : "Projet d'Ingénierie Stimulant",
      title: isEn ? "Which major technical challenge would you be proudest to accomplish?" : "Quel grand défi technique vous rendrait le plus fier d'avoir accompli ?",
      subtitle: isEn ? "Your ambition reflects the concrete problems you want to solve." : "Votre motivation à relever des défis réels pour le Cameroun et l'Afrique.",
      options: [
        { key: "A", icon: <Cpu size={20} className="text-[#d4af37]" />, label: "Déployer un système d'IA sécurisé et souverain pour le diagnostic ou la finance", sub: "Algorithmes, modèles prédictifs et résilience cybernétique" },
        { key: "B", icon: <Building size={20} className="text-[#d4af37]" />, label: "Diriger la réalisation d'un viaduc autoroutier ou pont suspendu majeur", sub: "Ouvrages durables résistant aux contraintes extrêmes" },
        { key: "C", icon: <Zap size={20} className="text-[#d4af37]" />, label: "Rendre un réseau électrique national capable d'intégrer 100% d'énergie propre", sub: "Gestion intelligente des charges et stockage d'énergie" },
        { key: "D", icon: <Car size={20} className="text-[#d4af37]" />, label: "Développer le groupe motopropulseur d'un véhicule électrique tropicalisé", sub: "Mobilité propre, mécatronique et autonomie durable" },
        { key: "E", icon: <Anchor size={20} className="text-[#d4af37]" />, label: "Agrandir un port maritime pour accueillir les plus grands porte-conteneurs", sub: "Dragage des chenaux, quais haute capacité et logistique" },
        { key: "F", icon: <Beaker size={20} className="text-[#d4af37]" />, label: "Concevoir une unité de synthèse pharmaceutique ou de raffinage écologique", sub: "Chimie verte, valorisation de la biomasse et médicaments" }
      ]
    },
    {
      id: 5,
      stepKey: "objectif",
      stepLabel: isEn ? "Goal" : "Objectif",
      theme: isEn ? "Long-Term Career Vision" : "Objectif de Carrière & Ambition",
      title: isEn ? "What career milestone do you aim for after graduation?" : "Quel titre ou fonction visez-vous 5 ans après votre diplôme ENSPD ?",
      subtitle: isEn ? "The engineering diploma from ENSPD opens the doors to the highest responsibilities." : "Choisissez la trajectoire professionnelle qui vous inspire le plus.",
      options: [
        { key: "A", icon: <Cpu size={20} className="text-[#d4af37]" />, label: "Chief Technology Officer (CTO) ou Architecte Solutions Cloud / IA", sub: "Diriger la stratégie technique de startups ou multinationales" },
        { key: "B", icon: <Building size={20} className="text-[#d4af37]" />, label: "Directeur de Projets BTP & Grandes Infrastructures", sub: "Piloter des méga-projets d'aménagement urbain et autoroutier" },
        { key: "C", icon: <Zap size={20} className="text-[#d4af37]" />, label: "Chef de Projet Réseaux d'Énergie & Automatismes Industriels", sub: "Gouverner la distribution électrique et l'industrie 4.0" },
        { key: "D", icon: <Car size={20} className="text-[#d4af37]" />, label: "Ingénieur en Chef de Conception Automobile & Robotique", sub: "Innover dans l'industrie automobile et les engins autonomes" },
        { key: "E", icon: <Anchor size={20} className="text-[#d4af37]" />, label: "Directeur des Opérations Portuaires ou d'Ingénierie Maritime", sub: "Superviser les flux portuaires et les flottes navales" },
        { key: "F", icon: <Beaker size={20} className="text-[#d4af37]" />, label: "Directeur de Complexe Pétrochimique ou Pharmaceutique", sub: "Gérer des usines de transformation chimique et biotechnologique" }
      ]
    }
  ];

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<{ [qId: number]: string }>({
    1: 'A',
    2: 'A',
    3: 'A',
    4: 'A',
    5: 'A'
  });
  const [results, setResults] = useState<OrientationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelectOption = (qId: number, key: string) => {
    setAnswers(prev => ({ ...prev, [qId]: key }));
  };

  const handleNext = async () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    } else if (currentStep === 4) {
      setLoading(true);
      try {
        const payload = Object.entries(answers).map(([qId, optKey]) => ({
          question_id: parseInt(qId),
          selected_option: optKey
        }));
        const res = await api.evaluateOrientation(payload, language);
        setResults(res);
        setCurrentStep(5);
      } catch (err) {
        console.error("Orientation evaluation error:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setResults(null);
  };

  const currentQ = questions[currentStep];

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col lg:flex-row bg-[#081528] text-white relative overflow-hidden select-none">
      {/* LEFT SECTION: Diagonal Angled Campus Photo with Motto matching orientation.png */}
      <div className="hidden lg:flex lg:w-[32%] xl:w-[28%] relative overflow-hidden flex-col justify-between p-8 border-r border-[#1a2d48]/50 shadow-2xl">
        {/* Background photo */}
        <img
          src="/images/campus-courtyard-hq.webp"
          alt="ENSPD Campus"
          className="absolute inset-0 w-full h-full object-cover object-center transform scale-110 pointer-events-none"
        />

        {/* Deep blue and navy overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#081528] via-[#0b2447]/85 to-[#071324]/90 pointer-events-none" />

        {/* Top subtle badge */}
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] text-xs font-bold uppercase tracking-wider">
            <Compass size={14} />
            <span>Orientation ENSPD</span>
          </div>
        </div>

        {/* Center Motto in Serif Italics matching mockup */}
        <div className="relative z-10 my-auto py-8">
          <div className="font-serif italic text-2xl xl:text-3xl text-white font-bold leading-tight drop-shadow-lg">
            Ensemble pour
            <div className="text-[#d4af37] font-serif not-italic font-black text-2xl xl:text-3xl mt-1">
              une orientation réussie
            </div>
            <div className="text-white text-base xl:text-lg font-sans not-italic font-semibold opacity-90 mt-1">
              à l'ENSPD
            </div>
          </div>
          <div className="h-1 w-24 bg-[#d4af37] mt-4 rounded-full" />
          <p className="text-xs text-slate-300 mt-4 leading-relaxed font-normal">
            Calibrez vos aptitudes et découvrez la spécialité d'ingénieur qui correspond à vos ambitions parmi nos 10 départements officiels.
          </p>
        </div>

        {/* Bottom Pin */}
        <div className="relative z-10 flex items-center gap-2 text-xs text-slate-300">
          <MapPin size={15} className="text-[#d4af37]" />
          <span>Campus de Ndogbong • Douala</span>
        </div>
      </div>

      {/* RIGHT MAIN SECTION: Wizard Stepper & Questions */}
      <div className="flex-1 flex flex-col justify-between p-5 sm:p-8 lg:p-12 z-10 bg-slate-50 dark:bg-[#071324] text-slate-900 dark:text-white overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full space-y-6 sm:space-y-8">
          {/* Top Connected Stepper matching mockup orientation.png */}
          <div className="w-full pb-2">
            <div className="flex items-center justify-between relative max-w-2xl mx-auto">
              {questions.map((q, idx) => {
                const isActive = currentStep === idx;
                const isPassed = currentStep > idx;
                return (
                  <React.Fragment key={q.id}>
                    <div className="flex flex-col items-center relative z-10">
                      <button
                        onClick={() => {
                          if (isPassed) setCurrentStep(idx);
                        }}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-extrabold text-xs sm:text-sm transition-all shadow-md cursor-pointer ${
                          isActive
                            ? 'bg-[#0a192f] dark:bg-white text-white dark:text-[#0a192f] ring-4 ring-[#d4af37]/40 scale-105'
                            : isPassed
                            ? 'bg-[#d4af37] text-white hover:scale-105'
                            : 'bg-white dark:bg-slate-800 text-slate-400 border-2 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {isPassed ? <Check size={16} /> : idx + 1}
                      </button>
                      <span
                        className={`text-[11px] sm:text-xs mt-2 font-bold tracking-tight ${
                          isActive
                            ? 'text-[#0a192f] dark:text-[#d4af37]'
                            : isPassed
                            ? 'text-slate-700 dark:text-slate-300'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {q.stepLabel}
                      </span>
                    </div>

                    {/* Connecting Line */}
                    <div
                      className={`flex-1 h-0.5 mx-1 sm:mx-2 -mt-5 transition-colors ${
                        isPassed ? 'bg-[#d4af37]' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    />
                  </React.Fragment>
                );
              })}

              {/* Step 6: Results step */}
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-extrabold text-xs sm:text-sm transition-all shadow-md ${
                    currentStep === 5
                      ? 'bg-[#d4af37] text-white ring-4 ring-[#d4af37]/40 scale-105'
                      : 'bg-white dark:bg-slate-800 text-slate-400 border-2 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  <Check size={16} />
                </div>
                <span
                  className={`text-[11px] sm:text-xs mt-2 font-bold ${
                    currentStep === 5
                      ? 'text-[#d4af37]'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {isEn ? "Results" : "Résultats"}
                </span>
              </div>
            </div>
          </div>

          {/* QUESTION CARDS VIEW (Steps 0 to 4) */}
          {currentStep < 5 && currentQ && (
            <div className="space-y-6 animate-fade-in text-left">
              {/* Question Header matching orientation.png */}
              <div className="space-y-2 border-l-4 border-[#d4af37] pl-4 sm:pl-5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
                  Étape {currentStep + 1} sur 5 • {currentQ.theme}
                </span>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-slate-900 dark:text-white leading-tight">
                  {currentQ.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                  {currentQ.subtitle}
                </p>
              </div>

              {/* 2-Column Cards Grid matching orientation.png */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 pt-2">
                {currentQ.options.map((opt) => {
                  const isSelected = answers[currentQ.id] === opt.key;
                  return (
                    <div
                      key={opt.key}
                      onClick={() => handleSelectOption(currentQ.id, opt.key)}
                      className={`p-4 sm:p-5 rounded-xl transition-all cursor-pointer flex items-start justify-between gap-3 shadow-xs select-none ${
                        isSelected
                          ? 'border-2 border-[#d4af37] bg-[#fbf8f0] dark:bg-[#1a2333] ring-1 ring-[#d4af37]/30'
                          : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1a2e] hover:border-slate-400 dark:hover:border-slate-700 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3 sm:gap-3.5 flex-1">
                        {/* Letter Badge (A, B, C...) inside dark square */}
                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0 ${
                            isSelected
                              ? 'bg-[#0a192f] text-white ring-2 ring-[#d4af37]'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {opt.key}
                        </div>

                        {/* Icon */}
                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/50 dark:border-amber-900/40 flex items-center justify-center shrink-0">
                          {opt.icon}
                        </div>

                        {/* Option Text */}
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                            {opt.label}
                          </h4>
                          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                            {opt.sub}
                          </p>
                        </div>
                      </div>

                      {/* Right Checkmark icon */}
                      <div className="shrink-0 pt-0.5">
                        {isSelected ? (
                          <CheckCircle2 size={22} className="text-[#d4af37]" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-700" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Navigation Buttons */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className={`px-5 py-2.5 rounded-lg border text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
                    currentStep === 0
                      ? 'border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700 cursor-not-allowed'
                      : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'
                  }`}
                >
                  <ArrowLeft size={16} />
                  <span>{isEn ? "Back" : "Retour"}</span>
                </button>

                <button
                  onClick={handleNext}
                  disabled={loading}
                  className={`px-7 py-2.5 rounded-lg font-extrabold text-xs sm:text-sm flex items-center gap-2 transition shadow-md cursor-pointer ${
                    currentStep === 4
                      ? 'bg-[#d4af37] hover:bg-[#c29c29] text-white'
                      : 'bg-[#0a192f] hover:bg-[#071324] text-white'
                  }`}
                >
                  <span>
                    {loading
                      ? (isEn ? "Calibrating..." : "Calibrage en cours...")
                      : currentStep === 4
                      ? (isEn ? "View My Recommendations →" : "Voir mes recommandations →")
                      : (isEn ? "Next >" : "Suivant >")}
                  </span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* RESULTS VIEW (Step 5) */}
          {currentStep === 5 && results && (
            <div className="space-y-8 animate-fade-in text-left">
              <div className="space-y-2 border-l-4 border-[#d4af37] pl-4 sm:pl-5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
                  {isEn ? "Personalized Diagnostic" : "Diagnostic Personnalisé ENSPD"}
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 dark:text-white">
                  Vos recommandations d'orientation
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  {results.summary}
                </p>
              </div>

              {/* Recommended Tracks Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {results.recommended_tracks.map((track, i) => (
                  <div
                    key={track.field_code}
                    className="bg-white dark:bg-[#0c1a2e] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#d4af37]/60 transition"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase">
                          {track.field_code}
                        </span>
                        <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#d4af37]">
                          {track.compatibility_score}% affinité
                        </span>
                      </div>

                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug">
                        {track.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {track.description}
                      </p>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                        <strong className="text-slate-700 dark:text-slate-200">Débouchés : </strong>
                        {track.careers.slice(0, 3).join(', ')}
                      </div>
                    </div>

                    <button
                      onClick={() => onAskAboutTrack(track.title)}
                      className="w-full bg-[#0a192f] hover:bg-[#071324] text-white font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
                    >
                      <span>En savoir plus avec Poly</span>
                      <ArrowRight size={14} className="text-[#d4af37]" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Reset button */}
              <div className="pt-4 flex justify-center">
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-2 cursor-pointer transition"
                >
                  <RotateCcw size={15} />
                  <span>Recommencer le questionnaire</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
