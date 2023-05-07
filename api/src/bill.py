from user import User
from db import connect, disconnect
from datetime import datetime


class Bill:
    def __init__(self, user: User):
        self.user = user

    def generate(self):
        details = self.user.get_details()["details"]
        houseno = details["houseno"]

        connect()
        from db import con, cursor

        cursor.execute(f"SELECT bill_amt, bill_due FROM users WHERE houseno={houseno}")

        result = cursor.fetchall()[0]

        if result[0] and result[1]:
            disconnect()
            return {
                "success": "BILL_GEN_SUCCESS",
                "bill_amt": result[0],
                "bill_due": result[1],
            }

        # print(details)

        milkid = details["subs"][-1]["sub"]["milkid"]
        milk_delivered = details["subs"][-1]["sub"]["milk_delivered"]

        cursor.execute(
            f"SELECT DATE_ADD(sub_start, INTERVAL 1 MONTH) FROM users WHERE houseno={houseno}"
        )

        sub_end = cursor.fetchall()[0][0]

        cursor.execute(f"SELECT price FROM milks WHERE milkid='{milkid}'")
        price = cursor.fetchall()[0][0]

        total_sum = price * len(milk_delivered)

        cursor.execute(
            f"UPDATE users SET bill_amt={total_sum}, bill_due='{sub_end}' WHERE houseno={houseno}"
        )

        cursor.execute(f"SELECT sub_start FROM users WHERE houseno={houseno}")
        start_date = cursor.fetchall()[0][0]

        cursor.execute(
            f"SELECT bills_due FROM {self.user.wing}{self.user.houseno} WHERE sub_start='{start_date}'"
        )

        sub_end = str(sub_end)
        sub_end = int(sub_end[:4] + sub_end[5:7] + sub_end[8:])

        try:
            bills_due = eval(cursor.fetchall[0][0]).append([total_sum, sub_end])
        except:
            bills_due = [[total_sum, sub_end]]

        # print(bills_due)

        cursor.execute(
            f"UPDATE {self.user.wing}{self.user.houseno} SET bills_due='{bills_due}' WHERE sub_start='{start_date}'"
        )

        con.commit()
        disconnect()
        return {
            "success": "BILL_GEN_SUCCESS",
            "bill_amt": total_sum,
            "bill_due": sub_end,
        }

    def pay(self):
        connect()
        from db import con, cursor

        cursor.execute(
            f"SELECT bill_due, bill_amt, bills_paid FROM users WHERE houseno={self.user.houseno}"
        )

        bill_due, bill_amt, bills_paid = cursor.fetchall()[0]
        try:
            bills_paid = eval(bills_paid)
        except:
            bills_paid = []

        bill_due = int(str(bill_due)[:4] + str(bill_due)[5:7] + str(bill_due)[8:])

        paid_date = str(datetime.now().date())
        paid_date = int(paid_date[:4] + paid_date[5:7] + paid_date[8:])

        bills_paid.append([bill_due, paid_date, bill_amt])

        cursor.execute(
            f"UPDATE users SET bill_amt=NULL, bill_due=NULL, bills_paid='{bills_paid}' WHERE houseno={self.user.houseno}"
        )

        cursor.execute(f"SELECT sub_start FROM users WHERE houseno={self.user.houseno}")
        start_date = cursor.fetchall()[0][0]

        cursor.execute(
            f"SELECT bills_paid FROM {self.user.wing}{self.user.houseno} WHERE sub_start='{start_date}'"
        )

        try:
            bills_paid = eval(cursor.fetchall()[0][0]).append(
                [bill_due, bill_amt, paid_date]
            )
        except:
            bills_paid = [[bill_due, bill_amt, paid_date]]

        cursor.execute(
            f"UPDATE {self.user.wing}{self.user.houseno} SET bills_paid='{bills_paid}' WHERE sub_start='{start_date}'"
        )

        cursor.execute(
            f"SELECT bills_due FROM {self.user.wing}{self.user.houseno} WHERE sub_start='{start_date}'"
        )
        bills_due = eval(cursor.fetchall()[0][0]).remove([bill_amt, bill_due])

        cursor.execute(
            f"UPDATE {self.user.wing}{self.user.houseno} SET bill_due='{bills_due}' WHERE sub_start='{start_date}'"
        )

        con.commit()
        disconnect()
        return {"success": "BILL_PAY_SUCCESS"}
