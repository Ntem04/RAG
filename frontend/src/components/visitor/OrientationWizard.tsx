import React, { useState, useEffect } from 'react';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  GraduationCap,
  Layers,
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
  Activity
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

  // Questions definitions matching all 10 ENSPD departments
  const questions = [
    {
      id: 1,
      theme: isEn ? "Academic Background & Diploma" : "Profil Académique & Diplôme",
      title: isEn ? "What is your high school or current academic background?" : "Quel est votre cursus d'études ou diplôme préparé ?",
      subtitle: isEn ? "Select your series or origin to calibrate entrance competition requirements." : "Sélectionnez votre filière pour adapter le calibrage des épreuves et recommandations.",
      options: [
        { key: "A", label: isEn ? "Bac C / D (Mathematics, Physics & Life Sciences)" : "Bac C / D (Mathématiques, Sciences Physiques & SVT)", sub: "Maths pures, physique et sciences appliquées" },
        { key: "B", label: isEn ? "Bac E / TI (Mathematics, Technology & Computer Science)" : "Bac E / TI (Maths, Technologies & Informatique)", sub: "Algorithmes, programmation et sciences de l'ingénieur" },
        { key: "C", label: isEn ? "Bac F (F1 Mechanical, F2/F3 Electrical, F4 Civil)" : "Bac F (F1 Mécanique, F2/F3 Électrique, F4 Génie Civil)", sub: "Spécialités technologiques industrielles et BTP" },
        { key: "D", label: isEn ? "GCE A-Level (Maths, Physics, Chemistry, Further Maths, ICT)" : "GCE A-Level (Maths, Physics, Chemistry, Further Maths)", sub: "Système anglophone ou baccalauréat international" },
        { key: "E", label: isEn ? "Associate Degree / BTS / Bachelor transfer" : "Bac Pro / BT / BTS ou Licence Scientifique", sub: "Études supérieures scientifiques ou réorientation technique" }
      ]
    },
    {
      id: 2,
      theme: isEn ? "Preferred Engineering Domain" : "Domaine d'Ingénierie de Prédilection",
      title: isEn ? "Which engineering field excites you the most?" : "Quel grand domaine d'ingénierie vous passionne le plus ?",
      subtitle: isEn ? "Choose your primary technological interest among ENSPD's 10 departments." : "Choisissez votre domaine de prédilection parmi les 10 départements officiels de l'ENSPD.",
      options: [
        { key: "A", label: "Génie Informatique & Télécommunications (GIT)", sub: "Intelligence Artificielle, Cloud, Cybersécurité, Développement Logiciel & Données", icon: <Cpu size={20} className="text-poly-gold" /> },
        { key: "B", label: "Génie Civil (GCI)", sub: "Bâtiment, Ponts, Viaducs, Routes, Géotechnique & Grands Ouvrages d'Art", icon: <Building size={20} className="text-poly-gold" /> },
        { key: "C", label: "Génie Électrique et Systèmes Intelligents (GESI)", sub: "Réseaux Smart Grids, Électronique de Puissance & Automates Industriels", icon: <Zap size={20} className="text-poly-gold" /> },
        { key: "D", label: "Génie Automobile et Mécatronique (GAM)", sub: "Véhicules Hybrides/Électriques, Moteurs, Robotique Mobile & Diagnostic Embarqué", icon: <Car size={20} className="text-poly-gold" /> },
        { key: "E", label: "Génie Maritime et Portuaire (GMP)", sub: "Infrastructures Portuaires, Chantiers Navals, Génie Océanique & Logistique Maritime", icon: <Anchor size={20} className="text-poly-gold" /> },
        { key: "F", label: "Génie des Procédés (GPR)", sub: "Chimie Industrielle, Raffinage Pétrolier, Pharmacie & Bioprocédés Agroalimentaires", icon: <Beaker size={20} className="text-poly-gold" /> },
        { key: "G", label: "Génie Énergétique (GEN)", sub: "Énergies Renouvelables, Solaire Photovoltaïque, Climatisation Industrielle & Froid", icon: <SunMedium size={20} className="text-poly-gold" /> },
        { key: "H", label: "Génie Mécanique (GME)", sub: "Conception CAO 3D, Usinage Numérique CNC, Chaudronnerie & Tuyauterie Industrielle", icon: <Cog size={20} className="text-poly-gold" /> },
        { key: "I", label: "Génie QHSE & Environnement Industriel (QHSEI)", sub: "Sûreté Industrielle, Prévention des Risques, Dépollution & Certification ISO", icon: <ShieldCheck size={20} className="text-poly-gold" /> },
        { key: "J", label: "Génie Physique & Technologies Biomédicales (GPH)", sub: "Capteurs Haute Précision, Photonique Laser, Physique Médicale & Radiothérapie", icon: <Activity size={20} className="text-poly-gold" /> }
      ]
    },
    {
      id: 3,
      theme: isEn ? "Workplace Environment" : "Environnement de Travail Idéal",
      title: isEn ? "Where do you envision yourself working on a daily basis?" : "Où vous imaginez-vous exercer avec le plus de plaisir au quotidien ?",
      subtitle: isEn ? "The day-to-day environment defines your professional comfort and impact." : "Votre lieu d'exercice quotidien reflète votre style d'ingénierie.",
      options: [
        { key: "A", label: "Datacenter, studio logiciel ou laboratoire d'architecture cloud", sub: "Environnement high-tech connecté et postes multi-écrans" },
        { key: "B", label: "Grands chantiers extérieurs, autoroutes et ponts en construction", sub: "Pilotage direct sur le terrain au contact des équipes BTP" },
        { key: "C", label: "Centrale électrique, sous-station ou salle de commande automatisée", sub: "Supervision des flux de puissance et réseaux intelligents" },
        { key: "D", label: "Atelier mécatronique, banc d'essai moteur ou centre de diagnostic", sub: "Conception et tests dynamiques de systèmes robotisés et automobiles" },
        { key: "E", label: "Terminal portuaire, quai de manutention, chantier naval ou plateforme en mer", sub: "Environnement maritime international et logistique côtière" },
        { key: "F", label: "Unité pétrochimique, laboratoire pharmaceutique ou usine de synthèse", sub: "Transformation industrielle, réacteurs chimiques et salle blanche" },
        { key: "G", label: "Parcs solaires photovoltaïques, fermes éoliennes ou complexes thermiques", sub: "Déploiement d'équipements propres et audits énergétiques" },
        { key: "H", label: "Atelier d'usinage numérique 5 axes, bureau de CAO 3D ou métallurgie", sub: "Fabrication de composants mécaniques et structures mécano-soudées" },
        { key: "I", label: "Direction générale de site industriel pour piloter la sécurité et l'environnement", sub: "Audits de conformité, plans de dépollution et sécurité des personnes" },
        { key: "J", label: "Hôpital pour la physique médicale, centre de radiothérapie ou labo photonique", sub: "Instrumentation biomédicale de pointe et imagerie avancée" }
      ]
    },
    {
      id: 4,
      theme: isEn ? "Inspiring Engineering Challenge" : "Projet d'Ingénierie Stimulant",
      title: isEn ? "Which major technical challenge would you be proudest to accomplish?" : "Quel grand défi technique vous rendrait le plus fier d'avoir accompli ?",
      subtitle: isEn ? "Your ambition reflects the concrete problems you want to solve." : "Votre motivation à relever des défis réels pour le Cameroun et l'Afrique.",
      options: [
        { key: "A", label: "Déployer un système d'IA sécurisé et souverain pour le diagnostic ou la finance", sub: "Algorithmes, modèles prédictifs et résilience cybernétique" },
        { key: "B", label: "Diriger la réalisation d'un viaduc autoroutier ou pont suspendu de plusieurs kilomètres", sub: "Ouvrages durables résistant aux contraintes extrêmes" },
        { key: "C", label: "Rendre un réseau électrique national capable d'intégrer 100% d'énergie propre", sub: "Gestion intelligente des charges et stockage d'énergie" },
        { key: "D", label: "Développer le groupe motopropulseur et la batterie d'un véhicule électrique tropicalisé", sub: "Mobilité propre, mécatronique et autonomie durable" },
        { key: "E", label: "Agrandir un port maritime pour accueillir les plus grands porte-conteneurs du monde", sub: "Dragage des chenaux, quais haute capacité et logistique" },
        { key: "F", label: "Concevoir une unité de synthèse pharmaceutique ou de raffinage écologique", sub: "Chimie verte, valorisation de la biomasse et médicaments" },
        { key: "G", label: "Électrifier des communautés rurales avec des micro-réseaux solaires autonomes", sub: "Accès universel à l'énergie propre et climatisation durable" },
        { key: "H", label: "Usiner des pièces mécaniques de très haute précision pour l'industrie lourde", sub: "Tolérances microniques et robustesse des matériaux" },
        { key: "I", label: "Atteindre le zéro accident industriel et zéro déchet rejeté pour une multinationale", sub: "Responsabilité environnementale, normes ISO et sûreté" },
        { key: "J", label: "Mettre au point un capteur optique haute résolution pour détecter les tumeurs", sub: "Physique médicale, rayonnements thérapeutiques et imagerie" }
      ]
    },
    {
      id: 5,
      theme: isEn ? "Long-Term Career Vision" : "Objectif de Carrière & Ambition",
      title: isEn ? "What career milestone do you aim for after graduation?" : "Quel titre ou fonction visez-vous 5 ans après votre diplôme ENSPD ?",
      subtitle: isEn ? "Le diplôme d'ingénieur de conception de l'ENSPD ouvre les portes des plus hautes responsabilités." : "Choisissez la trajectoire professionnelle qui vous inspire le plus.",
      options: [
        { key: "A", label: "Chief Technology Officer (CTO) ou Architecte Solutions Cloud / IA", sub: "Diriger la stratégie technique de startups ou multinationales" },
        { key: "B", label: "Directeur de Projets BTP & Infrastructures Internationales", sub: "Piloter des méga-projets d'aménagement urbain et autoroutier" },
        { key: "C", label: "Chef de Projet Réseaux d'Énergie & Automatismes Industriels", sub: "Gouverner la distribution électrique et l'industrie 4.0" },
        { key: "D", label: "Ingénieur en Chef de Conception Automobile & Robotique", sub: "Innover dans l'industrie automobile et les engins autonomes" },
        { key: "E", label: "Directeur des Opérations Portuaires ou d'Ingénierie Maritime", sub: "Superviser les flux portuaires et les flottes navales" },
        { key: "F", label: "Directeur de Complexe Pétrochimique ou Pharmaceutique", sub: "Gérer des usines de transformation chimique et biotechnologique" },
        { key: "G", label: "Expert International en Décarbonation & Énergies Renouvelables", sub: "Accompagner la transition énergétique mondiale" },
        { key: "H", label: "Directeur d'Usine Mécanique & Ingénieur Concepteur CAO", sub: "Orchestrer la fabrication mécanique et l'usinage industriel" },
        { key: "I", label: "Directeur Groupe QHSE & Sûreté des Installations", sub: "Garantir la sécurité des collaborateurs et la préservation écologique" },
        { key: "J", label: "Chercheur ou Spécialiste R&D en Physique Médicale et Métrologie", sub: "Innover dans les technologies de santé et l'instrumentation" }
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

  // Department thumbnail photos
  const getTrackImage = (code: string) => {
    switch (code) {
      case 'FIL-GCI':
        return '/images/campus-courtyard.webp';
      case 'FIL-GESI':
        return '/images/campus-fountain.webp';
      case 'FIL-GIT':
      case 'FIL-GI':
        return '/images/campus-balcony.webp';
      case 'FIL-GAM':
        return '/images/campus-balcony.webp';
      case 'FIL-GMP':
        return '/images/campus-courtyard.webp';
      case 'FIL-GPR':
        return '/images/campus-fountain.webp';
      case 'FIL-GEN':
        return '/images/campus-balcony.webp';
      case 'FIL-GME':
        return '/images/campus-courtyard.webp';
      case 'FIL-QHSEI':
        return '/images/campus-fountain.webp';
      case 'FIL-GPH':
      default:
        return '/images/campus-courtyard.webp';
    }
  };

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
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in text-left">
      {/* Stepper matching Mockup 03 */}
      <Reveal direction="down" delay={50}>
        <div className="flex items-center justify-center overflow-x-auto pb-2">
          <div className="flex items-center space-x-1 sm:space-x-2 text-xs font-semibold">
            {questions.map((q, idx) => {
              const isActive = currentStep === idx;
              const isDone = currentStep > idx;
              return (
                <React.Fragment key={q.id}>
                  <div
                    onClick={() => {
                      if (isDone) setCurrentStep(idx);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                      isActive
                        ? 'bg-poly-navy dark:bg-slate-800 text-white shadow-xs font-bold border border-transparent dark:border-slate-700'
                        : isDone
                        ? 'bg-amber-50 dark:bg-poly-gold/15 text-poly-goldDark dark:text-poly-gold cursor-pointer font-bold'
                        : 'bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-bold ${
                        isActive
                          ? 'bg-poly-gold text-white'
                          : isDone
                          ? 'bg-poly-gold text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="hidden sm:inline">{q.theme.split(' ')[0]}</span>
                  </div>
                  {idx < questions.length - 1 && (
                    <span className="text-slate-300 dark:text-slate-700 text-xs">─</span>
                  )}
                </React.Fragment>
              );
            })}

            <span className="text-slate-300 dark:text-slate-700 text-xs">─</span>

            {/* Results Step */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                currentStep === 5
                  ? 'bg-poly-navy dark:bg-slate-800 text-white shadow-xs font-bold border border-transparent dark:border-slate-700'
                  : 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-bold ${
                  currentStep === 5
                    ? 'bg-poly-gold text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                ★
              </span>
              <span className="hidden sm:inline">{isEn ? "Results" : "Résultats"}</span>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Screen 03 - Questions Steps (0 to 4) */}
      {currentStep < 5 && currentQ && (
        <Reveal direction="up" delay={100}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 shadow-xs space-y-8">
            <div className="space-y-2 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-poly-gold bg-amber-50 dark:bg-poly-gold/10 px-3 py-1 rounded-md inline-block">
                Étape {currentStep + 1} sur 5 • {currentQ.theme}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-poly-navy dark:text-white">
                {currentQ.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                {currentQ.subtitle}
              </p>
            </div>

            {/* Choices Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {currentQ.options.map((opt) => {
                const isSelected = answers[currentQ.id] === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => handleSelectOption(currentQ.id, opt.key)}
                    className={`p-5 rounded-xl border-2 transition text-left space-y-2 cursor-pointer group ${
                      isSelected
                        ? 'border-poly-gold bg-amber-50/60 dark:bg-poly-gold/15 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/80 hover:dark:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-extrabold ${
                            isSelected
                              ? 'bg-poly-gold text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {opt.key}
                        </span>
                        {'icon' in opt && (
                          <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            {(opt as any).icon}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <CheckCircle2 size={18} className="text-poly-gold" />
                      )}
                    </div>

                    <div>
                      <h4 className="font-extrabold text-sm text-poly-navy dark:text-white leading-snug">
                        {opt.label}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {opt.sub}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Bar: Retour & Suivant */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`text-xs font-bold px-4 py-2 rounded-md transition flex items-center gap-1.5 ${
                  currentStep === 0
                    ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                    : 'text-slate-600 dark:text-slate-300 hover:text-white hover:bg-poly-navy dark:hover:bg-white/10 cursor-pointer'
                }`}
              >
                <ArrowLeft size={14} />
                <span>{isEn ? "Back" : "Retour"}</span>
              </button>

              <button
                onClick={handleNext}
                disabled={loading}
                className="bg-poly-gold hover:bg-poly-goldHover text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-md transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? (isEn ? "Computing matches..." : "Analyse en cours...") : currentStep === 4 ? (isEn ? "Generate Recommendations" : "Découvrir mes filières") : (isEn ? "Next" : "Suivant")}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </Reveal>
      )}

      {/* Screen 04. Résultats Sur-Mesure (Matching Mockup 04) */}
      {currentStep === 5 && results && (
        <div className="space-y-6">
          <Reveal direction="down" delay={50}>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-poly-gold bg-amber-50 dark:bg-poly-gold/10 px-3 py-1 rounded-md">
                  Orientation Personnalisée ENSPD 2026
                </span>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-white hover:bg-poly-navy dark:hover:bg-white/10 px-3 py-1.5 rounded-md transition cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>{isEn ? "Retake test" : "Recommencer le test"}</span>
                </button>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-poly-navy dark:text-white">
                {isEn ? "Your personalized engineering tracks" : "Vos filières recommandées sur-mesure"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                {results.summary_advice}
              </p>
            </div>
          </Reveal>

          {/* Dynamic Recommendations List */}
          <div className="space-y-4">
            {results.recommended_tracks.map((track, idx) => (
              <Reveal key={track.field_code} direction="up" delay={100 * (idx + 1)}>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col md:flex-row items-stretch group">
                  {/* Photo Thumbnail */}
                  <div className="md:w-64 h-48 md:h-auto shrink-0 relative overflow-hidden">
                    <img
                      src={getTrackImage(track.field_code)}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-poly-navy/90 text-poly-gold font-extrabold text-[10px] uppercase px-2.5 py-1 rounded-md shadow-xs">
                      {idx === 0 ? "★ Recommandation N°1" : `Top ${idx + 1}`}
                    </div>
                  </div>

                  {/* Content Details */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h3 className="text-lg font-black text-poly-navy dark:text-white">
                          {track.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">Affinité :</span>
                          <span className="text-sm font-black text-poly-gold bg-amber-50 dark:bg-poly-gold/15 px-2.5 py-0.5 rounded-md">
                            {track.match_score}%
                          </span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {track.justification}
                      </p>

                      {/* Key subjects */}
                      {track.key_subjects && track.key_subjects.length > 0 && (
                        <div className="pt-2">
                          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Matières clés & Enseignements :
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {track.key_subjects.map((sub, sIdx) => (
                              <span
                                key={sIdx}
                                className="text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60"
                              >
                                {sub}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Careers */}
                      {track.careers && track.careers.length > 0 && (
                        <div className="pt-1">
                          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Débouchés & Métiers visés :
                          </div>
                          <div className="flex flex-wrap gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                            {track.careers.join(" • ")}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <button
                        onClick={() => onAskAboutTrack(track.title)}
                        className="text-xs font-bold text-poly-goldDark dark:text-poly-gold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isEn ? "Ask Poly about this track →" : "Poser une question à Poly sur cette filière →"}</span>
                      </button>

                      <button
                        onClick={() => onAskAboutTrack(track.title)}
                        className="bg-poly-navy hover:bg-poly-deepNavy text-white font-bold text-xs px-4 py-2 rounded-md transition shadow-xs cursor-pointer"
                      >
                        {isEn ? "Explore track" : "Consulter le programme"}
                      </button>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
