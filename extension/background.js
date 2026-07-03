const CLIENT_MODE = true; // Altere para false para o modo Admin/Normal
const AUTO_SPID = "inf_perfil_infintyai_cliente";

// Inicializa o modo cliente no storage local
try {
  chrome.storage.local.set({ client_mode: CLIENT_MODE });
} catch (e) {}

// Bloqueador de abas internas no modo cliente
if (CLIENT_MODE) {
  const blockTabs = (tabId, url) => {
    if (!url) return;
    const lowerUrl = url.toLowerCase().trim();
    if (
      lowerUrl.startsWith("chrome://") || 
      (lowerUrl.startsWith("chrome-extension://") && !lowerUrl.includes(chrome.runtime.id))
    ) {
      chrome.tabs.remove(tabId).catch(() => {});
    }
  };

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
      blockTabs(tabId, changeInfo.url);
    }
  });

  chrome.tabs.onCreated.addListener((tab) => {
    if (tab.url) {
      blockTabs(tab.id, tab.url);
    } else if (tab.pendingUrl) {
      blockTabs(tab.id, tab.pendingUrl);
    }
  });
}

const PROXY_HOST = "147.79.87.117";
const PROXY_PORT = 3128;
const PROXY_USER = "infinity";
const PROXY_PASS = "Session2026!";

// O controle de proxy e autenticação é gerenciado de forma nativa pelo Python.
// A extensão cuida apenas do sincronismo de cookies e websocket.
/*
if (CLIENT_MODE) {
  chrome.webRequest.onAuthRequired.addListener(
    function (details, callback) {
      console.log("onAuthRequired disparado! URL:", details.url, "isProxy:", details.isProxy);
      if (details.isProxy) {
        console.log("Fornecendo credenciais para o proxy...");
        callback({
          authCredentials: {
            username: PROXY_USER,
            password: PROXY_PASS
          }
        });
      } else {
        callback();
      }
    },
    { urls: ["<all_urls>"] },
    ["asyncBlocking"]
  );
}
*/

function logDebug(msg) {
  console.log(msg);
  for (let port = 9999; port < 10009; port++) {
    fetch(`http://127.0.0.1:${port}/log?msg=` + encodeURIComponent(msg)).catch(() => {});
  }
  
  // Gravação persistente no storage local para fácil depuração no painel do usuário
  try {
    const timestamp = new Date().toLocaleTimeString();
    const logLine = `[${timestamp}] ${msg}`;
    chrome.storage.local.get(["debug_logs"], function(data) {
      let logs = data.debug_logs || [];
      logs.push(logLine);
      if (logs.length > 250) {
        logs.shift(); // Limita o tamanho a 250 entradas
      }
      chrome.storage.local.set({ debug_logs: logs });
    });
  } catch (e) {
    // Silencia erros de storage em contextos inativos
  }
}

function updateProxyRules() {
  return; // Desativado para usar o proxy reverso local do Python
  if (!CLIENT_MODE) return;
  chrome.storage.local.get(null, function (items) {
    var domains = [];
    var reservedKeys = ["currentspid", "key", "secret", "accountsecret", "darkMode", "userPreferences", "seenReferralHighlight"];
    Object.keys(items).forEach(function (key) {
      if (!reservedKeys.includes(key) && !key.endsWith(".pending") && items[key] && items[key].Cookies) {
        domains.push(key);
      }
    });
    
    if (domains.length === 0) {
      chrome.proxy.settings.clear({ scope: "regular" }, function () {
        console.log("Proxy desativado (sem domínios ativos).");
      });
    } else {
      var pacScript = "function FindProxyForURL(url, host) {\\n" +
        "  var domains = " + JSON.stringify(domains) + ";\\n" +
        "  for (var i = 0; i < domains.length; i++) {\\n" +
        "    var d = domains[i];\\n" +
        "    if (host === d || dnsDomainIs(host, d)) {\\n" +
        "      return 'PROXY " + PROXY_HOST + ":" + PROXY_PORT + "';\\n" +
        "    }\\n" +
        "  }\\n" +
        "  return 'DIRECT';\\n" +
        "}";
      var config = {
        mode: "pac_script",
        pacScript: {
          data: pacScript
        }
      };
      chrome.proxy.settings.set({ value: config, scope: "regular" }, function () {
        console.log("Proxy configurado para os domínios:", JSON.stringify(domains));
      });
    }
  });
}

let apiHandler = new APIHandler(),
  browserDetector = new BrowserDetector(),
  websocketHandler = new WebSocketHandler(),
  cookieHandler = new GenericCookieHandler(),
  connections = {};
var currentSPID,
  key,
  secret,
  accountpassword,
  injectDomain,
  injectTabID,
  jwtToken,
  isAuthenticated = !1;
