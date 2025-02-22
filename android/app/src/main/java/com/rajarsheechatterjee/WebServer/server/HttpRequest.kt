package com.rajarsheechatterjee.WebServer.server

class HttpRequest(val method: String, val path: String, val httpVersion: String, val headers: Map<String, String>, val body: String = "")
