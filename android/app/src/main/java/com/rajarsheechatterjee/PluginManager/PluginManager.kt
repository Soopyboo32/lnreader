package com.rajarsheechatterjee.PluginManager

import android.annotation.SuppressLint
import android.webkit.WebView
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.util.UUID


class PluginManager(context: ReactApplicationContext) :
    ReactContextBaseJavaModule(context) {
    val plugins: MutableMap<String, PluginContext> = mutableMapOf()

    override fun getName(): String {
        return "PluginManager"
    }

    @SuppressLint("SetJavaScriptEnabled")
    @ReactMethod
    fun createJsContext(promise: Promise) {
        this.reactApplicationContext.runOnUiQueueThread {
            val view = WebView(this.reactApplicationContext.applicationContext)
            view.loadUrl("https://soopy.dev")
            view.settings.javaScriptEnabled = true
            val contextId = UUID.randomUUID().toString()
            plugins[contextId] = PluginContext(view)
            promise.resolve(contextId)
        }
    }

    @ReactMethod
    fun eval(id: String, js: String, promise: Promise) {
        this.reactApplicationContext.runOnUiQueueThread {
            plugins[id]?.eval(js, promise)
        }
    }
}
