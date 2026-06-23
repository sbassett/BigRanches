# BigRanches Project Todo List

This checklist tracks the tasks for improving the BigRanches project, with a focus on replacing the digitized boundaries with official, high-precision GIS shapefiles and enhancing the comparison web app.

---

## 🛰️ 1. Shapefile Acquisition (Getting the Ranches' Shapefiles)

- [x] **Method A: County Assessor & Parcel Data (Recommended)**
  - [x] Identify which parcels belong to Ted Turner's entities (e.g., *Turner Enterprises, LLC*, *Armendaris Ranch LLC*, *Ladder Ranch LLC*) in Sierra and Socorro Counties.
  - [x] Access Sierra County Assessor GIS portal or request the parcel shapefile.
  - [x] Access Socorro County Assessor GIS portal or request the parcel shapefile.
- [x] **Method B: BLM Surface Management Agency (SMA) Data**
  - [x] Download the latest BLM New Mexico Surface Management Agency GIS dataset from the [BLM Geospatial Business Platform](https://gbp-blm-egis.hub.arcgis.com/).
  - [x] Extract the private land parcels that correspond to the Ladder and Armendaris Ranch boundaries.
- [x] **Method C: Conservation Easement Records**
  - [x] Obtain easement boundary data from the New Mexico Land Conservancy (for the 315,000-acre Armendaris easement).
- [x] **Method D: Academic & Research Outreach**
  - [x] Contact the Turner Endangered Species Fund or UNM biology/geology departments for verified spatial boundaries used in research studies.

---

## ⚙️ 2. GIS Data Processing & Translation Pipeline

- [x] **Read and Reproject GIS Data**
  - [x] Create a Python script (`process_shapefiles.py`) to process raw shapefiles.
  - [x] Load the raw `.shp` or `.geojson` files.
  - [x] Reproject the layers to WGS 84 (EPSG:4326) coordinate system.
- [x] **Geometry Dissolve & Simplification**
  - [x] Dissolve multiple internal parcels into a single continuous outer boundary polygon for each ranch.
  - [x] Apply simplification to optimize file size for web rendering while maintaining precise boundaries (raw outer boundary was optimal size, no simplification needed).
- [x] **Integration into Data Pipeline**
  - [x] Export the simplified coordinate arrays to `raw_digitized_boundaries.json`.
  - [x] Run `process_boundaries.py` to translate the new high-fidelity boundaries to all comparison regions.
  - [x] Verify that the generated `boundaries.js` contains the updated coordinate sets.

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
