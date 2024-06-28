const RESOLUTION_SCALE = 2;

function takeScreenshot() {
  const video = document.querySelector("video");
  const canvas = document.createElement("canvas");

  let vWidth = video.clientWidth * RESOLUTION_SCALE;
  let vHeight = video.clientHeight * RESOLUTION_SCALE;

  canvas.width = vWidth;
  canvas.height = vHeight;

  const element = document.querySelector("video");
  const style = window.getComputedStyle(element);
  const top = style.getPropertyValue("top");

  canvas.getContext("2d").drawImage(video, 0, parseFloat(top), vWidth, vHeight);

  const imgData = document.querySelector("a-scene").components.screenshot.getCanvas("perspective");

  canvas.getContext("2d").drawImage(imgData, 0, 0, vWidth, vHeight);

  downloadScreenshot(canvas);
}

function downloadScreenshot(canvas) {
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = imageName();
  a.click();
}

function imageName() {
  return `demo_${getUUID()}.png`;
}

function getUUID() {
  const uuid = window.crypto.randomUUID();
  return uuid.split("-")[0] ?? uuid;
}

// function formatDate(date) {
//   return new Intl.DateTimeFormat("vi-VN", {
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//     hour: "2-digit",
//     minute: "2-digit",
//     second: "2-digit",
//   }).format(date);
// }
