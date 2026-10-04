/* Layout switching only. No map, initiative, or design logic. */
(function () {
  var current = 2;
  var stage = null;
  var listeners = [];

  function apply() {
    if (stage) stage.setAttribute("data-layout", String(current));
    listeners.forEach(function (fn) { fn(current); });
  }

  window.Bider = window.Bider || {};
  window.Bider.layout = {
    init: function (el) {
      stage = el;
      apply();
    },
    set: function (n) {
      n = Number(n);
      if (n !== 1 && n !== 2 && n !== 3) return;
      current = n;
      apply();
    },
    get: function () { return current; },
    onChange: function (fn) { listeners.push(fn); },
    visible: function () {
      if (current === 1) return ["a"];
      if (current === 2) return ["a", "b"];
      return ["a", "b", "c"];
    },
    choices: function () {
      if (current === 1) return [{ slot: "a", label: "Display" }];
      if (current === 2) return [
        { slot: "a", label: "Left" },
        { slot: "b", label: "Right" }
      ];
      return [
        { slot: "a", label: "Left" },
        { slot: "b", label: "Right top" },
        { slot: "c", label: "Right bottom" }
      ];
    }
  };
})();
