import mysql.connector as connector


# host = "bwqwqvenmbwqhzwutgu6-mysql.services.clever-cloud.com"
# user = "u7bizpwgzah61bgv"
# database = "bwqwqvenmbwqhzwutgu6"
# password = "UKX0nnX3eNDTj86DEOTT"

host = "localhost"
user = "root"
password = "Welcome@2000"
database = "milk_delivery"


def connect():
    con = connector.connect(host=host, user=user, password=password, database=database)
    return con


def disconnect(con):
    con.close()
