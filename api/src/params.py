from pydantic import BaseModel


class RegisterHouseParams(BaseModel):
    wing: str
    houseno: int


class AddMemberParams(BaseModel):
    userid: int


class DeleteMemberParams(BaseModel):
    userid: int


class NotDeliveredParams(BaseModel):
    subid: int
    clientDate: str


class RegisterUserParams(BaseModel):
    name: str
    email: str
    phone: str
    password: str
    imgUrl: str or None = None


class NewSubParams(BaseModel):
    houseid: int
    milkids: list[int]
    sub_start: str
    sub_end: str
    days: list[int]


class PauseSubParams(BaseModel):
    pause_date: str
    resume_date: str
