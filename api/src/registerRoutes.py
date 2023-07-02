from src.app import app
from pydantic import BaseModel
from src.user import User


class RegisterParams(BaseModel):
    wing: str
    houseno: int
    email: str
    password: str


@app.post("/api/register")
async def register(registerParams: RegisterParams):
    params_dict = registerParams.dict()
    wing = params_dict["wing"]
    houseno = params_dict["houseno"]
    email = params_dict["email"]
    password = params_dict["password"]

    new_user = User(wing, houseno, email, password)
    message = await new_user.register()

    return message
