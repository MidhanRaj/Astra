# TerraScope 3D — Google Earth Experience with Cesium ion 🌍
# 🌍 Astra / TerraScope 3D — Google Earth-like Climate Intelligence Platform

A modern, high-performance 3D Google Earth-like web application powered by **CesiumJS**, **Cesium ion**, and **Vite**. Built with glassmorphism UI, Google Earth navigation controls, curated Voyager guided tours, photorealistic 3D tiles, and interactive planetary climate simulations.
> A photorealistic 3D globe powered by **CesiumJS** and **Cesium ion** with live natural disaster feeds, climate visualization layers, rainfall & stagnant water simulation, vegetation engine, guided tours, and multi-source satellite intelligence integration.

---

## ✨ Features
## 🚀 Live Development

### 1. 🌐 Photorealistic 3D Globe & Building Streaming
- **Cesium World Terrain**: Real-world elevation, mountain ranges, valleys, and water masks.
- **Cesium OSM 3D Buildings**: Global 3D building geometries with multiple shader styles:
  - **Realistic Architecture**: Natural building finishes.
  - **Cyberpunk Neon**: Glowing cyan and magenta skyscrapers with semi-translucent walls.
  - **Height Heatmap**: Skyscraper heights color-coded from deep blue to bright red.
  - **Blueprint / Wireframe**: Crisp technical visualizer mode.
