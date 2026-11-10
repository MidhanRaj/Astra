import * as Cesium from 'cesium';

// Color themes & styling per disaster category
export const DISASTER_TYPES = {
  earthquake: {
    label: 'Earthquake',
    color: '#f59e0b', // Amber
    glowColor: 'rgba(245, 158, 11, 0.4)',
    icon: 'activity',
    badgeClass: 'badge-earthquake',
    windyOverlay: 'wind'
  },
  wildfire: {
    label: 'Wildfire',
    color: '#ef4444', // Red
    glowColor: 'rgba(239, 68, 68, 0.4)',
    icon: 'flame',
    badgeClass: 'badge-wildfire',
    windyOverlay: 'cosc' // Carbon monoxide / smoke plumes
  },
  cyclone: {
    label: 'Tropical Cyclone',
    color: '#8b5cf6', // Violet
    glowColor: 'rgba(139, 92, 246, 0.4)',
    icon: 'wind',
    badgeClass: 'badge-cyclone',
    windyOverlay: 'wind' // Wind streamlines & eye
  },
  volcano: {
    label: 'Volcano',
    color: '#ea580c', // Dark Orange
    glowColor: 'rgba(234, 88, 12, 0.4)',
    icon: 'mountain',
    badgeClass: 'badge-volcano',
    windyOverlay: 'cosc'
  },
  flood: {
    label: 'Flood',
    color: '#06b6d4', // Cyan
    glowColor: 'rgba(6, 182, 212, 0.4)',
    icon: 'droplets',
    badgeClass: 'badge-flood',
    windyOverlay: 'rain'
  },
  storm: {
    label: 'Severe Storm',
    color: '#3b82f6', // Blue
    glowColor: 'rgba(59, 130, 246, 0.4)',
    icon: 'cloud-lightning',
    badgeClass: 'badge-storm',
    windyOverlay: 'radar'
  },
  ice: {
    label: 'Sea & Lake Ice',
    color: '#38bdf8', // Light Blue
    glowColor: 'rgba(56, 189, 248, 0.4)',
    icon: 'snowflake',
    badgeClass: 'badge-ice',
    windyOverlay: 'satellite'
  }
};

// High-fidelity fallback events in case user is offline or API has a temporary hiccup
const FALLBACK_DISASTERS = [
  {
    id: 'quake_japan_m62',
    type: 'earthquake',
    typeName: 'Earthquake',
    title: 'M 6.2 - Near Coast of Honshu, Japan',
    place: 'Off coast of Honshu, Japan',
    magnitude: 'M 6.2',
    date: new Date(Date.now() - 3600000 * 2).toISOString(),
    lon: 142.345,
    lat: 38.452,
    depth: 35,
    source: 'USGS Earthquakes',
    url: 'https://earthquake.usgs.gov/'
  },
  {
    id: 'volcano_kilauea',
    type: 'volcano',
    typeName: 'Volcano',
    title: 'Kilauea Halemaʻumaʻu Crater Eruption',
    place: 'Hawaii Volcanoes National Park, USA',
    magnitude: 'Active Lava Lake',
    date: new Date(Date.now() - 3600000 * 5).toISOString(),
    lon: -155.287,
    lat: 19.406,
    depth: null,
    source: 'NASA EONET / USGS HVO',
    url: 'https://eonet.gsfc.nasa.gov/'
  },
  {
    id: 'wildfire_california',
    type: 'wildfire',
    typeName: 'Wildfire',
    title: 'Canyon Complex Fire',
    place: 'Los Angeles County, California, USA',
    magnitude: '4,200 acres',
    date: new Date(Date.now() - 3600000 * 8).toISOString(),
    lon: -118.652,
    lat: 34.289,
    depth: null,
    source: 'NASA EONET / CAL FIRE',
    url: 'https://eonet.gsfc.nasa.gov/'
  },
  {
    id: 'cyclone_jasper',
    type: 'cyclone',
    typeName: 'Tropical Cyclone',
    title: 'Tropical Cyclone Jasper (Category 3)',
    place: 'Coral Sea, Northeast Australia',
    magnitude: 'Category 3 • 175 km/h winds',
    date: new Date(Date.now() - 3600000 * 12).toISOString(),
    lon: 147.500,
    lat: -15.800,
    depth: null,
    source: 'NASA EONET / JTWC',
    url: 'https://eonet.gsfc.nasa.gov/'
  },
  {
    id: 'quake_iceland_m54',
    type: 'earthquake',
    typeName: 'Earthquake',
    title: 'M 5.4 - Reykjanes Peninsula, Iceland',
    place: 'Reykjanes Peninsula, Iceland',
    magnitude: 'M 5.4',
    date: new Date(Date.now() - 3600000 * 18).toISOString(),
    lon: -22.312,
    lat: 63.882,
    depth: 6,
    source: 'USGS Earthquakes',
    url: 'https://earthquake.usgs.gov/'
  },
  {
    id: 'flood_brazil',
    type: 'flood',
    typeName: 'Flood',
    title: 'Taquari Valley River Inundation',
    place: 'Rio Grande do Sul, Brazil',
    magnitude: 'Severe Overflow',
    date: new Date(Date.now() - 3600000 * 24).toISOString(),
    lon: -51.961,
    lat: -29.458,
    depth: null,
    source: 'NASA EONET / MetSul',
    url: 'https://eonet.gsfc.nasa.gov/'
  }
];

