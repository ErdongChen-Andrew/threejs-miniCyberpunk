import "./style.css";
import * as dat from "lil-gui";
import Stats from "stats-js";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Color, sRGBEncoding } from "three";
import {
  BloomEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
  GodRaysEffect,
  SMAAEffect,
} from "postprocessing";
import gsap from "gsap";

/**
 * Base
 */
// Add FPS rate
var stats = new Stats();

// Media query for desktop version
let mediaQuery = window.matchMedia("(min-width: 600px)");

// Debug
const gui = new dat.GUI({
  width: 240,
});
gui.close();
gui.hide();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Loader animation
const loader = document.querySelector(".loader");
const fillCircle = document.querySelector("circle");

// loading persentage
const loadingPersentage = document.querySelector(".persentage");
const fadeOutDuration = 1.5; //in seconds

// Scene
const scene = new THREE.Scene();

// Light
const pointLight = new THREE.PointLight(0xbdadff, 10);
pointLight.position.set(-7, 5, -7);

scene.add(pointLight);

/**
 * Loading Manager
 */
// create loading manager for loading prograss
const loadingManager = new THREE.LoadingManager(
  // loading completed
  () => {
    // hide loading page after loaded
    setTimeout(() => {
      gsap.to(loader, { opacity: 0, duration: fadeOutDuration });
    }, 700);

    setTimeout(() => {
      loader.style.display = "none";
      gui.show();
    }, fadeOutDuration * 1500);

    // change camera view
    setTimeout(() => {
      if (mediaQuery.matches) {
        gsap.fromTo(
          camera.position,
          { x: 12, y: 10, z: 12 },
          { x: 9, y: 6, z: 9, duration: 2 }
        );
      } else {
        gsap.fromTo(
          camera.position,
          { x: 20, y: 18, z: 20 },
          { x: 14, y: 12, z: 14, duration: 2 }
        );
      }
    }, 200);

    // show FPS stats
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);
  },

  // loading prograss
  (itemUrl, itemsLoaded, itemsTotal) => {
    const persentage = Math.round((itemsLoaded / itemsTotal) * 100);
    loadingPersentage.innerHTML = persentage + "%";

    // Fill Circle Loading Bar (--loader-end-point 472 is o%, 0 is 100%)
    let circleFillNumber = 472 * (1 - persentage / 100);
    document.documentElement.style.setProperty(
      "--loader-end-point",
      circleFillNumber
    );
    getComputedStyle(document.documentElement).getPropertyValue(
      "--loader-end-point"
    );
  }
);

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader(loadingManager);

// GLTF loader
const gltfLoader = new GLTFLoader(loadingManager);

// Texture loader
const textures = {};

const teslaBodyTexture = textureLoader.load(
  "models/bakedTeslaBody(purple).jpg"
);
textures.teslaBodyTexture = teslaBodyTexture;

const teslaPartsTexture = textureLoader.load(
  "models/bakedTeslaParts(purple).jpg"
);
textures.teslaPartsTexture = teslaPartsTexture;

const buildingTexture = textureLoader.load("models/bakedBuilding(purple).jpg");
textures.buildingTexture = buildingTexture;

const tankSetTexture = textureLoader.load("models/bakedTanksSet(purple).jpg");
textures.tankSetTexture = tankSetTexture;

const buildingPartsTexture = textureLoader.load(
  "models/bakedBuildingParts(purple).jpg"
);
textures.buildingPartsTexture = buildingPartsTexture;

const wireframeTexture = textureLoader.load(
  "models/bakedWireframe(purple2).jpg"
);
textures.wireframeTexture = wireframeTexture;

const itemsTexture = textureLoader.load("models/bakedItems(purple).jpg");
textures.itemsTexture = itemsTexture;

const linesTexture = textureLoader.load("models/bakedLines(purple).jpg");
textures.linesTexture = linesTexture;

const fenceTexture = textureLoader.load("models/bakedFence(purple2).jpg");
textures.fenceTexture = fenceTexture;

for (let texture in textures) {
  textures[texture].flipY = false;
  textures[texture].encoding = sRGBEncoding;
}

/**
 * Materials
 */
// Baked Tesla Body
const bakedTeslaBody = new THREE.MeshBasicMaterial({
  map: textures.teslaBodyTexture,
});
const carWindowsMaterial = new THREE.MeshBasicMaterial({
  color: 0x000000,
});

// Baked Tesla Parts
const bakedTeslaParts = new THREE.MeshBasicMaterial({
  map: textures.teslaPartsTexture,
});

//Baked building
const bakedBuilding = new THREE.MeshBasicMaterial({
  map: textures.buildingTexture,
  side: THREE.DoubleSide,
});

