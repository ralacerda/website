export default eventHandler(async (event) => {
  const date = new Date();
  const time = date.toTimeString();

  setHeader(
    event,
    "Netlify-CDN-Cache-Control",
    "public, max-age=60, stale-while-revalidate=120"
  );

  return time;
});
