import * as Cesium from 'cesium';

// High-resolution SVG Tree Data URIs for batched Billboard rendering
const TREE_TEXTURES = {
  oak: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="80" viewBox="0 0 64 80">
      <defs>
        <radialGradient id="oakGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stop-color="#4ade80" />
          <stop offset="45%" stop-color="#22c55e" />
          <stop offset="85%" stop-color="#15803d" />
          <stop offset="100%" stop-color="#14532d" />
        </radialGradient>
        <linearGradient id="trunkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#5c3a21" />
          <stop offset="50%" stop-color="#78350f" />
          <stop offset="100%" stop-color="#451a03" />
        </linearGradient>
      </defs>
      <!-- Trunk -->
      <rect x="28" y="52" width="8" height="26" rx="2" fill="url(#trunkGrad)" />
      <!-- Shadow -->
      <ellipse cx="32" cy="78" rx="14" ry="3" fill="rgba(0,0,0,0.3)" />
      <!-- Foliage Canopy -->
      <circle cx="32" cy="34" r="26" fill="url(#oakGrad)" />
      <circle cx="20" cy="38" r="16" fill="url(#oakGrad)" opacity="0.9" />
      <circle cx="44" cy="38" r="16" fill="url(#oakGrad)" opacity="0.9" />
      <circle cx="32" cy="18" r="15" fill="url(#oakGrad)" opacity="0.95" />
    </svg>
  `)}`,

  pine: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="56" height="88" viewBox="0 0 56 88">
      <defs>
        <linearGradient id="pineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#34d399" />
          <stop offset="50%" stop-color="#059669" />
          <stop offset="100%" stop-color="#064e3b" />
        </linearGradient>
        <linearGradient id="pineTrunk" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#451a03" />
          <stop offset="100%" stop-color="#271004" />
        </linearGradient>
      </defs>
      <!-- Trunk -->
      <rect x="25" y="64" width="6" height="22" rx="1" fill="url(#pineTrunk)" />
      <ellipse cx="28" cy="86" rx="10" ry="2.5" fill="rgba(0,0,0,0.3)" />
      <!-- Tiered Pine Foliage -->
      <polygon points="28,4 12,30 44,30" fill="url(#pineGrad)" />
      <polygon points="28,22 8,50 48,50" fill="url(#pineGrad)" />
      <polygon points="28,40 4,70 52,70" fill="url(#pineGrad)" />
    </svg>
  `)}`,

  palm: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="68" height="84" viewBox="0 0 68 84">
      <defs>
        <linearGradient id="palmFrond" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#86efac" />
          <stop offset="100%" stop-color="#166534" />
        </linearGradient>
      </defs>
      <!-- Curved Trunk -->
      <path d="M 34 80 Q 30 50 34 26" stroke="#78350f" stroke-width="6" fill="none" stroke-linecap="round" />
      <ellipse cx="34" cy="81" rx="10" ry="2" fill="rgba(0,0,0,0.3)" />
      <!-- Fronds -->
      <path d="M 34 26 Q 10 14 2 34" stroke="url(#palmFrond)" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M 34 26 Q 58 14 66 34" stroke="url(#palmFrond)" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M 34 26 Q 22 2 12 10" stroke="url(#palmFrond)" stroke-width="4.5" fill="none" stroke-linecap="round" />
      <path d="M 34 26 Q 46 2 56 10" stroke="url(#palmFrond)" stroke-width="4.5" fill="none" stroke-linecap="round" />
      <path d="M 34 26 Q 34 0 34 6" stroke="url(#palmFrond)" stroke-width="4.5" fill="none" stroke-linecap="round" />
    </svg>
  `)}`,

  rainforest: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="72" height="76" viewBox="0 0 72 76">
      <defs>
        <radialGradient id="rainGrad" cx="45%" cy="35%" r="60%">
          <stop offset="0%" stop-color="#22c55e" />
          <stop offset="50%" stop-color="#15803d" />
          <stop offset="100%" stop-color="#052e16" />
        </radialGradient>
      </defs>
      <rect x="33" y="46" width="6" height="28" fill="#3f2712" />
      <ellipse cx="36" cy="74" rx="12" ry="2.5" fill="rgba(0,0,0,0.3)" />
      <ellipse cx="36" cy="30" rx="32" ry="20" fill="url(#rainGrad)" />
      <ellipse cx="24" cy="22" rx="18" ry="12" fill="url(#rainGrad)" opacity="0.9" />
      <ellipse cx="48" cy="22" rx="18" ry="12" fill="url(#rainGrad)" opacity="0.9" />
    </svg>
  `)}`
};

// Known global major urban parks, green belts & forest biomes
export const FAMOUS_GREEN_ZONES = [
  {
    name: 'Central Park',
    location: 'New York, USA',
    bounds: { minLon: -73.9818, maxLon: -73.9497, minLat: 40.7648, maxLat: 40.7998 },
    type: 'oak',
    defaultDensity: 1200
  },
  {
    name: 'Yoyogi Park & Meiji Jingu',
    location: 'Tokyo, Japan',
    bounds: { minLon: 139.6920, maxLon: 139.7040, minLat: 35.6660, maxLat: 35.6790 },
    type: 'oak',
    defaultDensity: 900
  },
  {
    name: 'Golden Gate Park',
    location: 'San Francisco, USA',
    bounds: { minLon: -122.5110, maxLon: -122.4530, minLat: 37.7640, maxLat: 37.7735 },
    type: 'pine',
    defaultDensity: 1400
  },
  {
    name: 'Tiergarten Park',
    location: 'Berlin, Germany',
    bounds: { minLon: 13.3360, maxLon: 13.3750, minLat: 52.5080, maxLat: 52.5180 },
    type: 'oak',
    defaultDensity: 1000
  },
  {
    name: 'Hyde Park & Kensington Gardens',
    location: 'London, UK',
    bounds: { minLon: -0.1900, maxLon: -0.1500, minLat: 51.5000, maxLat: 51.5130 },
    type: 'oak',
    defaultDensity: 850
  },
  {
    name: 'Amazon Rainforest Canopy Corridor',
    location: 'Manaus Region, Brazil',
    bounds: { minLon: -60.1000, maxLon: -59.9000, minLat: -3.1000, maxLat: -2.9000 },
    type: 'rainforest',
    defaultDensity: 2500
  },
  {
    name: 'Gangotri Valley Alpine Pine Belt',
    location: 'Himalayas, Uttarakhand',
    bounds: { minLon: 78.9000, maxLon: 79.1000, minLat: 30.9500, maxLat: 31.0500 },
    type: 'pine',
    defaultDensity: 1200
  }
];

export class VegetationEngine {
  constructor(viewer, onStatsUpdate) {
    this.viewer = viewer;
    this.onStatsUpdate = onStatsUpdate;
    this.billboardCollection = null;
    this.treeCount = 0;
    this.activeType = 'oak';
    this.isBrushActive = false;
    this.brushHandler = null;
    this.initCollection();
  }

  initCollection() {
    if (this.billboardCollection) {
      this.viewer.scene.primitives.remove(this.billboardCollection);
    }
    this.billboardCollection = this.viewer.scene.primitives.add(
      new Cesium.BillboardCollection({
        scene: this.viewer.scene
      })
    );
  }

  scatterInBounds(bounds, count = 500, treeType = 'oak') {
    const imgUrl = TREE_TEXTURES[treeType] || TREE_TEXTURES.oak;
    const { minLon, maxLon, minLat, maxLat } = bounds;

    for (let i = 0; i < count; i++) {
      const lon = minLon + Math.random() * (maxLon - minLon);
      const lat = minLat + Math.random() * (maxLat - minLat);
      const scale = 0.35 + Math.random() * 0.3;
      const position = Cesium.Cartesian3.fromDegrees(lon, lat);

      this.billboardCollection.add({
        position: position,
        image: imgUrl,
        scale: scale,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      });
      this.treeCount++;
    }

    this.updateStats();
  }

  scatterCluster(centerCartesian, radiusMeters = 300, count = 80, treeType = 'oak') {
    const imgUrl = TREE_TEXTURES[treeType] || TREE_TEXTURES.oak;
    const carto = Cesium.Cartographic.fromCartesian(centerCartesian);
    const centerLon = Cesium.Math.toDegrees(carto.longitude);
    const centerLat = Cesium.Math.toDegrees(carto.latitude);

    const metersPerDegLat = 111320;
    const metersPerDegLon = 111320 * Math.cos(carto.latitude);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * radiusMeters;

      const dLon = (r * Math.cos(angle)) / metersPerDegLon;
      const dLat = (r * Math.sin(angle)) / metersPerDegLat;

      const lon = centerLon + dLon;
      const lat = centerLat + dLat;

      const scale = 0.32 + Math.random() * 0.28;
      const position = Cesium.Cartesian3.fromDegrees(lon, lat);

      this.billboardCollection.add({
        position: position,
        image: imgUrl,
        scale: scale,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      });
      this.treeCount++;
    }

    this.updateStats();
  }

  scatterInCurrentView(treeType = 'oak', density = 500) {
    const camera = this.viewer.camera;
    const canvas = this.viewer.scene.canvas;

    const cameraCarto = camera.positionCartographic;
    const camLon = Cesium.Math.toDegrees(cameraCarto.longitude);
    const camLat = Cesium.Math.toDegrees(cameraCarto.latitude);

    const nearbyZone = FAMOUS_GREEN_ZONES.find(zone => {
      return (
        camLon >= zone.bounds.minLon - 0.2 &&
        camLon <= zone.bounds.maxLon + 0.2 &&
        camLat >= zone.bounds.minLat - 0.2 &&
        camLat <= zone.bounds.maxLat + 0.2
      );
    });

    if (nearbyZone) {
      this.scatterInBounds(nearbyZone.bounds, density, nearbyZone.type || treeType);
      return { zone: nearbyZone.name, count: density };
    }

    let placed = 0;
    const sampleAttempts = density * 2;
    const imgUrl = TREE_TEXTURES[treeType] || TREE_TEXTURES.oak;

    for (let i = 0; i < sampleAttempts && placed < density; i++) {
      const screenX = canvas.width * (0.125 + Math.random() * 0.75);
      const screenY = canvas.height * (0.125 + Math.random() * 0.75);
      const screenPos = new Cesium.Cartesian2(screenX, screenY);

      const ray = camera.getPickRay(screenPos);
      const cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);

      if (cartesian) {
        const scale = 0.35 + Math.random() * 0.3;
        this.billboardCollection.add({
          position: cartesian,
          image: imgUrl,
          scale: scale,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        });
        placed++;
        this.treeCount++;
      }
    }

    this.updateStats();
    return { zone: 'Visible Landscape', count: placed };
  }

  setBrushActive(active, treeType = 'oak', onPlaced) {
    this.isBrushActive = active;
    this.activeType = treeType;

    if (this.brushHandler) {
      this.brushHandler.destroy();
      this.brushHandler = null;
    }

    if (!active) return;

    this.brushHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);

    this.brushHandler.setInputAction((click) => {
      const ray = this.viewer.camera.getPickRay(click.position);
      const cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);

      if (cartesian) {
        this.scatterCluster(cartesian, 180, 45, this.activeType);
        if (onPlaced) {
          onPlaced({ count: 45, total: this.treeCount });
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  clear() {
    if (this.brushHandler) {
      this.brushHandler.destroy();
      this.brushHandler = null;
      this.isBrushActive = false;
    }
    if (this.billboardCollection) {
      this.billboardCollection.removeAll();
    }
    this.treeCount = 0;
    this.updateStats();
  }

  updateStats() {
    const co2SequestrationTons = (this.treeCount * 0.022).toFixed(1);
    const canopyAreaSqKm = ((this.treeCount * 25) / 1000000).toFixed(3);

    if (this.onStatsUpdate) {
      this.onStatsUpdate({
        treeCount: this.treeCount,
        co2SequestrationTons,
        canopyAreaSqKm
      });
    }
  }
}

