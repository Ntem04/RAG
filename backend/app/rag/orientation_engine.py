from typing import List, Dict
from app.schemas.schemas import OrientationStepAnswer, RecommendedTrack, OrientationResult

# ENSPD Engineering tracks profiles (10 Official Departments from enspd-udo.cm/departements)
TRACKS_DATABASE = [
    {
        "code": "FIL-GI",
        "title": "Génie Informatique & Télécommunications (GIT)",
        "keywords": ["maths", "informatique", "code", "ia", "logiciel", "web", "données", "réseaux", "algorithme", "cybersécurité", "programmer", "datacenter", "cloud", "startup_tech"],
        "justification_fr": "Cette filière correspond idéalement à votre intérêt pour la programmation, l'intelligence artificielle, l'architecture réseau et la cybersécurité.",
        "justification_en": "This track is a perfect match for your affinity with software engineering, artificial intelligence, cloud networking, and cybersecurity.",
        "key_subjects": ["Génie Logiciel & Architectures Cloud", "Intelligence Artificielle & Big Data", "Sécurité des Systèmes d'Information (SSI)", "Réseaux Mobiles & Télécoms", "Systèmes Embarqués & IoT"],
        "careers": ["Ingénieur Logiciel / Développeur Full-Stack", "Architecte Cloud & Réseaux", "Data Scientist / Ingénieur IA", "Auditeur en Cybersécurité"]
    },
    {
        "code": "FIL-GESI",
        "title": "Génie Électrique et Systèmes Intelligents (GESI)",
        "keywords": ["physique", "électronique", "énergie", "circuits", "puissance", "solaire", "automatismes", "électricité", "smart_grids", "automates"],
        "justification_fr": "Votre profil s'aligne avec l'électronique de puissance, les automates programmables et les réseaux intelligents de distribution d'énergie.",
        "justification_en": "Your profile aligns with power electronics, programmable logic controllers, and next-generation smart electrical grids.",
        "key_subjects": ["Électronique de Puissance", "Ingénierie des Systèmes Automatisés (ISA)", "Smart Grids & Distribution Électrique", "Automates Programmables Industriels (API)", "Traitement du Signal"],
        "careers": ["Ingénieur Systèmes Électriques", "Chef de Projet Réseaux Intelligents", "Ingénieur en Automatismes Industriels", "Responsable Maintenance Haute Tension"]
    },
    {
        "code": "FIL-GCI",
        "title": "Génie Civil (GCI)",
        "keywords": ["bâtiment", "ouvrages", "béton", "ponts", "routes", "chantier", "architecture", "structures", "infrastructures", "terrassement", "travaux_publics"],
        "justification_fr": "Cette filière est faite pour vous qui aspirez à concevoir de grands ouvrages d'art, diriger des chantiers et bâtir des infrastructures durables.",
        "justification_en": "This department is ideal for you to design major public infrastructures, bridge structures, highways, and lead large construction sites.",
        "key_subjects": ["Bâtiments & Constructions Industrielles (BCI)", "Travaux Publics & Ouvrages d'Art (TPO)", "Résistance des Matériaux & Béton Armé", "Géotechnique & Fondations", "Topographie & Conduite de Chantiers"],
        "careers": ["Ingénieur Ouvrages d'Art & BTP", "Conducteur de Grands Travaux", "Ingénieur Bureau d'Études Structures", "Expert Géotechnique & Urbanisme"]
    },
    {
        "code": "FIL-GAM",
        "title": "Génie Automobile et Mécatronique (GAM)",
        "keywords": ["automobile", "mécatronique", "véhicules", "moteurs", "robotique_mobile", "diagnostic", "hybride", "électrique", "embarqué"],
        "justification_fr": "Vous avez un profil idéal pour concevoir les technologies automobiles du futur, les véhicules hybrides/électriques et les systèmes mécatroniques.",
        "justification_en": "You possess the ideal profile for developing automotive engineering, hybrid/electric propulsion, and mechatronic systems.",
        "key_subjects": ["Ingénierie des Systèmes Mécatroniques (ISM)", "Ingénierie Automobile (IA)", "Diagnostic Électronique Embarqué", "Propulsion Électrique & Hybride", "Robotique Mobile & Asservissement"],
        "careers": ["Ingénieur Concepteur Automobile", "Expert Mécatronique & Robotique", "Chef d'Atelier de Diagnostic Industriel", "Responsable Homologation Véhicules"]
    },
    {
        "code": "FIL-GMP",
        "title": "Génie Maritime et Portuaire (GMP)",
        "keywords": ["maritime", "port", "navires", "mer", "océan", "flotte", "dragage", "quais", "logistique_maritime", "offshore"],
        "justification_fr": "Ce département exclusif à Douala valorise votre passion pour les infrastructures maritimes, la construction navale et la logistique portuaire.",
        "justification_en": "This unique department based in Douala leverages your ambition for naval construction, harbor engineering, and coastal logistics.",
        "key_subjects": ["Infrastructures Portuaires & Quais", "Architecture & Maintenance Navale", "Hydrographie & Génie Océanique", "Logistique Maritime & Transit International", "Équipements de Manutention Lourde"],
        "careers": ["Ingénieur Ouvrages Portuaires", "Architecte / Superviseur Naval", "Directeur Logistique Maritime & Manutention", "Expert en Hydrographie et Dragage"]
    },
    {
        "code": "FIL-GPR",
        "title": "Génie des Procédés (GPR)",
        "keywords": ["chimie", "procédés", "bioprocédés", "pharmacie", "pétrochimie", "raffinage", "agroalimentaire", "transformation", "laboratoire_chimique"],
        "justification_fr": "Votre affinité pour la transformation industrielle de la matière, le raffinage, l'agroalimentaire et la pharmacie correspond au Génie des Procédés.",
        "justification_en": "Your passion for industrial matter transformation, refining, food processing, and pharmaceuticals points to Process Engineering.",
        "key_subjects": ["Chimie Industrielle (CI)", "Bioprocédés Industriels (BI)", "Génie Pharmaceutique & Cosmétique (GP)", "Thermodynamique Chimique & Réacteurs", "Raffinage & Pétrochimie"],
        "careers": ["Ingénieur de Raffinage & Pétrochimie", "Ingénieur Procédés Pharmaceutiques", "Responsable de Production Agroalimentaire", "Chercheur en Génie Chimique"]
    },
    {
        "code": "FIL-GEN",
        "title": "Génie Énergétique (GEN)",
        "keywords": ["énergie_renouvelable", "solaire", "climatisation", "froid", "thermique", "audit_énergétique", "éolien", "biomasse", "efficacité"],
        "justification_fr": "Cette filière répond à votre volonté de diriger la transition énergétique, les systèmes solaires photovoltaïques et le génie frigorifique.",
        "justification_en": "This department empowers you to lead renewable energy transitions, solar systems design, and industrial HVAC refrigeration.",
        "key_subjects": ["Production & Maîtrise de l'Énergie (IPME)", "Génie Frigorifique & Climatique (GFC)", "Centrales Solaires & Éoliennes", "Thermodynamique Industrielle", "Audit & Efficacité Énergétique"],
        "careers": ["Ingénieur en Énergies Renouvelables", "Ingénieur Frigoriste & Climatisation Industrielle", "Auditeur en Efficacité Énergétique", "Chef de Projet Parcs Solaires"]
    },
    {
        "code": "FIL-GME",
        "title": "Génie Mécanique (GME)",
        "keywords": ["mécanique", "machines", "usinage", "cao", "fao", "productique", "métallique", "tuyauterie", "fabrication", "conception_mecanique"],
        "justification_fr": "Votre profil scientifique s'épanouira dans la modélisation 3D, le dimensionnement des machines, l'usinage numérique et la construction métallique.",
        "justification_en": "Your engineering skills will excel in 3D CAD/CAM modeling, machine tooling, numerical machining, and structural metal fabrication.",
        "key_subjects": ["Construction Mécanique & Productique (CMP)", "Construction Métallique & Tuyauterie (CMT)", "Conception Assistée par Ordinateur (CAO/FAO)", "Usinage à Commande Numérique", "Mécanique des Fluides & Solides"],
        "careers": ["Ingénieur Concepteur Mécanique", "Responsable Méthodes & Usinage", "Ingénieur Charpente Métallique & Piping", "Directeur d'Atelier Industriel"]
    },
    {
        "code": "FIL-QHSEI",
        "title": "Génie Qualité, Hygiène, Sécurité et Environnement (QHSEI)",
        "keywords": ["sécurité_industrielle", "environnement", "qhse", "normes", "iso", "risques", "hygiène", "dépollution", "audit_securite"],
        "justification_fr": "Votre rigueur et votre souci de la protection humaine et environnementale sont les piliers des ingénieurs en sûreté industrielle et QHSE.",
        "justification_en": "Your rigorous standards and environmental commitment match the vital mission of industrial safety and QHSE engineers.",
        "key_subjects": ["Sécurité Industrielle & Prévention des Risques", "Environnement Industriel & Dépollution", "Qualité & Normalisation ISO", "Hygiène Industrielle & Ergonomie", "Droit de l'Environnement & Audit"],
        "careers": ["Responsable QHSE Groupe", "Auditeur de Certification ISO", "Ingénieur Sûreté des Installations Seveso", "Consultant en Éco-conception & RSE"]
    },
    {
        "code": "FIL-GPH",
        "title": "Génie Physique (GPH)",
        "keywords": ["physique_appliquee", "capteurs", "instrumentation", "optique", "biomédical", "radiothérapie", "microélectronique", "mesures", "laser"],
        "justification_fr": "Ce département de pointe valorise vos aptitudes en physique fondamentale, capteurs haute précision, optique laser et technologies médicales.",
        "justification_en": "This advanced track builds on your affinity for applied physics, precision sensors, laser optics, and biomedical healthcare instrumentation.",
        "key_subjects": ["Capteurs, Instrumentations & Mesures (CIM)", "Technologies Biomédicales & Physique Médicale", "Optique Industrielle, Lasers & Fibres", "Microélectronique & Matériaux Avancés", "Physique des Rayonnements & Radioprotection"],
        "careers": ["Ingénieur en Instrumentation & Métrologie", "Ingénieur Biomédical Hospitalier", "Spécialiste Optique & Photonique", "Ingénieur R&D Capteurs Avancés"]
    }
]

