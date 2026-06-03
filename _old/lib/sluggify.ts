const sluggify = (urlPath: string) => {
  return urlPath.replace(/^(.+?\/)*/, "");
};

export default sluggify;