// //Baked tanks set
const bakedTanks = new THREE.MeshBasicMaterial({
  map: textures.tankSetTexture,
});

//Baked building parts
const bakedBuildingParts = new THREE.MeshBasicMaterial({
  map: textures.buildingPartsTexture,
});

//Baked wireframe
let bakedWireframe;
bakedWireframe = new THREE.MeshBasicMaterial({
  map: textures.wireframeTexture,
  side: THREE.DoubleSide,
});

//Baked items
const bakedItems = new THREE.MeshBasicMaterial({
  map: textures.itemsTexture,
  side: THREE.DoubleSide,
});

//Baked lines
let bakedLines;
bakedLines = new THREE.MeshBasicMaterial({
  map: textures.linesTexture,
});

//Fence
let fenceMaterial;
fenceMaterial = new THREE.MeshBasicMaterial({
  map: textures.fenceTexture,
});

/**
 * Optional in case for better performance
 */

// if (mediaQuery.matches) {
//   bakedWireframe = new THREE.MeshBasicMaterial({
//     map: textures.wireframeTexture,
//     side: THREE.DoubleSide,
//   });
// } else {
//   bakedWireframe = new THREE.MeshBasicMaterial({
//     color: 0x000000,
//     side: THREE.DoubleSide,
//   });
// }
// if (mediaQuery.matches) {
//   bakedLines = new THREE.MeshBasicMaterial({
//     map: textures.linesTexture,
//   });
// } else {
//   bakedLines = new THREE.MeshBasicMaterial({
//     color: 0x000000,
//   });
// }
// if (mediaQuery.matches) {
//   fenceMaterial = new THREE.MeshBasicMaterial({
//     map: textures.fenceTexture,
//   });
// } else {
//   fenceMaterial = new THREE.MeshBasicMaterial({
//     color: 0x000000,
//   });
// }

// Emission Materials
const whiteLight = new THREE.MeshBasicMaterial({ color: 0xe7effd });
const purpleLight = new THREE.MeshBasicMaterial({ color: 0xfbe9fd });
const blueLight = new THREE.MeshBasicMaterial({ color: 0x97fcfd });
const logoLight = new THREE.MeshBasicMaterial({ color: 0x97fcfd });
const windowLight = new THREE.MeshBasicMaterial({ color: 0xdafefe });
const orangeLight = new THREE.MeshBasicMaterial({ color: 0xfced8d });

/**
 * Models
 */
// Tesla Group
const teslaGroup = new THREE.Group();
scene.add(teslaGroup);

gui
  .add(teslaGroup.position, "x")
  .min(-10)
  .max(10)
  .step(0.05)
  .name("Truck Position X");

// Tesla Body
gltfLoader.load("models/Liz77_teslaBody.glb", (gltf) => {
  gltf.scene.traverse((child) => {
    child.material = bakedTeslaBody;
  });
  teslaGroup.add(gltf.scene);
  // Get car windows
  const carWindows = gltf.scene.children.find(
    (item) => item.name === "CarWindows"
  );
  // Change car windows material
  carWindows.material = carWindowsMaterial;
});

// Tesla Parts
gltfLoader.load("models/Liz77_teslaParts.glb", (gltf) => {
  gltf.scene.traverse((child) => {
    child.material = bakedTeslaParts;
  });
  teslaGroup.add(gltf.scene);
});

// Building
gltfLoader.load("models/Liz77-building.glb", (gltf) => {
  gltf.scene.traverse((child) => {
    child.material = bakedBuilding;
  });
  scene.add(gltf.scene);
});

// Tanks Set
gltfLoader.load("models/Liz77-tanksSet.glb", (gltf) => {
  gltf.scene.traverse((child) => {
    child.material = bakedTanks;
  });
  scene.add(gltf.scene);
});

// Building parts
let popeller;
gltfLoader.load("models/Liz77-buildingParts.glb", (gltf) => {
  gltf.scene.traverse((child) => {
    child.material = bakedBuildingParts;
  });
  // Getting pump popeller for latter animation
  popeller = gltf.scene.children.find((item) => item.name === "Popeller");
  scene.add(gltf.scene);
});

// Wireframe
gltfLoader.load("models/Liz77_wireframe.glb", (gltf) => {
  gltf.scene.traverse((child) => {
    child.material = bakedWireframe;
  });
  scene.add(gltf.scene);
});

// Items
gltfLoader.load("models/Liz77_items.glb", (gltf) => {
  gltf.scene.traverse((child) => {
    child.material = bakedItems;
  });
  scene.add(gltf.scene);
});

// Lines
gltfLoader.load("models/Liz77_lines.glb", (gltf) => {
  gltf.scene.traverse((child) => {
    child.material = bakedLines;
  });
  scene.add(gltf.scene);
});