- **Google Photorealistic 3D Tiles**: Direct support for Cesium ion Google 3D Tileset (Asset 2275207).
- **Multi-Source Imagery**: Esri World Satellite, CartoDB Dark Night, OpenStreetMap, and Topographic maps.
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # Production bundle → dist/
npm run preview    # Preview production build
```

### 2. 🧭 Google Earth Navigation & Camera Controls
- **Interactive 3D Compass Rose**: Rotates in real time matching camera heading; single-click snaps back to True North.
- **2D / 3D Perspective Switcher**: Smoothly transitions between top-down cartographic and oblique 45° 3D views.
- **Street / Pedestrian Eye-Level View**: Positions the camera at ground level with forward horizontal gaze.
- **GPS My Location**: Zooms camera to user's real-time browser coordinates.
- **Cinematic Orbiting**: Automated 360° camera rotation around any landmark or point of interest.
---

### 3. 🚀 Voyager Guided Tours & "I'm Feeling Lucky"
- **Curated Multi-Stop Tours**:
  - **Wonders of the World**: Taj Mahal, Great Pyramids of Giza, The Colosseum, Machu Picchu, Petra.
  - **Megacities in 3D**: Lower Manhattan, Tokyo Shibuya/Shinjuku, Burj Khalifa, Eiffel Tower, San Francisco.
  - **Climate & Fragile Earth**: Gangotri Glacier retreat, Amazon Basin deforestation, Great Barrier Reef bleaching, Malé sinking atoll, Aral Sea desiccation.
  - **Extreme Landscapes**: Mount Everest, Grand Canyon, Mount Fuji, Victoria Falls.
- **"I'm Feeling Lucky" (Dice Button)**: Flies the camera down to one of 30+ secret wonders across the planet with cinematic camera descent and educational info cards.
## 🛠️ Tech Stack

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
| Package | Version | Purpose |
|---|---|---|
| `vite` | ^8.3.5 | Build tool & dev server |
| `cesium` | ^1.146.0 | 3D globe engine |
| `vite-plugin-cesium` | ^1.2.23 | Cesium + Vite integration |
| `lucide` | ^1.66.0 | Icon system |

### 5. 🌲 3D Vegetation & Green Zone Generator (Afforestation Engine)
- **Procedural Tree Scattering**: Populates thousands of 3D trees clamped to ground terrain and park geometry.
- **Tree Species Profiles**:
  - **Temperate Oak / Deciduous**: Lush rounded canopies for city parks and temperate woodlands.
  - **Alpine Pine**: Conical evergreen trees for mountainous terrains and boreal forests.
  - **Tropical Palm**: Fan fronds and curved trunks for coastal and island biomes.
  - **Dense Rainforest Canopy**: Multi-layered umbrella canopies for tropical river basins.
- **Interactive Planting Brush & Presets**:
  - Click on any park or green patch to sprout clusters of trees.
  - Curated presets: Central Park NYC, Hyde Park London, Amazon Deforestation Belt, Yoyogi Park Tokyo, Tijuca Rainforest Rio.
- **Carbon Sequestration Metrics**: Live calculation of planted trees, total metric tons of $CO_2$ absorbed annually, and canopy surface footprint.
**Fonts:** Plus Jakarta Sans (UI), JetBrains Mono (telemetry/HUD) via Google Fonts  
**Module system:** ES Modules  
**Persistence:** `localStorage` for placemarks and Cesium ion token

### 6. 🌧️ Rainfall & Stagnant Water Simulation Engine (`rainfall-sim` branch)
- **Interactive Area Selection**:
  - **Draw Area Box**: Click 2 points on the 3D globe to draw a custom study boundary over any city, valley, or neighborhood.
  - **Current View**: Instantly captures the active camera viewport as the analysis zone.
- **Rainfall & Time Parameters**:
  - **Rainfall Intensity Slider**: Custom rate from `5 mm/hr` (light rain) to `180 mm/hr` (extreme cloudburst).
  - **Storm Duration Period Slider**: Configurable storm window from `30 minutes` up to `24+ hours`.
  - **Surface Permeability / Infiltration**: Choose between Dense Urban Asphalt (92% runoff), Suburban (65% runoff), and Parkland Soil (22% runoff).
  - **Municipal Storm Drain Capacity**: Model effective vs. blocked/overwhelmed storm sewer rates (0 to 40 mm/hr).
- **Topographical Sink & Depression Analysis**:
  - Samples terrain elevations to locate natural drainage sinks, hollows, and flat urban depressions where water cannot drain away.
  - Redistributes surface runoff into local basins to calculate accurate ponding depths.
- **3D Water Visualization & Depth Heatmap**:
  - Renders 3D water patches clamped over terrain and 3D buildings (`ClassificationType.BOTH`).
  - Depth-coded water classification:
    - 💧 **Shallow Puddle (3 - 15 cm)**: Cyan light water, pedestrian splash risk.
    - ⚠️ **Stagnant Water (15 - 40 cm)**: Azure waterlogging, sidewalk obstruction, road clearance risks.
    - 🚨 **Deep Inundation (> 40 cm)**: Deep navy blue with red outline, vehicle submergence & property ingress danger.
- **Storm Progression Playback**:
  - Interactive play/pause timeline to watch stagnant pools form, swell, and connect hour-by-hour over the course of the storm.
- **Real-Time Hydrological Telemetry**:
  - Total Rain Delivered (mm) vs. Net Ponding Depth (mm).
  - Peak Stagnant Pool Depth (cm).
  - Flooded Puddle Area (hectares & % of study area).
  - Stagnant Water Volume ($m^3$).
  - Estimated Natural Clearance Time (hours to evaporate/drain).
  - Risk Level Classification (Safe / Minor / Moderate / Severe).
- **Curated Global Vulnerability Presets (1-Click Explore & Simulate)**:
  - *Mumbai, India (Mithi River Basin)*: Extreme monsoon tidal locking and concrete waterlogging.
  - *New Orleans, USA (Mid-City Basin)*: Below-sea-level bowl topography.
  - *Dhaka, Bangladesh (Buriganga Floodplain)*: High impervious density and street ponding.
  - *Houston, Texas (Buffalo Bayou)*: Flat clay plains and slow runoff.
  - *Jakarta, Indonesia (Penjaringan Coastal Delta)*: Coastal subsidence and trapped stormwater.
  - *London, UK (Southwark & Lambeth)*: Victorian combined sewer capacity bottlenecks.
  - Auto-scatter across current camera view or famous global parks (Central Park, Yoyogi Park, Golden Gate Park, Tiergarten, Hyde Park, Amazon Basin, Gangotri valley).
- **Carbon Sequestration Counter**:
  - Calculates real-time metric tons of CO2 sequestered per year and total canopy coverage in $km^2$.
---

### 6. 🌡️ Climate & Planetary Simulator (Hackathon Theme)
- **Sea Level Rise Simulator**:
  - Interactive slider from 0m to +25m.
  - Live 3D extruded flood inundation layer dynamically calculated over vulnerable coastal areas (South Florida/Miami, Netherlands Rhine Delta, Venice Lagoon, Ganges-Brahmaputra Delta, Maldives, Lower Manhattan).
- **3D Greenhouse Gas (CO2) Hotspots**:
  - Glowing 3D emission pillars scaled to annual megatons of CO2 equivalent for global industrial hubs.
- **Deforestation Frontiers**:
  - Canopy loss monitoring zones across the Amazon, Congo Basin, Borneo, and Gran Chaco.
## 📁 Project Structure

### 5. 📏 Google Earth Ruler & Spatial Tools
- **Distance Measurement**: Click consecutive points on the 3D globe to measure geodesic distance (meters, kilometers, miles).
- **Area Measurement**: Draw enclosed polygons to calculate surface area in $km^2$, hectares, and acres.
```
d:\Hackathons\Climate\
├── index.html                # Full UI shell — all panels, modals, HUD
├── vite.config.js            # Vite + Cesium plugin config
├── package.json
└── src/
    ├── main.js               # EarthApp controller (~2500 lines)
    ├── style.css             # Glassmorphism dark UI (~2341 lines)
    ├── tours-data.js         # 4 tours × 19 stops + 15 lucky locations
    ├── climate-data.js       # Sea level, CO₂, deforestation hotspot data
    ├── measurement.js        # Distance & area measurement tool
    ├── vegetation.js         # 3D tree scattering & billboard engine
    ├── disaster-feed.js      # Live USGS + NASA EONET event feed
    ├── disaster-news.js      # NASA RSS + Windy + Zoom Earth news
    └── rainfall-sim.js       # Rainfall stagnation simulation engine
