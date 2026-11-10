import * as Cesium from 'cesium';

export class MeasurementController {
  constructor(viewer, onUpdate) {
    this.viewer = viewer;
    this.onUpdate = onUpdate;
    this.activeMode = null; // 'distance' | 'area' | null
    this.points = [];
    this.entities = [];
    this.handler = null;
    this.activeEntity = null;
  }

  setMode(mode) {
    this.clear();
    this.activeMode = mode;

    if (this.handler) {
      this.handler.destroy();
      this.handler = null;
    }

    if (!mode) return;

    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);

    this.handler.setInputAction((click) => {
      const ray = this.viewer.camera.getPickRay(click.position);
      const cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);

      if (cartesian) {
        this.addPoint(cartesian);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // Right click completes measurement
    this.handler.setInputAction(() => {
      this.finishMeasurement();
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  }

  addPoint(cartesian) {
    this.points.push(cartesian);

    // Add marker sphere
    const marker = this.viewer.entities.add({
      position: cartesian,
      point: {
        pixelSize: 10,
        color: Cesium.Color.fromCssColorString('#4285f4'),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      }
    });
    this.entities.push(marker);

    this.updateShape();
  }

  updateShape() {
    if (this.points.length < 2) return;

    if (this.activeMode === 'distance') {
      if (!this.activeEntity) {
        this.activeEntity = this.viewer.entities.add({
          polyline: {
            positions: new Cesium.CallbackProperty(() => this.points, false),
            width: 4,
            material: new Cesium.PolylineGlowMaterialProperty({
              glowPower: 0.25,
              color: Cesium.Color.fromCssColorString('#4285f4')
            }),
            clampToGround: true
          }
        });
        this.entities.push(this.activeEntity);
      }

      const totalDistance = this.calculateTotalDistance();
      if (this.onUpdate) {
        this.onUpdate({
          mode: 'distance',
          count: this.points.length,
          distanceMeters: totalDistance,
          distanceKm: (totalDistance / 1000).toFixed(2),
          distanceMiles: (totalDistance * 0.000621371).toFixed(2)
        });
      }
    } else if (this.activeMode === 'area') {
      if (this.points.length >= 3) {
        if (!this.activeEntity) {
          this.activeEntity = this.viewer.entities.add({
            polygon: {
              hierarchy: new Cesium.CallbackProperty(() => new Cesium.PolygonHierarchy(this.points), false),
              material: Cesium.Color.fromCssColorString('rgba(66, 133, 244, 0.35)'),
              outline: true,
              outlineColor: Cesium.Color.fromCssColorString('#4285f4'),
              outlineWidth: 3
            }
          });
          this.entities.push(this.activeEntity);
        }

        const areaSqMeters = this.calculatePolygonArea();
        if (this.onUpdate) {
          this.onUpdate({
            mode: 'area',
            count: this.points.length,
            areaSqKm: (areaSqMeters / 1e6).toFixed(3),
            areaHectares: (areaSqMeters / 10000).toFixed(2),
            areaAcres: (areaSqMeters * 0.000247105).toFixed(2)
          });
        }
      }
    }
  }

  calculateTotalDistance() {
    let total = 0;
    const geodesic = new Cesium.EllipsoidGeodesic();
    for (let i = 0; i < this.points.length - 1; i++) {
      const c1 = Cesium.Cartographic.fromCartesian(this.points[i]);
      const c2 = Cesium.Cartographic.fromCartesian(this.points[i + 1]);
      geodesic.setEndPoints(c1, c2);
      total += geodesic.surfaceDistance;
    }
    return total;
  }

  calculatePolygonArea() {
    if (this.points.length < 3) return 0;
    // Spherical polygon area using projection onto local plane
    const coords = this.points.map(p => Cesium.Cartographic.fromCartesian(p));
    let area = 0;
    const n = coords.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += (coords[j].longitude - coords[i].longitude) * (2 + Math.sin(coords[i].latitude) + Math.sin(coords[j].latitude));
    }
    area = Math.abs(area * 6378137.0 * 6378137.0 / 2.0);
    return area;
  }

  finishMeasurement() {
    if (this.handler) {
      this.handler.destroy();
      this.handler = null;
    }
  }

  clear() {
    if (this.handler) {
      this.handler.destroy();
      this.handler = null;
    }
    this.entities.forEach(ent => this.viewer.entities.remove(ent));
    this.entities = [];
    this.points = [];
    this.activeEntity = null;
    this.activeMode = null;
    if (this.onUpdate) {
      this.onUpdate(null);
    }
  }
}

