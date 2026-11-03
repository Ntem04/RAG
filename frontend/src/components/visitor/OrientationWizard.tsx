import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  RotateCcw,
  FlaskConical,
  Wrench,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { OrientationResult } from '../../types';
import { api } from '../../services/api';

interface OrientationWizardProps {
  language: 'fr' | 'en';
  onAskAboutTrack: (trackTitle: string) => void;
}

export const OrientationWizard: React.FC<OrientationWizardProps> = ({
  language,
  onAskAboutTrack
}) => {
  const isEn = language === 'en';

  // Stepper: 0 = Informations (Profil), 1 = Préférences (Centres d'intérêt), 2 = Résultat
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedProfile, setSelectedProfile] = useState<string>('scientifique');
  const [selectedPreference, setSelectedPreference] = useState<string>('logiciel');
  const [results, setResults] = useState<OrientationResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Screen 03. Orientation - 4 Profile Choices
  const profiles = [
    {
      id: 'scientifique',
      title: isEn ? 'Scientific' : 'Scientifique',
      sub: isEn ? '(Maths, Physics)' : '(Maths, Physique)',
      icon: <FlaskConical size={26} className="text-poly-gold" />
    },
    {
      id: 'technique',
      title: isEn ? 'Technical' : 'Technique',
      sub: isEn ? '(Engineering, Tech)' : '(Ingénierie, Techno)',
      icon: <Wrench size={26} className="text-poly-gold" />
    },
    {
      id: 'litteraire',
      title: isEn ? 'General Sciences' : 'Sciences Générales',
      sub: isEn ? '(Applied Science & Management)' : '(Sciences Appliquées & Gestion)',
      icon: <BookOpen size={26} className="text-poly-gold" />
    },
    {
      id: 'autre',
      title: isEn ? 'Other' : 'Autre',
      sub: isEn ? '(Discovering careers)' : '(En quête de découverte)',
      icon: <HelpCircle size={26} className="text-poly-gold" />
    }
  ];

  // Step 2. Preferences
  const preferences = [
    {
      id: 'logiciel',
      title: isEn ? 'Software, AI & Cyber' : 'Logiciel, IA & Cybersécurité',
      desc: isEn ? 'Coding, networks, data science, algorithms' : 'Développement, réseaux, analyse de données'
    },
    {
      id: 'construction',
      title: isEn ? 'Civil Engineering & Infrastructure' : 'Génie Civil & Bâtiment',
      desc: isEn ? 'Bridges, roads, architectural structures' : 'Ouvrages d\'art, ponts, bâtiments durables'
    },
    {
      id: 'energie',
      title: isEn ? 'Electrical Energy & Smart Systems' : 'Énergie & Systèmes Intelligents',
      desc: isEn ? 'Power grids, automation, renewable solar' : 'Réseaux électriques, domotique, énergie renouvelable'
    },
    {
      id: 'mecanique',
      title: isEn ? 'Automotive & Mechanical' : 'Automobile & Mécanique Industrielle',
      desc: isEn ? 'Mechatronics, engines, robotics' : 'Mécatronique, moteurs, robotique mobile'
    }
  ];

  const handleNext = async () => {
    if (currentStep === 0) {
      setCurrentStep(1);
    } else if (currentStep === 1) {
      setLoading(true);
      try {
        const res = await api.evaluateOrientation(
          [
            `Profil: ${selectedProfile}`,
            `Préférence: ${selectedPreference}`
          ],
          language
        );
        setResults(res);
        setCurrentStep(2);
      } catch (err) {
        console.error(err);
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

  // Mockup recommendations with real campus images
  const defaultRecommendations = [
    {
      title: isEn ? "Civil Engineering" : "Génie Civil",
      desc: isEn ? "Build a sustainable future through structural engineering." : "Construire un avenir durable par l'ingénierie et les grands ouvrages.",
      img: "/images/campus-courtyard.webp",
      affinity: 96
    },
    {
      title: isEn ? "Electrical & Energy Engineering" : "Génie Électrique",
      desc: isEn ? "Innovate in power grids and smart energy systems." : "Innover dans l'énergie, la domotique et les systèmes électriques.",
      img: "/images/campus-fountain.webp",
      affinity: 92
    },
    {
      title: isEn ? "Computer & Telecom Engineering" : "Génie Informatique & Télécommunications",
      desc: isEn ? "Design cutting-edge software and secure cyber networks." : "Développer des solutions logicielles, réseaux sécurisés et architectures d'avenir.",
      img: "/images/campus-balcony.webp",
      affinity: 89
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* 03. Stepper at Top (Matching Mockup 03. Orientation) */}
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-2 sm:space-x-4 text-xs font-semibold">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            currentStep === 0
              ? 'bg-poly-navy dark:bg-slate-800 text-white shadow-xs font-bold border border-transparent dark:border-slate-700'
              : 'bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400'
          }`}>
            <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-bold ${
              currentStep === 0
                ? 'bg-poly-gold text-slate-950'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}>1</span>
            <span>{isEn ? "Information" : "Informations"}</span>
          </div>

          <span className="text-slate-300 dark:text-slate-700">──</span>

          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            currentStep === 1
              ? 'bg-poly-navy dark:bg-slate-800 text-white shadow-xs font-bold border border-transparent dark:border-slate-700'
              : 'bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400'
          }`}>
            <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-bold ${
              currentStep === 1
                ? 'bg-poly-gold text-slate-950'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}>2</span>
            <span>{isEn ? "Preferences" : "Préférences"}</span>
          </div>

          <span className="text-slate-300 dark:text-slate-700">──</span>

          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            currentStep === 2
              ? 'bg-poly-navy dark:bg-slate-800 text-white shadow-xs font-bold border border-transparent dark:border-slate-700'
              : 'bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400'
          }`}>
            <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-bold ${
              currentStep === 2
                ? 'bg-poly-gold text-slate-950'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}>3</span>
            <span>{isEn ? "Results" : "Résultat"}</span>
          </div>
        </div>
      </div>

      {/* Screen 03 - Step 0: Quel est votre profil ? (Matching Mockup 03) */}
      {currentStep === 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 text-center">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-poly-navy dark:text-white">
              {isEn ? "What is your academic profile?" : "Quel est votre profil ?"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {isEn
                ? "Select your current high school or university background to tailor recommendations."
                : "Sélectionnez votre série de baccalauréat ou domaine d'études actuel."}
            </p>
          </div>

          {/* 4 Large Choice Cards in 2x2 Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {profiles.map((p) => {
              const isSelected = selectedProfile === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedProfile(p.id)}
                  className={`p-6 rounded-2xl border-2 transition text-left space-y-3 cursor-pointer group ${
                    isSelected
                      ? 'border-poly-gold bg-amber-50/60 dark:bg-poly-gold/15 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/90 hover:dark:bg-slate-800'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform ${
                    isSelected
                      ? 'bg-poly-gold/20 text-poly-goldDark dark:text-poly-gold'
                      : 'bg-slate-100 dark:bg-slate-700 text-poly-navy dark:text-poly-gold'
                  }`}>
                    {p.icon}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-poly-navy dark:text-white">
                      {p.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {p.sub}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Bar: Retour & Suivant */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              disabled
              className="text-xs font-semibold text-slate-300 dark:text-slate-700 cursor-not-allowed flex items-center gap-1.5"
            >
              <ArrowLeft size={14} />
              <span>{isEn ? "Back" : "Retour"}</span>
            </button>

            <button
              onClick={handleNext}
              className="bg-poly-gold hover:bg-poly-goldHover text-slate-950 font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isEn ? "Next" : "Suivant"}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Screen 03 - Step 1: Préférences */}
      {currentStep === 1 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 text-center">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-poly-navy dark:text-white">
              {isEn ? "What are your preferred engineering fields?" : "Quels sont vos domaines de prédilection ?"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {isEn
                ? "Choose the technology domain that sparks your passion."
                : "Indiquez les technologies et défis qui vous motivent le plus."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {preferences.map((pref) => {
              const isSelected = selectedPreference === pref.id;
              return (
                <button
                  key={pref.id}
                  onClick={() => setSelectedPreference(pref.id)}
                  className={`p-6 rounded-2xl border-2 transition text-left space-y-2 cursor-pointer group ${
                    isSelected
                      ? 'border-poly-gold bg-amber-50/60 dark:bg-poly-gold/15 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/90 hover:dark:bg-slate-800'
                  }`}
                >
                  <h4 className="font-extrabold text-base text-poly-navy dark:text-white">
                    {pref.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {pref.desc}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={handleBack}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-poly-navy dark:hover:text-white flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>{isEn ? "Back" : "Retour"}</span>
            </button>

            <button
              onClick={handleNext}
              disabled={loading}
              className="bg-poly-gold hover:bg-poly-goldHover text-slate-950 font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? (isEn ? "Analyzing..." : "Analyse...") : (isEn ? "See Recommendations" : "Voir mes résultats")}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Screen 04. Résultats (Matching Mockup 04. Résultats) */}
      {currentStep === 2 && (
        <div className="space-y-6 text-left">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-poly-gold bg-amber-50 dark:bg-poly-gold/10 px-2.5 py-1 rounded-md">
                Orientation ENSPD 2026
              </span>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-poly-navy dark:hover:text-white transition"
              >
                <RotateCcw size={13} />
                <span>{isEn ? "Start over" : "Recommencer"}</span>
              </button>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-poly-navy dark:text-white">
              {isEn ? "Your recommendations" : "Vos recommandations"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {isEn
                ? "Based on your academic profile, here are the ENSPD engineering tracks that best suit you:"
                : "D'après votre profil, voici les filières qui vous correspondent :"}
            </p>
          </div>

          {/* Cards with real campus photos from Mockup 04 */}
          <div className="space-y-4">
            {defaultRecommendations.map((rec, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col sm:flex-row items-stretch group"
              >
                {/* Photo Thumbnail */}
                <div className="sm:w-64 h-48 sm:h-auto shrink-0 relative overflow-hidden">
                  <img
                    src={rec.img}
                    alt={rec.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-poly-navy/90 text-poly-gold font-bold text-[10px] uppercase px-2 py-0.5 rounded">
                    {idx === 0 ? "Top 1 Recommandé" : `Top ${idx + 1}`}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-poly-navy dark:text-white">
                        {rec.title}
                      </h3>
                      <span className="text-sm font-extrabold text-poly-gold">
                        {rec.affinity}% affinité
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {rec.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => onAskAboutTrack(rec.title)}
                      className="text-xs font-bold text-poly-goldDark dark:text-poly-gold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isEn ? "Learn more & ask Poly" : "En savoir plus ->"}</span>
                    </button>

                    <button
                      onClick={() => onAskAboutTrack(rec.title)}
                      className="bg-poly-navy hover:bg-poly-deepNavy text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg transition shadow-xs"
                    >
                      {isEn ? "Discuss with Poly" : "Échanger avec Poly"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
