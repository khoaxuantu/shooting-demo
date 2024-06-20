const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  precision: "mediump",
});

const clock = new THREE.Clock();

const mixers = [];

renderer.setPixelRatio(window.devicePixelRatio);

renderer.setClearColor(new THREE.Color("lightgrey"), 0);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.position = "absolute";
renderer.domElement.style.top = "0px";
renderer.domElement.style.left = "0px";
document.body.appendChild(renderer.domElement);

// init scene and camera
const scene = new THREE.Scene();

/**
 * Initialize a basic camera
 */

const camera = new THREE.Camera();
const light = new THREE.AmbientLight(0xffffff);
scene.add(camera);
scene.add(light);

/**
 * Handle arToolkitSource
 */
const arToolkitSource = new THREEx.ArToolkitSource({
  sourceType: "webcam",
  sourceWidth: 1280,
  sourceHeight: 960,
  displayWidth: 1280,
  displayHeight: 960,
});

arToolkitSource.init(function onReady() {
  // use a resize to fullscreen mobile devices
  setTimeout(function () {
    onResize();
  }, 1000);
});

// handle resize
window.addEventListener("resize", function () {
  onResize();
});

// listener for end loading of NFT marker
window.addEventListener("arjs-nft-loaded", function (ev) {
  console.log(ev);
});

function onResize() {
  arToolkitSource.onResizeElement();
  arToolkitSource.copyElementSizeTo(renderer.domElement);
  if (arToolkitContext.arController !== null) {
    arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
  }
}

/**
 * Initialize arToolkitContext
 */

const arToolkitContext = new THREEx.ArToolkitContext(
  {
    detectionMode: "mono",
    canvasWidth: "100dvw",
    canvasHeight: "90dvh",
  },
  {
    sourceWidth: 1280,
    sourceHeight: 960,
  }
);

arToolkitContext.init(function onCompleted() {
  // copy projection matrix to camera
  camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
});

/**
 * Create a arMarkerControls
 */
const markerControls = new THREEx.ArMarkerControls(arToolkitContext, camera, {
  type: "nft",
  descriptorsUrl: "./static/nft/pinball",
  changeMatrixMode: "cameraTransformMatrix",
});

scene.visible = false;

const root = new THREE.Object3D();
scene.add(root);

/**
 * Add an object in a scheme
 */
const threeGLTFLoader = new THREE.GLTFLoader();
let model;

threeGLTFLoader.load("./static/Flamingo.glb", function (gltf) {
  model = gltf.scene.children[0];
  model.name = "TODO";
  const clips = gltf.animations;

  const mixer = new THREE.AnimationMixer(gltf.scene);
  mixers.push(mixer);
  const clip = THREE.AnimationClip.findByName(clips, "flamingo_flyA_");
  const action = mixer.clipAction(clip);
  action.play();

  root.matrixAutoUpdate = false;
  root.add(model);

  model.position.z = -100;

  window.addEventListener("arjs-nft-init-data", function (nft) {
    console.log(nft);
    var msg = nft.detail;
    model.position.y = ((msg.height / msg.dpi) * 2.54 * 10) / 2.0; //y axis?
    model.position.x = ((msg.width / msg.dpi) * 2.54 * 10) / 2.0; //x axis?
  });

  const animate = function () {
    requestAnimationFrame(animate);

    if (mixers.length > 0) {
      for (var i = 0; i < mixers.length; i++) {
        mixers[i].update(clock.getDelta());
      }
    }

    if (!arToolkitSource.ready) {
      return;
    }

    arToolkitContext.update(arToolkitSource.domElement);

    // update scene.visible if the marker is seen
    scene.visible = camera.visible;

    renderer.render(scene, camera);
  };

  requestAnimationFrame(animate);
});
