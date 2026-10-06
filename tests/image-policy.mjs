import assert from 'node:assert/strict';
import { validateImage, IMAGE_INPUT_LIMIT, IMAGE_UPLOAD_LIMIT } from '../src/utils/prepareImage.ts';

for (const type of ['image/jpeg', 'image/png', 'image/webp']) {
  assert.doesNotThrow(() => validateImage({ type, size: IMAGE_INPUT_LIMIT }));
  assert.throws(() => validateImage({ type, size: IMAGE_INPUT_LIMIT + 1 }), /10 MB/);
  assert.throws(() => validateImage({ type, size: 0 }), /10 MB/);
}
for (const type of ['image/svg+xml', 'image/heic', 'application/pdf', 'text/html', '']) {
  assert.throws(() => validateImage({ type, size: 1024 }), /JPG, PNG ou WebP/);
}
assert.equal(IMAGE_UPLOAD_LIMIT, 1024 * 1024, 'prepared post images must fit the server bucket limit');
console.log('PASS: image input formats, empty files and upload size boundaries.');