```

### 6. ☀️ Dynamic Solar & Day/Night Lighting
- **24-Hour Time-of-Day Scrubber**: Scrub the sun across 24 hours to watch sunrise, noon, golden hour, and starry nights with urban illumination.
- **Presets**: 1-click Sunrise (06:00), Noon (12:00), Golden Hour (18:00), Midnight (00:00).
---

### 7. 📌 Projects & Saved Placemarks
- Click anywhere on the 3D Earth to drop custom pins with custom labels, notes, and color themes (red, blue, green, yellow, purple).
- Persisted automatically in `localStorage`.
## ✨ Feature Overview

### 8. 🔑 Cesium ion Access Token Management
- Comes pre-configured with demo access, with a 1-click modal to input your own personal token from [ion.cesium.com/tokens](https://ion.cesium.com/tokens).
### 1. 🌐 Photorealistic 3D Globe

- **Cesium World Terrain** with water masks and vertex normals for real-world elevation, mountain ranges, and water bodies
- **Cesium OSM 3D Buildings** — global building geometries with four rendering styles:
  - 🏢 **Realistic Architecture** — natural material colors by building type (commercial, residential, office)
  - 🌆 **Cyberpunk Neon** — height-conditional glowing palette (cyan >180m, red >90m, purple >40m)
  - 🌡️ **Height Heatmap** — skyscrapers color-coded red → orange → yellow → cyan → blue
  - 📐 **Blueprint / Wireframe** — crisp technical visualization mode
- **Google Photorealistic 3D Tiles** — Cesium ion asset 2275207 for photorealistic city meshes
- **Multi-source Imagery Layers** (switchable):
  - 🛰️ Esri World Satellite Imagery
  - 🌃 CartoDB Dark Night
  - 🗺️ OpenStreetMap Standard
  - 🏔️ Esri World Topographic
- **Globe Rendering**: HDR, real-time atmospheric lighting, volumetric fog, terrain depth testing, shadow casting, animated water masks

---

## 🛠️ Quick Start
### 2. 🧭 Google Earth Navigation Controls

```bash
# Install dependencies
npm install
| Control | Location | Action |
|---|---|---|
| **3D Compass Rose** | Right rail, top | Rotates live with camera heading; click → snap True North |
| **2D / 3D Toggle** | Right rail | Switches pitch: -45° oblique (3D) ↔ -90° top-down (2D) |
| **Ground View** | Right rail | Flies to 50m altitude at current position, pitch -5° (pedestrian level) |
| **GPS My Location** | Right rail | `navigator.geolocation` → flies to user's real position at 3,500m |
| **Zoom In** | Right rail | Zooms by 35% of current camera height |
| **Zoom Out** | Right rail | Zooms out by 45% of current camera height |
| **Fullscreen** | Right rail | Browser fullscreen API toggle |
| **Disaster Markers Toggle** | Right rail (bell) | Master show/hide for all 3D disaster pins on globe |

# Start Vite dev server
npm run dev
**Mouse / Touch (Cesium native):** Left-drag rotates globe, right-drag tilts/pans, scroll wheel zooms, arrow keys pan.

# Build for production
npm run build
---

### 3. 🔭 Geocoding & Place Search

- **Top bar search input** with debounced (400ms) live querying
- Coordinate input support: `lat, lon` → direct camera fly to 2,500m
- **Nominatim OpenStreetMap API** for place name geocoding (`/search?format=json&q=...&limit=5`)
- Results shown in live dropdown; click flies camera to 3,000m above the place
- **Quick-access chips** in header: Disasters (live pulse), Tokyo, Manhattan, Central Park, Everest, Dubai, Gangotri Glacier, Amazon Basin
- **Search drawer panel** with 6 popular destination chips and full geocoder input

---

### 4. 🚀 Voyager Guided Tours & "I'm Feeling Lucky"