ORIENTATION_QUESTIONS_FR = [
    {
        "id": 1,
        "theme": "Profil & Série de Baccalauréat",
        "question": "Quel est votre cursus d'études actuel ou série de diplôme ?",
        "options": [
            {"key": "A", "label": "Bac C / D (Mathématiques, Sciences Physiques et SVT)", "tags": ["maths", "physique", "chimie", "physique_appliquee"]},
            {"key": "B", "label": "Bac E / TI (Mathématiques, Technologie & Informatique)", "tags": ["maths", "informatique", "code", "mécatronique", "cao"]},
            {"key": "C", "label": "Bac F (F1 Mécanique, F2/F3 Électrique, F4 Génie Civil)", "tags": ["électricité", "mécanique", "bâtiment", "circuits", "usinage"]},
            {"key": "D", "label": "GCE A-Level (Maths, Physics, Chemistry, Further Maths, ICT)", "tags": ["maths", "physique", "informatique", "génie_international"]},
            {"key": "E", "label": "Bac Pro / BT / BTS ou Licence Scientifique en réorientation", "tags": ["technique", "travaux_publics", "production", "industrie"]}
        ]
    },
    {
        "id": 2,
        "theme": "Domaine technologique favori",
        "question": "Quel grand domaine d'ingénierie vous passionne le plus ?",
        "options": [
            {"key": "A", "label": "Intelligence Artificielle, Logiciel, Réseaux & Cybersécurité (GIT)", "tags": ["informatique", "code", "ia", "logiciel", "web", "données", "réseaux", "cybersécurité"]},
            {"key": "B", "label": "BTP, Ponts, Grands Bâtiments & Ouvrages d'Art (GCI)", "tags": ["bâtiment", "ouvrages", "béton", "ponts", "routes", "chantier", "structures", "infrastructures", "travaux_publics"]},
            {"key": "C", "label": "Systèmes Électriques, Smart Grids & Automates Industriels (GESI)", "tags": ["physique", "électronique", "énergie", "circuits", "puissance", "automatismes", "électricité", "smart_grids", "automates"]},
            {"key": "D", "label": "Automobile, Véhicules Électriques/Hybrides & Mécatronique (GAM)", "tags": ["automobile", "mécatronique", "véhicules", "moteurs", "robotique_mobile", "diagnostic", "hybride", "électrique"]},
            {"key": "E", "label": "Infrastructures Portuaires, Navires & Logistique Maritime (GMP)", "tags": ["maritime", "port", "navires", "mer", "océan", "flotte", "dragage", "quais", "logistique_maritime"]},
            {"key": "F", "label": "Chimie Industrielle, Raffinage Pétrolier & Pharmacie (GPR)", "tags": ["chimie", "procédés", "bioprocédés", "pharmacie", "pétrochimie", "raffinage", "transformation", "laboratoire_chimique"]},
            {"key": "G", "label": "Énergies Renouvelables, Solaire & Climatisation Industrielle (GEN)", "tags": ["énergie_renouvelable", "solaire", "climatisation", "froid", "thermique", "audit_énergétique", "efficacité"]},
            {"key": "H", "label": "Conception Mécanique 3D, Usinage Numérique & Tuyauterie (GME)", "tags": ["mécanique", "machines", "usinage", "cao", "fao", "productique", "métallique", "conception_mecanique"]},
            {"key": "I", "label": "Sécurité Industrielle, Protection Environnement & Normes QHSE (QHSEI)", "tags": ["sécurité_industrielle", "environnement", "qhse", "normes", "iso", "risques", "hygiène", "audit_securite"]},
            {"key": "J", "label": "Physique Appliquée, Capteurs Haute Précision & Technologies Biomédicales (GPH)", "tags": ["physique_appliquee", "capteurs", "instrumentation", "optique", "biomédical", "radiothérapie", "mesures"]}
        ]
    },
    {
        "id": 3,
        "theme": "Environnement de travail idéal",
        "question": "Où vous imaginez-vous travailler au quotidien avec le plus de plaisir ?",
        "options": [
            {"key": "A", "label": "En Datacenter, laboratoire logiciel ou studio cloud moderne", "tags": ["datacenter", "cloud", "informatique", "logiciel", "code"]},
            {"key": "B", "label": "Sur les grands chantiers de construction, routes et ponts en plein air", "tags": ["chantier", "terrassement", "travaux_publics", "bâtiment", "ouvrages"]},
            {"key": "C", "label": "En centrale électrique, sous-station ou salle de régulation automatisée", "tags": ["puissance", "smart_grids", "électricité", "automates", "circuits"]},
            {"key": "D", "label": "En atelier mécatronique, banc d'essai moteur ou centre de diagnostic automobile", "tags": ["diagnostic", "moteurs", "robotique_mobile", "automobile", "véhicules"]},
            {"key": "E", "label": "Sur un terminal portuaire, quai de chargement, chantier naval ou plateforme en mer", "tags": ["port", "quais", "navires", "maritime", "offshore", "mer"]},
            {"key": "F", "label": "En unité pétrochimique, laboratoire pharmaceutique ou usine agroalimentaire", "tags": ["laboratoire_chimique", "raffinage", "procédés", "chimie", "pharmacie"]},
            {"key": "G", "label": "Sur des centrales solaires, parcs éoliens ou audits thermiques industriels", "tags": ["solaire", "énergie_renouvelable", "audit_énergétique", "climatisation"]},
            {"key": "H", "label": "En atelier d'usinage numérique, bureau de CAO 3D ou chaudronnerie", "tags": ["conception_mecanique", "usinage", "cao", "machines", "productique"]},
            {"key": "I", "label": "En direction de site industriel pour piloter la prévention des risques et la sûreté", "tags": ["audit_securite", "dépollution", "sécurité_industrielle", "qhse", "risques"]},
            {"key": "J", "label": "En hôpital pour l'imagerie médicale, laboratoire photonique ou salle blanche", "tags": ["biomédical", "radiothérapie", "optique", "physique_appliquee", "capteurs"]}
        ]
    },
    {
        "id": 4,
        "theme": "Projet d'ingénierie stimulant",
        "question": "Quel type de défi technique souhaitez-vous relever ?",
        "options": [
            {"key": "A", "label": "Développer une plateforme Cloud IA pour révolutionner la détection précoce de pannes", "tags": ["ia", "cybersécurité", "cloud", "startup_tech", "algorithme"]},
            {"key": "B", "label": "Concevoir et superviser le coulage d'un pont suspendu ou viaduc autoroutier", "tags": ["ponts", "routes", "ouvrages", "béton", "structures"]},
            {"key": "C", "label": "Concevoir un réseau électrique intelligent capable d'intégrer 100% d'énergie verte", "tags": ["smart_grids", "énergie", "puissance", "solaire", "automatismes"]},
            {"key": "D", "label": "Programmer les algorithmes de conduite autonome et le groupe propulseur d'un véhicule", "tags": ["véhicules", "hybride", "électrique", "automobile", "mécatronique"]},
            {"key": "E", "label": "Moderniser les infrastructures portuaires pour doubler la cadence des navires", "tags": ["port", "dragage", "maritime", "navires", "flotte"]},
            {"key": "F", "label": "Optimiser la synthèse industrielle d'un principe actif médical ou biocarburant", "tags": ["bioprocédés", "pharmacie", "agroalimentaire", "transformation", "pétrochimie"]},
            {"key": "G", "label": "Électrifier une ville entière grâce à une centrale hybride solaire-thermique", "tags": ["solaire", "énergie_renouvelable", "efficacité", "thermique", "froid"]},
            {"key": "H", "label": "Fabriquer des composants de haute précision par usinage 5 axes et découpe laser", "tags": ["fao", "usinage", "métallique", "mécanique", "tuyauterie"]},
            {"key": "I", "label": "Déployer un plan de dépollution et de sécurité absolue sur un complexe gazier", "tags": ["qhse", "normes", "environnement", "sécurité_industrielle", "iso"]},
            {"key": "J", "label": "Mettre au point un capteur optique haute fréquence pour la radiothérapie oncologique", "tags": ["capteurs", "laser", "biomédical", "instrumentation", "radiothérapie"]}
        ]
    },
    {
        "id": 5,
        "theme": "Objectif de carrière à long terme",
        "question": "Quelle fonction prestigieuse visez-vous après votre diplôme d'ingénieur ENSPD ?",
        "options": [
            {"key": "A", "label": "Directeur Technique (CTO) ou Architecte Solutions Cloud / IA", "tags": ["startup_tech", "ia", "logiciel", "cloud", "données"]},
            {"key": "B", "label": "Directeur de Projets d'Infrastructures & Travaux Publics Internationaux", "tags": ["chantier", "infrastructures", "travaux_publics", "bâtiment", "ouvrages"]},
            {"key": "C", "label": "Chef de Projet Réseaux d'Énergie & Automatisation Industrielle", "tags": ["puissance", "smart_grids", "automatismes", "électricité", "circuits"]},
            {"key": "D", "label": "Ingénieur en Chef de Conception Automobile & Robotique", "tags": ["automobile", "mécatronique", "robotique_mobile", "moteurs"]},
            {"key": "E", "label": "Directeur des Opérations Portuaires ou d'Ingénierie Maritime", "tags": ["maritime", "port", "logistique_maritime", "quais"]},
            {"key": "F", "label": "Directeur de Raffinerie ou de Complexe Pharmaceutique / Chimique", "tags": ["raffinage", "procédés", "chimie", "pharmacie", "bioprocédés"]},
            {"key": "G", "label": "Expert International en Énergies Propres & Transition Écologique", "tags": ["énergie_renouvelable", "audit_énergétique", "solaire", "thermique"]},
            {"key": "H", "label": "Directeur d'Usine Mécanique & Ingénieur Concepteur CAO", "tags": ["conception_mecanique", "mécanique", "machines", "productique"]},
            {"key": "I", "label": "Directeur Groupe QHSE & Sûreté des Installations Industrielles", "tags": ["qhse", "audit_securite", "sécurité_industrielle", "normes"]},
            {"key": "J", "label": "Ingénieur R&D en Physique Médicale, Instrumentation & Nanotechnologies", "tags": ["biomédical", "instrumentation", "physique_appliquee", "capteurs"]}
        ]
    }
]

