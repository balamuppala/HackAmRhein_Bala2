# Bider Basel region

One offline page, plus Leaflet and the map tiles from the network. Open `index.html`.

The main display is 87% of the screen. The strip under it is 13%. The first strip box is the layout menu and does not scroll. The boxes after it scroll sideways if they do not fit.

## Modules

- `modules/layout.js` switches the main display between 1 tile, 2 tiles (left and right), and 3 tiles (left, right top, right bottom). It does not know about the map.
- `modules/heat-data.js` holds the Basel-Stadt heat zones (`HEAT`, 244 features).
- `modules/places.js` holds the seven outlines (`PLACES`): Riehen, Gundeldingen, Allschwil, Binningen, Münchenstein, Reinach, Liestal.
- `modules/heatmap.js` draws those on the swisstopo gray basemap, with the federal runoff layer. The Gemeinde dropdown is inside the tile.
- `modules/initiatives.js` lists the programmes for a region or Gemeinde. Where a town has no project of its own, the panel says so and shows the canton item.
- `modules/designer.js` is a street sketch. Switches change the drawing. The score is how many measures are on, not a climate result.

Each of heatmap, initiatives, and designer exposes `render(container)` on `window.Bider`. The strip only places a module into a tile. Dropdowns live in the tile.

Default: layout 2, heat map on the left, initiatives on the right.
