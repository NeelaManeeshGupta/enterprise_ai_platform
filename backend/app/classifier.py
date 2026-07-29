def classify_document(filename: str, sample_text: str = ""):
    """
    Document Intelligence Pipeline: Classifies document category and extracts 
    specialized domain metadata tags based on file type and text content.
    """
    fn_lower = filename.lower()
    text_lower = sample_text.lower()
    
    if "resume" in fn_lower or "cv" in fn_lower or "profile" in text_lower or "cgpa" in text_lower:
        category = "Resume & Talent Profile"
        processing_strategy = "Extract skills, experience, and projects"
        icon_type = "user"
    elif "security" in fn_lower or "tls" in text_lower or "xss" in text_lower or "vulnerability" in text_lower:
        category = "Security & Governance Policy"
        processing_strategy = "Extract security controls, vulnerabilities, and protocol rules"
        icon_type = "shield"
    elif "fee" in fn_lower or "receipt" in fn_lower or "order" in text_lower or "paid" in text_lower or "sbi" in text_lower:
        category = "Financial Transaction & Receipt"
        processing_strategy = "Extract payment metrics, reference numbers, and order status"
        icon_type = "dollar"
    elif "sales" in fn_lower or "report" in fn_lower or "revenue" in text_lower or "xlsx" in fn_lower or "csv" in fn_lower:
        category = "Financial & Quantitative Data"
        processing_strategy = "Extract tabular rows, financial metrics, and trends"
        icon_type = "chart"
    else:
        category = "General Enterprise Document"
        processing_strategy = "Standard chunking and dense vector indexing"
        icon_type = "file"

    return {
        "category": category,
        "processing_strategy": processing_strategy,
        "icon_type": icon_type
    }