function initCrypto(n) {
  (key && secret && accountpassword && n(),
    chrome.storage.local.get(["key", "secret", "accountsecret"], function (e) {
      var r;
      if (null != e && null != e.key && null != e.secret && null != e.accountsecret) {
        key = nacl.util.decodeBase64(e.key);
        secret = nacl.util.decodeBase64(e.secret);
        accountpassword = (typeof AUTO_SPID !== 'undefined' && AUTO_SPID) ? ("inf_pwd_" + AUTO_SPID) : e.accountsecret;
        n();
      } else {
        e = generateKeyPair();
        key = e.publicKey;
        secret = e.secretKey;
        accountpassword = (typeof AUTO_SPID !== 'undefined' && AUTO_SPID) ? ("inf_pwd_" + AUTO_SPID) : generatePassword();
        r = nacl.util.encodeBase64(e.publicKey);
        e = nacl.util.encodeBase64(e.secretKey);
        chrome.storage.local.set(
          { key: r, secret: e, accountsecret: accountpassword },
          function () {
            n();
          },
        );
      }
    }));
}
function initSPID(r) {
  (currentSPID && r(),
    chrome.storage.local.get(["currentspid"], function (e) {
      null != e &&
        null != e.currentspid &&
        0 < e.currentspid.length &&
        ((currentSPID = e.currentspid), r());
    }));
}
function authenticateSPID(n) {
  var e = nacl.util.encodeBase64(key);
  apiHandler.callLogin(currentSPID, accountpassword, e, function (e, r) {
    e
      ? (handleErrorAndReportToGA(e, "An error occurred logging in"), n(e))
      : (console.log("Logged In Successfully"),
        (isAuthenticated = !0),
        (jwtToken = r.token),
        sendEventToGA("Infinity Claude_Login", {
          category: "Infinity Claude",
          action: "Login",
          user: currentSPID,
        }),
        n(null));
  });
}
function refreshToken() {
  null != jwtToken &&
    apiHandler.callRefresh(jwtToken, function (e, r) {
      e
        ? (handleErrorAndReportToGA(e, "Unable to refresh token"),
          websocketHandler.closeConnection())
        : (console.log("Token Successfully Refreshed"), (jwtToken = r.token));
    });
}
function openWebSocket() {
  // 1. Roda a busca inicial de sessões pendentes via REST HTTP imediatamente
  apiHandler.getPendingSessions(currentSPID, function (err, sessions) {
    if (err) {
      logDebug(`[Boot] Erro ao buscar sessoes pendentes do Supabase: ${String(err)}`);
      return;
    }
    if (sessions && sessions.length > 0) {
      logDebug(`[Boot] Encontradas ${sessions.length} sessoes pendentes no Supabase no boot.`);
      sessions.forEach((session) => {
        logDebug("[Boot] Sessão pendente recuperada de: " + session.sender + " para o dominio: " + session.domain);
        websocketHandler.emit(
          "session-received",
          session.sender,
          session.session_data,
          session.publickey,
        );
      });
    } else {
      logDebug(`[Boot] Nenhuma sessao pendente encontrada no Supabase para o SPID: ${currentSPID}`);
    }
  });

  // 2. Registra o escutador de sessões recebidas
  websocketHandler.on("session-received", function (s, e, r) {
    logDebug(`[WebSocket] Recebido evento session-received do emissor: ${s}`);
    receiveMessage(e, r, function (err, decryptedData) {
      var n, o, t, a;
      if (err || !decryptedData || decryptedData === "undefined") {
        logDebug(`[WebSocket] Falha ao descriptografar sessao do emissor ${s}: ${String(err || "Dados invalidos")}`);
        handleErrorAndReportToGA(err || "Decryption returned invalid data", "Unable to decrypt incoming session");
      } else {
        const colonIndex = decryptedData.indexOf(":");
        if (colonIndex === -1) {
          logDebug(`[WebSocket] Formato de sessao descriptografada invalido (falta delimitador): ${decryptedData}`);
          return;
        }
        n = decryptedData.substring(0, colonIndex);
        const jsonString = decryptedData.substring(colonIndex + 1);
        try {
          e = JSON.parse(jsonString);
          o = e.Duration;
        } catch (jsonErr) {
          logDebug(`[WebSocket] Erro de parse JSON na sessao descriptografada para o dominio ${n}: ${jsonErr.message}`);
          return;
        }
        t = n.replace(".pending", "");
        r = e.LogoURL;
        logDebug(`[WebSocket] Descriptografia bem-sucedida da sessao para o dominio: ${t}`);
        if (CLIENT_MODE) {
          chrome.storage.local.get([t], function(localData) {
            const currentLocal = localData[t];
            if (currentLocal) {
              const localStr = JSON.stringify({
                Cookies: currentLocal.Cookies,
                LocalStorage: currentLocal.LocalStorage,
                SessionStorage: currentLocal.SessionStorage
              });
              const newStr = JSON.stringify({
                Cookies: e.Cookies,
                LocalStorage: e.LocalStorage,
                SessionStorage: e.SessionStorage
              });
              if (localStr === newStr) {
                // Sessão idêntica, ignora para evitar reload infinito da aba
                return;
              }
            }

            e.Pending = !1;
            browserDetector.getApi().storage.local.set({ [t]: e }, function () {
              logDebug(`[WebSocket] Sessao do dominio ${t} salva com sucesso no storage local do Cliente.`);
              createDurationTimer(t, o);
              reloadIfTabExists(t);
              updateProxyRules();
              sendMessageToAllTabs("cookiesChanged", { cookie: null });
            });
            null != (e = e.b64Logo) && "undefined" != e
              ? ((null != (a = e) && "undefined" != a) ||
                  (a = "icons/Share-128.png"),
                chrome.notifications.create(t, {
                  type: "basic",
                  iconUrl: "icons/Share-128.png",
                  title: "SessionShare",
                  message: "Acesso à conta " + t + " foi atualizado!",
                  priority: 1,
                }))
              : null != r &&
                "undefined" != r &&
                logoToB64(r, function (e) {
                  ((null != (a = e) && "undefined" != a) ||
                    (a = "icons/Share-128.png"),
                    chrome.notifications.create(t, {
                      type: "basic",
                      iconUrl: "icons/Share-128.png",
                      title: "SessionShare",
                      message: "Acesso à conta " + t + " foi atualizado!",
                      priority: 1,
                    }));
                });
            addFriend(currentSPID, s, function (e) {
              e && handleErrorAndReportToGA(e, "Unable to add Friend");
            });
          });
        }
        } else {
          browserDetector.getApi().storage.local.set({ [n]: e });
          null != (e = e.b64Logo) && "undefined" != e
            ? ((null != (a = e) && "undefined" != a) ||
                (a = "icons/Share-128.png"),
              chrome.notifications.create(n, {
                type: "basic",
                iconUrl: "icons/Share-128.png",
                title: "Infinity Claude",
                message:
                  s +
                  chrome.i18n.getMessage("just_shared") +
                  t +
                  chrome.i18n.getMessage("with_you"),
                contextMessage:
                  chrome.i18n.getMessage("Would_you_like_to_accept_the") +
                  o +
                  chrome.i18n.getMessage("session_and_go_there_now"),
                priority: 2,
                buttons: [
                  {
                    title: chrome.i18n.getMessage("Take_me_there"),
                    iconUrl: a,
                  },
                  { title: chrome.i18n.getMessage("Check_it_out_later") },
                ],
              }))
            : null != r &&
              "undefined" != r &&
              logoToB64(r, function (e) {
                ((null != (a = e) && "undefined" != a) ||
                  (a = "icons/Share-128.png"),
                  chrome.notifications.create(n, {
                    type: "basic",
                    iconUrl: "icons/Share-128.png",
                    title: "Infinity Claude",
                    message:
                      s +
                      chrome.i18n.getMessage("just_shared") +
                      t +
                      chrome.i18n.getMessage("with_you"),
                    contextMessage:
                      chrome.i18n.getMessage(
                        "Would_you_like_to_accept_the",
                      ) +
                      o +
                      chrome.i18n.getMessage("session_and_go_there_now"),
                    priority: 2,
                    buttons: [
                      {
                        title: chrome.i18n.getMessage("Take_me_there"),
                        iconUrl: a,
                      },
                      {
                        title:
                          chrome.i18n.getMessage("Check_it_out_later"),
                      },
                    ],
                  }));
              });
          chrome.action.setBadgeText({ text: "💛" });
          addFriend(currentSPID, s, function (e) {
            e && handleErrorAndReportToGA(e, "Unable to add Friend");
          });
          sendEventToGA("Infinity Claude_ReceiveSession", {
            category: "Infinity Claude",
            action: "ReceiveSession",
            user: currentSPID,
          });
        }
      }
    });
  });

  websocketHandler.on("error", function (e) {
    console.warn("WebSocket Error in background:", e);
  });

  // 3. Tenta assinar o canal de tempo real, mas sem derrubar o fluxo HTTP
  websocketHandler.createConnection(jwtToken, function (e) {
    if (e) {
      console.warn("Realtime WebSocket connection failed. Using resilient polling fallback.");
    } else {
      console.log("Realtime WebSocket channel successfully subscribed.");
    }
  });
}
function registerSPID(n, e, r, o) {
  var t = nacl.util.encodeBase64(key);
  apiHandler.callRegister(n, accountpassword, t, e, r, function (e, r) {
    e
      ? (handleErrorAndReportToGA(e, "An error occurred for callRegister"),
        o(e))
      : browserDetector
          .getApi()
          .storage.local.set({ currentspid: n }, function () {
            ((currentSPID = n),
              authenticateSPID(function (e) {
                e
                  ? handleErrorAndReportToGA(
                      e,
                      "An error occurred for authenticateSPID",
                    )
                  : openWebSocket();
              }),
              o());
          });
  });
}
function sendSession(n, o, t, a, s) {
  n != currentSPID
    ? null != n &&
      (websocketHandler.getUserDetails(n),
      websocketHandler.once("userdetails-received", function (e, r) {
        r
          ? (handleErrorAndReportToGA(
              r,
              "An error occurred for userdetails-received",
            ),
            s(r))
          : ((r = nacl.util.decodeBase64(e)),
            (e = encryptMessage(o, r)),
            (r = nacl.util.encodeBase64(key)),
            websocketHandler.sendSession(n, e, r, t, a),
            addFriend(currentSPID, n, function (e) {
              e
                ? (handleErrorAndReportToGA(e, "Unable to add Friend"), s(e))
                : s(null);
            }));
      }))
    : s("You cannot Infinity Claude with yourself!");
}
function getFriends(e, n) {
  apiHandler.getFriends(e, function (e, r) {
    e
      ? (handleErrorAndReportToGA(e, "An error occurred retrieving friends"),
        n(e, null))
      : n(null, r);
  });
}
function getMutualFriends(e, n) {
  apiHandler.getMutualFriends(e, function (e, r) {
    e
      ? (handleErrorAndReportToGA(
          e,
          "An error occurred retrieving mutual friends",
        ),
        n(e, null))
      : n(null, r);
  });
}
function addFriend(e, r, n) {
  apiHandler.addFriend(e, r, function (e, r) {
    e
      ? (handleErrorAndReportToGA(e, "An error occurred for addFriend"), n(e))
      : n(null);
  });
}
function removeFriend(e, r, n) {
  apiHandler.removeFriend(e, r, function (e, r) {
    e
      ? (handleErrorAndReportToGA(e, "An error occurred for removeFriend"),
        n(e))
      : n(null);
  });
}
function signIn() {
  var n, o, t;
  return (
    browserDetector
      .getApi()
      .tabs.query({ active: !0, currentWindow: !0 }, function (e) {
        var r = new URL("https://" + injectDomain);
        browserDetector.getApi().storage.local.get(injectDomain, function (e) {
          ((n = e[injectDomain]),
            !!n
              ? (({ Cookies: n, LocalStorage: o, SessionStorage: t } = n),
                Array.isArray(n)
                  ? (n.forEach((e) => {
                      ((e.storeId = "0"),
                        cookieHandler.saveCookie(
                          e,
                          r.toString(),
                          function (e, r) {
                            e &&
                              handleErrorAndReportToGA(
                                e,
                                "Sorry, either your access has been revoked or this is an unsupported website.",
                              );
                          },
                        ));
                    }),
                    chrome.scripting
                      .executeScript({
                        target: { tabId: injectTabID.id, allFrames: !0 },
                        func: (e, r) => {
                          (localStorage.clear(),
                            Object.entries(JSON.parse(e)).forEach(([e, r]) => {
                              localStorage.setItem(e, r);
                            }),
                            sessionStorage.clear(),
                            Object.entries(JSON.parse(r)).forEach(([e, r]) => {
                              sessionStorage.setItem(e, r);
                            }),
                            console.error("Error loading session"));
                        },
                        args: [JSON.stringify(o), JSON.stringify(t)],
                      })
                      .then(() => {
                        (console.log("Session loaded"),
                          checkLogoSource(injectDomain),
                          chrome.tabs.update(injectTabID.id, { active: !0 }),
                          chrome.tabs.reload(injectTabID.id));
                      }))
                  : handleErrorAndReportToGA(
                      null,
                      "Oops, something went wrong... please tell us this error occurred!",
                    ))
              : handleErrorAndReportToGA(
                  null,
                  "You do not have approved access for this website.",
                ));
        });
      }),
    !1
  );
}
function receiveMessage(e, r, n) {
  try {
    e = JSON.parse(e);
    const decrypted = decryptMessage(e, r);
    if (!decrypted) {
      n("Decryption failed (invalid key or ciphertext)", null);
    } else {
      n(null, decrypted);
    }
  } catch (err) {
    n("Encryption Error. Unable to decrypt or parse incoming message: " + err.message, null);
  }
}
function reconnectWebSocket() {
  websocketHandler.isConnected() ||
    ((jwtToken = null),
    console.log("Reconnecting.."),
    authenticateSPID(function (e) {
      e || openWebSocket();
    }));
}
function handleMessage(e, r, t) {
  switch ((console.log("message received: " + (e.type || "unknown")), e.type)) {
    case "ping":
      return (t("pong"), !1);
    case "getTabs":
      return (
        browserDetector.getApi().tabs.query({}, function (e) {
          t(e);
        }),
        !0
      );
    case "getCurrentTab":
      return (
        browserDetector
          .getApi()
          .tabs.query({ active: !0, currentWindow: !0 }, function (e) {
            t(e);
          }),
        !0
      );
    case "onTabsCreated":
      return (
        (injectDomain = e.params.domain),
        (injectType = e.params.source),
        (injectTabID = e.params.tabId),
        "loading" == injectType
          ? browserDetector
              .getApi()
              .tabs.onUpdated.addListener(onTabsCreatedLoading)
          : browserDetector
              .getApi()
              .tabs.onUpdated.addListener(onTabsCreatedComplete),
        !0
      );
    case "getAllCookies":
      var n = { url: e.params.url };
      return (
        browserDetector.isFirefox()
          ? browserDetector.getApi().cookies.getAll(n).then(t)
          : browserDetector.getApi().cookies.getAll(n, t),
        !0
      );
    case "saveCookie":
      return (
        browserDetector.isFirefox()
          ? browserDetector
              .getApi()
              .cookies.set(e.params.cookie)
              .then(
                (e) => {
                  t(null, e);
                },
                (e) => {
                  (console.error("Failed to create cookie", e),
                    t(e.message, null));
                },
              )
          : browserDetector.getApi().cookies.set(e.params.cookie, (e) => {
              var r;
              e
                ? t(null, e)
                : ((r = browserDetector.getApi().runtime.lastError),
                  console.error("Failed to create cookie", r),
                  t(r.message, e));
            }),
        !0
      );
    case "createTimer":
      return (
        createDurationTimer(e.params.domTimer, (l = e.params.duration)),
        !0
      );
    case "deleteSession":
      return (deleteSession(e.params.dom), !0);
    case "removeCookie":
      n = { name: e.params.name, url: e.params.url };
      return (
        browserDetector.isFirefox()
          ? browserDetector.getApi().cookies.remove(n).then(t)
          : browserDetector.getApi().cookies.remove(n, t),
        !0
      );
    case "registerSPID":
      var o = e.params.spid,
        n = e.params.email || null,
        a = e.params.referredBy || null;
      return (
        console.log(
          "Register request received:",
          o,
          "Email:",
          n,
          "ReferredBy:",
          a,
        ),
        null != o && null != n
          ? registerSPID(o, n, a, function (e) {
              e
                ? (console.error("RegisterSPID failed:", e), t(e))
                : (console.log("SPID Registered Successfully for:", o),
                  t("SPID Registered Successfully"),
                  sendEventToGA("Infinity Claude_Register", {
                    category: "Infinity Claude",
                    action: "Register",
                    user: currentSPID,
                  }));
            })
          : (console.log("spid/email missing, request was:", e),
            t("Missing SPID or email")),
        !0
      );
    case "recoverRequest":
      n = e.params.email;
      return (
        n
          ? apiHandler.callRecoverRequest(n, function (e, r) {
              t(e ? { success: !1, error: e } : { success: !0 });
            })
          : t({ success: !1, error: "Email is required" }),
        !0
      );
    case "recoverVerify":
      ((a = e.params.email), (n = e.params.code));
      return (
        a && n
          ? apiHandler.callRecoverVerify(a, n, function (e, r) {
              t(
                e
                  ? { success: !1, error: e }
                  : {
                      success: !0,
                      username: r.username,
                      recoveryToken: r.recoveryToken,
                    },
              );
            })
          : t({ success: !1, error: "Email and code are required" }),
        !0
      );
    case "recoverComplete":
      var s,
        c,
        i = e.params.username,
        a = e.params.recoveryToken;
      return (
        i && a
          ? ((n = generateKeyPair()),
            (key = n.publicKey),
            (secret = n.secretKey),
            (accountpassword = generatePassword()),
            (s = nacl.util.encodeBase64(n.publicKey)),
            (c = nacl.util.encodeBase64(n.secretKey)),
            apiHandler.callRecoverComplete(
              a,
              accountpassword,
              s,
              function (e, r) {
                e
                  ? t({ success: !1, error: e })
                  : chrome.storage.local.set(
                      {
                        key: s,
                        secret: c,
                        accountsecret: accountpassword,
                        currentspid: i,
                      },
                      function () {
                        ((currentSPID = i),
                          authenticateSPID(function (e) {
                            e || openWebSocket();
                          }),
                          t({ success: !0, username: i }));
                      },
                    );
              },
            ))
          : t({ success: !1, error: "Recovery token is required" }),
        !0
      );
    case "sendSession":
      var n = e.params.session,
        a = e.params.sendto,
        u = e.params.domain,
        l = getDuration(e.params.duration);
      return (
        null != n &&
          null != a &&
          sendSession(a, n, u, l, function (e) {
            e
              ? t(e)
              : (t(null),
                sendEventToGA("Infinity Claude_SendSession", {
                  category: "Infinity Claude",
                  action: "SendSession",
                  user: currentSPID,
                }));
          }),
        !0
      );
    case "retrievePresence":
      a = e.params.spid;
      return (
        null != a &&
          a != currentSPID &&
          (websocketHandler.getPresenceForSPID(a),
          websocketHandler.on("presence-received", function (e) {
            t(e);
          })),
        !0
      );
    case "getFriends":
      return (
        (function n(o = 0) {
          getFriends(currentSPID, function (e, r) {
            e
              ? (console.log("An error occurred retrieving friends:", e),
                o < 3
                  ? (console.log("Retrying... Attempt " + (o + 1)),
                    setTimeout(() => {
                      n(o + 1);
                    }, 500))
                  : (handleErrorAndReportToGA(
                      e,
                      "An error occurred retrieving friends.",
                    ),
                    t(null)))
              : t(r);
          });
        })(),
        !0
      );
    case "getMutualFriends":
      return (
        (function n(o = 0) {
          getMutualFriends(currentSPID, function (e, r) {
            e
              ? (console.log("An error occurred retrieving mutual friends:", e),
                o < 3
                  ? (console.log("Retrying... Attempt " + (o + 1)),
                    setTimeout(() => {
                      n(o + 1);
                    }, 500))
                  : (handleErrorAndReportToGA(
                      e,
                      "An error occurred retrieving mutual friends.",
                    ),
                    t(null)))
              : t(r);
          });
        })(),
        !0
      );
    case "addFriend":
      var d = e.params.friendspid;
      return (
        addFriend(currentSPID, d, function (e) {
          e
            ? (handleErrorAndReportToGA(e, "An error occurred adding friend."),
              t(e))
            : t(null);
        }),
        !0
      );
    case "removeFriend":
      d = e.params.friendspid;
      return (
        removeFriend(currentSPID, d, function (e) {
          e
            ? (handleErrorAndReportToGA(
                e,
                "An error occurred removing friend.",
              ),
              t(e))
            : t(null);
        }),
        !0
      );
    case "imageToB64":
      return (checkLogoSource(e.params.domain), !0);
    case "userPreferences":
      n = e.params.userPreferences;
      return (
        saveUserPreferences(currentSPID, n, function (e) {
          e
            ? (handleErrorAndReportToGA(
                e,
                "An error occurred savings your preference.",
              ),
              t(e))
            : t(null);
        }),
        !0
      );
    case "subscriptionPayment":
      return !0;
    case "getPaidStatus":
      return (t(!0), !0);
  }
}
function sendMessageToTab(e, r, n) {
  e in connections && connections[e].postMessage({ type: r, data: n });
}
function sendMessageToAllTabs(e, r) {
  var n = Object.keys(connections);
  let o = 0;
  for (var t = n.length; o < t; o++) sendMessageToTab(n[o], e, r);
}
function onCookiesChanged(e) {
  sendMessageToAllTabs("cookiesChanged", e);
}

