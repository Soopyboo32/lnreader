package com.rajarsheechatterjee.WebServer

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.rajarsheechatterjee.WebServer.server.HttpResponse
import com.rajarsheechatterjee.WebServer.server.HttpServer
import kotlinx.coroutines.CompletableDeferred
import java.net.Inet4Address
import java.net.Inet6Address
import java.net.InetAddress
import java.net.NetworkInterface
import java.util.Collections
import java.util.Locale
import java.util.UUID


class WebServer(context: ReactApplicationContext) :
    ReactContextBaseJavaModule(context) {
    private val servers: MutableMap<String, HttpServer> = mutableMapOf()
    private val pendingRequests: MutableMap<String, CompletableDeferred<HttpResponse>> =
        mutableMapOf()

    override fun getName(): String {
        return "WebServer"
    }

    @ReactMethod
    fun createWebServer(port: Int, promise: Promise) {
        val server = HttpServer.create(port)
        server.start {
            val requestId = UUID.randomUUID().toString()
            val request = it
            val deferred = CompletableDeferred<HttpResponse>()
            pendingRequests[requestId] = deferred
            reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(
                    "HttpServerRequest", Arguments.createMap().apply {
                        putString("serverId", server.uuid)
                        putString("requestId", requestId)
                        putString("method", request.method)
                        putString("path", request.path)
                        putMap("headers", Arguments.createMap().apply {
                            for (header in request.headers) {
                                putString(header.key, header.value)
                            }
                        })
                        putString("body", request.body)
                    }
                )
            deferred.await()
        }
        servers[server.uuid] = server
        promise.resolve(server.uuid)
    }

    @ReactMethod
    fun respondToRequest(requestId: String, response: ReadableMap, promise: Promise) {
        val res = HttpResponse()
        res.body = response.getString("body") ?: ""
        if (response.hasKey("headers") && response.getType("headers") == ReadableType.Map) {
            for (header in response.getMap("headers")!!.entryIterator) {
                if (header.key == null || header.value == null || header.value !is String) continue
                res.headers[header.key] = header.value as String
            }
        }
        res.statusCode = response.getString("statusCode") ?: "500 Internal Server Error"
        pendingRequests[requestId]?.complete(res)
        promise.resolve(null)
    }

    @ReactMethod
    fun stopWebServer(id: String, promise: Promise) {
        servers.remove(id)?.stop {
            promise.resolve(null)
        }
    }

    @ReactMethod
    fun getLocalIpAddress(promise: Promise) {
        try {
            val interfaces: List<NetworkInterface> =
                Collections.list(NetworkInterface.getNetworkInterfaces())
            for (intf in interfaces) {
                val addrs: List<InetAddress> = Collections.list(intf.inetAddresses)
                for (addr in addrs) {
                    if (!addr.isLoopbackAddress) {
                        val sAddr = addr.hostAddress?.uppercase(Locale.getDefault())
                        val address = InetAddress.getByName(sAddr)
                        if (address is Inet6Address) {
                            // It's ipv6, ignore
                        } else if (address is Inet4Address) {
                            // It's ipv4, return
                            promise.resolve(sAddr)
                            return
                        }
                    }
                }
            }
        } catch (_: Exception) {
        }
        promise.resolve(null)
    }

    @ReactMethod
    fun addListener(eventName: String) {
    }

    @ReactMethod
    fun removeListeners(count: Int) {
    }
}