class App {
  init() {
    this.initComponents(),
      this.initPreloader(),
      this.initPortletCard(),
      this.initMultiDropdown(),
      this.initFormValidation(),
      this.initCounter(),
      this.initCodePreview(),
      this.initToggle(),
      this.initDismissible(),
      this.initLeftSidebar(),
      this.initTopbarMenu();
  }
  initComponents() {
    "function" == typeof lucide.createIcons && lucide.createIcons(),
      document.querySelectorAll('[data-bs-toggle="popover"]').forEach((e) => {
        new bootstrap.Popover(e);
      }),
      document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((e) => {
        new bootstrap.Tooltip(e);
      }),
      document.querySelectorAll(".offcanvas").forEach((e) => {
        new bootstrap.Offcanvas(e);
      }),
      document.querySelectorAll(".toast").forEach((e) => {
        new bootstrap.Toast(e);
      });
  }
  initPreloader() {
    window.addEventListener("load", () => {
      var e = document.getElementById("status");
      let t = document.getElementById("preloader");
      e && (e.style.display = "none"),
        t && setTimeout(() => (t.style.display = "none"), 350);
    });
  }
  initPortletCard() {
    document.querySelectorAll('[data-action="card-close"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        let t = a.closest(".card");
        t &&
          ((t.style.transition = "opacity 0.3s ease"),
          (t.style.opacity = "0"),
          setTimeout(() => t.remove(), 300));
      });
    }),
      document.querySelectorAll('[data-action="card-toggle"]').forEach((o) => {
        o.addEventListener("click", (e) => {
          e.preventDefault();
          var e = o.closest(".card"),
            t = o.querySelector("i"),
            e =
              (e.querySelectorAll(".card-body, .card-footer"),
              o.closest(".card"));
          let a = e.querySelector(".card-body");
          a.style.transition = "height, margin, 0.35s ease-in-out";
          var i = a.scrollHeight;
          e.classList.contains("card-collapsed")
            ? ((a.style.height = "0"),
              (a.style.overflow = "hidden"),
              a.offsetHeight,
              e.classList.remove("card-collapsed"),
              (a.style.height = i + "px"),
              setTimeout(function () {
                (a.style.overflow = "visible"), (a.style.height = "auto");
              }, 350))
            : ((a.style.height = i + "px"),
              (a.style.overflow = "hidden"),
              a.offsetHeight,
              e.classList.add("card-collapsed"),
              (a.style.height = "0")),
            t &&
              (t.classList.toggle("ti-chevron-up"),
              t.classList.toggle("ti-chevron-down"));
        });
      }),
      document.querySelectorAll('[data-action="card-refresh"]').forEach((i) => {
        i.addEventListener("click", (e) => {
          e.preventDefault();
          var t,
            e = i.closest(".card");
          let a = e.querySelector(".card-overlay");
          a ||
            (((a = document.createElement("div")).className = "card-overlay"),
            ((t = document.createElement("div")).className =
              "spinner-border text-primary"),
            a.appendChild(t),
            e.appendChild(a)),
            (a.style.display = "flex"),
            setTimeout(() => {
              a.style.display = "none";
            }, 1500);
        });
      });
  }
  initMultiDropdown() {
    document
      .querySelectorAll(".dropdown-menu a.dropdown-toggle")
      .forEach((a) => {
        a.addEventListener("click", function (e) {
          e.preventDefault(), e.stopPropagation();
          e = a.closest(".dropdown-menu");
          let t = a.nextElementSibling;
          e.querySelectorAll(".dropdown-menu").forEach((e) => {
            e !== t && e.classList.remove("show");
          }),
            e.querySelectorAll("a.dropdown-toggle").forEach((e) => {
              e !== a && e.classList.remove("show");
            });
        });
      });
  }
  initFormValidation() {
    document.querySelectorAll(".needs-validation").forEach((t) => {
      t.addEventListener(
        "submit",
        (e) => {
          t.checkValidity() || (e.preventDefault(), e.stopPropagation()),
            t.classList.add("was-validated");
        },
        !1
      );
    });
  }
  initCounter() {
    var e = document.querySelectorAll("[data-target]");
    let t = new IntersectionObserver(
      (e, n) => {
        e.forEach((s) => {
          if (s.isIntersecting) {
            let e = s.target,
              t = e.getAttribute("data-target").replace(/,/g, ""),
              a = ((t = parseFloat(t)), 0),
              i,
              o =
                ((i = Number.isInteger(t) ? Math.floor(t / 25) : t / 25),
                () => {
                  a < t
                    ? ((a += i) > t && (a = t),
                      (e.innerText = r(a)),
                      requestAnimationFrame(o))
                    : (e.innerText = r(t));
                });
            function r(e) {
              return e % 1 == 0
                ? e.toLocaleString()
                : e.toLocaleString(void 0, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  });
            }
            o(), n.unobserve(e);
          }
        });
      },
      { threshold: 1 }
    );
    e.forEach((e) => t.observe(e));
  }
  initCodePreview() {
    "undefined" != typeof Prism &&
      Prism.plugins &&
      Prism.plugins.NormalizeWhitespace &&
      Prism.plugins.NormalizeWhitespace.setDefaults({
        "remove-trailing": !0,
        "remove-indent": !0,
        "left-trim": !0,
        "right-trim": !0,
        "tabs-to-spaces": 4,
        "spaces-to-tabs": 4,
      });
  }
  initToggle() {
    document.querySelectorAll("[data-toggler]").forEach((e) => {
      let t = e.querySelector("[data-toggler-on]"),
        a = e.querySelector("[data-toggler-off]"),
        i = "on" === e.getAttribute("data-toggler"),
        o = () => {
          i
            ? (t?.classList.remove("d-none"), a?.classList.add("d-none"))
            : (t?.classList.add("d-none"), a?.classList.remove("d-none"));
        };
      t?.addEventListener("click", () => {
        (i = !1), o();
      }),
        a?.addEventListener("click", () => {
          (i = !0), o();
        }),
        o();
    });
  }
  initDismissible() {
    document.querySelectorAll("[data-dismissible]").forEach((t) => {
      t.addEventListener("click", () => {
        var e = t.getAttribute("data-dismissible"),
          e = document.querySelector(e);
        e && e.remove();
      });
    });
  }
  initLeftSidebar() {
    let s = document.querySelector(".side-nav");
    if (s) {
      s.querySelectorAll("li [data-bs-toggle='collapse']").forEach((e) => {
        e.addEventListener("click", (e) => e.preventDefault());
      });
      let o = s.querySelectorAll("li .collapse"),
        e =
          (o.forEach((e) => {
            e.addEventListener("show.bs.collapse", (e) => {
              let t = e.target,
                a = [],
                i = t.parentElement;
              for (; i && i !== s; )
                i.classList.contains("collapse") && a.push(i),
                  (i = i.parentElement);
              o.forEach((e) => {
                e === t ||
                  a.includes(e) ||
                  new bootstrap.Collapse(e, { toggle: !1 }).hide();
              });
            });
          }),
          window.location.href.split(/[?#]/)[0]);
      s.querySelectorAll("a").forEach((t) => {
        if (t.href === e) {
          s
            .querySelectorAll("a.active, li.active, .collapse.show")
            .forEach((e) => {
              e.classList.remove("active"), e.classList.remove("show");
            }),
            t.classList.add("active");
          let e = t.closest("li");
          for (; e && e !== s; ) {
            e.classList.add("active");
            var a = e.closest(".collapse");
            e = a
              ? (new bootstrap.Collapse(a, { toggle: !1 }).show(),
                (a = a.closest("li")) && a.classList.add("active"),
                a)
              : e.parentElement;
          }
        }
      }),
        setTimeout(() => {
          var e = s.querySelector("li.active .active"),
            t = document.querySelector(
              ".sidenav-menu .simplebar-content-wrapper"
            );
          if (e && t) {
            e = e.offsetTop - 300;
            if (100 < e) {
              var n = t;
              t = e;
              var l = 600;
              let o = n.scrollTop,
                s = t - o,
                r = 0;
              !(function e() {
                var t, a, i;
                (r += 20),
                  (n.scrollTop =
                    ((t = r),
                    (a = o),
                    (i = s),
                    (t /= l / 2) < 1
                      ? (i / 2) * t * t + a
                      : (-i / 2) * (--t * (t - 2) - 1) + a)),
                  r < l && setTimeout(e, 20);
              })();
            }
          }
        }, 200);
    }
  }
  initTopbarMenu() {
    var i = document.querySelector(".navbar-nav");
    if (i) {
      let t = window.location.href.split(/[?#]/)[0];
      i.querySelectorAll("li a").forEach((e) => {
        if (e.href === t) {
          e.classList.add("active");
          let t = e.parentElement;
          for (let e = 0; e < 6 && t && t !== document.body; e++)
            ("LI" !== t.tagName && !t.classList.contains("dropdown")) ||
              t.classList.add("active"),
              (t = t.parentElement);
        }
      });
      let e = document.querySelector(".navbar-toggle"),
        a = document.getElementById("navigation");
      e &&
        a &&
        e.addEventListener("click", () => {
          e.classList.toggle("open"),
            "block" === a.style.display
              ? (a.style.display = "none")
              : (a.style.display = "block");
        });
    }
  }
}
let skinPresets = {
  default: {
    theme: "light",
    topbar: "dark",
    menu: "light",
    sidenav: { user: !1 },
  },
  modern: {
    theme: "light",
    topbar: "light",
    menu: "gradient",
    sidenav: { user: !1 },
  },
  material: {
    theme: "light",
    topbar: "light",
    menu: "dark",
    sidenav: { user: !0 },
  },
  saas: {
    theme: "light",
    topbar: "light",
    menu: "light",
    sidenav: { user: !0 },
  },
  minimal: {
    theme: "light",
    topbar: "light",
    menu: "gray",
    sidenav: { user: !1 },
  },
  flat: {
    theme: "light",
    topbar: "light",
    menu: "dark",
    sidenav: { user: !1 },
  },
};
class LayoutCustomizer {
  constructor() {
    (this.html = document.documentElement), (this.config = {});
  }
  init() {
    this.initConfig(),
      this.initSwitchListener(),
      this.monochromeMode(),
      this.initfullScreenListener(),
      this.initWindowSize(),
      this._adjustLayout(),
      this.setSwitchFromConfig(),
      this.openCustomizer();
  }
  initConfig() {
    (this.defaultConfig = JSON.parse(JSON.stringify(window.defaultConfig))),
      (this.config = JSON.parse(JSON.stringify(window.config))),
      this.setSwitchFromConfig();
  }
  isFirstVisit() {
    return (
      !localStorage.getItem("__user_has_visited__") &&
      (localStorage.setItem("__user_has_visited__", "true"), !0)
    );
  }
  monochromeMode() {
    var e = document.getElementById("monochrome-mode");
    e &&
      e.addEventListener("click", () => {
        (this.config.monochrome = !this.config.monochrome),
          this.config.monochrome
            ? this.html.classList.add("monochrome")
            : this.html.classList.remove("monochrome"),
          this.setSwitchFromConfig();
      });
  }
  initfullScreenListener() {
    var e = document.querySelector('[data-toggle="fullscreen"]');
    e &&
      e.addEventListener("click", function (e) {
        e.preventDefault(),
          document.body.classList.toggle("fullscreen-enable"),
          document.fullscreenElement ||
          document.mozFullScreenElement ||
          document.webkitFullscreenElement
            ? document.cancelFullScreen
              ? document.cancelFullScreen()
              : document.mozCancelFullScreen
              ? document.mozCancelFullScreen()
              : document.webkitCancelFullScreen &&
                document.webkitCancelFullScreen()
            : document.documentElement.requestFullscreen
            ? document.documentElement.requestFullscreen()
            : document.documentElement.mozRequestFullScreen
            ? document.documentElement.mozRequestFullScreen()
            : document.documentElement.webkitRequestFullscreen &&
              document.documentElement.webkitRequestFullscreen(
                Element.ALLOW_KEYBOARD_INPUT
              );
      });
  }
  openCustomizer() {
    var t = document.getElementById("theme-settings-offcanvas");
    if (t && this.isFirstVisit()) {
      let e = new bootstrap.Offcanvas(t);
      setTimeout(() => {
        e.show();
      }, 1e3);
    }
  }
  applyPreset(e) {
    e = skinPresets?.[e];
    e &&
      (e.theme &&
        ((this.config.theme = e.theme),
        this.html.setAttribute("data-bs-theme", e.theme)),
      e.topbar &&
        ((this.config.topbar.color = e.topbar),
        this.html.setAttribute("data-topbar-color", e.topbar)),
      e.menu &&
        ((this.config.menu.color = e.menu),
        this.html.setAttribute("data-menu-color", e.menu)),
      e.sidenav?.size &&
        ((this.config.sidenav.size = e.sidenav.size),
        this.html.setAttribute("data-sidenav-size", e.sidenav.size)),
      void 0 !== e.sidenav?.user) &&
      ((this.config.sidenav.user = e.sidenav.user),
      e.sidenav.user
        ? this.html.setAttribute("data-sidenav-user", "true")
        : this.html.removeAttribute("data-sidenav-user"));
  }
  changeSkin(e) {
    (this.config.skin = e),
      this.html.setAttribute("data-skin", e),
      this.applyPreset(e),
      this.setSwitchFromConfig();
  }
  changeMenuColor(e) {
    (this.config.menu.color = e),
      this.html.setAttribute("data-menu-color", e),
      this.setSwitchFromConfig();
  }
  changeLeftbarSize(e, t = !0) {
    this.html.setAttribute("data-sidenav-size", e),
      t && ((this.config.sidenav.size = e), this.setSwitchFromConfig());
  }
  changeLayoutPosition(e) {
    (this.config.layout.position = e),
      this.html.setAttribute("data-layout-position", e),
      this.setSwitchFromConfig();
  }
  getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  changeTheme(e) {
    "system" === e && this.getSystemTheme();
    (this.config.theme = e),
      this.html.setAttribute(
        "data-bs-theme",
        "system" === e ? this.getSystemTheme() : e
      ),
      this.setSwitchFromConfig();
  }
  changeTopbarColor(e) {
    (this.config.topbar.color = e),
      this.html.setAttribute("data-topbar-color", e),
      this.setSwitchFromConfig();
  }
  changeSidebarUser(e) {
    (this.config.sidenav.user = e)
      ? this.html.setAttribute("data-sidenav-user", e)
      : this.html.removeAttribute("data-sidenav-user"),
      this.setSwitchFromConfig();
  }
  resetTheme() {
    (this.config = JSON.parse(JSON.stringify(window.defaultConfig))),
      this.changeSkin(this.config.skin),
      this.changeMenuColor(this.config.menu.color),
      this.changeLeftbarSize(this.config.sidenav.size),
      this.changeTheme(this.config.theme),
      this.changeLayoutPosition(this.config.layout.position),
      this.changeTopbarColor(this.config.topbar.color),
      this.changeSidebarUser(this.config.sidenav.user),
      this._adjustLayout();
  }
  setSwitchFromConfig() {
    var e = this.config;
    sessionStorage.setItem("__UBOLD_CONFIG__", JSON.stringify(e)),
      document
        .querySelectorAll("#theme-settings-offcanvas input[type=radio]")
        .forEach((e) => (e.checked = !1));
    ((e, t) => {
      e = document.querySelector(e);
      e && (e.checked = t);
    })('input[name="sidebar-user"]', !0 === e.sidenav.user),
      [
        ["data-skin", e.skin],
        ["data-bs-theme", e.theme],
        ["data-layout-position", e.layout.position],
        ["data-topbar-color", e.topbar.color],
        ["data-menu-color", e.menu.color],
        ["data-sidenav-size", e.sidenav.size],
      ].forEach(([e, t]) => {
        e = document.querySelector(`input[name="${e}"][value="${t}"]`);
        e && (e.checked = !0);
      });
  }
  initSwitchListener() {
    var e = (e, t) => {
        document
          .querySelectorAll(e)
          .forEach((e) => e.addEventListener("change", () => t(e)));
      },
      e =
        (e('input[name="data-skin"]', (e) => this.changeSkin(e.value)),
        e('input[name="data-bs-theme"]', (e) => this.changeTheme(e.value)),
        e('input[name="data-menu-color"]', (e) =>
          this.changeMenuColor(e.value)
        ),
        e('input[name="data-sidenav-size"]', (e) =>
          this.changeLeftbarSize(e.value)
        ),
        e('input[name="data-layout-position"]', (e) =>
          this.changeLayoutPosition(e.value)
        ),
        e('input[name="data-topbar-color"]', (e) =>
          this.changeTopbarColor(e.value)
        ),
        e('input[name="sidebar-user"]', (e) =>
          this.changeSidebarUser(e.checked)
        ),
        document.getElementById("light-dark-mode")),
      e =
        (e &&
          e.addEventListener("click", () => {
            var e = "light" === this.config.theme ? "dark" : "light";
            this.changeTheme(e);
          }),
        document.querySelector("#reset-layout")),
      e =
        (e && e.addEventListener("click", () => this.resetTheme()),
        document.querySelector(".sidenav-toggle-button")),
      e =
        (e && e.addEventListener("click", () => this._toggleSidebar()),
        document.querySelector(".button-close-offcanvas"));
    e &&
      e.addEventListener("click", () => {
        this.html.classList.remove("sidebar-enable"), this.hideBackdrop();
      }),
      document.querySelectorAll(".button-on-hover").forEach((e) => {
        e.addEventListener("click", () => {
          var e = this.html.getAttribute("data-sidenav-size");
          this.changeLeftbarSize(
            "on-hover-active" === e ? "on-hover" : "on-hover-active",
            !0
          );
        });
      });
  }
  _toggleSidebar() {
    var e = this.html.getAttribute("data-sidenav-size"),
      t = this.config.sidenav.size;
    "offcanvas" === e
      ? this.showBackdrop()
      : "compact" === t
      ? this.changeLeftbarSize("condensed" === e ? "compact" : "condensed", !1)
      : this.changeLeftbarSize("condensed" === e ? "default" : "condensed", !0),
      this.html.classList.toggle("sidebar-enable");
  }
  showBackdrop() {
    var e = document.createElement("div");
    (e.id = "custom-backdrop"),
      (e.className = "offcanvas-backdrop fade show"),
      document.body.appendChild(e),
      (document.body.style.overflow = "hidden"),
      767 < window.innerWidth && (document.body.style.paddingRight = "15px"),
      e.addEventListener("click", () => {
        this.html.classList.remove("sidebar-enable"), this.hideBackdrop();
      });
  }
  hideBackdrop() {
    var e = document.getElementById("custom-backdrop");
    e &&
      (document.body.removeChild(e),
      (document.body.style.overflow = ""),
      (document.body.style.paddingRight = ""));
  }
  _adjustLayout() {
    var e = window.innerWidth,
      t = this.config.sidenav.size;
    e <= 767.98
      ? this.changeLeftbarSize("offcanvas", !1)
      : e <= 1140 && !["offcanvas"].includes(t)
      ? this.changeLeftbarSize("condensed", !1)
      : this.changeLeftbarSize(t);
  }
  initWindowSize() {
    window.addEventListener("resize", () => this._adjustLayout());
  }
}
let radios = document.querySelectorAll(
    '.thememode-dropdown .dropdown-item input[type="radio"]'
  ),
  items = document.querySelectorAll(".thememode-dropdown .dropdown-item"),
  saved = sessionStorage.getItem("theme");
saved &&
  radios.forEach(
    (e) =>
      e.value === saved &&
      ((e.checked = !0),
      e.closest(".thememode-dropdown .dropdown-item").classList.add("active"))
  ),
  radios.forEach((e) =>
    e.addEventListener("change", () => {
      items.forEach((e) => e.classList.remove("active")),
        e.checked &&
          (e
            .closest(".thememode-dropdown .dropdown-item")
            .classList.add("active"),
          sessionStorage.setItem("theme", e.value));
    })
  );
class Plugins {
  init() {
    this.initFlatPicker(), this.initTouchSpin();
  }
  initFlatPicker() {
    document.querySelectorAll("[data-provider]").forEach((e) => {
      var t = e.getAttribute("data-provider"),
        a = e.attributes,
        i = { disableMobile: !0, defaultDate: new Date() };
      "flatpickr" === t
        ? (a["data-date-format"] &&
            (i.dateFormat = a["data-date-format"].value),
          a["data-enable-time"] &&
            ((i.enableTime = !0), (i.dateFormat += " H:i")),
          a["data-altFormat"] &&
            ((i.altInput = !0), (i.altFormat = a["data-altFormat"].value)),
          a["data-minDate"] && (i.minDate = a["data-minDate"].value),
          a["data-maxDate"] && (i.maxDate = a["data-maxDate"].value),
          a["data-default-date"] &&
            (i.defaultDate = a["data-default-date"].value),
          a["data-multiple-date"] && (i.mode = "multiple"),
          a["data-range-date"] && (i.mode = "range"),
          a["data-inline-date"] &&
            ((i.inline = !0), (i.defaultDate = a["data-default-date"].value)),
          a["data-disable-date"] &&
            (i.disable = a["data-disable-date"].value.split(",")),
          a["data-week-number"] && (i.weekNumbers = !0),
          flatpickr(e, i))
        : "timepickr" === t &&
          ((i = {
            enableTime: !0,
            noCalendar: !0,
            dateFormat: "H:i",
            defaultDate: new Date(),
          }),
          a["data-time-hrs"] && (i.time_24hr = !0),
          a["data-min-time"] && (i.minTime = a["data-min-time"].value),
          a["data-max-time"] && (i.maxTime = a["data-max-time"].value),
          a["data-default-time"] &&
            (i.defaultDate = a["data-default-time"].value),
          a["data-time-inline"] &&
            ((i.inline = !0), (i.defaultDate = a["data-time-inline"].value)),
          flatpickr(e, i));
    });
  }
  initTouchSpin() {
    document.querySelectorAll("[data-touchspin]").forEach((e) => {
      var r = e.querySelector("[data-minus]"),
        n = e.querySelector("[data-plus]");
      let l = e.querySelector("input");
      if (l) {
        let t = Number(l.min),
          a = Number(l.max ?? 0),
          i = Number.isFinite(t),
          o = Number.isFinite(a),
          s = () => Number.parseInt(l.value) || 0;
        l.hasAttribute("readonly") ||
          (r &&
            r.addEventListener("click", () => {
              var e = s() - 1;
              (!i || e >= t) && (l.value = e.toString());
            }),
          n &&
            n.addEventListener("click", () => {
              var e = s() + 1;
              (!o || e <= a) && (l.value = e.toString());
            }));
      }
    });
  }
}
class I18nManager {
  constructor({
    defaultLang: e = "en",
    langPath: t = "assets/data/translations/",
    langImageSelector: a = "#selected-language-image",
    langCodeSelector: i = "#selected-language-code",
    translationKeySelector: o = "[data-lang]",
    translationKeyAttribute: s = "data-lang",
    languageSelector: r = "[data-translator-lang]",
  } = {}) {
    (this.selectedLanguage = sessionStorage.getItem("__UBOLD_LANG__") || e),
      (this.langPath = t),
      (this.langImageSelector = a),
      (this.langCodeSelector = i),
      (this.translationKeySelector = o),
      (this.translationKeyAttribute = s),
      (this.languageSelector = r),
      (this.selectedLanguageImage = document.querySelector(
        this.langImageSelector
      )),
      (this.selectedLanguageCode = document.querySelector(
        this.langCodeSelector
      )),
      (this.languageButtons = document.querySelectorAll(this.languageSelector));
  }
  async init() {
    await this.applyTranslations(),
      this.updateSelectedImage(),
      this.updateSelectedCode(),
      this.bindLanguageSwitchers();
  }
  async loadTranslations() {
    try {
      var e = await fetch("" + this.langPath + this.selectedLanguage + ".json");
      if (e.ok) return await e.json();
      throw new Error(`Failed to load ${this.selectedLanguage}.json`);
    } catch (e) {
      return console.error("Translation load error:", e), {};
    }
  }
  async applyTranslations() {
    let i = await this.loadTranslations();
    document.querySelectorAll(this.translationKeySelector).forEach((e) => {
      var t = e.getAttribute(this.translationKeyAttribute),
        a = ((a = i), t.split(".").reduce((e, t) => e?.[t] ?? null, a));
      a ? (e.innerHTML = a) : console.warn("Missing translation for key: " + t);
    });
  }
  setLanguage(e) {
    (this.selectedLanguage = e),
      sessionStorage.setItem("__UBOLD_LANG__", e),
      this.applyTranslations(),
      this.updateSelectedImage(),
      this.updateSelectedCode();
  }
  updateSelectedImage() {
    var e = document.querySelector(
      `[data-translator-lang="${this.selectedLanguage}"] [data-translator-image]`
    );
    e && this.selectedLanguageImage && (this.selectedLanguageImage.src = e.src),
      e &&
        (document.querySelectorAll(".dropdown-item.active").forEach((e) => {
          e.classList.remove("active");
        }),
        (e = e.closest(".dropdown-item"))) &&
        e.classList.add("active");
  }
  updateSelectedCode() {
    this.selectedLanguageCode &&
      (this.selectedLanguageCode.textContent =
        this.selectedLanguage.toUpperCase());
  }
  bindLanguageSwitchers() {
    this.languageButtons.forEach((t) => {
      t.addEventListener("click", () => {
        var e = t.dataset.translatorLang;
        e && e !== this.selectedLanguage && this.setLanguage(e);
      });
    });
  }
}
document.addEventListener("DOMContentLoaded", function (e) {
  new App().init(),
    new LayoutCustomizer().init(),
    new Plugins().init(),
    new I18nManager().init();
});
let ins = (e, t = 1) => {
  var a = getComputedStyle(document.documentElement)
    .getPropertyValue("--ins-" + e)
    .trim();
  return e.includes("-rgb") ? `rgba(${a}, ${t})` : a;
};
function debounce(e, t) {
  let a;
  return function () {
    clearTimeout(a), (a = setTimeout(e, t));
  };
}
class CustomApexChart {
  constructor({
    selector: e,
    series: t = [],
    options: a = {},
    colors: i = [],
  }) {
    if (e) {
      (this.selector = e),
        (this.series = t),
        (this.getOptions = a),
        (this.colors = i),
        this.selector instanceof HTMLElement
          ? (this.element = this.selector)
          : (this.element = document.querySelector(this.selector)),
        (this.chart = null);
      try {
        this.render(), CustomApexChart.instances.push(this);
      } catch (e) {
        console.error("CustomApexChart: Error during chart initialization:", e);
      }
    } else console.warn("CustomApexChart: 'selector' is required.");
  }
  getColors() {
    var e = this.getOptions();
    if (e?.colors?.length) return e.colors;
    if (this.element) {
      e = this.element.getAttribute("data-colors");
      if (e) {
        e = e
          .split(",")
          .map((e) => e.trim())
          .map((e) => (e.startsWith("#") || e.includes("rgb") ? e : ins(e)));
        if (e.length) return e;
      }
    }
    return [ins("chart-primary"), ins("secondary"), ins("danger")];
  }
  render() {
    if ((this.chart && this.chart.destroy(), this.element)) {
      let e = JSON.parse(JSON.stringify(this.getOptions()));
      (e.colors = this.getColors()),
        (e = this.injectDynamicColors(e, e.colors)).series ||
          (e.series = this.series),
        (this.chart = new ApexCharts(this.element, e)),
        this.chart.render();
    } else
      console.warn(
        `CustomApexChart: No element found for selector '${this.selector}'.`
      );
  }
  injectDynamicColors(e, a) {
    var t;
    return (
      "boxplot" === e.chart?.type?.toLowerCase() &&
        ((e.plotOptions = e.plotOptions || {}),
        (e.plotOptions.boxPlot = e.plotOptions.boxPlot || {}),
        (e.plotOptions.boxPlot.colors = e.plotOptions.boxPlot.colors || {}),
        (e.plotOptions.boxPlot.colors.upper =
          e.plotOptions.boxPlot.colors.upper || a[0]),
        (e.plotOptions.boxPlot.colors.lower =
          e.plotOptions.boxPlot.colors.lower || a[1])),
      Array.isArray(e.yaxis) &&
        e.yaxis.forEach((e, t) => {
          t = a[t] || this.colors[t] || "#999";
          (e.axisBorder = e.axisBorder || {}),
            (e.axisBorder.color = e.axisBorder.color || t),
            (e.labels = e.labels || {}),
            (e.labels.style = e.labels.style || {}),
            (e.labels.style.color = e.labels.style.color || t);
        }),
      e.markers && !e.markers.strokeColor && (e.markers.strokeColor = a),
      "gradient" === e.fill?.type &&
        e.fill.gradient &&
        (e.fill.gradient.gradientToColors =
          e.fill.gradient.gradientToColors || a),
      e.plotOptions?.treemap?.colorScale?.ranges &&
        (0 < (t = e.plotOptions.treemap.colorScale.ranges).length &&
          !t[0].color &&
          (t[0].color = a[0]),
        1 < t.length) &&
        !t[1].color &&
        (t[1].color = a[1]),
      e
    );
  }
  static rerenderAll() {
    if (0 < CustomApexChart.instances.length)
      for (var e of CustomApexChart.instances) e.render();
  }
}
class CustomChartJs {
  static instances = [];
  constructor({ selector: e, options: t = () => ({}) }) {
    if (e) {
      (this.selector = e),
        (this.getOptions = "function" == typeof t ? t : () => t),
        (this.element = null),
        (this.chart = null);
      try {
        this.render(), CustomChartJs.instances.push(this);
      } catch (e) {
        console.error("CustomChartJs: Initialization error", e);
      }
    } else console.warn("CustomChartJs: 'selector' is required.");
  }
  static getDefaultOptions() {
    var e = getComputedStyle(document.body).fontFamily.trim();
    return {
      responsive: !0,
      maintainAspectRatio: !1,
      layout: { padding: { top: -10 } },
      scales: {
        x: {
          ticks: {
            font: { family: e },
            color: ins("secondary-color"),
            display: !0,
            drawTicks: !0,
          },
          grid: { display: !1, drawBorder: !1 },
          border: { display: !1 },
        },
        y: {
          ticks: { font: { family: e }, color: ins("secondary-color") },
          grid: {
            display: !0,
            drawBorder: !1,
            color: ins("chart-border-color"),
            lineWidth: 1,
          },
          border: { display: !1, dash: [5, 5] },
        },
      },
      plugins: {
        legend: {
          display: !0,
          position: "top",
          labels: {
            font: { family: e },
            color: ins("secondary-color"),
            usePointStyle: !0,
            pointStyle: "circle",
            boxWidth: 8,
            boxHeight: 8,
            padding: 15,
          },
        },
        tooltip: {
          enabled: !0,
          titleFont: { family: e },
          bodyFont: { family: e },
        },
      },
    };
  }
  render() {
    try {
      var e, t, a, i;
      (this.element =
        this.selector instanceof HTMLElement
          ? this.selector
          : document.querySelector(this.selector)),
        this.element
          ? (this.chart && this.chart.destroy(),
            ({ type: e, data: t, options: a, plugins: i } = this.getOptions()),
            (this.chart = new Chart(this.element, {
              type: e || "bar",
              data: t,
              options: {
                ...structuredClone(CustomChartJs.getDefaultOptions()),
                ...(a || {}),
              },
              plugins: i || [],
            })),
            window.addEventListener(
              "resize",
              debounce(() => {
                this.chart && this.chart.resize();
              }, 200)
            ))
          : console.warn(
              `CustomChartJs: No element found for selector '${this.selector}'`
            );
    } catch (e) {
      console.error(`CustomChartJs: Render error for '${this.selector}'`, e);
    }
  }
  static rerenderAll() {
    for (var e of CustomChartJs.instances) e.render();
  }
  static reSizeAll() {
    for (var e of CustomChartJs.instances) e.chart && e.chart.resize();
  }
  static destroyAll() {
    for (var e of CustomChartJs.instances) e.chart && e.chart.destroy();
    CustomChartJs.instances = [];
  }
}
(CustomApexChart.instances = []), (CustomChartJs.instances = []);
let themeObserver = new MutationObserver(() => {
    CustomApexChart.rerenderAll(), CustomChartJs.rerenderAll();
  }),
  menuObserver =
    (themeObserver.observe(document.documentElement, {
      attributes: !0,
      attributeFilter: ["data-skin", "data-bs-theme"],
    }),
    new MutationObserver(() => {
      requestAnimationFrame(() => {
        CustomChartJs.reSizeAll();
      });
    }));
menuObserver.observe(document.documentElement, {
  attributes: !0,
  attributeFilter: ["data-sidenav-size"],
});