// Rastreamento de abas já injetadas para evitar loops infinitos de recarregamento no modo Cliente
let injectedTabs = {};

function onTabsChanged(tabId, changeInfo, tab) {
  sendMessageToTab(tabId, "tabsChanged", changeInfo);
  
  // Auto-injeção ativa de cookies para manter o login persistente ao reabrir o Chrome
  if (CLIENT_MODE && (changeInfo.status === "loading" || changeInfo.url)) {
    const urlString = changeInfo.url || (tab && tab.url);
    if (urlString && (urlString.startsWith("http://") || urlString.startsWith("https://"))) {
      try {
        const urlObj = new URL(urlString);
        const domain = urlObj.hostname;
        
        // Evita reinjetar se já foi feito para esta aba e domínio nesta navegação
        const cacheKey = `${tabId}:${domain}`;
        if (injectedTabs[cacheKey]) {
          return;
        }
        
        // Se temos cookies salvos localmente para esse domínio, injeta síncrono
        chrome.storage.local.get(domain, function(data) {
          if (data && data[domain]) {
            injectedTabs[cacheKey] = true;
            injectCookiesForDomain(domain, tabId);
          }
        });
      } catch(e) {
        // Silencia erros de parse de URL
      }
    }
  }
}

// Limpa o cache quando a aba é fechada
chrome.tabs.onRemoved.addListener((tabId) => {
  Object.keys(injectedTabs).forEach((key) => {
    if (key.startsWith(`${tabId}:`)) {
      delete injectedTabs[key];
    }
  });
});

