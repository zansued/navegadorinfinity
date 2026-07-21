try {
    importScripts(
        "analytics.js",
        "interface/lib/supabase.js",
        "interface/lib/supabaseConfig.js",
        "interface/lib/apiHandler.js",
        "interface/lib/event.js",
        "interface/lib/nacl.js",
        "interface/lib/nacl-util.js",
        "interface/lib/browserDetector.js",
        "interface/lib/websocketHandler.js",
        "interface/lib/crypto.js",
        "interface/lib/genericCookieHandler.js",
        "background.js"
    );
    chrome.runtime.setUninstallURL("https://chromewebstore.google.com/detail/ogobpofhpaediomejphdlbljncngeggl/support", function() {
        if (chrome.runtime.lastError) {
            console.error("Error setting uninstall URL: " + chrome.runtime.lastError.message);
        } else {
            console.log("Uninstall URL set successfully");
        }
    });
} catch(e) {
    var errortext = JSON.stringify(e).toString();
    console.error(errortext);
}

function onSessionExpiry(e) {
    var r = e.name;
    console.log("dom alarm that triggered: " + r);
    chrome.storage.local.get(r, function(e) {
        if (e[r] && e[r].Duration !== "Owned") {
            deleteSession(r);
        }
    });
}

function deleteSession(e) {
    if (typeof clearInjectedTabsCacheForDomain === "function") {
        clearInjectedTabsCacheForDomain(e);
    }
    chrome.browsingData.remove(
        { origins: ["http://" + e, "https://" + e] },
        { cookies: true, localStorage: true },
        function() {
            chrome.storage.local.remove(e);
        }
    );
    chrome.alarms.clear(e);
}

chrome.alarms.onAlarm.addListener(onSessionExpiry);