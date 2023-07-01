import mysql.connector as connector

host = "bwqwqvenmbwqhzwutgu6-mysql.services.clever-cloud.com"
user = "u7bizpwgzah61bgv"
database = "bwqwqvenmbwqhzwutgu6"
password = "UKX0nnX3eNDTj86DEOTT"

con = None


def connect():
    global con
    con = connector.connect(host=host, user=user, password=password, database=database)


async def disconnect():
    global con
    con.close()
