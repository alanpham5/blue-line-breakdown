export const SLOW_REQUEST_DELAY_MS = 6000;

const listeners = new Set();
let slowRequestCount = 0;

const notifyListeners = () => {
  const hasSlowRequests = slowRequestCount > 0;
  listeners.forEach((listener) => listener(hasSlowRequests));
};

export const subscribeToSlowRequests = (listener) => {
  listeners.add(listener);
  listener(slowRequestCount > 0);
  return () => listeners.delete(listener);
};

export const trackApiRequest = async (request) => {
  let isSlow = false;
  const slowTimer = setTimeout(() => {
    isSlow = true;
    slowRequestCount += 1;
    notifyListeners();
  }, SLOW_REQUEST_DELAY_MS);

  try {
    return await request();
  } finally {
    clearTimeout(slowTimer);
    if (isSlow) {
      slowRequestCount = Math.max(0, slowRequestCount - 1);
      notifyListeners();
    }
  }
};
