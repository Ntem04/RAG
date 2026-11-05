# Poly – Tuteur Intelligent d'Orientation de l'ENSPD

> Application conversationnelle et plateforme d'orientation officielle pour les Journées d'Orientation de l'École Nationale Supérieure Polytechnique de Douala (ENSPD).

---

## Présentation
**Poly** est le tuteur d'orientation officiel de l'ENSPD. Conçu pour guider les élèves de terminale, bacheliers, parents et partenaires, il fournit des informations certifiées et vérifiées à partir des fiches académiques officielles de l'école (procédure d'inscription, filières, épreuves, gouvernance).

- **Institution** : École Nationale Supérieure Polytechnique de Douala (Université de Douala)
- **Directeur** : Professeur Ruben Martin MOUANGUE
- **Tutelle** : Professeur Magloire ONDOA (Recteur de l'Université de Douala)
- **Décrets fondateurs** : Décrets présidentiels n° 2020/272 et 2020/273 du 11 mai 2020 signés par S.E. Paul BIYA

---

## Fonctionnalités Clés
1. **Accueil immersif & Statistiques** : Présentation des 10 départements d'ingénieurs, chiffres clés (10 filières d'ingénieurs, 11 départements académiques, +5 000 étudiants).
2. **Chat haute précision** : Tuteur conversationnel avec citation de fiches certifiées, tolérance aux fautes de frappe et 0 invention.
3. **Module d'Orientation en 3 étapes** : Test d'affinité académique et recommandations personnalisées avec photos du campus.
4. **Journées d'Orientation 2026** : Programme complet horaire des conférences et plan d'accès aux stands & laboratoires.
5. **Demande de rappel personnalisé** : Formulaire de contact pour être rappelé par un conseiller pédagogique.
6. **Espace Administration & Back-Office** :
   - Tableau de bord avec graphiques d'activité des conversations.
   - Gestion et workflow de validation des fiches de connaissances.
   - Suivi des questions non traitées.
   - Paramètres généraux et interrupteur d'urgence maintenance.
7. **Mode Dégradé & PWA** : Fonctionnement hors-ligne via FAQ locale mise en cache.

---

## Stack Technique
- **Frontend** : React 18, TypeScript, Vite, Tailwind CSS (PWA ultra-légère < 300 Ko, images WebP).
- **Backend** : FastAPI (Python 3.14), Pydantic v2, SQLite / PostgreSQL.
- **RAG & NLP** : Moteur hybride vectoriel + mots-clés avec tolérance aux fautes de frappe.
- **Sécurité** : Hachage bcrypt, JWT, masquage PII, détection d'injection de prompts.

---

## Installation & Démarrage

### 1. Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # ou .venv\Scripts\activate sous Windows
pip install -r requirements.txt
python run.py
```
Le serveur démarre sur `http://localhost:8000`.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
L'interface est accessible sur `http://localhost:5173`.

### 3. Tests
```bash
python -m pytest backend/tests -v
```

---

## Licence & Droits
Projet développé pour l'École Nationale Supérieure Polytechnique de Douala (ENSPD) – Tous droits réservés.
