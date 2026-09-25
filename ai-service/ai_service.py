"""
Jharkhand Societal Challenge Platform - Explainable AI Service
Pretrained Instruction-Following LLM Service (Qwen/Qwen2.5-7B-Instruct)

This module implements a modular adapter for Qwen2.5-7B-Instruct.
No model training or fine-tuning is required.
Supported AI Providers:
- local_qwen: Local Ollama / vLLM / OpenAI-compatible endpoint (e.g. http://localhost:11434/v1)
- hosted_qwen: Hosted Qwen2.5 endpoint (HuggingFace Inference API / OpenRouter / Groq / OpenAI-compatible)
- heuristic_fallback: Reliable deterministic analysis fallback if LLM is unreachable, preventing application crashes.
"""

import os
import json
import re
import urllib.request
import urllib.error

# Allowed domains strictly as per requirements
ALLOWED_DOMAINS = [
    "Education",
    "Healthcare",
    "Agriculture",
    "Water Management",
    "Sanitation",
    "Environment",
    "Infrastructure",
    "Rural Livelihood",
    "Accessibility",
    "Public Services"
]

SYSTEM_PROMPT = """You are an expert Societal Challenge Classifier and Problem Understanding Engine for Jharkhand State.
Your task is to analyze the citizen challenge and produce a structured, explainable challenge profile in STRICT JSON.

RULES:
1. Return VALID JSON ONLY. Do NOT include markdown code blocks, backticks, or introductory text.
2. Allowed main domains strictly one of:
   - Education
   - Healthcare
   - Agriculture
   - Water Management
   - Sanitation
   - Environment
   - Infrastructure
   - Rural Livelihood
   - Accessibility
   - Public Services
3. severity_score MUST be an integer between 1 and 10 representing "AI-assessed severity" (not an objectively measured clinical severity).
4. severity_reason must explain why this severity score was assessed based on population impact, urgency, and hazard.
5. sector MUST be an array of relevant stakeholders chosen from ["Government", "University", "Industry", "NGO"].
6. Do NOT invent specific universities, companies, government departments, or factual statistics.
7. Extract information only from the submitted challenge text where possible. If information is unavailable, use null or an empty array.
8. Distinguish inferred information from directly provided information.

Required JSON Structure:
{
  "domain": "<One of the 10 allowed domains>",
  "sub_domain": "<Specific sub-domain, e.g. Water Quality, Primary Healthcare, Micro-Irrigation, etc.>",
  "severity_score": <1-10 integer>,
  "severity_reason": "<Concise explanation of AI-assessed severity>",
  "sector": ["<Stakeholder sectors from Government, University, Industry, NGO>"],
  "affected_population": "<Directly mentioned or estimated affected population, e.g. Multiple villages, 500 residents>",
  "required_expertise": ["<Specific expertise areas required to solve this>"],
  "required_technology": ["<Tools, sensors, or engineering technologies required>"],
  "recommended_action": "<Concrete recommended initial next action>",
  "keywords": ["<3-6 key terms extracted from the challenge>"],
  "evidence_requirements": ["<Types of supporting evidence that would help verify this issue>"]
}
"""

def clean_json_text(text: str) -> str:
    """Strip markdown code fences and whitespace from model output."""
    if not text:
        return ""
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()

def validate_and_normalize_ai_output(data: dict, raw_text: str = "") -> dict:
    """Ensure output strictly adheres to the platform contract."""
    # Ensure domain is valid
    domain = str(data.get("domain", "")).strip()
    matched_domain = None
    for d in ALLOWED_DOMAINS:
        if d.lower() == domain.lower():
            matched_domain = d
            break
        elif d.lower() in domain.lower() or domain.lower() in d.lower():
            matched_domain = d
            break
    if not matched_domain:
        matched_domain = "Public Services"

    # Severity score 1-10
    try:
        score = int(data.get("severity_score", 5))
        score = max(1, min(10, score))
    except (ValueError, TypeError):
        score = 5

    # Sector array
    valid_sectors = ["Government", "University", "Industry", "NGO"]
    raw_sectors = data.get("sector") or []
    if isinstance(raw_sectors, str):
        raw_sectors = [s.strip() for s in raw_sectors.split(",")]
    sectors = [s for s in raw_sectors if s in valid_sectors]
    if not sectors:
        sectors = ["Government", "University"]

    return {
        "domain": matched_domain,
        "sub_domain": str(data.get("sub_domain") or "General Issue").strip(),
        "severity_score": score,
        "severity_reason": str(data.get("severity_reason") or "Assessed based on reported societal impact and urgency.").strip(),
        "sector": sectors,
        "affected_population": str(data.get("affected_population") or "Local community").strip(),
        "required_expertise": [str(e).strip() for e in (data.get("required_expertise") or []) if str(e).strip()],
        "required_technology": [str(t).strip() for t in (data.get("required_technology") or []) if str(t).strip()],
        "recommended_action": str(data.get("recommended_action") or "Field inspection and multi-stakeholder assessment.").strip(),
        "keywords": [str(k).strip() for k in (data.get("keywords") or []) if str(k).strip()],
        "evidence_requirements": [str(ev).strip() for ev in (data.get("evidence_requirements") or []) if str(ev).strip()]
    }