// Fence
gltfLoader.load("models/Liz77_fence.glb", (gltf) => {
  gltf.scene.traverse((child) => {
    child.material = fenceMaterial;
  });
  scene.add(gltf.scene);
});

// Emissions
gltfLoader.load("models/Liz77-emissions.glb", (gltf) => {
  // white light
  gltf.scene.children.find((item) => item.name === "RoofLight").material =
    whiteLight;
  gltf.scene.children.find((item) => item.name === "RoofLight001").material =
    whiteLight;
  gltf.scene.children.find((item) => item.name === "SignLight").material =
    whiteLight;
  gltf.scene.children.find((item) => item.name === "SignLight001").material =
    whiteLight;

  // purple light
  gltf.scene.children.find((item) => item.name === "PurpleText").material =
    purpleLight;
  gltf.scene.children.find((item) => item.name === "PumpLight").material =
    purpleLight;
  gltf.scene.children.find((item) => item.name === "PumpLight001").material =
    purpleLight;

  // blue light
  gltf.scene.children.find((item) => item.name === "BlueText").material =
    logoLight;
  gltf.scene.children.find((item) => item.name === "PlatformLight").material =
    blueLight;

  // window light
  gltf.scene.children.find((item) => item.name === "WindowLight").material =
    windowLight;
  gltf.scene.children.find((item) => item.name === "WindowLight001").material =
    windowLight;

  // orange light
  gltf.scene.children.find((item) => item.name === "SignLight002").material =
    orangeLight;

  scene.add(gltf.scene);
});

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  stats.update();

  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Update effect composer
  effectComposer.setSize(sizes.width, sizes.height);
});

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  100
);

// Camera initial position
if (mediaQuery.matches) {
  camera.position.set(12, 10, 12);
} else {
  camera.position.set(20, 18, 20);
}

camera.setViewOffset(
  sizes.width,
  sizes.height,
  0.0,
  -100.0,
  sizes.width,
  sizes.height
);

scene.add(camera);

gui
  .add(camera.position, "x")
  .min(-25)
  .max(25)
  .step(0.001)
  .name("Camera Position X");
gui
  .add(camera.position, "y")
  .min(-25)
  .max(25)
  .step(0.001)
  .name("Camera Position Y");
gui
  .add(camera.position, "z")
  .min(-25)
  .max(25)
  .step(0.001)
  .name("Camera Position Z");

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
if (mediaQuery.matches) {
  controls.maxDistance = 20;
} else {
  controls.maxDistance = 35;
}
controls.minDistance = 4;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = sRGBEncoding;

/**
 * Post processing
 */
const effectComposer = new EffectComposer(renderer);
effectComposer.addPass(new RenderPass(scene, camera));

// Adding Bloom Effect
const bloomEffect = new BloomEffect();
bloomEffect.luminanceMaterial.smoothing = 0.2;
effectComposer.addPass(new EffectPass(camera, bloomEffect));
bloomEffect.blurPass.setScale(0.5);

// Bloom Effect Debug
const bloomParams = {
  BlurScale: bloomEffect.blurPass.getScale(),
  Intensity: bloomEffect.getIntensity(),
  Filter: bloomEffect.luminancePass.isEnabled(),
  Threshold: bloomEffect.luminanceMaterial.threshold,
  Smoothing: bloomEffect.luminanceMaterial.smoothing,
  Opacity: bloomEffect.blendMode.opacity.value,
};

const bloomFolder = gui.addFolder("Bloom Effect");

bloomFolder
  .add(bloomParams, "BlurScale")
  .min(0)
  .max(1)
  .step(0.001)
  .onChange((value) => {
    bloomEffect.blurPass.setScale(value);
  });
bloomFolder
  .add(bloomParams, "Intensity")
  .min(0)
  .max(3)
  .step(0.001)
  .onChange((value) => {
    bloomEffect.setIntensity(value);
  });
bloomFolder.add(bloomParams, "Filter").onChange((value) => {
  bloomEffect.luminancePass.setEnabled(value);
});
bloomFolder
  .add(bloomParams, "Threshold")
  .min(0)
  .max(1)
  .step(0.001)
  .onChange((value) => {
    bloomEffect.luminanceMaterial.threshold = value;
  });
bloomFolder
  .add(bloomParams, "Smoothing")
  .min(0)
  .max(1)
  .step(0.001)
  .onChange((value) => {
    bloomEffect.luminanceMaterial.smoothing = value;
  });
bloomFolder
  .add(bloomParams, "Opacity")
  .min(0)
  .max(1)
  .step(0.001)
  .onChange((value) => {
    bloomEffect.blendMode.opacity.value = value;
  });

