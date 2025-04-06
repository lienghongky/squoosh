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

import { initEmscriptenModule } from 'features/worker-utils';
import { Options } from '../shared/meta';

export default async function process(
  data: ImageData,
  opts: Options,
): Promise<ImageData> {
  console.log('Processing image with AI options:', opts);
  // Create a copy of the image data
  const result = new Uint8ClampedArray(data.data);

  // Simple modification: Invert colors
  for (let i = 0; i < result.length; i += 4) {
    result[i] = 255 - result[i]; // Red
    result[i + 1] = 255 - result[i + 1]; // Green
    result[i + 2] = 255 - result[i + 2]; // Blue
    // Alpha (result[i + 3]) remains unchanged
  }

  return new ImageData(result, data.width, data.height);
}
