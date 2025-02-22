package com.rajarsheechatterjee.WebServer.server

class HttpResponse {
    var body: String = ""
    var statusCode: String = "200 OK"
    val headers: MutableMap<String, String> = mutableMapOf()
}