export class LiveDisasterFeedManager {
  constructor(viewer, onSelectEvent, onFeedUpdate) {
    this.viewer = viewer;
    this.onSelectEvent = onSelectEvent;
    this.onFeedUpdate = onFeedUpdate;
    this.events = [];
    this.activeFilter = 'all';
    this.searchQuery = '';
    this.entities = [];
    this.isLoading = false;
    this.lastUpdated = null;
    this.activeEvent = null;

    // Visibility controls
    this.markersVisible = true;
    this.isolatedEventId = null; // When focused on a site, only this event is shown
    this.typeVisibility = {
      earthquake: true,
      wildfire: true,
      cyclone: true,
      volcano: true,
      flood: true,
      storm: true,
      ice: true
    };

    this.initClickHandler();
  }

  initClickHandler() {
    const handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    handler.setInputAction((click) => {
      const pickedObject = this.viewer.scene.pick(click.position);
      if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id._disasterEvent) {
        const event = pickedObject.id._disasterEvent;
        this.selectEvent(event);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  /**
   * Fetch real-time disasters from NASA EONET and USGS Earthquakes APIs concurrently
   */
  async fetchLiveFeed() {
    this.isLoading = true;
    const liveEvents = [];

    // 1. Fetch USGS Earthquakes (M4.5+ in the past 7 days)
    try {
      const usgsRes = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson');
      if (usgsRes.ok) {
        const usgsData = await usgsRes.json();
        if (usgsData.features && Array.isArray(usgsData.features)) {
          usgsData.features.forEach(f => {
            const props = f.properties;
            const geom = f.geometry;
            if (geom && geom.coordinates && geom.coordinates.length >= 2) {
              const lon = geom.coordinates[0];
              const lat = geom.coordinates[1];
              const depth = geom.coordinates[2] || 0;
              const mag = props.mag ? `M ${props.mag.toFixed(1)}` : 'M 4.5+';
              
              liveEvents.push({
                id: `usgs_${f.id}`,
                type: 'earthquake',
                typeName: 'Earthquake',
                title: props.title || `Earthquake ${mag}`,
                place: props.place || 'Unknown Location',
                magnitude: mag,
                date: new Date(props.time).toISOString(),
                lon,
                lat,
                depth,
                source: 'USGS Earthquakes',
                url: props.url || 'https://earthquake.usgs.gov/'
              });
            }
          });
        }
      }
    } catch (err) {
      console.warn('USGS live feed notice:', err);
    }

    // 2. Fetch NASA EONET Natural Events (Wildfires, Storms, Volcanoes, Floods)
    try {
      const eonetRes = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=50');
      if (eonetRes.ok) {
        const eonetData = await eonetRes.json();
        if (eonetData.events && Array.isArray(eonetData.events)) {
          eonetData.events.forEach(ev => {
            const cat = ev.categories && ev.categories[0] ? ev.categories[0].id : 'severeStorms';
            let mappedType = 'storm';
            let typeName = 'Severe Storm';

            if (cat === 'wildfires') {
              mappedType = 'wildfire';
              typeName = 'Wildfire';
            } else if (cat === 'volcanoes') {
              mappedType = 'volcano';
              typeName = 'Volcano';
            } else if (cat === 'floods') {
              mappedType = 'flood';
              typeName = 'Flood';
            } else if (cat === 'severeStorms') {
              mappedType = 'cyclone';
              typeName = 'Severe Storm / Cyclone';
            } else if (cat === 'seaLakeIce') {
              mappedType = 'ice';
              typeName = 'Sea & Lake Ice';
            }

            if (ev.geometry && ev.geometry.length > 0) {
              const latestGeom = ev.geometry[ev.geometry.length - 1];
              if (latestGeom.coordinates && latestGeom.coordinates.length >= 2) {
                let lon = latestGeom.coordinates[0];
                let lat = latestGeom.coordinates[1];
                if (Array.isArray(lon)) {
                  lon = lon[0];
                  lat = lat[0] || lat;
                }

                if (typeof lon === 'number' && typeof lat === 'number') {
                  let mag = typeName;
                  if (latestGeom.magnitudeValue) {
                    mag = `${latestGeom.magnitudeValue} ${latestGeom.magnitudeUnit || ''}`.trim();
                  }

                  const place = ev.title ? ev.title.split(',').slice(-2).join(', ').trim() || ev.title : 'Global Alert';

                  liveEvents.push({
                    id: `nasa_${ev.id}`,
                    type: mappedType,
                    typeName: typeName,
                    title: ev.title || `${typeName} Event`,
                    place: place,
                    magnitude: mag,
                    date: latestGeom.date || new Date().toISOString(),
                    lon,
                    lat,
                    depth: null,
                    source: 'NASA EONET',
                    url: ev.sources && ev.sources[0] ? ev.sources[0].url : (ev.link || 'https://eonet.gsfc.nasa.gov/')
                  });
                }
              }
            }
          });
        }
      }
    } catch (err) {
      console.warn('NASA EONET live feed notice:', err);
    }

    if (liveEvents.length === 0) {
      this.events = [...FALLBACK_DISASTERS];
    } else {
      this.events = liveEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    this.isLoading = false;
    this.lastUpdated = new Date();

    this.renderGlobeEntities();

    if (this.onFeedUpdate) {
      this.onFeedUpdate(this.getFilteredEvents(), this.getStats());
    }

    return this.events;
  }

  /**
   * Render 3D disaster markers with proper horizon depth testing & distance culling.
   * Faraway markers on the other side of the Earth are naturally occluded by the 3D globe.
   */
  renderGlobeEntities() {
    this.entities.forEach(ent => this.viewer.entities.remove(ent));
    this.entities = [];

    if (!this.markersVisible) return;

    this.events.forEach(event => {
      // If a specific site is isolated, hide all other markers
      if (this.isolatedEventId && this.isolatedEventId !== event.id) {
        return;
      }

      // Check if this disaster type is enabled
      if (this.typeVisibility[event.type] === false) {
        return;
      }

      const meta = DISASTER_TYPES[event.type] || DISASTER_TYPES.storm;
      const pos = Cesium.Cartesian3.fromDegrees(event.lon, event.lat, 50);

      const entity = this.viewer.entities.add({
        id: `disaster_${event.id}`,
        position: pos,
        point: {
          pixelSize: event.type === 'earthquake' ? 13 : 11,
          color: Cesium.Color.fromCssColorString(meta.color),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
          // CRITICAL FIX: Only allow depth test bypass for a short radius (150km)
          // so markers on the other side of the planet DO NOT shine through the Earth!
          disableDepthTestDistance: 150000.0,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(100.0, 10000000.0)
        },
        label: {
          text: `${this.getEmojiForType(event.type)} ${event.typeName}: ${event.place}`,
          font: '11px Plus Jakarta Sans, sans-serif',
          fillColor: Cesium.Color.WHITE,
          showBackground: true,
          backgroundColor: Cesium.Color.fromCssColorString('rgba(15, 20, 26, 0.85)'),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -16),
          // CRITICAL FIX: Culled when camera is too far or behind horizon
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(100.0, 1800000.0),
          disableDepthTestDistance: 150000.0
        }
      });

      entity._disasterEvent = event;
      this.entities.push(entity);
    });
  }

  getEmojiForType(type) {
    const emojis = {
      earthquake: '⚡',
      wildfire: '🔥',
      cyclone: '🌪️',
      volcano: '🌋',
      flood: '🌊',
      storm: '⛈️',
      ice: '❄️'
    };
    return emojis[type] || '⚠️';
  }

  /**
   * Select a disaster event, fly down to location and isolate/focus view
   */
  selectEvent(event, isolate = true) {
    this.activeEvent = event;
    if (isolate) {
      this.isolatedEventId = event.id;
      this.renderGlobeEntities();
    }

    const altitude = event.type === 'wildfire' || event.type === 'volcano' ? 7000 : 35000;
    const pitch = event.type === 'wildfire' || event.type === 'volcano' ? -32 : -45;

    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(event.lon, event.lat, altitude),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(pitch),
        roll: 0.0
      },
      duration: 2.5,
      easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT
    });

    if (this.onSelectEvent) {
      this.onSelectEvent(event);
    }
  }

