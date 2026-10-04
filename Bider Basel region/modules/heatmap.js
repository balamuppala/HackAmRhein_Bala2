/* Heat and runoff map. Reuses HEAT and PLACES. render(container) on window.Bider.heatmap. */
(function () {
  var ART_STYLE = {
    Fokus: { color: "#8c2418", fillColor: "#d94a38", weight: 1.4 },
    Verbessern: { color: "#8a5a10", fillColor: "#e6a23c", weight: 1.2 },
    Erhalten: { color: "#1d5c3e", fillColor: "#3d9a6a", weight: 1.2 }
  };

  var root = null;
  var map = null;
  var heatLayer = null;
  var placesLayer = null;
  var labels = {};
  var selected = "All";

  function esc(s) {
    return String(s).replace(/[&<>]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c];
    });
  }

  function flattenForLeaflet(fc) {
    var features = [];
    fc.features.forEach(function (f) {
      var g = f.geometry;
      if (g && g.type === "GeometryCollection") {
        g.geometries.forEach(function (part) {
          features.push({ type: "Feature", properties: f.properties, geometry: part });
        });
      } else {
        features.push(f);
      }
    });
    return { type: "FeatureCollection", features: features };
  }

  function injectStyle() {
    if (document.getElementById("bider-heat-style")) return;
    var style = document.createElement("style");
    style.id = "bider-heat-style";
    style.textContent = [
      ".heat-root { height: 100%; min-height: 0; display: flex; flex-direction: column; background: #f4f7f8; color: #1c2430; font: 13px/1.35 system-ui, 'Segoe UI', sans-serif; }",
      ".heat-bar { flex: 0 0 auto; display: flex; flex-wrap: wrap; gap: 8px 14px; align-items: center; padding: 6px 8px; border-bottom: 1px solid #d5dbe3; background: #fff; }",
      ".heat-bar label { font-weight: 650; display: flex; align-items: center; gap: 6px; }",
      ".heat-bar select { font: inherit; padding: 2px 4px; }",
      ".heat-note { margin: 0; color: #3d4a5c; font-size: 12px; flex: 1 1 220px; }",
      ".heat-legend { flex: 0 0 auto; display: flex; flex-wrap: wrap; gap: 6px 10px; padding: 4px 8px; background: #fff; border-bottom: 1px solid #e4e9ee; font-size: 11.5px; }",
      ".heat-legend i { display: inline-block; width: 12px; height: 12px; border: 1px solid rgba(0,0,0,.35); margin-right: 4px; vertical-align: -1px; }",
      ".heat-map { flex: 1 1 auto; min-height: 0; }",
      ".heat-root .place-label { background: rgba(255,255,255,.94); border: 1px solid #16324f; border-radius: 999px; color: #16324f; font: 700 12px/18px system-ui, 'Segoe UI', sans-serif; text-align: center; white-space: nowrap; cursor: pointer; box-shadow: 0 1px 3px rgba(20,30,40,.18); }"
    ].join("\n");
    document.head.appendChild(style);
  }

  function build() {
    injectStyle();
    root = document.createElement("div");
    root.className = "mod-root heat-root";
    var bar = document.createElement("div");
    bar.className = "heat-bar";
    var label = document.createElement("label");
    label.appendChild(document.createTextNode("Gemeinde"));
    var select = document.createElement("select");
    select.setAttribute("aria-label", "Gemeinde");
    var optAll = document.createElement("option");
    optAll.value = "All";
    optAll.textContent = "All";
    select.appendChild(optAll);
    PLACES.features.forEach(function (f) {
      var opt = document.createElement("option");
      opt.value = f.properties.name;
      opt.textContent = f.properties.name;
      select.appendChild(opt);
    });
    select.addEventListener("change", function () {
      focusPlace(select.value);
    });
    label.appendChild(select);
    var note = document.createElement("p");
    note.className = "heat-note";
    note.textContent = "Overlap is visual (zones on top of the runoff tiles), not a computed intersection.";
    bar.appendChild(label);
    bar.appendChild(note);

    var legend = document.createElement("div");
    legend.className = "heat-legend";
    legend.innerHTML = [
      '<span><i style="background:#d94a38"></i>Fokus</span>',
      '<span><i style="background:#e6a23c"></i>Verbessern</span>',
      '<span><i style="background:#3d9a6a"></i>Erhalten</span>',
      '<span><i style="background:#2f6fdb;opacity:.7"></i>Runoff (BAFU)</span>',
      '<span><i style="background:transparent;border:2px solid #16324f"></i>Place</span>'
    ].join("");

    var mapEl = document.createElement("div");
    mapEl.className = "heat-map";

    root.appendChild(bar);
    root.appendChild(legend);
    root.appendChild(mapEl);
    root._select = select;
    root._note = note;
    root._mapEl = mapEl;
  }

  function placeByName(name) {
    for (var i = 0; i < PLACES.features.length; i++) {
      if (PLACES.features[i].properties.name === name) return PLACES.features[i].properties;
    }
    return null;
  }

  function stylePlaces(name) {
    placesLayer.eachLayer(function (layer) {
      if (!layer.feature || !layer.setStyle) return;
      var n = layer.feature.properties && layer.feature.properties.name;
      var on = !name || n === name;
      layer.setStyle({
        color: "#16324f",
        weight: on ? 2.8 : 1.2,
        fillColor: "#16324f",
        fillOpacity: on ? 0.08 : 0.01,
        opacity: on ? 1 : 0.28
      });
    });
    Object.keys(labels).forEach(function (n) {
      var on = !name || n === name;
      labels[n].setOpacity(on ? 1 : 0);
    });
  }

  function showPopup(p) {
    L.popup()
      .setLatLng(p.center)
      .setContent("<b>" + esc(p.name) + "</b><br>" + esc(p.where) + "<br>" + esc(p.line))
      .openOn(map);
  }

  function focusPlace(name) {
    selected = name;
    if (root && root._select && root._select.value !== name) root._select.value = name;
    if (name === "All") {
      stylePlaces(null);
      root._note.textContent = "Overlap is visual (zones on top of the runoff tiles), not a computed intersection.";
      map.closePopup();
      if (placesLayer.getBounds().isValid()) {
        map.flyToBounds(placesLayer.getBounds(), { padding: [28, 28], duration: 0.7 });
      }
      return;
    }
    var p = placeByName(name);
    if (!p) return;
    stylePlaces(name);
    root._note.textContent = p.line + " Overlap is visual, not a computed intersection.";
    var bounds = null;
    placesLayer.eachLayer(function (layer) {
      if (layer.feature && layer.feature.properties && layer.feature.properties.name === name && layer.getBounds) {
        bounds = layer.getBounds();
      }
    });
    if (bounds && bounds.isValid()) {
      map.flyToBounds(bounds, { padding: [36, 36], maxZoom: 15, duration: 0.75 });
    } else {
      map.flyTo(p.center, 14, { duration: 0.75 });
    }
    showPopup(p);
  }

  function initMap() {
    if (typeof L === "undefined") {
      root._note.textContent = "The map library did not load. Tiles need a network connection.";
      return;
    }
    var base = L.tileLayer("https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg", {
      attribution: "&copy; swisstopo",
      maxZoom: 18
    });
    var heatIsland = L.tileLayer.wms("https://wms.geo.bs.ch/", {
      layers: "KL_Waermeinseleffekt",
      format: "image/png",
      transparent: true,
      version: "1.3.0",
      opacity: 0.55,
      attribution: "Wärmeinseleffekt: Geodaten Kanton Basel-Stadt"
    });
    var runoff = L.tileLayer.wms("https://wms.geo.admin.ch/", {
      layers: "ch.bafu.gefaehrdungskarte-oberflaechenabfluss",
      format: "image/png",
      transparent: true,
      version: "1.3.0",
      opacity: 0.62,
      attribution: "Runoff: BAFU Gefährdungskarte Oberflächenabfluss (source: swisstopo / BAFU)"
    });
    heatLayer = L.geoJSON(flattenForLeaflet(HEAT), {
      style: function (feature) {
        var art = feature.properties && feature.properties.Art;
        var s = ART_STYLE[art] || { color: "#555", fillColor: "#aaa", weight: 1 };
        return Object.assign({ fillOpacity: 0.42 }, s);
      },
      onEachFeature: function (feature, layer) {
        var p = feature.properties || {};
        var art = p.Art != null ? String(p.Art) : "(no Art)";
        var id = p.Id_Fokusgebiet != null ? String(p.Id_Fokusgebiet) : "(none)";
        layer.bindPopup("<b>" + esc(art) + "</b><br>Id_Fokusgebiet: " + esc(id));
      }
    });
    map = L.map(root._mapEl, { layers: [base, runoff, heatLayer], zoomControl: true });
    placesLayer = L.geoJSON(PLACES, {
      style: function () {
        return { color: "#16324f", weight: 2.2, fillColor: "#16324f", fillOpacity: 0.05 };
      },
      onEachFeature: function (feature, layer) {
        layer.on("click", function () { focusPlace(feature.properties.name); });
      }
    }).addTo(map);
    PLACES.features.forEach(function (f) {
      var p = f.properties;
      var w = Math.round(p.name.length * 7.2 + 16);
      var h = 20;
      var marker = L.marker(p.center, {
        icon: L.divIcon({
          className: "place-label",
          html: esc(p.name),
          iconSize: [w, h],
          iconAnchor: [Math.round(w / 2), Math.round(h / 2)]
        }),
        keyboard: true,
        zIndexOffset: 600
      });
      marker.on("click", function () { focusPlace(p.name); });
      marker.addTo(map);
      labels[p.name] = marker;
    });
    if (placesLayer.getBounds().isValid()) {
      map.fitBounds(placesLayer.getBounds(), { padding: [28, 28] });
    } else {
      map.setView([47.53, 7.62], 12);
    }
    L.control.layers(
      { "swisstopo gray": base },
      {
        "Surface runoff (BAFU)": runoff,
        "Heat-island effect (Kanton BS)": heatIsland,
        "Heat action zones": heatLayer,
        "Places": placesLayer
      },
      { collapsed: true }
    ).addTo(map);
    map.attributionControl.addAttribution("Heat zones: Kanton Basel-Stadt, CC BY 4.0 (Fokusgebiete Stadtklimakonzept)");
    map.attributionControl.addAttribution("Outlines: swisstopo swissBOUNDARIES3D; Gundeldingen quarter: Kanton Basel-Stadt");
    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(function () { map.invalidateSize(); }).observe(root._mapEl);
    }
  }

  function render(container) {
    if (!root) build();
    container.replaceChildren(root);
    if (!map) initMap();
    else requestAnimationFrame(function () { map.invalidateSize(); });
  }

  window.Bider = window.Bider || {};
  window.Bider.heatmap = {
    render: render,
    resize: function () {
      if (map) map.invalidateSize();
    }
  };
})();
