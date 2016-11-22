// import 'babel-polyfill';

const calcGridSize = (imgs) => {
  return imgs.reduce((accu, img) => {
    accu['width']  = img['width']  > accu['width']  ? img['width']  : accu['width'];
    accu['height'] = img['height'] > accu['height'] ? img['height'] : accu['height'];
    return accu;
  }, {width:0, height: 0});
};

// @see https://www.cnblogs.com/index-html/p/canvas_data_compress.html
const calcCanvasSize = (imgs) => {
  let len = imgs.length;
  let { width, height } = calcGridSize(imgs);
  let horizonPx = width * len;

  let MAX = 500;
  let beg = Math.ceil(horizonPx / MAX);
  let end = Math.ceil(Math.sqrt(horizonPx));

  let minSize = 9e9;

  let bestW = 0;

  for (let h = beg; h <= end; h++) {
    let w = Math.ceil(horizonPx / h);
    let size = w * h;

    if (size < minSize) {
      minSize = size;
      bestW = w;
    }
    if (size == horizonPx) {
      break;
    }
  }

  return {
    width: bestW,
    height: height * Math.ceil(bestW / width),
    gridSize: { width, height }
  };
};

const drawGuideLines = function (context, rows, cols) {
  let canvas = context.canvas;
  let width  = canvas.width;
  let height = canvas.height;
  let stepX  = width / cols;
  let stepY  = height / rows;

  // vertical
  for (let i = 0; i <= rows; i ++) {
    context.save();
    context.lineWidth = .5;
    context.beginPath();
    context.moveTo(i * stepX + .5, 0);
    context.lineTo(i * stepX + .5, height);
    context.stroke();
    context.restore();
  }
  // horizontal
  for (let i = 0; i <= cols; i ++) {
    context.save();
    context.lineWidth = .5;
    context.beginPath();
    context.moveTo(0, i * stepY + .5);
    context.lineTo(width, i * stepY + .5);
    context.stroke();
    context.restore();
  }
};

const draw = function (context, imgs) {
  let {width, height, gridSize} = calcCanvasSize(imgs);

  let grid_w = gridSize['width'];
  let grid_h = gridSize['height'];

  // images per line
  let cols = width / grid_w;
  let rows = height / grid_h;

  let canvas = context.canvas;
  context.clearRect(0, 0, canvas.width, canvas.height);

  canvas.width = width;
  canvas.height = height;
  
  drawGuideLines(context, rows, cols);

  imgs.forEach((img, i) => {
    let img_w = img.width;
    let img_h = img.height;

    let left = img_h * (i % cols) + (grid_w - img_w) / 2;
    let top  = img_h * Math.floor(i / cols)+ (grid_h - img_h) / 2;

    context.drawImage(img, left, top);
  });
};

const loadImage$ = function (url) {
  return new Promise(function (resolve) {
    let img = new Image();
    img.src = url;
    img.onload = function () {
      resolve(img);
    };
  });
};

const readFile$ = function (file) {
  return new Promise(function (resolve) {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function(e) {
      resolve(loadImage$(e.target.result));
    };
  });
};

const context = document.getElementById('canvas').getContext('2d');

const selectFile  = document.getElementById('jsSelectFile');
const hiddenInput = document.getElementById('jsFileInput');

selectFile.addEventListener('click', () => {
  hiddenInput.click();
});

hiddenInput.addEventListener('change', (e) => {
  let files = e.target.files;
  let promises = [];

  for (let i = 0; i < files.length; i++) {
    promises.push(readFile$(files[i]));
  }
  Promise.all(promises).then((imgs) => {
    draw(context, imgs);
  });
});

