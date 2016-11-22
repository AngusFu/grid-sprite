import { drawGrid } from './drawGrid';

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

  let MAX = Math.floor(600 / width);
  let beg = Math.ceil(len / MAX);
  let end = Math.ceil(Math.sqrt(len));

  let minSize = 9e9;

  let bestH = 0;
  let bestW = 0;

  for (let h = beg; h <= end; h++) {
    let w = Math.ceil(len / h);
    let size = w * h;

    if (size < minSize) {
      minSize = size;
      bestW = w;
      bestH = h;
    }
    if (size == len) {
      break;
    }
  }
  
  return {
    width: width * bestW,
    height: height * bestH,
    gridSize: { width, height }
  };
};

const draw = function (context, imgs) {
  let { width, height, gridSize } = calcCanvasSize(imgs);

  let grid_w = gridSize['width'];
  let grid_h = gridSize['height'];

  // 列数
  let cols = width / grid_w;
  let canvas = context.canvas;
  context.clearRect(0, 0, canvas.width, canvas.height);

  canvas.width = width;
  canvas.height = height;
  
  drawGrid(context, '#ccc', grid_w, grid_h);

  imgs.forEach((img, i) => {
    let img_w = img.width;
    let img_h = img.height;

    let left = grid_w * (i % cols) + (grid_w - img_w) / 2;
    let top  = grid_h * Math.floor(i / cols)+ (grid_h - img_h) / 2;
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

