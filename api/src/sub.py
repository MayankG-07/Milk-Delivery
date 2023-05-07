from user import User
from db import connect, disconnect
from datetime import datetime


class Subscription:
    def __init__(self, user: User):
        self.user = user

    def doesExist(self):
        connect()
        from db import con, cursor

        cursor.execute(f"SELECT subid FROM users WHERE houseno={self.user.houseno}")

        result = cursor.fetchall()[0][0]
        disconnect()
        return True if result is not None else False

    def activate(
        self,
        sub_type: str,
        milk_comp: str,
        milk_type: str,
        start_date: str,
        auto_renew: bool,
        omit: list[int] = None,
    ):
        self.sub_type = sub_type
        self.milk_comp = milk_comp
        self.milk_type = milk_type
        self.omit = omit
        self.auto_renew = 1 if auto_renew else 0

        connect()
        from db import con, cursor

        cursor.execute(f"SELECT subid FROM subs WHERE type='{self.sub_type}'")
        subid = int(cursor.fetchall()[0][0])

        cursor.execute(
            f"SELECT milkid FROM milks WHERE company='{self.milk_comp}' AND type='{self.milk_type}'"
        )
        milkid = int(cursor.fetchall()[0][0])

        try:
            if self.omit:
                cursor.execute(
                    f"UPDATE users SET subid={subid}, milkid={milkid}, sub_start='{start_date}', omit_days='{self.omit}', auto_renew={self.auto_renew}, milk_next_day=1 WHERE houseno={self.user.houseno}"
                )

                cursor.execute(
                    f"INSERT INTO {self.user.wing}{self.user.houseno} (subid, milkid, sub_start, omit_days, auto_renew) VALUES ({subid}, {milkid}, '{start_date}', '{self.omit}', {self.auto_renew}) "
                )
            else:
                cursor.execute(
                    f"UPDATE users SET subid={subid}, milkid={milkid}, sub_start='{start_date}', auto_renew={self.auto_renew}, milk_next_day=1 WHERE houseno={self.user.houseno}"
                )

                cursor.execute(
                    f"INSERT INTO {self.user.wing}{self.user.houseno} (subid, milkid, sub_start, auto_renew) VALUES ({subid}, {milkid}, '{start_date}', {self.auto_renew}) "
                )

            con.commit()

            cursor.execute(f"SELECT subid FROM users WHERE houseno={self.user.houseno}")
            result = cursor.fetchall()[0][0]
            if result is not None:
                disconnect()
                return {"success": "SUB_ACTIVATE_SUCCESS"}
            else:
                disconnect()
                return {"error": "An error occurred"}
        except Exception as e:
            disconnect()
            return {"error": e}

    def noMilkNextDay(self):
        connect()
        from db import con, cursor

        try:
            cursor.execute(
                f"UPDATE users SET milk_next_day=0 WHERE houseno={self.user.houseno}"
            )

            con.commit()
            disconnect()
            return {"success": "NO_MILK_NEXT_DAY"}
        except Exception as e:
            disconnect()
            return {"error": e}

    def pause(self, pause_date: str, resume_date: str):
        self.pause_date = pause_date
        self.resume_date = resume_date

        connect()
        from db import con, cursor

        cursor.execute(
            f"SELECT DATE_ADD(sub_start, INTERVAL 1 MONTH) FROM users WHERE houseno={self.user.houseno}"
        )
        sub_end = cursor.fetchall()[0][0]

        pause_start = datetime(
            int(pause_date[:4]), int(pause_date[5:7]), int(pause_date[8:])
        ).date()

        if pause_start >= sub_end:
            disconnect()
            return {"error": "SUB_NOT_EXISTS"}

        cursor.execute(
            f"UPDATE users SET pause_date='{self.pause_date}', resume_date='{self.resume_date}' WHERE houseno={self.user.houseno}"
        )

        cursor.execute(f"SELECT sub_start FROM users WHERE houseno={self.user.houseno}")
        start_date = cursor.fetchall()[0][0]

        cursor.execute(
            f"SELECT pause_dates, resume_dates FROM {self.user.wing}{self.user.houseno} WHERE sub_start='{start_date}'"
        )

        try:
            pause_dates, resume_dates = cursor.fetchall()[0]
            pause_dates = eval(pause_dates)
            resume_dates = eval(resume_dates)

            pause_dates.append(int(pause_date[:4] + pause_date[5:7] + pause_date[8:]))
            resume_dates.append(
                int(resume_date[:4] + resume_date[5:7] + resume_date[8:])
            )
        except:
            pause_dates = [int(pause_date[:4] + pause_date[5:7] + pause_date[8:])]
            resume_dates = [int(resume_date[:4] + resume_date[5:7] + resume_date[8:])]

        cursor.execute(
            f"UPDATE {self.user.wing}{self.user.houseno} SET pause_dates='{pause_dates}', resume_dates='{resume_dates}'"
        )

        con.commit()

        cursor.execute(
            f"SELECT pause_date FROM users WHERE houseno={self.user.houseno}"
        )
        result = cursor.fetchall()[0][0]

        if not result:
            disconnect()
            return {"error": "An error occurred"}

        disconnect()
        return {"success": "SUB_PAUSE_SUCCESS"}

    def deliver_milk_today(self):
        connect()
        from db import con, cursor

        cursor.execute(
            f"SELECT milk_delivered FROM users WHERE houseno={self.user.houseno}"
        )

        result = cursor.fetchall()[0][0]

        try:
            try:
                milk_delivered = eval(result)
            except:
                milk_delivered = []

            date = str(datetime.now().date())
            date = int(date[:4] + date[5:7] + date[8:])

            milk_delivered.append(date)

            cursor.execute(
                f"UPDATE users SET milk_delivered='{milk_delivered}' WHERE houseno='{self.user.houseno}'"
            )

            cursor.execute(
                f"SELECT sub_start FROM users WHERE houseno={self.user.houseno}"
            )
            start_date = cursor.fetchall()[0][0]

            cursor.execute(
                f"SELECT milk_delivered FROM {self.user.wing}{self.user.houseno} WHERE sub_start='{start_date}'"
            )

            try:
                milk_delivered = eval(cursor.fetchall()[0][0]).append(date)
            except:
                milk_delivered = [date]

            cursor.execute(
                f"UPDATE {self.user.wing}{self.user.houseno} SET milk_delivered='{milk_delivered}'"
            )

            con.commit()
            disconnect()
            return {"success": "MILK_DELIVER_SUCCESS"}
        except Exception as e:
            disconnect()
            return {"error": e}
