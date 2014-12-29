from datetime import datetime, timedelta
import jinja2
import os

def humanize(now, otherdate=None, offset=None):
    if not otherdate:
        otherdate = datetime.now()
    if otherdate:
        dt = otherdate - now
        offset = dt.seconds + (dt.days * 60 * 60 * 24)
    if offset:
        delta_s = offset % 60
        offset /= 60
        delta_m = offset % 60
        offset /= 60
        delta_h = offset % 24
        offset /= 24
        delta_d = offset
    else:
        raise ValueError("Must supply otherdate or offset (from now)")

    if delta_d > 1:
        if delta_d > 6:
            date = now + timedelta(days=-delta_d, hours=-delta_h, minutes=-delta_m)
            return date.strftime('%A, %Y %B %m, %H:%I')
        else:
            wday = now + timedelta(days=-delta_d)
            return wday.strftime('%A')
    if delta_d == 1:
        return "Yesterday"
    if delta_h > 0:
        return "%dh%dm ago" % (delta_h, delta_m)
    if delta_m > 0:
        return "%dm%ds ago" % (delta_m, delta_s)
    else:
        return "%ds ago" % delta_s

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.join(os.path.dirname(__file__), '../templates')),
    extensions=['jinja2.ext.autoescape'])

JINJA_ENVIRONMENT.filters["humanize"] = humanize

def render_template(template, templateValues):
    template = JINJA_ENVIRONMENT.get_template(template)
    return template.render(templateValues)