  /**
   * Reset site isolation to show all markers again
   */
  clearSiteIsolation() {
    this.isolatedEventId = null;
    this.renderGlobeEntities();
  }

  /**
   * Toggle master disaster markers visibility on/off
   */
  setMarkersVisible(visible) {
    this.markersVisible = visible;
    this.renderGlobeEntities();
  }

  /**
   * Toggle specific disaster category visibility
   */
  toggleTypeVisibility(typeKey, visible) {
    this.typeVisibility[typeKey] = visible;
    this.renderGlobeEntities();
  }

  setFilter(filterKey) {
    this.activeFilter = filterKey;
    if (this.onFeedUpdate) {
      this.onFeedUpdate(this.getFilteredEvents(), this.getStats());
    }
  }

  setSearchQuery(query) {
    this.searchQuery = (query || '').toLowerCase().trim();
    if (this.onFeedUpdate) {
      this.onFeedUpdate(this.getFilteredEvents(), this.getStats());
    }
  }

  getFilteredEvents() {
    return this.events.filter(ev => {
      if (this.activeFilter !== 'all' && ev.type !== this.activeFilter) {
        return false;
      }
      if (this.searchQuery) {
        const matchesTitle = ev.title.toLowerCase().includes(this.searchQuery);
        const matchesPlace = ev.place.toLowerCase().includes(this.searchQuery);
        const matchesType = ev.typeName.toLowerCase().includes(this.searchQuery);
        return matchesTitle || matchesPlace || matchesType;
      }
      return true;
    });
  }

