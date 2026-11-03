import re
from typing import Tuple, List

# Patterns targeting prompt injection and jailbreaks
INJECTION_PATTERNS = [
    r"ignore\s+(?:all\s+)?(?:previous\s+|prior\s+|above\s+)?instructions",
    r"oublie\s+(?:toutes\s+)?(?:les\s+)?(?:consignes|instructions)",
    r"system\s*prompt",
    r"consigne\s*syst[eè]me",
    r"mode\s+dan\b",
    r"jailbreak",
    r"act\s+as\s+(?:an?\s+)?unfiltered",
    r"agis\s+comme\s+un\s+mod[eè]le\s+sans\s+filtre",
    r"rév[eè]le\s+(?:tes|les)\s+instructions",
    r"reveal\s+your\s+instructions",
    r"dis-moi\s+ce\s+qu['']il\s+y\s+a\s+dans\s+ton\s+prompt",
    r"tu\s+es\s+maintenant\s+libre",
    r"you\s+are\s+now\s+free",
    r"bypass\s+security",
    r"sujets?\s+du\s+concours",
    r"exam\s+solutions",
]

# Sensitive personal data regex (Phone numbers, emails)
EMAIL_PATTERN = r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"
PHONE_PATTERN = r"(?:\+?237\s*)?[26]\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}"

# Linear-time non-backtracking money regex
MONEY_PATTERN = r"\b\d+(?:[\s_]\d+)*\s*(?:fcfa|f\s*cfa|francs?)\b"

def detect_prompt_injection(text: str) -> bool:
    """Returns True if malicious or injection attempt detected."""
    normalized = text.lower()
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, normalized, re.IGNORECASE):
            return True
    return False

def mask_personal_data(text: str) -> Tuple[str, bool]:
    """Masks emails and phone numbers for visitor privacy minimization (ENF-08)."""
    masked = text
    found = False
    
    if re.search(EMAIL_PATTERN, masked):
        masked = re.sub(EMAIL_PATTERN, "[EMAIL_MASQUÉ]", masked)
        found = True
        
    if re.search(PHONE_PATTERN, masked):
        masked = re.sub(PHONE_PATTERN, "[NUMÉRO_MASQUÉ]", masked)
        found = True
        
    return masked, found

def verify_response_faithfulness(generated_text: str, context_chunks: List[str]) -> Tuple[bool, str]:
    """
    Step 7 Verification:
    Checks if numbers, dates, or currency figures mentioned in the generated answer
    are grounded in the retrieved knowledge chunks.
    """
    if not context_chunks:
        return True, "No context chunks to verify against"
        
    combined_context = " ".join(context_chunks).lower()
    
    # Extract years (e.g. 2024, 2025, 2026, 2027)
    years_in_resp = set(re.findall(r"\b202[0-9]\b", generated_text))
    for year in years_in_resp:
        if year not in combined_context:
            return False, f"Année non sourcée détectée : {year}"
            
    # Extract monetary figures
    money_in_resp = re.findall(MONEY_PATTERN, generated_text, re.IGNORECASE)
    for m in money_in_resp:
        digits_only = re.sub(r"\D", "", m)
        context_digits = re.sub(r"\D", "", combined_context)
        if digits_only and digits_only not in context_digits:
            return False, f"Montant non sourcé détecté : {m}"
            
    return True, "Faithfulness verified"
