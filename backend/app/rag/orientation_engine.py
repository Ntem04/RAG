from typing import List, Dict
from app.schemas.schemas import OrientationStepAnswer, RecommendedTrack, OrientationResult

# ENSPD Engineering tracks profiles
TRACKS_DATABASE = [
    {
        "code": "FIL-GI",
        "title": "Génie Informatique & Télécommunications (GI)",
        "keywords": ["maths", "informatique", "code", "ia", "logiciel", "web", "données", "réseaux", "algorithme", "cybersécurité", "programmer"],
        "justification_fr": "Cette filière correspond idéalement à ton goût pour les mathématiques, la programmation et les technologies logicielles de pointe.",
        "justification_en": "This track is a perfect fit for your passion for mathematics, programming, algorithms, and modern software technologies.",
        "key_subjects": ["Algorithmique & C++/Python", "Architecture des Réseaux", "Bases de Données & IA", "Cybersécurité", "Systèmes Embarqués"],
        "careers": ["Ingénieur Logiciel / Développeur Full-Stack", "Architecte Réseau & Cloud", "Data Scientist / Ingénieur IA", "Consultant en Cybersécurité"]
    },
    {
        "code": "FIL-GE",
        "title": "Génie Électrique & Énergie (GE)",
        "keywords": ["physique", "électronique", "énergie", "circuits", "puissance", "solaire", "automatismes", "électricité"],
        "justification_fr": "Cette filière correspond à ton intérêt pour les systèmes électriques, les énergies renouvelables et l'automatisation des réseaux intelligents.",
        "justification_en": "This track matches your interest in electrical power systems, renewable energies, smart grids, and industrial automation.",
        "key_subjects": ["Électronique de Puissance", "Énergies Renouvelables", "Automatismes Industriels", "Traitement du Signal", "Réseaux Électriques HT/BT"],
        "careers": ["Ingénieur Systèmes Énergétiques", "Chef de Projet Énergies Renouvelables", "Ingénieur en Automatismes & Contrôle", "Responsable Maintenance Électrique"]
    },
    {
        "code": "FIL-GM",
        "title": "Génie Mécanique & Productique (GMP)",
        "keywords": ["mécanique", "machines", "robotique", "cao", "moteurs", "production", "fabrication", "conception"],
        "justification_fr": "Cette filière répond à ta curiosité pour la conception de machines, la robotique industrielle et l'optimisation des chaînes de production.",
        "justification_en": "This track aligns with your curiosity for mechanical machinery design, industrial robotics, and manufacturing process optimization.",
        "key_subjects": ["CAO / DAO (SolidWorks/CATIA)", "Mécanique des Fluides & Solides", "Robotique Industrielle", "Thermodynamique", "Gestion de Production"],
        "careers": ["Ingénieur Concepteur Mécanique", "Ingénieur Robotique / Productique", "Directeur d'Usine / Maintenance", "Ingénieur Calcul de Structures"]
    },
    {
        "code": "FIL-GC",
        "title": "Génie Civil & Infrastructures (GC)",
        "keywords": ["bâtiment", "ouvrages", "béton", "ponts", "routes", "chantier", "architecture", "structures", "infrastructures"],
        "justification_fr": "Cette filière est faite pour toi si tu souhaites concevoir de grands ouvrages d'art, diriger des chantiers et bâtir des infrastructures durables.",
        "justification_en": "This track is tailored for you if you aspire to design major public works, manage construction sites, and build sustainable infrastructures.",
        "key_subjects": ["Résistance des Matériaux", "Béton Armé & Précontraint", "Géotechnique & Fondations", "Topographie & SIG", "Conduite de Chantiers"],
        "careers": ["Ingénieur Ouvrages d'Art & BTP", "Conducteur de Travaux", "Ingénieur Bureau d'Études Structures", "Urbaniste / Expert Géotechnique"]
    },
    {
        "code": "FIL-GP",
        "title": "Génie Chimique & Procédés Industriels (GCPI)",
        "keywords": ["chimie", "procédés", "environnement", "raffinage", "agroalimentaire", "matériaux", "laboratoire", "transformation"],
        "justification_fr": "Cette filière valorise tes compétences en chimie et transformation de la matière pour l'industrie pharmaceutique, pétrolière et environnementale.",
        "justification_en": "This track builds on your affinity for chemistry, matter transformation, refining, food processing, and environmental engineering.",
        "key_subjects": ["Chimie Industrielle", "Génie de la Réaction", "Phénomènes de Transfert", "Contrôle Qualité & Sécurité", "Traitement de l'Eau & Déchets"],
        "careers": ["Ingénieur des Procédés", "Responsable QHSE", "Ingénieur Raffinage & Pétrochimie", "Ingénieur Formulation Agroalimentaire"]
    }
]