// Adding God Rays Effect
let sunGeometry = new THREE.SphereBufferGeometry(5, 32, 32);
let sunMaterial = new THREE.MeshBasicMaterial({
  color: 0x030303,
  transparent: true,
  fog: false,
  opacity: 0.02,
});
let sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.position.set(-7, 5, -7);
sun.rotation.y = 45;
scene.add(sun);

const godraysEffect = new GodRaysEffect(camera, sun, {
  density: 0.9,
  decay: 1,
  weight: 0.6,
  exposure: 0.3,
  clampMax: 1,
  samples: 200,
});
godraysEffect.height = 840;
godraysEffect.blurPass.kernelSize = 3;
godraysEffect.blendMode.opacity.value = 0.5;
effectComposer.addPass(new EffectPass(camera, godraysEffect));

// God Rays Effect Debug
const godraysParams = {
  Resolution: godraysEffect.height,
  Blurriness: godraysEffect.blurPass.kernelSize + 1,
  Density: godraysEffect.godRaysMaterial.uniforms.density.value,
  Decay: godraysEffect.godRaysMaterial.uniforms.decay.value,
  Weight: godraysEffect.godRaysMaterial.uniforms.weight.value,
  Exposure: godraysEffect.godRaysMaterial.uniforms.exposure.value,
  ClampMax: godraysEffect.godRaysMaterial.uniforms.clampMax.value,
  Samples: godraysEffect.samples,
  LightOpacity: godraysEffect.blendMode.opacity.value,
  SunOpacity: sunMaterial.opacity,
  Color: new Color().copyLinearToSRGB(sun.material.color).getHex(),
};

const godraysFolder = gui.addFolder("God Rays Effect");

godraysFolder
  .add(godraysParams, "Resolution")
  .min(240)
  .max(1080)
  .step(120)
  .onChange((value) => {
    godraysEffect.height = value;
  });
godraysFolder
  .add(godraysParams, "Blurriness")
  .min(0)
  .max(5)
  .step(1)
  .onChange((value) => {
    godraysEffect.blurPass.kernelSize = value;
  });
godraysFolder
  .add(godraysParams, "Density")
  .min(0)
  .max(1)
  .step(0.001)
  .onChange((value) => {
    godraysEffect.godRaysMaterial.uniforms.density.value = value;
  });
godraysFolder
  .add(godraysParams, "Decay")
  .min(0)
  .max(1)
  .step(0.001)
  .onChange((value) => {
    godraysEffect.godRaysMaterial.uniforms.decay.value = value;
  });
godraysFolder
  .add(godraysParams, "Weight")
  .min(0)
  .max(1)
  .step(0.001)
  .onChange((value) => {
    godraysEffect.godRaysMaterial.uniforms.weight.value = value;
  });
godraysFolder
  .add(godraysParams, "Exposure")
  .min(0)
  .max(1)
  .step(0.001)
  .onChange((value) => {
    godraysEffect.godRaysMaterial.uniforms.exposure.value = value;
  });
godraysFolder
  .add(godraysParams, "ClampMax")
  .min(0)
  .max(1)
  .step(0.001)
  .onChange((value) => {
    godraysEffect.godRaysMaterial.uniforms.clampMax.value = value;
  });
godraysFolder
  .add(godraysParams, "Samples")
  .min(15)
  .max(200)
  .step(1)
  .onChange((value) => {
    godraysEffect.samples = value;
  });
godraysFolder
  .add(godraysParams, "LightOpacity")
  .min(0)
  .max(1)
  .step(0.001)
  .onChange((value) => {
    godraysEffect.blendMode.opacity.value = value;
  });
godraysFolder
  .add(godraysParams, "SunOpacity")
  .min(0)
  .max(1)
  .step(0.001)
  .onChange((value) => {
    sunMaterial.opacity = value;
  });
godraysFolder.addColor(godraysParams, "Color").onChange((value) => {
  sun.material.color.setHex(value).convertSRGBToLinear();
  pointLight.color.setHex(value).convertSRGBToLinear();
});

let areaImage = new Image();
areaImage.src = SMAAEffect.areaImageDataURL;
let searchImage = new Image();
searchImage.src = SMAAEffect.searchImageDataURL;
let smaaEffect = new SMAAEffect(searchImage, areaImage, 1);

effectComposer.addPass(new EffectPass(camera, smaaEffect));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = (popellerRotation) => {
  const elapsedTime = clock.getElapsedTime();

  // Update FPS rate
  stats.begin();

  // Animate pump popeller
  if (popeller) {
    popeller.rotation.y += 0.01;
  }

  // Animate Tesla
  teslaGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.05;

  // Update controls
  controls.update();

  // Render
  effectComposer.render();

  stats.end();

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
