import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { createIcons, icons } from 'lucide';
import { TOURS, LUCKY_LOCATIONS } from './tours-data.js';
import { CLIMATE_DATA } from './climate-data.js';
import { MeasurementController } from './measurement.js';
import { VegetationEngine, FAMOUS_GREEN_ZONES } from './vegetation.js';
import { LiveDisasterFeedManager, DISASTER_TYPES } from './disaster-feed.js';
import { DisasterNewsEngine } from './disaster-news.js';

// Default community / demo Cesium ion token
// Users can easily set their own token in the UI modal
const DEFAULT_ION_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmMWExNzkxYS1kNjI0LTRiMjktODliNy02NWQzYTE4YzRiYjgiLCJpZCI6MjU0LCJpYXQiOjE1MjY5OTk4ODV9.8m6f_07t8J94X8GjV1n2o8Jk_Z7-XvM7_B5pQcE8A2I';

class EarthApp {
  constructor() {
    this.viewer = null;
    this.active3DTileset = null;
    this.osmBuildingsTileset = null;
    this.google3DTileset = null;
    this.activeBaseLayer = null;
    this.measurementController = null;
    this.vegetationEngine = null;
    this.activeTreeType = 'oak';
    this.disasterFeedManager = null;
    this.activeDisaster = null;
    this.disasterOrbitInterval = null;
    this.currentWindyOverlay = 'wind';
    this.currentWindyLocation = { lat: 20, lon: 0 };
    this.disasterNewsEngine = null;
    this.disasterSubTab = 'events'; // 'events' | 'news'
    
    // State
    this.currentMode3D = true;
    this.isOrbiting = false;
    this.orbitInterval = null;
    this.activeTour = null;
    this.tourStopIndex = 0;
    this.currentBuildingStyle = 'realistic';
    this.activePanel = null;
    this.addingPin = false;
    this.pendingPinCartesian = null;
    this.placemarks = JSON.parse(localStorage.getItem('terrascope_placemarks') || '[]');
    this.climateLayers = {
      seaLevel: false,
      seaLevelMeters: 2,
      co2: false,
      deforestation: false
    };
    this.seaLevelEntities = [];
    this.co2Entities = [];
    this.deforestationEntities = [];

    this.init();
  }

  async init() {
    this.initIonToken();
    await this.initViewer();
    this.initMeasurement();
    this.initVegetation();
    this.initDisasterFeed();
    this.initDisasterNews();
    this.initUI();
    this.initTelemetry();
    this.loadPlacemarksFromStorage();
    this.refreshIcons();

    console.log('TerraScope 3D initialized successfully.');
  }

  initIonToken() {
    const savedToken = localStorage.getItem('terrascope_ion_token');
    Cesium.Ion.defaultAccessToken = savedToken || DEFAULT_ION_TOKEN;
    this.updateTokenBadge(!!savedToken);
  }

  updateTokenBadge(isCustom) {
    const badge = document.getElementById('ionTokenBadge');
    if (!badge) return;
    const dot = badge.querySelector('.token-dot');
    const label = badge.querySelector('.token-label');
    if (isCustom) {
      dot.className = 'token-dot';
      label.textContent = 'Custom ion Token';
    } else {
      dot.className = 'token-dot warning';
      label.textContent = 'Demo ion Token';
    }
  }