function injectCookiesForDomain(domain, tabId) {
  chrome.storage.local.get(domain, function(data) {
    const session = data[domain];
    if (!session || !session.Cookies) return;
    
    // 1. Lê os cookies atuais do navegador antes de qualquer limpeza para comparar
    chrome.cookies.getAll({ domain: domain }, (oldCookies) => {
      // Procura cookies de sessão ou autenticação principais para ver se a sessão já está ativa
      const sessionKeys = ["PHPSESSID", "session", "mzp_gate", "cf_clearance", "id", "login", "cdn-webmastern"];
      let sessionMatches = false;
      
      for (let key of sessionKeys) {
        const savedCookie = session.Cookies.find(c => c.name === key);
        const activeCookie = (oldCookies || []).find(c => c.name === key);
        if (savedCookie && activeCookie && savedCookie.value === activeCookie.value) {
          sessionMatches = true;
          break; // O cookie de sessão chave é igual, assume que o login já está ativo
        }
      }
      
      if (sessionMatches) {
        logDebug(`[AutoInject] Cookies do dominio ${domain} ja correspondem a sessao logada no navegador. Pulando injeção.`);
        return;
      }
      
      logDebug(`[AutoInject] Iniciando injeção limpa de cookies para: ${domain}`);
      
      // 2. Limpa cookies antigos do domínio e domínios relacionados (ex: Ninja Hub)
      const domainsToClear = [domain];
      if (domain.includes("ninjabrhub.io")) {
        domainsToClear.push("ninjabrhub.online");
      }
      
      let deletePromises = [];
      let pendingClears = domainsToClear.length;
      
      domainsToClear.forEach(dom => {
        chrome.cookies.getAll({ domain: dom }, (cookiesToDel) => {
          // Evita erro unchecked no console se a chamada falhar
          if (chrome.runtime.lastError) {
            logDebug(`[AutoInject] Erro ao ler cookies antigos de ${dom}: ${chrome.runtime.lastError.message}`);
          }
          if (cookiesToDel && cookiesToDel.length > 0) {
            cookiesToDel.forEach(cookie => {
              deletePromises.push(new Promise((resolve) => {
                const removeUrl = `https://${cookie.domain.startsWith(".") ? cookie.domain.substring(1) : cookie.domain}${cookie.path}`;
                chrome.cookies.remove({ url: removeUrl, name: cookie.name }, () => {
                  // Evita erro unchecked no console se a remoção falhar
                  if (chrome.runtime.lastError) {
                    // Silencioso
                  }
                  resolve();
                });
              }));
            });
          }
          pendingClears--;
          if (pendingClears === 0) {
            Promise.all(deletePromises).then(() => {
              performInjection();
            });
          }
        });
      });
      
      function performInjection() {
        logDebug(`[AutoInject] Cookies antigos limpos. Injetando ${session.Cookies.length} novos cookies...`);
        
        // 2. Injeta os novos cookies
        let pendingCount = session.Cookies.length;
        if (pendingCount === 0) return;
        
        session.Cookies.forEach(cookie => {
          let cookieDomain = cookie.domain;
          if (cookieDomain.startsWith(".")) {
            cookieDomain = cookieDomain.substring(1);
          }
          
          const newCookie = {
            url: `https://${cookieDomain}${cookie.path || "/"}`,
            name: cookie.name,
            value: cookie.value,
            path: cookie.path,
            secure: cookie.secure,
            httpOnly: cookie.httpOnly
          };
          
          // Se não for hostOnly, define o domínio
          if (!cookie.hostOnly && cookie.domain) {
            newCookie.domain = cookie.domain;
          }
          
          if (cookie.expirationDate) {
            newCookie.expirationDate = cookie.expirationDate;
          }
          
          if (cookie.sameSite) {
            newCookie.sameSite = cookie.sameSite;
            if (cookie.sameSite === "no_restriction") {
              newCookie.secure = true;
            }
          }
          
          chrome.cookies.set(newCookie, (res) => {
            if (chrome.runtime.lastError) {
              logDebug(`[AutoInject] Falha ao injetar cookie: ${cookie.name} - Erro: ${chrome.runtime.lastError.message}`);
            }
            pendingCount--;
            if (pendingCount === 0) {
              logDebug("[AutoInject] Todos os cookies novos foram injetados com sucesso!");
              
              // 3. Recarrega a aba para aplicar a nova sessão injetada e efetuar o login automático
              logDebug("[AutoInject] Recarregando aba para aplicar login...");
              chrome.tabs.reload(tabId);
            }
          });
        });
      }
    });
    
    // 4. Injeta LocalStorage e SessionStorage se existirem
    if ((session.LocalStorage && Object.keys(session.LocalStorage).length > 0) ||
        (session.SessionStorage && Object.keys(session.SessionStorage).length > 0)) {
      try {
        chrome.scripting.executeScript({
          target: { tabId: tabId, allFrames: true },
          func: (localData, sessionData) => {
            try {
              if (localData) {
                Object.entries(JSON.parse(localData)).forEach(([k, v]) => {
                  localStorage.setItem(k, v);
                });
              }
              if (sessionData) {
                Object.entries(JSON.parse(sessionData)).forEach(([k, v]) => {
                  sessionStorage.setItem(k, v);
                });
              }
            } catch (e) {
              console.warn("Erro ao injetar storages na aba:", e);
            }
          },
          args: [JSON.stringify(session.LocalStorage || {}), JSON.stringify(session.SessionStorage || {})]
        }).catch((err) => {
          // Silencia erros de injeção em páginas restritas
        });
      } catch (e) {
        // Silencia erros
      }
    }
  });
}
function onTabsCreatedComplete(e, r, n) {
  "complete" === r.status &&
    (signIn(),
    browserDetector
      .getApi()
      .tabs.onUpdated.removeListener(onTabsCreatedComplete));
}
function onTabsCreatedLoading(e, r, n) {
  "loading" === r.status &&
    (signIn(),
    browserDetector
      .getApi()
      .tabs.onUpdated.removeListener(onTabsCreatedLoading));
}
function getDuration(e) {
  var r = 0;
  switch (e) {
    case "4h":
      r = 240;
      break;
    case "1d":
      r = 1440;
      break;
    case "7d":
      r = 10080;
      break;
    case "2w":
      r = 20160;
      break;
    case "1M":
      r = 43800;
      break;
    case "3M":
      r = 131400;
      break;
    case "6M":
      r = 262800;
      break;
    case "1Y":
      r = 525960;
  }
  return r;
}
function createDurationTimer(e, r) {
  r = getDuration(r);
  0 < r && chrome.alarms.create(e, { delayInMinutes: r });
}
function deleteSession(e) {
  (chrome.browsingData.remove(
    { origins: ["http://" + e, "https://" + e] },
    { cookies: !0, localStorage: !0 },
    function () {
      chrome.storage.local.remove(e, function () {
        updateProxyRules();
      });
    },
  ),
    chrome.alarms.clear(e),
    reloadIfTabExists(e));
}
function reloadIfTabExists(r) {
  ((r = r.toLowerCase()),
    chrome.tabs.query({}, function (e) {
      e.forEach(function (e) {
        e.url && e.url.toLowerCase().includes(r) && chrome.tabs.reload(e.id);
      });
    }));
}
function isArray(e) {
  return e && "object" == typeof e && e.constructor === Array;
}
function isFirefoxAndroid(r) {
  return browserDetector.isFirefox()
    ? browserDetector
        .getApi()
        .runtime.getPlatformInfo()
        .then((e) => {
          r("android" === e.os);
        })
    : r(!1);
}
function logoToB64(e, n) {
  fetch(e)
    .then((e) => e.blob())
    .then((e) => {
      var r = new FileReader();
      ((r.onloadend = function () {
        var e = r.result;
        n(e);
      }),
        r.readAsDataURL(e));
    })
    .catch((e) => console.warn("Logo fetch failed (using default icon):", e.message || e));
}
function checkLogoSource(n) {
  setTimeout(function () {
    chrome.storage.local.get(n, function (e) {
      var r = e[n];
      void 0 === r ||
        (null != (e = r.b64Logo) && "undefined" != e && "" != e) ||
        logoToB64(r.LogoURL, function (e) {
          (console.log("b64 logo created"),
            (r.b64Logo = e),
            chrome.storage.local.set({ [n]: r }));
        });
    });
  }, 7e3);
}
function saveUserPreferences(e, r, n) {
  apiHandler.savePreferences(e, r, function (e, r) {
    n(e || null);
  });
}
function saveSubscription(e, r, n) {
  apiHandler.saveSubscription(e, r, function (e, r) {
    n(e || null);
  });
}
function initUserPreferences() {
  chrome.storage.local.get(["userPreferences"], function (e) {
    var r = e.userPreferences,
      e = JSON.parse(
        '{ "darkMode": false, "receiveSessionFrom": 0, "offlineSharing": 0, "offlineSharingTutorial": 0, "appearOnForYou": 0, "paidUser": 1, "groupSharing": 0}',
      ),
      n = {};
    (void 0 !== r
      ? [
          "darkMode",
          "receiveSessionFrom",
          "offlineSharing",
          "offlineSharingTutorial",
          "appearOnForYou",
          "paidUser",
          "groupSharing",
        ].forEach(function (e) {
          r.hasOwnProperty(e) ? (n[e] = r[e]) : (n[e] = userPreferenceReset(e));
        })
      : (n = e),
      chrome.storage.local.set({ userPreferences: n }));
  });
}
function userPreferenceReset(e) {
  switch (e) {
    case "appearOnForYou":
    case "receiveSessionFrom":
    case "offlineSharing":
    case "offlineSharingTutorial":
      r = 0;
      break;
    case "darkMode":
    case "paidUser":
      r = !1;
      break;
    case "groupSharing":
      var r = 0;
  }
  return r;
}
async function handleErrorAndReportToGA(e, r = 0) {}
(chrome.notifications.onButtonClicked.addListener(function (e, r) {
  var n;
  0 == r &&
    ((injectDomain = (n = e).replace(".pending", "")),
    chrome.tabs.create({ url: "https://" + injectDomain }),
    chrome.storage.local.get(n, function (e) {
      var r;
      null != e[n] &&
        ([
          "app.grammarly.com",
          "play.stan.com.au",
          "classroom.udacity.com",
        ].includes(injectDomain)
          ? browserDetector
              .getApi()
              .tabs.onUpdated.addListener(onTabsCreatedLoading)
          : browserDetector
              .getApi()
              .tabs.onUpdated.addListener(onTabsCreatedComplete),
        (r = e[n].Duration),
        createDurationTimer(injectDomain, r),
        ((r = e[n]).Pending = !1),
        chrome.storage.local.set({ [injectDomain]: r }),
        chrome.storage.local.remove(n));
    }),
    chrome.action.setBadgeText({ text: "" }));
}),
  initCrypto(function () {
    chrome.storage.local.get(["currentspid"], function (data) {
      const savedSPID = data.currentspid;
      if (typeof AUTO_SPID !== 'undefined' && AUTO_SPID) {
        currentSPID = AUTO_SPID;
        logDebug(`[AutoSPID] Inicializando com AUTO_SPID: ${currentSPID}`);
        chrome.storage.local.set({ currentspid: AUTO_SPID }, function() {
          authenticateSPID(function (err) {
            if (err) {
              logDebug(`[AutoSPID] Falha de login para ${currentSPID}: ${String(err)}. Registrando...`);
              registerSPID(currentSPID, currentSPID + "@infinityclient.pro", null, function(regErr) {
                if (!regErr) {
                  logDebug(`[AutoSPID] Registrado e iniciando openWebSocket para ${currentSPID}`);
                  openWebSocket();
                } else {
                  logDebug(`[AutoSPID] Falha critica ao registrar SPID no Supabase: ${regErr}`);
                }
              });
            } else {
              logDebug(`[AutoSPID] SPID autenticado com sucesso: ${currentSPID}`);
              openWebSocket();
            }
          });
        });
      } else {
        initSPID(function (e) {
          if (!e && currentSPID) {
            authenticateSPID(function (err) {
              if (err) {
                logDebug(`[AutoSPID] Falha de login para ${currentSPID}: ${String(err)}. Registrando...`);
                registerSPID(currentSPID, currentSPID + "@infinityclient.pro", null, function(regErr) {
                  if (!regErr) openWebSocket();
                });
              } else {
                openWebSocket();
              }
            });
          } else {
            logDebug("[AutoSPID] Sem SPID inicializado ou erro no InitSPID");
          }
        });
      }
    });
  }),
  chrome.runtime.onMessage.addListener(handleMessage),
  chrome.tabs.onUpdated.addListener(onTabsChanged),
  browserDetector.isEdge() ||
    browserDetector.getApi().cookies.onChanged.addListener(onCookiesChanged),
  browserDetector.isEdge() ||
    browserDetector.getApi().cookies.onChanged.addListener(onCookiesChanged),
  isFirefoxAndroid(function (e) {
    var r = {};
    ((r.popup = e
      ? "/interface/popup-android/popup.html"
      : "/interface/popup/popup.html"),
      browserDetector.getApi().action.setPopup(r));
  }),
  initUserPreferences(),
  chrome.runtime.onUpdateAvailable.addListener(function (e) {
    chrome.runtime.reload();
  }),
  chrome.runtime.onMessage.addListener((e, r, n) => {
    if ("getLeaderboard" === e.type)
      return (
        apiHandler.getLeaderboard((e, r) => {
          n(
            e
              ? { success: !1, error: e.message || String(e) }
              : { success: !0, leaderboard: r },
          );
        }),
        !0
      );
  }));

