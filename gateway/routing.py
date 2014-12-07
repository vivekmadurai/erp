"""
mapper = {
    "/signin": "render_login",
    "/logout": "render_logout",
    "/":       "render_home",
    "/home":   "render_home",
    "/report": "render_report",
    "/product/list": "get_products",
}
"""
from routes import Mapper
mapper = Mapper()

mapper.connect("/", controller="main", action="render_home")
mapper.connect("/home", controller="main", action="render_home")
mapper.connect("/signin", controller="main", action="render_login")
mapper.connect("/logout", controller="main", action="render_logout")
mapper.connect("/report", controller="main", action="render_report")
mapper.connect("/{modelName}/list", controller="main", action="get_list")