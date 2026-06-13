from sqlalchemy.orm import Session
from app.models.issue import Issue

def ask_chatbot(question: str, db: Session) -> str:
    """Simple rule-based chatbot for deployment"""
    total = db.query(Issue).count()
    open_count = db.query(Issue).filter(Issue.status == 'open').count()
    resolved_count = db.query(Issue).filter(Issue.status == 'resolved').count()
    
    q = question.lower()
    
    if any(w in q for w in ['how many', 'total', 'count']):
        return f"There are currently {total} issues reported in your community. {open_count} are open and {resolved_count} have been resolved."
    
    elif any(w in q for w in ['open', 'pending']):
        return f"There are {open_count} open issues currently awaiting resolution in your community."
    
    elif any(w in q for w in ['resolved', 'fixed', 'solved']):
        return f"Great news! {resolved_count} out of {total} issues have been resolved so far."
    
    elif any(w in q for w in ['report', 'submit', 'add']):
        return "To report an issue, click the '+ Report' button in the top right corner. Fill in the title, description, select your location and category, then submit!"
    
    elif any(w in q for w in ['category', 'type', 'kind']):
        return "You can report issues in these categories: Water Pollution, Air Quality, Waste Dumping, Deforestation, Noise Pollution, and Soil Contamination."
    
    elif any(w in q for w in ['upvote', 'vote', 'support']):
        return "You can upvote issues you care about by clicking the 👍 button on any issue card. This helps prioritize which issues get resolved first!"
    
    elif any(w in q for w in ['map', 'location', 'near', 'where']):
        return "Click the 📍 Live Map view to see all reported issues on an interactive map of your area!"
    
    else:
        return f"I'm here to help! Currently there are {total} environmental issues reported ({open_count} open, {resolved_count} resolved). You can report issues, view them on a map, upvote important ones, and track their resolution status."