import drawGrid from './drawGrid';
import calcCanvasSize from './computeCanvasSize';
import Prism from 'prismjs';

import './app.css';
import '../node_modules/prismjs/themes/prism.css';

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
 * 计算每张图片的位置
 */
const transformImagesToPos = function (context, canvasSize, gridSize, alignCenter, imgs) {
  let { width } = canvasSize;
  let grid_w = gridSize['width'];
  let grid_h = gridSize['height'];

  // 列数
  let cols = width / grid_w;
  
  return imgs.map((img, i) => {
    let img_w = img.width;
    let img_h = img.height;
    let x = grid_w * (i % cols);
    let y = grid_h * Math.floor(i / cols);
    let left = x + (grid_w - img_w) / 2;
    let top  = y + (grid_h - img_h) / 2;

    return {
      img,
      left: alignCenter ? left : x,
      top: alignCenter ? top : y,
      x: -x,
      y: -y
    };
  });
};


/**
 * 绘制工作
 * showGuidline: 是否绘制辅助线
 */
const draw = function (context, canvasSize, gridSize, imgsInfo, showGuidline) {
  let { width, height } = canvasSize;
  let grid_w = gridSize['width'];
  let grid_h = gridSize['height'];

  let canvas = context.canvas;
  context.clearRect(0, 0, canvas.width, canvas.height);
  canvas.width = width;
  canvas.height = height;
  showGuidline && drawGrid(context, '#ccc', grid_w, grid_h);

  imgsInfo.forEach((imgInfo) => {
    let {img, left, top} = imgInfo;
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
  download.textContent = '点击此处下载图片';
  
  return download;
};


/**
 * 复制
 * see https://zhuanlan.zhihu.com/p/23920249
 */
const copy = function (element) {
  let range = document.createRange();
  range.selectNode(element);

  let selection = window.getSelection();
  if(selection.rangeCount > 0) selection.removeAllRanges();
  selection.addRange(range); 
  document.execCommand('copy');
  selection.removeAllRanges();
};


/**
 * 生成 CSS 
 */
const generateCSS = function (imgInfo) {
  let {img, x, y} = imgInfo;
  return `.ico-${img.name} {
    background-position: ${x}${x === 0 ? '' : 'px'} ${y}${y === 0 ? '' : 'px'};
}
`;
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
      img['name'] = file.name.replace(/\.png|jpg$/, '');
      resolve([img, url]);
    };
  });
};


//--------------------------------------------------------------------------
// dirty works below

const $           = (id) => document.getElementById(id);
const context     = $('canvas').getContext('2d');
const downloadCon = $('jsDownload');
const selectFile  = $('jsSelectFile');
const hiddenInput = $('jsFileInput');
const alignCenter = $('alignCenter');
const codeCopy    = $('jsCopy');
const cssOutput   = $('jsOutput');
const offlineCxt  = document.createElement('canvas').getContext('2d');

const gridXInput  = $('gridX');
const gridYInput  = $('gridY');

let IMAGES = null;
let ALIGN_CENTER  = true;
let GRID_SIZE = {};

/**
 * 自动计算网格大小
 */
const updateGridSize = () => {
  GRID_SIZE = calcGridSize(IMAGES);
};

/**
 * 具体绘制工作
 */
const updateCanvas = () => {
  let cvsSize  = calcCanvasSize(IMAGES, GRID_SIZE);

  gridXInput.value = GRID_SIZE['width'];
  gridYInput.value = GRID_SIZE['height'];

  let imgsInfo = transformImagesToPos(context, cvsSize, GRID_SIZE, ALIGN_CENTER, IMAGES);

  draw(context,    cvsSize, GRID_SIZE, imgsInfo, true);
  draw(offlineCxt, cvsSize, GRID_SIZE, imgsInfo, false);

  let cssText = imgsInfo.reduce((accu, next) => accu + generateCSS(next), '');
  cssOutput.innerHTML = `<code class="language-css">${cssText}</code>`;
  Prism.highlightAll();

  downloadCon.appendChild(generateDownload(offlineCxt));
};

/**
 * 手动设定网格
 */
gridXInput.addEventListener('change', function() {
  GRID_SIZE['width'] = +this.value;
  updateCanvas();
});
gridYInput.addEventListener('change', function() {
  GRID_SIZE['height'] = +this.value;
  updateCanvas();
});


/**
 * 左上角/居中
 */
alignCenter.addEventListener('change', function() {
  ALIGN_CENTER = this.checked;
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
    IMAGES = imgs.map(a => a[0]);
    updateGridSize();
    updateCanvas();
    // revoke URL
    imgs.forEach(a => URL.revokeObjectURL(a[1]));
  });
});

codeCopy.addEventListener('click', function () {
  copy(cssOutput);
});
