import mysql.connector as connector

host = "bwqwqvenmbwqhzwutgu6-mysql.services.clever-cloud.com"
user = "u7bizpwgzah61bgv"
database = "bwqwqvenmbwqhzwutgu6"
password = "UKX0nnX3eNDTj86DEOTT"

con, cursor = None, None


def connect():
    global con
    global cursor

    con = connector.connect(host=host, user=user, password=password, database=database)

    cursor = con.cursor()


def disconnect():
    global con
    con.close()
