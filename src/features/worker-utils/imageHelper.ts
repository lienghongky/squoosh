import { Tensor } from 'onnxruntime-web';

export function imageDataToTensor(
  imageData: ImageData,
  dims: number[],
): Tensor {
  // 1. Get buffer data from ImageData and create R, G, and B arrays.
  const imageBufferData = imageData.data;
  const [redArray, greenArray, blueArray]: [number[], number[], number[]] = [
    [],
    [],
    [],
  ];

  // 2. Loop through the image buffer and extract the R, G, and B channels
  for (let i = 0; i < imageBufferData.length; i += 4) {
    redArray.push(imageBufferData[i]);
    greenArray.push(imageBufferData[i + 1]);
    blueArray.push(imageBufferData[i + 2]);
    // skip imageBufferData[i + 3] to filter out the alpha channel
  }

  // 3. Concatenate RGB to transpose [height, width, 3] -> [3, height, width] to a number array
  const transposedData = redArray.concat(greenArray).concat(blueArray);

  // 4. Convert to float32
  const float32Data = new Float32Array(dims[1] * dims[2] * dims[3]);
  for (let i = 0; i < transposedData.length; i++) {
    float32Data[i] = transposedData[i] / 255.0; // normalize to [0, 1]
  }

  // 5. Create the tensor object from onnxruntime-web.
  const inputTensor = new Tensor('float32', float32Data, dims);
  return inputTensor;
}

export function tensorToImageData(
  tensor: Tensor,
  width: number,
  height: number,
): ImageData {
  // 1. Validate tensor dimensions
  if (
    tensor.dims.length !== 4 ||
    tensor.dims[0] !== 1 ||
    tensor.dims[1] !== 3 ||
    tensor.dims[2] !== height ||
    tensor.dims[3] !== width
  ) {
    throw new Error(
      'Invalid tensor dimensions. Expected [1, 3, height, width].',
    );
  }

  // 2. Extract data from the tensor
  const data = tensor.data as Float32Array;

  // 3. Prepare an array for ImageData
  const imageDataArray = new Uint8ClampedArray(width * height * 4);

  // 4. Loop through the tensor data and populate the ImageData array
  const size = width * height;
  for (let i = 0; i < size; i++) {
    const r = data[i] * 255; // Red channel
    const g = data[i + size] * 255; // Green channel
    const b = data[i + 2 * size] * 255; // Blue channel

    imageDataArray[i * 4] = Math.round(r); // R
    imageDataArray[i * 4 + 1] = Math.round(g); // G
    imageDataArray[i * 4 + 2] = Math.round(b); // B
    imageDataArray[i * 4 + 3] = 255; // A (fully opaque)
  }

  // 5. Create and return the ImageData object
  return new ImageData(imageDataArray, width, height);
}
