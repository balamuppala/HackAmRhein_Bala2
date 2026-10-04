/* Current initiatives. Only the facts supplied for this page. */
(function () {
  var ITEMS = [
    {
      name: "Stadtklimakonzept",
      text: "Basel-Stadt’s 2021 plan for a cooler city pushes trees, shade, and less sealed ground, and Gundeldingen is one of the priority quarters.",
      url: "https://www.bs.ch/schwerpunkte/klima/stadtklima",
      where: ["Basel-Stadt", "Gundeldingen"]
    },
    {
      name: "Schwammstadt Basel",
      text: "The city’s sponge principle is to keep rain local so it soaks, evaporates, or is reused, and VoltaNord was the first area planned this way.",
      url: "https://www.bs.ch/bvd/stadtgaertnerei/forschung-und-entwicklung/schwammstadt",
      where: ["Basel-Stadt", "Gundeldingen"]
    },
    {
      name: "Grüne Zukunft",
      text: "Unsealing and tree planting go in as IWB extends district heating.",
      url: "https://www.bs.ch/bvd/staedtebau-architektur/baukultur/graublaugruen/gruene-zukunft-begruenung-und-entsiegelung-im-zuge-des-fernwaermeausbaus",
      where: ["Basel-Stadt", "Gundeldingen"]
    },
    {
      name: "Grüne Dächer für Basel",
      text: "Unused flat roofs on new builds and conversions must be planted.",
      url: "https://www.bs.ch/bvd/stadtgaertnerei/biodiversitaet/stadtnatur-foerdern",
      where: ["Basel-Stadt", "Gundeldingen"]
    },
    {
      name: "Fassadenbegrünung auf Allmend",
      text: "Private facades may be planted even when the plants sit on public ground, and the simplified permit is free.",
      url: "https://www.bs.ch/bvd/stadtgaertnerei/biodiversitaet/stadtnatur-foerdern",
      where: ["Basel-Stadt", "Gundeldingen"]
    },
    {
      name: "Förderprogramm für private Kleinbegrünungen",
      text: "Announced in 2025 to fund trees, unsealing, green roofs, and green facades, it would launch in 2026 only if parliament approved it, and that vote is not confirmed on the page.",
      url: "https://www.bs.ch/medienmitteilungen/2025-fuer-ein-grueneres-basel-verstaerkte-foerderung-von-kleinprojekten",
      where: ["Basel-Stadt", "Gundeldingen"]
    },
    {
      name: "Basel wächst in die Höhe",
      text: "A regional association project, granted CHF 100,000 in March 2026 and running to the end of 2029, does outreach and helps plan roof and facade greening.",
      url: "https://www.bs.ch/medienmitteilungen/2026-unterstuetzung-durch-den-swisslos-fonds-4",
      where: ["Basel-Stadt"]
    },
    {
      name: "Klimakonzept Riehen",
      text: "Adopted in February 2024, it keeps heat down and handles rain on the sponge idea.",
      url: "https://www.riehen.ch/verwaltung/dienstleistungen/314_klimakonzept",
      where: ["Basel-Stadt", "Riehen"]
    },
    {
      name: "Mein Baum, dein Baum",
      text: "An Allschwil pilot, noted in August 2026, plants shade trees in private front gardens.",
      url: "https://www.allschwil.ch/de/aktuelles/meldungen-news/Aus-dem-Gemeinderat-August-2026.php",
      where: ["Allschwil"]
    },
    {
      name: "Klimaanpassung Basel-Landschaft",
      text: "The canton’s programme is a heat plan, guidance for municipalities, and a check of places that can hold rain. It is not a street project in each municipality.",
      url: "https://www.nccs.admin.ch/nccs/de/home/regionen/kantone/basel-landschaft.html",
      where: ["Allschwil", "Binningen", "Münchenstein", "Reinach", "Liestal"]
    }
  ];

  var REGIONS = [
    "All region",
    "Basel-Stadt",
    "Riehen",
    "Gundeldingen",
    "Allschwil",
    "Binningen",
    "Münchenstein",
    "Reinach",
    "Liestal"
  ];

  var BL = ["Binningen", "Münchenstein", "Reinach", "Liestal"];
  var root = null;
  var region = "All region";

  function injectStyle() {
    if (document.getElementById("bider-init-style")) return;
    var style = document.createElement("style");
    style.id = "bider-init-style";
    style.textContent = [
      ".init-root { height: 100%; min-height: 0; display: flex; flex-direction: column; background: #f7f4ee; color: #1c2430; font: 13.5px/1.4 system-ui, 'Segoe UI', sans-serif; }",
      ".init-bar { flex: 0 0 auto; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; padding: 6px 8px; background: #fff; border-bottom: 1px solid #e0d9cc; }",
      ".init-bar label { font-weight: 650; display: flex; align-items: center; gap: 6px; }",
      ".init-bar select { font: inherit; max-width: 100%; }",
      ".init-note { margin: 0; padding: 6px 8px 0; color: #5c564c; font-size: 12.5px; }",
      ".init-list { flex: 1 1 auto; min-height: 0; overflow: auto; padding: 6px 8px 8px; display: flex; flex-direction: column; gap: 6px; }",
      ".init-card { background: #fffdf8; border: 1px solid #1b1916; border-radius: 8px; padding: 6px 8px; }",
      ".init-card h3 { margin: 0 0 2px; font-size: 14px; }",
      ".init-card p { margin: 0; }",
      ".init-card a { color: #16324f; }",
      ".init-scope { display: block; margin-top: 3px; color: #6a645a; font-size: 11.5px; }"
    ].join("\n");
    document.head.appendChild(style);
  }

  function noteFor(name) {
    if (name === "All region") return "Every programme listed for this page. Nothing here is a measured saving.";
    if (name === "Basel-Stadt") return "Basel-Stadt programmes, including Riehen’s own climate concept. Basel-Landschaft items are not in this list.";
    if (name === "Riehen") return "Riehen has its own climate concept. City-of-Basel roof and street programmes are not shown here as Riehen projects.";
    if (name === "Gundeldingen") return "No separate Gundeldingen project is listed. These are Basel-Stadt programmes. The climate concept names Gundeldingen among its priority quarters.";
    if (name === "Allschwil") return "Mein Baum, dein Baum is the Allschwil pilot. The cantonal programme is not a street project in the municipality.";
    if (BL.indexOf(name) >= 0) return "No town-specific project is listed for " + name + ". The cantonal programme below is not a street project there.";
    return "";
  }

  function itemsFor(name) {
    if (name === "All region") return ITEMS.slice();
    return ITEMS.filter(function (item) { return item.where.indexOf(name) >= 0; });
  }

  function paint() {
    root._note.textContent = noteFor(region);
    root._list.replaceChildren();
    itemsFor(region).forEach(function (item) {
      var card = document.createElement("article");
      card.className = "init-card";
      var h = document.createElement("h3");
      h.textContent = item.name;
      var p = document.createElement("p");
      p.textContent = item.text + " ";
      var a = document.createElement("a");
      a.href = item.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = "Source";
      p.appendChild(a);
      var scope = document.createElement("span");
      scope.className = "init-scope";
      scope.textContent = item.where.join(" · ");
      card.appendChild(h);
      card.appendChild(p);
      card.appendChild(scope);
      root._list.appendChild(card);
    });
  }

  function render(container) {
    injectStyle();
    if (!root) {
      root = document.createElement("div");
      root.className = "mod-root init-root";
      var bar = document.createElement("div");
      bar.className = "init-bar";
      var label = document.createElement("label");
      label.appendChild(document.createTextNode("Region or Gemeinde"));
      var select = document.createElement("select");
      select.setAttribute("aria-label", "Region or Gemeinde");
      REGIONS.forEach(function (name) {
        var opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        select.appendChild(opt);
      });
      select.addEventListener("change", function () {
        region = select.value;
        paint();
      });
      label.appendChild(select);
      bar.appendChild(label);
      var note = document.createElement("p");
      note.className = "init-note";
      var list = document.createElement("div");
      list.className = "init-list";
      root.appendChild(bar);
      root.appendChild(note);
      root.appendChild(list);
      root._note = note;
      root._list = list;
      root._select = select;
      paint();
    }
    container.replaceChildren(root);
  }

  window.Bider = window.Bider || {};
  window.Bider.initiatives = { render: render };
})();