#### 4 Curated Tours (19 total stops):

| Tour | Category | Stops |
|---|---|---|
| **Wonders of the World** | Heritage | Taj Mahal · Great Pyramids · Colosseum · Machu Picchu · Petra |
| **Megacities in 3D** | Architecture | Lower Manhattan · Tokyo Shibuya · Burj Khalifa · Eiffel Tower · San Francisco |
| **Climate & Fragile Earth** | Climate | Gangotri Glacier · Amazon Deforestation · Great Barrier Reef · Malé Maldives · Aral Sea |
| **Extreme Landscapes** | Geography | Mount Everest · Grand Canyon · Mount Fuji · Victoria Falls |

Each stop includes: cinematic camera fly (3s, `QUADRATIC_IN_OUT` easing), stop title, geographic coordinates, descriptive narrative, and curated fact bullets.

**Tour Card Controls:**
- Prev / Next stop navigation with "N of M" counter
- **360° Cinematic Orbit** — automated camera rotation (0.003 rad/step, 30ms interval)
- Exit tour button

#### I'm Feeling Lucky 🎲
Picks randomly from **15 curated secret wonders** including: Aurora Borealis (Tromsø), Uluru, Santorini, Salar de Uyuni, Galápagos, Matterhorn, Bora Bora, Angkor Wat, Fagradalsfjall Volcano, Sossusvlei Red Dunes, and more. Flies with `CUBIC_IN_OUT` easing, 3.5s duration with temporary info card.

---

### 5. 🌡️ Climate & Environmental Visualizer

Three toggleable 3D data layer overlays from `CLIMATE_DATA`:

#### 🌊 Sea Level Rise Simulation (0 – 25 m slider)
Renders glowing 3D ellipse extrusions at **6 vulnerable coastal cities**:

| City | Current Elevation | Risk Level |
|---|---|---|
| Miami & South Florida | 1.8 m | Extreme |
| Netherlands & Rhine Delta | −2.0 m | Critical (Engineered) |
| Venice & Venetian Lagoon | 1.0 m | Severe |
| Ganges-Brahmaputra Delta | 2.5 m | Catastrophic |
| Malé, Maldives | 1.2 m | Existential |
| Lower Manhattan, NYC | 2.8 m | High |

Extrusion height scales with the slider value. Click-to-fly city chips available.

#### 🏭 CO₂ Emissions 3D Pillars
Vertical cylinder extrusions at **9 global industrial hotspots** with height proportional to emissions:

| Cluster | Emissions | Sector |
|---|---|---|
| Hebei Industrial Belt, China | 620 Mt CO₂e/yr | Steel & Coal |
| Shanghai Metropolitan | 260 Mt CO₂e/yr | Maritime Port |
| Houston Energy Corridor | 210 Mt CO₂e/yr | Petrochemical |
| Greater Tokyo | 185 Mt CO₂e/yr | Transport & Energy |
| Delhi NCR | 165 Mt CO₂e/yr | Transport & Thermal |
| Johannesburg-Mpumalanga | 140 Mt CO₂e/yr | Eskom Coal |
| Ruhr Valley, Germany | 120 Mt CO₂e/yr | Heavy Manufacturing |
| Silesian Coal Basin, Poland | 95 Mt CO₂e/yr | Lignite Coal |
| São Paulo | 85 Mt CO₂e/yr | Urban Transport |

#### 🌳 Deforestation Frontiers
Semi-transparent overlay ellipses at **4 global deforestation basins**:

| Zone | Loss Rate | Main Driver |
|---|---|---|
| Amazon Arc of Deforestation | 10,500 km²/yr | Cattle Ranching & Soy |
| Congo Basin | 4,200 km²/yr | Artisanal Logging & Charcoal |
| Borneo Peat Swamp | 3,800 km²/yr | Oil Palm & Pulp Concessions |
| Chaco Dry Forest | 2,900 km²/yr | Industrial Soy & Beef |

---

### 6. 🚨 Live Global Natural Disaster Feed

#### Real-Time Data Sources
- **USGS Earthquakes** — `M4.5+ Past 7 Days` GeoJSON feed (`earthquake.usgs.gov`)
- **NASA EONET** — Open events API v3, limit 50 (`eonet.gsfc.nasa.gov`): wildfires, tropical storms, volcanoes, floods, sea/lake ice
- **Fallback cache** — 6 curated high-quality events (Japan earthquake, Kilauea, LA wildfire, Coral Sea cyclone, Iceland earthquake, Brazil flood) used when both APIs are unreachable

#### 7 Disaster Category Types

