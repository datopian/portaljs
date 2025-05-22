export async function getPageData(dataProperties) {
  const data = {};
  for (const dataProperty of dataProperties) {
    try {
      const dataGetter = (await import(`../content/getters/${dataProperty}.js`))
        .default;
      data[dataProperty] = await dataGetter();
    } catch {
      console.error(
        `Getter "${dataProperty}" does not exist in "<your-content-folder>/getters"`
      );
    }
  }
  return data;
}