ORIENTATION_QUESTIONS_FR = [
    {
        "id": 1,
        "theme": "Matières préférées",
        "question": "Quelles matières scientifiques te passionnent le plus au lycée ?",
        "options": [
            {"key": "A", "label": "Mathématiques et Informatique / Algorithmes", "tags": ["maths", "informatique", "code", "logiciel"]},
            {"key": "B", "label": "Physique, Circuits et Électricité", "tags": ["physique", "électronique", "énergie", "électricité"]},
            {"key": "C", "label": "Mécanique, Mouvements et Technologie", "tags": ["mécanique", "machines", "robotique"]},
            {"key": "D", "label": "Sciences des matériaux, Bâtiments et Géométrie", "tags": ["bâtiment", "structures", "infrastructures"]},
            {"key": "E", "label": "Chimie, Transformation de la matière et Biologie", "tags": ["chimie", "procédés", "environnement"]}
        ]
    },
    {
        "id": 2,
        "theme": "Façon de travailler",
        "question": "Quel type d'activité te stimule le plus au quotidien ?",
        "options": [
            {"key": "A", "label": "Créer des applications, coder et manipuler des données", "tags": ["informatique", "logiciel", "ia"]},
            {"key": "B", "label": "Concevoir des systèmes d'énergie et des montages électroniques", "tags": ["énergie", "circuits", "automatismes"]},
            {"key": "C", "label": "Démonter des machines, dessiner en 3D et assembler des robots", "tags": ["machines", "conception", "robotique"]},
            {"key": "D", "label": "Calculer la solidité des structures et suivre des projets sur le terrain", "tags": ["bâtiment", "chantier", "béton"]},
            {"key": "E", "label": "Faire des manipulations en laboratoire et analyser des réactions", "tags": ["chimie", "laboratoire", "procédés"]}
        ]
    },
    {
        "id": 3,
        "theme": "Centres d'intérêt",
        "question": "Quel grand défi de société aimerais-tu relever ?",
        "options": [
            {"key": "A", "label": "L'Intelligence Artificielle et la souveraineté numérique", "tags": ["ia", "cybersécurité", "données"]},
            {"key": "B", "label": "La transition énergétique et l'électrification rurale", "tags": ["énergie", "solaire", "puissance"]},
            {"key": "C", "label": "L'industrialisation locale et l'automatisation des usines", "tags": ["production", "fabrication", "machines"]},
            {"key": "D", "label": "Les routes durables, ponts modernes et villes écologiques", "tags": ["ouvrages", "ponts", "routes", "bâtiment"]},
            {"key": "E", "label": "Le traitement des eaux, l'agro-industrie et la pharmacie", "tags": ["environnement", "transformation", "agroalimentaire"]}
        ]
    }
]

