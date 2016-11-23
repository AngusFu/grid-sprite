import drawGrid from './drawGrid';
import calcCanvasSize from './computeCanvasSize';

/**
 * 根据图片最大宽高 
 * 自动计算网格大小
 */
const calcGridSize = (imgs) => {
  return imgs.reduce((accu, img) => {
    accu['width']  = img['width']  > accu['width']  ? img['width']  : accu['width'];
    accu['height'] = img['height'] > accu['height'] ? img['height'] : accu['height'];
    return accu;
  }, {width:0, height: 0});
};

/**
 * 绘制工作
 * showGuidline: 是否绘制辅助线
 */
const draw = function (context, canvasSize, gridSize, imgs, showGuidline) {
  let { width, height } = canvasSize;
  let grid_w = gridSize['width'];
  let grid_h = gridSize['height'];

  // 列数
  let cols = width / grid_w;
  let canvas = context.canvas;
  context.clearRect(0, 0, canvas.width, canvas.height);

  canvas.width = width;
  canvas.height = height;
  
  showGuidline && drawGrid(context, '#ccc', grid_w, grid_h);

  imgs.forEach((img, i) => {
    let img_w = img.width;
    let img_h = img.height;

    let left = grid_w * (i % cols) + (grid_w - img_w) / 2;
    let top  = grid_h * Math.floor(i / cols)+ (grid_h - img_h) / 2;
    context.drawImage(img, left, top);
  });
};

/**
 * 生成下载链接
 */
const generateDownload = (context) => {
  let dataURL  = context.canvas.toDataURL('image/png', 1);
  let download = document.getElementById('download');
  
  if (download) {
    download.remove();
  }
  
  download = document.createElement('a');
  
  download.id = 'download';
  download.href = dataURL;
  download.download = +new Date;
  download.textContent = '点击此处下载';
  
  return download;
};

/**
 * 加载图片
 */
const loadImagePromise = function (file) {
  let url = URL.createObjectURL(file);
  return new Promise(function (resolve) {
    let img = new Image();
    img.src = url;
    img.onload = function () {
      resolve(img);
    };
  });
};

const $           = (id) => document.getElementById(id);
const context     = $('canvas').getContext('2d');
const downloadCon = $('jsDownload');
const selectFile  = $('jsSelectFile');
const hiddenInput = $('jsFileInput');
const offlineCxt  = document.createElement('canvas').getContext('2d');

const gridXInput  = $('gridX');
const gridYInput  = $('gridY');

let images = null;
let gridSize = {};

/**
 * 自动计算网格大小
 */
const updateGridInfo = () => {
  gridSize = calcGridSize(images);
};

/**
 * 具体绘制工作
 */
const updateCanvas = () => {
  let cvsSize  = calcCanvasSize(images, gridSize);

  gridXInput.value = gridSize['width'];
  gridYInput.value = gridSize['height'];

  draw(context,    cvsSize, gridSize, images, true);
  draw(offlineCxt, cvsSize, gridSize, images, false);
  downloadCon.appendChild(generateDownload(offlineCxt));
};

/**
 * 手动设定网格
 */
gridXInput.addEventListener('change', function() {
  gridSize['width'] = +this.value;
  updateCanvas();
});
gridYInput.addEventListener('change', function() {
  gridSize['height'] = +this.value;
  updateCanvas();
});

/**
 * 选择文件相关
 */
selectFile.addEventListener('click', () => {
  hiddenInput.click();
});

hiddenInput.addEventListener('change', (e) => {
  let files = e.target.files;

  if (!files.length) {
    return;
  }

  let promises = Array.from(files).map(loadImagePromise);
  
  Promise.all(promises).then((imgs) => {
    images = imgs;
    updateGridInfo();
    updateCanvas();
  });
});

