const width = window.innerWidth > 0 ? window.innerWidth : screen.width;
const height = window.innerHeight > 0 ? window.innerHeight : screen.height;

const renderer = new THREE.WebGLRenderer({
  alpha: true,
});

renderer.setClearColor(new THREE.Color("lightgrey"), 0);
// renderer.setPixelRatio( 2 );
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.position = "absolute";
renderer.domElement.style.top = "0px";
renderer.domElement.style.left = "0px";
window.addEventListener("DOMContentLoaded", () => {
  document.body.appendChild(renderer.domElement);
});

// array of functions for the rendering loop
const onRenderFcts = [];
let arToolkitContext, arMarkerControls, markerGroup;

// init scene and camera
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.Camera();
scene.add(camera);

markerGroup = new THREE.Group();
scene.add(markerGroup);

const artoolkitProfile = new THREEx.ArToolkitProfile();
artoolkitProfile.sourceWebcam();

const arToolkitSource = new THREEx.ArToolkitSource(artoolkitProfile.sourceParameters);

arToolkitSource.init(() => {
  arToolkitSource.domElement.addEventListener("canplay", () => {
    console.log(
      "canplay",
      "actual source dimensions",
      arToolkitSource.domElement.videoWidth,
      arToolkitSource.domElement.videoHeight
    );

    initARContext();
  });

  window.arToolkitSource = arToolkitSource;
  onResize();
});

// handle resize
window.addEventListener("resize", function () {
  onResize();
});

function onResize() {
  arToolkitSource.onResizeElement();
  arToolkitSource.copyElementSizeTo(renderer.domElement);
  if (window.arToolkitContext.arController !== null) {
    arToolkitSource.copyElementSizeTo(window.arToolkitContext.arController.canvas);
  }
}

function initARContext() {
  console.log("initARContext()");

  // CONTEXT
  arToolkitContext = new THREEx.ArToolkitContext(artoolkitProfile.contextParameters);

  arToolkitContext.init(() => {
    camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());

    arToolkitContext.arController.orientation = getSourceOrientation();
    arToolkitContext.arController.options.orientation = getSourceOrientation();

    console.log("arToolkitContext", arToolkitContext);
    window.arToolkitContext = arToolkitContext;
  });

  // MARKER
  arMarkerControls = new THREEx.ArMarkerControls(arToolkitContext, markerGroup, {
    type: "pattern",
    patternUrl: THREEx.ArToolkitContext.baseURL + "/static/marker/patt.hiro",
  });

  console.log("ArMarkerControls", arMarkerControls);
  window.arMarkerControls = arMarkerControls;
}

function getSourceOrientation() {
  if (!arToolkitSource) {
    return null;
  }

  console.log(
    "actual source dimensions",
    arToolkitSource.domElement.videoWidth,
    arToolkitSource.domElement.videoHeight
  );

  if (arToolkitSource.domElement.videoWidth > arToolkitSource.domElement.videoHeight) {
    console.log("source orientation", "landscape");
    return "landscape";
  } else {
    console.log("source orientation", "portrait");
    return "portrait";
  }
}

// update artoolkit on every frame
onRenderFcts.push(function () {
  if (!arToolkitContext || !arToolkitSource || !arToolkitSource.ready) {
    return;
  }

  arToolkitContext.update(arToolkitSource.domElement);
});

var markerScene = new THREE.Scene();
markerGroup.add(markerScene);

var mesh = new THREE.AxesHelper();
markerScene.add(mesh);

// add a torus knot
var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshNormalMaterial({
  transparent: true,
  opacity: 0.5,
  side: THREE.DoubleSide,
});
var mesh = new THREE.Mesh(geometry, material);
mesh.position.y = geometry.parameters.height / 2;
markerScene.add(mesh);

var geometry = new THREE.TorusKnotGeometry(0.3, 0.1, 64, 16);
var material = new THREE.MeshNormalMaterial();
var mesh = new THREE.Mesh(geometry, material);
mesh.position.y = 0.5;
markerScene.add(mesh);

onRenderFcts.push(function (delta) {
  mesh.rotation.x += delta * Math.PI;
});

var stats = new Stats();
document.body.appendChild(stats.dom);
// render the scene
onRenderFcts.push(function () {
  renderer.render(scene, camera);
  stats.update();
});

// run the rendering loop
var lastTimeMsec = null;
requestAnimationFrame(function animate(nowMsec) {
  // keep looping
  requestAnimationFrame(animate);
  // measure time
  lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60;
  var deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
  lastTimeMsec = nowMsec;
  // call each update function
  onRenderFcts.forEach(function (onRenderFct) {
    onRenderFct(deltaMsec / 1000, nowMsec / 1000);
  });
});

function takeScreenshot() {
  var w = window.open("", "");
  w.document.title = "Screenshot";
  renderer.render(scene, camera);
  var doubleImageCanvas = document.getElementById("doubleImage");
  var context = doubleImageCanvas.getContext("2d");
  var sources = {
    firstImage: renderer.domElement.toDataURL("image/png"),
    secondImage: arToolkitContext.arController.canvas.toDataURL("image/png"),
  };
  var img = new Image();

  loadImages(sources, function (images) {
    context.drawImage(images.secondImage, 0, 0);
    context.drawImage(images.firstImage, 0, 0);
    img.src = doubleImageCanvas.toDataURL("image/png");
    w.document.body.appendChild(img);
    const a = document.createElement("a");
    renderer.render(scene, camera);
    a.href = doubleImageCanvas.toDataURL();
    a.download = "canvas.png";
    a.click();
  });

  // renderer.domElement.toBlob(
  //   function (blob) {
  //     var a = document.createElement("a");
  //     var url = img.src.replace(/^data:image\/[^;]+/, "data:application/octet-stream");
  //     a.href = url;
  //     a.download = "canvas.png";
  //     a.click();
  //   },
  //   "image/png",
  //   1.0
  // );
}

function loadImages(sources, callback) {
  console.log("🚀 ~ loadImages ~ sources:", sources);
  var images = {};
  var loadedImages = 0;
  var numImages = 0;
  // get num of sources
  for (var src in sources) {
    numImages++;
  }
  for (var src in sources) {
    images[src] = new Image();
    images[src].onload = function () {
      if (++loadedImages >= numImages) {
        callback(images);
      }
    };
    images[src].src = sources[src];
  }
}
