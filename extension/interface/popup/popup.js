const CLIENT_MODE = false; // Altere para false para o modo Admin/Normal

(() => {
  let m, g, p;
  var h;
  let y,
    f,
    v,
    L = {},
    i = !1,
    s,
    t = [],
    e;
  var a,
    k = [],
    c = [
      "currentspid",
      "key",
      "secret",
      "accountsecret",
      "darkMode",
      "userPreferences",
      "seenReferralHighlight",
    ],
    r = ["app.grammarly.com", "play.stan.com.au", "classroom.udacity.com"];
  let M = new BrowserDetector(),
    S = new CookieHandler();
  window.S = S;
  window.T = T;
  function _(e, t, n, s) {
    M.isFirefox()
      ? M.getApi().runtime.sendMessage({ type: e, params: t }).then(n, s)
      : M.getApi().runtime.sendMessage({ type: e, params: t }, n);
  }

  function B(e) {
    return null != e.match(/^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,19}$/gim);
  }
  function N(a) {
    chrome.storage.local.get(["currentspid"], function (e) {
      var n, t, s, r, o;
      if (null != e && null != e.currentspid && 0 < e.currentspid.length) {
        h = e.currentspid;
        if (typeof CLIENT_MODE !== "undefined" && CLIENT_MODE) {
          document.getElementById("your-spid").innerHTML =
            "Seu ID: <span style='font-weight:bold;color:#ffcc00;text-decoration:underline;' id='copy-spid-btn'>" +
            h +
            "</span> (clique para copiar)";
          document.getElementById("your-spid").style.cursor = "pointer";
          document.getElementById("your-spid").title = "Clique para copiar o seu ID";
          setTimeout(() => {
            const btn = document.getElementById("copy-spid-btn");
            if (btn) {
              btn.addEventListener("click", function (evt) {
                evt.stopPropagation();
                navigator.clipboard.writeText(h).then(() => {
                  R("ID de Conexão copiado!");
                });
              });
            }
          }, 100);
        } else {
          document.getElementById("your-spid").innerHTML =
            ((e = [
              chrome.i18n.getMessage("Hey"),
              chrome.i18n.getMessage("Bonjour"),
              chrome.i18n.getMessage("Hola"),
              chrome.i18n.getMessage("Gday"),
              chrome.i18n.getMessage("Namaste"),
              chrome.i18n.getMessage("Welcome"),
              chrome.i18n.getMessage("Aloha"),
            ]),
            (o = Math.floor(Math.random() * e.length)),
            e[o] +
              h +
              "!" +
              ((e = [
                chrome.i18n.getMessage("Hows_it_going"),
                chrome.i18n.getMessage("Sharing_or_Passing_today"),
                chrome.i18n.getMessage("Ready_to_InfinityClaude"),
                chrome.i18n.getMessage("What_can_I_do_for_you"),
                chrome.i18n.getMessage("InfinityClaude_and_Chill"),
              ]),
              (o = Math.floor(Math.random() * e.length)),
              e[o]));
        }
        a();
      } else {
        if (typeof CLIENT_MODE !== "undefined" && CLIENT_MODE) {
          var randomId = "c_" + Math.random().toString(36).substring(2, 10);
          var email = randomId + "@infinityclient.pro";
          document.getElementById("sessionDurationText").style.display = "none";
          h = null;
          document.getElementById("button-bar-default").style.display = "none";
          document.getElementById("settings").style.display = "none";
          if (v) v.style.display = "none";
          var loadingDiv = document.createElement("div");
          loadingDiv.id = "client-loading";
          loadingDiv.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height: 100%; padding: 40px; text-align:center; box-sizing: border-box;">
              <div style="border: 6px solid #f3f3f3; border-top: 6px solid #ffcc00; border-radius: 50%; width: 50px; height: 50px; animation: spin 1.5s linear infinite;"></div>
              <h3 style="margin-top: 20px; font-family: sans-serif; color: #fff;">Iniciando SessionShare...</h3>
              <p style="font-size:12px; color: #aaa; font-family: sans-serif;">Configurando seu ID de conexão única.</p>
            </div>
            <style>
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            </style>
          `;
          y.parentNode.appendChild(loadingDiv);
          y.style.display = "none";
          _("registerSPID", { spid: randomId, email: email, referredBy: null }, function (res) {
            chrome.storage.local.set({ currentspid: randomId }, function () {
              setTimeout(function () {
                window.location.reload();
              }, 1000);
            });
          });
        } else {
          ((document.getElementById("sessionDurationText").style.display =
            "none"),
          (h = null),
          (document.getElementById("button-bar-default").style.display =
            "none"),
          (document.getElementById("settings").style.display = "none"),
          (v.style.display = "none"),
          (e = document.getElementById("anytimeSharingAlert")) &&
            (e.style.display = "none"),
          (o = document.getElementById("adCardSkeleton")) &&
            (o.style.display = "none"),
          (e = document.querySelector(".adsContainer")) &&
            (e.style.display = "none"),
          (e = d(chrome.i18n.getMessage("Sign_Up_Page"))),
          (e = document.importNode(e.content, !0).querySelector("div")),
          Animate.transitionPageSmooth(y.parentNode, y, e, "right", () => {
            i = !1;
          }),
          (n = document.getElementById("sp-referral-btn")) &&
            n.addEventListener("click", function () {
              var e = document.getElementById("sp-referral-field"),
                t = e.classList.contains("visible");
              (e.classList.toggle("visible"),
              n.classList.toggle("active"),
              t || document.getElementById("input-referrer").focus());
            }),
          (e = document.getElementById("input-username")),
          (t = document.getElementById("input-email")),
          (s = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,19}$/),
          (r = /^[^\s@]+@[^\s@]+\.[^\s@]+$/),
          e &&
            e.addEventListener("input", function () {
              0 < this.value.length && s.test(this.value)
                ? this.classList.add("valid")
                : this.classList.remove("valid");
            }),
          t &&
            t.addEventListener("input", function () {
              0 < this.value.length && r.test(this.value)
                ? this.classList.add("valid")
                : this.classList.remove("valid");
            }),
          document
            .getElementById("sign-up-button")
            .addEventListener("click", function (e) {
              var btn = this;
              if (btn.disabled) return;
              ((btn.disabled = !0), (btn.textContent = "Loading..."));
              var t,
                n,
                s = (
                  document.getElementById("input-username").value || ""
                ).trim();
              if (!s)
                return (
                  (btn.disabled = !1),
                  (btn.textContent = "Infinity Claude"),
                  R(chrome.i18n.getMessage("Please_enter_your_SPID"))
                );
              if (20 < s.length || !B(s))
                return (
                  (btn.disabled = !1),
                  (btn.textContent = "Infinity Claude"),
                  R(
                    chrome.i18n.getMessage(
                      "SPIDs_can_consist_of_letters_numbers_underscores_or_periods",
                    ),
                  )
                );
              ((t = document.querySelector("input[id=checked1]")),
              (n = document.querySelector("input[id=checked2]")));
              if (!t.checked || !n.checked)
                return (
                  (btn.disabled = !1),
                  (btn.textContent = "Infinity Claude"),
                  R(chrome.i18n.getMessage("Please_agree_to_our_terms"))
                );
              var r = s + "@infinityclaude.pro";
              _(
                "registerSPID",
                { spid: s, email: r, referredBy: null },
                function (e) {
                  "SPID Registered Successfully" == e
                    ? (R(
                        chrome.i18n.getMessage(
                          "Success_Reopen_the_app_to_start_sharing",
                        ),
                      ),
                      setTimeout(function () {
                        window.close();
                      }, 2200))
                    : ((btn.disabled = !1),
                      (btn.textContent = "Infinity Claude"),
                      R(
                        "Username has already been registered. Please choose another." ==
                          e
                          ? chrome.i18n.getMessage(
                              "Username_has_already_been_registered",
                            )
                          : e
                      ));
                }
              );
            }),
          (e = document.getElementById("sp-recover-btn")) &&
            e.addEventListener("click", function (s) {
              s.preventDefault();
              {
                let e = d(chrome.i18n.getMessage("Recovery_Page")),
                  t = document.importNode(e.content, !0).querySelector("div"),
                  n =
                    document.getElementById("sign-up-page") ||
                    document.getElementById("mainPageTitle");
                n
                  ? n.parentNode.replaceChild(t, n)
                  : ((document.querySelector(".tabcontent").innerHTML = ""),
                    document.querySelector(".tabcontent").appendChild(t));
                var r = "",
                  o = document.getElementById("recover-error");
                function a(e) {
                  ((o.textContent =
                    "string" == typeof e
                      ? e
                      : "Something went wrong. Please try again."),
                  (o.style.display = "block"));
                }
                function i() {
                  ((o.textContent = ""), (o.style.display = "none"));
                }
                (document
                  .getElementById("recover-send-btn")
                  .addEventListener("click", function () {
                    var n = (
                      document.getElementById("recover-email").value || ""
                    ).trim();
                    n
                      ? (i(),
                        (this.textContent = "Sending..."),
                        (this.disabled = !0),
                        (r = n),
                        _("recoverRequest", { email: n }, function (e) {
                          var t = document.getElementById("recover-send-btn");
                          e && e.success
                            ? ((document.getElementById(
                                "recover-step-email"
                              ).style.display = "none"),
                              (document.getElementById(
                                "recover-step-code"
                              ).style.display = "block"),
                              (document.getElementById(
                                "recover-subtitle"
                              ).textContent = "We sent a 6-digit code to " + n),
                              document.getElementById("recover-code").focus())
                            : ((t.textContent = "Send Recovery Code"),
                              (t.disabled = !1),
                              a(
                                (e && e.error) ||
                                  "Something went wrong. Please try again."
                              ));
                        }))
                      : a("Please enter your email");
                  }),
                document
                  .getElementById("recover-verify-btn")
                  .addEventListener("click", function () {
                    var e = (
                      document.getElementById("recover-code").value || ""
                    ).trim();
                    e && 6 === e.length
                      ? (i(),
                        (this.textContent = "Verifying..."),
                        (this.disabled = !0),
                        _(
                          "recoverVerify",
                          { email: r, code: e },
                          function (e) {
                            var t =
                              document.getElementById("recover-verify-btn");
                            e && e.success && e.username && e.recoveryToken
                              ? ((t.textContent = "Restoring..."),
                                _(
                                  "recoverComplete",
                                  {
                                    username: e.username,
                                    recoveryToken: e.recoveryToken,
                                  },
                                  function (e) {
                                    e && e.success
                                      ? ((document.getElementById(
                                          "recover-step-code"
                                        ).style.display = "none"),
                                        (document.getElementById(
                                          "recover-step-success"
                                        ).style.display = "block"),
                                        (document.getElementById(
                                          "recover-subtitle"
                                        ).textContent = ""),
                                        document
                                          .getElementById("recover-done-btn")
                                          .addEventListener(
                                            "click",
                                            function () {
                                              window.close();
                                            }
                                          ))
                                      : ((t.textContent = "Verify"),
                                        (t.disabled = !1),
                                        a(
                                          (e && e.error) ||
                                            "Recovery failed. Please try again."
                                        ));
                                  }
                                ))
                              : ((t.textContent = "Verify"),
                                (t.disabled = !1),
                                a(
                                  (e && e.error) ||
                                    "Invalid code. Please try again."
                                ));
                          }
                        ))
                      : a("Please enter the 6-digit code");
                  }),
                (s = document.getElementById("sp-back-to-signup")) &&
                  s.addEventListener("click", function (e) {
                    (e.preventDefault(), window.location.reload());
                  }));
              }
            }));
        }
      }
    });
  }
  function P() {
    chrome.storage.local.get(["userPreferences"], function (e) {
      e = e.userPreferences;
      (void 0 !== e &&
        (1 == e.darkMode
          ? ((e.darkMode = !1),
            chrome.storage.local.set({ userPreferences: e }),
            (document.getElementById("darkModeVal").innerHTML =
              chrome.i18n.getMessage("Summer")))
          : ((e.darkMode = !0),
            chrome.storage.local.set({ userPreferences: e }),
            (document.getElementById("darkModeVal").innerHTML =
              chrome.i18n.getMessage("Midnight")))),
        document.body.classList.toggle("darkMode"),
        document.documentElement.classList.toggle("sp-dark"));
    });
  }
  function T() {
    var e, t;
    S.currentTab &&
      !i &&
      ((e = ((e) =>
        (e = e.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i)) && e[1])(
        S.currentTab.url,
      )),
      (t = document.querySelector(".titles h2")) &&
        (t.textContent = e || S.currentTab.url),
      S.getAllCookies(function (e) {
        if (!e) e = [];
        ((e = e.sort(o)),
          (L = {}),
          0 < e.length &&
            e.forEach(function (e) {
              var t = Cookie.hashCode(e);
              L[t] = new Cookie(t, e, s);
            }));
      }));
  }
  function l() {
    (document
      .querySelectorAll(
        '.infinityclaudeedlink > a:not([href="http://infinityclaude.pro"])',
      )
      .forEach(function (e) {
        e.listenerAdded ||
          (e.addEventListener("click", function () {
            u(e);
          }),
          (e.listenerAdded = !0));
      }),
      document
        .querySelectorAll(".container > text[value=removeListItem]")
        .forEach(function (e) {
          e.addEventListener("click", function () {
            D(e);
          });
        }));
  }
  function D(e) {
    (_("deleteSession", { dom: e.getAttribute("id") }),
      e.parentNode.parentNode.remove(e),
      0 ==
        document.getElementById("sessionList").getElementsByTagName("li")
          .length && n());
  }
  function u(e) {
    e.listenerAdded &&
      (e.removeEventListener("click", u), (e.listenerAdded = !1));
    var t = e.hostname,
      n = "complete";
    r.includes(t) && (n = "loading");
    {
      let e = document.createElement("div"),
        t =
          (e.setAttribute("id", "loadingScreen"),
          (e.style.position = "fixed"),
          (e.style.left = "0"),
          (e.style.top = "0"),
          (e.style.width = "100%"),
          (e.style.height = "100%"),
          (e.style.backgroundColor = "rgba(0, 0, 0, 0.6)"),
          (e.style.zIndex = "9999"),
          (e.style.display = "flex"),
          (e.style.justifyContent = "center"),
          (e.style.alignItems = "center"),
          (e.style.flexDirection = "column"),
          document.createElement("div")),
        n =
          ((t.style.border = "12px solid #f3f3f3"),
          (t.style.borderTop = "12px solid #ffcc00"),
          (t.style.borderRadius = "60%"),
          (t.style.width = "100px"),
          (t.style.height = "100px"),
          (t.style.animation = "spin 3s linear infinite"),
          document.createElement("div")),
        s =
          ((n.innerText = "Loading..."),
          (n.style.color = "#ffffff"),
          (n.style.marginTop = "20px"),
          (n.style.fontSize = "16px"),
          (n.style.fontFamily = "Arial, sans-serif"),
          e.appendChild(t),
          e.appendChild(n),
          document.body.appendChild(e),
          document.createElement("style")),
        r =
          ((s.type = "text/css"),
          (s.innerText = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `),
          document.head.appendChild(s),
          ["Almost there!", "Hang tight..."]),
        o = 0,
        a = setInterval(() => {
          ((n.innerText = r[o]), (o = (o + 1) % r.length));
        }, 5e3);
      setTimeout(() => {
        (clearInterval(a),
          (n.innerHTML =
            "This is taking longer than expected.<br>Please close the app and try again"),
          (n.style.paddingLeft = "20px"),
          (n.style.paddingRight = "20px"));
      }, 15e3);
    }
    chrome.tabs.create({ url: "https://" + t, active: !1 }, function (e) {
      _("onTabsCreated", { tabId: e, source: n, domain: t });
    });
  }
  function E(e) {
    var t = String(e),
      n = (
        (t = e.includes(".pending") ? t.replace(".pending", "") : t).match(
          /\./g,
        ) || []
      ).length;
    return (t =
      "Com" !=
        (t = e.includes("www")
          ? (t = (t = t.replace(/^www\./, "")).substr(
              0,
              t.indexOf("."),
            ))[0].toUpperCase() + t.slice(1)
          : 1 == n
            ? (t = t.substring(0, t.indexOf(".")))[0].toUpperCase() + t.slice(1)
            : (t =
                (t = t.substring(t.indexOf(".") + 1))[0].toUpperCase() +
                t.slice(1)).substring(0, t.indexOf("."))) &&
      "Github" != t &&
      "Office365" != t
        ? t
        : (t = e.substr(0, e.indexOf(".")))[0].toUpperCase() + t.slice(1));
  }
  function b(e, t) {
    return (e =
      null != (e = void 0 !== t && "undefined" !== t && "" !== t ? t : e) &&
      "undefined" != e
        ? e
        : chrome.runtime.getURL("icons/SP-48.png"));
  }
  function Y() {
    var n, s;
    null != h &&
      ((n = document.getElementById("infinityclaudeAdCard")),
      (s = document.getElementById("adCardSkeleton")),
      C()
        .then((t) => {
          if (1 === t)
            (s && (s.style.display = "none"), n && (n.style.display = "none"));
          else if (n) {
            t = G();
            var adsGal = document.getElementById("adsGalleryContent");
            (adsGal && (adsGal.innerHTML = t.message),
              n.replaceWith(n.cloneNode(!0)));
            let e = document.getElementById("infinityclaudeAdCard");
            ("Refer_Friend_Promo" === t.key
              ? e.addEventListener("click", V)
              : e.addEventListener("click", H),
              (document.getElementById("cookie-container").style.maxHeight =
                "217px"),
              s && (s.style.display = "none"),
              (e.style.display = "block"),
              requestAnimationFrame(function () {
                e.classList.add("sp-fade-in");
              }));
          }
        })
        .catch((e) => {
          (console.error("Error determining paid user status:", e),
            s && (s.style.display = "none"));
        }));
  }
  function G() {
    var e = [
      {
        key: "Refer_Friend_Promo",
        message: chrome.i18n.getMessage("Refer_Friend_Promo"),
      },
      {
        key: "Get_Premium_Today_Promo",
        message: chrome.i18n.getMessage("Get_Premium_Today_Promo"),
      },
      {
        key: "Remove_Ad_Promo",
        message: chrome.i18n.getMessage("Remove_Ad_Promo"),
      },
      {
        key: "Limitless_Sharing_Promo",
        message: chrome.i18n.getMessage("Limitless_Sharing_Promo"),
      },
    ];
    return e[Math.floor(Math.random() * e.length)];
  }
  function x() {
    chrome.storage.local.get(["userPreferences"], function (e) {
      var r = document.createElement("ul"),
        t = document.getElementById("settingsMain"),
        o = (r.setAttribute("id", "settingsList"), e.userPreferences);
      o &&
        ([
          "paidUser",
          "groupSharing",
          "receiveSessionFrom",
          "appearOnForYou",
          "darkMode",
        ].forEach(function (e) {
          var t, n, s;
          o.hasOwnProperty(e) &&
            ((n = ((e) => {
              switch (e) {
                case "paidUser":
                  e = chrome.i18n.getMessage("Paid_User");
                  break;
                case "appearOnForYou":
                  e = chrome.i18n.getMessage("Appear_on_For_You");
                  break;
                case "receiveSessionFrom":
                  e = chrome.i18n.getMessage("Receive_From");
                  break;
                case "groupSharing":
                  e = chrome.i18n.getMessage("Group_Sharing");
                  break;
                case "darkMode":
                  e = chrome.i18n.getMessage("Theme");
              }
              return e;
            })(e)),
            (s = ((e, t) => {
              switch (e) {
                case "paidUser":
                  switch (t) {
                    case 0:
                      t = chrome.i18n.getMessage("Get_Premium");
                      break;
                    case 1:
                      t = chrome.i18n.getMessage("Manage_Premium");
                  }
                case "groupSharing":
                  switch (t) {
                    case 0:
                    case 1:
                      t = chrome.i18n.getMessage("Coming_Soon");
                  }
                case "appearOnForYou":
                  switch (t) {
                    case 0:
                      t = chrome.i18n.getMessage("Yes");
                      break;
                    case 1:
                      t = chrome.i18n.getMessage("No");
                  }
                case "receiveSessionFrom":
                  switch (t) {
                    case 0:
                      t = chrome.i18n.getMessage("Anyone");
                      break;
                    case 1:
                      t = chrome.i18n.getMessage("Friends_Only");
                  }
                case "darkMode":
                  switch (t) {
                    case !0:
                      t = chrome.i18n.getMessage("Midnight");
                      break;
                    case !1:
                      t = chrome.i18n.getMessage("Summer");
                  }
              }
              return t;
            })(e, o[e])),
            ((t = document.createElement("li")).innerHTML =
              '<div class="header container listItem settingsList"><a href=#><span>' +
              n +
              "</span></a><text class='settingOptions' value='settingOptions' id=" +
              e +
              "Val>" +
              s +
              "</text></div>"),
            "paidUser" === e &&
              ((t.querySelector(".header").style.background =
                "linear-gradient(270deg, rgb(255 132 32), rgb(252 215 122))"),
              (t.querySelector(".header").style.boxShadow =
                "rgb(255 210 0 / 60%) 0px 0px 4px 0px"),
              (t.querySelector(".header").style.borderColor = "#ffc400d4"),
              (t.querySelector(".header a span").style.color = "#5a3000"),
              (n = t.querySelector("#paidUserVal"))) &&
              ((n.style.color = "#fff4dc"),
              n.setAttribute("data-plan-type", o[e])),
            "groupSharing" === e &&
              ((t.querySelector(".header").style.background =
                "linear-gradient(270deg, rgb(9 160 94), rgb(134 220 133))"),
              (t.querySelector(".header").style.boxShadow =
                "rgb(0 194 128 / 60%) 0px 0px 4px 0px"),
              (t.querySelector(".header").style.borderColor = "#007535d4"),
              (t.querySelector(".header a span").style.color = "#0a3d1f"),
              (s = t.querySelector("#groupSharingVal"))) &&
              (s.style.color = "#fff4dc"),
            r.appendChild(t));
        }),
        t.appendChild(r),
        document
          .getElementById("appearOnForYouVal")
          ?.parentElement.addEventListener("click", function () {
            chrome.storage.local.get(["userPreferences"], function (e) {
              var t = e.userPreferences;
              (1 == t.appearOnForYou
                ? (t.appearOnForYou = 0)
                : (t.appearOnForYou = 1),
                _("userPreferences", { userPreferences: t }, function (e) {
                  e
                    ? R(e)
                    : (chrome.storage.local.set({ userPreferences: t }),
                      w(),
                      x());
                }));
            });
          }),
        document
          .getElementById("paidUserVal")
          ?.parentElement.addEventListener("click", function () {
            0 <
            document
              .querySelector("#paidUserVal")
              .getAttribute("data-plan-type")
              ? (_("subscriptionPayment"), window.close())
              : H();
          }),
        document
          .getElementById("groupSharingVal")
          ?.parentElement.addEventListener("click", function () {
            V();
          }),
        document
          .getElementById("receiveSessionFromVal")
          ?.parentElement.addEventListener("click", function () {
            chrome.storage.local.get(["userPreferences"], function (e) {
              var t = e.userPreferences;
              (1 == t.receiveSessionFrom
                ? (t.receiveSessionFrom = 0)
                : (t.receiveSessionFrom = 1),
                _("userPreferences", { userPreferences: t }, function (e) {
                  e
                    ? R(e)
                    : (chrome.storage.local.set({ userPreferences: t }),
                      w(),
                      x());
                }));
            });
          }),
        document
          .getElementById("darkModeVal")
          ?.parentElement.addEventListener("click", function () {
            P();
          }));
    });
  }
  function w() {
    var e = document.getElementById("settingsList");
    document.getElementById("settingsMain");
    e && e.remove();
  }
  function C() {
    return new Promise((t, n) => {
      chrome.storage.local.get(["userPreferences"], function (e) {
        e = e.userPreferences;
        e && void 0 !== e.paidUser
          ? t(e.paidUser)
          : n(new Error("Paid user status not found"));
      });
    });
  }
  function j() {
    if (typeof CLIENT_MODE !== "undefined" && CLIENT_MODE) {
      var t = document.getElementById("mainPageTitle-heading");
      if (t) t.innerHTML = "InfinityAI Session";
      return;
    }
    C()
      .then((e) => {
        var t = document.getElementById("mainPageTitle-heading"),
          t =
            (t && (t.innerHTML = e ? "Infinity Claude+" : "Infinity Claude"),
            document.querySelector(".sp-center-logo")),
          n = document.querySelector(".sp-center-plus");
        (t &&
          (e
            ? ((t.src = "../../icons/icon-modern.svg"),
              t.classList.add("sp-premium-logo"))
            : ((t.src = "../../icons/SP-128.png"),
              t.classList.remove("sp-premium-logo"))),
          n && (n.style.display = e ? "flex" : "none"));
      })
      .catch((e) => {
        console.error(e);
        e = document.getElementById("mainPageTitle-heading");
        e && (e.innerHTML = "Infinity Claude");
      });
  }
  function H() {}
  function V() {}
  function I(e) {
    ((document.getElementById("modalBackground").style.display = "block"),
      dynamics.css(e, { opacity: 0, scale: 0.5 }),
      dynamics.animate(
        e,
        { opacity: 1, scale: 1 },
        { type: dynamics.spring, frequency: 300, friction: 400, duration: 1e3 },
      ));
  }
  function A(e) {
    ((document.getElementById("modalBackground").style.display = "none"),
      dynamics.animate(
        e,
        { opacity: 0, translateY: 100 },
        { type: dynamics.spring, frequency: 50, friction: 600, duration: 1500 },
      ));
  }
  function F(e) {
    for (var t = 0; t < e.length; t++) {
      var n = e[t];
      (dynamics.css(n, { opacity: 0, translateY: 30 }),
        dynamics.animate(
          n,
          { opacity: 1, translateY: 0 },
          {
            type: dynamics.spring,
            frequency: 300,
            friction: 400,
            duration: 1e3,
            delay: 100 + 40 * t,
          },
        ));
    }
  }
  function U(e, t) {
    e.classList.contains(t) || e.classList.add(t);
  }
  function q(e, t) {
    e.classList.contains(t) && e.classList.remove(t);
  }
  function n() {
    var e = d(chrome.i18n.getMessage("No_Cookies")),
      e = document.importNode(e.content, !0).querySelector("p");
    Animate.transitionPage(m, m.firstChild, e, "right", () => {
      i = !1;
    });
  }
  function W(e) {
    var t;
    e
      ? (console.log("Cookies have changed!", e.removed, e.cause),
        (t = Cookie.hashCode(e.cookie)),
        "overwrite" !== e.cause &&
          (e.removed
            ? L[t] && delete L[t]
            : ((e = new Cookie(t, e.cookie)), (L[t] = e))))
      : T();
  }
  function z() {
    T();
  }
  function o(e, t) {
    ((e = e.name.toLowerCase()), (t = t.name.toLowerCase()));
    return e < t ? -1 : t < e ? 1 : 0;
  }
  function d(e) {
    var t = document.createElement("template");
    return ((e = e.trim()), (t.innerHTML = e), t);
  }
  function R(e) {
    (t.push(e), $());
  }
  function $() {
    t &&
      t.length &&
      (e ||
        f.classList.contains("fadeInUp") ||
        ((document.getElementById("notification").style.zIndex = 1e3),
        (document.getElementById("notification-container").style.zIndex = 1e3),
        e
          ? ((document.getElementById("notification").style.zIndex = -1e3),
            (document.getElementById("notification-container").style.zIndex =
              -1e3))
          : ((f.querySelector("span").textContent = t.shift()),
            f.classList.add("fadeInUp"),
            f.classList.remove("fadeOutDown"),
            (e = setTimeout(() => {
              J();
            }, 2500)))));
  }
  function J() {
    (e && (clearTimeout(e), (e = null)),
      f.classList.remove("fadeInUp"),
      f.classList.add("fadeOutDown"),
      (document.getElementById("notification-container").style.zIndex = -1e3));
  }
  function O(e) {
    for (
      var t = document.getElementsByClassName("tabcontent"), n = 0;
      n < t.length;
      n++
    )
      t[n].style.display = "none";
    ((document.getElementById(e).style.display = "block"),
      "MainPage" === e && 0 < k.length && updateGroupShareBar());
  }
  (window.addEventListener("load", () => {}),
    document.addEventListener("DOMContentLoaded", function () {
      if (typeof CLIENT_MODE !== "undefined" && CLIENT_MODE) {
        var settingsBtn = document.getElementById("settings");
        if (settingsBtn) settingsBtn.style.display = "none";
        
        var sendToContainer = document.getElementById("sendto-spid-container");
        if (sendToContainer) sendToContainer.style.display = "none";
        
        var durationText = document.getElementById("sessionDurationText");
        if (durationText) durationText.style.display = "none";
        
        var buttonBar = document.getElementById("button-bar-default");
        if (buttonBar) buttonBar.style.display = "none";
        
        var cookieContainer = document.getElementById("cookie-container");
        if (cookieContainer) {
          cookieContainer.style.height = "420px";
          cookieContainer.style.maxHeight = "420px";
          cookieContainer.style.marginTop = "10px";
        }
        
        var adCard = document.getElementById("infinityclaudeAdCard");
        if (adCard) adCard.style.display = "none";
        var adSkeleton = document.getElementById("adCardSkeleton");
        if (adSkeleton) adSkeleton.style.display = "none";
        var adsContainer = document.querySelector(".adsContainer");
        if (adsContainer) adsContainer.style.display = "none";

        var titleEl = document.getElementById("mainPageTitle-heading");
        if (titleEl) {
          titleEl.innerHTML = "InfinityAI Session";
          titleEl.style.marginTop = "10px";
          titleEl.style.marginBottom = "5px";
          
          if (!document.getElementById("client-logo")) {
            var logoImg = document.createElement("img");
            logoImg.id = "client-logo";
            logoImg.src = "../../icons/SP-128.png";
            logoImg.alt = "InfinityAI Logo";
            logoImg.style.width = "48px";
            logoImg.style.height = "48px";
            logoImg.style.display = "block";
            logoImg.style.margin = "0 auto 10px auto";
            logoImg.style.borderRadius = "12px";
            logoImg.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
            
            titleEl.parentNode.insertBefore(logoImg, titleEl);
          }
        }

        var yourSpid = document.getElementById("your-spid");
        if (yourSpid) {
          yourSpid.style.position = "relative";
          yourSpid.style.display = "block";
          yourSpid.style.marginBottom = "15px";
          yourSpid.style.textAlign = "center";
        }
      }
      var adsGal = document.getElementById("adsGalleryContent");
      adsGal && (adsGal.innerHTML = G());
      var r = ["4h", "1d", "7d", "2w"],
        o = ["4h", "1d", "7d", "2w", "1M", "3M", "6M", "1Y"],
        a = {
          "4h": "4 hrs",
          "1d": "1 day",
          "7d": "7 days",
          "2w": "2 wks",
          "1M": "1 mo",
          "3M": "3 mo",
          "6M": "6 mo",
          "1Y": "1 yr",
        };
      ((m = document.getElementById("cookie-container")),
        (g = document.getElementById("friends-suggested")),
        (p = document.getElementById("friends-main")),
        (f = document.getElementById("notification")),
        (y = document.getElementById("mainPageTitle")),
        (v = document.getElementById("SettingsPage")),
        chrome.storage.local.get(["userPreferences", "darkMode"], function (e) {
          var t,
            n = e.userPreferences,
            s =
              '{ "darkMode": false, "receiveSessionFrom": 0, "offlineSharing": 0, "offlineSharingTutorial": 0, "appearOnForYou": 0, "paidUser": 0, "groupSharing": 0}',
            s = JSON.parse(
              '{ "darkMode": false, "receiveSessionFrom": 0, "offlineSharing": 0, "offlineSharingTutorial": 0, "appearOnForYou": 0, "paidUser": 0, "groupSharing": 0}',
            ),
            r =
              (void 0 !== e.darkMode
                ? ((t = e.darkMode),
                  (s.darkMode = t),
                  chrome.storage.local.set({ userPreferences: s }),
                  chrome.storage.local.remove("darkMode"))
                : void 0 !== n &&
                  (void 0 !== n.darkMode
                    ? (t = n.darkMode)
                    : ((s.darkMode = t = !1),
                      chrome.storage.local.set({ userPreferences: s }))),
              1 == t &&
                (document.body.classList.toggle("darkMode"),
                document.documentElement.classList.add("sp-dark")),
              {});
          (void 0 !== n
            ? [
                "darkMode",
                "receiveSessionFrom",
                "offlineSharing",
                "offlineSharingTutorial",
                "appearOnForYou",
                "paidUser",
                "groupSharing",
              ].forEach(function (e) {
                n.hasOwnProperty(e)
                  ? (r[e] = n[e])
                  : (r[e] = ((e) => {
                      switch (e) {
                        case "appearOnForYou":
                        case "receiveSessionFrom":
                          t = 0;
                          break;
                        case "offlineSharing":
                        case "offlineSharingTutorial":
                          t = 1;
                          break;
                        case "darkMode":
                          t = !1;
                          break;
                        case "paidUser":
                        case "groupSharing":
                          var t = 0;
                      }
                      return t;
                    })(e));
              })
            : (r = s),
            chrome.storage.local.set({ userPreferences: r }));
        }),
        chrome.storage.local.get(["userPreferences"], function (e) {
          var t,
            e = e && e.userPreferences;
          e &&
            1 === e.paidUser &&
            ((e = document.getElementById("adCardSkeleton")),
            (t = document.querySelector(".adsContainer")),
            e && (e.style.display = "none"),
            t) &&
            (t.style.display = "none");
        }),
        j(),
        chrome.notifications.getAll((e) => {
          if (e) for (var t in e) chrome.notifications.clear(t);
        }),
        document
          .getElementById("refresh-button")
          .addEventListener("click", (e) => {
            chrome.runtime.reload();
          }),
        (document.getElementById("sendto-spid-label").innerHTML =
          chrome.i18n.getMessage("Share_To")),
        (document.getElementById("AccountsFooter").innerHTML =
          chrome.i18n.getMessage("AccountsFooter")),
        (document.getElementById("FriendsFooter").innerHTML =
          chrome.i18n.getMessage("FriendsFooter")),
        (document.getElementById("friendsTitleText").innerHTML =
          chrome.i18n.getMessage("friendsTitleText")));
      var afbtn = document.getElementById("add-friend-btn");
      if (afbtn)
        afbtn.addEventListener("click", function () {
          var n = document.getElementById("add-friend-input").value.trim();
          if (n)
            _("addFriend", { friendspid: n }, function (e) {
              if (e) {
                R(e);
              } else {
                document.getElementById("add-friend-input").value = "";
                l();
              }
            });
        });
      ((document.getElementById("suggestedfriends-label").innerHTML =
        chrome.i18n.getMessage("For_You")),
        (document.getElementById("SettingsTitleText").innerHTML =
          chrome.i18n.getMessage("SettingsTitleText")),
        (document.getElementById("like-infinityclaude").innerHTML =
          chrome.i18n.getMessage("Like_infinityclaude")),
        (document.getElementById("rate-us").innerHTML =
          chrome.i18n.getMessage("Rate_Us")),
        (document.getElementById("need-help").innerHTML =
          chrome.i18n.getMessage("Need_help")),
        (document.getElementById("user-guide").innerHTML =
          chrome.i18n.getMessage("User_Guide")),
        (document.getElementById("request-feature").innerHTML =
          chrome.i18n.getMessage("Request_feature")),
        (document.getElementById("email-us").innerHTML =
          chrome.i18n.getMessage("Email_Us")),
        (document.getElementById("copyright-slug").innerHTML =
          chrome.i18n.getMessage("Copyright")),
        (e = document.getElementById("subscribePart1PromptTitle")) &&
          (e.innerHTML = chrome.i18n.getMessage("Get_Premium")),
        (e = document.getElementById("subscribePart1PromptText")) &&
          (e.innerHTML = chrome.i18n.getMessage("You_asked_we_heard_you")),
        (e = document.getElementById("subscribePart2Title")) &&
          (e.innerHTML = chrome.i18n.getMessage("Subscription_Options")));
      var e = document.getElementById("subscriptionPremiumTab"),
        e =
          (e && (e.innerHTML = chrome.i18n.getMessage("Premium")),
          document.getElementById("subscriptionStandardTab")),
        e =
          (e && (e.innerHTML = chrome.i18n.getMessage("Standard")),
          document.getElementById("subscriptionPremiumPrice"));
      e && (e.innerHTML = chrome.i18n.getMessage("Premium_Mo_Promo"));
      var n,
        i = 5,
        E = "1M",
        c = !1;
      function b() {
        var e = document.querySelector(".sp-center-btn");
        (e &&
          (e.classList.remove("sp-btn-pop"),
          e.offsetWidth,
          e.classList.add("sp-btn-pop")));

        const sendToInput = document.getElementById("sendto-spid");
        const destinatarios = k.length > 0 ? k.slice() : (sendToInput && sendToInput.value.trim() ? [sendToInput.value.trim()] : []);

        function prosseguirComAbaAtual() {
          chrome.storage.local.get(["userPreferences"], function (e) {
            var e = e.userPreferences.paidUser,
              t = document.getElementById("sessionDurationText").innerHTML;
            if (!e && ["1M", "3M", "6M", "1Y"].includes(t))
              (R(
                chrome.i18n.getMessage(
                  "Please_subscribe_to_Infinity Claude_Premium",
                ),
              ),
                setTimeout(function () {
                  window.close();
                }, 2500));
            else {
              document.getElementById("export-cookies").querySelector("use");
              var n,
                v,
                s,
                r,
                o,
                a,
                i,
                c,
                d = [];
              for (n in L) {
                var l = L[n].cookie;
                ((l.storeId = null), d.push(l));
              }
              chrome.tabs.query(
                { active: !0, currentWindow: !0 },
                function (e) {
                  var t;
                  e &&
                  e[0] &&
                  ((t = new URL(e[0].url)),
                  (v = t.hostname),
                  (i = e[0].favIconUrl),
                  "http:" == t.protocol || "https:" == t.protocol)
                    ? chrome.storage.local.get(v, function (e) {
                        if (
                          (null == (o = e[v])
                            ? ((a = "Owned"), _("imageToB64", { domain: v }))
                            : ((a = o.Status), (c = o.b64Logo)),
                          "Owned" == a)
                        )
                          chrome.scripting
                            .executeScript({
                              target: { tabId: S.currentTab.id, allFrames: !1 },
                              func: function () {
                                var e,
                                  t,
                                  n,
                                  s = {},
                                  r = {},
                                  o = [
                                    "length",
                                    "key",
                                    "getItem",
                                    "setItem",
                                    "removeItem",
                                    "clear",
                                  ];
                                for (n in localStorage)
                                  localStorage.hasOwnProperty(n) &&
                                    (s[n] = localStorage.getItem(n));
                                for (n in sessionStorage)
                                  sessionStorage.hasOwnProperty(n) &&
                                    (r[n] = sessionStorage.getItem(n));
                                for (n in o)
                                  null !== (e = localStorage.getItem(o[n])) &&
                                    (s[o[n]] = e);
                                for (n in o)
                                  null !== (t = sessionStorage.getItem(o[n])) &&
                                    (r[o[n]] = t);
                                return { objLocal: s, objSession: r };
                              },
                              args: [],
                            })
                            .then((e) => {
                              ((s = e[0].result),
                                (r = JSON.stringify(s.objLocal, null, 0)),
                                (s = JSON.stringify(s.objSession, null, 0)),
                                (d = JSON.stringify(d, null, 0)),
                                (r =
                                  '{ "Cookies": ' +
                                  d +
                                  ', "LocalStorage": ' +
                                  r +
                                  ', "SessionStorage": ' +
                                  s +
                                  ', "LogoURL": "' +
                                  i +
                                  '", "b64Logo": "' +
                                  c +
                                  '", "Status": "Owned", "Pending": false, "Duration": "Owned" }'),
                                (r = JSON.parse(r)),
                                chrome.storage.local.set({ [v]: r }),
                                null != h &&
                                  0 < h.length &&
                                  chrome.storage.local.get(v, function (e) {
                                    var t = e[v];
                                    ((t.Status = "Received"),
                                      (t.Pending = !0),
                                      (t.Duration = E));
                                    var e =
                                        Object.keys(e) +
                                        ".pending:" +
                                        JSON.stringify(t, null, 0),
                                      t = v,
                                      n = E,
                                      s =
                                        document.getElementById("sendto-spid");
                                    if (1 < k.length) {
                                      var a = e,
                                        i = t,
                                        c = n,
                                        d = k.slice(),
                                        l = 0,
                                        u = 0,
                                        m = [],
                                        g =
                                          document.getElementById(
                                            "gs-progress",
                                          ),
                                        r =
                                          document.getElementById(
                                            "gs-progress-list",
                                          ),
                                        p = document.getElementById(
                                          "gs-progress-bar-fill",
                                        ),
                                        h =
                                          document.getElementById(
                                            "gs-progress-title",
                                          ),
                                        y = !1;
                                      ((r.innerHTML = ""),
                                        (p.style.width = "0%"),
                                        (h.textContent = "Sharing session..."));
                                      for (var o = 0; o < d.length; o++) {
                                        var f = document.createElement("div");
                                        ((f.className = "gs-progress-item"),
                                          (f.id = "gs-prog-" + o),
                                          (f.innerHTML =
                                            '<div class="gs-progress-icon">' +
                                            d[o].charAt(0).toUpperCase() +
                                            "</div><span>" +
                                            d[o] +
                                            "</span>"),
                                          r.appendChild(f));
                                      }
                                      ((g.style.display = "flex"),
                                        (document.getElementById(
                                          "gs-progress-close",
                                        ).onclick = function () {
                                          ((y = !0),
                                            (g.style.display = "none"),
                                            I());
                                        }),
                                        (function t(n) {
                                          var s, r, o;
                                          y ||
                                            (n >= d.length
                                              ? ((h.textContent =
                                                  0 === u
                                                    ? "All shared!"
                                                    : l +
                                                      " sent, " +
                                                      u +
                                                      " failed"),
                                                I(),
                                                setTimeout(function () {
                                                  ((g.style.display = "none"),
                                                    window.close());
                                                }, 1500))
                                              : ((s = document.getElementById(
                                                  "gs-prog-" + n,
                                                )) &&
                                                  (s.className =
                                                    "gs-progress-item gs-sending"),
                                                (r = !1),
                                                (o = setTimeout(function () {
                                                  var e;
                                                  r ||
                                                    ((r = !0),
                                                    u++,
                                                    m.push(d[n]),
                                                    s &&
                                                      ((s.className =
                                                        "gs-progress-item gs-failed"),
                                                      (s.querySelector(
                                                        ".gs-progress-icon",
                                                      ).innerHTML = "!")),
                                                    (e = Math.round(
                                                      ((n + 1) / d.length) *
                                                        100,
                                                    )),
                                                    (p.style.width = e + "%"),
                                                    t(n + 1));
                                                }, 8e3)),
                                                _(
                                                  "sendSession",
                                                  {
                                                    session: a,
                                                    sendto: d[n],
                                                    domain: i,
                                                    duration: c,
                                                  },
                                                  function (e) {
                                                    r ||
                                                      ((r = !0),
                                                      clearTimeout(o),
                                                      e
                                                        ? (u++,
                                                          m.push(d[n]),
                                                          s &&
                                                            ((s.className =
                                                              "gs-progress-item gs-failed"),
                                                            (s.querySelector(
                                                              ".gs-progress-icon",
                                                            ).innerHTML = "✕")))
                                                        : (l++,
                                                          s &&
                                                            ((s.className =
                                                              "gs-progress-item gs-sent"),
                                                            (s.querySelector(
                                                              ".gs-progress-icon",
                                                            ).innerHTML =
                                                              "✓"))),
                                                      (e = Math.round(
                                                        ((n + 1) / d.length) *
                                                          100,
                                                      )),
                                                      (p.style.width = e + "%"),
                                                      t(n + 1));
                                                  },
                                                )));
                                        })(0));
                                    } else
                                      null != s &&
                                      null != s.value &&
                                      0 < s.value.length &&
                                      B(s.value)
                                        ? _(
                                            "sendSession",
                                            {
                                              session: e,
                                              sendto: s.value,
                                              domain: t,
                                              duration: n,
                                            },
                                            function (e) {
                                              "User does not exist." == e
                                                ? (R(
                                                    chrome.i18n.getMessage(
                                                      "User_does_not_exist",
                                                    ),
                                                  ),
                                                  document
                                                    .getElementById(
                                                      "export-cookies",
                                                    )
                                                    .addEventListener(
                                                      "click",
                                                      () => {
                                                        b();
                                                      },
                                                      { once: !0 },
                                                    ))
                                                : "User can only receive sessions from friends" ==
                                                    e
                                                  ? (R(
                                                      chrome.i18n.getMessage(
                                                        "User_only_accepts_sessions_from_their_friends",
                                                      ),
                                                    ),
                                                    document
                                                      .getElementById(
                                                        "export-cookies",
                                                      )
                                                      .addEventListener(
                                                        "click",
                                                        () => {
                                                          b();
                                                        },
                                                        { once: !0 },
                                                      ))
                                                  : "You cannot Infinity Claude with yourself!" ==
                                                      e
                                                    ? (R(
                                                        chrome.i18n.getMessage(
                                                          "You_cannot_Infinity Claude_with_yourself",
                                                        ),
                                                      ),
                                                      document
                                                        .getElementById(
                                                          "export-cookies",
                                                        )
                                                        .addEventListener(
                                                          "click",
                                                          () => {
                                                            b();
                                                          },
                                                          { once: !0 },
                                                        ))
                                                    : (R(
                                                        chrome.i18n.getMessage(
                                                          "Infinity Claude_Successful",
                                                        ),
                                                      ),
                                                      I(),
                                                      setTimeout(function () {
                                                        window.close();
                                                      }, 1800));
                                            },
                                          )
                                        : null != s &&
                                            null != s.value &&
                                            0 < s.value.length &&
                                            !B(s.value)
                                          ? (R(
                                              chrome.i18n.getMessage(
                                                "Hmm_that_username_doesnt_look_right",
                                              ),
                                            ),
                                            document
                                              .getElementById("export-cookies")
                                              .addEventListener(
                                                "click",
                                                () => {
                                                  b();
                                                },
                                                { once: !0 },
                                              ))
                                          : (R(
                                              chrome.i18n.getMessage(
                                                "Account_Saved_Try_sharing_with_a_friend",
                                              ),
                                            ),
                                            setTimeout(function () {
                                              window.close();
                                            }, 1800));
                                  }));
                            });
                        else if ("Received" == a)
                          return (
                            R(
                              chrome.i18n.getMessage(
                                "You_cant_share_what_isnt_yours",
                              ),
                            ),
                            void setTimeout(function () {
                              window.close();
                            }, 2500)
                          );
                      })
                    : (R(
                        chrome.i18n.getMessage(
                          "Unable_to_Infinity Claude_Invalid_URL",
                        ),
                      ),
                      setTimeout(function () {
                        window.close();
                      }, 2200));
                },
              );
            }
          });
        }

        function getSavedSessions(callback) {
          chrome.storage.local.get(null, function(items) {
            const sessoesSalvas = [];
            const reservedKeys = ["currentspid", "key", "secret", "accountsecret", "darkMode", "userPreferences", "seenReferralHighlight"];
            Object.keys(items).forEach(function(key) {
              if (!reservedKeys.includes(key) && !key.endsWith(".pending")) {
                const item = items[key];
                if (item && (item.Cookies || item.LocalStorage || item.SessionStorage)) {
                  sessoesSalvas.push({ domain: key, data: item });
                }
              }
            });
            callback(sessoesSalvas);
          });
        }

        function enviarSessoesEmLote(destList, sessList) {
          R(`Enviando ${sessList.length} contas...`);
          
          const envios = [];
          for (const dest of destList) {
            for (const sess of sessList) {
              envios.push({ dest, sess });
            }
          }

          let index = 0;
          let failedCount = 0;

          function enviarProximo() {
            if (index >= envios.length) {
              if (failedCount === 0) {
                R("Todas as sessões foram enviadas com sucesso!");
                I(); // Limpa a seleção de amigos
                setTimeout(() => {
                  window.close();
                }, 1800);
              } else {
                R(`Envio concluído. ${failedCount} falharam.`);
                document.getElementById("export-cookies").addEventListener(
                  "click",
                  () => { b(); },
                  { once: !0 }
                );
              }
              return;
            }

            const { dest, sess } = envios[index];
            
            // Clona e atualiza as propriedades para o formato que o receptor precisa receber
            const sessionDataCopy = JSON.parse(JSON.stringify(sess.data));
            sessionDataCopy.Status = "Received";
            sessionDataCopy.Pending = !0;
            sessionDataCopy.Duration = E;

            const sessionStr = sess.domain + ".pending:" + JSON.stringify(sessionDataCopy, null, 0);

            let respondido = false;
            const timer = setTimeout(() => {
              if (!respondido) {
                respondido = true;
                console.warn(`Timeout ao enviar ${sess.domain} para ${dest}`);
                failedCount++;
                index++;
                enviarProximo();
              }
            }, 5000);

            _("sendSession", {
              session: sessionStr,
              sendto: dest,
              domain: sess.domain,
              duration: E
            }, (res) => {
              if (!respondido) {
                respondido = true;
                clearTimeout(timer);
                if (res) {
                  console.error(`Falha ao enviar ${sess.domain} para ${dest}:`, res);
                  failedCount++;
                }
                index++;
                enviarProximo();
              }
            });
          }

          enviarProximo();
        }

        if (destinatarios.length > 0) {
          getSavedSessions(function(sessoesSalvas) {
            if (sessoesSalvas.length > 0) {
              const receiverName = destinatarios.length > 1 ? `${destinatarios.length} amigos` : destinatarios[0];
              document.getElementById("shareOptionsReceiver").textContent = receiverName;
              document.getElementById("savedSessionsCount").textContent = sessoesSalvas.length;
              
              const promptEl = document.getElementById("shareOptionsPrompt");
              promptEl.style.display = "block";
              I(promptEl);
              
              document.getElementById("shareCurrentTabBtn").onclick = function() {
                A(promptEl);
                setTimeout(() => { promptEl.style.display = "none"; }, 1500);
                prosseguirComAbaAtual();
              };
              
              document.getElementById("shareAllSavedBtn").onclick = function() {
                A(promptEl);
                setTimeout(() => { promptEl.style.display = "none"; }, 1500);
                enviarSessoesEmLote(destinatarios, sessoesSalvas);
              };
              
              document.getElementById("shareCancelBtn").onclick = function() {
                A(promptEl);
                setTimeout(() => { promptEl.style.display = "none"; }, 1500);
                document.getElementById("export-cookies").addEventListener(
                  "click",
                  () => { b(); },
                  { once: !0 }
                );
              };
            } else {
              prosseguirComAbaAtual();
            }
          });
        } else {
          prosseguirComAbaAtual();
        }
      }
      document.getElementById("export-cookies").addEventListener(
        "click",
        () => { b(); },
        { once: !0 }
      );
      ((document.getElementById("sessionDurationText").innerHTML = a["1M"]),
        document
          .getElementById("sessionDurationText")
          .addEventListener("click", () => {
            var e;
            c
              ? ((c = !1),
                (e = document.getElementById(
                  "sessionDurationText",
                )).classList.remove("sp-duration-upsell"),
                (i = 5),
                (E = "1M"),
                (e.innerHTML = a["1M"]),
                H())
              : chrome.storage.local.get(["userPreferences"], function (e) {
                  var e = e.userPreferences,
                    t = document.getElementById("sessionDurationText"),
                    e = 1 === e.paidUser,
                    n = e ? o : r,
                    s = n[i];
                  ((t.innerHTML = a[s] || s),
                    (E = s),
                    (i = (i + 1) % n.length),
                    e ||
                      0 !== i ||
                      ((i = -1),
                      (c = !0),
                      setTimeout(function () {
                        ((t.innerHTML = "1 yr+ ★"),
                          t.classList.add("sp-duration-upsell"));
                      }, 1200)),
                    -1 === i && (i = 0));
                });
          }),
        document.getElementById("export-cookies").addEventListener(
          "click",
          () => {
            b();
          },
          { once: !0 },
        ),
        f.addEventListener("animationend", (e) => {
          f.classList.contains("fadeInUp") || $();
        }),
        document
          .getElementById("notification")
          .addEventListener("click", (e) => {
            (J(),
              (document.getElementById("notification").style.zIndex = -1e3));
          }),
        S.on("cookiesChanged", W),
        S.on("ready", z),
        T(),
        M.isFirefox() &&
          (e = document.documentElement.clientWidth) < 500 &&
          (console.log("Editor is smaller than 500px!"),
          (document.body.style.minWidth = "100%"),
          (document.body.style.width = e + "px")),
        l(),
        Y(),
        new Promise((s, e) => {
          _("getPaidStatus", {}, function (n) {
            chrome.storage.local.get(["userPreferences"], function (e) {
              var t = e.userPreferences || {};
              ((t.paidUser = n ? 1 : 0),
                chrome.storage.local.set({ userPreferences: t }, function () {
                  (w(), x(), j(), Y(), s(t.paidUser));
                }));
            });
          });
        }));
      var s = 300;
      function d(t) {
        (clearTimeout(n),
          null != t && 0 < t.length && t != h
            ? (n = setTimeout(
                function (e) {
                  _("retrievePresence", { spid: t }, function (e) {
                    document.getElementById("sendto-spid").style.borderColor =
                      1 == e ? "#3ce60e" : "#ffea23";
                  });
                },
                s,
                this,
              ))
            : (document.getElementById("sendto-spid").style.borderColor =
                "#ffea23"));
      }
      N(function () {
        document
          .getElementById("sendto-spid")
          .addEventListener("keyup", function () {
            d(document.getElementById("sendto-spid").value);
          });
      });
      var t = "MainPage";
      function l() {
        var o = document.getElementById("friend-error"),
          a = document.getElementById("friend-error-container"),
          i = document.getElementById("suggestedfriends-label"),
          c = document.getElementById("friends-label");
        (g &&
          (g.innerHTML =
            '<div class="friends-skeleton"><div class="friend-skeleton-row"><div class="skeleton-avatar"></div><div class="skeleton-name"></div></div><div class="friend-skeleton-row"><div class="skeleton-avatar"></div><div class="skeleton-name" style="width:50%"></div></div><div class="friend-skeleton-row"><div class="skeleton-avatar"></div><div class="skeleton-name" style="width:70%"></div></div></div>'),
          p && (p.innerHTML = ""),
          i && (i.style.display = "none"),
          c && (c.style.display = "none"),
          o && (o.innerHTML = ""),
          a && (a.style.display = "none"),
          _("getMutualFriends", {}, function (e) {
            var t, n, s, r;
            (g && (g.innerHTML = ""),
              e &&
                e.result &&
                0 < e.result.length &&
                ((i.style.display = "block"),
                (t = Math.floor(Math.random() * e.result.length)),
                (e = e.result[t]),
                (t = document.createElement("ul")),
                (n = document.createElement("li")),
                (s = "online" == e.currentStatus ? " online" : " offline"),
                (r = "online" == e.currentStatus ? ' class="online"' : ""),
                (n.innerHTML =
                  '<div class="header container listItem frienditem' +
                  s +
                  '" id="' +
                  e.username +
                  '"><a href=#><svg' +
                  r +
                  ' id="icon" width="30" height="30"> <use xlink:href="../sprites/userIcons/animal-rights-1.svg#Layer_1"</use></svg><span>' +
                  e.username +
                  '</span></a><img value="' +
                  e.username +
                  '" id="addSuggestedFriend" src="../../icons/userPlus.svg"></div>'),
                t.appendChild(n),
                g.appendChild(t),
                document
                  .querySelectorAll(
                    "#friends-suggested .container #addSuggestedFriend",
                  )
                  .forEach(function (r) {
                    r.addEventListener("click", function (e) {
                      var t,
                        n = (t = r).getAttribute("value"),
                        s = function (e) {
                          e
                            ? R(
                                chrome.i18n.getMessage("Unable_to_add_friend") +
                                  e,
                              )
                            : (t.parentNode.remove(t), l());
                        };
                      _("addFriend", { friendspid: n }, function (e) {
                        s(e || null);
                      });
                    });
                  })));
          }),
          _("getFriends", {}, function (e) {
            p && (p.innerHTML = "");
            var t = document.createElement("ul");
            if (e && e.result && 0 < e.result.length) {
              c.style.display = "block";
              for (var n of e.result) {
                var s = document.createElement("li"),
                  r = ((e) => {
                    var e = e.charAt(0),
                      t = "../sprites/userIcons/animal-rights-1.svg#Layer_1";
                    switch (e) {
                      case "1":
                      case "2":
                      case "3":
                      case "4":
                      case "5":
                        t = "../sprites/userIcons/real-estate.svg#Layer_1";
                        break;
                      case "6":
                      case "7":
                      case "8":
                      case "9":
                      case "0":
                        t = "../sprites/userIcons/money.svg#Layer_1";
                        break;
                      case "a":
                      case "A":
                        t = "../sprites/userIcons/donation-3.svg#Layer_1";
                        break;
                      case "b":
                      case "B":
                        t = "../sprites/userIcons/umbrella.svg#Layer_1";
                        break;
                      case "c":
                      case "C":
                        t = "../sprites/userIcons/donation.svg#Layer_1";
                        break;
                      case "d":
                      case "D":
                        t = "../sprites/userIcons/megaphone.svg#Layer_1";
                        break;
                      case "e":
                      case "E":
                        t = "../sprites/userIcons/solidarity-1.svg#Layer_1";
                        break;
                      case "f":
                      case "F":
                        t = "../sprites/userIcons/sos.svg#Layer_1";
                        break;
                      case "g":
                      case "G":
                        t = "../sprites/userIcons/shelter-1.svg#Layer_1";
                        break;
                      case "h":
                      case "H":
                        t = "../sprites/userIcons/smartphone.svg#Layer_1";
                        break;
                      case "i":
                      case "I":
                        t = "../sprites/userIcons/scholarship.svg#Layer_1";
                        break;
                      case "j":
                      case "J":
                        t = "../sprites/userIcons/gift.svg#Layer_1";
                        break;
                      case "k":
                      case "K":
                        t = "../sprites/userIcons/shirt.svg#Layer_1";
                        break;
                      case "l":
                      case "L":
                        t = "../sprites/userIcons/shield.svg#Layer_1";
                        break;
                      case "m":
                      case "M":
                        t = "../sprites/userIcons/money-1.svg#Layer_1";
                        break;
                      case "n":
                      case "N":
                        t = "../sprites/userIcons/flower.svg#Layer_1";
                        break;
                      case "o":
                      case "O":
                        t = "../sprites/userIcons/ecologism.svg#Layer_1";
                        break;
                      case "p":
                      case "P":
                        t = "../sprites/userIcons/world.svg#Layer_1";
                        break;
                      case "q":
                      case "Q":
                        t = "../sprites/userIcons/social-services.svg#Layer_1";
                        break;
                      case "r":
                      case "R":
                        t = "../sprites/userIcons/trial.svg#Layer_1";
                        break;
                      case "s":
                      case "S":
                        t = "../sprites/userIcons/shelter.svg#Layer_1";
                        break;
                      case "t":
                      case "T":
                        t = "../sprites/userIcons/shop.svg#Layer_1";
                        break;
                      case "u":
                      case "U":
                        t = "../sprites/userIcons/groceries.svg#Layer_1";
                        break;
                      case "v":
                      case "V":
                        t = "../sprites/userIcons/lifeguard.svg#Layer_1";
                        break;
                      case "w":
                      case "W":
                        t = "../sprites/userIcons/charity-2.svg#Layer_1";
                        break;
                      case "x":
                      case "X":
                        t = "../sprites/userIcons/health-clinic.svg#Layer_1";
                        break;
                      case "y":
                      case "Y":
                        t = "../sprites/userIcons/porridge.svg#Layer_1";
                        break;
                      case "z":
                      case "Z":
                        t = "../sprites/userIcons/ecologism.svg#Layer_1";
                    }
                    return t;
                  })(n.username);
                ((s.innerHTML =
                  '<div class="header container listItem frienditem' +
                  ("online" == n.currentStatus ? " online" : " offline") +
                  '" id="' +
                  n.username +
                  '"><a href=#><svg' +
                  ("online" == n.currentStatus ? ' class="online"' : "") +
                  ' id="icon" width="30" height="30"> <use xlink:href="' +
                  r +
                  '"</use></svg><span>' +
                  n.username +
                  "</span></a><label class='gs-checkbox-wrap' data-spid='" +
                  n.username +
                  "'><input type='checkbox' class='gs-checkbox' tabindex='-1'><span class='gs-checkmark'></span></label><text class='removeListItem' value='removeFriend' id=" +
                  n.username +
                  ">X</text></div>"),
                  t.appendChild(s));
              }
            } else
              (g && (g.innerHTML = ""),
                (a.style.display = "block"),
                (o.innerHTML += chrome.i18n.getMessage("No_friends_message")));
            (p.appendChild(t),
              document
                .querySelectorAll(
                  "#friends-main .container text[value=removeFriend]",
                )
                .forEach(function (r) {
                  r.addEventListener("click", function (e) {
                    var t,
                      n = (t = r).getAttribute("id"),
                      s = function (e) {
                        e
                          ? R(
                              chrome.i18n.getMessage(
                                "Unable_to_remove_friend",
                              ) + e,
                            )
                          : (t.parentNode.remove(t), l());
                      };
                    _("removeFriend", { friendspid: n }, function (e) {
                      s(e || null);
                    });
                  });
                }),
              document
                .querySelectorAll("#friends-main .frienditem")
                .forEach(function (n) {
                  n.addEventListener("click", function (e) {
                    var t;
                    e.target.closest(".gs-checkbox-wrap") ||
                      "removeListItem" === e.target.className ||
                      ((t = n),
                      "removeListItem" != (e = e).target.className &&
                        ((e = t.getAttribute("id")),
                        (t = document.getElementById("sendto-spid"))) &&
                        (d((t.value = e)), O("MainPage")));
                  });
                  var e = n.getAttribute("id");
                  -1 < k.indexOf(e) &&
                    (n.classList.add("gs-selected"),
                    (e = n.querySelector(".gs-checkbox"))) &&
                    (e.checked = !0);
                }),
              document
                .querySelectorAll("#friends-main .gs-checkbox")
                .forEach(function (o) {
                  o.addEventListener("change", function (e) {
                    e.stopPropagation();
                    var t,
                      n,
                      s,
                      e = o.closest(".gs-checkbox-wrap"),
                      r = e.getAttribute("data-spid"),
                      e = e.closest(".frienditem");
                    ((t = r),
                      (n = e),
                      (r = k.indexOf(t)),
                      (s = n ? n.querySelector(".gs-checkbox") : null),
                      -1 < r
                        ? (k.splice(r, 1),
                          n && n.classList.remove("gs-selected"),
                          s && (s.checked = !1),
                          u())
                        : C()
                            .then(function (e) {
                              e = e ? 15 : 0;
                              0 == e
                                ? (s && (s.checked = !1),
                                  R(
                                    "Upgrade to Infinity Claude+ to unlock group sharing",
                                  ),
                                  H())
                                : k.length >= e
                                  ? (s && (s.checked = !1),
                                    R(
                                      "Maximum " +
                                        e +
                                        " friends per group share",
                                    ))
                                  : (k.push(t),
                                    n && n.classList.add("gs-selected"),
                                    s && (s.checked = !0),
                                    u());
                            })
                            .catch(function () {
                              (s && (s.checked = !1),
                                R(
                                  "Upgrade to Infinity Claude+ to unlock group sharing",
                                ));
                            }));
                  });
                }));
          }));
      }
      function u() {
        var e = document.getElementById("group-share-bar"),
          t = document.getElementById("group-share-avatars"),
          n = document.getElementById("group-share-count"),
          s = document.getElementById("sendto-spid-single"),
          r = document.getElementById("sendto-spid");
        if (0 === k.length)
          ((e.style.display = "none"),
            s && (s.style.display = ""),
            r && (r.value = ""));
        else {
          ((e.style.display = "flex"),
            s && (s.style.display = "none"),
            r && (r.value = k[0]));
          for (var o = "", a = Math.min(k.length, 5), i = 0; i < a; i++)
            o +=
              '<div class="gs-avatar">' +
              k[i].charAt(0).toUpperCase() +
              "</div>";
          (5 < k.length &&
            (o += '<div class="gs-avatar">+' + (k.length - 5) + "</div>"),
            (t.innerHTML = o),
            (n.textContent =
              "Sharing with " +
              k.length +
              (1 === k.length ? " friend" : " friends")));
        }
      }
      function I() {
        ((k = []),
          document
            .querySelectorAll("#friends-main .frienditem.gs-selected")
            .forEach(function (e) {
              e.classList.remove("gs-selected");
              e = e.querySelector(".gs-checkbox");
              e && (e.checked = !1);
            }),
          u());
      }
      (document
        .getElementById("open-accounts")
        .addEventListener("click", () => {
          O((t = "MainPage"));
        }),
        document
          .getElementById("open-friends")
          .addEventListener("click", () => {
            O((t = "FriendsPage"));
          }),
        chrome.storage.local.get(
          ["seenReferralHighlight", "currentspid"],
          function (e) {
            e.currentspid &&
              !e.seenReferralHighlight &&
              (e = document.getElementById("anytimeSharingAlert")) &&
              ((e.textContent = "●"), (e.style.display = "block"));
          },
        ),
        document.getElementById("settings").addEventListener("click", () => {
          var e;
          "block" == v.style.display && "MainPage" == t
            ? O("MainPage")
            : "block" == v.style.display && "FriendsPage" == t
              ? O("FriendsPage")
              : ((e = document.getElementById("anytimeSharingAlert")) &&
                  ((e.textContent = " "), (e.style.display = "none")),
                (e = document.getElementById("anytimeSharingSettingsAlert")) &&
                  ((e.textContent = " "), (e.style.display = "none")),
                chrome.storage.local.set({ seenReferralHighlight: !0 }),
                w(),
                x(),
                O("SettingsPage"));
        }),
        document
          .getElementById("group-share-clear")
          .addEventListener("click", function () {
            I();
          }),
        document.getElementById("night-mode").addEventListener("click", (e) => {
          P();
        }),
        chrome.tabs.query({ active: !0, currentWindow: !0 }, function (e) {
          var t;
          e &&
            e[0] &&
            ((t = new URL(e[0].url).hostname),
            chrome.storage.local.get(t, function (e) {
              e &&
                e[t] &&
                e[t].Status &&
                "Received" == e[t].Status &&
                document.body.classList.add("disable-Infinity", "ClaudeButton");
            }));
        }));
    }),
    chrome.tabs.query({ active: !0, currentWindow: !0 }, function (e) {
      new URL(e[0].url);
      chrome.storage.local.get(null, function (o) {
        var e,
          t = Object.keys(o);
        0 <
        t.filter(function (e) {
          return !c.includes(e);
        }).length
          ? ((a = document.createElement("ul")).setAttribute(
              "id",
              "sessionList",
            ),
            t.forEach(function (e) {
              var t, n, s, r;
              c.includes(e) ||
                (o[e].Pending &&
                  ((t = E(e) + " (Pending)"),
                  (n = o[e].Duration),
                  (s = document.createElement("li")),
                  (r = b((r = o[e].LogoURL), o[e].b64Logo)),
                  (s.innerHTML =
                    '<div class="header container listItem infinityclaudeedlink infinityclaudeedlinkPending"><a href=http://infinityclaude.pro><img id="icon" width="30" height="30" src="' +
                    r +
                    '"><span>' +
                    t +
                    "</span></a><text class='sharedDuration sharedDurationPending'>" +
                    n +
                    "</text><text class='removeListItem' value='removeListItem' id=" +
                    e +
                    ">X</text><text class='acceptStorage' value='acceptStorage' id=" +
                    e +
                    ">✓</text></div>"),
                  a.appendChild(s)));
            }),
            t.forEach(function (r) {
              c.includes(r) ||
                o[r].Pending ||
                chrome.alarms.get(r, function (e) {
                  var t = E(r),
                    n = "";
                  if ("Owned" != o[r].Duration) {
                    if (!e)
                      return (
                        console.log("Removing Session as alarm expired"),
                        void _("deleteSession", { dom: r })
                      );
                    if (
                      ((e = e.scheduledTime - Math.floor(new Date().getTime())),
                      (n =
                        42e4 <= (s = (s = e) / 1e3 / 60)
                          ? "1Y"
                          : 31e3 <= s
                            ? ((s /= 43800), (s = Math.round(s)) + "M")
                            : 14400 <= s
                              ? ((s /= 10080), (s = Math.round(s)) + "w")
                              : 1439 <= s
                                ? ((s /= 1440), (s = Math.round(s)) + "d")
                                : 59 <= s
                                  ? ((s /= 60), (s = Math.round(s)) + "h")
                                  : (s = 0 == (s = Math.round(s)) ? 1 : s) +
                                    "m"),
                      console.log("Time Left for " + r + ": " + e),
                      e <= 0)
                    )
                      return (
                        console.log("Removing Session as timer expired"),
                        void _("deleteSession", { dom: r })
                      );
                  }
                  var s = b(o[r].LogoURL, o[r].b64Logo),
                    e = document.createElement("li");
                  var removeBtnHtml = (typeof CLIENT_MODE !== "undefined" && CLIENT_MODE) ? "" : "<text class='removeListItem' value='removeListItem' id=" + r + ">X</text>";
                  let targetUrl = "https://" + r;
                  if (r.includes("seopack")) {
                    targetUrl = "https://seopack.org/v2/dashboard/";
                  } else if (r.includes("toolzbuy")) {
                    targetUrl = "https://app.toolzbuy.com/member/";
                  }
                  
                  ((e.innerHTML =
                    '<div class="header container listItem infinityclaudeedlink"><a href="' +
                    targetUrl +
                    '"><img id="icon" width="30" height="30" src="' +
                    s +
                    '"><span>' +
                    t +
                    "</span></a><text class='sharedDuration'>" +
                    n +
                    "</text>" + removeBtnHtml + "</div>"),
                    a.appendChild(e),
                    l());
                });
            }),
            m && m.firstChild
              ? ((i = !0),
                Animate.transitionPage(m, m.firstChild, a, "right", () => {
                  i = !1;
                }))
              : m && m.appendChild(a),
            document
              .querySelectorAll(".container > text[value=acceptStorage]")
              .forEach(function (t) {
                t.addEventListener("click", function () {
                  ((l = (d = t).getAttribute("id")),
                    chrome.storage.local.get(l, function (e) {
                      var t = e[l],
                        n = l.replace(".pending", ""),
                        t =
                          ((t.Pending = !1),
                          chrome.storage.local.set({ [n]: t }),
                          document.getElementsByTagName("UL")[1]),
                        s = E(l),
                        r = b(e[l].LogoURL, e[l].b64Logo),
                        o = e[l].Duration,
                        a = document.createElement("li"),
                        i =
                          ((a.innerHTML =
                            '<div class="header container listItem infinityclaudeedlink"><a href=https://' +
                            n +
                            '><img id="icon" width="30" height="30" src="' +
                            r +
                            '"><span>' +
                            s +
                            "</span></a><text class='sharedDuration'>" +
                            o +
                            "</text><text class='removeListItem' value='removeListItem' id=" +
                            n +
                            ">X</text></div>"),
                          t.insertBefore(a, t.childNodes[0]),
                          m.appendChild(t),
                          d.parentNode.parentNode.remove(d),
                          a.querySelector(".infinityclaudeedlink > a")),
                        c = a.querySelector(
                          ".container > text[value=removeListItem]",
                        );
                      (i.addEventListener("click", function () {
                        u(i);
                      }),
                        c.addEventListener("click", function () {
                          D(c);
                        }),
                        _("createTimer", {
                          domTimer: n,
                          duration: e[l].Duration,
                        }));
                    }));
                  var d,
                    l,
                    e = l;
                  chrome.storage.local.remove(e);
                });
              }),
            l())
          : null != h
            ? n()
            : ((e = setInterval(function () {
                null != h && (clearInterval(e), n());
              }, 100)),
              setTimeout(function () {
                clearInterval(e);
              }, 5e3));
      });
    }),
    x(),
    document.addEventListener("DOMContentLoaded", () => {
      // Rotina de atualização e limpeza de logs persistentes de sincronização
      const logsTextarea = document.getElementById("debug-logs-textarea");
      const clearLogsBtn = document.getElementById("clear-logs-btn");
      
      function updateLogs() {
        if (logsTextarea) {
          chrome.storage.local.get(["debug_logs"], function(data) {
            const logs = data.debug_logs || [];
            logsTextarea.value = logs.join("\n");
            logsTextarea.scrollTop = logsTextarea.scrollHeight; // Rola para o final automaticamente
          });
        }
      }
      
      if (clearLogsBtn) {
        clearLogsBtn.addEventListener("click", () => {
          chrome.storage.local.remove("debug_logs", () => {
            if (logsTextarea) logsTextarea.value = "";
          });
        });
      }
      
      updateLogs();
      setInterval(updateLogs, 1500);

      var e = document.getElementById("openLeaderboardLink");
      e &&
        e.addEventListener("click", (e) => {
          (e.preventDefault(), console.log("🏆 Opening leaderboard..."));
          var e = document.getElementById("referFriendPrompt"),
            t = document.getElementById("modalBackground");
          (e && (e.style.display = "none"), t && (t.style.display = "none"));
          {
            let e = document.createElement("div"),
              a =
                ((e.id = "leaderboardModal"),
                (e.className = "modal sp-leaderboard-modal"),
                (e.innerHTML = `
    <div class="modal-content">
      <div class="sp-lb-header">
        <div class="sp-lb-trophy">&#127942;</div>
        <h2 class="sp-lb-title">Leaderboard</h2>
        <p class="sp-lb-subtitle">Top referrers win $5,000 in rewards</p>
      </div>
      <div class="sp-lb-list" id="leaderboardBody">
        <div class="sp-lb-loading">Loading...</div>
      </div>
      <button id="closeLeaderboard" class="sp-cta-primary modal-button" style="margin-top:12px;">Close</button>
    </div>
  `),
                document.body.appendChild(e),
                (e.style.display = "block"),
                document
                  .getElementById("closeLeaderboard")
                  .addEventListener("click", () => {
                    e.remove();
                  }),
                document.getElementById("leaderboardBody"));
            chrome.runtime.sendMessage(
              { type: "getLeaderboard" },
              function (e) {
                var t, o;
                ((a.innerHTML = ""),
                  e && e.success
                    ? (t = (e.leaderboard || []).slice(0, 10)) && 0 !== t.length
                      ? ((o = ["&#129351;", "&#129352;", "&#129353;"]),
                        t.forEach(function (e, t) {
                          var n = t + 1,
                            s = document.createElement("div"),
                            t =
                              ((s.className = "sp-lb-row"),
                              n <= 3 && s.classList.add("sp-lb-top3"),
                              e.spid === h && s.classList.add("sp-lb-you"),
                              n <= 3 ? o[t] : n),
                            r =
                              e.spid === h
                                ? ' <span class="sp-lb-you-badge">You</span>'
                                : "";
                          ((s.innerHTML =
                            '<span class="sp-lb-rank">' +
                            t +
                            '</span><span class="sp-lb-name">' +
                            e.spid +
                            r +
                            '</span><span class="sp-lb-pos">#' +
                            n +
                            "</span>"),
                            a.appendChild(s));
                        }))
                      : (a.innerHTML =
                          '<div class="sp-lb-empty">No referrals yet. Be the first!</div>')
                    : (console.error(
                        "Failed to load leaderboard:",
                        e && e.error,
                      ),
                      (a.innerHTML =
                        '<div class="sp-lb-empty">Unable to load leaderboard.</div>')));
              },
            );
          }
        });
    }));
})();
