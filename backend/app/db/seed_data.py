from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.db.models import KnowledgeSheet, UserAdmin, SystemSetting
from app.core.security import hash_password
from app.rag.embeddings import embedding_service

OFFICIAL_ENSPD_SHEETS = [
    {
        "code": "PROC-INSC-001",
        "title": "Procédure Officielle d'Inscription au Concours ENSPD (enspd-udo.cm/inscription)",
        "category": "admission",
        "language": "fr",
        "official_source": "Site Officiel ENSPD - https://enspd-udo.cm/inscription & https://concours.enspd-udo.cm",
        "sensitivity": "critical",
        "status": "validated",
        "content": (
            "La procédure officielle d'inscription au concours d'entrée à l'ENSPD se déroule en 4 étapes obligatoires : "
            "1. PAIEMENT PRÉALABLE : Payer les frais de concours de 20 000 FCFA (pour le Niveau 1) sur le compte bancaire officiel ENSPD auprès de la banque UBA N° 0 100 500 000 287 (ou via Express Union dans les villes sans agence UBA). Le versement doit impérativement être effectué au nom du candidat. Scanner le reçu au format JPG ou PNG en le nommant avec le numéro du reçu. "
            "2. PRÉINSCRIPTION EN LIGNE : Se rendre sur le portail https://concours.enspd-udo.cm (ou via le menu Concours > Inscription du site https://enspd-udo.cm). Remplir le formulaire en ligne, choisir son cursus et sa filière, téléverser le reçu scanné et valider. "
            "3. CONFIRMATION PAR SMS : Attendre le SMS de confirmation contenant votre numéro d'inscription officiel. "
            "4. TÉLÉCHARGEMENT & DÉPÔT PHYSIQUE : Télécharger et imprimer la fiche individuelle d'inscription/évaluation ainsi que le modèle pour l'enveloppe A4, puis déposer le dossier physique complet dans un centre agréé ou au campus de l'ENSPD."
        )
    },
    {
        "code": "PROC-INSC-001-EN",
        "title": "Official ENSPD Entrance Registration Procedure (enspd-udo.cm/inscription)",
        "category": "admission",
        "language": "en",
        "official_source": "Official Portal - https://enspd-udo.cm/inscription & https://concours.enspd-udo.cm",
        "sensitivity": "critical",
        "status": "validated",
        "content": (
            "The official registration procedure for the ENSPD competitive examination consists of 4 mandatory steps: "
            "1. PAYMENT: Pay the registration fee of 20,000 FCFA (Level 1) into the official ENSPD bank account at UBA Bank Account No. 0 100 500 000 287 (or Express Union where UBA is unavailable). The bank receipt must bear the candidate's exact name. Scan the receipt as JPG/PNG named with the receipt number. "
            "2. ONLINE FORM: Access https://concours.enspd-udo.cm (or via https://enspd-udo.cm > Concours > Inscription). Complete the registration form, choose your study track and upload the scanned receipt. "
            "3. SMS CONFIRMATION: Receive an SMS confirmation with your unique registration ID. "
            "4. PRINTING & PHYSICAL SUBMISSION: Download and print the individual registration form and the A4 envelope template, then submit the physical folder at authorized centers or directly at the ENSPD Douala campus."
        )
    },
    {
        "code": "DOS-PIECES-002",
        "title": "Composition Complète du Dossier Physique de Candidature",
        "category": "admission",
        "language": "fr",
        "official_source": "Scolarité ENSPD - Réf. Arrêté Concours MINESUP / enspd-udo.cm",
        "sensitivity": "critical",
        "status": "validated",
        "content": (
            "Le dossier physique de candidature à déposer à l'ENSPD doit obligatoirement comporter les pièces suivantes : "
            "1. La fiche individuelle d'inscription générée et imprimée depuis https://concours.enspd-udo.cm, dûment remplie et timbrée d'un timbre fiscal réglementaire. "
            "2. Une photocopie certifiée conforme de l'acte de naissance datant de moins de 3 mois. "
            "3. Une photocopie certifiée conforme du Baccalauréat, BT, GCE/AL ou attestation de réussite. "
            "4. Les photocopies certifiées conformes des relevés de notes du Probatoire et du Baccalauréat (ou relevés de Form 5 et Upper Sixth pour le sous-système anglophone). "
            "5. Un certificat médical délivré par un médecin de l'administration publique attestant de l'aptitude physique aux travaux d'ingénieur. "
            "6. Le reçu original de versement bancaire des frais de concours (banque UBA ou Express Union). "
            "7. Deux (02) photos d'identité couleur récentes au format 4x4. "
            "8. Une enveloppe grand format A4 timbrée à l'adresse postale complète du candidat selon le modèle fourni en ligne."
        )
    },
    {
        "code": "DOS-PIECES-002-EN",
        "title": "Required Documents for the Physical Application File",
        "category": "admission",
        "language": "en",
        "official_source": "Admissions Office - https://enspd-udo.cm",
        "sensitivity": "critical",
        "status": "validated",
        "content": (
            "The physical registration file submitted to ENSPD must include: "
            "1. The online application form printed from https://concours.enspd-udo.cm bearing a valid fiscal stamp. "
            "2. A certified true copy of the birth certificate (less than 3 months old). "
            "3. A certified true copy of GCE Advanced Level, Baccalaureate or equivalent certificate. "
            "4. Certified true copies of Form 5 / Probatoire and Upper Sixth / Baccalaureate transcripts. "
            "5. A medical fitness certificate signed by a public administration medical officer. "
            "6. The original bank payment receipt (UBA Bank or Express Union). "
            "7. Two recent passport-size 4x4 color photos. "
            "8. A stamped self-addressed A4 envelope matching the official template."
        )
    },
    {
        "code": "EPR-CONCOURS-003",
        "title": "Épreuves Écrites du Concours d'Entrée en 1ère Année",
        "category": "admission",
        "language": "fr",
        "official_source": "Règlement des Concours ENSPD - https://enspd-udo.cm",
        "sensitivity": "critical",
        "status": "validated",
        "content": (
            "Le concours d'entrée en première année du cycle de formation des ingénieurs de l'ENSPD comprend deux épreuves écrites anonymes : "
            "1. Épreuve écrite de Mathématiques : durée de 3 heures, coefficient 1. Le programme porte sur les programmes officiels des classes de Terminale scientifique (séries C, D, E, F, TI) et Upper Sixth. "
            "2. Épreuve écrite de Physique : durée de 3 heures, coefficient 1. Le programme est basé sur la mécanique, l'électricité, l'optique et les phénomènes ondulatoires du programme officiel. "
            "Il n'y a pas d'épreuve orale pour le Niveau 1. L'admission finale est prononcée par arrêté du Ministre d'État, Ministre de l'Enseignement Supérieur (MINESUP) par ordre de mérite."
        )
    },
    {
        "code": "CURSUS-FIL-004",
        "title": "Les 2 Cursus et les 10 Départements d'Ingénieurs de l'ENSPD",
        "category": "filiere",
        "language": "fr",
        "official_source": "Offre Académique ENSPD - https://enspd-udo.cm/departements",
        "sensitivity": "normal",
        "status": "validated",
        "content": (
            "L'ENSPD propose deux grands cursus de formation universitaire : "
            "A. CURSUS INGÉNIEUR : 5 ans d'études comprenant 2 années de Classes Préparatoires Intégrées (tronc commun d'excellence scientifique) puis 3 années de Cycle d'Ingénieur de Conception. "
            "B. CURSUS SCIENCES DE L'INGÉNIEUR : formation LMD (Licence en 3 ans, Master en 2 ans). "
            "L'école compte 10 départements d'ingénieurs spécialisés : "
            "1. Génie Informatique & Télécommunications (GIT), "
            "2. Génie Électrique & Systèmes Intelligents (GESI), "
            "3. Génie Mécanique (GM), "
            "4. Génie Civil (GC), "
            "5. Génie Automobile & Mécatronique (GAM), "
            "6. Génie des Procédés (GP), "
            "7. Génie Énergétique (GE), "
            "8. Génie Maritime & Portuaire (GMP), "
            "9. Génie Physique (GPhy), "
            "10. Génie de la Qualité, Hygiène, Sécurité & Environnement Industriel (QHSE)."
        )
    },
    {
        "code": "CURSUS-FIL-004-EN",
        "title": "Engineering Tracks and 10 Departments at ENSPD",
        "category": "filiere",
        "language": "en",
        "official_source": "Academic Programs - https://enspd-udo.cm/departements",
        "sensitivity": "normal",
        "status": "validated",
        "content": (
            "ENSPD offers two main academic engineering training tracks: "
            "A. ENGINEERING DEGREE (5-year curriculum): 2 years of Integrated Preparatory Classes followed by 3 years of Advanced Engineering specialization. "
            "B. ENGINEERING SCIENCES (Bachelor-Master-Doctorate LMD curriculum): 3-year Bachelor followed by 2-year Master of Science. "
            "The school has 10 specialized engineering departments: "
            "1. Computer Engineering & Telecommunications (GIT), "
            "2. Electrical Engineering & Intelligent Systems (GESI), "
            "3. Mechanical Engineering (GM), "
            "4. Civil Engineering (GC), "
            "5. Automotive & Mechatronics Engineering (GAM), "
            "6. Chemical & Process Engineering (GP), "
            "7. Energy Engineering (GE), "
            "8. Maritime & Port Engineering (GMP), "
            "9. Physical Engineering (GPhy), "
            "10. Quality, Health, Safety & Industrial Environment (QHSE). "
            "English-speaking students with GCE Advanced Level in science subjects (Maths, Physics, Further Maths, Chemistry) are eligible to take the entrance examination and study at ENSPD."
        )
    },
    {
        "code": "FRAIS-BANQUE-005",
        "title": "Frais Officiels de Concours et Coordonnées Bancaires ENSPD",
        "category": "frais",
        "language": "fr",
        "official_source": "Direction ENSPD / Circulaire Financière - https://enspd-udo.cm",
        "sensitivity": "critical",
        "status": "validated",
        "content": (
            "Frais de participation aux concours ENSPD : "
            "• Entrée en 1ère année (Niveau 1) : 20 000 FCFA. "
            "• Entrée sur titre ou en 3ème année (Niveau 3) : 25 000 FCFA. "
            "Coordonnées bancaires officielles pour le paiement : Banque UBA (United Bank for Africa), Compte N° 0 100 500 000 287 au profit de l'ENSPD. "
            "Dans les localités ne disposant pas d'agence UBA, le paiement s'effectue via Express Union. Le reçu de versement doit obligatoirement être libellé au nom du candidat. "
            "Concernant les droits universitaires statutaires en formation initiale au Cameroun, ils sont réglementés à 50 000 FCFA par an pour les étudiants nationaux."
        )
    },
    {
        "code": "FIL-GIT-006",
        "title": "Département Génie Informatique & Télécommunications (GIT)",
        "category": "filiere",
        "language": "fr",
        "official_source": "Département GIT ENSPD - https://enspd-udo.cm",
        "sensitivity": "normal",
        "status": "validated",
        "content": (
            "Le département Génie Informatique et Télécommunications (GIT) forme des ingénieurs concepteurs de haut niveau. "
            "Domaines d'expertise : génie logiciel, intelligence artificielle, data science, cybersécurité, réseaux d'entreprises et cloud computing. "
            "Les diplômés deviennent ingénieurs logiciels, architectes réseaux, auditeurs en cybersécurité, data engineers ou chefs de projets SI dans les banques, télécoms et multinationales."
        )
    },
    {
        "code": "FIL-GESI-007",
        "title": "Département Génie Électrique & Systèmes Intelligents (GESI)",
        "category": "filiere",
        "language": "fr",
        "official_source": "Département GESI ENSPD - https://enspd-udo.cm",
        "sensitivity": "normal",
        "status": "validated",
        "content": (
            "Le département Génie Électrique et Systèmes Intelligents (GESI) couvre l'électronique de puissance, les automatismes industriels, "
            "l'Internet des Objets (IoT) et les réseaux électriques intelligents (Smart Grids). Les étudiants apprennent la régulation automatique, "
            "la programmation des automates programmables industriels et la conversion d'énergie électrique."
        )
    },
    {
        "code": "FIL-GAM-008",
        "title": "Département Génie Automobile & Mécatronique (GAM)",
        "category": "filiere",
        "language": "fr",
        "official_source": "Département GAM ENSPD - https://enspd-udo.cm",
        "sensitivity": "normal",
        "status": "validated",
        "content": (
            "Pionnier en Afrique Centrale, le département Génie Automobile et Mécatronique (GAM) forme aux technologies automobiles modernes, "
            "au diagnostic électronique embarqué, aux moteurs thermiques et électriques, et à la robotique mobile. "
            "Les diplômés interviennent dans les concessions automobiles, la maintenance industrielle, la conception mécanique et le contrôle technique."
        )
    },
    {
        "code": "FIL-GC-009",
        "title": "Département Génie Civil (GC)",
        "category": "filiere",
        "language": "fr",
        "official_source": "Département Génie Civil ENSPD - https://enspd-udo.cm",
        "sensitivity": "normal",
        "status": "validated",
        "content": (
            "Le département Génie Civil forme des ingénieurs bâtisseurs pour les ouvrages d'art, ponts, autoroutes, bâtiments écologiques et aménagements hydrauliques. "
            "Le cursus englobe la géotechnique, la résistance des matériaux, le calcul des structures en béton armé et précontraint, la topographie et la gestion de chantiers BTP."
        )
    },
    {
        "code": "FIL-GMP-010",
        "title": "Département Génie Maritime et Portuaire (GMP)",
        "category": "filiere",
        "language": "fr",
        "official_source": "Département GMP ENSPD - https://enspd-udo.cm",
        "sensitivity": "normal",
        "status": "validated",
        "content": (
            "Idéalement implanté à Douala, premier pôle portuaire de la zone CEMAC, ce département forme des ingénieurs spécialisés dans la maintenance navale, "
            "la gestion des infrastructures portuaires, la logistique maritime, l'hydrographie et les équipements de dragage et manutention lourde."
        )
    },
    {
        "code": "FIL-QHSE-011",
        "title": "Génie de la Qualité, Hygiène, Sécurité et Environnement (QHSE)",
        "category": "filiere",
        "language": "fr",
        "official_source": "Département QHSE ENSPD - https://enspd-udo.cm",
        "sensitivity": "normal",
        "status": "validated",
        "content": (
            "Le département QHSE prépare les ingénieurs à la maîtrise des risques industriels, à la gestion environnementale, au traitement des déchets, "
            "à la dépollution des sites et à la certification ISO dans les industries pétrolières, chimiques, agroalimentaires et manufacturières."
        )
    },
    {
        "code": "FIL-GME-013",
        "title": "Département Génie Mécanique (GME)",
        "category": "filiere",
        "language": "fr",
        "official_source": "Département Génie Mécanique ENSPD - https://enspd-udo.cm/departements",
        "sensitivity": "normal",
        "status": "validated",
        "content": (
            "Le département Génie Mécanique (GME) forme des ingénieurs concepteurs de systèmes mécaniques, d'équipements industriels et de machines complexes. "
            "Spécialités : Construction Mécanique et Productique (CMP), Construction Métallique et Tuyauterie Industrielle (CMT). "
            "Compétences clés : modélisation CAO/DAO 3D (SolidWorks, CATIA), usinage à commande numérique (CNC), métallurgie, chaudronnerie et tuyauterie industrielle."
        )
    },
    {
        "code": "FIL-GPR-014",
        "title": "Département Génie des Procédés (GPR)",
        "category": "filiere",
        "language": "fr",
        "official_source": "Département Génie des Procédés ENSPD - https://enspd-udo.cm/departements",
        "sensitivity": "normal",
        "status": "validated",
        "content": (
            "Le département Génie des Procédés (GPR) est dédié à la transformation industrielle de la matière et de l'énergie. "
            "Spécialités : Chimie Industrielle (CI), Bioprocédés Industriels (BI), et Génie Pharmaceutique (GP). "
            "Débouchés majeurs : raffineries pétrolières et pétrochimie, industries cosmétiques et pharmaceutiques, cimenteries et transformation agroalimentaire."
        )
    },
    {
        "code": "FIL-GEN-015",
        "title": "Département Génie Énergétique (GEN)",
        "category": "filiere",
        "language": "fr",
        "official_source": "Département Génie Énergétique ENSPD - https://enspd-udo.cm/departements",
        "sensitivity": "normal",
        "status": "validated",
        "content": (
            "Le département Génie Énergétique (GEN) forme des spécialistes de la production, de la distribution et de la gestion sobre et rationnelle de l'énergie. "
            "Spécialités : Ingénierie de la Production et de la Maîtrise de l'Énergie (IPME), Génie Frigorifique et Climatique (GFC). "
            "Expertises : parcs solaires photovoltaïques et thermiques, biomasse, climatisation industrielle et froid commercial, audit énergétique et décarbonation."
        )
    },
    {
        "code": "FIL-GPH-016",
        "title": "Département Génie Physique (GPH)",
        "category": "filiere",
        "language": "fr",
        "official_source": "Département Génie Physique ENSPD - https://enspd-udo.cm/departements",
        "sensitivity": "normal",
        "status": "validated",
        "content": (
            "Le département Génie Physique (GPH) adapte les découvertes de la physique moderne aux applications industrielles et médicales de pointe. "
            "Spécialités : Capteurs, Instrumentations et Mesures (CIM), Technologies Biomédicales et Physique Médicale (radiothérapie et imagerie oncologique). "
            "Domaines : optique et photonique, fibres optiques, lasers industriels, microélectronique et métrologie de précision."
        )
    },
    {
        "code": "ADM-DIR-012",
        "title": "Direction, Gouvernance et Création de l'ENSPD",
        "category": "institutionnel",
        "language": "fr",
        "official_source": "Décrets Présidentiels n° 2020/272 et 2020/273 du 11 mai 2020 / https://enspd-udo.cm",
        "sensitivity": "critical",
        "status": "validated",
        "content": (
            "Le Directeur de l'École Nationale Supérieure Polytechnique de Douala (ENSPD) est le Professeur Ruben Martin MOUANGUE (nom du directeur : Pr Ruben Martin MOUANGUE, Professeur Titulaire des Universités). "
            "L'ENSPD est un établissement public de référence d'enseignement supérieur et de formation des ingénieurs, rattaché à l'Université de Douala, dont le Recteur est le Professeur Magloire ONDOA. "
            "L'école a été officiellement créée et réorganisée par les décrets présidentiels n° 2020/272 et 2020/273 du 11 mai 2020 signés par le Président de la République Paul BIYA, "
            "transformant l'ancienne Faculté de Génie Industriel (FGI) en École Polytechnique d'excellence. Le campus principal de l'ENSPD est situé au quartier Ndogbong à Douala."
        )
    },
    {
        "code": "ADM-DIR-012-EN",
        "title": "ENSPD Leadership, Governance and Directorate",
        "category": "institutionnel",
        "language": "en",
        "official_source": "Presidential Decrees No. 2020/272 & 2020/273 / https://enspd-udo.cm",
        "sensitivity": "critical",
        "status": "validated",
        "content": (
            "The Director of the National Higher Polytechnic School of Douala (ENSPD) is Professor Ruben Martin MOUANGUE (official name of director: Prof. Ruben Martin MOUANGUE, Full Professor). "
            "ENSPD is a leading public higher engineering education school under the authority of the University of Douala, whose Rector is Professor Magloire ONDOA. "
            "The school was officially established by Presidential Decrees No. 2020/272 and 2020/273 of May 11, 2020, signed by President Paul BIYA, "
            "transformant the former Faculty of Industrial Engineering (FGI) into ENSPD. The main campus is located in Douala, Ndogbong."
        )
    },
    {
        "code": "JOURJ-PROG-030",
        "title": "Programme des Journées d'Orientation de l'ENSPD",
        "category": "jour_j",
        "language": "fr",
        "official_source": "Comité d'Organisation Journées d'Orientation 2026",
        "sensitivity": "normal",
        "status": "validated",
        "content": (
            "Le programme des Journées d'Orientation se déroule sur le campus de l'ENSPD (Ndogbong, Douala). "
            "08h30 : Accueil des visiteurs et enregistrement au stand central (Bâtiment A). "
            "09h30 - 11h00 : Conférence plénière en amphithéâtre 300 'Devenir Ingénieur Polytechnique au 21e siècle'. "
            "11h30 - 15h30 : Visites guidées des laboratoires scientifiques (Robots GAM, FabLab, Datacenter GIT et Bancs de génie civil). "
            "14h00 - 16h30 : Rencontres avec les chefs de départements et les étudiants ambassadeurs."
        )
    },
    {
        "code": "JOURJ-PLAN-031",
        "title": "Plan du campus et localisation des stands ENSPD",
        "category": "jour_j",
        "language": "fr",
        "official_source": "Comité d'Organisation - Plan Campus Ndogbong",
        "sensitivity": "normal",
        "status": "validated",
        "content": (
            "Le campus de l'ENSPD est situé au quartier Ndogbong à Douala. "
            "Le Stand d'Accueil Général et Borne Poly se trouvent à l'entrée principale (Bâtiment A). "
            "Le Stand Génie Informatique & IA est au 1er étage du Bâtiment Numérique. "
            "Les Stands Génie Mécanique, Automobile (GAM) et Génie Civil sont installés devant les Ateliers Technologiques (Cour Sud). "
            "Le stand Scolarité et Inscriptions Concours est situé dans le Hall de l'Amphithéâtre 300."
        )
    }
]