| Type | Color | Icon | Windy Overlay |
|---|---|---|---|
| Earthquake | Amber `#f59e0b` | activity | wind |
| Wildfire | Red `#ef4444` | flame | cosc (smoke) |
| Tropical Cyclone | Violet `#8b5cf6` | wind | wind |
| Volcano | Dark Orange `#ea580c` | mountain | cosc |
| Flood | Cyan `#06b6d4` | droplets | rain |
| Severe Storm | Blue `#3b82f6` | cloud-lightning | radar |
| Sea & Lake Ice | Light Blue `#38bdf8` | snowflake | satellite |

#### 3D Globe Markers
- Cesium point entities at 50m altitude, earthquakes at 13px, all others at 11px
- **Depth test fix**: `disableDepthTestDistance: 150,000 m` — markers on the far side of Earth are correctly hidden
- **Distance culling**: labels visible only within 1,800 km; points within 10,000 km (no through-Earth bleed)
- Click any marker → camera flies to event, disaster intelligence card appears

#### Floating Disaster Intelligence Card
Shows: Type Badge, Full Title, Place / Country, **Magnitude / Severity**, Recorded Time (relative + date), Coordinates, Data Source, plus action buttons:
- **Windy Radar** — opens Windy.com radar modal centred on disaster
- **Zoom Earth** — opens HD satellite cyclone tracker at exact coordinates
- **Focus Site** — isolates camera to this location, hides faraway markers
- **360° Orbit** — cinematic orbit around the epicentre
- **Incident Source** — opens official report URL

#### Marker Visibility Controls
- **Master toggle** (bell button, right rail) — show/hide all disaster pins
- **Per-category toggles** — individual checkboxes for Earthquakes, Wildfires, Cyclones, Volcanoes, Floods, Storms
- **Text search** — filter by place name, country, or type keyword
- **Filter pills** — All / Earthquakes / Wildfires / Cyclones & Storms / Volcanoes / Floods

---

### 7. 📰 Triple-Source Disaster Newsroom

**Sources:** NASA Earth Observatory · Windy.com · Zoom Earth Satellite

#### News Feed Architecture
- **NASA Earth Observatory RSS** fetched live via CORS proxy (`api.rss2json.com`), auto-categorized by keyword detection (fire/burn, storm/cyclone, volcano, flood/rain, ice/glacier)
- **Windy Meteorological Bulletins** — 4 curated atmospheric advisories (cyclone tracking, atmospheric rivers, smoke dispersion, North Atlantic wave swells)
- **Zoom Earth Satellite Dispatches** — 3 curated HD satellite cyclone & wildfire reports (Himawari, GOES, Meteosat imagery references)
- Merged and sorted by recency

#### Source Filter Tabs
`All Sources` · `🛰️ NASA Earth` · `🌀 Windy Alerts` · `🌍 Zoom Earth`

#### Category Filter Pills
All · 🔥 Wildfires · 🌪️ Cyclones · 🌋 Volcanoes · 🌊 Floods · ❄️ Ice/Glaciers

#### News Card Actions (per article)
- **Fly to Scene** — camera flies to article's geographic coordinates on the 3D globe
- **Windy** — opens Windy radar modal with correct overlay for event type
- **Zoom Earth** — opens HD satellite view at event's coordinates
- **Story** — opens full article in new tab (NASA EO, Windy, or Zoom Earth)

---

### 8. 🌀 Windy.com Live Atmospheric Radar Modal

Embedded live interactive particle stream radar from **Windy.com** (ECMWF model):

| Tab | Overlay Code | Shows |
|---|---|---|
| 🌪️ Cyclones & Winds | `wind` | Live storm eye tracking, wind velocity particle streams |
| 📡 Weather Radar | `radar` | Live doppler precipitation radar |
| 🌧️ Rain & Thunder | `rain` | Convective storm precipitation tracking |
| 🛰️ Visible Satellite | `satellite` | Cloud cover and atmospheric moisture imagery |
| 🔥 Fire Smoke / CO | `cosc` | Carbon monoxide and PM2.5 aerosol dispersion |
| 🌊 Storm Surge / Waves | `waves` | Ocean swell, significant wave heights |

**Modal Footer:** Zoom Earth HD link (coordinate-aware) + Open in Windy Fullscreen link

---

### 9. 🌍 Zoom Earth Satellite Integration

Since Zoom Earth (`zoom.earth`) cannot be iframed (SAMEORIGIN header), integration uses context-aware deep links:

- **Disaster Card** — "Zoom Earth" button opens `zoom.earth/maps/satellite/#view={lat},{lon},{zoom}z/overlays=wind,radar`
- **News Articles** — per-article Zoom Earth button for each dispatch
- **Windy Modal Footer** — "Zoom Earth HD" button mirrors the Windy modal's current coordinates
- **Events Drawer Banner** — "Zoom Earth Satellite" quick-launch button

