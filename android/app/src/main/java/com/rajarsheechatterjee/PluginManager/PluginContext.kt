package com.rajarsheechatterjee.PluginManager

import android.webkit.WebView
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactMethod
import java.util.UUID

class PluginContext(val view: WebView, val uuid: String = UUID.randomUUID().toString()) {
    @ReactMethod
    fun eval(js: String, promise: Promise) {
        view.evaluateJavascript(js) {
            println("Eval result: $it")
            promise.resolve(it)
        }
    }
}