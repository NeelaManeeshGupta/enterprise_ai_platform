import re

def plan_and_route(question: str, chunks: list):
    """
    Planner Agent: Analyzes the question intent, document context, and selects
    the specialized tool and strategy, calculating evidence confidence score.
    """
    q_lower = question.lower()
    
    # 1. Intent Detection Rules
    is_numerical = any(word in q_lower for word in [
        "revenue", "financial", "amount", "cost", "price", "metric", "trend", 
        "total", "increase", "decrease", "compare", "growth", "rs.", "$", "%", "quarter", "q1", "q2", "q3", "q4"
    ])
    
    is_security_compliance = any(word in q_lower for word in [
        "security", "tls", "ssl", "compliance", "vulnerability", "policy", 
        "attack", "cookie", "xss", "auth", "permission", "control", "audit"
    ])
    
    is_resume_hr = any(word in q_lower for word in [
        "resume", "skills", "experience", "education", "candidate", "cgpa", 
        "profile", "qualification", "maneesh", "project", "github", "linkedin"
    ])

    is_summary = any(word in q_lower for word in [
        "summarize", "summary", "overview", "main points", "key findings", "explain"
    ])

    # 2. Select Specialized Agent Tool & Strategy
    if is_numerical:
        intent = "table_numerical_analysis"
        tool_selected = "Tabular & Quantitative Financial Analyzer"
        reasoning = "Detected numerical/financial inquiry. Routing to Quantitative Data Analyzer for table & metric calculation."
    elif is_security_compliance:
        intent = "policy_security_compliance"
        tool_selected = "Compliance & Security Control Verifier"
        reasoning = "Detected security/governance inquiry. Routing to Security Policy Verifier for vulnerability & protocol checks."
    elif is_resume_hr:
        intent = "resume_skills_profile"
        tool_selected = "HR & Talent Intelligence Analyzer"
        reasoning = "Detected candidate/HR inquiry. Routing to Talent Analyzer for skills & experience mapping."
    elif is_summary:
        intent = "document_summary"
        tool_selected = "Multi-Chunk Document Synthesizer"
        reasoning = "Detected broad summary request. Routing to Sequential Multi-Chunk Synthesizer."
    else:
        intent = "general_rag"
        tool_selected = "FAISS Vector Knowledge Search"
        reasoning = "Standard semantic query. Routing to FAISS Dense Retriever."

    # 3. Calculate Evidence Confidence Score
    chunk_count = len(chunks)
    if chunk_count >= 3:
        confidence = 96
    elif chunk_count == 2:
        confidence = 92
    elif chunk_count == 1:
        confidence = 88
    else:
        confidence = 70

    # Boost confidence if exact keyword matches occur in retrieved text
    if chunks:
        context_text = " ".join([c["text"].lower() for c in chunks])
        matches = sum(1 for kw in q_lower.split() if len(kw) > 3 and kw in context_text)
        if matches >= 2:
            confidence = min(99, confidence + 3)

    return {
        "intent": intent,
        "tool_selected": tool_selected,
        "reasoning": reasoning,
        "confidence_score": confidence
    }