def seed_database(db: Session):
    existing_admin = db.query(UserAdmin).filter(UserAdmin.username == "admin").first()
    if not existing_admin:
        users = [
            UserAdmin(
                username="admin",
                email="admin.poly@enspd-udo.cm",
                full_name="Administrateur ENSPD",
                hashed_password=hash_password("AdminPassword2026!"),
                role="admin",
                is_active=True
            ),
            UserAdmin(
                username="contributeur",
                email="contributeur.poly@enspd-udo.cm",
                full_name="Référent Contenus Pédagogiques",
                hashed_password=hash_password("ContribPassword2026!"),
                role="contributeur",
                is_active=True
            ),
            UserAdmin(
                username="lecteur",
                email="lecteur.poly@enspd-udo.cm",
                full_name="Superviseur Jour J",
                hashed_password=hash_password("ReaderPassword2026!"),
                role="lecteur",
                is_active=True
            )
        ]
        db.add_all(users)
        db.commit()

    # Seed knowledge sheets with fresh data from enspd-udo.cm
    for sheet_data in OFFICIAL_ENSPD_SHEETS:
        existing = db.query(KnowledgeSheet).filter(KnowledgeSheet.code == sheet_data["code"]).first()
        vec = embedding_service.embed_text(sheet_data["content"] + " " + sheet_data["title"])
        vec_json = embedding_service.serialize_vector(vec)

        if not existing:
            sheet = KnowledgeSheet(
                code=sheet_data["code"],
                title=sheet_data["title"],
                category=sheet_data["category"],
                language=sheet_data["language"],
                content=sheet_data["content"],
                official_source=sheet_data["official_source"],
                sensitivity=sheet_data["sensitivity"],
                status=sheet_data["status"],
                version=1,
                validated_by="Comité de Direction ENSPD",
                validated_at=datetime.utcnow() - timedelta(days=1),
                expires_at=datetime.utcnow() + timedelta(days=365),
                embedding_json=vec_json
            )
            db.add(sheet)
        else:
            # Update with official web data
            existing.title = sheet_data["title"]
            existing.content = sheet_data["content"]
            existing.official_source = sheet_data["official_source"]
            existing.sensitivity = sheet_data["sensitivity"]
            existing.status = sheet_data["status"]
            existing.embedding_json = vec_json

    # Emergency setting default
    emergency_setting = db.query(SystemSetting).filter(SystemSetting.key == "emergency_shutdown").first()
    if not emergency_setting:
        setting = SystemSetting(
            key="emergency_shutdown",
            value="false",
            description="Interrupteur d'urgence EA-10"
        )
        db.add(setting)

    db.commit()