ORIENTATION_QUESTIONS_EN = [
    {
        "id": 1,
        "theme": "Background & High School Diploma",
        "question": "What is your current academic background or high school diploma?",
        "options": [
            {"key": "A", "label": "Bac C / D or Science major (Mathematics, Physics, Chemistry)", "tags": ["maths", "physique", "chimie", "physique_appliquee"]},
            {"key": "B", "label": "Bac E / TI (Mathematics, Technology & Computer Science)", "tags": ["maths", "informatique", "code", "mécatronique", "cao"]},
            {"key": "C", "label": "Bac F (Mechanical, Electrical or Civil Engineering technical Bac)", "tags": ["électricité", "mécanique", "bâtiment", "circuits", "usinage"]},
            {"key": "D", "label": "GCE A-Level (Maths, Physics, Chemistry, Further Maths, ICT)", "tags": ["maths", "physique", "informatique", "génie_international"]},
            {"key": "E", "label": "Technical Diploma, Associate Degree or University transfer", "tags": ["technique", "travaux_publics", "production", "industrie"]}
        ]
    },
    {
        "id": 2,
        "theme": "Preferred Technology Domain",
        "question": "Which engineering field excites you the most?",
        "options": [
            {"key": "A", "label": "Artificial Intelligence, Software, Networks & Cybersecurity (GIT)", "tags": ["informatique", "code", "ia", "logiciel", "web", "données", "réseaux", "cybersécurité"]},
            {"key": "B", "label": "Civil Engineering, Bridges, Public Works & Structures (GCI)", "tags": ["bâtiment", "ouvrages", "béton", "ponts", "routes", "chantier", "structures", "infrastructures", "travaux_publics"]},
            {"key": "C", "label": "Electrical Systems, Smart Grids & Industrial Automation (GESI)", "tags": ["physique", "électronique", "énergie", "circuits", "puissance", "automatismes", "électricité", "smart_grids", "automates"]},
            {"key": "D", "label": "Automotive Engineering, Electric Vehicles & Mechatronics (GAM)", "tags": ["automobile", "mécatronique", "véhicules", "moteurs", "robotique_mobile", "diagnostic", "hybride", "électrique"]},
            {"key": "E", "label": "Harbor Infrastructures, Shipbuilding & Maritime Logistics (GMP)", "tags": ["maritime", "port", "navires", "mer", "océan", "flotte", "dragage", "quais", "logistique_maritime"]},
            {"key": "F", "label": "Chemical Engineering, Refining, Pharma & Bioprocesses (GPR)", "tags": ["chimie", "procédés", "bioprocédés", "pharmacie", "pétrochimie", "raffinage", "transformation", "laboratoire_chimique"]},
            {"key": "G", "label": "Renewable Energy, Solar Power & Industrial HVAC (GEN)", "tags": ["énergie_renouvelable", "solaire", "climatisation", "froid", "thermique", "audit_énergétique", "efficacité"]},
            {"key": "H", "label": "3D Mechanical Design, CNC Machining & Piping (GME)", "tags": ["mécanique", "machines", "usinage", "cao", "fao", "productique", "métallique", "conception_mecanique"]},
            {"key": "I", "label": "Industrial Safety, Environmental Protection & QHSE Standards (QHSEI)", "tags": ["sécurité_industrielle", "environnement", "qhse", "normes", "iso", "risques", "hygiène", "audit_securite"]},
            {"key": "J", "label": "Applied Physics, Precision Sensors & Biomedical Healthcare (GPH)", "tags": ["physique_appliquee", "capteurs", "instrumentation", "optique", "biomédical", "radiothérapie", "mesures"]}
        ]
    },
    {
        "id": 3,
        "theme": "Ideal Work Environment",
        "question": "Where would you prefer to work on a daily basis?",
        "options": [
            {"key": "A", "label": "In a modern Datacenter, software laboratory, or cloud studio", "tags": ["datacenter", "cloud", "informatique", "logiciel", "code"]},
            {"key": "B", "label": "On major construction sites, bridge building, and outdoor civil works", "tags": ["chantier", "terrassement", "travaux_publics", "bâtiment", "ouvrages"]},
            {"key": "C", "label": "In power plants, electrical sub-stations or automation control rooms", "tags": ["puissance", "smart_grids", "électricité", "automates", "circuits"]},
            {"key": "D", "label": "In an automotive R&D workshop, test bench or robotics laboratory", "tags": ["diagnostic", "moteurs", "robotique_mobile", "automobile", "véhicules"]},
            {"key": "E", "label": "At an ocean harbor terminal, shipyard, or offshore maritime vessel", "tags": ["port", "quais", "navires", "maritime", "offshore", "mer"]},
            {"key": "F", "label": "In a petrochemical plant, pharmaceutical lab or food processing facility", "tags": ["laboratoire_chimique", "raffinage", "procédés", "chimie", "pharmacie"]},
            {"key": "G", "label": "At solar farms, wind power parks, or green energy complexes", "tags": ["solaire", "énergie_renouvelable", "audit_énergétique", "climatisation"]},
            {"key": "H", "label": "In a CNC machining shop, 3D CAD design bureau, or metallurgy unit", "tags": ["conception_mecanique", "usinage", "cao", "machines", "productique"]},
            {"key": "I", "label": "Leading industrial safety audits, risk prevention and environmental inspection", "tags": ["audit_securite", "dépollution", "sécurité_industrielle", "qhse", "risques"]},
            {"key": "J", "label": "In hospital biomedical departments, metrology laboratories, or photonics rooms", "tags": ["biomédical", "radiothérapie", "optique", "physique_appliquee", "capteurs"]}
        ]
    },
    {
        "id": 4,
        "theme": "Engineering Challenge",
        "question": "Which engineering achievement would you be proudest of completing?",
        "options": [
            {"key": "A", "label": "Deploying an AI-driven secure cloud architecture for healthcare or finance", "tags": ["ia", "cybersécurité", "cloud", "startup_tech", "algorithme"]},
            {"key": "B", "label": "Leading the construction of a cable-stayed suspension bridge or green skyscraper", "tags": ["ponts", "routes", "ouvrages", "béton", "structures"]},
            {"key": "C", "label": "Designing a self-healing smart electrical grid running on 100% clean power", "tags": ["smart_grids", "énergie", "puissance", "solaire", "automatismes"]},
            {"key": "D", "label": "Developing autonomous driving algorithms and battery powertrain for electric vehicles", "tags": ["véhicules", "hybride", "électrique", "automobile", "mécatronique"]},
            {"key": "E", "label": "Upgrading deepwater port facilities to double international container throughput", "tags": ["port", "dragage", "maritime", "navires", "flotte"]},
            {"key": "F", "label": "Developing an industrial chemical process for sustainable biopharmaceuticals", "tags": ["bioprocédés", "pharmacie", "agroalimentaire", "transformation", "pétrochimie"]},
            {"key": "G", "label": "Powering a remote region with a micro-grid solar and thermal storage system", "tags": ["solaire", "énergie_renouvelable", "efficacité", "thermique", "froid"]},
            {"key": "H", "label": "Manufacturing aerospace-grade precision parts through 5-axis computer machining", "tags": ["fao", "usinage", "métallique", "mécanique", "tuyauterie"]},
            {"key": "I", "label": "Achieving zero accident and zero pollution certification for an industrial facility", "tags": ["qhse", "normes", "environnement", "sécurité_industrielle", "iso"]},
            {"key": "J", "label": "Designing a high-precision optical cancer radiation sensor for medical diagnosis", "tags": ["capteurs", "laser", "biomédical", "instrumentation", "radiothérapie"]}
        ]
    },
    {
        "id": 5,
        "theme": "Career Goal",
        "question": "What is your ultimate engineering career goal?",
        "options": [
            {"key": "A", "label": "Chief Technology Officer (CTO) or Cloud / AI Solutions Architect", "tags": ["startup_tech", "ia", "logiciel", "cloud", "données"]},
            {"key": "B", "label": "Director of Major International Civil Works & Infrastructure Projects", "tags": ["chantier", "infrastructures", "travaux_publics", "bâtiment", "ouvrages"]},
            {"key": "C", "label": "Head of Energy Grid Projects & Industrial Automation", "tags": ["puissance", "smart_grids", "automatismes", "électricité", "circuits"]},
            {"key": "D", "label": "Lead Automotive & Mobile Robotics Design Engineer", "tags": ["automobile", "mécatronique", "robotique_mobile", "moteurs"]},
            {"key": "E", "label": "Harbor Operations Director or Marine Engineering Leader", "tags": ["maritime", "port", "logistique_maritime", "quais"]},
            {"key": "F", "label": "Director of Petroleum Refining, Chemical or Pharmaceutical Operations", "tags": ["raffinage", "procédés", "chimie", "pharmacie", "bioprocédés"]},
            {"key": "G", "label": "Global Expert in Renewable Energies & Decarbonization", "tags": ["énergie_renouvelable", "audit_énergétique", "solaire", "thermique"]},
            {"key": "H", "label": "Chief Mechanical Design Engineer & Industrial Plant Manager", "tags": ["conception_mecanique", "mécanique", "machines", "productique"]},
            {"key": "I", "label": "Corporate Director of QHSE & Industrial Safety Systems", "tags": ["qhse", "audit_securite", "sécurité_industrielle", "normes"]},
            {"key": "J", "label": "R&D Principal Engineer in Medical Physics & Advanced Instrumentation", "tags": ["biomédical", "instrumentation", "physique_appliquee", "capteurs"]}
        ]
    }
]