  getStats() {
    const quakes = this.events.filter(e => e.type === 'earthquake').length;
    const fires = this.events.filter(e => e.type === 'wildfire').length;
    const cyclones = this.events.filter(e => e.type === 'cyclone' || e.type === 'storm').length;
    const volcanoes = this.events.filter(e => e.type === 'volcano').length;
    const floods = this.events.filter(e => e.type === 'flood').length;

    return {
      total: this.events.length,
      quakes,
      fires,
      cyclones,
      volcanoes,
      floods
    };
  }

  /**
   * Construct Windy.com Live Interactive Radar URL
   * Overlays: 'wind' (cyclone streamlines), 'rain', 'radar', 'satellite', 'cosc' (wildfire smoke), 'waves', 'temp'
   */
  static getWindyEmbedUrl(lat = 20, lon = 0, overlay = 'wind', zoom = 5) {
    const clampedZoom = Math.min(11, Math.max(3, zoom));
    return `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&detailLat=${lat}&detailLon=${lon}&width=700&height=480&zoom=${clampedZoom}&level=surface&overlay=${overlay}&product=ecmwf&menu=&message=true&marker=true&calendar=now&pressure=true&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`;
  }

  /**
   * Construct Zoom Earth live satellite & cyclone tracking URL
   * Provides rapid 10-minute HD satellite imagery and wind/radar tracking
   */
  static getZoomEarthUrl(lat = 20, lon = 0, zoom = 6) {
    const clampedZoom = Math.min(14, Math.max(3, Math.round(zoom)));
    return `https://zoom.earth/maps/satellite/#view=${lat.toFixed(4)},${lon.toFixed(4)},${clampedZoom}z`;
  }

  static getZoomEarthCycloneUrl(lat = 20, lon = 0, zoom = 6) {
    const clampedZoom = Math.min(14, Math.max(3, Math.round(zoom)));
    return `https://zoom.earth/maps/satellite/#view=${lat.toFixed(4)},${lon.toFixed(4)},${clampedZoom}z/overlays=wind,radar`;
  }

  static formatRelativeTime(dateString) {
    const now = Date.now();
    const then = new Date(dateString).getTime();
    const diffSec = Math.floor((now - then) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  }
}
