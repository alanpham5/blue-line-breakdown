import { useState, useEffect } from "react";
import { apiService } from "lib/api/apiService";
const poolCache = {};
export const usePlayerPool = (season, position, enabled = true) => {
  const cacheKey = `${season}-${position}`;
  const [pool, setPool] = useState(() => poolCache[cacheKey] || []);
  const [loading, setLoading] = useState(enabled && !poolCache[cacheKey]);
  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    if (poolCache[cacheKey]) {
      setPool(poolCache[cacheKey]);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    apiService
      .fetchPlayerPool(season, position)
      .then((data) => {
        if (!active) return;
        poolCache[cacheKey] = data.players || [];
        setPool(poolCache[cacheKey]);
      })
      .catch(() => active && setPool([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [cacheKey, season, position, enabled]);
  return { pool, loading };
};
