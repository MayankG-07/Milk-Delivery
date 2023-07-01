from app import app
from user import User
from bill import Bill
from pydantic import BaseModel


class GenerateBillParams(BaseModel):
    wing: str
    houseno: int


class PayBillParams(BaseModel):
    wing: str
    houseno: int


@app.put("/api/sub/generate_bill")
async def generate_bill(generateBillParams: GenerateBillParams):
    params_dict = generateBillParams.dict()
    wing = params_dict["wing"]
    houseno = params_dict["houseno"]

    user = User(wing, houseno)
    bill = Bill(user)

    message = bill.generate()
    return message


@app.put("/api/sub/pay_bill")
async def pay_bill(payBillParams: PayBillParams):
    params_dict = payBillParams.dict()
    wing = params_dict["wing"]
    houseno = params_dict["houseno"]

    user = User(wing, houseno)
    bill = Bill(user)

    message = bill.pay()
    return message
