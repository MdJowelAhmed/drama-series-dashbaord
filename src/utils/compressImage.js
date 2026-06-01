/**
 * Compress and resize an image File in the browser before upload.
 *
 * Large originals (several MB) are the main reason images render slowly on
 * pages like the Login Image screen. Shrinking them at upload time keeps the
 * stored files small (KB instead of MB) so they load almost instantly.
 *
 * @param {File} file - The original image file.
 * @param {object} [options]
 * @param {number} [options.maxWidth=1600]  - Max output width in px.
 * @param {number} [options.maxHeight=1600] - Max output height in px.
 * @param {number} [options.quality=0.8]    - JPEG/WebP quality (0-1).
 * @returns {Promise<File>} A compressed File (or the original if compression
 *                          is not beneficial / not supported).
 */
export async function compressImage(
  file,
  { maxWidth = 1600, maxHeight = 1600, quality = 0.8 } = {}
) {
  // Only handle raster images; skip non-images, animated GIFs and vectors.
  if (
    !file ||
    !file.type?.startsWith("image/") ||
    file.type === "image/gif" ||
    file.type === "image/svg+xml"
  ) {
    return file;
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);

    let { width, height } = img;
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);

    // Keep PNG transparency, otherwise output JPEG for best compression.
    const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, outputType, quality)
    );

    // Fall back to the original if compression failed or made it bigger.
    if (!blob || blob.size >= file.size) return file;

    const newName = file.name.replace(
      /\.[^.]+$/,
      outputType === "image/png" ? ".png" : ".jpg"
    );
    return new File([blob], newName, {
      type: outputType,
      lastModified: Date.now(),
    });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
