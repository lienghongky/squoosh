/**
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

type HTMLImageElement = any;
import { Options } from '../shared/meta';
import * as ImageHelper from '../../../worker-utils/imageHelper';
import * as ort from 'onnxruntime-web';

ort.env.debug = true;
ort.env.logLevel = 'verbose';

ort.env.wasm.wasmPaths = {
  'ort-wasm.wasm': '/c/ort-wasm.wasm',
  'ort-wasm-simd.wasm': '/c/ort-wasm-simd.wasm',
  'ort-wasm-threaded.wasm': '/c/ort-wasm-threaded.wasm',
  'ort-wasm-simd-threaded.wasm': '/c/ort-wasm-simd-threaded.wasm',
};

export default async function process(
  data: ImageData,
  opts: Options,
): Promise<ImageData> {
  const weights = {
    raindrop: '/c/models/UAV-Rain1k_Best.onnx',
    rainstreak: '/c/models/Rain13k_Best.onnx',
    lolv1: '/c/models/LOLv1_Best.onnx',
    lolv2: '/c/models/LOLv2_Best.onnx',
  };

  if (!opts.task || opts.task.trim() === '') {
    return data;
  }
  const task = opts.task as keyof typeof weights;
  const modelPath = weights[task];
  if (!modelPath) {
    throw new Error(`Invalid task: ${task}`);
  }
  // Create a copy of the image data
  const result = new Uint8ClampedArray(data.data);

  // Ensure the image dimensions are divisible by 16
  const paddedWidth: number = Math.ceil(data.width / 16) * 16;
  const paddedHeight: number = Math.ceil(data.height / 16) * 16;

  let paddedData: ImageData;
  if (paddedWidth !== data.width || paddedHeight !== data.height) {
    paddedData = ImageHelper.padImageData(data, paddedWidth, paddedHeight);
  } else {
    paddedData = data;
  }

  try {
    const sessionOptions: ort.InferenceSession.SessionOptions = {
      // executionProviders: ['webgl','wasm'],
      // graphOptimizationLevel: 'all'
    };

    const sessionPromise = ort.InferenceSession.create(
      modelPath,
      sessionOptions,
    );

    var inputTensor = ImageHelper.imageDataToTensor(paddedData, [
      1,
      3,
      paddedHeight,
      paddedWidth,
    ]);

    const session = await sessionPromise;
    const feeds = {
      input: inputTensor,
    };

    // Run the inference
    const output = await session.run(feeds);
    const outputTensor = output.output.data as Float32Array;

    const full_output = ImageHelper.tensorToImageData(
      output.output,
      paddedHeight,
      paddedWidth,
    );
    return ImageHelper.cropImageData(
      full_output,
      0,
      0,
      data.width,
      data.height,
    );

    // for (let i = 0; i < result.length; i++) {
    //   result[i] = Math.min(255, Math.max(0, outputTensor[i] * 255)); // Denormalize to [0, 255]
    // }
  } catch (error) {
    console.error('Error during AI processing:', error);
  }

  return new ImageData(result, data.width, data.height);
}
