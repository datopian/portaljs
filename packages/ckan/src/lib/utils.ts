export function getDaysAgo(date: string) {
  const today = new Date();
  const createdOn = new Date(date);
  const msInDay = 24 * 60 * 60 * 1000;

  createdOn.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return (+today - +createdOn) / msInDay;
}

export function removeTag(tag?: string) {
  if (tag === '{{description}}' || !tag) {
    return undefined;
  }
  if (typeof window !== 'undefined') {
    const div = document.createElement('div');
    div.innerHTML = tag;
    return div.textContent || div.innerText || '';
  }
  return tag;
}

//The porpuse of this functoin is converting the schema returned from datastore info which is in the form o a dictionary into an array of key value pairs that can be consumed by the data-explorer
export function convertFieldSchema(
  schema: Record<string, string | boolean | number>
) {
  function convertToGraphqlString(fieldName: string) {
    return fieldName
      .replaceAll(' ', '_')
      .replaceAll('(', '_')
      .replaceAll(')', '_')
      .replace(/[^\w\s]|(_)\1/gi, '_');
  }
  const entries = Object.entries(schema);
  return {
    fields: entries.map((entry) => ({
      name: convertToGraphqlString(entry[0]),
      title: entry[0],
      type: entry[1],
    })),
  };
}
