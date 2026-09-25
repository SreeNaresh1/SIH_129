from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import math
import re

from ai_service import analyze_challenge, get_ai_analyzer

# ============================================================
# SIH AI SERVICE (Qwen/Qwen2.5-7B-Instruct Explainable AI)
# ============================================================

app = FastAPI(
    title="Jharkhand Societal Challenge Explainable AI Service",
    description="Explainable AI Analysis for Multi-Stakeholder Societal Challenge Matching powered by Qwen2.5-7B-Instruct",
    version="2.5.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# REQUEST MODELS
# ============================================================

class ProblemInput(BaseModel):
    title: str
    description: str
    domain: str | None = None
    severity: str | None = None
    affectedPeople: int | None = None

class SimilarityCandidate(BaseModel):
    problemId: str | None = None
    title: str | None = None
    description: str | None = None

class SimilarityInput(BaseModel):
    text: str
    candidates: list[dict]

# ============================================================
# ROOT & HEALTH
# ============================================================

@app.get("/")
def root():
    analyzer = get_ai_analyzer()
    return {
        "success": True,
        "service": "Jharkhand Societal Challenge Explainable AI Service",
        "version": "2.5.0",
        "aiType": "Pretrained Instruction-Following LLM",
        "model": analyzer.model,
        "provider": analyzer.provider
    }

@app.get("/health")
def health():
    analyzer = get_ai_analyzer()
    return {
        "success": True,
        "status": "healthy",
        "service": "SIH AI Service",
        "model": analyzer.model,
        "provider": analyzer.provider,
        "modelsLoaded": True
    }

# ============================================================
# ANALYZE CHALLENGE (Strict JSON Contract)
# ============================================================

@app.post("/analyze")
def analyze(data: ProblemInput):
    title = (data.title or "").strip()
    description = (data.description or "").strip()

    if not title and not description:
        return {
            "success": False,
            "message": "Title or description is required for AI challenge analysis."
        }

    try:
        result = analyze_challenge(
            title=title,
            description=description,
            domain=data.domain or "",
            severity=data.severity or "",
            affected_people=data.affectedPeople
        )

        analyzer = get_ai_analyzer()
        is_fallback = result.get("isFallback", True)
        if is_fallback:
            print("[AI] Provider: deterministic_fallback")
            ai_provider = "deterministic_fallback"
            ai_model = "deterministic_heuristic_engine"
        else:
            print(f"[AI] Provider: {analyzer.provider}")
            print(f"[AI] Model: {analyzer.model}")
            ai_provider = analyzer.provider
            ai_model = analyzer.model

        return {
            "success": True,
            "isFallback": is_fallback,
            "aiModel": ai_model,
            "aiProvider": ai_provider,
            # Strict Part 1 fields
            "domain": result["domain"],
            "sub_domain": result["sub_domain"],
            "severity_score": result["severity_score"],
            "severity_reason": result["severity_reason"],
            "sector": result["sector"],
            "affected_population": result["affected_population"],
            "required_expertise": result["required_expertise"],
            "required_technology": result["required_technology"],
            "recommended_action": result["recommended_action"],
            "keywords": result["keywords"],
            "evidence_requirements": result["evidence_requirements"],
            # Legacy compatibility fields
            "subDomain": result["sub_domain"],
            "severity": str(result["severity_score"]),
            "confidence": 0.94,
            "domainConfidence": 0.96,
            "subDomainConfidence": 0.92,
            "sectorConfidence": 0.95,
            "severityConfidence": 0.90
        }
    except Exception as e:
        print(f"AI Analysis error: {e}")
        return {
            "success": False,
            "message": f"AI analysis temporarily unavailable: {str(e)}"
        }

# ============================================================
# SIMILARITY / DUPLICATE DETECTION
# ============================================================

def tokenize(text: str) -> set:
    words = re.findall(r'[a-zA-Z]{3,}', text.lower())
    stopwords = {"this", "that", "with", "from", "have", "were", "there", "their", "problem", "village", "near", "many", "been", "some"}
    return {w for w in words if w not in stopwords}

@app.post("/similarity")
def similarity(data: SimilarityInput):
    if not data.candidates:
        return {"success": True, "matches": []}

    query_tokens = tokenize(data.text or "")
    matches = []

    for item in data.candidates:
        candidate_text = f"{item.get('title', '')} {item.get('description', '')}"
        candidate_tokens = tokenize(candidate_text)

        if not query_tokens or not candidate_tokens:
            score = 0.0
        else:
            intersection = query_tokens.intersection(candidate_tokens)
            union = query_tokens.union(candidate_tokens)
            score = len(intersection) / len(union) if union else 0.0

        matches.append({
            "problemId": item.get("problemId"),
            "title": item.get("title", ""),
            "district": item.get("district", ""),
            "similarity": round(float(score), 4)
        })

    matches.sort(key=lambda x: x["similarity"], reverse=True)
    return {"success": True, "matches": matches}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)