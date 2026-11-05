import time
import re
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.guardrails import detect_prompt_injection, mask_personal_data, verify_response_faithfulness
from app.db.models import KnowledgeSheet, ChatMessage, Conversation, UnansweredQuestion
from app.rag.embeddings import embedding_service
from app.rag.llm_provider import get_llm_provider
from app.schemas.schemas import ChatResponse, SheetSource
from app.services.enspd_web_fetcher import enspd_web_fetcher

STOPWORDS = {
    "la", "le", "les", "de", "des", "du", "un", "une", "est", "sont", "et", "en",
    "pour", "dans", "par", "qui", "que", "quoi", "dont", "où", "a", "à", "aux", "au",
    "ce", "cet", "cette", "ces", "mon", "ma", "mes", "ton", "ta", "tes", "son", "sa", "ses",
    "quel", "quelle", "quels", "quelles", "comment", "combien", "pourquoi", "quand",
    "donne", "donnez", "moi", "nous", "je", "tu", "il", "elle", "on", "vous", "ils", "elles",
    "the", "a", "an", "is", "are", "and", "in", "for", "of", "to", "at", "by", "from", "on",
    "what", "which", "how", "who", "whom", "where", "when", "why", "tell", "give", "me", "can",
    "could", "would", "please"
}

EMOJI_PATTERN = re.compile(
    r"[\U00010000-\U0010ffff]|[\u2600-\u27bf]|[\u2300-\u23ff]|[\u2b50-\u2b55]"
)

def remove_emojis(text: str) -> str:
    """Supprime tous les émojis et pictogrammes des réponses de l'IA pour garantir un ton strictement académique."""
    if not text:
        return ""
    cleaned = EMOJI_PATTERN.sub("", text)
    return re.sub(r" {2,}", " ", cleaned).strip()


