from datetime import datetime


def dateFromString(date: str):
    """
    Returns a datetime object from the String

    Parameters:
        date (str): The date as a String in the format YYYY-MM-DD

    Returns:
        datetime: The datetime object from the String
    """

    year = int(date[:4])
    month = int(date[5:7])
    try:
        day = int(date[8:])
    except:
        day = int(date[8:10])

    return datetime(year, month, day)


def dateFromInt(date: int):
    # 20230702
    dateString = str(date)
    year = int(dateString[:4])
    month = int(dateString[4:6])
    day = int(dateString[6:])
    return datetime(year, month, day)


def intFromDate(date: datetime):
    dateString = str(date.date())
    dateInt = int(dateString[:4] + dateString[5:7] + dateString[8:])
    return dateInt


def dateTimeFromString(date: str):
    year = int(date[:4])
    month = int(date[5:7])
    day = int(date[8:10])
    hours = int(date[11:13])
    minutes = int(date[14:16])
    seconds = int(date[17:19])
    return datetime(year, month, day, hours, minutes, seconds)


def sqlfyJSON(data):
    if type(data) is list:
        string = "JSON_ARRAY("

        if len(data) == 1:
            string += str(sqlfyJSON(data[0])) + ")"
            return string

        for i in range(len(data)):
            temp_data = str(sqlfyJSON(data[i]))
            if i == 0:
                string += temp_data
            else:
                string += ", " + temp_data

        string += ")"
        return string
    elif type(data) is dict:
        string = "JSON_OBJECT("

        for key, value in data.items():
            if string == "JSON_OBJECT(":
                string += f"'{key}', {sqlfyJSON(value)}"
            else:
                string += f", '{key}', {sqlfyJSON(value)}"

        string += ")"
        return string
    elif type(data) is bool:
        return 1 if data else 0
    elif type(data) is str:
        return f"'{data}'"
    else:
        return data
