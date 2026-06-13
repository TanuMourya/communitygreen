from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

model = SentenceTransformer('all-MiniLM-L6-v2')

def get_embeddings(texts: list) -> np.ndarray:
    return model.encode(texts, convert_to_numpy=True)

def find_duplicates(new_title: str, new_description: str, existing_issues: list, threshold: float = 0.85, radius_km: float = 0.5) -> list:
    if not existing_issues:
        return []

    import math

    def haversine(lat1, lon1, lat2, lon2):
        R = 6371  # Earth radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
        return R * 2 * math.asin(math.sqrt(a))

    new_text = f"{new_title} {new_description}"
    existing_texts = [f"{i['title']} {i['description']}" for i in existing_issues]

    all_texts = existing_texts + [new_text]
    embeddings = get_embeddings(all_texts)

    new_embedding = embeddings[-1].reshape(1, -1).astype('float32')
    existing_embeddings = embeddings[:-1].astype('float32')

    faiss.normalize_L2(new_embedding)
    faiss.normalize_L2(existing_embeddings)

    similarities = np.dot(existing_embeddings, new_embedding.T).flatten()

    duplicates = []
    for i, score in enumerate(similarities):
        if score >= threshold:
            issue = existing_issues[i]
            # Check location only if lat/lon available
            new_lat = issue.get("new_lat")
            new_lon = issue.get("new_lon")
            if new_lat and new_lon:
                distance = haversine(new_lat, new_lon, issue["latitude"], issue["longitude"])
                if distance > radius_km:
                    continue  # skip — same issue type but different location
            duplicates.append({
                **issue,
                "similarity_score": float(score)
            })

    return sorted(duplicates, key=lambda x: x["similarity_score"], reverse=True)

def analyze_issue(title: str, description: str) -> dict:
    # Placeholder - returns default values without API call
    return {
        "category": "Other",
        "severity": "medium",
        "formal_summary": f"{title}. {description}"
    }