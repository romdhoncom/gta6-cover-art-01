// Sample photos for Sunset Cover Studio, each drawn in code on an offscreen
// canvas. No downloaded images: every sky, sea, building and palm below is a
// canvas shape. Each function paints one sample into the canvas it is given
// and returns it, so the app can use it as the cover photo.

function paintBeachSunset(ctx, W, H) {
  // Sky: deep orange at the horizon to purple at the top.
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.62);
  sky.addColorStop(0, '#3b1d5e');
  sky.addColorStop(0.45, '#c2437a');
  sky.addColorStop(1, '#ff9a3c');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.62);
  // Sun with a few cut lines, low over the sea.
  ctx.fillStyle = '#ffd23e';
  ctx.beginPath();
  ctx.arc(W * 0.7, H * 0.46, H * 0.13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ff9a3c';
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(W * 0.56, H * (0.42 + i * 0.045), H * 0.28, H * 0.01);
  }
  // Sea: dark band with faint light streaks.
  ctx.fillStyle = '#1d2f57';
  ctx.fillRect(0, H * 0.62, W, H * 0.16);
  ctx.fillStyle = 'rgba(255,210,62,0.35)';
  for (let i = 0; i < 5; i++) {
    const y = H * (0.65 + i * 0.022);
    ctx.fillRect(W * (0.6 + (i % 2) * 0.04), y, W * (0.16 - i * 0.012), H * 0.005);
  }
  // Sand.
  ctx.fillStyle = '#e8b06a';
  ctx.fillRect(0, H * 0.78, W, H * 0.22);
  ctx.fillStyle = '#c98d4e';
  ctx.beginPath();
  ctx.ellipse(W * 0.3, H * 0.9, W * 0.3, H * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  // Palm silhouette on the left.
  paintPalm(ctx, W * 0.12, H * 0.82, H * 0.34, '#241536');
  // Low sports-car silhouette on the sand: a long low body, a sloped
  // cabin, and two wheels.
  ctx.fillStyle = '#1b1035';
  ctx.beginPath();
  ctx.moveTo(W * 0.54, H * 0.885);
  ctx.lineTo(W * 0.57, H * 0.875);
  ctx.lineTo(W * 0.62, H * 0.845);
  ctx.lineTo(W * 0.74, H * 0.845);
  ctx.lineTo(W * 0.79, H * 0.872);
  ctx.lineTo(W * 0.84, H * 0.878);
  ctx.lineTo(W * 0.84, H * 0.9);
  ctx.lineTo(W * 0.54, H * 0.9);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(W * 0.61, H * 0.9, H * 0.022, 0, Math.PI * 2);
  ctx.arc(W * 0.78, H * 0.9, H * 0.022, 0, Math.PI * 2);
  ctx.fill();
  return ctx.canvas;
}

function paintCityDusk(ctx, W, H) {
  // Dusk sky: violet to ember.
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#1c1440');
  sky.addColorStop(0.6, '#5e2a63');
  sky.addColorStop(1, '#e2725b');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  // Moon.
  ctx.fillStyle = '#f7e08b';
  ctx.beginPath();
  ctx.arc(W * 0.8, H * 0.16, H * 0.06, 0, Math.PI * 2);
  ctx.fill();
  // Back row of towers, darker and further away.
  ctx.fillStyle = '#2c2140';
  const back = [[0.02, 0.34, 0.16, 0.55], [0.2, 0.26, 0.14, 0.63], [0.38, 0.4, 0.18, 0.49], [0.6, 0.3, 0.16, 0.59], [0.78, 0.38, 0.2, 0.51]];
  for (const [x, y, w, h] of back) ctx.fillRect(W * x, H * y, W * w, H * h);
  // Front row with lit windows.
  ctx.fillStyle = '#17102a';
  const front = [[0.06, 0.5, 0.2, 0.5], [0.3, 0.42, 0.18, 0.58], [0.52, 0.55, 0.2, 0.45], [0.74, 0.46, 0.2, 0.54]];
  for (const [x, y, w, h] of front) ctx.fillRect(W * x, H * y, W * w, H * h);
  ctx.fillStyle = '#ffd23e';
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 12; c++) {
      if ((r * 7 + c * 3) % 4 === 0) {
        ctx.fillRect(W * (0.08 + c * 0.075), H * (0.47 + r * 0.055), W * 0.028, H * 0.028);
      }
    }
  }
  // Street with a warm glow.
  ctx.fillStyle = '#241a33';
  ctx.fillRect(0, H * 0.88, W, H * 0.12);
  ctx.fillStyle = 'rgba(255,210,62,0.75)';
  ctx.fillRect(W * 0.1, H * 0.94, W * 0.8, H * 0.012);
  return ctx.canvas;
}

