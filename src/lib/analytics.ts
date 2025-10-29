import { track } from "@vercel/analytics";

export const trackSearch = (
  query: string,
  category: string,
  resultCount: number,
  durationMs: number
) => {
  track("search", {
    query,
    category,
    resultCount,
    durationMs,
    timestamp: new Date().toISOString(),
  });
};

export const trackCategoryChange = (from: string, to: string) => {
  track("category_change", {
    from,
    to,
    timestamp: new Date().toISOString(),
  });
};

export const trackShareClick = (query: string, category: string) => {
  track("share", {
    query,
    category,
    timestamp: new Date().toISOString(),
  });
};
