export const readTime = (text) => {
  const wpm = 150;
  const words = text.trim().split(/\s+/).length;
  const time = Math.ceil(words / wpm);
  return time;
};


export const formatDate = (dateUTC) => {
  return new Date(dateUTC).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
};
  
