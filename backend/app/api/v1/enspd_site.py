import time
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import KnowledgeSheet
from app.core.security import require_roles
from app.services.enspd_web_fetcher import enspd_web_fetcher

router = APIRouter(prefix="/enspd-site", tags=["Site Officiel ENSPD (enspd-udo.cm)"])


class SiteStatusResponse(BaseModel):
    online: bool
    site_reachable: bool
    site_url: str
    checked_at: str
    message: str


class LiveSearchRequest(BaseModel):
    query: str
    language: Optional[str] = "fr"
    max_results: Optional[int] = 3


class LiveSearchItem(BaseModel):
    code: str
    title: str
    official_source: str
    url: str
    content: str
    score: int
    live: bool


class LiveSearchResponse(BaseModel):
    query: str
    online: bool
    count: int
    results: List[LiveSearchItem]


class SyncResponse(BaseModel):
    status: str
    synced_sheets_count: int
    pages_synced: List[str]
    timestamp: str


@router.get("/status", response_model=SiteStatusResponse)
def get_enspd_site_status():
    """
    Vérifie en temps réel si l'utilisateur / serveur est connecté à Internet
    et si le site officiel de l'ENSPD (https://enspd-udo.cm) est accessible pour le RAG.
    """
    online = enspd_web_fetcher.is_online()
    reachable = enspd_web_fetcher.is_site_reachable() if online else False
    
    msg = (
        "Connexion active au site officiel de l'ENSPD (enspd-udo.cm). Le RAG peut enrichir ses réponses en temps réel."
        if reachable else
        ("Internet connecté mais le portail enspd-udo.cm est momentanément lent." if online else "Mode hors-ligne : utilisation de la base locale certifiée.")
    )

    return SiteStatusResponse(
        online=online,
        site_reachable=reachable,
        site_url="https://enspd-udo.cm",
        checked_at=datetime.now(timezone.utc).isoformat(),
        message=msg
    )


@router.post("/live-search", response_model=LiveSearchResponse)
def live_search_enspd_site(req: LiveSearchRequest):
    """
    Effectue une interrogation en direct du site officiel enspd-udo.cm
    pour alimenter le RAG avec les données officielles du web.
    """
    if not enspd_web_fetcher.is_online():
        return LiveSearchResponse(
            query=req.query,
            online=False,
            count=0,
            results=[]
        )

    results = enspd_web_fetcher.search_site(req.query, max_results=req.max_results or 2)
    return LiveSearchResponse(
        query=req.query,
        online=True,
        count=len(results),
        results=[LiveSearchItem(**r) for r in results]
    )


@router.post("/sync", response_model=SyncResponse)
def sync_enspd_site_to_kb(
    payload: dict = Depends(require_roles(["admin", "contributeur"])),
    db: Session = Depends(get_db)
):
    """
    Crawle les sections clés du site officiel https://enspd-udo.cm
    et synchronise ou met à jour les fiches de connaissances certifiées dans la base de données.
    """
    if not enspd_web_fetcher.is_online():
        raise HTTPException(
            status_code=503,
            detail="Impossible de synchroniser : serveur hors-ligne ou portail enspd-udo.cm inaccessible."
        )

    synced_pages = []
    created_or_updated = 0

    for idx, page in enumerate(enspd_web_fetcher.OFFICIAL_PAGES):
        content_data = enspd_web_fetcher.fetch_page_content(page["url"])
        if not content_data or not content_data["content"]:
            continue

        sheet_code = f"WEB-ENSPD-{idx+1:02d}"
        existing = db.query(KnowledgeSheet).filter(KnowledgeSheet.code == sheet_code).first()
        
        summary_content = (
            f"{page['title']} (Source officielle : {page['url']}). "
            f"Extrait certifié du site officiel de l'ENSPD : {content_data['content'][:900]}..."
        )

        if existing:
            existing.title = f"{page['title']} [Site Officiel]"
            existing.content = summary_content
            existing.official_source = f"Site Officiel ENSPD - {page['url']}"
            existing.status = "validated"
            existing.category = page["category"]
            existing.validated_at = datetime.now(timezone.utc)
        else:
            new_sheet = KnowledgeSheet(
                code=sheet_code,
                title=f"{page['title']} [Site Officiel]",
                category=page["category"],
                content=summary_content,
                official_source=f"Site Officiel ENSPD - {page['url']}",
                status="validated",
                sensitivity="normal",
                language="fr",
                validated_at=datetime.now(timezone.utc)
            )
            db.add(new_sheet)
        
        synced_pages.append(page["title"])
        created_or_updated += 1

    db.commit()

    return SyncResponse(
        status="success",
        synced_sheets_count=created_or_updated,
        pages_synced=synced_pages,
        timestamp=datetime.now(timezone.utc).isoformat()
    )
