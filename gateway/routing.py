from routes import Mapper
mapper = Mapper()

mapper.connect("/", controller="main", action="render_home")
mapper.connect("/home", controller="main", action="render_home")
mapper.connect("/signin", controller="main", action="render_login")
mapper.connect("/logout", controller="main", action="render_logout")
mapper.connect("/report", controller="main", action="render_report")

mapper.connect("/{modelName}/list", controller="main", action="list")
mapper.connect("/{modelName}/list/p{pageNumber}/{pageCount}", controller="main", action="list")
mapper.connect("/{modelName}/report", controller="main", action="query")
mapper.connect("/{modelName}/import", controller="main", action="import_data", conditions=dict(method=['POST']))
mapper.connect("/{modelName}/export", controller="main", action="export_data")

mapper.connect("/{modelName}/create", controller="main", action="create", conditions=dict(method=['POST']))
mapper.connect("/{modelName}/{instanceId}/read", controller="main", action="read")
mapper.connect("/{modelName}/{instanceId}/update", controller="main", action="update", conditions=dict(method=['PUT']))
mapper.connect("/{modelName}/{instanceId}/delete", controller="main", action="delete", conditions=dict(method=['DELETE']))
