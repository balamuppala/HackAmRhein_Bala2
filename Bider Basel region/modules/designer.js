/* Street sketch game. A count of measures, not a climate result. */
(function () {
  var MEASURES = [
    { id: "roof", label: "Green roof", hint: "Planted flat roof" },
    { id: "tank", label: "Covered tank", hint: "Closed. No open water" },
    { id: "wall", label: "Vegetation wall", hint: "Plants on a grid, for shade" },
    { id: "tree", label: "Street tree", hint: "Pit holds rain" },
    { id: "perm", label: "Permeable pavement", hint: "Joints let water through" },
    { id: "pale", label: "Lighter asphalt", hint: "Paler road, holds less heat" },
    { id: "garden", label: "Curb raingarden", hint: "Planted bed, not a pond" }
  ];

  var on = {};
  MEASURES.forEach(function (m) { on[m.id] = false; });
  var place = "Riehen";
  var root = null;

  function injectStyle() {
    if (document.getElementById("bider-design-style")) return;
    var style = document.createElement("style");
    style.id = "bider-design-style";
    style.textContent = [
      ".des-root { height: 100%; min-height: 0; display: flex; flex-direction: column; background: #f3efe6; color: #1b1916; font: 13px/1.3 system-ui, 'Segoe UI', sans-serif; }",
      ".des-bar { flex: 0 0 auto; display: flex; flex-wrap: wrap; gap: 6px 12px; align-items: center; padding: 5px 8px; background: #fffdf8; border-bottom: 1px solid #1b1916; }",
      ".des-bar label { font-weight: 700; display: flex; align-items: center; gap: 6px; }",
      ".des-bar select, .des-chip { font: inherit; }",
      ".des-score { margin-left: auto; font-weight: 700; }",
      ".des-score small { font-weight: 450; color: #5e584e; display: block; }",
      ".des-stage { flex: 1 1 auto; min-height: 0; position: relative; background: #d7e6f0; }",
      ".des-stage svg { width: 100%; height: 100%; display: block; }",
      ".des-rain { position: absolute; left: 0; right: 0; top: 0; height: 58%; pointer-events: none;",
      "  background-image: repeating-linear-gradient(102deg, transparent 0 11px, rgba(31,111,147,.55) 11px 12.5px);",
      "  background-size: 22px 32px; animation: bider-rain .75s linear infinite; }",
      ".des-root.catching .des-rain { opacity: .45; }",
      "@keyframes bider-rain { to { background-position: -18px 32px; } }",
      ".d-roof,.d-tank,.d-wall,.d-tree,.d-perm,.d-garden,.d-pale-label { opacity: 0; }",
      ".on-roof .d-roof, .on-tank .d-tank, .on-wall .d-wall, .on-tree .d-tree, .on-perm .d-perm, .on-garden .d-garden, .on-pale .d-pale-label { opacity: 1; }",
      ".asphalt { fill: #3c4146; } .on-pale .asphalt { fill: #d5d0c4; }",
      ".walk-seal { fill: #cfc6b8; } .on-perm .walk-seal { fill: #e7efe4; }",
      ".des-status { flex: 0 0 auto; margin: 0; padding: 4px 8px; background: #f4e4d4; border-top: 1px solid #1b1916; font-size: 12.5px; }",
      ".des-root.holding .des-status { background: #e5f2e4; }",
      ".des-toggles { flex: 0 1 auto; max-height: 38%; overflow: auto; display: flex; flex-wrap: wrap; gap: 4px; padding: 4px 6px 6px; }",
      ".des-chip { text-align: left; border: 1.5px solid #1b1916; background: #fffdf8; border-radius: 999px; padding: 3px 8px; cursor: pointer; color: inherit; }",
      ".des-chip[aria-pressed='true'] { background: #e5f2e4; }",
      ".des-chip small { color: #5e584e; }"
    ].join("\n");
    document.head.appendChild(style);
  }

  function svgMarkup() {
    return [
      '<svg viewBox="0 0 720 400" preserveAspectRatio="xMidYMid meet" aria-hidden="true">',
      '<rect width="720" height="248" fill="#d7e6f0"/>',
      '<polygon points="28,248 28,86 188,86 188,248" fill="#efe6d6" stroke="#1b1916" stroke-width="2"/>',
      '<rect x="48" y="110" width="28" height="36" fill="#f7f1e4" stroke="#1b1916"/>',
      '<rect x="92" y="110" width="28" height="36" fill="#f7f1e4" stroke="#1b1916"/>',
      '<rect x="136" y="110" width="28" height="36" fill="#f7f1e4" stroke="#1b1916"/>',
      '<rect x="48" y="168" width="28" height="36" fill="#f7f1e4" stroke="#1b1916"/>',
      '<rect x="92" y="168" width="28" height="36" fill="#f7f1e4" stroke="#1b1916"/>',
      '<rect x="136" y="168" width="28" height="36" fill="#f7f1e4" stroke="#1b1916"/>',
      '<g class="d-roof">',
      '<rect x="30" y="74" width="156" height="14" fill="#2f7a45" stroke="#1b1916"/>',
      '<circle cx="48" cy="74" r="6" fill="#1d5c32"/>',
      '<circle cx="70" cy="72" r="7" fill="#24633a"/>',
      '<circle cx="94" cy="74" r="6" fill="#1d5c32"/>',
      '<circle cx="118" cy="71" r="7" fill="#2f7a45"/>',
      '<circle cx="142" cy="74" r="6" fill="#1d5c32"/>',
      '<circle cx="166" cy="72" r="6" fill="#24633a"/>',
      '</g>',
      '<polygon points="508,248 508,104 692,104 692,248" fill="#efe6d6" stroke="#1b1916" stroke-width="2"/>',
      '<rect x="528" y="128" width="26" height="32" fill="#f7f1e4" stroke="#1b1916"/>',
      '<rect x="566" y="128" width="26" height="32" fill="#f7f1e4" stroke="#1b1916"/>',
      '<rect x="604" y="128" width="26" height="32" fill="#f7f1e4" stroke="#1b1916"/>',
      '<rect x="642" y="128" width="26" height="32" fill="#f7f1e4" stroke="#1b1916"/>',
      '<rect x="528" y="178" width="26" height="32" fill="#f7f1e4" stroke="#1b1916"/>',
      '<rect x="566" y="178" width="26" height="32" fill="#f7f1e4" stroke="#1b1916"/>',
      '<rect x="604" y="178" width="26" height="32" fill="#f7f1e4" stroke="#1b1916"/>',
      '<rect x="642" y="178" width="26" height="32" fill="#f7f1e4" stroke="#1b1916"/>',
      '<g class="d-wall">',
      '<line x1="508" y1="112" x2="508" y2="240" stroke="#6d7a4e" stroke-width="3"/>',
      '<line x1="500" y1="130" x2="516" y2="130" stroke="#6d7a4e" stroke-width="2"/>',
      '<line x1="500" y1="156" x2="516" y2="156" stroke="#6d7a4e" stroke-width="2"/>',
      '<line x1="500" y1="182" x2="516" y2="182" stroke="#6d7a4e" stroke-width="2"/>',
      '<line x1="500" y1="208" x2="516" y2="208" stroke="#6d7a4e" stroke-width="2"/>',
      '<circle cx="496" cy="124" r="7" fill="#2f7a45"/>',
      '<circle cx="520" cy="142" r="8" fill="#24633a"/>',
      '<circle cx="494" cy="164" r="7" fill="#1d5c32"/>',
      '<circle cx="522" cy="186" r="8" fill="#2f7a45"/>',
      '<circle cx="496" cy="208" r="7" fill="#24633a"/>',
      '<circle cx="520" cy="228" r="7" fill="#1d5c32"/>',
      '</g>',
      '<rect class="walk-seal" x="188" y="248" width="86" height="30" stroke="#1b1916"/>',
      '<rect class="walk-seal" x="446" y="248" width="62" height="30" stroke="#1b1916"/>',
      '<g class="d-perm" stroke="#1b1916" stroke-width="1.4">',
      '<line x1="210" y1="248" x2="210" y2="278"/><line x1="232" y1="248" x2="232" y2="278"/>',
      '<line x1="254" y1="248" x2="254" y2="278"/><line x1="468" y1="248" x2="468" y2="278"/>',
      '<line x1="490" y1="248" x2="490" y2="278"/>',
      '</g>',
      '<rect class="asphalt" x="274" y="248" width="172" height="30" stroke="#1b1916"/>',
      '<text class="d-pale-label" x="360" y="267" text-anchor="middle" font-size="11" fill="#1b1916">paler road</text>',
      '<g class="d-tree">',
      '<rect x="228" y="196" width="10" height="52" fill="#6b4a2e"/>',
      '<circle cx="233" cy="178" r="26" fill="#24633a" stroke="#1b1916"/>',
      '<circle cx="214" cy="190" r="14" fill="#1d5c32"/>',
      '<path d="M233 278 v28" stroke="#6b4a2e" stroke-width="2" fill="none"/>',
      '<path d="M233 292 l-16 10 M233 300 l18 12" stroke="#6b4a2e" stroke-width="2" fill="none"/>',
      '</g>',
      '<g>',
      '<circle cx="206" cy="242" r="10" fill="#3d8f52" stroke="#1b1916"/>',
      '<circle cx="222" cy="246" r="8" fill="#2f7a45" stroke="#1b1916"/>',
      '<rect x="204" y="248" width="4" height="10" fill="#6b4a2e"/>',
      '<circle cx="478" cy="244" r="9" fill="#3d8f52" stroke="#1b1916"/>',
      '<circle cx="492" cy="246" r="7" fill="#2f7a45" stroke="#1b1916"/>',
      '</g>',
      '<g class="d-garden">',
      '<rect x="262" y="236" width="28" height="22" rx="3" fill="#c4a574" stroke="#1b1916"/>',
      '<circle cx="270" cy="234" r="6" fill="#2f7a45"/>',
      '<circle cx="280" cy="232" r="7" fill="#24633a"/>',
      '<circle cx="286" cy="238" r="5" fill="#1d5c32"/>',
      '</g>',
      '<g class="d-tank">',
      '<rect x="36" y="196" width="52" height="36" rx="3" fill="#8aa0ab" stroke="#1b1916" stroke-width="2"/>',
      '<rect x="34" y="188" width="56" height="10" rx="2" fill="#5d737e" stroke="#1b1916" stroke-width="2"/>',
      '<text x="62" y="218" text-anchor="middle" font-size="10" fill="#1b1916">closed</text>',
      '</g>',
      '<g>',
      '<rect x="338" y="252" width="36" height="22" fill="#dfe7ee" stroke="#1b1916" stroke-width="2"/>',
      '<line x1="346" y1="252" x2="346" y2="274" stroke="#1b1916" stroke-width="2"/>',
      '<line x1="354" y1="252" x2="354" y2="274" stroke="#1b1916" stroke-width="2"/>',
      '<line x1="362" y1="252" x2="362" y2="274" stroke="#1b1916" stroke-width="2"/>',
      '<line x1="370" y1="252" x2="370" y2="274" stroke="#1b1916" stroke-width="2"/>',
      '<path d="M356 274 v36 h70" fill="none" stroke="#1f6f93" stroke-width="5"/>',
      '<path d="M426 310 l14 0 l-6 -5 m6 5 l-6 5" fill="none" stroke="#1f6f93" stroke-width="2"/>',
      '<text x="470" y="328" font-size="13" font-weight="700" fill="#1f6f93">to the drain</text>',
      '</g>',
      '<rect x="0" y="278" width="720" height="28" fill="#d7c09a" stroke="#1b1916"/>',
      '<rect x="0" y="306" width="720" height="40" fill="#c4a574" stroke="#1b1916"/>',
      '<rect x="0" y="346" width="720" height="54" fill="#b08968" stroke="#1b1916"/>',
      '<circle cx="80" cy="372" r="6" fill="#8d7350" stroke="#1b1916"/>',
      '<circle cx="210" cy="380" r="8" fill="#8d7350" stroke="#1b1916"/>',
      '<circle cx="400" cy="368" r="7" fill="#8d7350" stroke="#1b1916"/>',
      '<circle cx="560" cy="382" r="8" fill="#8d7350" stroke="#1b1916"/>',
      '<text x="12" y="297" font-size="13" font-weight="700">I</text>',
      '<text x="12" y="332" font-size="13" font-weight="700">II</text>',
      '<text x="12" y="378" font-size="13" font-weight="700">III</text>',
      '</svg>'
    ].join("");
  }

  function holdingNames() {
    var names = [];
    if (on.roof) names.push("green roof");
    if (on.tank) names.push("covered tank");
    if (on.wall) names.push("vegetation wall");
    if (on.tree) names.push("tree pit");
    if (on.perm) names.push("permeable pavement");
    if (on.garden) names.push("raingarden");
    return names;
  }

  function sync() {
    var count = MEASURES.reduce(function (n, m) { return n + (on[m.id] ? 1 : 0); }, 0);
    root._score.textContent = "Measures on: " + count + " of 7";
    MEASURES.forEach(function (m) {
      root.classList.toggle("on-" + m.id, on[m.id]);
      var btn = root.querySelector('[data-measure="' + m.id + '"]');
      if (btn) btn.setAttribute("aria-pressed", on[m.id] ? "true" : "false");
    });
    var hold = holdingNames();
    root.classList.toggle("holding", hold.length > 0);
    root.classList.toggle("catching", hold.length > 0);
    var status = "Sealed street in " + place + ". Bushes are already there. Rain runs to the drain.";
    if (hold.length) status = place + " is holding rain on the " + hold.join(", ") + ". The grate is still there.";
    if (on.pale) status += " The paler road reflects more sun.";
    if (on.tank) status += " The tank is closed, so the water does not sit open.";
    if (on.garden) status += " The raingarden is a planted bed, not a pond.";
    if (on.wall) status += " The wall shades the facade.";
    root._status.textContent = status;
  }

  function render(container) {
    injectStyle();
    if (!root) {
      root = document.createElement("div");
      root.className = "mod-root des-root";
      var bar = document.createElement("div");
      bar.className = "des-bar";
      var label = document.createElement("label");
      label.appendChild(document.createTextNode("Gemeinde"));
      var select = document.createElement("select");
      select.setAttribute("aria-label", "Gemeinde");
      PLACES.features.forEach(function (f) {
        var opt = document.createElement("option");
        opt.value = f.properties.name;
        opt.textContent = f.properties.name;
        select.appendChild(opt);
      });
      select.value = place;
      select.addEventListener("change", function () {
        place = select.value;
        sync();
      });
      label.appendChild(select);
      var score = document.createElement("div");
      score.className = "des-score";
      var small = document.createElement("small");
      small.textContent = "A count of switches, not a climate result.";
      score.appendChild(document.createTextNode(""));
      var scoreText = document.createElement("span");
      score.appendChild(scoreText);
      score.appendChild(small);
      bar.appendChild(label);
      bar.appendChild(score);

      var stage = document.createElement("div");
      stage.className = "des-stage";
      stage.innerHTML = svgMarkup() + '<div class="des-rain"></div>';

      var status = document.createElement("p");
      status.className = "des-status";

      var toggles = document.createElement("div");
      toggles.className = "des-toggles";
      MEASURES.forEach(function (m) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "des-chip";
        btn.dataset.measure = m.id;
        btn.setAttribute("aria-pressed", "false");
        var strong = document.createElement("strong");
        strong.textContent = m.label;
        var hint = document.createElement("small");
        hint.textContent = " " + m.hint;
        btn.appendChild(strong);
        btn.appendChild(hint);
        btn.addEventListener("click", function () {
          on[m.id] = !on[m.id];
          sync();
        });
        toggles.appendChild(btn);
      });

      root.appendChild(bar);
      root.appendChild(stage);
      root.appendChild(status);
      root.appendChild(toggles);
      root._score = scoreText;
      root._status = status;
      sync();
    }
    container.replaceChildren(root);
  }

  window.Bider = window.Bider || {};
  window.Bider.designer = { render: render };
})();
