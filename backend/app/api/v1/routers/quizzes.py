from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.core.deps import get_db
from app.schemas.quiz import QuizCreate, QuizOut, QuizUpdate
from app.services.quiz_service import service as quiz_service
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.quiz_full import QuizFullOut

router = APIRouter()


@router.get("/", response_model=List[QuizOut])
async def list_quizzes(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: Optional[int] = Query(None, ge=1),
):
    return await quiz_service.list(db, skip=skip, limit=limit)


@router.get("/{quiz_id}", response_model=QuizOut)
async def get_quiz(
    quiz_id: str,
    db: AsyncSession = Depends(get_db)
):
    return await quiz_service.get(db, quiz_id)


@router.post("/", response_model=QuizOut, status_code=status.HTTP_201_CREATED)
async def create_quiz(
    payload: QuizCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)   
):
    return await quiz_service.create(
        db,
        title=payload.title,
        description=payload.description,
        user_id=current_user.id,   
        course_id=payload.course_id,
        video_id=payload.video_id
    )


@router.put("/{quiz_id}", response_model=QuizOut)
async def update_quiz(
    quiz_id: str,
    payload: QuizUpdate,
    db: AsyncSession = Depends(get_db),
    #current_user: User = Depends(get_current_user)
):
    
    #quiz = await quiz_service.get(db, quiz_id)

    # Impedir que alguém edite quiz que não é dele
    #if quiz.user_id != current_user.id:
        #raise HTTPException(
            #status_code=403,
            #detail="You do not have permission to edit this quiz."
        #)

    return await quiz_service.update(
        db,
        quiz_id,
        title=payload.title,
        description=payload.description,
        course_id=payload.course_id,
        video_id=payload.video_id
    )


@router.delete("/{quiz_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_quiz(
    quiz_id: str,
    db: AsyncSession = Depends(get_db)
):
    await quiz_service.delete(db, quiz_id)
    return None

@router.get("/by_course/{course_id}", response_model=QuizOut)
async def get_quiz_by_course(
    course_id: str,
    db: AsyncSession = Depends(get_db),
):
    return await quiz_service.get_by_course(db, course_id)

@router.get("/{quiz_id}/full", response_model=QuizFullOut)
async def get_quiz_full(
    quiz_id: str,
    db: AsyncSession = Depends(get_db),
):
    return await quiz_service.get_full(db, quiz_id)