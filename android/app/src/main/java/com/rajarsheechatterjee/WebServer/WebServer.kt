package com.rajarsheechatterjee.WebServer

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.rajarsheechatterjee.PluginManager.PluginContext
import java.io.IOException
import java.io.OutputStream
import java.net.InetSocketAddress


class WebServer(context: ReactApplicationContext) :
    ReactContextBaseJavaModule(context) {
    val plugins: MutableMap<String, PluginContext> = mutableMapOf()

    override fun getName(): String {
        return "WebServer"
    }

    @ReactMethod
    fun createWebServer(promise: Promise) {
        val server: HttpServer = HttpServer.create(InetSocketAddress(8000), 0)
        server.createContext("/test", MyHandler())
        server.setExecutor(null) // creates a default executor
        server.start()
    }

    class MyHandler : HttpHandler {
        @Throws(IOException::class)
        override fun handle(t: HttpExchange) {
            val response = "This is the response"
            t.sendResponseHeaders(200, response.length)
            val os: OutputStream = t.getResponseBody()
            os.write(response.toByteArray())
            os.close()
        }
    }
}