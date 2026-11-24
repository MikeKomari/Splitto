/**
 * Image clean-up before OCR. Pure functions over raw RGBA pixels so they run
 * the same in the browser (canvas ImageData) and in Node tests.
 *
 * Why: phone photos of thermal receipts have uneven lighting, shadows and
 * low contrast. Tesseract is trained on clean black-on-white text, so we
 * convert to grayscale and apply an adaptive (local) threshold. On the sample
 * receipts this is the single biggest accuracy lever.
 */

export type RawImage = {
  data: Uint8ClampedArray | Uint8Array;
  width: number;
  height: number;
};

/** Luma grayscale, one byte per pixel. */
export function toGray(img: RawImage): Uint8Array {
  const { data, width, height } = img;
  const out = new Uint8Array(width * height);
  for (let i = 0, p = 0; p < out.length; i += 4, p++) {
    out[p] = (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8;
  }
  return out;
}

/**
 * Bradley–Roth adaptive threshold using an integral image (O(n)).
 * A pixel becomes black when it is `t` percent darker than the mean of its
 * neighbourhood, which cancels out shadows and gradients across the paper.
 */
export function adaptiveThreshold(
  gray: Uint8Array,
  width: number,
  height: number,
  { windowRatio = 1 / 24, t = 0.15 } = {}
): Uint8Array {
  const integral = new Float64Array((width + 1) * (height + 1));
  for (let y = 1; y <= height; y++) {
    let rowSum = 0;
    for (let x = 1; x <= width; x++) {
      rowSum += gray[(y - 1) * width + (x - 1)];
      integral[y * (width + 1) + x] = integral[(y - 1) * (width + 1) + x] + rowSum;
    }
  }
  const half = Math.max(4, Math.floor((Math.max(width, height) * windowRatio) / 2));
  const out = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    const y1 = Math.max(0, y - half);
    const y2 = Math.min(height - 1, y + half);
    for (let x = 0; x < width; x++) {
      const x1 = Math.max(0, x - half);
      const x2 = Math.min(width - 1, x + half);
      const count = (x2 - x1 + 1) * (y2 - y1 + 1);
      const sum =
        integral[(y2 + 1) * (width + 1) + (x2 + 1)] -
        integral[y1 * (width + 1) + (x2 + 1)] -
        integral[(y2 + 1) * (width + 1) + x1] +
        integral[y1 * (width + 1) + x1];
      out[y * width + x] = gray[y * width + x] * count <= sum * (1 - t) ? 0 : 255;
    }
  }
  return out;
}

/** Expand a 1-channel buffer back to RGBA (what canvas / encoders expect). */
export function grayToRgba(gray: Uint8Array): Uint8ClampedArray {
  const out = new Uint8ClampedArray(gray.length * 4);
  for (let p = 0, i = 0; p < gray.length; p++, i += 4) {
    out[i] = out[i + 1] = out[i + 2] = gray[p];
    out[i + 3] = 255;
  }
  return out;
}

/** Full pipeline: RGBA in, binarised RGBA out (same size). */
export function binarize(img: RawImage): RawImage {
  const gray = toGray(img);
  const bw = adaptiveThreshold(gray, img.width, img.height);
  return { data: grayToRgba(bw), width: img.width, height: img.height };
}

/**
 * Pick a working size. Tesseract reads best when text is ~20–40px tall; a
 * receipt photo at ~1600–2200px on the long side lands there. Bigger only
 * costs time on a phone.
 */
export function targetSize(width: number, height: number, longSide = 2000) {
  const scale = longSide / Math.max(width, height);
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}
