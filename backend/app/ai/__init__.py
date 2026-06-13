def find_duplicates(new_title: str, new_description: str, existing_issues: list, threshold: float = 0.85) -> list:
    """Simple keyword-based duplicate detection for deployment"""
    if not existing_issues:
        return []
    
    new_text = f"{new_title} {new_description}".lower()
    new_words = set(new_text.split())
    
    duplicates = []
    for issue in existing_issues:
        existing_text = f"{issue['title']} {issue['description']}".lower()
        existing_words = set(existing_text.split())
        
        # Jaccard similarity
        intersection = new_words & existing_words
        union = new_words | existing_words
        score = len(intersection) / len(union) if union else 0
        
        if score >= 0.4:  # lower threshold for keyword matching
            duplicates.append({**issue, "similarity_score": score})
    
    return sorted(duplicates, key=lambda x: x["similarity_score"], reverse=True)

def analyze_issue(title: str, description: str) -> dict:
    return {
        "category": "Other",
        "severity": "medium",
        "formal_summary": f"{title}. {description}"
    }