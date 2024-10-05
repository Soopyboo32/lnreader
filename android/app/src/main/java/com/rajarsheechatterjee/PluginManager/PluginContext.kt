package com.rajarsheechatterjee.PluginManager

import android.webkit.WebView
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactMethod

class PluginContext(val view: WebView) {
    fun eval(js: String, promise: Promise) {
        view.evaluateJavascript(js) {
            promise.resolve(it)
        }
    }
}
