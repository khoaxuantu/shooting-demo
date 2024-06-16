function takeScreenshot() {
  const w = window.open("", "");
  w.document.title = "Saved_picture";
  const img = new Image();
  const doubleImgCanvas= document.getElementById("doubleImage");
  const context = doubleImgCanvas.getContext("2d");
  const source = {
    first_image: renderrer.domElement.toDataURL("image/png"),
    second_image: arToolkitContext.arController.canvas.toDataURL("image/png"),
  };

  loadImages(source, function(images) {
    context.drawImage(images.second_image, 0, 0);
    context.drawImage(images.first_image, 0, 0);
    img.src = doubleImgCanvas.toDataURL("image/png");
    w.document.body.appendChild(img);
  });
}

function loadImages(sources, callback) {
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
