from db import connect, disconnect
from fastapi import HTTPException
from user import User
from misc import sqlfyJSON, dateFromInt


class House:
    def __init__(self, houseid: int = None, wing: str = None, houseno: int = None):
        self.wing = wing
        self.houseno = houseno
        self.houseid = houseid

    # * inline with new schema
    async def sync_details(self):
        connect()
        from db import con

        cursor = con.cursor()

        if self.wing and self.houseno:
            query = f"SELECT * FROM houses WHERE wing='{self.wing}' AND houseno={self.houseno}"
        else:
            query = f"SELECT * FROM houses WHERE houseid={self.houseid}"

        cursor.execute(query)

        try:
            result = cursor.fetchall()
            row = result[0]
            self.houseid = row[0]
            self.wing = row[1]
            self.houseno = row[2]
            self.members = eval(row[3]) if row[3] is not None else []
        except IndexError:
            disconnect()
            raise HTTPException(status_code=404, detail="House not found")

    # * inline with new schema
    async def register(self):
        connect()
        from db import con

        cursor = con.cursor()

        query = (
            f"SELECT * FROM houses WHERE wing='{self.wing}' AND houseno={self.houseno}"
        )
        cursor.execute(query)

        try:
            result = cursor.fetchall()
            row = result[0]
            raise HTTPException(status_code=400, detail="House already exists")
        except IndexError:
            pass

        query = (
            f"INSERT INTO houses (wing, houseno) VALUES ('{self.wing}', {self.houseno})"
        )
        cursor.execute(query)
        con.commit()

        query = (
            f"SELECT * FROM houses WHERE wing='{self.wing}' AND houseno={self.houseno}"
        )
        cursor.execute(query)

        result = cursor.fetchall()
        row = result[0]
        details = {
            "houseid": int(row[0]),
            "wing": row[1],
            "houseno": int(row[2]),
            "members": [int(memberId) for memberId in eval(row[3])]
            if row[3] is not None
            else [],
        }

        disconnect()
        return details

    # * inline with new schema
    async def add_member(self, member: User):
        connect()
        from db import con

        cursor = con.cursor()

        query = f"SELECT members FROM houses WHERE houseid={self.houseid}"
        cursor.execute(query)
        result = cursor.fetchall()
        members = eval(result[0][0]) if result[0][0] is not None else []
        if member.userid in members:
            raise HTTPException(
                status_code=400, detail="Member already exists in house"
            )

        members.append(member.userid)
        query = f"UPDATE houses SET members={sqlfyJSON(members)} WHERE houseid={self.houseid}"
        cursor.execute(query)
        con.commit()

        query = f"SELECT houseids FROM users WHERE userid={member.userid}"
        cursor.execute(query)
        result = cursor.fetchall()
        houseids = eval(result[0][0]) if result[0][0] is not None else []
        houseids.append(self.houseid)
        # print(member.userid, houseids, sqlfyJSON(houseids))

        query = f"UPDATE users SET houseids={sqlfyJSON(houseids)} WHERE userid={member.userid}"
        cursor.execute(query)
        con.commit()

        query = f"SELECT * FROM users WHERE userid={member.userid}"
        cursor.execute(query)
        result = cursor.fetchall()
        row = result[0]
        # print(row[6])
        details = {
            "id": row[0],
            "name": row[1],
            "email": row[2],
            "phone": row[3],
            "imgUrl": row[5],
            "houseids": eval(row[6]),
            "verified": bool(row[7]),
        }

        disconnect()
        return details

    # * inline with new schema
    async def delete_member(self, member: User):
        connect()
        from db import con

        cursor = con.cursor()

        query = f"SELECT members FROM houses WHERE houseid={self.houseid}"
        cursor.execute(query)
        result = cursor.fetchall()
        members = eval(result[0][0]) if result[0][0] is not None else []
        if member.userid not in members:
            raise HTTPException(status_code=404, detail="Member not found in house")

        members.remove(member.userid)
        query = f"UPDATE houses SET members={sqlfyJSON(members)} WHERE houseid={self.houseid}"
        cursor.execute(query)
        con.commit()

        # print(member.userid)
        query = f"SELECT houseids FROM users WHERE userid={member.userid}"
        cursor.execute(query)
        # print(query)
        result = cursor.fetchall()
        # print(result)
        houseids = eval(result[0][0]) if result[0][0] is not None else []
        if self.houseid not in houseids:
            raise HTTPException(status_code=404, detail="House not found in user")

        houseids.remove(self.houseid)
        query = f"UPDATE users SET houseids={sqlfyJSON(houseids)} WHERE userid={member.userid}"
        cursor.execute(query)
        con.commit()

        disconnect()

    # * inline with new schema
    async def subs_details(self):
        connect()
        from db import con

        cursor = con.cursor()

        cursor.execute(f"SELECT * FROM subs WHERE houseid={self.houseid}")
        result = cursor.fetchall()

        subs = [
            {
                "subid": row[0],
                "milkids": eval(row[1]),
                "sub_start": row[2],
                "days": eval(row[3]) if row[3] is not None else [],
                "sub_end": row[4],
                "pause_dates": [dateFromInt(date).date() for date in eval(row[5])]
                if row[5] is not None
                else [],
                "resume_dates": [dateFromInt(date).date() for date in eval(row[6])]
                if row[6] is not None
                else [],
                "delivered": [dateFromInt(date).date() for date in eval(row[7])]
                if row[7] is not None
                else [],
                "not_delivered": [dateFromInt(date).date() for date in eval(row[8])]
                if row[8] is not None
                else [],
                "active": row[9] if row[9] == "paused" else bool(int(row[9])),
                "houseid": row[10],
            }
            for row in result
        ]

        details = {"subs": subs}
        # print(details)

        disconnect()
        return details
