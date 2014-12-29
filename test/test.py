string_date = "2014-12-14 07:25:01.105000"

import datetime
print datetime.datetime.strptime(string_date, "%Y-%m-%d %H:%M:%S.%f")

import base64

val = base64.b64encode("test")

print val
print base64.b64decode(val)