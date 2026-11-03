from fastapi import APIRouter
from app.schemas.schemas import OrientationRequest, OrientationResult
from app.rag.orientation_engine import get_orientation_questions, compute_orientation_result

router = APIRouter(prefix="/orientation", tags=["Orientation Personnalisée"])

@router.get("/questions")
def get_questions(language: str = "fr"):
    return {"questions": get_orientation_questions(language)}

@router.post("/evaluate", response_model=OrientationResult)
def evaluate_orientation(req: OrientationRequest):
    return compute_orientation_result(req.answers, req.language)

