# BigRanches Project Todo List

This checklist tracks the tasks for improving the BigRanches project, with a focus on replacing the digitized boundaries with official, high-precision GIS shapefiles and enhancing the comparison web app.

---

## 🛰️ 1. Shapefile Acquisition (Getting the Ranches' Shapefiles)

- [ ] **Method A: County Assessor & Parcel Data (Recommended)**
  - [ ] Identify which parcels belong to Ted Turner's entities (e.g., *Turner Enterprises, LLC*, *Armendaris Ranch LLC*, *Ladder Ranch LLC*) in Sierra and Socorro Counties.
  - [ ] Access Sierra County Assessor GIS portal or request the parcel shapefile.
  - [ ] Access Socorro County Assessor GIS portal or request the parcel shapefile.
- [ ] **Method B: BLM Surface Management Agency (SMA) Data**
  - [ ] Download the latest BLM New Mexico Surface Management Agency GIS dataset from the [BLM Geospatial Business Platform](https://gbp-blm-egis.hub.arcgis.com/).
  - [ ] Extract the private land parcels that correspond to the Ladder and Armendaris Ranch boundaries.
- [ ] **Method C: Conservation Easement Records**
  - [ ] Obtain easement boundary data from the New Mexico Land Conservancy (for the 315,000-acre Armendaris easement).
- [ ] **Method D: Academic & Research Outreach**
  - [ ] Contact the Turner Endangered Species Fund or UNM biology/geology departments for verified spatial boundaries used in research studies.

---

## ⚙️ 2. GIS Data Processing & Translation Pipeline

- [ ] **Read and Reproject GIS Data**
  - [ ] Create a Python script (`process_shapefiles.py`) using `geopandas` and `shapely`.
  - [ ] Load the raw `.shp` or `.geojson` files.
  - [ ] Reproject the layers to WGS 84 (EPSG:4326) coordinate system.
- [ ] **Geometry Dissolve & Simplification**
  - [ ] Dissolve multiple internal parcels into a single continuous outer boundary polygon for each ranch.
  - [ ] Apply Ramer-Douglas-Peucker simplification (e.g., `polygon.simplify(tolerance=0.0001)`) to optimize file size for web rendering while maintaining precise boundaries.
- [ ] **Integration into Data Pipeline**
  - [ ] Export the simplified coordinate arrays to `raw_digitized_boundaries.json` (replacing the manual affine-fitted coordinates).
  - [ ] Run `process_boundaries.py` to translate the new high-fidelity boundaries to all comparison regions.
  - [ ] Verify that the generated `boundaries.js` contains the updated coordinate sets.

---

## 💻 3. Web Map & Infographic Enhancements

- [ ] **Map Improvements**
  - [ ] Verify Leaflet.js rendering speed and bounds alignment with the new shapes.
  - [ ] Add a toggle to switch between the original georeferenced PDF digitizations and the new official shapefile boundaries for accuracy comparison.
- [ ] **Content & Comparison Area Extensions**
  - [ ] Research and add new comparison areas (e.g., Chicago, IL; Grand Canyon; or a small European country like Luxembourg).
  - [ ] Update comparison metadata in `script.js` and add corresponding buttons to `index.html`.
- [ ] **UI/UX Refinements**
  - [ ] Polish the accordion animations for species conservation cards.
  - [ ] Improve responsiveness on mobile and tablet viewport sizes.
  - [ ] Clean up CSS styling variables in `styles.css`.
