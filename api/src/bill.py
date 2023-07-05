from user import User
from db import connect, disconnect
from datetime import datetime
from fastapi import HTTPException
from sub import Subscription
from house import House


class Bill:
    def __init__(
        self,
        billid: int | None = None,
        billGenTime: datetime | None = None,
        billAmt: int | None = None,
        paid: bool | None = None,
        sub: Subscription | None = None,
        house: House | None = None,
    ):
        self.billid = billid
        self.billGenTime = billGenTime
        self.billAmt = billAmt
        self.paid = paid
        self.sub = sub
        self.house = house

    # * inline with new schema
    async def sync_details(self):
        connect()
        from db import con

        cursor = con.cursor()

        query = (
            f"SELECT * FROM bills WHERE billid={self.billid}"
            if self.billid is not None
            else f"SELECT * FROM bills WHERE billGenTime='{str(self.billGenTime)}' AND subid={self.sub.subid}"
        )
        cursor.execute(query)
        result = cursor.fetchall()

        try:
            row = result[0]
        except IndexError:
            disconnect()
            raise HTTPException(status_code=404, detail="Bill not found")

        disconnect()
        self.billid = int(row[0])
        self.billGenTime = row[1]
        self.billAmt = int(row[2])
        self.paid = bool(row[3])
        self.sub = Subscription(subid=int(row[4]))
        await self.sub.sync_details()
        self.house = House(houseid=int(row[5]))
        await self.house.sync_details()

    # * inline with new schema
    async def generate(self):
        connect()
        from db import con

        cursor = con.cursor()

        query = f"SELECT milkids, delivered FROM subs WHERE subid={self.sub.subid}"
        cursor.execute(query)
        result = cursor.fetchall()
        row = result[0]
        milkids = eval(row[0])
        delivered = eval(row[1]) if row[1] is not None else []
        times_delivered = len(delivered)

        amount = 0
        for i in range(len(milkids)):
            milkid = milkids[i]
            query = f"SELECT price FROM milks WHERE milkid={milkid}"
            cursor.execute(query)
            result = cursor.fetchall()
            row = result[0]
            price = row[0]

            amount += price * times_delivered

        if not amount:
            raise HTTPException(status_code=400, detail="Bill amount is zero")

        query = f"INSERT INTO bills (billGenTime, billAmt, paid, subid, houseid) VALUES ('{str(self.billGenTime)}', {amount}, 0, {self.sub.subid}, {self.house.houseid})"
        cursor.execute(query)
        con.commit()
        disconnect()

        await self.sync_details()
        details = {
            "billid": self.billid,
            "billGenTime": str(self.billGenTime),
            "billAmt": self.billAmt,
            "paid": self.paid,
            "subid": self.sub.subid,
            "houseid": self.house.houseid,
        }
        return details

    # * inline with new schema
    async def pay(self):
        connect()
        from db import con

        cursor = con.cursor()

        query = f"UPDATE bills SET paid=1 WHERE billid={self.billid}"
        cursor.execute(query)
        con.commit()
        disconnect()
