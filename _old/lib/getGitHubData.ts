export function getRepoInfo() {
  return fetch('https://api.github.com/repositories/2579069').then((res) => {
    if (res.status < 400) {
      return { success: true, info: res.json() };
    } else {
      return { success: false, info: null };
    }
  });
}

export function getContributorsCount() {
  //  Based on https://stackoverflow.com/questions/44347339/github-api-how-efficiently-get-the-total-contributors-amount-per-repository
  return fetch(
    'https://api.github.com/repos/datopian/portaljs/contributors?per_page=1&anon=false'
  ).then((res) => {
    if (res.status < 400) {
      const pattern = /&page=(\d+)>; rel="last"/;
      const linkHeader = res.headers.get('link');

      const count = pattern.exec(linkHeader)[1];

      return { success: true, count: count };
    } else {
      return { success: false, count: null };
    }
  });
}