---

### 10. 🌲 3D Vegetation & Afforestation Engine

#### Tree Species (inline SVG billboards)
| Species | Canopy Style | Best Use |
|---|---|---|
| **Temperate Oak / Deciduous** | Rounded multi-circle, brown trunk | City parks, temperate woodlands |
| **Alpine Pine** | 3-tier triangular segments | Mountainous terrain, boreal forest |
| **Tropical Palm** | Bézier-curved trunk, 5 frond arcs | Coastal, island biomes |
| **Dense Rainforest Canopy** | 3-layer flat umbrella ellipses | Tropical river basins |

#### Rendering Architecture
- Single **`BillboardCollection`** GPU primitive — handles thousands of trees efficiently
- `HeightReference.CLAMP_TO_GROUND` — trees stick to terrain regardless of elevation
- Scale jitter: 0.35–0.65 randomized for natural variation
- Circular cluster distribution: `sqrt(random())` for uniform density within radius

#### Planting Methods
- **Scatter in Current View** — density slider (100–2,500 trees), detects known zone bounds automatically
- **Interactive Brush** — LEFT_CLICK anywhere on globe plants a 180m radius cluster of 45 trees
- **Famous Green Zone Presets** — 1-click scatter for 7 zones:

| Zone | City | Type | Density |
|---|---|---|---|
| Central Park | New York, USA | Oak | 1,200 |
| Yoyogi Park & Meiji Jingu | Tokyo, Japan | Oak | 900 |
| Golden Gate Park | San Francisco, USA | Pine | 1,400 |
| Tiergarten Park | Berlin, Germany | Oak | 1,000 |
| Hyde Park & Kensington | London, UK | Oak | 850 |
| Amazon Rainforest Corridor | Manaus, Brazil | Rainforest | 2,500 |
| Gangotri Valley Alpine Belt | Himalayas, India | Pine | 1,200 |

#### Live Impact Metrics
- **Trees Planted** — running total
- **CO₂ Sequestration** — × 0.022 t CO₂/tree/yr
- **Canopy Area** — × 25 m² per tree → km²

---

### 11. 🌧️ Rainfall & Stagnant Water Simulation Engine

> **Branch:** `rainfall-sim`

Predicts topographical depression sinks and renders animated 3D stagnant water pooling over any user-selected area.

#### Area Selection
- **Draw Area Box** — 2-click interactive rectangle draw on the 3D globe with live preview
- **Current View** — snaps the active camera viewport (clipped to ~3.5 km span)
- **Global Presets** — 1-click fly and auto-configure for 6 vulnerable cities

#### Rainfall & Time Parameters (user-configurable)

| Parameter | Range | Description |
|---|---|---|
| **Rainfall Rate** | 5 – 180 mm/hr | Drizzle (5) → Heavy (45) → Extreme Cloudburst (180) |
| **Storm Duration** | 0.5 – 24 hrs | 30 minutes to multi-day rainfall periods |
| **Surface Permeability** | 3 profiles | Urban (2.5 mm/hr infiltration) · Suburban (14 mm/hr) · Parkland (42 mm/hr) |
| **Storm Drain Capacity** | 0 – 40 mm/hr | Municipal drainage removal rate (0 = blocked drains) |

#### Hydrological Computation Algorithm
1. **Gross rainfall** = Rate × Duration
2. **Ground infiltration** = `profile.infiltrationRate × duration` (capped at gross)
3. **Drainage removal** = `drainageCapacity × duration`
4. **Net surface water** = max(0, gross − infiltration − drainage)
5. **16×16 topography grid** (256 cells) over selected bounds
6. Per cell: queries `Cesium.Globe.getHeight()` for real terrain elevation + synthetic valley/micro-sink noise (`sin/cos` wave functions for drainage hollows)
7. **Depression factor** = `(maxElev − cellElev) / elevRange`; cells > 0.42 accumulate water
8. **Ponding depth** = `(netMm/10) × concentrationMultiplier × depressionFactor^1.4`
9. Cells with ≥ 3 cm depth rendered as 3D water patches

#### 3D Water Depth Visualization

| Depth Range | Color | Severity |
|---|---|---|
| 3 – 15 cm | Cyan `rgba(56,189,248,0.65)` | 💧 Shallow puddle — pedestrian splash risk |
| 15 – 40 cm | Azure `rgba(2,132,199,0.78)` | ⚠️ Stagnant waterlogging — road obstruction |
| > 40 cm | Deep Navy + Red outline | 🚨 Deep inundation — vehicle submergence risk |

