package com.rajarsheechatterjee.WebServer.server

import kotlinx.coroutines.DelicateCoroutinesApi
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.ServerSocket
import java.net.Socket
import java.util.UUID


class HttpServer(
    val port: Int,
    var running: Boolean = false,
    val uuid: String = UUID.randomUUID().toString()
) {
    val onStopCbs = mutableListOf<() -> Unit>()

    fun start(handler: suspend (HttpRequest) -> HttpResponse) {
        if (running) return
        running = true
        @OptIn(DelicateCoroutinesApi::class)
        GlobalScope.launch {
            val socket = ServerSocket(port)

            while (running) {
                val s = socket.accept()

                launch {
                    s.use { clientSocket ->
                        handle(clientSocket, handler)
                    }
                }
            }

            socket.close()
            onStopCbs.forEach { it() }
            onStopCbs.clear()
        }
    }

    fun stop(onStop: () -> Unit) {
        onStopCbs.add(onStop)
        running = false
    }

    companion object {
        fun create(port: Int): HttpServer {
            return HttpServer(port)
        }

        private suspend fun handle(
            clientSocket: Socket,
            handler: suspend (HttpRequest) -> HttpResponse
        ) {
            val input = BufferedReader(InputStreamReader(withContext(Dispatchers.IO) {
                clientSocket.getInputStream()
            }))
            val output = withContext(Dispatchers.IO) {
                clientSocket.getOutputStream()
            }

            try {
                val firstLine = withContext(Dispatchers.IO) {
                    input.readLine()
                }
                val parts = firstLine?.split(" ") ?: emptyList()
                if (parts.size < 3) {
                    withContext(Dispatchers.IO) {
                        output.write("HTTP/1.1 400 Bad Request\r\n\r\n".toByteArray())
                        output.flush()
                    }
                    return
                }
                val method = parts[0]
                val path = parts[1]
                val httpVersion = parts[2]
                val headers = mutableMapOf<String, String>()
                while (true) {
                    val line = withContext(Dispatchers.IO) {
                        input.readLine()
                    }
                    if (line.isNullOrEmpty()) break
                    val header = line.split(": ")
                    if (header.size < 2) break
                    headers[header[0]] = header[1]
                }
                var body = ""
                if (headers["Content-Length"] != null) {
                    val contentLength = headers["Content-Length"]!!.toInt()
                    body = withContext(Dispatchers.IO) {
                        CharArray(contentLength).apply {
                            input.read(this)
                        }
                    }.joinToString("")
                }
                val request = HttpRequest(method, path, httpVersion, headers, body)

                val response = handler(request)

                withContext(Dispatchers.IO) {
                    output.write("HTTP/1.1 ${response.statusCode}\r\n".toByteArray())
                    for (header in response.headers) {
                        output.write("${header.key}: ${header.value}\r\n".toByteArray())
                    }
                    output.write("\r\n".toByteArray())
                    output.write(response.body.toByteArray())
                    output.flush()
                }
            } finally {
                withContext(Dispatchers.IO) {
                    input.close()
                    output.close()
                }
            }
        }
    }
}