function takeScreenshot() {
  var w = window.open("", "");
  w.document.title = "Screenshot";
  var img = new Image();
  renderer.render(scene, camera);
  var doubleImageCanvas = document.getElementById("doubleImage");
  var context = doubleImageCanvas.getContext("2d");
  var sources = {
    firstImage: renderer.domElement.toDataURL("image/png"),
    secondImage: arToolkitContext.arController.canvas.toDataURL("image/png"),
  };

  loadImages(sources, function (images) {
    context.drawImage(images.secondImage, 0, 0);
    context.drawImage(images.firstImage, 0, 0);
    img.src = doubleImageCanvas.toDataURL("image/png");
    w.document.body.appendChild(img);
  });

  // renderer.render(scene, camera);
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
