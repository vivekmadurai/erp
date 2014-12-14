string_date = "2014-12-14 07:25:01.105000"

import datetime
print datetime.datetime.strptime(string_date, "%Y-%m-%d %H:%M:%S.%f")
