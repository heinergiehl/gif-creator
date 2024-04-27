export const pageview = (GA_MEASUREMENT_ID: string, url: string) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
};
