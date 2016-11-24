// @see https://www.cnblogs.com/index-html/p/canvas_data_compress.html
// 计算出最合适的图片布局
// 尽可能省空间
// 单个图片最大宽度 800px
export default function(imgs, gridSize) {
  let { width, height } = gridSize;
  let len = imgs.length;

  let MAX = Math.floor(800 / width);
  let beg = Math.ceil(len / MAX);
  let end = Math.ceil(Math.sqrt(len));
  
  let minSize = 9e9;

  // 默认
  let bestH = Math.ceil(len / MAX);
  let bestW = MAX;

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
    height: height * bestH
  };
}
