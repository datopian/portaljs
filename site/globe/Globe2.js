import { MeshPhongMaterial } from "three";

import Globe from "globe.gl";
import countries from "./coordinates.json";
import travelHistory from "./flights.json";
import airportHistory from "./airports.json";
import cities from "./cities.json";

//  Transparent material to hide polygons
//  This way the label works more consistently
const transparentMaterial = new MeshPhongMaterial();
transparentMaterial.transparent = true;
transparentMaterial.opacity = 0;

//  Globe
const datopianGlobe = Globe();
datopianGlobe(document.getElementById("globe"))
  .backgroundColor('rgba(0, 0, 0, 0)')
  .hexPolygonsData(countries.features)
  .polygonsData(countries.features)
  .polygonCapMaterial(transparentMaterial)
  // .polygonSideMaterial(transparentMaterial)
  .hexPolygonResolution(3)
  .hexPolygonMargin(0.3)
  .showAtmosphere(true)
  .atmosphereColor(0x60a5fa)
  .polygonSideColor(0x60a5fa)
  .atmosphereAltitude(0.1)
  .hexPolygonColor(({ properties: d }) => {
    return 0x60a5fa;
  });

//  Arcs
const N = cities.length;
const arcsData = [...Array(N).keys()].map((v, i) => {
  const cityA = cities[Math.floor(Math.random() * N)];
  const cityB = cities[Math.floor(Math.random() * N)];

  return {
    id: i,
    startLat: cityA.latitude,
    startLng: cityA.longitude,
    endLat: cityB.latitude,
    endLng: cityB.longitude,
  };
});

setTimeout(() => {
  datopianGlobe
    .arcsData(arcsData)
    .arcColor((e) => {
      return "#EF9E56";
    })
    .arcAltitude((e) => {
      return 0.25;
    })
    .arcStroke((e) => {
      return 0.6;
    })
    .arcDashLength(0.9)
    .arcCurveResolution(32)
    .arcDashGap(100)
    .arcDashAnimateTime(1000)
    .arcsTransitionDuration(1250)
    .arcDashInitialGap((e) => e.id / 5);
}, 1000);

//  Orbit controls
let controls = datopianGlobe.controls();

controls.enablePan = false;
controls.minDistance = 325;
controls.maxDistance = 325;
controls.rotateSpeed = 0.5;
controls.zoomSpeed = 1;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.35;

controls.minPolarAngle = Math.PI / 3.5;
controls.maxPolarAngle = Math.PI - Math.PI / 3;

//  On hover stop the rotation
const stopRotation = (el) => {
  controls.autoRotate = false;

  if (el === null) {
    controls.autoRotate = true;
  }
};

datopianGlobe.onPolygonHover(stopRotation);
datopianGlobe.onArcHover(stopRotation);

//  Focus Saudi Arabia
datopianGlobe.pointOfView({ lat: 24.774265, lng: 46.738586 });

//  Fix width and heigth
datopianGlobe.width(600);
datopianGlobe.height(750);