updateProxyRules();

// --- INÍCIO DA ROTINA DE AUTO-SALVAMENTO AUTOMÁTICO PARA ADMINISTRADOR ---
let lastSavedSessionHashes = {};

async function startAdminAutoSave() {
  if (CLIENT_MODE) {
    logDebug("[AutoSave] Modo Cliente ativo. Auto-salvamento desativado.");
    return;
  }
  
  logDebug("[AutoSave] Iniciando rotina de auto-salvamento do Administrador...");
  
  setInterval(async () => {
    try {
      // 1. Validar se o SPID e as chaves de criptografia estão prontos
      if (!currentSPID || !key || !isAuthenticated) {
        return;
      }
      
      // 2. Localizar abas ativas para capturar domínios válidos
      chrome.tabs.query({ active: true }, async (tabs) => {
        if (!tabs || tabs.length === 0) return;
        
        for (let tab of tabs) {
          if (!tab.url) continue;
          
          try {
            const urlObj = new URL(tab.url);
            const domain = urlObj.hostname;
            
            // Ignorar páginas do sistema do navegador
            if (domain.startsWith("chrome") || domain.startsWith("about") || domain.startsWith("extensions")) {
              continue;
            }
            
            // 3. Capturar todos os cookies do domínio e domínios relacionados (ex: Ninja Hub)
            const domainsToCapture = [domain];
            if (domain.includes("ninjabrhub.io")) {
              domainsToCapture.push("ninjabrhub.online");
            } else if (domain.includes("toolzbuy.com")) {
              domainsToCapture.push("app.toolzbuy.com");
              domainsToCapture.push("extension.toolzbuy.com");
            }
            
            let allCapturedCookies = [];
            let pendingDomains = domainsToCapture.length;
            
            domainsToCapture.forEach(dom => {
              chrome.cookies.getAll({ domain: dom }, async (cookies) => {
                // Evita erro unchecked no console se a chamada falhar
                if (chrome.runtime.lastError) {
                  logDebug(`[AutoSave] Erro ao obter cookies de ${dom}: ${chrome.runtime.lastError.message}`);
                }
                if (cookies && cookies.length > 0) {
                  cookies.forEach(c => {
                    if (!allCapturedCookies.find(ac => ac.name === c.name && ac.domain === c.domain)) {
                      allCapturedCookies.push(c);
                    }
                  });
                }
                pendingDomains--;
                if (pendingDomains === 0) {
                  performAutoSave(allCapturedCookies);
                }
              });
            });
            
            async function performAutoSave(cookies) {
              if (!cookies || cookies.length === 0) return;
              
              // 4. Capturar LocalStorage e SessionStorage via injeção rápida de script
              let localStorageData = {};
              let sessionStorageData = {};
              
              try {
                const results = await chrome.scripting.executeScript({
                  target: { tabId: tab.id },
                  func: () => {
                    return {
                      localStorage: JSON.stringify(localStorage),
                      sessionStorage: JSON.stringify(sessionStorage)
                    };
                  }
                });
                
                if (results && results[0] && results[0].result) {
                  localStorageData = JSON.parse(results[0].result.localStorage || "{}");
                  sessionStorageData = JSON.parse(results[0].result.sessionStorage || "{}");
                }
              } catch (e) {
                // Silencia erros de injeção em páginas restritas (ex: login de terceiros, iframe)
              }
              
              // 5. Montar estrutura da sessão
              const sessionObj = {
                Cookies: cookies,
                LocalStorage: localStorageData,
                SessionStorage: sessionStorageData,
                Duration: "1Y",
                LogoURL: "",
                b64Logo: ""
              };
              
              const sessionString = domain + ":" + JSON.stringify(sessionObj);
              
              // 6. Evitar envios redundantes usando hash/comparação de string
              if (lastSavedSessionHashes[domain] === sessionString) {
                return; // Dados idênticos aos já enviados anteriormente, ignora.
              }
              
              // 7. Criptografar com a chave pública local
              const encryptedMessage = encryptMessage(sessionString, key);
              const pubKeyB64 = nacl.util.encodeBase64(key);
              
              // 8. Enviar direto ao Supabase para a ID do perfil correspondente
              logDebug(`[AutoSave] Enviando sessão atualizada para o domínio: ${domain} (SPID: ${currentSPID})`);
              await websocketHandler.sendSession(currentSPID, encryptedMessage, pubKeyB64, domain, 525960);
              
              // Salva no cache local para a próxima comparação
              lastSavedSessionHashes[domain] = sessionString;

              // 9. Exibe aviso visual para o administrador saber que sincronizou
              try {
                chrome.notifications.create(`sync_${domain}_${Date.now()}`, {
                  type: "basic",
                  iconUrl: "icons/Share-128.png",
                  title: "Navegador Infinity AI",
                  message: `Sessão do domínio ${domain} sincronizada com sucesso no banco de dados!`,
                  priority: 1
                });
              } catch (notifErr) {
                logDebug(`[AutoSave] Erro ao criar notificação visual: ${notifErr.message}`);
              }
            }
          } catch (err) {
            logDebug(`[AutoSave] Erro de URL na aba: ${err.message}`);
          }
        }
      });
    } catch (e) {
      logDebug(`[AutoSave] Erro na rotina de auto-salvamento: ${e.message}`);
    }
  }, 8000); // Executa a verificação a cada 8 segundos
}

// Inicia após garantir a inicialização das chaves e SPID
setTimeout(startAdminAutoSave, 5000);
// --- FIM DA ROTINA DE AUTO-SALVAMENTO AUTOMÁTICO PARA ADMINISTRADOR ---

// --- INÍCIO DA ROTINA DE POLLING DE BACKUP RESILIENTE PARA CLIENTE ---
if (CLIENT_MODE) {
  console.log("Iniciando rotina de polling de backup para Cliente...");
  setInterval(() => {
    if (!currentSPID || !isAuthenticated) return;
    
    apiHandler.getPendingSessions(currentSPID, function (err, sessions) {
      if (!err && sessions && sessions.length > 0) {
        sessions.forEach((session) => {
          console.log("[ResilientPolling] Sessão pendente recuperada via HTTP:", session.sender);
          websocketHandler.emit(
            "session-received",
            session.sender,
            session.session_data,
            session.publickey,
          );
        });
      }
    });
  }, 10000); // Polling a cada 10 segundos como redundância garantida
}
// --- FIM DA ROTINA DE POLLING DE BACKUP RESILIENTE PARA CLIENTE ---