#### Risk Classification
| Level | Trigger | Color |
|---|---|---|
| Safe / Minimal | < 5 cm max depth | 🟢 `#4ade80` |
| Minor Stagnant Puddles | ≥ 5 cm | 🔵 `#38bdf8` |
| Significant Waterlogging | > 25 cm or > 25% area flooded | 🟡 `#f59e0b` |
| Severe Flood Inundation | > 60 cm or > 45% area flooded | 🔴 `#ef4444` |

#### Real-Time Impact Telemetry (6 stat cards)
- Total Rain Delivered (mm)
- Net Ponding Depth (mm)
- Peak Stagnant Pool Depth (cm)
- Flooded Area (hectares & % of study zone)
- Total Stagnant Volume (m³)
- Estimated Natural Clearance Time (hours; post-rain drainage at 3.5 mm/hr)

#### Storm Progression Playback
- **Play / Pause / Replay** animation stepping in 0.25h increments at 450ms per step
- **Time scrub slider** — scrub to any hour in the storm timeline, recomputes water on demand

#### Global Urban Vulnerability Presets

| City | Surface | Rainfall | Duration | Drain Capacity |
|---|---|---|---|---|
| Mumbai (Mithi River Basin) | Dense Urban | 95 mm | 3 hrs | 12 mm/hr |
| New Orleans (Mid-City Bowl) | Dense Urban | 75 mm | 4 hrs | 25 mm/hr |
| Dhaka (Dhanmondi / Mirpur) | Dense Urban | 80 mm | 2 hrs | 10 mm/hr |
| Houston (Buffalo Bayou) | Suburban | 60 mm | 6 hrs | 18 mm/hr |
| Jakarta (North Jakarta) | Dense Urban | 110 mm | 3 hrs | 8 mm/hr |
| London (Southwark & Lambeth) | Suburban | 45 mm | 1.5 hrs | 20 mm/hr |

---

### 12. 📐 Measurement Tools

| Mode | Method | Output |
|---|---|---|
| **Line Distance** | Click points → geodesic `EllipsoidGeodesic.surfaceDistance` | km, miles, meters |
| **Polygon Area** | 3+ points → spherical polygon formula | km², hectares, acres |

Entities rendered as `PolylineGlowMaterial` lines + `CallbackProperty` polygons clamped to ground. RIGHT-CLICK finishes; Clear resets all.

---

### 13. 📌 Placemarks & Saved Locations

- Left-click on globe (while in placemark mode) → opens **Save 3D Placemark** modal
- Fields: Name, Notes, 5-color picker (red, blue, green, yellow, purple)
- Rendered as colored point entity + white label (always visible, depth-test disabled)
- Saved to `localStorage.terrascope_placemarks`; persists across sessions
- Fly-to and delete from placemark list

---

### 14. ☀️ Sunlight & Time of Day

- **24-hour solar slider** (both in Lighting panel and footer HUD quick slider)
- Sets `Cesium.JulianDate` to simulate any time of day with real Earth axial tilt
- **Quick presets:** Sunrise 06:00 · Solar Noon 12:00 · Golden Hour 18:00 · Midnight 00:00
- Full shadow casting and atmospheric scattering respond to time

---

### 15. 📡 Live Telemetry HUD (Footer Bar)

| Display | Updates On | Source |
|---|---|---|
| **CURSOR LAT / LON** | Mouse move | `ScreenSpaceEventType.MOUSE_MOVE` → `globe.pick` → `Cartographic` |
| **TERRAIN ELEVATION** | Mouse move | `globe.getHeight(carto)` |
| **CAMERA EYE ALTITUDE** | Camera change | `camera.positionCartographic.height` |
| **HEADING / TILT** | Camera change | `camera.heading`, `camera.pitch` in degrees |
| **SUN TIME SCRUBBER** | Slider drag | `viewer.clock.currentTime` via `JulianDate.fromDate` |

---

## 🗺️ External APIs & Services

| Service | Endpoint | Purpose |
|---|---|---|
| **Cesium ion** | `ion.cesium.com` | World Terrain, OSM 3D Buildings, Google 3D Tiles |
| **USGS Earthquakes** | `earthquake.usgs.gov/.../4.5_week.geojson` | Real-time M4.5+ global seismic events |
| **NASA EONET** | `eonet.gsfc.nasa.gov/api/v3/events` | Active wildfires, storms, volcanoes, floods |
| **NASA Earth Observatory** | Via `api.rss2json.com` proxy | RSS-to-JSON scientific articles and imagery dispatches |
| **Nominatim OSM** | `nominatim.openstreetmap.org/search` | Free geocoding and place search |
| **Windy.com** | `embed.windy.com/embed2.html` | Embeddable ECMWF atmospheric radar |
| **Zoom Earth** | `zoom.earth/maps/satellite/` | HD satellite imagery + cyclone tracking (link-out) |
| **Esri ArcGIS** | `services.arcgisonline.com` | World Satellite Imagery + Topographic tiles |
| **CartoDB** | `basemaps.cartocdn.com/dark_all` | Dark Night basemap tiles |
| **OpenStreetMap** | `tile.openstreetmap.org` | Standard street map tiles |

