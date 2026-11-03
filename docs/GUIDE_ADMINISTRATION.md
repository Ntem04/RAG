# Guide d'Administration du Back-Office – Poly ENSPD
**Projet :** Poly – Tuteur Conversationnel pour les Journées d'Orientation de l'ENSPD  
**Version :** 1.0 (Octobre 2026)  
**Public :** Administrateurs système, Référents pédagogiques, Responsables de scolarité

---

## 1. Accès au Back-Office (EA-01)
Le back-office est accessible directement depuis l'application via le bouton **Admin** dans la barre de navigation supérieure ou via l'URL `/` avec authentification.

### Comptes préconfigurés de démonstration
| Identifiant | Rôle | Mot de passe initial | Privilèges |
|---|---|---|---|
| `admin` | **Administrateur** | `AdminPassword2026!` | Accès total : validation des fiches, interrupteur d'urgence, gestion des utilisateurs, suppression |
| `contributeur` | **Contributeur** | `ContribPassword2026!` | Rédaction et édition des fiches de connaissance, mise à jour des statuts des demandes |
| `lecteur` | **Lecteur** | `ReaderPassword2026!` | Consultation des statistiques, fiches et demandes de rappel en lecture seule |

---

## 2. Workflow de Validation des Fiches (EA-02, EA-03)
Pour garantir la règle d'or d'exactitude (zéro hallucination), **seules les fiches au statut `validé` sont interrogées par le moteur RAG**.

1. **Création d'une fiche (Brouillon) :**
   - Cliquez sur **Nouvelle Fiche**.
   - Saisissez le code (ex: `FIL-GI-002`, `ADM-BAC-015`), le titre, la catégorie, le texte factuel (100 à 300 mots) et la source officielle.
   - La fiche est enregistrée avec le statut `brouillon`. À ce stade, le tuteur ne l'utilise pas encore.
2. **Relecture et validation :**
   - Un utilisateur avec le rôle `admin` examine le contenu.
   - En cliquant sur le bouton **Valider**, la fiche passe au statut `validé`, le nom du validateur et la date sont enregistrés.
   - Le moteur RAG commence immédiatement à citer cette fiche.
3. **Mise à jour et historique des versions (EA-02) :**
   - Toute modification sur une fiche incrémente son numéro de version (`v1` → `v2`) et archive l'ancienne version dans la table `sheet_versions`.

---

## 3. Interrupteur d'Urgence (EA-10)
En cas de fausse information diffusée ou de perturbation majeure sur le campus :
- Cliquez sur le bouton rouge **Activer l'interrupteur d'urgence** depuis le tableau de bord.
- **Délai d'effet mesuré : < 1 seconde** (exigence du cahier des charges : < 10 secondes).
- Les visiteurs reçoivent immédiatement le message officiel de maintenance les invitant à se rendre au stand d'accueil au Bâtiment A.
- La réactivation s'effectue en un clic sur le bouton vert.

---

## 4. Traitement des Demandes de Rappel (EA-08)
- Les demandes soumises par les visiteurs (avec consentement explicite ENF-08) s'affichent sous l'onglet **Demandes de Rappel**.
- Trois statuts sont disponibles : `À traiter` (pending), `En cours` (in_progress), `Traité` (resolved).
- Une note de suivi peut être ajoutée par l'opérateur pour consigner l'appel téléphonique.

---

## 5. Gestion des Questions Sans Réponse (EA-06)
- Lorsqu'une question d'un visiteur obtient un score de similarité inférieur au seuil (< 0.45), elle est automatiquement consignée dans la liste des **Questions sans réponse**.
- Cliquez sur **Créer la fiche** en face de la question pour ouvrir le formulaire pré-rempli et enrichir la base de connaissances en direct pendant l'événement.