ORIENTATION_QUESTIONS_EN = [
    {
        "id": 1,
        "theme": "Preferred subjects",
        "question": "Which scientific subjects do you enjoy the most?",
        "options": [
            {"key": "A", "label": "Mathematics and Computer Science / Coding", "tags": ["maths", "informatique", "code", "logiciel"]},
            {"key": "B", "label": "Physics, Electrical Circuits and Energy", "tags": ["physique", "électronique", "énergie", "électricité"]},
            {"key": "C", "label": "Mechanics, Motion and Industrial Technology", "tags": ["mécanique", "machines", "robotique"]},
            {"key": "D", "label": "Civil Engineering, Architecture and Structures", "tags": ["bâtiment", "structures", "infrastructures"]},
            {"key": "E", "label": "Chemistry, Process Engineering and Biology", "tags": ["chimie", "procédés", "environnement"]}
        ]
    },
    {
        "id": 2,
        "theme": "Work style",
        "question": "What type of technical activity motivates you best?",
        "options": [
            {"key": "A", "label": "Coding apps, working with algorithms and data", "tags": ["informatique", "logiciel", "ia"]},
            {"key": "B", "label": "Designing electrical power and automated smart grids", "tags": ["énergie", "circuits", "automatismes"]},
            {"key": "C", "label": "Designing mechanical parts in 3D CAD and robotics", "tags": ["machines", "conception", "robotique"]},
            {"key": "D", "label": "Calculating structural load and managing construction sites", "tags": ["bâtiment", "chantier", "béton"]},
            {"key": "E", "label": "Laboratory experimentation and chemical synthesis", "tags": ["chimie", "laboratoire", "procédés"]}
        ]
    },
    {
        "id": 3,
        "theme": "Ambition",
        "question": "Which major global challenge would you like to solve?",
        "options": [
            {"key": "A", "label": "Artificial Intelligence, cybersecurity, and digital tech", "tags": ["ia", "cybersécurité", "données"]},
            {"key": "B", "label": "Renewable energy transition and smart power grids", "tags": ["énergie", "solaire", "puissance"]},
            {"key": "C", "label": "Modern manufacturing and factory robotization", "tags": ["production", "fabrication", "machines"]},
            {"key": "D", "label": "Resilient bridges, modern roads and eco-friendly cities", "tags": ["ouvrages", "ponts", "routes", "bâtiment"]},
            {"key": "E", "label": "Clean water systems, green chemistry, and biotech", "tags": ["environnement", "transformation", "agroalimentaire"]}
        ]
    }
]

def get_orientation_questions(language: str = "fr"):
    return ORIENTATION_QUESTIONS_EN if language.lower() == "en" else ORIENTATION_QUESTIONS_FR

def compute_orientation_result(answers: List[OrientationStepAnswer], language: str = "fr") -> OrientationResult:
    is_en = (language.lower() == "en")
    questions = ORIENTATION_QUESTIONS_EN if is_en else ORIENTATION_QUESTIONS_FR
    
    # Collect selected tags
    collected_tags = []
    for ans in answers:
        q = next((item for item in questions if item["id"] == ans.question_id), None)
        if q:
            opt = next((o for o in q["options"] if o["key"] == ans.selected_option), None)
            if opt and "tags" in opt:
                collected_tags.extend(opt["tags"])

    # Score each track
    track_scores = []
    for track in TRACKS_DATABASE:
        score = 0
        for tag in collected_tags:
            if tag in track["keywords"]:
                score += 25
        # Base confidence
        total_score = min(98, 40 + score)
        track_scores.append((track, total_score))

    track_scores.sort(key=lambda x: x[1], reverse=True)
    top_tracks = track_scores[:3]

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
        f"À partir de tes affinités, ton profil correspond principalement à la filière {recommended[0].title}. "
        "À l'ENSPD, toutes ces formations partagent un solide tronc commun d'ingénieur en première année !"
    )
    summary_en = (
        f"Based on your preferences, your strongest match is {recommended[0].title}. "
        "At ENSPD, all these engineering branches share a rigorous foundational common core in year one!"
    )

    return OrientationResult(
        recommended_tracks=recommended,
        summary_advice=summary_en if is_en else summary_fr
    )

