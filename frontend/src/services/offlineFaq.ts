export interface LocalFAQItem {
  id: string;
  keywords: string[];
  question_fr: string;
  question_en: string;
  answer_fr: string;
  answer_en: string;
  source: string;
}

export const OFFLINE_FAQ: LocalFAQItem[] = [
  {
    id: "FAQ-FILIERES",
    keywords: ["filiere", "filieres", "specialite", "formation", "tracks", "programs"],
    question_fr: "Quelles sont les filières proposées à l'ENSPD ?",
    question_en: "What engineering tracks are offered at ENSPD?",
    answer_fr: "L'ENSPD forme en 5 ans des ingénieurs dans 5 filières majeures : Génie Informatique & Télécommunications, Génie Électrique & Énergie, Génie Mécanique & Productique, Génie Civil & Bâtiment, et Génie Chimique & Procédés Industriels.",
    answer_en: "ENSPD trains engineers in 5 main tracks: Computer Science & Telecoms, Electrical & Energy, Mechanical & Manufacturing, Civil & Infrastructure, and Chemical & Industrial Processes.",
    source: "Filières ENSPD (DEMO)"
  },
  {
    id: "FAQ-ADMISSION",
    keywords: ["concours", "admission", "bac", "serie", "candidature", "gce", "requirements"],
    question_fr: "Comment se déroule le concours d'admission ?",
    question_en: "How does the entrance competition work?",
    answer_fr: "L'admission en 1ère année se fait sur concours ouvert aux séries C, D, E, F, TI et GCE A-Level (avec matières scientifiques). Épreuves écrites en Mathématiques et Physique.",
    answer_en: "First-year admission is by competitive exam for scientific Baccalaureate (C, D, E, F, TI) or GCE A-Level holders. Written tests in Math and Physics.",
    source: "Circulaire Scolarité (DEMO)"
  },
  {
    id: "FAQ-JOURJ",
    keywords: ["programme", "jour", "heure", "horaire", "conference", "plan", "stand", "schedule"],
    question_fr: "Quel est le programme des Journées d'Orientation ?",
    question_en: "What is the Orientation Days program?",
    answer_fr: "08h30 : Accueil des visiteurs (Stand A). 09h30 : Conférence plénière en amphithéâtre. 11h30 - 15h30 : Visites des laboratoires scientifiques. 14h00 : Échanges avec les ambassadeurs.",
    answer_en: "08:30 AM: Welcome desk opens. 09:30 AM: Plenary conference. 11:30 AM - 3:30 PM: Science labs tour. 02:00 PM: Meeting student ambassadors.",
    source: "Programme Jour J (DEMO)"
  },
  {
    id: "FAQ-FRAIS",
    keywords: ["frais", "cout", "combien", "prix", "fees", "cost"],
    question_fr: "Combien coûtent les droits de scolarité ?",
    question_en: "How much are the tuition fees?",
    answer_fr: "Pour les universités d'État, les droits statutaires en formation initiale sont habituellement de 50 000 FCFA/an. Pour les montants exacts de l'année en cours, veuillez consulter le stand scolarité.",
    answer_en: "In State Universities, statutory tuition is traditionally 50,000 FCFA/year for initial training. Please confirm current rates at the admissions desk.",
    source: "Scolarité ENSPD (DEMO)"
  },
  {
    id: "FAQ-DIRECTEUR",
    keywords: ["directeur", "directeru", "direction", "mouangue", "recteur", "qui dirige", "doyen", "chef", "director"],
    question_fr: "Qui est le Directeur de l'ENSPD ?",
    question_en: "Who is the Director of ENSPD?",
    answer_fr: "Le Directeur de l'École Nationale Supérieure Polytechnique de Douala (ENSPD) est le Professeur Ruben Martin MOUANGUE (Professeur Titulaire). L'école est rattachée à l'Université de Douala, dont le Recteur est le Professeur Magloire ONDOA.",
    answer_en: "The Director of the National Higher Polytechnic School of Douala (ENSPD) is Professor Ruben Martin MOUANGUE. ENSPD is under the authority of the University of Douala, led by Rector Professor Magloire ONDOA.",
    source: "Décrets Présidentiels 2020/272 & 2020/273 / enspd-udo.cm"
  }
];

export function searchOfflineFaq(query: string, language: string = 'fr'): { answer: string; source: string } | null {
  const q = query.toLowerCase();
  for (const item of OFFLINE_FAQ) {
    if (item.keywords.some(k => q.includes(k))) {
      const isEn = language.toLowerCase() === 'en';
      return {
        answer: isEn ? item.answer_en : item.answer_fr,
        source: item.source
      };
    }
  }
  return null;
}

