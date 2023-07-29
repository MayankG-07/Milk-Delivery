from datetime import datetime
from fastapi import HTTPException
from house import House
from misc import sqlfyJSON, dateFromInt, intFromDate


class Subscription:
    def __init__(
        self,
        subid: int | None = None,
        house: House | None = None,
        milkids: list[int] | None = None,
        sub_start: datetime | None = None,
        sub_end: datetime | None = None,
        days: list[int] | None = None,
    ):
        self.house = house
        self.subid = subid
        self.milkids = milkids
        self.sub_start = sub_start
        self.sub_end = sub_end
        self.days = days

    # * inline with new schema
    async def sync_details(self, con):
        cursor = con.cursor()

        query = (
            f"SELECT * FROM subs WHERE subid={self.subid}"
            if self.subid
            else f"SELECT * FROM subs WHERE houseid={self.house.houseid}"
        )
        cursor.execute(query)

        try:
            result = cursor.fetchall()
            row = result[0]
            self.subid = row[0]
            self.milkids = eval(row[1])
            self.sub_start = row[2]
            self.days = eval(row[3])
            self.sub_end = row[4]
            self.pause_date = row[5]
            self.resume_date = row[6]
            self.delivered = (
                [dateFromInt(date) for date in eval(row[7])]
                if row[7] is not None
                else []
            )
            self.not_delivered = (
                [dateFromInt(date) for date in eval(row[8])]
                if row[8] is not None
                else []
            )
            self.active = bool(row[9])
            self.house = House(houseid=row[10])
            await self.house.sync_details(con=con)
            self.ended = row[11]
        except IndexError:
            con.close()
            raise HTTPException(status_code=404, detail="Sub not found")

    # * inline with new schema
    async def could_not_deliver(self, clientDate: datetime, con):
        cursor = con.cursor()

        query = f"SELECT not_delivered FROM subs WHERE subid={self.subid}"
        cursor.execute(query)

        result = cursor.fetchall()
        row = result[0]
        not_delivered = eval(row[0]) if row[0] is not None else []

        clientDateInt = intFromDate(clientDate)
        not_delivered.append(clientDateInt)

        query = f"UPDATE subs SET not_delivered={sqlfyJSON(not_delivered)} WHERE subid={self.subid}"
        cursor.execute(query)

        con.commit()

    # * inline with new schema
    async def activate(self, con):
        cursor = con.cursor()

        query = f"SELECT * FROM subs WHERE houseid={self.house.houseid}"
        cursor.execute(query)

        try:
            result = cursor.fetchall()
            row = result[0]
            con.close()
            raise HTTPException(
                status_code=400, detail="Subscription already exists for house"
            )
        except IndexError:
            pass

        query = f"INSERT INTO subs (milkids, sub_start, days, sub_end, active, houseid) VALUES ({sqlfyJSON(self.milkids)}, '{self.sub_start.date()}', {sqlfyJSON(self.days)}, '{self.sub_end.date()}', 1, {self.house.houseid})"
        cursor.execute(query)
        con.commit()

        await self.sync_details(con=con)
        details = {
            "subid": self.subid,
            "milkids": self.milkids,
            "sub_start": str(self.sub_start),
            "days": self.days,
            "sub_end": str(self.sub_end),
            "pause_date": str(self.pause_date) if self.pause_date is not None else None,
            "resume_date": str(self.resume_date)
            if self.resume_date is not None
            else None,
            "delivered": self.delivered,
            "not_delivered": self.not_delivered,
            "active": self.active,
            "houseid": self.house.houseid,
        }
        return details

    # * inline with new schema
    async def pause(self, pause_date: datetime, resume_date: datetime, con):
        cursor = con.cursor()
        query = f"UPDATE subs SET pause_date='{str(pause_date)}', resume_date='{str(resume_date)}' WHERE subid={self.subid}"
        cursor.execute(query)
        con.commit()

        await self.sync_details(con=con)
        details = {
            "subid": self.subid,
            "milkids": self.milkids,
            "sub_start": str(self.sub_start),
            "days": self.days,
            "sub_end": str(self.sub_end),
            "pause_date": str(self.pause_date) if self.pause_date is not None else None,
            "resume_date": str(self.resume_date)
            if self.resume_date is not None
            else None,
            "delivered": self.delivered,
            "not_delivered": self.not_delivered,
            "active": self.active,
            "houseid": self.house.houseid,
        }
        return details

    # * inline with new schema
    async def deliver(self, clientDate: datetime, con):
        cursor = con.cursor()

        cursor.execute(f"SELECT delivered FROM subs WHERE subid={self.subid}")

        result = cursor.fetchall()
        row = result[0]
        delivered = eval(row[0]) if row[0] is not None else []
        clientDateInt = intFromDate(clientDate)
        delivered.append(clientDateInt)

        query = (
            f"UPDATE subs SET delivered={sqlfyJSON(delivered)} WHERE subid={self.subid}"
        )
        cursor.execute(query)
        con.commit()

    # * inline with new schema
    async def end(self, clientDateTime: datetime, con):
        cursor = con.cursor()

        query = f"UPDATE subs SET active=0, sub_end='{str(clientDateTime.date())}', ended=1 WHERE subid={self.subid}"
        cursor.execute(query)
        con.commit()
