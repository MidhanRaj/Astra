# TerraScope 3D — Google Earth Experience with Cesium ion 🌍

A modern, high-performance 3D Google Earth-like web application powered by **CesiumJS**, **Cesium ion**, and **Vite**. Built with glassmorphism UI, Google Earth navigation controls, curated Voyager guided tours, photorealistic 3D tiles, and interactive planetary climate simulations.

---

## ✨ Features

### 1. 🌐 Photorealistic 3D Globe & Building Streaming
- **Cesium World Terrain**: Real-world elevation, mountain ranges, valleys, and water masks.
- **Cesium OSM 3D Buildings**: Global 3D building geometries with multiple shader styles:
  - **Realistic Architecture**: Natural building finishes.
  - **Cyberpunk Neon**: Glowing cyan and magenta skyscrapers with semi-translucent walls.
  - **Height Heatmap**: Skyscraper heights color-coded from deep blue to bright red.
  - **Blueprint / Wireframe**: Crisp technical visualizer mode.
- **Google Photorealistic 3D Tiles**: Direct support for Cesium ion Google 3D Tileset (Asset 2275207).
- **Multi-Source Imagery**: Esri World Satellite, CartoDB Dark Night, OpenStreetMap, and Topographic maps.

### 2. 🧭 Google Earth Navigation & Camera Controls
- **Interactive 3D Compass Rose**: Rotates in real time matching camera heading; single-click snaps back to True North.
- **2D / 3D Perspective Switcher**: Smoothly transitions between top-down cartographic and oblique 45° 3D views.
- **Street / Pedestrian Eye-Level View**: Positions the camera at ground level with forward horizontal gaze.
- **GPS My Location**: Zooms camera to user's real-time browser coordinates.
- **Cinematic Orbiting**: Automated 360° camera rotation around any landmark or point of interest.

### 3. 🚀 Voyager Guided Tours & "I'm Feeling Lucky"
- **Curated Multi-Stop Tours**:
  - **Wonders of the World**: Taj Mahal, Great Pyramids of Giza, The Colosseum, Machu Picchu, Petra.
  - **Megacities in 3D**: Lower Manhattan, Tokyo Shibuya/Shinjuku, Burj Khalifa, Eiffel Tower, San Francisco.
  - **Climate & Fragile Earth**: Gangotri Glacier retreat, Amazon Basin deforestation, Great Barrier Reef bleaching, Malé sinking atoll, Aral Sea desiccation.
  - **Extreme Landscapes**: Mount Everest, Grand Canyon, Mount Fuji, Victoria Falls.
- **"I'm Feeling Lucky" (Dice Button)**: Flies the camera down to one of 30+ secret wonders across the planet with cinematic camera descent and educational info cards.

### 4. 🚨 Live Global Natural Disaster Feed, Windy Radar & Zoom Earth Satellite
- **Live Real-Time Event Streams**:
  - **Earthquakes**: Real-time M4.5+ seismic events globally sourced from the **USGS Earthquake Hazards Program**.
  - **Wildfires & Bushfires**: Active thermal anomalies and bushfires tracked via **NASA EONET** and satellite sensors.
  - **Tropical Cyclones & Severe Storms**: Real-time atmospheric storm tracks from **NASA EONET** and **Zoom Earth**.
  - **Volcanic Eruptions**: Active alerts for global volcanoes (e.g. Kilauea, Reykjanes, Etna).
  - **Floods**: Real-time river overflows and inundations.
- **📰 Triple-Source Disaster Newsroom (NASA, Windy & Zoom Earth)**:
  - **NASA Earth Observatory Feed**: Scientific natural hazard analysis, satellite imagery dispatches, smoke optical depth, and glacial expansion reports.
  - **Windy Meteorological News**: Live hurricane/cyclone track warnings, atmospheric river advisories, and gale-force wave alerts based on the ECMWF forecast model.
  - **Zoom Earth Satellite Cyclone Dispatches**: Rapid 10-minute satellite refresh reports tracking tropical cyclone eyes, convection, and smoke plumes across oceans.
  - **Interactive News Actions**:
    - **Fly to 3D Scene**: Instantly navigates the Cesium globe to the exact geographic coordinates of the news article.
    - **Windy Radar**: Launches the live particle radar overlay for that specific event.
    - **Zoom Earth HD**: Opens high-resolution satellite imagery and cyclone tracking with wind/radar overlays.
    - **Source Filter**: 1-click filter between `All Reports`, `🛰️ NASA Earth`, `🌀 Windy`, and `🌍 Zoom Earth`.
- **🌍 Zoom Earth Live Satellite & Cyclone Tracker Integration**:
  - Direct 1-click coordination with **Zoom Earth** (`https://zoom.earth/maps/satellite/`) for real-time satellite imagery, hurricane/typhoon tracks, and wind streamlines.
  - Quick action buttons on disaster cards, news bulletins, and within the Windy radar modal for immediate handoff to Zoom Earth at the exact coordinate.
