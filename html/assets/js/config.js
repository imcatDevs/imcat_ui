(() => {
  var e = document.documentElement,
    o = sessionStorage.getItem("__UBOLD_CONFIG__");
  const t = "default",
    i = !1,
    a = "light",
    s = { position: "fixed" },
    r = { color: "dark" },
    n = { color: "light" },
    d = { size: "default", user: !1 };
  function u() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  var c = {
      skin: e.getAttribute("data-skin") || t,
      monochrome: e.classList.contains("monochrome") || i,
      theme:
        "system" === e.getAttribute("data-bs-theme")
          ? u()
          : e.getAttribute("data-bs-theme") || ("system" === a ? u() : a),
      layout: {
        position: e.getAttribute("data-layout-position") || s.position,
      },
      topbar: { color: e.getAttribute("data-topbar-color") || r.color },
      menu: { color: e.getAttribute("data-menu-color") || n.color },
      sidenav: {
        size: e.getAttribute("data-sidenav-size") || d.size,
        user: e.hasAttribute("data-sidenav-user") || d.user,
      },
    },
    o = ((window.defaultConfig = structuredClone(c)), o ? JSON.parse(o) : c);
  if (
    ((window.config = o),
    e.setAttribute("data-skin", o.skin),
    e.setAttribute("data-bs-theme", "system" === o.theme ? u() : o.theme),
    e.setAttribute("data-menu-color", o.menu.color),
    e.setAttribute("data-topbar-color", o.topbar.color),
    e.setAttribute("data-layout-position", o.layout.position),
    e.classList.toggle("monochrome", o.monochrome),
    o.sidenav.size)
  ) {
    let t = o.sidenav.size;
    window.innerWidth <= 767
      ? (t = "offcanvas")
      : window.innerWidth <= 1140 &&
        !["offcanvas"].includes(t) &&
        (t = "condensed"),
      e.setAttribute("data-sidenav-size", t),
      !0 === o.sidenav.user
        ? e.setAttribute("data-sidenav-user", "true")
        : e.removeAttribute("data-sidenav-user");
  }
})();