  async initViewer() {
    // Attempt to load Cesium World Terrain with water masks
    let terrainProvider;
    try {
      terrainProvider = await Cesium.createWorldTerrainAsync({
        requestWaterMask: true,
        requestVertexNormals: true
      });
    } catch (e) {
      console.warn('World Terrain load fallback to Ellipsoid:', e);
      terrainProvider = new Cesium.EllipsoidTerrainProvider();
    }

    this.viewer = new Cesium.Viewer('cesiumContainer', {
      terrainProvider: terrainProvider,
      animation: false,
      timeline: false,
      navigationHelpButton: false,
      homeButton: false,
      geocoder: false,
      baseLayerPicker: false,
      sceneModePicker: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
      shadows: true,
      shouldAnimate: true
    });

    // Realistic atmospheric rendering & Google Earth lighting
    const scene = this.viewer.scene;
    scene.globe.enableLighting = true;
    scene.globe.atmosphereBrightnessShift = 0.05;
    scene.globe.depthTestAgainstTerrain = true;
    scene.fog.enabled = true;
    scene.fog.density = 0.00015;
    scene.highDynamicRange = true;

    // Load initial 3D OSM Buildings
    try {
      this.osmBuildingsTileset = await Cesium.createOsmBuildingsAsync();
      this.viewer.scene.primitives.add(this.osmBuildingsTileset);
      this.active3DTileset = this.osmBuildingsTileset;
      this.applyBuildingStyle('realistic');
    } catch (e) {
      console.warn('OSM Buildings load notice:', e);
    }

    // Set initial viewpoint (Global overview tilted toward sunrise/sunset)
    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(15.0, 20.0, 18000000.0),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-85),
        roll: 0.0
      },
      duration: 0
    });
  }

  initMeasurement() {
    this.measurementController = new MeasurementController(this.viewer, (data) => {
      this.renderMeasurementHUD(data);
    });
  }

  initVegetation() {
    this.vegetationEngine = new VegetationEngine(this.viewer, (stats) => {
      this.renderVegetationStats(stats);
    });
  }

  renderVegetationStats(stats) {
    const countEl = document.getElementById('vegTreeCount');
    const co2El = document.getElementById('vegCo2Count');
    const areaEl = document.getElementById('vegAreaCount');

    if (countEl) countEl.textContent = stats.treeCount.toLocaleString();
    if (co2El) co2El.textContent = `${stats.co2SequestrationTons} t`;
    if (areaEl) areaEl.textContent = `${stats.canopyAreaSqKm} km²`;
  }

  /* LIVE DISASTER FEED INTEGRATION */
  initDisasterFeed() {
    this.disasterFeedManager = new LiveDisasterFeedManager(
      this.viewer,
      (event) => this.renderDisasterCard(event),
      (filteredEvents, stats) => this.updateDisasterFeedUI(filteredEvents, stats)
    );

    // Initial fetch from NASA EONET and USGS Earthquakes
    this.disasterFeedManager.fetchLiveFeed();
  }

  renderDisasterCard(event) {
    this.activeDisaster = event;
    const card = document.getElementById('disasterCard');
    if (!card) return;

    const meta = DISASTER_TYPES[event.type] || DISASTER_TYPES.storm;

    const badge = document.getElementById('disasterTypeBadge');
    badge.className = `disaster-type-pill type-${event.type}`;
    document.getElementById('disasterTypeName').textContent = event.typeName;

    document.getElementById('disasterTitle').textContent = event.title;
    document.getElementById('disasterPlace').textContent = event.place;
    document.getElementById('disasterMagnitude').textContent = event.magnitude;
    document.getElementById('disasterTime').textContent = `${LiveDisasterFeedManager.formatRelativeTime(event.date)} (${new Date(event.date).toLocaleDateString()})`;

    const latStr = `${Math.abs(event.lat).toFixed(3)}° ${event.lat >= 0 ? 'N' : 'S'}`;
    const lonStr = `${Math.abs(event.lon).toFixed(3)}° ${event.lon >= 0 ? 'E' : 'W'}`;
    document.getElementById('disasterCoords').textContent = `${latStr}, ${lonStr}`;

    document.getElementById('disasterSource').textContent = event.source;

    const link = document.getElementById('disasterExternalLink');
    if (link) link.href = event.url;

    const zoomEarthBtn = document.getElementById('disasterZoomEarthBtn');
    if (zoomEarthBtn) {
      zoomEarthBtn.href = LiveDisasterFeedManager.getZoomEarthCycloneUrl(event.lat, event.lon, 6);
    }

    card.style.display = 'block';
    this.refreshIcons();
  }

  updateDisasterFeedUI(filteredEvents, stats) {
    if (this.activePanel !== 'disasters') return;

    const totalEl = document.getElementById('dstatTotal');
    const quakesEl = document.getElementById('dstatQuakes');
    const firesEl = document.getElementById('dstatFires');
    const cyclonesEl = document.getElementById('dstatCyclones');

    if (totalEl) totalEl.textContent = stats.total;
    if (quakesEl) quakesEl.textContent = stats.quakes;
    if (firesEl) firesEl.textContent = stats.fires;
    if (cyclonesEl) cyclonesEl.textContent = stats.cyclones;

    const list = document.getElementById('disasterFeedList');
    if (!list) return;

    if (filteredEvents.length === 0) {
      list.innerHTML = `<div class="toggle-sub" style="padding: 14px; text-align: center;">No natural disasters match current filter.</div>`;
      return;
    }

    list.innerHTML = filteredEvents.map(ev => `
      <div class="disaster-feed-item ${this.activeDisaster?.id === ev.id ? 'selected' : ''}" data-ev-id="${ev.id}">
        <div class="dfeed-left">
          <div class="dfeed-icon-box ${ev.type}">
            <i data-lucide="${DISASTER_TYPES[ev.type]?.icon || 'alert-triangle'}"></i>
          </div>
          <div class="dfeed-details">
            <div class="dfeed-place">${ev.place}</div>
            <div class="dfeed-sub">
              <span>${ev.typeName}</span> • <span>${LiveDisasterFeedManager.formatRelativeTime(ev.date)}</span>
            </div>
          </div>
        </div>
        <div class="dfeed-right">
          <span class="dfeed-mag-badge">${ev.magnitude}</span>
        </div>
      </div>
    `).join('');

    this.refreshIcons();

    list.querySelectorAll('.disaster-feed-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-ev-id');
        const ev = this.disasterFeedManager.events.find(e => e.id === id);
        if (ev) {
          list.querySelectorAll('.disaster-feed-item').forEach(i => i.classList.remove('selected'));
          item.classList.add('selected');
          this.disasterFeedManager.selectEvent(ev);
        }
      });
    });
  }

  /* DISASTER NEWS & BRIEFINGS (NASA & WINDY) */
  initDisasterNews() {
    this.disasterNewsEngine = new DisasterNewsEngine((filteredNews) => {
      this.updateDisasterNewsUI(filteredNews);
    });

    this.disasterNewsEngine.fetchLiveNews();
  }

  updateDisasterNewsUI(filteredNews) {
    if (this.activePanel !== 'disasters' || this.disasterSubTab !== 'news') return;

    const list = document.getElementById('disasterNewsList');
    if (!list) return;

    if (!filteredNews || filteredNews.length === 0) {
      list.innerHTML = `<div class="toggle-sub" style="padding: 16px; text-align: center;">No natural hazard news reports match current filter.</div>`;
      return;
    }

    list.innerHTML = filteredNews.map(item => {
      const sourceName = item.sourceType === 'nasa' 
        ? 'NASA Earth' 
        : (item.sourceType === 'zoom-earth' ? 'Zoom Earth HD' : 'Windy Alert');

      return `
      <div class="news-card" data-news-id="${item.id}">
        <div class="news-card-header">
          <div class="news-badges-left">
            <span class="news-source-tag ${item.sourceType}">${sourceName}</span>
            <span class="news-cat-tag">${item.categoryLabel}</span>
          </div>
          <span class="news-time">${LiveDisasterFeedManager.formatRelativeTime(item.date)}</span>
        </div>
        
        <div class="news-title">${item.title}</div>
        <div class="news-summary">${item.summary}</div>

        <div class="news-location-row">
          <i data-lucide="map-pin"></i> <span>${item.location}</span>
        </div>

        <div class="news-actions-row">
          <button class="btn-news-action fly-btn" data-fly-news="${item.id}">
            <i data-lucide="navigation"></i> Fly to Scene
          </button>
          <button class="btn-news-action windy-radar-btn" data-windy-news="${item.id}">
            <i data-lucide="wind"></i> Windy
          </button>
          <a href="${LiveDisasterFeedManager.getZoomEarthCycloneUrl(item.coords?.lat || 20, item.coords?.lon || 0, 6)}" target="_blank" rel="noopener" class="btn-news-action zoom-earth-btn" title="Track Live Satellite on Zoom Earth">
            <i data-lucide="satellite"></i> Zoom Earth
          </a>
          <a href="${item.url}" target="_blank" rel="noopener" class="btn-news-action">
            Story <i data-lucide="external-link"></i>
          </a>
        </div>
      </div>
    `;
    }).join('');

    this.refreshIcons();

    // Fly to news coordinates
    list.querySelectorAll('[data-fly-news]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-fly-news');
        const item = this.disasterNewsEngine.newsArticles.find(n => n.id === id);
        if (item && item.coords) {
          this.viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(item.coords.lon, item.coords.lat, item.coords.height || 20000),
            orientation: { heading: 0, pitch: Cesium.Math.toRadians(-35), roll: 0 },
            duration: 2.5
          });
        }
      });
    });

    // Open Windy live radar for news item
    list.querySelectorAll('[data-windy-news]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-windy-news');
        const item = this.disasterNewsEngine.newsArticles.find(n => n.id === id);
        if (item && item.coords) {
          this.openWindyModal(item.coords.lat, item.coords.lon, item.title, item.windyOverlay || 'wind');
        }
      });
    });
  }

  toggleDisasterOrbit() {
    if (this.disasterOrbitInterval) {
      clearInterval(this.disasterOrbitInterval);
      this.disasterOrbitInterval = null;
      document.getElementById('disasterOrbitBtn')?.classList.remove('active');
    } else {
      document.getElementById('disasterOrbitBtn')?.classList.add('active');
      this.disasterOrbitInterval = setInterval(() => {
        this.viewer.camera.rotate(Cesium.Cartesian3.UNIT_Z, 0.003);
      }, 30);
    }
  }

  /* WINDY.COM LIVE RADAR MODAL CONTROLS */
  openWindyModal(lat = 20, lon = 0, title = 'Global Atmosphere', defaultOverlay = 'wind') {
    this.currentWindyLocation = { lat, lon };
    this.currentWindyOverlay = defaultOverlay;

    const modal = document.getElementById('windyModal');
    if (!modal) return;

    document.getElementById('windyModalTitle').textContent = `Windy Radar: ${title || 'Live Weather'}`;
    const latStr = `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? 'N' : 'S'}`;
    const lonStr = `${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? 'E' : 'W'}`;
    document.getElementById('windyCoordsDisplay').textContent = `Coordinates: ${latStr}, ${lonStr} • Live ECMWF Atmospheric Stream`;

    // Highlight active tab
    document.querySelectorAll('.wtab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-woverlay') === defaultOverlay);
    });

    const iframe = document.getElementById('windyIframe');
    if (iframe) {
      iframe.src = LiveDisasterFeedManager.getWindyEmbedUrl(lat, lon, defaultOverlay, 5);
    }

    const directLink = document.getElementById('windyDirectLink');
    if (directLink) {
      directLink.href = `https://www.windy.com/?${lat},${lon},5`;
    }

    const zoomLink = document.getElementById('windyZoomEarthLink');
    if (zoomLink) {
      zoomLink.href = LiveDisasterFeedManager.getZoomEarthCycloneUrl(lat, lon, 6);
    }

    modal.style.display = 'flex';
    this.refreshIcons();
  }

  closeWindyModal() {
    const modal = document.getElementById('windyModal');
    if (modal) modal.style.display = 'none';
    const iframe = document.getElementById('windyIframe');
    if (iframe) iframe.src = '';
  }

  renderMeasurementHUD(data) {
    const display = document.getElementById('measurementDisplay');
    if (!display) return;

    if (!data) {
      display.innerHTML = `
        <div class="measure-card">
          <div class="measure-unit">Click points on the 3D globe to measure</div>
          <div class="measure-value">0.00 km</div>
        </div>
      `;
      return;
    }

    if (data.mode === 'distance') {
      display.innerHTML = `
        <div class="measure-card">
          <div class="measure-unit">Total Distance (${data.count} points)</div>
          <div class="measure-value">${data.distanceKm} km</div>
          <div class="measure-unit">${data.distanceMiles} miles / ${(data.distanceMeters).toFixed(0)} meters</div>
        </div>
      `;
    } else if (data.mode === 'area') {
      display.innerHTML = `
        <div class="measure-card">
          <div class="measure-unit">Enclosed Area (${data.count} vertices)</div>
          <div class="measure-value">${data.areaSqKm} km²</div>
          <div class="measure-unit">${data.areaHectares} ha / ${data.areaAcres} acres</div>
        </div>
      `;
    }
  }

  /* BUILDING STYLES (Photorealistic, Cyberpunk, Height Heatmap, Wireframe) */
  applyBuildingStyle(styleKey) {
    this.currentBuildingStyle = styleKey;
    if (!this.osmBuildingsTileset) return;

    if (styleKey === 'realistic') {
      this.osmBuildingsTileset.style = new Cesium.Cesium3DTileStyle({
        color: {
          conditions: [
            ["${feature['building']} === 'commercial'", "color('#8a9ba8')"],
            ["${feature['building']} === 'residential'", "color('#c4b49e')"],
            ["${feature['building']} === 'office'", "color('#7b8f9e')"],
            ["true", "color('#ded6c8')"]
          ]
        }
      });
    } else if (styleKey === 'cyberpunk') {
      this.osmBuildingsTileset.style = new Cesium.Cesium3DTileStyle({
        color: {
          conditions: [
            ["${feature['cesium#estimatedHeight']} > 180", "color('#00f0ff', 0.9)"],
            ["${feature['cesium#estimatedHeight']} > 90", "color('#ff0055', 0.85)"],
            ["${feature['cesium#estimatedHeight']} > 40", "color('#7928ca', 0.8)"],
            ["true", "color('#0a192f', 0.75)"]
          ]
        }
      });
    } else if (styleKey === 'heatmap') {
      this.osmBuildingsTileset.style = new Cesium.Cesium3DTileStyle({
        color: {
          conditions: [
            ["${feature['cesium#estimatedHeight']} > 250", "color('#ff0000', 0.95)"],
            ["${feature['cesium#estimatedHeight']} > 150", "color('#ff7700', 0.9)"],
            ["${feature['cesium#estimatedHeight']} > 80", "color('#ffcc00', 0.85)"],
            ["${feature['cesium#estimatedHeight']} > 35", "color('#00ccff', 0.8)"],
            ["true", "color('#0066cc', 0.75)"]
          ]
        }
      });
    } else if (styleKey === 'blueprint') {
      this.osmBuildingsTileset.style = new Cesium.Cesium3DTileStyle({
        color: "color('#2d4059', 0.65)"
      });
    }
  }

  /* BASE IMAGERY & 3D TILES SWITCHING */
  async switchBaseTiles(type) {
    if (type === 'google') {
      try {
        if (!this.google3DTileset) {
          this.google3DTileset = await Cesium.createGooglePhotorealistic3DTileset();
        }
        if (this.osmBuildingsTileset) this.osmBuildingsTileset.show = false;
        this.viewer.scene.primitives.add(this.google3DTileset);
        this.google3DTileset.show = true;
        this.active3DTileset = this.google3DTileset;
      } catch (err) {
        alert('Could not load Google Photorealistic 3D Tiles. Check if Cesium ion token has asset ID 2275207 enabled.');
      }
    } else if (type === 'osm') {
      if (this.google3DTileset) this.google3DTileset.show = false;
      if (this.osmBuildingsTileset) {
        this.osmBuildingsTileset.show = true;
        this.active3DTileset = this.osmBuildingsTileset;
      }
    } else if (type === 'flat') {
      if (this.google3DTileset) this.google3DTileset.show = false;
      if (this.osmBuildingsTileset) this.osmBuildingsTileset.show = false;
    }
  }

  switchImagery(imageryKey) {
    const layers = this.viewer.imageryLayers;
    layers.removeAll();

    if (imageryKey === 'esri_satellite') {
      layers.addImageryProvider(new Cesium.ArcGisMapServerImageryProvider({
        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
      }));
    } else if (imageryKey === 'carto_dark') {
      layers.addImageryProvider(new Cesium.UrlTemplateImageryProvider({
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        subdomains: ['a', 'b', 'c', 'd']
      }));
    } else if (imageryKey === 'osm_standard') {
      layers.addImageryProvider(new Cesium.OpenStreetMapImageryProvider({
        url: 'https://tile.openstreetmap.org/'
      }));
    } else if (imageryKey === 'esri_topo') {
      layers.addImageryProvider(new Cesium.ArcGisMapServerImageryProvider({
        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer'
      }));
    } else {
      try {
        layers.addImageryProvider(Cesium.createWorldImageryAsync());
      } catch {
        layers.addImageryProvider(new Cesium.OpenStreetMapImageryProvider({ url: 'https://tile.openstreetmap.org/' }));
      }
    }
  }

  /* CLIMATE VISUALIZER */
  toggleSeaLevelLayer(enabled) {
    this.climateLayers.seaLevel = enabled;
    this.updateSeaLevelSimulation();
  }

  updateSeaLevelSimulation() {
    this.seaLevelEntities.forEach(ent => this.viewer.entities.remove(ent));
    this.seaLevelEntities = [];

    if (!this.climateLayers.seaLevel) return;

    const meters = this.climateLayers.seaLevelMeters;

    CLIMATE_DATA.seaLevelHotspots.forEach(spot => {
      const floodExtrusion = Math.max(0, meters - spot.baseElev);
      if (floodExtrusion >= 0) {
        const floodEntity = this.viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(spot.lon, spot.lat, Math.max(0, spot.baseElev + floodExtrusion)),
          ellipse: {
            semiMinorAxis: 15000.0,
            semiMajorAxis: 20000.0,
            height: 0,
            extrudedHeight: spot.baseElev + floodExtrusion,
            material: Cesium.Color.fromCssColorString('rgba(0, 150, 255, 0.5)'),
            outline: true,
            outlineColor: Cesium.Color.fromCssColorString('rgba(0, 230, 255, 0.9)'),
            outlineWidth: 2
          },
          label: {
            text: `⚠️ ${spot.name}\nSea Level +${meters}m Inundation`,
            font: '12px JetBrains Mono, sans-serif',
            fillColor: Cesium.Color.WHITE,
            showBackground: true,
            backgroundColor: Cesium.Color.fromCssColorString('rgba(0, 20, 40, 0.8)'),
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -30)
          }
        });
        this.seaLevelEntities.push(floodEntity);
      }
    });
  }

  toggleCO2Layer(enabled) {
    this.climateLayers.co2 = enabled;
    this.co2Entities.forEach(ent => this.viewer.entities.remove(ent));
    this.co2Entities = [];

    if (!enabled) return;

    CLIMATE_DATA.co2Hotspots.forEach(spot => {
      const cylinder = this.viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(spot.lon, spot.lat, spot.heightMeters / 2),
        cylinder: {
          length: spot.heightMeters,
          topRadius: 4000.0,
          bottomRadius: 6000.0,
          material: Cesium.Color.fromCssColorString('rgba(234, 67, 53, 0.65)'),
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString('#ea4335'),
          outlineWidth: 2
        },
        label: {
          text: `🔥 ${spot.name}\n${spot.emissions} Mt CO2e/yr\n(${spot.sector})`,
          font: '11px JetBrains Mono, sans-serif',
          fillColor: Cesium.Color.WHITE,
          showBackground: true,
          backgroundColor: Cesium.Color.fromCssColorString('rgba(40, 10, 10, 0.85)'),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -25)
        }
      });
      this.co2Entities.push(cylinder);
    });
  }

  toggleDeforestationLayer(enabled) {
    this.climateLayers.deforestation = enabled;
    this.deforestationEntities.forEach(ent => this.viewer.entities.remove(ent));
    this.deforestationEntities = [];

    if (!enabled) return;

    CLIMATE_DATA.deforestationZones.forEach(zone => {
      const entity = this.viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(zone.center[0], zone.center[1], 1500),
        ellipse: {
          semiMinorAxis: 250000.0,
          semiMajorAxis: 350000.0,
          material: Cesium.Color.fromCssColorString('rgba(251, 188, 5, 0.3)'),
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString('#fbbc05'),
          outlineWidth: 2
        },
        label: {
          text: `🌳 ${zone.name}\nLoss: ${zone.lossRate}\nDrivers: ${zone.mainDrivers}`,
          font: '11.5px JetBrains Mono, sans-serif',
          fillColor: Cesium.Color.WHITE,
          showBackground: true,
          backgroundColor: Cesium.Color.fromCssColorString('rgba(40, 30, 0, 0.85)'),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -30)
        }
      });
      this.deforestationEntities.push(entity);
    });
  }

  /* VOYAGER GUIDED TOURS */
  startTour(tourId) {
    const tour = TOURS.find(t => t.id === tourId);
    if (!tour) return;
    this.activeTour = tour;
    this.tourStopIndex = 0;
    this.flyToTourStop(0);
    this.renderTourCard();
  }

  flyToTourStop(index) {
    if (!this.activeTour || index < 0 || index >= this.activeTour.stops.length) return;
    this.tourStopIndex = index;
    const stop = this.activeTour.stops[index];

    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(stop.coords.lon, stop.coords.lat, stop.coords.height),
      orientation: {
        heading: Cesium.Math.toRadians(stop.coords.heading),
        pitch: Cesium.Math.toRadians(stop.coords.pitch),
        roll: 0.0
      },
      duration: 3.0,
      easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT
    });

    this.renderTourCard();
  }

  renderTourCard() {
    const card = document.getElementById('tourCard');
    if (!this.activeTour) {
      card.style.display = 'none';
      return;
    }

    const stop = this.activeTour.stops[this.tourStopIndex];
    document.getElementById('tourCategoryTag').textContent = this.activeTour.category;
    document.getElementById('tourStopTitle').textContent = stop.name;
    document.getElementById('tourStopLocation').textContent = stop.location;
    document.getElementById('tourStopDesc').textContent = stop.description;

    const factsContainer = document.getElementById('tourFactsList');
    factsContainer.innerHTML = stop.facts.map(f => `<div class="tour-fact-item">${f}</div>`).join('');

    document.getElementById('tourProgressText').textContent = `${this.tourStopIndex + 1} of ${this.activeTour.stops.length}`;
    card.style.display = 'block';
    this.refreshIcons();
  }

  toggleTourOrbit() {
    this.isOrbiting = !this.isOrbiting;
    const orbitBtn = document.getElementById('tourOrbitBtn');
    if (orbitBtn) orbitBtn.classList.toggle('active', this.isOrbiting);

    if (this.isOrbiting) {
      this.orbitInterval = setInterval(() => {
        this.viewer.camera.rotate(Cesium.Cartesian3.UNIT_Z, 0.003);
      }, 30);
    } else {
      if (this.orbitInterval) {
        clearInterval(this.orbitInterval);
        this.orbitInterval = null;
      }
    }
  }

  /* "I'M FEELING LUCKY" */
  triggerFeelingLucky() {
    const randomLoc = LUCKY_LOCATIONS[Math.floor(Math.random() * LUCKY_LOCATIONS.length)];
    
    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(randomLoc.lon, randomLoc.lat, randomLoc.height),
      orientation: {
        heading: Cesium.Math.toRadians(randomLoc.heading),
        pitch: Cesium.Math.toRadians(randomLoc.pitch),
        roll: 0.0
      },
      duration: 3.5,
      easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT
    });

    this.activeTour = {
      category: 'Feeling Lucky',
      stops: [{
        name: randomLoc.name,
        location: randomLoc.country,
        description: randomLoc.fact,
        facts: [`Coordinates: ${randomLoc.lat.toFixed(4)}°, ${randomLoc.lon.toFixed(4)}°`, `Altitude: ${randomLoc.height}m`]
      }]
    };
    this.tourStopIndex = 0;
    this.renderTourCard();
  }

  /* FLY TO COORDINATES / PRESETS */
  flyToPreset(key) {
    const presets = {
      tokyo: { lon: 139.6917, lat: 35.6895, height: 750, heading: 25, pitch: -28 },
      manhattan: { lon: -74.0060, lat: 40.7128, height: 600, heading: 35, pitch: -22 },
      centralpark: { lon: -73.9665, lat: 40.7812, height: 1400, heading: 25, pitch: -30 },
      everest: { lon: 86.9250, lat: 27.9881, height: 10500, heading: 210, pitch: -25 },
      dubai: { lon: 55.2744, lat: 25.1972, height: 950, heading: 140, pitch: -20 },
      gangotri: { lon: 79.0669, lat: 30.9256, height: 5500, heading: 135, pitch: -30 },
      amazon: { lon: -62.8278, lat: -10.3833, height: 28000, heading: 0, pitch: -55 }
    };

    const target = presets[key];
    if (!target) return;

    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(target.lon, target.lat, target.height),
      orientation: {
        heading: Cesium.Math.toRadians(target.heading),
        pitch: Cesium.Math.toRadians(target.pitch),
        roll: 0.0
      },
      duration: 2.8,
      easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT
    });
  }

  /* GEOCODING SEARCH */
  async handleSearch(query) {
    if (!query || query.trim().length === 0) return;
    const clean = query.trim();

    const coordMatch = clean.match(/^([-+]?\d+(\.\d+)?)[,\s]+([-+]?\d+(\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lon = parseFloat(coordMatch[3]);
      if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        this.viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(lon, lat, 2500),
          orientation: { heading: 0, pitch: Cesium.Math.toRadians(-45), roll: 0 },
          duration: 2.5
        });
        return;
      }
    }

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(clean)}&limit=5`);
      const results = await res.json();
      this.renderSearchResults(results);
    } catch (e) {
      console.warn('Geocoding error:', e);
    }
  }

  renderSearchResults(results) {
    const dropdown = document.getElementById('searchResults');
    if (!dropdown) return;

    if (!results || results.length === 0) {
      dropdown.innerHTML = `<div class="search-result-item"><span class="search-result-title">No locations found</span></div>`;
      dropdown.style.display = 'block';
      return;
    }

    dropdown.innerHTML = results.map((r, idx) => `
      <div class="search-result-item" data-idx="${idx}">
        <i data-lucide="map-pin" class="search-result-icon"></i>
        <div>
          <div class="search-result-title">${r.name || r.display_name.split(',')[0]}</div>
          <div class="search-result-sub">${r.display_name}</div>
        </div>
      </div>
    `).join('');

    dropdown.style.display = 'block';
    this.refreshIcons();

    dropdown.querySelectorAll('.search-result-item').forEach((el) => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.getAttribute('data-idx'), 10);
        const item = results[idx];
        if (item) {
          const lat = parseFloat(item.lat);
          const lon = parseFloat(item.lon);
          this.viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(lon, lat, 3000),
            orientation: {
              heading: 0,
              pitch: Cesium.Math.toRadians(-40),
              roll: 0
            },
            duration: 2.5
          });
          dropdown.style.display = 'none';
        }
      });
    });
  }

  /* PLACEMARKS / PROJECTS */
  startAddPlacemark() {
    this.addingPin = true;
    alert('Click anywhere on the 3D globe to place your pin!');

    const handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    handler.setInputAction((click) => {
      const ray = this.viewer.camera.getPickRay(click.position);
      const cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
      if (cartesian) {
        this.pendingPinCartesian = cartesian;
        const carto = Cesium.Cartographic.fromCartesian(cartesian);
        const lat = Cesium.Math.toDegrees(carto.latitude).toFixed(4);
        const lon = Cesium.Math.toDegrees(carto.longitude).toFixed(4);

        document.getElementById('pinCoordsPreview').textContent = `Coordinates: Lat ${lat}°, Lon ${lon}°`;
        document.getElementById('placemarkModal').style.display = 'flex';
      }
      handler.destroy();
      this.addingPin = false;
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  savePlacemark() {
    const title = document.getElementById('pinTitleInput').value.trim() || 'Custom Placemark';
    const notes = document.getElementById('pinNotesInput').value.trim();
    const color = document.querySelector('input[name="pinColor"]:checked')?.value || '#ea4335';

    if (!this.pendingPinCartesian) return;

    const carto = Cesium.Cartographic.fromCartesian(this.pendingPinCartesian);
    const lon = Cesium.Math.toDegrees(carto.longitude);
    const lat = Cesium.Math.toDegrees(carto.latitude);
    const height = carto.height;

    const pinData = {
      id: Date.now(),
      title,
      notes,
      color,
      lon,
      lat,
      height
    };

    this.placemarks.push(pinData);
    localStorage.setItem('terrascope_placemarks', JSON.stringify(this.placemarks));
    this.addPlacemarkEntity(pinData);

    document.getElementById('placemarkModal').style.display = 'none';
    document.getElementById('pinTitleInput').value = '';
    document.getElementById('pinNotesInput').value = '';

    if (this.activePanel === 'placemarks') {
      this.renderDrawerContent('placemarks');
    }
  }

  loadPlacemarksFromStorage() {
    this.placemarks.forEach(p => this.addPlacemarkEntity(p));
  }

  addPlacemarkEntity(p) {
    this.viewer.entities.add({
      id: `pin_${p.id}`,
      position: Cesium.Cartesian3.fromDegrees(p.lon, p.lat, p.height || 0),
      point: {
        pixelSize: 12,
        color: Cesium.Color.fromCssColorString(p.color),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      },
      label: {
        text: p.title,
        font: '12px Plus Jakarta Sans, sans-serif',
        fillColor: Cesium.Color.WHITE,
        showBackground: true,
        backgroundColor: Cesium.Color.fromCssColorString('rgba(20, 24, 30, 0.85)'),
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -16)
      }
    });
  }

  deletePlacemark(id) {
    this.placemarks = this.placemarks.filter(p => p.id !== id);
    localStorage.setItem('terrascope_placemarks', JSON.stringify(this.placemarks));
    this.viewer.entities.removeById(`pin_${id}`);
    if (this.activePanel === 'placemarks') {
      this.renderDrawerContent('placemarks');
    }
  }

  /* TELEMETRY HUD & COMPASS */
  initTelemetry() {
    const hudCoords = document.getElementById('hudCoords');
    const hudElev = document.getElementById('hudElev');
    const hudCameraAlt = document.getElementById('hudCameraAlt');
    const hudHeadingPitch = document.getElementById('hudHeadingPitch');
    const compassDial = document.getElementById('compassDial');

    const handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);

    handler.setInputAction((movement) => {
      const ray = this.viewer.camera.getPickRay(movement.endPosition);
      const cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
      if (cartesian) {
        const carto = Cesium.Cartographic.fromCartesian(cartesian);
        const lat = Cesium.Math.toDegrees(carto.latitude);
        const lon = Cesium.Math.toDegrees(carto.longitude);
        const elev = Math.round(carto.height);

        const latStr = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}`;
        const lonStr = `${Math.abs(lon).toFixed(4)}° ${lon >= 0 ? 'E' : 'W'}`;

        hudCoords.textContent = `Lat: ${latStr}  Lon: ${lonStr}`;
        hudElev.textContent = `${elev >= 0 ? elev : 0} m`;
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    this.viewer.camera.changed.addEventListener(() => {
      const cameraCarto = this.viewer.camera.positionCartographic;
      const heightKm = cameraCarto.height / 1000;
      hudCameraAlt.textContent = heightKm >= 10 ? `${Math.round(heightKm).toLocaleString()} km` : `${Math.round(cameraCarto.height).toLocaleString()} m`;

      const headingDeg = Math.round(Cesium.Math.toDegrees(this.viewer.camera.heading));
      const pitchDeg = Math.round(Cesium.Math.toDegrees(this.viewer.camera.pitch));
      hudHeadingPitch.textContent = `H: ${headingDeg}°  P: ${pitchDeg}°`;

      if (compassDial) {
        compassDial.style.transform = `rotate(${-headingDeg}deg)`;
      }
    });

    const quickTimeSlider = document.getElementById('quickTimeSlider');
    const quickTimeDisplay = document.getElementById('quickTimeDisplay');
    if (quickTimeSlider) {
      quickTimeSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        const hrs = Math.floor(val);
        const mins = Math.floor((val - hrs) * 60);
        const timeStr = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        quickTimeDisplay.textContent = timeStr;

        const date = new Date();
        date.setUTCHours(hrs, mins, 0, 0);
        this.viewer.clock.currentTime = Cesium.JulianDate.fromDate(date);
      });
    }
  }

  /* ON-SCREEN GOOGLE EARTH CAMERA CONTROLS */
  initCameraControls() {
    document.getElementById('compassBtn')?.addEventListener('click', () => {
      const camera = this.viewer.camera;
      camera.flyTo({
        destination: camera.position,
        orientation: {
          heading: 0.0,
          pitch: camera.pitch,
          roll: 0.0
        },
        duration: 1.0
      });
    });

    document.getElementById('toggle3DBtn')?.addEventListener('click', () => {
      this.currentMode3D = !this.currentMode3D;
      const btn = document.getElementById('toggle3DBtn');
      if (btn) btn.querySelector('.btn-text-bold').textContent = this.currentMode3D ? '3D' : '2D';

      const camera = this.viewer.camera;
      const targetPitch = this.currentMode3D ? Cesium.Math.toRadians(-45) : Cesium.Math.toRadians(-90);
      camera.flyTo({
        destination: camera.position,
        orientation: {
          heading: camera.heading,
          pitch: targetPitch,
          roll: 0.0
        },
        duration: 1.2
      });
    });

    document.getElementById('groundViewBtn')?.addEventListener('click', () => {
      const cameraCarto = this.viewer.camera.positionCartographic;
      const groundAlt = 50;
      this.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromRadians(cameraCarto.longitude, cameraCarto.latitude, groundAlt),
        orientation: {
          heading: this.viewer.camera.heading,
          pitch: Cesium.Math.toRadians(-5),
          roll: 0.0
        },
        duration: 2.0
      });
    });

    document.getElementById('zoomInBtn')?.addEventListener('click', () => {
      this.viewer.camera.zoomIn(this.viewer.camera.positionCartographic.height * 0.35);
    });

    document.getElementById('zoomOutBtn')?.addEventListener('click', () => {
      this.viewer.camera.zoomOut(this.viewer.camera.positionCartographic.height * 0.45);
    });

    document.getElementById('myLocationBtn')?.addEventListener('click', () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition((pos) => {
          this.viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(pos.coords.longitude, pos.coords.latitude, 3500),
            orientation: { heading: 0, pitch: Cesium.Math.toRadians(-45), roll: 0 },
            duration: 2.5
          });
        }, (err) => {
          alert('Could not retrieve GPS location: ' + err.message);
        });
      }
    });

    document.getElementById('fullscreenBtn')?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    });
  }

  /* DRAWER PANELS & UI INTERACTION */
  initUI() {
    this.initCameraControls();

    const searchInput = document.getElementById('searchInput');
    const searchClearBtn = document.getElementById('searchClearBtn');

    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      searchClearBtn.style.display = val.length > 0 ? 'flex' : 'none';
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        this.handleSearch(val);
      }, 400);
    });

    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchClearBtn.style.display = 'none';
      document.getElementById('searchResults').style.display = 'none';
    });

    // Quick chips
    document.querySelectorAll('.chip[data-flyto]').forEach(chip => {
      chip.addEventListener('click', () => {
        const key = chip.getAttribute('data-flyto');
        this.flyToPreset(key);
      });
    });

    // Quick Disaster Alert chip in header
    document.getElementById('quickDisasterChip')?.addEventListener('click', () => {
      this.toggleDrawer('disasters');
    });

    // Left Icon Rail buttons
    document.querySelectorAll('.rail-btn[data-panel]').forEach(btn => {
      btn.addEventListener('click', () => {
        const panel = btn.getAttribute('data-panel');
        if (panel === 'none') {
          this.closeDrawer();
          return;
        }
        this.toggleDrawer(panel);
      });
    });

    // "Feeling Lucky" Dice Button
    document.getElementById('luckyBtn')?.addEventListener('click', () => {
      this.triggerFeelingLucky();
    });

    // Close Drawer Button
    document.getElementById('closeDrawerBtn')?.addEventListener('click', () => {
      this.closeDrawer();
    });

    // Master Toggle Disaster Markers On/Off
    document.getElementById('toggleDisasterMarkersBtn')?.addEventListener('click', () => {
      if (!this.disasterFeedManager) return;
      const next = !this.disasterFeedManager.markersVisible;
      this.disasterFeedManager.setMarkersVisible(next);
      const btn = document.getElementById('toggleDisasterMarkersBtn');
      if (btn) {
        btn.classList.toggle('active', next);
        btn.innerHTML = `<i data-lucide="${next ? 'bell' : 'bell-off'}"></i>`;
        this.refreshIcons();
      }
    });

    // Disaster Card controls
    document.getElementById('closeDisasterCard')?.addEventListener('click', () => {
      document.getElementById('disasterCard').style.display = 'none';
      if (this.disasterOrbitInterval) {
        clearInterval(this.disasterOrbitInterval);
        this.disasterOrbitInterval = null;
      }
      // Clear site isolation so other markers can be seen
      if (this.disasterFeedManager) {
        this.disasterFeedManager.clearSiteIsolation();
      }
    });

    document.getElementById('disasterOrbitBtn')?.addEventListener('click', () => {
      this.toggleDisasterOrbit();
    });

    // Open Windy live radar from disaster card
    document.getElementById('disasterWindyBtn')?.addEventListener('click', () => {
      if (this.activeDisaster) {
        const overlay = DISASTER_TYPES[this.activeDisaster.type]?.windyOverlay || 'wind';
        this.openWindyModal(this.activeDisaster.lat, this.activeDisaster.lon, this.activeDisaster.place, overlay);
      }
    });

    // Isolate site view toggle
    document.getElementById('disasterIsolateBtn')?.addEventListener('click', () => {
      const btn = document.getElementById('disasterIsolateBtn');
      if (!this.disasterFeedManager) return;

      if (this.disasterFeedManager.isolatedEventId) {
        this.disasterFeedManager.clearSiteIsolation();
        if (btn) btn.innerHTML = `<i data-lucide="focus"></i> Focus Site`;
      } else if (this.activeDisaster) {
        this.disasterFeedManager.isolatedEventId = this.activeDisaster.id;
        this.disasterFeedManager.renderGlobeEntities();
        if (btn) btn.innerHTML = `<i data-lucide="globe"></i> Show All`;
      }
      this.refreshIcons();
    });

    // Windy modal controls
    document.getElementById('closeWindyModal')?.addEventListener('click', () => {
      this.closeWindyModal();
    });

    document.querySelectorAll('.wtab-btn[data-woverlay]').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.wtab-btn').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const overlay = tab.getAttribute('data-woverlay');
        this.currentWindyOverlay = overlay;
        const { lat, lon } = this.currentWindyLocation;
        const iframe = document.getElementById('windyIframe');
        if (iframe) {
          iframe.src = LiveDisasterFeedManager.getWindyEmbedUrl(lat, lon, overlay, 5);
        }
      });
    });

    // Tour Card controls
    document.getElementById('closeTourBtn')?.addEventListener('click', () => {
      this.activeTour = null;
      document.getElementById('tourCard').style.display = 'none';
    });

    document.getElementById('tourPrevBtn')?.addEventListener('click', () => {
      if (this.activeTour && this.tourStopIndex > 0) {
        this.flyToTourStop(this.tourStopIndex - 1);
      }
    });

    document.getElementById('tourNextBtn')?.addEventListener('click', () => {
      if (this.activeTour && this.tourStopIndex < this.activeTour.stops.length - 1) {
        this.flyToTourStop(this.tourStopIndex + 1);
      }
    });

    document.getElementById('tourOrbitBtn')?.addEventListener('click', () => {
      this.toggleTourOrbit();
    });

    // Placemark modal buttons
    document.getElementById('closePlacemarkModal')?.addEventListener('click', () => {
      document.getElementById('placemarkModal').style.display = 'none';
    });
    document.getElementById('cancelPinBtn')?.addEventListener('click', () => {
      document.getElementById('placemarkModal').style.display = 'none';
    });
    document.getElementById('savePinBtn')?.addEventListener('click', () => {
      this.savePlacemark();
    });

    // Cesium Ion Token Modal
    document.getElementById('ionTokenBadge')?.addEventListener('click', () => {
      this.openTokenModal();
    });
    document.getElementById('closeTokenModal')?.addEventListener('click', () => {
      document.getElementById('tokenModal').style.display = 'none';
    });
    document.getElementById('saveTokenBtn')?.addEventListener('click', () => {
      const token = document.getElementById('ionTokenInput').value.trim();
      if (token) {
        localStorage.setItem('terrascope_ion_token', token);
        Cesium.Ion.defaultAccessToken = token;
        this.updateTokenBadge(true);
        document.getElementById('tokenModal').style.display = 'none';
        location.reload();
      }
    });
    document.getElementById('resetDemoTokenBtn')?.addEventListener('click', () => {
      localStorage.removeItem('terrascope_ion_token');
      Cesium.Ion.defaultAccessToken = DEFAULT_ION_TOKEN;
      this.updateTokenBadge(false);
      document.getElementById('tokenModal').style.display = 'none';
      location.reload();
    });
  }

  openTokenModal() {
    const input = document.getElementById('ionTokenInput');
    const saved = localStorage.getItem('terrascope_ion_token') || '';
    input.value = saved;
    document.getElementById('tokenModal').style.display = 'flex';
  }

  toggleDrawer(panelKey) {
    if (this.activePanel === panelKey) {
      this.closeDrawer();
      return;
    }

    this.activePanel = panelKey;
    document.querySelectorAll('.rail-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-panel') === panelKey);
    });

    const drawer = document.getElementById('sideDrawer');
    drawer.style.display = 'flex';
    this.renderDrawerContent(panelKey);
  }

  closeDrawer() {
    this.activePanel = null;
    document.querySelectorAll('.rail-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.rail-btn[data-panel="none"]')?.classList.add('active');
    document.getElementById('sideDrawer').style.display = 'none';
    if (this.measurementController) {
      this.measurementController.clear();
    }
    if (this.vegetationEngine) {
      this.vegetationEngine.setBrushActive(false);
    }
  }

  renderDrawerContent(panelKey) {
    const title = document.getElementById('drawerTitle');
    const content = document.getElementById('drawerContent');

    if (panelKey === 'disasters') {
      title.innerHTML = `<i data-lucide="alert-triangle"></i> Natural Disasters & News`;
      const stats = this.disasterFeedManager ? this.disasterFeedManager.getStats() : { total: 0, quakes: 0, fires: 0, cyclones: 0 };
      const newsCount = this.disasterNewsEngine ? this.disasterNewsEngine.newsArticles.length : 8;

      const subTabsHtml = `
        <div class="disaster-segment-tabs">
          <button class="seg-btn ${this.disasterSubTab === 'events' ? 'active' : ''}" id="tabDisasterEvents">
            <i data-lucide="radio"></i> 3D Event Map (${stats.total})
          </button>
          <button class="seg-btn news-tab ${this.disasterSubTab === 'news' ? 'active' : ''}" id="tabDisasterNews">
            <i data-lucide="newspaper"></i> NASA, Windy & Zoom News (${newsCount})
          </button>
        </div>
      `;

      if (this.disasterSubTab === 'events') {
        content.innerHTML = `
          ${subTabsHtml}
          <div class="climate-banner" style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(245, 158, 11, 0.2)); border-color: rgba(239, 68, 68, 0.45);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span><strong style="color: #fca5a5;">LIVE DISASTER SATELLITE FEED</strong></span>
              <button class="btn btn-secondary" id="refreshDisastersBtn" style="padding: 3px 8px; font-size: 11px;">
                <i data-lucide="refresh-cw"></i> Refresh
              </button>
            </div>
            <div style="font-size: 11.5px; margin-top: 4px; color: #cbd5e1;">
              Aggregating real-time seismic data from <strong>USGS</strong>, thermal/atmospheric hazards from <strong>NASA EONET</strong>, and cyclone telemetry from <strong>Zoom Earth</strong>.
            </div>
            <div style="display: flex; gap: 8px; margin-top: 10px;">
              <button class="btn btn-windy" id="openGlobalWindyBtn" style="flex: 1; font-size: 11.5px; padding: 7px;">
                <i data-lucide="wind"></i> Windy Radar
              </button>
              <a href="https://zoom.earth/maps/satellite/#overlays=wind,radar" target="_blank" rel="noopener" class="btn btn-zoom-earth" style="flex: 1; font-size: 11.5px; padding: 7px; text-decoration: none; justify-content: center;">
                <i data-lucide="satellite"></i> Zoom Earth Satellite
              </a>
            </div>
          </div>

          <!-- Master Marker Visibility & Category Toggles -->
          <div class="section-title">Marker Visibility Controls</div>
          <div class="toggle-row" style="padding-top: 0;">
            <div class="toggle-info">
              <span class="toggle-title">Show 3D Markers on Globe</span>
              <span class="toggle-sub">Toggle all disaster pins on or off</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="masterDisasterMarkerToggle" ${this.disasterFeedManager?.markersVisible ? 'checked' : ''} />
              <span class="slider-round" style="background-color: ${this.disasterFeedManager?.markersVisible ? '#ef4444' : ''};"></span>
            </label>
          </div>

          <div class="disaster-toggle-grid">
            <label class="dtoggle-item">
              <input type="checkbox" data-toggletype="earthquake" ${this.disasterFeedManager?.typeVisibility.earthquake ? 'checked' : ''} />
              <span>⚡ Earthquakes</span>
            </label>
            <label class="dtoggle-item">
              <input type="checkbox" data-toggletype="wildfire" ${this.disasterFeedManager?.typeVisibility.wildfire ? 'checked' : ''} />
              <span>🔥 Wildfires</span>
            </label>
            <label class="dtoggle-item">
              <input type="checkbox" data-toggletype="cyclone" ${this.disasterFeedManager?.typeVisibility.cyclone ? 'checked' : ''} />
              <span>🌪️ Cyclones</span>
            </label>
            <label class="dtoggle-item">
              <input type="checkbox" data-toggletype="volcano" ${this.disasterFeedManager?.typeVisibility.volcano ? 'checked' : ''} />
              <span>🌋 Volcanoes</span>
            </label>
            <label class="dtoggle-item">
              <input type="checkbox" data-toggletype="flood" ${this.disasterFeedManager?.typeVisibility.flood ? 'checked' : ''} />
              <span>🌊 Floods</span>
            </label>
            <label class="dtoggle-item">
              <input type="checkbox" data-toggletype="storm" ${this.disasterFeedManager?.typeVisibility.storm ? 'checked' : ''} />
              <span>⛈️ Storms</span>
            </label>
          </div>

          <div class="disaster-summary-grid">
            <div class="dsummary-card">
              <div class="dsummary-val" id="dstatTotal" style="color: #fca5a5;">${stats.total}</div>
              <div class="dsummary-lbl">Active Events</div>
            </div>
            <div class="dsummary-card">
              <div class="dsummary-val" id="dstatQuakes" style="color: #fde047;">${stats.quakes}</div>
              <div class="dsummary-lbl">Earthquakes</div>
            </div>
            <div class="dsummary-card">
              <div class="dsummary-val" id="dstatFires" style="color: #f87171;">${stats.fires}</div>
              <div class="dsummary-lbl">Wildfires</div>
            </div>
            <div class="dsummary-card">
              <div class="dsummary-val" id="dstatCyclones" style="color: #c4b5fd;">${stats.cyclones}</div>
              <div class="dsummary-lbl">Storms</div>
            </div>
          </div>

          <div class="form-group">
            <input type="text" id="disasterSearchInput" placeholder="Filter by place, country, type (e.g. Japan, Hawaii)..." />
          </div>

          <div class="filter-pills-row" id="disasterFilterPills">
            <button class="filter-pill active" data-dfilter="all">All (${stats.total})</button>
            <button class="filter-pill" data-dfilter="earthquake">⚡ Earthquakes (${stats.quakes})</button>
            <button class="filter-pill" data-dfilter="wildfire">🔥 Wildfires (${stats.fires})</button>
            <button class="filter-pill" data-dfilter="cyclone">🌪️ Cyclones & Storms (${stats.cyclones})</button>
            <button class="filter-pill" data-dfilter="volcano">🌋 Volcanoes</button>
            <button class="filter-pill" data-dfilter="flood">🌊 Floods</button>
          </div>

          <div class="section-title">Global Event Stream</div>
          <div class="disaster-feed-list" id="disasterFeedList">
            <!-- Rendered dynamically -->
          </div>
        `;

        // Switch to news tab
        content.querySelector('#tabDisasterNews')?.addEventListener('click', () => {
          this.disasterSubTab = 'news';
          this.renderDrawerContent('disasters');
        });

        // Open Global Windy Cyclone Tracker
        content.querySelector('#openGlobalWindyBtn')?.addEventListener('click', () => {
          const cameraCarto = this.viewer.camera.positionCartographic;
          const lat = Cesium.Math.toDegrees(cameraCarto.latitude);
          const lon = Cesium.Math.toDegrees(cameraCarto.longitude);
          this.openWindyModal(lat, lon, 'Global Atmospheric Radar', 'wind');
        });

        // Master marker visibility switch
        content.querySelector('#masterDisasterMarkerToggle')?.addEventListener('change', (e) => {
          this.disasterFeedManager.setMarkersVisible(e.target.checked);
          const mapBtn = document.getElementById('toggleDisasterMarkersBtn');
          if (mapBtn) {
            mapBtn.classList.toggle('active', e.target.checked);
            mapBtn.innerHTML = `<i data-lucide="${e.target.checked ? 'bell' : 'bell-off'}"></i>`;
            this.refreshIcons();
          }
        });

        // Category visibility checkboxes
        content.querySelectorAll('[data-toggletype]').forEach(box => {
          box.addEventListener('change', () => {
            const type = box.getAttribute('data-toggletype');
            this.disasterFeedManager.toggleTypeVisibility(type, box.checked);
          });
        });

        // Refresh button
        content.querySelector('#refreshDisastersBtn')?.addEventListener('click', async () => {
          const btn = content.querySelector('#refreshDisastersBtn');
          if (btn) btn.innerHTML = `<i data-lucide="refresh-cw" class="spin"></i> Refreshing...`;
          await this.disasterFeedManager.fetchLiveFeed();
          this.renderDrawerContent('disasters');
        });

        // Search filter
        const searchInput = content.querySelector('#disasterSearchInput');
        searchInput?.addEventListener('input', (e) => {
          this.disasterFeedManager.setSearchQuery(e.target.value);
        });

        // Filter pills
        content.querySelectorAll('[data-dfilter]').forEach(pill => {
          pill.addEventListener('click', () => {
            content.querySelectorAll('[data-dfilter]').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            const filter = pill.getAttribute('data-dfilter');
            this.disasterFeedManager.setFilter(filter);
          });
        });

        // Render initial event list
        this.updateDisasterFeedUI(this.disasterFeedManager.getFilteredEvents(), stats);

      } else {
        // NEWS & BRIEFINGS SUB-TAB (NASA, WINDY & ZOOM EARTH)
        content.innerHTML = `
          ${subTabsHtml}
          <div class="climate-banner" style="background: linear-gradient(135deg, rgba(2, 132, 199, 0.25), rgba(16, 185, 129, 0.2)); border-color: rgba(56, 189, 248, 0.45);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span><strong style="color: #7dd3fc;">GLOBAL HAZARDS NEWSROOM</strong></span>
              <button class="btn btn-secondary" id="refreshNewsBtn" style="padding: 3px 8px; font-size: 11px;">
                <i data-lucide="refresh-cw"></i> Refresh
              </button>
            </div>
            <div style="font-size: 11.5px; margin-top: 4px; color: #cbd5e1;">
              Live natural hazard scientific analysis from <strong>NASA Earth Observatory</strong>, meteorological bulletins from <strong>Windy.com</strong>, and real-time cyclone satellite tracking from <strong>Zoom Earth</strong>.
            </div>
          </div>

          <div class="news-source-filter-row">
            <button class="source-filter-btn ${this.disasterNewsEngine?.activeSourceFilter === 'all' ? 'active' : ''}" data-nsource="all">
              All (${this.disasterNewsEngine?.newsArticles.length || 0})
            </button>
            <button class="source-filter-btn ${this.disasterNewsEngine?.activeSourceFilter === 'nasa' ? 'active-nasa' : ''}" data-nsource="nasa">
              🛰️ NASA Earth
            </button>
            <button class="source-filter-btn ${this.disasterNewsEngine?.activeSourceFilter === 'windy' ? 'active-windy' : ''}" data-nsource="windy">
              🌀 Windy
            </button>
            <button class="source-filter-btn ${this.disasterNewsEngine?.activeSourceFilter === 'zoom-earth' ? 'active-zoom' : ''}" data-nsource="zoom-earth">
              🌍 Zoom Earth
            </button>
          </div>

          <div class="form-group">
            <input type="text" id="newsSearchInput" placeholder="Filter news by region, cyclone name, plume..." />
          </div>

          <div class="filter-pills-row">
            <button class="filter-pill ${this.disasterNewsEngine?.activeCategoryFilter === 'all' ? 'active' : ''}" data-ncat="all">All</button>
            <button class="filter-pill ${this.disasterNewsEngine?.activeCategoryFilter === 'wildfire' ? 'active' : ''}" data-ncat="wildfire">🔥 Wildfires</button>
            <button class="filter-pill ${this.disasterNewsEngine?.activeCategoryFilter === 'cyclone' ? 'active' : ''}" data-ncat="cyclone">🌪️ Cyclones</button>
            <button class="filter-pill ${this.disasterNewsEngine?.activeCategoryFilter === 'volcano' ? 'active' : ''}" data-ncat="volcano">🌋 Volcanoes</button>
            <button class="filter-pill ${this.disasterNewsEngine?.activeCategoryFilter === 'flood' ? 'active' : ''}" data-ncat="flood">🌊 Floods</button>
            <button class="filter-pill ${this.disasterNewsEngine?.activeCategoryFilter === 'ice' ? 'active' : ''}" data-ncat="ice">❄️ Ice/Glaciers</button>
          </div>

          <div class="section-title">Latest Bulletins & Dispatches</div>
          <div class="news-feed-list" id="disasterNewsList">
            <!-- Rendered dynamically -->
          </div>
        `;

        // Switch to events tab
        content.querySelector('#tabDisasterEvents')?.addEventListener('click', () => {
          this.disasterSubTab = 'events';
          this.renderDrawerContent('disasters');
        });

        // Source filter buttons
        content.querySelectorAll('[data-nsource]').forEach(btn => {
          btn.addEventListener('click', () => {
            const src = btn.getAttribute('data-nsource');
            this.disasterNewsEngine.setSourceFilter(src);
            this.renderDrawerContent('disasters');
          });
        });

        // Category filter pills
        content.querySelectorAll('[data-ncat]').forEach(pill => {
          pill.addEventListener('click', () => {
            const cat = pill.getAttribute('data-ncat');
            this.disasterNewsEngine.setCategoryFilter(cat);
            this.renderDrawerContent('disasters');
          });
        });

        // Search input
        const newsSearchInput = content.querySelector('#newsSearchInput');
        newsSearchInput?.addEventListener('input', (e) => {
          this.disasterNewsEngine.setSearchQuery(e.target.value);
        });

        // Refresh news button
        content.querySelector('#refreshNewsBtn')?.addEventListener('click', async () => {
          const btn = content.querySelector('#refreshNewsBtn');
          if (btn) btn.innerHTML = `<i data-lucide="refresh-cw" class="spin"></i> Refreshing...`;
          await this.disasterNewsEngine.fetchLiveNews();
          this.renderDrawerContent('disasters');
        });

        // Render initial news list
        this.updateDisasterNewsUI(this.disasterNewsEngine.getFilteredNews());
      }
    } else if (panelKey === 'vegetation') {
      title.innerHTML = `<i data-lucide="trees"></i> Vegetation & Green Belts`;
      content.innerHTML = `
        <div class="climate-banner" style="background: linear-gradient(135deg, rgba(20, 83, 45, 0.35), rgba(66, 133, 244, 0.2)); border-color: rgba(74, 222, 128, 0.4);">
          🌲 <strong>Green Area Scatter Engine:</strong> Procedurally plant thousands of 3D trees clamped to real-world terrain and urban parks to model afforestation and carbon sequestration.
        </div>

        <div class="veg-stats-card">
          <div class="section-title" style="margin-bottom: 0; color: #86efac;">Reforestation Impact</div>
          <div class="veg-stats-grid">
            <div class="veg-stat-box">
              <div class="veg-stat-val" id="vegTreeCount">${this.vegetationEngine ? this.vegetationEngine.treeCount.toLocaleString() : '0'}</div>
              <div class="veg-stat-lbl">Trees</div>
            </div>
            <div class="veg-stat-box">
              <div class="veg-stat-val" id="vegCo2Count">${this.vegetationEngine ? (this.vegetationEngine.treeCount * 0.022).toFixed(1) : '0.0'} t</div>
              <div class="veg-stat-lbl">CO₂ / Year</div>
            </div>
            <div class="veg-stat-box">
              <div class="veg-stat-val" id="vegAreaCount">${this.vegetationEngine ? ((this.vegetationEngine.treeCount * 25) / 1000000).toFixed(3) : '0.000'} km²</div>
              <div class="veg-stat-lbl">Canopy</div>
            </div>
          </div>
        </div>

        <div class="section-title" style="margin-top: 14px;">Tree Species</div>
        <div class="layer-grid">
          <div class="layer-card ${this.activeTreeType === 'oak' ? 'active' : ''}" data-tree="oak">
            <i data-lucide="tree-deciduous"></i>
            <span>Temperate Oak</span>
          </div>
          <div class="layer-card ${this.activeTreeType === 'pine' ? 'active' : ''}" data-tree="pine">
            <i data-lucide="tree-pine"></i>
            <span>Alpine Pine</span>
          </div>
          <div class="layer-card ${this.activeTreeType === 'palm' ? 'active' : ''}" data-tree="palm">
            <i data-lucide="sun"></i>
            <span>Tropical Palm</span>
          </div>
          <div class="layer-card ${this.activeTreeType === 'rainforest' ? 'active' : ''}" data-tree="rainforest">
            <i data-lucide="sprout"></i>
            <span>Dense Canopy</span>
          </div>
        </div>

        <div class="section-title" style="margin-top: 14px;">Scatter in Current View</div>
        <div class="climate-slider-container">
          <div class="climate-slider-header">
            <span>Density</span>
            <span class="climate-level-value" id="vegDensityDisplay">600 trees</span>
          </div>
          <input type="range" class="range-input" id="vegDensitySlider" min="100" max="2500" step="50" value="600" />
          <button class="btn btn-primary" id="scatterViewBtn" style="margin-top: 6px; width: 100%;">
            <i data-lucide="sprout"></i> Auto-Scatter on Green Areas in View
          </button>
        </div>

        <div class="section-title" style="margin-top: 14px;">Interactive Tree Planting Brush</div>
        <button class="brush-toggle-btn ${this.vegetationEngine?.isBrushActive ? 'active' : ''}" id="vegBrushBtn">
          <i data-lucide="sparkles"></i> <span>Click on Green Area to Plant Trees</span>
        </button>

        <div class="section-title" style="margin-top: 14px;">Famous Parks & Green Belts</div>
        <div class="hotspot-chip-list">
          ${FAMOUS_GREEN_ZONES.map(z => `
            <button class="hotspot-chip" data-park-zone="${z.name}">🌳 ${z.name}</button>
          `).join('')}
        </div>

        <div style="margin-top: 16px;">
          <button class="btn btn-secondary" id="clearVegBtn" style="width: 100%; color: var(--google-red);">
            <i data-lucide="trash-2"></i> Clear All Trees
          </button>
        </div>
      `;

      content.querySelectorAll('[data-tree]').forEach(card => {
        card.addEventListener('click', () => {
          content.querySelectorAll('[data-tree]').forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          this.activeTreeType = card.getAttribute('data-tree');
          if (this.vegetationEngine && this.vegetationEngine.isBrushActive) {
            this.vegetationEngine.activeType = this.activeTreeType;
          }
        });
      });

      const densitySlider = content.querySelector('#vegDensitySlider');
      const densityDisplay = content.querySelector('#vegDensityDisplay');
      densitySlider?.addEventListener('input', (e) => {
        densityDisplay.textContent = `${e.target.value} trees`;
      });

      content.querySelector('#scatterViewBtn')?.addEventListener('click', () => {
        const count = parseInt(densitySlider.value, 10);
        const result = this.vegetationEngine.scatterInCurrentView(this.activeTreeType, count);
        alert(`Seeded ${result.count} 3D trees across ${result.zone}!`);
      });

      const brushBtn = content.querySelector('#vegBrushBtn');
      brushBtn?.addEventListener('click', () => {
        const newActive = !this.vegetationEngine.isBrushActive;
        this.vegetationEngine.setBrushActive(newActive, this.activeTreeType);
        brushBtn.classList.toggle('active', newActive);
        if (newActive) {
          brushBtn.querySelector('span').textContent = 'Brush Active: Click on Map!';
        } else {
          brushBtn.querySelector('span').textContent = 'Click on Green Area to Plant Trees';
        }
      });

      content.querySelectorAll('[data-park-zone]').forEach(btn => {
        btn.addEventListener('click', () => {
          const zoneName = btn.getAttribute('data-park-zone');
          const zone = FAMOUS_GREEN_ZONES.find(z => z.name === zoneName);
          if (zone) {
            const centerLon = (zone.bounds.minLon + zone.bounds.maxLon) / 2;
            const centerLat = (zone.bounds.minLat + zone.bounds.maxLat) / 2;
            this.viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 1500),
              orientation: { heading: 0, pitch: Cesium.Math.toRadians(-35), roll: 0 },
              duration: 2.2,
              complete: () => {
                this.vegetationEngine.scatterInBounds(zone.bounds, zone.defaultDensity, zone.type);
              }
            });
          }
        });
      });

      content.querySelector('#clearVegBtn')?.addEventListener('click', () => {
        this.vegetationEngine.clear();
        const brush = content.querySelector('#vegBrushBtn');
        if (brush) {
          brush.classList.remove('active');
          brush.querySelector('span').textContent = 'Click on Green Area to Plant Trees';
        }
      });
    } else if (panelKey === 'search') {
      title.innerHTML = `<i data-lucide="search"></i> Search Places`;
      content.innerHTML = `
        <div class="form-group">
          <label>Global Geocoding & Landmarks</label>
          <input type="text" id="drawerSearchInput" placeholder="Search cities, mountains, heritage..." />
        </div>
        <div class="section-title">Popular Destinations</div>
        <div class="hotspot-chip-list">
          <button class="hotspot-chip" data-goto="tokyo">Tokyo, Japan</button>
          <button class="hotspot-chip" data-goto="manhattan">New York, USA</button>
          <button class="hotspot-chip" data-goto="everest">Mount Everest</button>
          <button class="hotspot-chip" data-goto="dubai">Dubai, UAE</button>
          <button class="hotspot-chip" data-goto="gangotri">Gangotri Glacier</button>
          <button class="hotspot-chip" data-goto="amazon">Amazon Basin</button>
        </div>
      `;
      content.querySelectorAll('[data-goto]').forEach(btn => {
        btn.addEventListener('click', () => this.flyToPreset(btn.getAttribute('data-goto')));
      });
      content.querySelector('#drawerSearchInput')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.handleSearch(e.target.value);
      });
    } else if (panelKey === 'voyager') {
      title.innerHTML = `<i data-lucide="compass"></i> Voyager Stories`;
      content.innerHTML = `
        <div class="section-title">Curated Interactive Tours</div>
        <div class="tour-list">
          ${TOURS.map(t => `
            <div class="tour-card-item" data-tour-id="${t.id}" style="background-image: url('${t.thumbnail}');">
              <div class="tour-card-overlay">
                <span class="tour-card-category">${t.category}</span>
                <div>
                  <div class="tour-card-title">${t.title}</div>
                  <div class="tour-card-stops">${t.stops.length} stops • 3D Guided Flight</div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
      content.querySelectorAll('.tour-card-item').forEach(card => {
        card.addEventListener('click', () => {
          const id = card.getAttribute('data-tour-id');
          this.startTour(id);
          this.closeDrawer();
        });
      });
    } else if (panelKey === 'layers') {
      title.innerHTML = `<i data-lucide="layers"></i> Map Layers & 3D Styles`;
      content.innerHTML = `
        <div class="section-title">3D Mesh & Buildings</div>
        <div class="layer-grid">
          <div class="layer-card ${this.active3DTileset === this.osmBuildingsTileset ? 'active' : ''}" data-tiles="osm">
            <i data-lucide="building-2"></i>
            <span>Cesium OSM 3D</span>
          </div>
          <div class="layer-card ${this.active3DTileset === this.google3DTileset ? 'active' : ''}" data-tiles="google">
            <i data-lucide="globe"></i>
            <span>Google 3D Tiles</span>
          </div>
        </div>

        <div class="section-title" style="margin-top: 14px;">Building Shading Theme</div>
        <div class="layer-grid">
          <div class="layer-card ${this.currentBuildingStyle === 'realistic' ? 'active' : ''}" data-style="realistic">
            <i data-lucide="sun"></i>
            <span>Realistic</span>
          </div>
          <div class="layer-card ${this.currentBuildingStyle === 'cyberpunk' ? 'active' : ''}" data-style="cyberpunk">
            <i data-lucide="flame"></i>
            <span>Cyberpunk Neon</span>
          </div>
          <div class="layer-card ${this.currentBuildingStyle === 'heatmap' ? 'active' : ''}" data-style="heatmap">
            <i data-lucide="activity"></i>
            <span>Height Heatmap</span>
          </div>
          <div class="layer-card ${this.currentBuildingStyle === 'blueprint' ? 'active' : ''}" data-style="blueprint">
            <i data-lucide="grid"></i>
            <span>Blueprint</span>
          </div>
        </div>

        <div class="section-title" style="margin-top: 14px;">Satellite & Base Imagery</div>
        <div class="layer-grid">
          <div class="layer-card active" data-imagery="esri_satellite">
            <i data-lucide="globe"></i>
            <span>Esri Satellite</span>
          </div>
          <div class="layer-card" data-imagery="carto_dark">
            <i data-lucide="moon"></i>
            <span>Dark Night</span>
          </div>
          <div class="layer-card" data-imagery="osm_standard">
            <i data-lucide="map"></i>
            <span>Street Map</span>
          </div>
          <div class="layer-card" data-imagery="esri_topo">
            <i data-lucide="mountain"></i>
            <span>Topographic</span>
          </div>
        </div>

        <div class="section-title" style="margin-top: 14px;">Atmosphere & Effects</div>
        <div class="toggle-row">
          <div class="toggle-info">
            <span class="toggle-title">Sunlight & Day/Night</span>
            <span class="toggle-sub">Dynamic solar lighting & shadows</span>
          </div>
          <label class="switch">
            <input type="checkbox" id="layerLightingToggle" checked />
            <span class="slider-round"></span>
          </label>
        </div>
        <div class="toggle-row">
          <div class="toggle-info">
            <span class="toggle-title">Atmospheric Fog</span>
            <span class="toggle-sub">Realistic distance haze</span>
          </div>
          <label class="switch">
            <input type="checkbox" id="layerFogToggle" checked />
            <span class="slider-round"></span>
          </label>
        </div>
      `;

      content.querySelectorAll('[data-tiles]').forEach(card => {
        card.addEventListener('click', () => {
          content.querySelectorAll('[data-tiles]').forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          this.switchBaseTiles(card.getAttribute('data-tiles'));
        });
      });

      content.querySelectorAll('[data-style]').forEach(card => {
        card.addEventListener('click', () => {
          content.querySelectorAll('[data-style]').forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          this.applyBuildingStyle(card.getAttribute('data-style'));
        });
      });

      content.querySelectorAll('[data-imagery]').forEach(card => {
        card.addEventListener('click', () => {
          content.querySelectorAll('[data-imagery]').forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          this.switchImagery(card.getAttribute('data-imagery'));
        });
      });

      content.querySelector('#layerLightingToggle')?.addEventListener('change', (e) => {
        this.viewer.scene.globe.enableLighting = e.target.checked;
      });
      content.querySelector('#layerFogToggle')?.addEventListener('change', (e) => {
        this.viewer.scene.fog.enabled = e.target.checked;
      });
    } else if (panelKey === 'climate') {
      title.innerHTML = `<i data-lucide="leaf"></i> Climate & Environment`;
      content.innerHTML = `
        <div class="climate-banner">
          🌍 <strong>Planetary Monitoring Studio:</strong> Visualize sea-level rise inundation risks, global industrial carbon emissions, and deforestation frontiers in 3D.
        </div>

        <div class="section-title">Sea Level Rise Simulator</div>
        <div class="climate-slider-container">
          <div class="climate-slider-header">
            <span>Projected Sea Rise</span>
            <span class="climate-level-value" id="seaLevelDisplay">+${this.climateLayers.seaLevelMeters} m</span>
          </div>
          <input type="range" class="range-input" id="seaLevelSlider" min="0" max="25" step="0.5" value="${this.climateLayers.seaLevelMeters}" />
          <div class="toggle-row" style="padding-bottom: 0;">
            <span class="toggle-title">Render Flood Layer</span>
            <label class="switch">
              <input type="checkbox" id="seaLevelToggle" ${this.climateLayers.seaLevel ? 'checked' : ''} />
              <span class="slider-round green"></span>
            </label>
          </div>
        </div>

        <div class="section-title" style="margin-top: 10px;">Vulnerable Coastal Cities</div>
        <div class="hotspot-chip-list">
          ${CLIMATE_DATA.seaLevelHotspots.map(h => `
            <button class="hotspot-chip" data-coastal-lon="${h.lon}" data-coastal-lat="${h.lat}">${h.name}</button>
          `).join('')}
        </div>

        <div class="section-title" style="margin-top: 16px;">Global Greenhouse Gas Hotspots</div>
        <div class="toggle-row">
          <div class="toggle-info">
            <span class="toggle-title">3D CO2 Emission Pillars</span>
            <span class="toggle-sub">Top global industrial & megacity clusters</span>
          </div>
          <label class="switch">
            <input type="checkbox" id="co2Toggle" ${this.climateLayers.co2 ? 'checked' : ''} />
            <span class="slider-round green"></span>
          </label>
        </div>

        <div class="section-title" style="margin-top: 16px;">Deforestation Frontiers</div>
        <div class="toggle-row">
          <div class="toggle-info">
            <span class="toggle-title">Primary Canopy Loss Indicators</span>
            <span class="toggle-sub">Amazon, Congo Basin, Borneo, Gran Chaco</span>
          </div>
          <label class="switch">
            <input type="checkbox" id="deforestationToggle" ${this.climateLayers.deforestation ? 'checked' : ''} />
            <span class="slider-round green"></span>
          </label>
        </div>
      `;

      content.querySelectorAll('[data-coastal-lon]').forEach(btn => {
        btn.addEventListener('click', () => {
          const lon = parseFloat(btn.getAttribute('data-coastal-lon'));
          const lat = parseFloat(btn.getAttribute('data-coastal-lat'));
          this.viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(lon, lat, 4500),
            orientation: { heading: 0, pitch: Cesium.Math.toRadians(-35), roll: 0 },
            duration: 2.2
          });
          if (!this.climateLayers.seaLevel) {
            this.toggleSeaLevelLayer(true);
            const toggle = content.querySelector('#seaLevelToggle');
            if (toggle) toggle.checked = true;
          }
        });
      });

      const slider = content.querySelector('#seaLevelSlider');
      const valDisplay = content.querySelector('#seaLevelDisplay');
      slider?.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        valDisplay.textContent = `+${val.toFixed(1)} m`;
        this.climateLayers.seaLevelMeters = val;
        this.updateSeaLevelSimulation();
      });

      content.querySelector('#seaLevelToggle')?.addEventListener('change', (e) => {
        this.toggleSeaLevelLayer(e.target.checked);
      });

      content.querySelector('#co2Toggle')?.addEventListener('change', (e) => {
        this.toggleCO2Layer(e.target.checked);
      });

      content.querySelector('#deforestationToggle')?.addEventListener('change', (e) => {
        this.toggleDeforestationLayer(e.target.checked);
      });
    } else if (panelKey === 'measure') {
      title.innerHTML = `<i data-lucide="ruler"></i> Measure Distance & Area`;
      content.innerHTML = `
        <div class="layer-grid">
          <button class="btn btn-primary" id="measureDistBtn">
            <i data-lucide="ruler"></i> Line Distance
          </button>
          <button class="btn btn-secondary" id="measureAreaBtn">
            <i data-lucide="square"></i> Polygon Area
          </button>
        </div>
        <div id="measurementDisplay" style="margin-top: 12px;">
          <div class="measure-card">
            <div class="measure-unit">Select a mode above and click on the 3D globe to measure</div>
            <div class="measure-value">Ready</div>
          </div>
        </div>
        <div class="layer-grid" style="margin-top: 12px;">
          <button class="btn btn-secondary" id="measureDoneBtn">Finish (Right-Click)</button>
          <button class="btn btn-secondary" id="measureClearBtn" style="color: var(--google-red);">Clear</button>
        </div>
      `;

      content.querySelector('#measureDistBtn')?.addEventListener('click', () => {
        this.measurementController.setMode('distance');
      });
      content.querySelector('#measureAreaBtn')?.addEventListener('click', () => {
        this.measurementController.setMode('area');
      });
      content.querySelector('#measureDoneBtn')?.addEventListener('click', () => {
        this.measurementController.finishMeasurement();
      });
      content.querySelector('#measureClearBtn')?.addEventListener('click', () => {
        this.measurementController.clear();
      });
    } else if (panelKey === 'placemarks') {
      title.innerHTML = `<i data-lucide="bookmark"></i> Projects & Placemarks`;
      content.innerHTML = `
        <button class="btn btn-primary" id="addPlacemarkBtn" style="width: 100%;">
          <i data-lucide="map-pin"></i> Add Placemark to 3D Globe
        </button>
        <div class="section-title" style="margin-top: 14px;">Saved Locations (${this.placemarks.length})</div>
        <div class="placemarks-list">
          ${this.placemarks.length === 0 ? '<div class="toggle-sub">No placemarks saved yet. Click above to drop a pin!</div>' : ''}
          ${this.placemarks.map(p => `
            <div class="placemark-item" data-pin-id="${p.id}">
              <div class="placemark-left">
                <span class="pin-dot" style="background-color: ${p.color};"></span>
                <div>
                  <div class="placemark-title">${p.title}</div>
                  <div class="placemark-coords">${p.lat.toFixed(3)}°, ${p.lon.toFixed(3)}°</div>
                </div>
              </div>
              <button class="placemark-del-btn" data-del-id="${p.id}" title="Delete"><i data-lucide="trash-2"></i></button>
            </div>
          `).join('')}
        </div>
      `;

      content.querySelector('#addPlacemarkBtn')?.addEventListener('click', () => {
        this.startAddPlacemark();
      });

      content.querySelectorAll('.placemark-item').forEach(item => {
        item.addEventListener('click', (e) => {
          if (e.target.closest('.placemark-del-btn')) return;
          const id = parseInt(item.getAttribute('data-pin-id'), 10);
          const pin = this.placemarks.find(p => p.id === id);
          if (pin) {
            this.viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(pin.lon, pin.lat, 2000),
              orientation: { heading: 0, pitch: Cesium.Math.toRadians(-40), roll: 0 },
              duration: 2.0
            });
          }
        });
      });

      content.querySelectorAll('.placemark-del-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = parseInt(btn.getAttribute('data-del-id'), 10);
          this.deletePlacemark(id);
        });
      });
    } else if (panelKey === 'lighting') {
      title.innerHTML = `<i data-lucide="sun"></i> Sunlight & Time of Day`;
      content.innerHTML = `
        <div class="section-title">24-Hour Solar Scrubber</div>
        <div class="climate-slider-container">
          <div class="climate-slider-header">
            <span>Simulated Universal Time</span>
            <span class="climate-level-value" id="solarTimeDisplay">12:00 UTC</span>
          </div>
          <input type="range" class="range-input" id="solarScrubber" min="0" max="24" step="0.1" value="12" style="accent-color: var(--google-yellow);" />
        </div>
        <div class="layer-grid" style="margin-top: 14px;">
          <button class="btn btn-secondary" data-hour="6">🌅 Sunrise (06:00)</button>
          <button class="btn btn-secondary" data-hour="12">☀️ Noon (12:00)</button>
          <button class="btn btn-secondary" data-hour="18">🌇 Golden Hour (18:00)</button>
          <button class="btn btn-secondary" data-hour="0">🌙 Midnight (00:00)</button>
        </div>
      `;

      const scrub = content.querySelector('#solarScrubber');
      const timeDisp = content.querySelector('#solarTimeDisplay');
      const setTime = (val) => {
        const hrs = Math.floor(val);
        const mins = Math.floor((val - hrs) * 60);
        timeDisp.textContent = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} UTC`;
        const date = new Date();
        date.setUTCHours(hrs, mins, 0, 0);
        this.viewer.clock.currentTime = Cesium.JulianDate.fromDate(date);
      };

      scrub?.addEventListener('input', (e) => setTime(parseFloat(e.target.value)));
      content.querySelectorAll('[data-hour]').forEach(btn => {
        btn.addEventListener('click', () => {
          const h = parseFloat(btn.getAttribute('data-hour'));
          if (scrub) scrub.value = h;
          setTime(h);
        });
      });
    } else if (panelKey === 'settings') {
      title.innerHTML = `<i data-lucide="settings"></i> Application Settings`;
      content.innerHTML = `
        <div class="section-title">Cesium ion Engine</div>
        <p class="toggle-sub">Stream high-resolution photorealistic 3D terrain and OSM structures globally.</p>
        <button class="btn btn-primary" id="openTokenSettingsBtn" style="margin-top: 8px; width: 100%;">
          <i data-lucide="key"></i> Manage Cesium ion Token
        </button>

        <div class="section-title" style="margin-top: 16px;">Rendering Quality</div>
        <div class="toggle-row">
          <div class="toggle-info">
            <span class="toggle-title">High Dynamic Range (HDR)</span>
            <span class="toggle-sub">Enhanced specular highlights and bloom</span>
          </div>
          <label class="switch">
            <input type="checkbox" id="hdrToggle" checked />
            <span class="slider-round"></span>
          </label>
        </div>
      `;

      content.querySelector('#openTokenSettingsBtn')?.addEventListener('click', () => {
        this.openTokenModal();
      });

      content.querySelector('#hdrToggle')?.addEventListener('change', (e) => {
        this.viewer.scene.highDynamicRange = e.target.checked;
      });
    }

    this.refreshIcons();
  }

  refreshIcons() {
    createIcons({ icons });
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new EarthApp();
});