- **🌀 Windy.com Live Atmospheric & Cyclone Radar**:
  - Embedded live interactive particle stream radar powered by **Windy.com** and the **ECMWF** numerical weather model.
  - Interactive multi-layer switcher:
    - 🌪️ **Cyclones & Wind Streamlines**: Live storm eye tracking and wind velocity fields.
    - 🛰️ **Weather Radar & Lightning**: Live precipitation doppler radar.
    - 🌧️ **Rain & Thunderstorms**: Convective storm tracking.
    - 🛰️ **Visible Satellite**: Cloud cover and atmospheric moisture.
    - 🔥 **Wildfire Smoke & CO Plumes**: Aerosol and carbon monoxide pollution from bushfires.
    - 🌊 **Storm Surge & Waves**: Ocean swell and coastal wave heights.
- **🎯 Disaster Marker Visibility & Faraway Occlusion Controls**:
  - **Horizon & Terrain Occlusion**: Distant markers on the other side of the planet no longer shine through the Earth (fixed depth-testing and distance display conditions).
  - **Site Focus Mode ("Focus Site")**: When inspecting a specific disaster site, isolates the camera view and hides distant faraway disaster markers.
  - **Master Toggle (`👁️` / Bell button)**: Turn all 3D disaster markers on the globe on or off with a single click.
  - **Granular Category Toggles**: Individual checkboxes to toggle Earthquakes, Wildfires, Cyclones, Volcanoes, and Floods separately.
- **Disaster Intelligence Card**:
  - Displays Disaster Type Badge, Place / Country, Magnitude / Scale, Recorded Time (relative), Coordinates, and direct link to official incident report.
  - **Windy Radar Button**: 1-click to launch Windy's live cyclone/wind radar centered on the disaster's exact coordinates.
  - **360° Orbit Epicenter**: Automated camera orbit around disaster impact zone.

### 5. 🌲 3D Vegetation & Green Zone Generator (Afforestation Engine)
- **Procedural Tree Scattering**: Populates thousands of 3D trees clamped to ground terrain and park geometry.
- **Tree Species Profiles**:
  - **Temperate Oak / Deciduous**: Lush rounded canopies for city parks and temperate woodlands.
  - **Alpine Pine**: Conical evergreen trees for mountainous terrains and boreal forests.
  - **Tropical Palm**: Fan fronds and curved trunks for coastal and island biomes.
  - **Dense Rainforest Canopy**: Multi-layered umbrella canopies for tropical river basins.
- **Interactive Planting Brush & Presets**:
  - Click on any park or green patch to sprout clusters of trees.
  - Auto-scatter across current camera view or famous global parks (Central Park, Yoyogi Park, Golden Gate Park, Tiergarten, Hyde Park, Amazon Basin, Gangotri valley).
- **Carbon Sequestration Counter**:
  - Calculates real-time metric tons of CO2 sequestered per year and total canopy coverage in $km^2$.

### 6. 🌡️ Climate & Planetary Simulator (Hackathon Theme)
- **Sea Level Rise Simulator**:
  - Interactive slider from 0m to +25m.
  - Live 3D extruded flood inundation layer dynamically calculated over vulnerable coastal areas (South Florida/Miami, Netherlands Rhine Delta, Venice Lagoon, Ganges-Brahmaputra Delta, Maldives, Lower Manhattan).
- **3D Greenhouse Gas (CO2) Hotspots**:
  - Glowing 3D emission pillars scaled to annual megatons of CO2 equivalent for global industrial hubs.
- **Deforestation Frontiers**:
  - Canopy loss monitoring zones across the Amazon, Congo Basin, Borneo, and Gran Chaco.

### 5. 📏 Google Earth Ruler & Spatial Tools
- **Distance Measurement**: Click consecutive points on the 3D globe to measure geodesic distance (meters, kilometers, miles).
- **Area Measurement**: Draw enclosed polygons to calculate surface area in $km^2$, hectares, and acres.

### 6. ☀️ Dynamic Solar & Day/Night Lighting
- **24-Hour Time-of-Day Scrubber**: Scrub the sun across 24 hours to watch sunrise, noon, golden hour, and starry nights with urban illumination.
- **Presets**: 1-click Sunrise (06:00), Noon (12:00), Golden Hour (18:00), Midnight (00:00).

### 7. 📌 Projects & Saved Placemarks
- Click anywhere on the 3D Earth to drop custom pins with custom labels, notes, and color themes (red, blue, green, yellow, purple).
- Persisted automatically in `localStorage`.

### 8. 🔑 Cesium ion Access Token Management
- Comes pre-configured with demo access, with a 1-click modal to input your own personal token from [ion.cesium.com/tokens](https://ion.cesium.com/tokens).

---

## 🛠️ Quick Start

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

