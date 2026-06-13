from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.issue import Issue
from app.schemas.issue import IssueOut, IssueUpdate
from app.routers.deps import get_current_user
from app.models.user import User
import shutil, os, uuid
from app.ai import analyze_issue
from app.ai import find_duplicates
from app.ai.chatbot import ask_chatbot

router = APIRouter(prefix="/issues", tags=["Issues"])

UPLOAD_DIR = "uploads"

@router.post("/", response_model=IssueOut)
def create_issue(
    title: str = Form(...),
    description: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    category: Optional[str] = Form(None),
    severity: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    photo_url = None
    if photo:
        ext = photo.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        path = os.path.join(UPLOAD_DIR, filename)
        with open(path, "wb") as f:
            shutil.copyfileobj(photo.file, f)
        photo_url = f"/uploads/{filename}"

    issue = Issue(
        title=title,
        description=description,
        latitude=latitude,
        longitude=longitude,
        photo_url=photo_url,
        category=category,
        severity=severity or "medium",
        user_id=current_user.id
    )
    db.add(issue)
    db.commit()
    db.refresh(issue)


    return issue

@router.get("/", response_model=List[IssueOut])
def get_issues(
    status: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Issue)
    if status:
        query = query.filter(Issue.status == status)
    if category:
        query = query.filter(Issue.category == category)
    return query.order_by(Issue.created_at.desc()).all()

@router.get("/{issue_id}", response_model=IssueOut)
def get_issue(issue_id: int, db: Session = Depends(get_db)):
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return issue

@router.patch("/{issue_id}", response_model=IssueOut)
def update_issue(
    issue_id: int,
    updates: IssueUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    for key, value in updates.dict(exclude_unset=True).items():
        setattr(issue, key, value)
    db.commit()
    db.refresh(issue)
    return issue

@router.post("/{issue_id}/upvote", response_model=IssueOut)
def upvote_issue(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    issue.upvotes += 1
    current_user.points += 1
    db.commit()
    db.refresh(issue)
    return issue

@router.delete("/{issue_id}")
def delete_issue(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    if issue.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(issue)
    db.commit()
    return {"message": "Issue deleted"}
@router.post("/check-duplicate")
@router.post("/check-duplicate")
def check_duplicate(
    title: str = Form(...),
    description: str = Form(...),
    latitude: float = Form(None),
    longitude: float = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(Issue).all()
    existing_list = [
        {
            "id": i.id, "title": i.title, "description": i.description,
            "status": i.status, "latitude": i.latitude, "longitude": i.longitude,
            "new_lat": latitude, "new_lon": longitude
        }
        for i in existing
    ]
    duplicates = find_duplicates(title, description, existing_list)
    return {"duplicates": duplicates}
@router.post("/chat")
def chat(
    question: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    answer = ask_chatbot(question, db)
    return {"answer": answer}