def get_orientation_questions(language: str = "fr"):
    return ORIENTATION_QUESTIONS_EN if language.lower() == "en" else ORIENTATION_QUESTIONS_FR

def compute_orientation_result(answers: List[OrientationStepAnswer], language: str = "fr") -> OrientationResult:
    is_en = (language.lower() == "en")
    questions = ORIENTATION_QUESTIONS_EN if is_en else ORIENTATION_QUESTIONS_FR
    
    # Collect selected tags from all answers
    collected_tags = []
    for ans in answers:
        q = next((item for item in questions if item["id"] == ans.question_id), None)
        if q:
            opt = next((o for o in q["options"] if o["key"] == ans.selected_option), None)
            if opt and "tags" in opt:
                collected_tags.extend(opt["tags"])

    # Score all 10 ENSPD departments dynamically
    track_scores = []
    for track in TRACKS_DATABASE:
        score = 0
        for tag in collected_tags:
            if tag in track["keywords"]:
                score += 16
        # Base confidence calculated from user affinity
        total_score = min(98, 42 + score)
        track_scores.append((track, total_score))

    # Sort descending
    track_scores.sort(key=lambda x: x[1], reverse=True)
    top_tracks = track_scores[:4]

    recommended = []
    for track, score in top_tracks:
        justif = track["justification_en"] if is_en else track["justification_fr"]
        recommended.append(RecommendedTrack(
            field_code=track["code"],
            title=track["title"],
            match_score=score,
            justification=justif,
            key_subjects=track["key_subjects"],
            careers=track["careers"]
        ))

    summary_fr = (
        f"D'après vos réponses précises, votre profil d'ingénieur correspond avant tout à la filière {recommended[0].title} ({recommended[0].match_score}% d'affinité). "
        "À l'ENSPD, les deux premières années de Classes Préparatoires Intégrées vous doteront du socle scientifique commun d'excellence avant votre spécialisation !"
    )
    summary_en = (
        f"Based on your detailed answers, your engineering profile corresponds primarily to {recommended[0].title} ({recommended[0].match_score}% match). "
        "At ENSPD, the first two years of Integrated Preparatory Classes provide a world-class scientific common core before your specialization!"
    )

    return OrientationResult(
        recommended_tracks=recommended,
        summary_advice=summary_en if is_en else summary_fr
    )