def heuristic_analysis(title: str, description: str, domain_hint: str = "", severity_hint: str = "", affected_people: int = None) -> dict:
    """
    High-precision deterministic rule & NLP engine.
    Used when external Qwen endpoint is offline or unavailable.
    Guarantees that the prototype never crashes and always returns valid structured JSON.
    """
    text = f"{title} {description} {domain_hint}".lower()

    # Domain classification
    domain = "Public Services"
    sub_domain = "General Public Grievance"
    expertise = ["Public Administration", "Community Outreach"]
    technology = ["Digital Grievance Portal"]
    recommended_action = "Conduct on-site verification and stakeholder consultation"
    evidence_req = ["Photographic evidence", "Location coordinates", "Citizen signature / statement"]
    sectors = ["Government", "University"]
    severity_score = 5
    severity_reason = "Community issue requiring routine administrative attention"

    if any(w in text for w in ["water", "drinking", "hand pump", "well", "arsenic", "fluoride", "contamination", "pipeline", "tap", "boring", "groundwater"]):
        domain = "Water Management"
        if any(w in text for w in ["contaminat", "toxic", "poison", "arsenic", "fluoride", "dirty", "yellow", "stink", "smell", "sick", "diarrhea", "cholera"]):
            sub_domain = "Water Quality & Contamination"
            severity_score = 8
            severity_reason = "Potential public-health hazard from contaminated drinking water affecting residents"
            expertise = ["Water Quality Testing", "Civil & Environmental Engineering", "Hydro-geology"]
            technology = ["Water Quality Sensors", "IoT Flow Meters", "Membrane / Sand Filtration Units"]
            recommended_action = "Collect water samples for lab chemical/microbial testing and deploy emergency clean water supply"
            evidence_req = ["Water laboratory test report", "Photographs of hand pump / water source", "Geotagged location evidence"]
            sectors = ["Government", "University", "Industry", "NGO"]
        else:
            sub_domain = "Drinking Water Supply & Infrastructure"
            severity_score = 7
            severity_reason = "Disruption of essential drinking water supply to local community"
            expertise = ["Civil Engineering", "Pumping Systems", "Hydraulics"]
            technology = ["Solar Water Pumps", "Pipeline Leakage Detectors"]
            recommended_action = "Repair non-functional hand pumps and restore piped water pressure"
            evidence_req = ["Photographs of broken pump/pipeline", "Location coordinates"]
            sectors = ["Government", "University", "Industry"]

    elif any(w in text for w in ["health", "hospital", "doctor", "clinic", "phc", "medicine", "malaria", "dengue", "fever", "illness", "ambulance", "patient", "nurse"]):
        domain = "Healthcare"
        sub_domain = "Primary Healthcare & Epidemic Prevention"
        severity_score = 8
        severity_reason = "Direct public health concern impacting rural community well-being and access to essential medical care"
        expertise = ["Community Medicine", "Epidemiology", "Telemedicine Systems", "Biomedical Instrumentation"]
        technology = ["Tele-Diagnostic Kits", "Mobile Health Diagnostics", "Solar Vaccine Coolers"]
        recommended_action = "Dispatch mobile medical team and establish rural telemedicine link with district hospital"
        evidence_req = ["Clinic attendance records / prescription slips", "Photographs of health facility", "District health reports"]
        sectors = ["Government", "University", "Industry", "NGO"]

    elif any(w in text for w in ["crop", "farm", "farmer", "irrigation", "drought", "harvest", "seed", "pesticide", "fertilizer", "soil", "agriculture", "paddy"]):
        domain = "Agriculture"
        sub_domain = "Irrigation Deficit & Crop Protection"
        severity_score = 7
        severity_reason = "Threat to agricultural livelihood and harvest yields of local smallholders"
        expertise = ["Agricultural Engineering", "Soil Science", "Agronomy", "Micro-Irrigation"]
        technology = ["Solar Lift Irrigation", "Drip Irrigation Kits", "Soil Moisture Sensors"]
        recommended_action = "Assess watershed recharge options and deploy subsidized solar micro-irrigation units"
        evidence_req = ["Photographs of parched / affected crops", "Soil and canal condition photos", "Landholding details"]
        sectors = ["Government", "University", "Industry", "NGO"]

    elif any(w in text for w in ["waste", "garbage", "trash", "dump", "sewage", "drain", "latrine", "toilet", "stagnant", "sanitation"]):
        domain = "Sanitation"
        sub_domain = "Solid Waste & Drainage Sanitation"
        severity_score = 6
        severity_reason = "Sanitation risk from accumulated waste and overflowing open drains creating vector-breeding conditions"
        expertise = ["Environmental Engineering", "Waste Management", "Public Health Sanitation"]
        technology = ["Bio-Composting Units", "Waste Compactors", "Covered Drainage Modules"]
        recommended_action = "Clear drain blockages and establish organized decentralized community waste collection"
        evidence_req = ["Photographs of overflowing dump / blocked drains", "Location markers"]
        sectors = ["Government", "University", "Industry", "NGO"]

    elif any(w in text for w in ["road", "bridge", "pothole", "connectivity", "highway", "culvert", "transport", "nalla", "crossing", "bus"]):
        domain = "Infrastructure"
        sub_domain = "Rural Road & Bridge Connectivity"
        severity_score = 7
        severity_reason = "Transportation hazard and disruption of essential connectivity for school children and patients"
        expertise = ["Civil Engineering", "Structural Engineering", "Highway Materials Engineering"]
        technology = ["Pre-Cast Concrete Culverts", "Cold Mix Asphalt", "Pothole Detection Sensors"]
        recommended_action = "Execute emergency culvert repairs and initiate all-weather road metalling"
        evidence_req = ["Photographs of road breach / damaged culvert", "Measurement of damaged section", "GPS coordinates"]
        sectors = ["Government", "University", "Industry"]

    elif any(w in text for w in ["pollution", "smoke", "factory", "emission", "effluent", "chemical", "dust", "mining", "forest", "tree", "river", "environment"]):
        domain = "Environment"
        sub_domain = "Industrial Pollution & Environmental Degradation"
        severity_score = 8
        severity_reason = "Environmental and ecological degradation affecting resident health and soil quality"
        expertise = ["Environmental Science", "Chemical Engineering", "Air/Water Quality Monitoring"]
        technology = ["Continuous Ambient Air Monitoring (CAAQMS)", "Industrial Effluent Scrubbers", "Heavy Metal Sensors"]
        recommended_action = "Conduct statutory environmental audit and inspect emission scrubbing systems"
        evidence_req = ["Photographs of emission plumes or discharge into river", "Water/soil sample tests", "Plant operational records"]
        sectors = ["Government", "University", "Industry", "NGO"]

    elif any(w in text for w in ["school", "education", "teacher", "student", "classroom", "books", "blackboard", "college", "literacy", "learning"]):
        domain = "Education"
        sub_domain = "School Infrastructure & Learning Resources"
        severity_score = 6
        severity_reason = "Impairment of educational delivery and safety for enrolled children"
        expertise = ["Educational Technology", "Civil Architecture", "Curriculum Development"]
        technology = ["Solar-Powered Digital Classroom Kits", "Offline Educational Tablets"]
        recommended_action = "Repair damaged school building and equip students with solar digital learning modules"
        evidence_req = ["Photographs of school classrooms / facilities", "Enrollment statistics"]
        sectors = ["Government", "University", "Industry", "NGO"]

    elif any(w in text for w in ["wheelchair", "disab", "divyang", "blind", "deaf", "ramp", "barrier", "accessib", "handicap", "tactile"]):
        domain = "Accessibility"
        sub_domain = "Universal Barrier-Free Accessibility"
        severity_score = 7
        severity_reason = "Exclusion of persons with disabilities from accessing essential public facilities and government services"
        expertise = ["Universal Architectural Design", "Assistive Technology", "Biomedical Engineering"]
        technology = ["Standardized Non-Slip Modular Ramps", "Tactile Ground Surface Indicators", "Audio-Assisted Signage"]
        recommended_action = "Retrofit government building with standard ramps, accessible doorways, and braille indicators"
        evidence_req = ["Photographs of stairs / barriers without ramps", "Building layout and accessibility audit"]
        sectors = ["Government", "University", "Industry", "NGO"]

    elif any(w in text for w in ["livelihood", "shg", "handicraft", "migration", "unemploy", "forest produce", "lac", "tassar", "silk", "tribal artisan"]):
        domain = "Rural Livelihood"
        sub_domain = "Tribal Artisan & Rural Enterprise Support"
        severity_score = 6
        severity_reason = "Income instability and lack of value-chain market access for rural producers"
        expertise = ["Rural Entrepreneurship", "Supply Chain Management", "Food Processing & Packaging"]
        technology = ["Solar Dryers", "Digital Produce Aggregation Platform", "Quality Testing Meters"]
        recommended_action = "Establish self-help group processing center and link with formal e-commerce / state emporiums"
        evidence_req = ["Sample product photographs", "Artisan group registry", "Income baseline data"]
        sectors = ["Government", "University", "Industry", "NGO"]

    # Adjust severity if affected_people is large
    if affected_people and affected_people > 500:
        severity_score = min(10, severity_score + 1)
        severity_reason += f" Affected population is large ({affected_people} individuals)."

    # Extract keywords
    words = re.findall(r'[a-zA-Z]{4,}', text)
    stopwords = {"this", "that", "with", "from", "have", "were", "there", "their", "problem", "village", "facing", "several", "people", "resident"}
    keywords = [w for w in words if w not in stopwords][:5]
    if not keywords:
        keywords = [sub_domain.lower(), domain.lower()]

    pop = f"{affected_people} residents" if affected_people else "Multiple villages / local community"

    return {
        "domain": domain,
        "sub_domain": sub_domain,
        "severity_score": severity_score,
        "severity_reason": severity_reason,
        "sector": sectors,
        "affected_population": pop,
        "required_expertise": expertise,
        "required_technology": technology,
        "recommended_action": recommended_action,
        "keywords": keywords,
        "evidence_requirements": evidence_req
    }

