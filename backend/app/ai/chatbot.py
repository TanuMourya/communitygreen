import ollama
import chromadb
from sqlalchemy.orm import Session
from app.models.issue import Issue

# ChromaDB client
chroma_client = chromadb.Client()
collection = chroma_client.get_or_create_collection(name="issues")

def sync_issues_to_chromadb(db: Session):
    """Sync all issues from DB to ChromaDB for RAG"""
    issues = db.query(Issue).all()
    if not issues:
        return

    documents = []
    metadatas = []
    ids = []

    for issue in issues:
        doc = f"Title: {issue.title}\nDescription: {issue.description}\nCategory: {issue.category or 'Unknown'}\nSeverity: {issue.severity}\nStatus: {issue.status}\nLocation: {issue.latitude}, {issue.longitude}"
        documents.append(doc)
        metadatas.append({
            "id": str(issue.id),
            "title": issue.title,
            "status": issue.status,
            "category": issue.category or "Unknown",
            "latitude": str(issue.latitude),
            "longitude": str(issue.longitude),
        })
        ids.append(str(issue.id))

    # Upsert all issues
    collection.upsert(documents=documents, metadatas=metadatas, ids=ids)

def ask_chatbot(question: str, db: Session) -> str:
    """Answer questions using RAG + Ollama"""
    
    # Sync latest issues
    sync_issues_to_chromadb(db)

    # Get total count for context
    total = db.query(Issue).count()
    open_count = db.query(Issue).filter(Issue.status == 'open').count()
    resolved_count = db.query(Issue).filter(Issue.status == 'resolved').count()

    # Search relevant issues
    try:
        results = collection.query(query_texts=[question], n_results=min(3, total or 1))
        relevant_docs = results['documents'][0] if results['documents'] else []
        context = "\n\n".join(relevant_docs) if relevant_docs else "No specific issues found."
    except Exception:
        context = "No issues available yet."

    # Build prompt
    prompt = f"""You are a helpful assistant for CommunityGreen, an environmental issue reporting platform.

Current stats:
- Total issues: {total}
- Open issues: {open_count}  
- Resolved issues: {resolved_count}

Relevant issues from the database:
{context}

User question: {question}

Answer helpfully and concisely in 2-3 sentences. If asked about specific issues, reference the data above. If asked how to report an issue, explain they can click the "+ Report" button."""

    try:
        response = ollama.chat(
            model='llama3.2',
            messages=[{'role': 'user', 'content': prompt}]
        )
        return response['message']['content']
    except Exception as e:
        return f"Sorry, I couldn't process your question right now. Error: {str(e)}"