---

## 🏗️ Architecture

```
EarthApp (main.js)
├── initViewer()          → Cesium Viewer + terrain + lighting
├── initMeasurement()     → MeasurementController
├── initVegetation()      → VegetationEngine (BillboardCollection)
├── initDisasterFeed()    → LiveDisasterFeedManager (USGS + EONET)
├── initDisasterNews()    → DisasterNewsEngine (NASA RSS + Windy + ZoomEarth)
├── initRainfallSim()     → RainfallStagnationEngine
├── initUI()              → all event listeners, panel routing, modals
└── initTelemetry()       → HUD mouse/camera tracking

Open [http://localhost:5173](http://localhost:5173) in your browser.
Drawer Panels (renderDrawerContent)
  search │ voyager │ layers │ climate │ disasters (events+news)
  vegetation │ rainfall │ measure │ placemarks │ lighting │ settings

Modals
  #placemarkModal │ #tokenModal │ #windyModal
```

---

## ⚙️ Configuration

### Cesium ion Token
The app ships with a community demo token. To unlock full-resolution Cesium World Terrain and Google 3D Tiles:
1. Create a free account at [ion.cesium.com](https://ion.cesium.com)
2. Click ⚙️ **Settings** in the left rail → **Manage Cesium ion Token** → paste your JWT token
3. Token is saved to `localStorage.terrascope_ion_token` and survives page reloads

### Local Storage Keys
| Key | Value |
|---|---|
| `terrascope_placemarks` | JSON array — `{id, title, notes, color, lon, lat, height}` |
| `terrascope_ion_token` | Cesium ion JWT access token |

---

## 🌿 Branches

| Branch | Description |
|---|---|
| `main` | Full-featured app with all disaster feeds, vegetation, climate layers, Windy + Zoom Earth integration |
| `rainfall-sim` | Adds the **Rainfall & Stagnant Water Simulation** panel — area selection, mm/hr + duration inputs, 3D ponding visualization, 6 global vulnerability presets |

---

## 🗃️ Git History

```
d7fb2d1  feat(rainfall-sim): add interactive area selection, rainfall mm 
         and duration options with 3D stagnant water ponding simulation
cf45a88  Initial commit: Astra 3D Globe with Cesium ion, live disaster 
         feed, vegetation engine, Windy & Zoom Earth integration
```

---

## 📸 UI Components at a Glance

| Component | Description |
|---|---|
| **Top Bar** | Brand logo, geocoding search, quick-fly chips, ion token status badge |
| **Left Tool Rail** | 13 panel toggle buttons with active-state highlighting and live pulse animations |
| **Side Drawer** | 380px slide-in panel, dynamically filled per active tool |
| **Earth Controls** | Right-side compass, zoom group, perspective toggles, fullscreen |
| **Tour Card** | Floating bottom-left cinematic tour card with prev/next and orbit controls |
| **Disaster Card** | Floating bottom-left event intelligence card with multi-action footer |
| **Windy Modal** | Full-width radar modal with 6 overlay tabs and dual link footer |
| **Telemetry HUD** | Full-width footer bar: cursor coords, terrain elev, camera alt, heading/pitch, sun scrubber |
| **Modals** | Placemark creation · Cesium ion token config |

---

## 🎨 Design System

- **Background:** Near-black `#0f1318` with layered glassmorphism surfaces (84% → 95% opacity glass panels)
- **Accent palette:** Google Blue `#4285f4` · Green `#34a853` · Yellow `#fbbc05` · Red `#ea4335` · Purple `#a142f4`
- **Typography:** Plus Jakarta Sans (UI text) + JetBrains Mono (coordinates, numbers, telemetry)
- **Shadows:** Heavy float shadow `0 12px 36px rgba(0,0,0,0.55)` on all floating elements
- **Animations:** `slideInDrawer`, `pulseDisaster` (live dot), `rollDice`, `pulseGlow`, `spin`
- **Responsive breakpoint:** ≤ 900px collapses quick chips, narrows drawer and tour card

---

*Built for hackathon — Climate Intelligence · Smart Cities · 3D Geospatial*