class QwenAIAnalyzer:
    """Modular AI client supporting local_qwen and hosted_qwen endpoints."""
    def __init__(self):
        self.provider = os.environ.get("AI_PROVIDER", "local_qwen").lower()
        self.model = os.environ.get("AI_MODEL", "Qwen/Qwen2.5-7B-Instruct")
        self.api_key = os.environ.get("AI_API_KEY", "")
        self.base_url = os.environ.get("AI_API_BASE_URL", "").rstrip("/")

        # Set default base URL if local_qwen
        if self.provider == "local_qwen" and not self.base_url:
            self.base_url = "http://localhost:11434/v1"

    def analyze(self, title: str, description: str, domain: str = "", severity: str = "", affected_people: int = None) -> dict:
        user_message = f"""CITIZEN CHALLENGE TO ANALYZE:
Title: {title}
Description: {description}
Reported Domain: {domain or 'Unspecified'}
Reported Severity: {severity or 'Unspecified'}
Reported Affected Population: {affected_people or 'Unspecified'}

Produce strict JSON adhering to instructions."""

        # Try LLM inference first if endpoint or key is configured
        if self.base_url:
            try:
                headers = {"Content-Type": "application/json"}
                if self.api_key:
                    headers["Authorization"] = f"Bearer {self.api_key}"

                payload = {
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": user_message}
                    ],
                    "temperature": 0.2,
                    "response_format": {"type": "json_object"}
                }

                req = urllib.request.Request(
                    f"{self.base_url}/chat/completions",
                    data=json.dumps(payload).encode("utf-8"),
                    headers=headers,
                    method="POST"
                )

                with urllib.request.urlopen(req, timeout=12) as response:
                    res_body = response.read().decode("utf-8")
                    res_json = json.loads(res_body)
                    res = validate_and_normalize_ai_output(parsed, raw_content)
                    res["isFallback"] = False
                    res["aiProvider"] = self.provider
                    res["aiModel"] = self.model
                    return res

            except Exception as e:
                print(f"[QwenAIAnalyzer] LLM request to {self.base_url} encountered: {e}. Utilizing deterministic societal intelligence engine fallback.")

        # If LLM endpoint is not running or timed out, use intelligent domain heuristic analyzer
        fallback_res = heuristic_analysis(title, description, domain, severity, affected_people)
        res = validate_and_normalize_ai_output(fallback_res)
        res["isFallback"] = True
        res["aiProvider"] = "deterministic_fallback"
        res["aiModel"] = "deterministic_heuristic_engine"
        return res

# Global singleton
_analyzer = None

def get_ai_analyzer() -> QwenAIAnalyzer:
    global _analyzer
    if _analyzer is None:
        _analyzer = QwenAIAnalyzer()
    return _analyzer

def analyze_challenge(title: str, description: str, domain: str = "", severity: str = "", affected_people: int = None) -> dict:
    analyzer = get_ai_analyzer()
    return analyzer.analyze(title, description, domain, severity, affected_people)