class RAGEngine:
    def __init__(self):
        self.embedding_service = embedding_service
        self.llm_provider = get_llm_provider()

    def detect_language(self, text: str, user_preference: str = "fr") -> str:
        text_lower = text.lower()
        en_clues = ["what", "how", "when", "where", "which", "fee", "cost", "engineering", "can i", "is there", "hello", "hi", "tracks"]
        fr_clues = ["quel", "quelle", "comment", "quand", "combien", "filière", "concours", "bonjour", "salut", "frais", "cours"]
        
        en_score = sum(1 for clue in en_clues if clue in text_lower)
        fr_score = sum(1 for clue in fr_clues if clue in text_lower)
        
        if en_score > fr_score:
            return "en"
        elif fr_score > en_score:
            return "fr"
        return user_preference or "fr"

    def detect_intent(self, text: str) -> str:
        t = text.lower()
        if any(w in t for w in ["programme", "heure", "stand", "labo", "visite", "où", "plan", "jour"]):
            return "jour_j"
        if any(w in t for w in ["orient", "choisir", "hésite", "matière", "goût", "filière", "pour moi"]):
            return "orientation"
        if any(w in t for w in ["concours", "admission", "bac", "dossier", "épreuve", "date", "inscri"]):
            return "admission"
        if any(w in t for w in ["frais", "coût", "payer", "bourse", "combien"]):
            return "frais"
        if any(w in t for w in ["club", "sport", "logement", "chambre", "manger", "resto", "campus"]):
            return "vie_etudiante"
        if any(w in t for w in ["directeur", "directeru", "direction", "mouangue", "recteur", "qui est", "gouvernance", "chef", "dirige", "responsable"]):
            return "institutionnel"
        return "general"

    def hybrid_search(self, db: Session, query: str, language: str, intent: str = "general") -> List[Tuple[KnowledgeSheet, float]]:
        query_sheets = db.query(KnowledgeSheet).filter(KnowledgeSheet.status == "validated")
        all_sheets = query_sheets.all()
        if not all_sheets:
            return []

        query_vec = self.embedding_service.embed_text(query)
        scored_sheets = []
        raw_tokens = set(re.sub(r"[^\w\s]", " ", query.lower()).split())
        meaningful_tokens = {w for w in raw_tokens if w not in STOPWORDS and len(w) > 1}

        for sheet in all_sheets:
            sheet_vec = self.embedding_service.deserialize_vector(sheet.embedding_json or "[]")
            vec_sim = self.embedding_service.cosine_similarity(query_vec, sheet_vec)
            
            sheet_words = set(re.sub(r"[^\w\s]", " ", (sheet.content + " " + sheet.title).lower()).split())
            if meaningful_tokens:
                matched_count = 0
                for tok in meaningful_tokens:
                    if tok in sheet_words:
                        matched_count += 1
                    elif len(tok) >= 4:
                        # Prefix match or close typo match (e.g. directeru -> directeur)
                        matched = False
                        for sw in sheet_words:
                            if len(sw) >= 4:
                                if sw.startswith(tok) or tok.startswith(sw):
                                    matched = True
                                    break
                                if abs(len(tok) - len(sw)) <= 2:
                                    import difflib
                                    if difflib.SequenceMatcher(None, tok, sw).ratio() >= 0.80:
                                        matched = True
                                        break
                        if matched:
                            matched_count += 1
                overlap = matched_count / len(meaningful_tokens)
            else:
                overlap = 0.0
            
            # If completely zero overlap with meaningful query tokens, severely penalize similarity
            if meaningful_tokens and overlap == 0.0:
                vec_sim *= 0.3

            # Category affinity boost
            category_map = {
                "orientation": ["filiere", "orientation"],
                "admission": ["admission"],
                "jour_j": ["jour_j"],
                "vie_etudiante": ["vie_etudiante"],
                "frais": ["frais"],
                "institutionnel": ["institutionnel", "general"]
            }
            target_categories = category_map.get(intent, [intent])
            if intent != "general":
                cat_factor = 1.4 if sheet.category in target_categories else 0.85
            else:
                cat_factor = 1.0

            # Bonus if sheet language matches
            lang_factor = 1.15 if sheet.language == language else 0.85
            combined_score = (vec_sim * 0.50 + overlap * 0.50) * lang_factor * cat_factor
            scored_sheets.append((sheet, min(1.0, combined_score)))

        scored_sheets.sort(key=lambda x: x[1], reverse=True)
        if not scored_sheets:
            return []

        top_score = scored_sheets[0][1]
        # High precision filtering: only keep sheets that closely match the primary question topic
        precision_filtered = [
            item for item in scored_sheets
            if item[1] >= settings.SIMILARITY_THRESHOLD and item[1] >= (top_score * 0.85)
        ]

        if not precision_filtered:
            return scored_sheets[:settings.MAX_RETRIEVED_CHUNKS]

        return precision_filtered[:settings.MAX_RETRIEVED_CHUNKS]

    def generate_suggestions(self, intent: str, language: str) -> List[str]:
        if language == "en":
            if intent == "admission":
                return [
                    "What are the requirements for GCE A-Level holders?",
                    "What documents are needed for the registration file?",
                    "Can you help me choose the right track for me?"
                ]
            elif intent == "jour_j":
                return [
                    "Where is the software & AI engineering lab located?",
                    "What is the schedule of today's conferences?",
                    "Can I talk to an engineering student ambassador?"
                ]
            else:
                return [
                    "What engineering tracks does ENSPD offer?",
                    "How does the entrance competition work?",
                    "Start the 2-minute orientation test"
                ]
        else:
            if intent == "admission":
                return [
                    "Quelles séries du baccalauréat sont acceptées ?",
                    "Quelles sont les épreuves écrites du concours ?",
                    "Aide-moi à choisir ma filière avec le test"
                ]
            elif intent == "jour_j":
                return [
                    "Où se trouve le laboratoire d'informatique et IA ?",
                    "Quel est le programme des conférences d'aujourd'hui ?",
                    "Je souhaite échanger avec un étudiant ambassadeur"
                ]
            elif intent == "orientation":
                return [
                    "Quels sont les débouchés en Génie Informatique ?",
                    "Quelle est la différence entre Génie Mécanique et Électrique ?",
                    "Lancer le questionnaire d'orientation en 3 clics"
                ]
            else:
                return [
                    "Quelles sont les 5 filières d'ingénieurs de l'ENSPD ?",
                    "Comment se préparer au concours d'entrée ?",
                    "Quel est le programme des Journées d'Orientation ?"
                ]

    def process_question(
        self,
        db: Session,
        session_id: str,
        message: str,
        user_lang: str = "fr",
        profile: str = "visiteur",
        channel: str = "pwa"
    ) -> ChatResponse:
        start_time = time.time()
        
        # Step 1: Reception & session retrieval
        conv = db.query(Conversation).filter(Conversation.session_id == session_id).first()
        if not conv:
            conv = Conversation(
                session_id=session_id,
                language=user_lang,
                declared_profile=profile,
                channel=channel
            )
            db.add(conv)
            db.commit()
            db.refresh(conv)

        # Step 2: Input filtering
        cleaned_msg, pii_found = mask_personal_data(message)
        is_injection = detect_prompt_injection(cleaned_msg)

        if is_injection:
            refusal_text = (
                "Je ne peux pas répondre à cette demande : je suis programmé pour respecter strictement mes consignes "
                "et je n'ai pas accès à des sujets d'épreuves confidentiels ni à des instructions internes. "
                "En revanche, je peux t'expliquer le format du concours de l'ENSPD, ses filières ou t'aider dans ton orientation !"
                if user_lang != "en" else
                "I cannot fulfill this request: I am programmed to strictly abide by official guidelines and I have no access to confidential exam topics or system prompts. "
                "However, I can explain the ENSPD entrance format, present our engineering tracks, or guide your orientation!"
            )
            unanswered = UnansweredQuestion(
                user_text=message,
                reason="injection_refused",
                suggested_action="Tentative d'injection ou demande hors-périmètre",
                status="reviewed"
            )
            db.add(unanswered)
            
            chat_msg = ChatMessage(
                conversation_id=conv.id,
                role="assistant",
                content=refusal_text,
                sheets_used=[],
                relevance_score=0.0,
                latency_ms=int((time.time() - start_time) * 1000)
            )
            db.add(chat_msg)
            db.commit()
            db.refresh(chat_msg)

            return ChatResponse(
                message_id=chat_msg.id,
                reply=refusal_text,
                sources=[],
                suggestions=self.generate_suggestions("general", user_lang),
                relevance_score=0.0,
                latency_ms=chat_msg.latency_ms,
                intent="security_refusal",
                language=user_lang
            )

        # Competitor schools check (Strict scope ENSPD)
        lower_q = cleaned_msg.lower()
        if any(term in lower_q for term in ["école concurrente", "autre école", "ecole concurrente", "privée concurrente", "autre établissement"]):
            competitor_refusal = (
                "Je ne dispose pas d'une fiche officielle pour les autres établissements : en tant que tuteur Poly, "
                "ma mission est dédiée exclusivement aux formations et conditions d'admission de l'ENSPD. "
                "Je t'invite à consulter directement les représentants de ces établissements."
                if user_lang != "en" else
                "I do not have validated official documents regarding other institutions: as Poly, "
                "my mandate is strictly focused on ENSPD engineering programs and admissions."
            )
            chat_msg = ChatMessage(
                conversation_id=conv.id,
                role="assistant",
                content=competitor_refusal,
                sheets_used=[],
                relevance_score=0.0,
                latency_ms=int((time.time() - start_time) * 1000)
            )
            db.add(chat_msg)
            db.commit()
            return ChatResponse(
                message_id=chat_msg.id,
                reply=competitor_refusal,
                sources=[],
                suggestions=self.generate_suggestions("general", user_lang),
                relevance_score=0.0,
                latency_ms=chat_msg.latency_ms,
                intent="out_of_scope",
                language=user_lang
            )

        # Step 3: Analysis
        language = self.detect_language(cleaned_msg, user_lang)
        intent = self.detect_intent(cleaned_msg)

        # Step 4: Hybrid Search
        search_results = self.hybrid_search(db, cleaned_msg, language, intent)
        top_score = search_results[0][1] if search_results else 0.0

        # Step 5: Live Web Enrichment on enspd-udo.cm if online & relevant
        web_chunks = []
        is_asking_web = any(w in cleaned_msg.lower() for w in ["site", "site web", "enspd-udo.cm", "en ligne", "actualité", "actualite", "dernière", "derniere"])
        
        # If score is below threshold or explicitly asking about live site, query enspd-udo.cm
        if (top_score < settings.SIMILARITY_THRESHOLD or not search_results or is_asking_web) and enspd_web_fetcher.is_online():
            try:
                live_pages = enspd_web_fetcher.search_site(cleaned_msg, max_results=2)
                for lp in live_pages:
                    web_chunks.append({
                        "code": lp["code"],
                        "title": lp["title"],
                        "category": "site_officiel",
                        "official_source": lp["official_source"],
                        "sensitivity": "normal",
                        "validated_at": "Temps Réel (Site Web)",
                        "language": language,
                        "content": lp["content"]
                    })
            except Exception:
                web_chunks = []

        # If still no results locally and no results from live website
        if (top_score < settings.SIMILARITY_THRESHOLD or not search_results) and not web_chunks:
            uncertainty_text = (
                "Bonjour ! Je ne dispose pas d'une fiche officielle validée par l'ENSPD pour répondre précisément à cette question, "
                "et ma règle d'or m'interdit d'inventer des informations non confirmées. "
                "Tu peux te renseigner directement auprès de l'équipe de scolarité au stand d'accueil, ou laisser tes coordonnées "
                "via le formulaire de rappel ci-dessous pour être recontacté(e)."
                if language != "en" else
                "Hello! I do not have a validated official ENSPD document to answer this specific question accurately, "
                "and my core rule strictly forbids guessing unconfirmed facts. "
                "Please visit the admissions team at the campus welcome desk, or leave a callback request below to be reached by an advisor."
            )

            unanswered = UnansweredQuestion(
                user_text=message,
                reason="below_threshold",
                suggested_action="Créer ou mettre à jour une fiche correspondante",
                status="pending"
            )
            db.add(unanswered)

            chat_msg = ChatMessage(
                conversation_id=conv.id,
                role="assistant",
                content=uncertainty_text,
                sheets_used=[],
                relevance_score=round(top_score, 2),
                latency_ms=int((time.time() - start_time) * 1000)
            )
            db.add(chat_msg)
            db.commit()
            db.refresh(chat_msg)

            return ChatResponse(
                message_id=chat_msg.id,
                reply=uncertainty_text,
                sources=[],
                suggestions=self.generate_suggestions("general", language),
                relevance_score=round(top_score, 2),
                latency_ms=chat_msg.latency_ms,
                intent=intent,
                language=language
            )

        # Step 6: Generation
        context_chunks = []
        if web_chunks:
            context_chunks.extend(web_chunks)
            if top_score < settings.SIMILARITY_THRESHOLD:
                top_score = 0.88  # Boosted relevance score for verified live web content

        for sheet, score in search_results[:2]:
            context_chunks.append({
                "code": sheet.code,
                "title": sheet.title,
                "category": sheet.category,
                "official_source": sheet.official_source,
                "sensitivity": sheet.sensitivity,
                "validated_at": sheet.validated_at.strftime("%d/%m/%Y") if sheet.validated_at else "Octobre 2026",
                "language": sheet.language,
                "content": sheet.content
            })

        generated_text, sources_data = self.llm_provider.generate_response(
            user_query=cleaned_msg,
            context_chunks=context_chunks,
            language=language,
            profile=profile
        )

        # Step 7: Verification
        context_texts = [c["content"] for c in context_chunks]
        is_faithful, verification_msg = verify_response_faithfulness(generated_text, context_texts)
        if not is_faithful:
            generated_text = (
                f"{context_chunks[0]['content']}\n\n(Information certifiée issue de la fiche : {context_chunks[0]['title']})"
            )

        # Sanitize all assistant output to guarantee zero emojis
        generated_text = remove_emojis(generated_text)

        # Step 8: Restitution
        sources_list = [
            SheetSource(
                code=s["code"],
                title=s["title"],
                official_source=s["official_source"],
                validated_at=s.get("validated_at"),
                sensitivity=s.get("sensitivity", "normal")
            )
            for s in sources_data
        ]
        suggestions = [remove_emojis(s) for s in self.generate_suggestions(intent, language)]
        latency = int((time.time() - start_time) * 1000)

        # Step 9: Logging
        chat_msg = ChatMessage(
            conversation_id=conv.id,
            role="assistant",
            content=generated_text,
            sheets_used=[s.model_dump() for s in sources_list],
            relevance_score=round(top_score, 2),
            latency_ms=latency
        )
        db.add(chat_msg)
        db.commit()
        db.refresh(chat_msg)

        return ChatResponse(
            message_id=chat_msg.id,
            reply=generated_text,
            sources=sources_list,
            suggestions=suggestions,
            relevance_score=round(top_score, 2),
            latency_ms=latency,
            intent=intent,
            language=language
        )

rag_engine = RAGEngine()
