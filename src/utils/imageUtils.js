/**
 * CORS-safe image loading utility.
 * Converts cross-origin images to data-URL Image objects so the Canvas
 * can render them without tainting the canvas.
 */

function loadImage(url) {
  if (!url) return Promise.resolve(null);
  const isExternal = url.startsWith("http://") || url.startsWith("https://");

  if (!isExternal) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  // Try direct fetch first (for CORS-enabled CDNs like assets.nhle.com)
  return fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error();
      return res.blob();
    })
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = reader.result;
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
    )
    .catch(() => {
      // Fallback: fetch via CORS proxies if direct fetch is blocked
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      return fetch(proxyUrl)
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.blob();
        })
        .then(
          (blob) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = reader.result;
              };
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            })
        )
        .catch(() => {
          const fallbackUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
          return fetch(fallbackUrl)
            .then((res) => {
              if (!res.ok) throw new Error();
              return res.blob();
            })
            .then(
              (blob) =>
                new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = () => {
                    const img = new Image();
                    img.onload = () => resolve(img);
                    img.onerror = reject;
                    img.src = reader.result;
                  };
                  reader.onerror = reject;
                  reader.readAsDataURL(blob);
                })
            );
        })
        .catch(() => {
          return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = () => {
              resolve(null); // Never return non-CORS image to prevent tainting the canvas
            };
            img.src = url;
          });
        });
    });
}

/**
 * Converts all <img> elements inside `containerEl` whose src starts with
 * "http" to inline data-URL sources. Returns a restore function that puts
 * the original srcs back.
 */
export async function convertImagesToDataUrls(containerEl) {
  const imgs = containerEl.querySelectorAll("img");
  const originals = [];

  const tasks = Array.from(imgs).map(async (imgEl) => {
    const src = imgEl.getAttribute("src");
    if (!src) return;

    // Only convert external URLs
    if (!src.startsWith("http://") && !src.startsWith("https://")) return;

    originals.push({ el: imgEl, originalSrc: src });

    try {
      const loaded = await loadImage(src);
      if (loaded && loaded.src) {
        imgEl.src = loaded.src;
      }
    } catch {
      // Leave the original src if conversion fails
    }
  });

  await Promise.all(tasks);

  // Return a restore function
  return function restore() {
    originals.forEach(({ el, originalSrc }) => {
      el.src = originalSrc;
    });
  };
}

export { loadImage };
