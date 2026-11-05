import re
import socket
import logging
from typing import List, Dict, Any, Optional
from html.parser import HTMLParser
import urllib.request
import urllib.error

logger = logging.getLogger(__name__)

ENSPD_BASE_URL = "https://enspd-udo.cm"

class HTMLTextExtractor(HTMLParser):
    """Parseur HTML léger sans dépendance externe pour extraire le texte utile."""
    def __init__(self):
        super().__init__()
        self.text_parts: List[str] = []
        self.in_ignored_tag = False
        self.links: List[Dict[str, str]] = []
        self._current_href = None

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "noscript", "svg", "header", "footer", "nav"):
            self.in_ignored_tag = True
        if tag == "a":
            for k, v in attrs:
                if k == "href":
                    self._current_href = v

    def handle_endtag(self, tag):
        if tag in ("script", "style", "noscript", "svg", "header", "footer", "nav"):
            self.in_ignored_tag = False
        if tag == "a":
            self._current_href = None

    def handle_data(self, data):
        if not self.in_ignored_tag:
            cleaned = data.strip()
            if cleaned and len(cleaned) > 1:
                self.text_parts.append(cleaned)
                if self._current_href:
                    self.links.append({"text": cleaned, "url": self._current_href})

    def get_clean_text(self) -> str:
        raw = " ".join(self.text_parts)
        # Nettoyage des espaces multiples
        cleaned = re.sub(r"\s+", " ", raw)
        return cleaned.strip()


class ENSPDWebFetcher:
    """
    Service d'interrogation en direct du site officiel de l'ENSPD (https://enspd-udo.cm).
    Permet au RAG de récupérer dynamiquement les informations officielles à jour
    lorsque l'utilisateur/serveur est connecté à Internet.
    """

    OFFICIAL_PAGES = [
        {"title": "Accueil & Présentation ENSPD", "url": "https://enspd-udo.cm", "category": "institutionnel"},
        {"title": "Concours & Admissions ENSPD", "url": "https://enspd-udo.cm/concours", "category": "admission"},
        {"title": "Inscription en Ligne Concours", "url": "https://enspd-udo.cm/inscription", "category": "admission"},
        {"title": "Départements & Filières d'Ingénieurs", "url": "https://enspd-udo.cm/departements", "category": "filiere"},
        {"title": "Structure & Direction ENSPD", "url": "https://enspd-udo.cm/a-propos", "category": "gouvernance"},
    ]

    def __init__(self, timeout: float = 6.0):
        self.timeout = timeout
        self.user_agent = (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36 PolyRAGBot/2.0 (+https://enspd-udo.cm)"
        )

    def is_online(self) -> bool:
        """Vérifie rapidement si la machine dispose d'un accès Internet."""
        try:
            # Vérification DNS rapide vers les serveurs publics
            socket.setdefaulttimeout(2.0)
            socket.gethostbyname("enspd-udo.cm")
            return True
        except Exception:
            try:
                socket.gethostbyname("8.8.8.8")
                return True
            except Exception:
                return False

    def is_site_reachable(self) -> bool:
        """Vérifie si le site officiel enspd-udo.cm répond avec succès."""
        if not self.is_online():
            return False
        try:
            req = urllib.request.Request(
                ENSPD_BASE_URL,
                headers={"User-Agent": self.user_agent},
                method="HEAD"
            )
            with urllib.request.urlopen(req, timeout=self.timeout) as res:
                return res.status in (200, 301, 302)
        except Exception as e:
            logger.warning(f"Site ENSPD non joignable : {e}")
            return False

    def fetch_page_content(self, url: str) -> Optional[Dict[str, Any]]:
        """Télécharge et extrait le texte utile d'une page du site enspd-udo.cm."""
        if not self.is_online():
            return None

        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": self.user_agent}
            )
            with urllib.request.urlopen(req, timeout=self.timeout) as res:
                if res.status != 200:
                    return None
                html = res.read().decode("utf-8", errors="ignore")
                parser = HTMLTextExtractor()
                parser.feed(html)
                clean_text = parser.get_clean_text()
                
                # Détection sommaire du titre de la page
                title_match = re.search(r"<title>(.*?)</title>", html, re.IGNORECASE)
                page_title = title_match.group(1).strip() if title_match else url

                return {
                    "url": url,
                    "title": page_title,
                    "content": clean_text,
                    "length": len(clean_text)
                }
        except Exception as e:
            logger.error(f"Erreur de récupération web pour {url} : {e}")
            return None

    def search_site(self, query: str, max_results: int = 2) -> List[Dict[str, Any]]:
        """
        Recherche en direct sur le site officiel de l'ENSPD selon les mots-clés de la requête.
        Retourne des extraits pertinents calibrés pour le moteur RAG.
        """
        if not self.is_online():
            return []

        query_lower = query.lower()
        scored_pages = []

        # Cibler en priorité les pages les plus pertinentes selon l'intention
        target_pages = list(self.OFFICIAL_PAGES)
        if any(w in query_lower for w in ["concours", "admission", "inscription", "dossier", "date"]):
            target_pages.sort(key=lambda p: 0 if "concours" in p["url"] or "inscription" in p["url"] else 1)
        elif any(w in query_lower for w in ["filière", "filiere", "département", "departement", "formation"]):
            target_pages.sort(key=lambda p: 0 if "departement" in p["url"] else 1)
        elif any(w in query_lower for w in ["directeur", "recteur", "direction", "mouangue", "ondoa"]):
            target_pages.sort(key=lambda p: 0 if "a-propos" in p["url"] or p["url"] == ENSPD_BASE_URL else 1)

        # Interroger les pages sélectionnées
        query_terms = [t for t in re.sub(r"[^\w\s]", " ", query_lower).split() if len(t) > 2]

        for p_info in target_pages[:3]:
            page_data = self.fetch_page_content(p_info["url"])
            if not page_data or not page_data["content"]:
                continue

            content = page_data["content"]
            content_lower = content.lower()

            # Calculer la pertinence
            score = sum(content_lower.count(term) for term in query_terms)
            if score > 0 or not query_terms:
                # Découper en extrait pertinent autour des termes trouvés
                snippet = self._extract_relevant_snippet(content, query_terms)
                scored_pages.append({
                    "code": f"WEB-{len(scored_pages)+1:02d}",
                    "title": p_info["title"],
                    "official_source": f"Site Officiel ENSPD ({p_info['url']})",
                    "url": p_info["url"],
                    "content": snippet,
                    "score": score,
                    "live": True
                })

        scored_pages.sort(key=lambda x: x["score"], reverse=True)
        return scored_pages[:max_results]

    def _extract_relevant_snippet(self, text: str, terms: List[str], max_len: int = 500) -> str:
        """Extrait un paragraphe représentatif centré sur les mots clés de la question."""
        if not terms or len(text) <= max_len:
            return text[:max_len]

        best_pos = -1
        for term in terms:
            pos = text.lower().find(term)
            if pos != -1:
                best_pos = pos
                break

        if best_pos == -1:
            return text[:max_len]

        start = max(0, best_pos - 100)
        end = min(len(text), start + max_len)
        snippet = text[start:end].strip()
        if start > 0:
            snippet = "..." + snippet
        if end < len(text):
            snippet = snippet + "..."
        return snippet


enspd_web_fetcher = ENSPDWebFetcher()
