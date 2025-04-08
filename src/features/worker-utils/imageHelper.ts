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
  height: number,
  width: number,
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

export function padImageData(
  data: ImageData,
  paddedWidth: number,
  paddedHeight: number,
): ImageData {
  // 1. Create a new Uint8ClampedArray for the padded image
  const paddedArray = new Uint8ClampedArray(paddedWidth * paddedHeight * 4);

  // 2. Fill the padded array with transparent pixels (default alpha = 0)
  paddedArray.fill(0);

  // 3. Copy the original image data into the padded array
  for (let y = 0; y < data.height; y++) {
    for (let x = 0; x < data.width; x++) {
      const srcIndex = (y * data.width + x) * 4;
      const destIndex = (y * paddedWidth + x) * 4;

      paddedArray[destIndex] = data.data[srcIndex]; // R
      paddedArray[destIndex + 1] = data.data[srcIndex + 1]; // G
      paddedArray[destIndex + 2] = data.data[srcIndex + 2]; // B
      paddedArray[destIndex + 3] = data.data[srcIndex + 3]; // A
    }
  }

  // 4. Return the new ImageData object
  return new ImageData(paddedArray, paddedWidth, paddedHeight);
}

export function cropImageData(
  data: ImageData,
  cropX: number,
  cropY: number,
  cropWidth: number,
  cropHeight: number,
): ImageData {
  // 1. Validate crop dimensions
  if (
    cropX < 0 ||
    cropY < 0 ||
    cropX + cropWidth > data.width ||
    cropY + cropHeight > data.height
  ) {
    throw new Error('Invalid crop dimensions or position.');
  }

  // 2. Create a new Uint8ClampedArray for the cropped image
  const croppedArray = new Uint8ClampedArray(cropWidth * cropHeight * 4);

  // 3. Copy the cropped region from the original image data
  for (let y = 0; y < cropHeight; y++) {
    for (let x = 0; x < cropWidth; x++) {
      const srcIndex = ((cropY + y) * data.width + (cropX + x)) * 4;
      const destIndex = (y * cropWidth + x) * 4;

      croppedArray[destIndex] = data.data[srcIndex]; // R
      croppedArray[destIndex + 1] = data.data[srcIndex + 1]; // G
      croppedArray[destIndex + 2] = data.data[srcIndex + 2]; // B
      croppedArray[destIndex + 3] = data.data[srcIndex + 3]; // A
    }
  }

  // 4. Return the new ImageData object
  return new ImageData(croppedArray, cropWidth, cropHeight);
}
