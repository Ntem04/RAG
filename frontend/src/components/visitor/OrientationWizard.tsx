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
  Check,
  Award,
  Layers,
  HelpCircle
} from 'lucide-react';
import { OrientationResult, RecommendedTrack } from '../../types';
import { api } from '../../services/api';
import { Reveal } from '../common/Reveal';
import { SkeletonRecommendationCard, Skeleton } from '../common/Skeleton';

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
          tag: "Sciences Pures",
          icon: <Atom size={22} className="text-[#d4af37]" />,
          label: isEn ? "Bac C / D (Mathematics, Physics & Life Sciences)" : "Bac C / D (Mathématiques, Sciences Physiques & SVT)",
          sub: "Maths pures, physique fondamentale, chimie et sciences appliquées"
        },
        {
          key: "B",
          tag: "Numérique & Algorithmes",
          icon: <Code2 size={22} className="text-[#d4af37]" />,
          label: isEn ? "Bac E / TI (Mathematics, Technology & Computer Science)" : "Bac E / TI (Maths, Technologies & Informatique)",
          sub: "Algorithmique, programmation, robotique et sciences de l'ingénieur"
        },
        {
          key: "C",
          tag: "Industrie & BTP",
          icon: <HardHat size={22} className="text-[#d4af37]" />,
          label: isEn ? "Bac F (F1 Mechanical, F2/F3 Electrical, F4 Civil)" : "Bac F (F1 Mécanique, F2/F3 Électrique, F4 Génie Civil)",
          sub: "Spécialités technologiques industrielles, électrotechnique et bâtiment"
        },
        {
          key: "D",
          tag: "Cursus International",
          icon: <GraduationCap size={22} className="text-[#d4af37]" />,
          label: isEn ? "GCE A-Level (Maths, Physics, Chemistry, Further Maths)" : "GCE A-Level (Maths, Physics, Chemistry, Further Maths)",
          sub: "Sous-système anglophone ou baccalauréat scientifique international"
        },
        {
          key: "E",
          tag: "Passerelle Supérieure",
          icon: <Briefcase size={22} className="text-[#d4af37]" />,
          label: isEn ? "Associate Degree / BTS / Bachelor transfer" : "Bac Pro / BT / BTS ou Licence Scientifique",
          sub: "Diplômes technologiques supérieurs ou réorientation vers l'ingénierie"
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
        { key: "A", tag: "IA & Réseaux", icon: <Cpu size={22} className="text-[#d4af37]" />, label: "Génie Informatique & Télécommunications (GIT)", sub: "Intelligence Artificielle, Cloud, Cybersécurité, Développement Logiciel & Données" },
        { key: "B", tag: "Infrastructures", icon: <Building size={22} className="text-[#d4af37]" />, label: "Génie Civil (GCI)", sub: "Bâtiment, Ponts, Viaducs, Routes, Géotechnique & Grands Ouvrages d'Art" },
        { key: "C", tag: "Énergie & Automates", icon: <Zap size={22} className="text-[#d4af37]" />, label: "Génie Électrique et Systèmes Intelligents (GESI)", sub: "Réseaux Smart Grids, Électronique de Puissance & Automates Industriels" },
        { key: "D", tag: "Mobilité Propre", icon: <Car size={22} className="text-[#d4af37]" />, label: "Génie Automobile et Mécatronique (GAM)", sub: "Véhicules Hybrides/Électriques, Moteurs, Robotique Mobile & Diagnostic Embarqué" },
        { key: "E", tag: "Océan & Logistique", icon: <Anchor size={22} className="text-[#d4af37]" />, label: "Génie Maritime et Portuaire (GMP)", sub: "Infrastructures Portuaires, Chantiers Navals, Génie Océanique & Logistique Maritime" },
        { key: "F", tag: "Chimie & Santé", icon: <Beaker size={22} className="text-[#d4af37]" />, label: "Génie des Procédés (GPR)", sub: "Chimie Industrielle, Raffinage Pétrolier, Pharmacie & Bioprocédés Agroalimentaires" },
        { key: "G", tag: "Transition Verte", icon: <SunMedium size={22} className="text-[#d4af37]" />, label: "Génie Énergétique (GEN)", sub: "Énergies Renouvelables, Solaire Photovoltaïque, Climatisation Industrielle & Froid" },
        { key: "H", tag: "Industrie 4.0", icon: <Cog size={22} className="text-[#d4af37]" />, label: "Génie Mécanique (GME)", sub: "Conception CAO 3D, Usinage Numérique CNC, Chaudronnerie & Tuyauterie Industrielle" },
        { key: "I", tag: "Sûreté & RSE", icon: <ShieldCheck size={22} className="text-[#d4af37]" />, label: "Génie QHSE & Environnement Industriel (QHSEI)", sub: "Sûreté Industrielle, Prévention des Risques, Dépollution & Certification ISO" },
        { key: "J", tag: "Biomédical", icon: <Activity size={22} className="text-[#d4af37]" />, label: "Génie Physique & Technologies Biomédicales (GPH)", sub: "Capteurs Haute Précision, Photonique Laser, Physique Médicale & Radiothérapie" }
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
        { key: "A", tag: "Espace Tech & Cloud", icon: <Cpu size={22} className="text-[#d4af37]" />, label: "Datacenter, studio logiciel ou laboratoire d'architecture cloud", sub: "Environnement high-tech connecté, stations multi-écrans et travail d'équipe agile" },
        { key: "B", tag: "Grands Chantiers", icon: <Building size={22} className="text-[#d4af37]" />, label: "Grands chantiers extérieurs, autoroutes et ponts en construction", sub: "Pilotage direct sur le terrain au contact des équipes techniques de construction" },
        { key: "C", tag: "Supervision Électrique", icon: <Zap size={22} className="text-[#d4af37]" />, label: "Centrale électrique, sous-station ou salle de commande automatisée", sub: "Supervision en temps réel des flux de puissance et des réseaux électriques intelligents" },
        { key: "D", tag: "Labo Mécatronique", icon: <Car size={22} className="text-[#d4af37]" />, label: "Atelier mécatronique, banc d'essai moteur ou centre de diagnostic", sub: "Conception et tests dynamiques de systèmes robotisés et véhicules de nouvelle génération" },
        { key: "E", tag: "Espace Maritime", icon: <Anchor size={22} className="text-[#d4af37]" />, label: "Terminal portuaire, quai de manutention ou chantier naval", sub: "Environnement maritime international, quais côtiers et logistique portuaire" },
        { key: "F", tag: "Salle Blanche & Usine", icon: <Beaker size={22} className="text-[#d4af37]" />, label: "Unité pétrochimique, laboratoire pharmaceutique ou usine de synthèse", sub: "Transformation industrielle, réacteurs chimiques contrôlés et biotechnologies" },
        { key: "G", tag: "Centrales Propres", icon: <SunMedium size={22} className="text-[#d4af37]" />, label: "Parcs solaires photovoltaïques, éoliens ou centrales d'énergie", sub: "Déploiement d'équipements renouvelables et réalisation d'audits d'efficacité énergétique" },
        { key: "H", tag: "Bureau CAO 3D", icon: <Cog size={22} className="text-[#d4af37]" />, label: "Atelier d'usinage numérique CNC, bureau de CAO 3D ou métallurgie", sub: "Fabrication de composants mécaniques de précision et modélisation tridimensionnelle" }
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
        { key: "A", tag: "IA & Souveraineté", icon: <Cpu size={22} className="text-[#d4af37]" />, label: "Déployer un système d'IA sécurisé et souverain pour le diagnostic ou la finance", sub: "Algorithmes, modèles prédictifs et résilience cybernétique pour l'Afrique" },
        { key: "B", tag: "Mégastructures", icon: <Building size={22} className="text-[#d4af37]" />, label: "Diriger la réalisation d'un viaduc autoroutier ou pont suspendu majeur", sub: "Ouvrages durables résistant aux contraintes climatiques et sismiques extrêmes" },
        { key: "C", tag: "Smart Grid National", icon: <Zap size={22} className="text-[#d4af37]" />, label: "Rendre un réseau électrique national capable d'intégrer 100% d'énergie propre", sub: "Gestion intelligente des charges, micro-réseaux et stockage d'énergie haute capacité" },
        { key: "D", tag: "Véhicule Tropicalisé", icon: <Car size={22} className="text-[#d4af37]" />, label: "Développer le groupe motopropulseur d'un véhicule électrique tropicalisé", sub: "Mobilité propre, mécatronique automobile et autonomie adaptée aux réalités locales" },
        { key: "E", tag: "Hub Maritime", icon: <Anchor size={22} className="text-[#d4af37]" />, label: "Agrandir un port maritime pour accueillir les plus grands porte-conteneurs", sub: "Dragage des chenaux, quais haute capacité et modernisation logistique" },
        { key: "F", tag: "Chimie Verte", icon: <Beaker size={22} className="text-[#d4af37]" />, label: "Concevoir une unité de synthèse pharmaceutique ou de raffinage écologique", sub: "Chimie verte, valorisation de la biomasse locale et fabrication de médicaments" }
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
        { key: "A", tag: "Direction Technique", icon: <Cpu size={22} className="text-[#d4af37]" />, label: "Chief Technology Officer (CTO) ou Architecte Solutions Cloud / IA", sub: "Diriger la stratégie technologique de multinationales ou de licornes technologiques" },
        { key: "B", tag: "Directeur BTP", icon: <Building size={22} className="text-[#d4af37]" />, label: "Directeur de Projets BTP & Grandes Infrastructures", sub: "Piloter des méga-projets d'aménagement urbain, autoroutier et aéroportuaire" },
        { key: "C", tag: "Manager Énergie", icon: <Zap size={22} className="text-[#d4af37]" />, label: "Chef de Projet Réseaux d'Énergie & Automatismes Industriels", sub: "Gouverner la production, la distribution électrique et l'industrie 4.0" },
        { key: "D", tag: "Ingénieur en Chef", icon: <Car size={22} className="text-[#d4af37]" />, label: "Ingénieur en Chef de Conception Automobile & Robotique", sub: "Innover dans l'industrie automobile, l'aérospatiale et les engins autonomes" },
        { key: "E", tag: "Directeur Portuaire", icon: <Anchor size={22} className="text-[#d4af37]" />, label: "Directeur des Opérations Portuaires ou d'Ingénierie Maritime", sub: "Superviser les flux maritimes internationaux et les flottes navales" },
        { key: "F", tag: "Directeur d'Usine", icon: <Beaker size={22} className="text-[#d4af37]" />, label: "Directeur de Complexe Pétrochimique ou Pharmaceutique", sub: "Gérer des usines de transformation chimique, cosmétique et biotechnologique" }
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
  const progressPercent = ((currentStep + 1) / 5) * 100;

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-[#071324] dark:via-[#091b33] dark:to-[#071324] text-slate-900 dark:text-white flex flex-col justify-between py-6 sm:py-10 px-4 sm:px-6 lg:px-8 animate-fade-in relative">
      {/* Subtle architectural background grid */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[radial-gradient(#0a192f_1px,transparent_1px)] [background-size:20px_20px]" />

      <div className="max-w-5xl mx-auto w-full space-y-8 relative z-10">
        {/* TOP STATUS HEADER & STEPPER */}
        <div className="space-y-4">
          {/* Breadcrumb Info Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
              <span className="font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Tuteur Poly • Diagnostic d'Orientation ENSPD
              </span>
            </div>
            <div className="flex items-center gap-2 font-bold text-slate-600 dark:text-slate-300">
              <span>{Math.min(100, Math.round(progressPercent))}% complété</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-[#b8861b] dark:text-[#d4af37]">5 départements ciblés</span>
            </div>
          </div>

          {/* Stepper Journey */}
          <div className="bg-white dark:bg-[#0c1a2e] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between relative max-w-3xl mx-auto">
              {questions.map((q, idx) => {
                const isActive = currentStep === idx;
                const isPassed = currentStep > idx;
                return (
                  <React.Fragment key={q.id}>
                    <div className="flex flex-col items-center relative z-10 group">
                      <button
                        onClick={() => {
                          if (isPassed) setCurrentStep(idx);
                        }}
                        disabled={!isPassed && !isActive}
                        className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                          isActive
                            ? 'bg-[#0a192f] text-white ring-4 ring-[#d4af37]/35 shadow-md scale-105'
                            : isPassed
                            ? 'bg-[#d4af37] text-white hover:scale-105 shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {isPassed ? <Check size={16} /> : idx + 1}
                      </button>
                      <span
                        className={`text-[10px] sm:text-xs mt-1.5 font-extrabold tracking-tight transition-colors hidden sm:block ${
                          isActive
                            ? 'text-slate-900 dark:text-white'
                            : isPassed
                            ? 'text-[#b8861b] dark:text-[#d4af37]'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {q.stepLabel}
                      </span>
                    </div>

                    {/* Connecting line */}
                    {idx < questions.length - 1 && (
                      <div className="flex-1 h-0.5 mx-1 sm:mx-2 -mt-0 sm:-mt-5 bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isPassed ? 'w-full bg-[#d4af37]' : 'w-0 bg-[#d4af37]'
                          }`}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}

              {/* Connecting line to results */}
              <div className="flex-1 h-0.5 mx-1 sm:mx-2 -mt-0 sm:-mt-5 bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    currentStep === 5 ? 'w-full bg-[#d4af37]' : 'w-0'
                  }`}
                />
              </div>

              {/* Step 6: Results Step */}
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm transition-all shadow-xs ${
                    currentStep === 5
                      ? 'bg-[#d4af37] text-white ring-4 ring-[#d4af37]/35 scale-105'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Award size={18} />
                </div>
                <span
                  className={`text-[10px] sm:text-xs mt-1.5 font-extrabold hidden sm:block ${
                    currentStep === 5 ? 'text-[#d4af37]' : 'text-slate-400'
                  }`}
                >
                  {isEn ? "Results" : "Résultats"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* LOADING EVALUATION SKELETON STATE */}
        {loading && (
          <div className="bg-white dark:bg-[#0c1a2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-8 shadow-sm animate-fade-in">
            <div className="max-w-md mx-auto space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-[#d4af37]/15 flex items-center justify-center mx-auto text-[#d4af37] shadow-xs">
                <Sparkles size={28} className="animate-spin" />
              </div>
              <h3 className="font-serif font-black text-xl text-slate-900 dark:text-white">
                Calibrage des affinités d'ingénierie...
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Poly croise vos réponses avec les pondérations officielles des 10 départements de l'ENSPD.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
              <SkeletonRecommendationCard />
              <SkeletonRecommendationCard />
              <SkeletonRecommendationCard />
            </div>
          </div>
        )}

        {/* ACTIVE QUESTION STEP (0 to 4) */}
        {!loading && currentStep < 5 && currentQ && (
          <div className="bg-white dark:bg-[#0c1a2e] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 text-left transition-all">
            {/* Question Header */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-[#d4af37]/10 border border-amber-200 dark:border-[#d4af37]/30 text-[#b8861b] dark:text-[#d4af37] text-xs font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
                <span>Étape {currentStep + 1} sur 5 • {currentQ.theme}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-slate-900 dark:text-white leading-tight">
                {currentQ.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-3xl leading-relaxed">
                {currentQ.subtitle}
              </p>
            </div>

            {/* Options Grid (Balanced 2-Column Responsive Layout) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {currentQ.options.map((opt, index) => {
                const isSelected = answers[currentQ.id] === opt.key;
                const isLastAndOdd = index === currentQ.options.length - 1 && currentQ.options.length % 2 !== 0;

                return (
                  <div
                    key={opt.key}
                    onClick={() => handleSelectOption(currentQ.id, opt.key)}
                    className={`group relative p-4 sm:p-5 rounded-2xl transition-all duration-200 cursor-pointer flex items-start justify-between gap-4 select-none ${
                      isLastAndOdd ? 'md:col-span-2' : ''
                    } ${
                      isSelected
                        ? 'bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 dark:from-[#132238] dark:via-[#0c1829] dark:to-[#0f2542] border-2 border-[#d4af37] ring-2 ring-[#d4af37]/20 shadow-md -translate-y-0.5'
                        : 'bg-white dark:bg-[#0c1829] border border-slate-200 dark:border-slate-800 hover:border-amber-400/60 dark:hover:border-amber-500/40 hover:shadow-sm hover:-translate-y-0.5'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      {/* Executive Letter Badge */}
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-all ${
                          isSelected
                            ? 'bg-[#0a192f] text-[#d4af37] ring-2 ring-[#d4af37] shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {opt.key}
                      </div>

                      {/* Icon Squircle with Tinted Glass Effect */}
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        {opt.icon}
                      </div>

                      {/* Content & Tag */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                            {opt.label}
                          </h4>
                          {'tag' in opt && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 shrink-0">
                              {(opt as any).tag}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                          {opt.sub}
                        </p>
                      </div>
                    </div>

                    {/* Radio Checkmark */}
                    <div className="shrink-0 pt-1">
                      {isSelected ? (
                        <CheckCircle2 size={22} className="text-[#d4af37] drop-shadow-xs" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 group-hover:border-amber-400 transition-colors" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Navigation Dock */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`px-5 py-2.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
                  currentStep === 0
                    ? 'border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-60'
                    : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-2xs'
                }`}
              >
                <ArrowLeft size={16} />
                <span>{isEn ? "Previous" : "Précédent"}</span>
              </button>

              <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-400">
                <span>Étape {currentStep + 1} de 5</span>
              </div>

              <button
                onClick={handleNext}
                disabled={loading}
                className={`px-7 py-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2.5 transition shadow-md cursor-pointer ${
                  currentStep === 4
                    ? 'bg-[#d4af37] hover:bg-[#c29c29] text-white ring-2 ring-[#d4af37]/30'
                    : 'bg-[#0a192f] hover:bg-[#071324] text-white'
                }`}
              >
                <span>
                  {currentStep === 4
                    ? (isEn ? "Generate My Diagnostic" : "Générer mes recommandations")
                    : (isEn ? "Next step" : "Étape suivante")}
                </span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* RESULTS SCREEN (Step 5) */}
        {!loading && currentStep === 5 && results && (
          <div className="space-y-8 animate-fade-in text-left">
            <div className="bg-white dark:bg-[#0c1a2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-[#d4af37]/10 border border-amber-200 dark:border-[#d4af37]/30 text-[#b8861b] dark:text-[#d4af37] text-xs font-bold uppercase tracking-wider">
                <Award size={14} />
                <span>Diagnostic Personnalisé ENSPD</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-slate-900 dark:text-white">
                Vos filières d'excellence recommandées
              </h2>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                {results.summary}
              </p>
            </div>

            {/* Recommended Tracks Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.recommended_tracks.map((track) => (
                <div
                  key={track.field_code}
                  className="bg-white dark:bg-[#0c1a2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-5 hover:border-[#d4af37] hover:shadow-md transition group"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        {track.field_code}
                      </span>
                      <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-50 dark:bg-[#d4af37]/15 text-[#b8861b] dark:text-[#d4af37] border border-amber-200 dark:border-[#d4af37]/30">
                        {track.compatibility_score}% affinité
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-snug group-hover:text-[#d4af37] transition-colors">
                      {track.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {track.description}
                    </p>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        Débouchés professionnels clés :
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {track.careers.slice(0, 3).join(', ')}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onAskAboutTrack(track.title)}
                    className="w-full bg-[#0a192f] hover:bg-[#071324] text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition shadow-xs group-hover:bg-[#d4af37]"
                  >
                    <span>Explorer cette filière avec Poly</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Restart button */}
            <div className="flex justify-center pt-2">
              <button
                onClick={handleReset}
                className="px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-2 cursor-pointer transition shadow-2xs"
              >
                <RotateCcw size={15} />
                <span>Recommencer le questionnaire</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