function paintMountainRoad(ctx, W, H) {
  // Morning sky.
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#274b73');
  sky.addColorStop(0.55, '#e08a4c');
  sky.addColorStop(1, '#f2c078');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  // Low sun.
  ctx.fillStyle = '#fff3b0';
  ctx.beginPath();
  ctx.arc(W * 0.5, H * 0.42, H * 0.11, 0, Math.PI * 2);
  ctx.fill();
  // Far mountains.
  ctx.fillStyle = '#5d4a6b';
  ctx.beginPath();
  ctx.moveTo(0, H * 0.62);
  ctx.lineTo(W * 0.22, H * 0.3);
  ctx.lineTo(W * 0.42, H * 0.62);
  ctx.lineTo(W * 0.62, H * 0.34);
  ctx.lineTo(W, H * 0.62);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();
  // Near hills.
  ctx.fillStyle = '#3a2f4d';
  ctx.beginPath();
  ctx.moveTo(0, H * 0.72);
  ctx.lineTo(W * 0.3, H * 0.55);
  ctx.lineTo(W * 0.6, H * 0.72);
  ctx.lineTo(W, H * 0.6);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();
  // Road winding down the middle.
  ctx.fillStyle = '#221a30';
  ctx.beginPath();
  ctx.moveTo(W * 0.46, H * 0.72);
  ctx.quadraticCurveTo(W * 0.52, H * 0.85, W * 0.42, H);
  ctx.lineTo(W * 0.6, H);
  ctx.quadraticCurveTo(W * 0.62, H * 0.85, W * 0.56, H * 0.72);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffd23e';
  ctx.fillRect(W * 0.495, H * 0.78, W * 0.012, H * 0.05);
  ctx.fillRect(W * 0.49, H * 0.88, W * 0.014, H * 0.06);
  // Pine silhouettes.
  for (const [x, s] of [[0.1, 0.16], [0.18, 0.12], [0.86, 0.15], [0.93, 0.11]]) {
    paintPine(ctx, W * x, H * 0.86, H * s, '#1b1430');
  }
  return ctx.canvas;
}

// A palm silhouette: a curved trunk with six fronds. x, y is the base.
function paintPalm(ctx, x, y, h, color) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(3, h * 0.03);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + h * 0.06, y - h * 0.55, x - h * 0.05, y - h * 0.95);
  ctx.stroke();
  const topX = x - h * 0.05;
  const topY = y - h * 0.95;
  ctx.lineWidth = Math.max(2, h * 0.018);
  for (let i = 0; i < 6; i++) {
    const a = (-0.15 - i * 0.32) * Math.PI;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(
      topX + Math.cos(a) * h * 0.22, topY + Math.sin(a) * h * 0.22 - h * 0.06,
      topX + Math.cos(a) * h * 0.36, topY + Math.sin(a) * h * 0.3 + h * 0.08,
    );
    ctx.stroke();
  }
}

// A pine silhouette: three stacked triangles on a trunk.
function paintPine(ctx, x, y, h, color) {
  ctx.fillStyle = color;
  for (let i = 0; i < 3; i++) {
    const w = h * (0.34 - i * 0.08);
    const top = y - h + i * h * 0.26;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x - w / 2, top + h * 0.34);
    ctx.lineTo(x + w / 2, top + h * 0.34);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillRect(x - h * 0.02, y - h * 0.06, h * 0.04, h * 0.08);
}

// The sample catalogue the app offers. Each entry paints itself.
const SAMPLES = {
  beach: { name: 'Beach sunset', paint: paintBeachSunset },
  city: { name: 'City dusk', paint: paintCityDusk },
  mountain: { name: 'Mountain road', paint: paintMountainRoad },
};

function makeSampleCanvas(key, W, H) {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  SAMPLES[key].paint(ctx, W, H);
  return canvas;
}
