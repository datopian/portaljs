const fs = require('fs').promises;
const path = require('path');
const { Octokit } = require('octokit');

async function parseIndexCsv(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  const [header, ...rows] = lines;

  const datasets = new Map();

  for (const row of rows) {
    const [subfolder_name, dataset_url, article_url] = row.split(',').map(s => s.trim());

    if (!datasets.has(subfolder_name)) {
      datasets.set(subfolder_name, {
        name: subfolder_name,
        url: dataset_url,
        articles: []
      });
    }

    datasets.get(subfolder_name).articles.push({
      url: article_url
    });
  }

  return Array.from(datasets.values());
}

async function loadExistingDatasets(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const datasets = JSON.parse(content);
    const datasetMap = new Map();

    for (const dataset of datasets) {
      datasetMap.set(dataset.name, dataset);
    }

    return datasetMap;
  } catch (error) {
    console.log('No existing datasets.json found or error reading it');
    return new Map();
  }
}

async function getLastCommitDate(octokit, datasetName) {
  try {
    const response = await octokit.rest.repos.listCommits({
      owner: 'fivethirtyeight',
      repo: 'data',
      path: datasetName,
      per_page: 1
    });

    if (response.data && response.data.length > 0) {
      return response.data[0].commit.committer.date;
    }
    return new Date().toISOString();
  } catch (error) {
    return new Date().toISOString();
  }
}

async function getDatasetFiles(octokit, datasetName) {
  try {
    const response = await octokit.rest.repos.getContent({
      owner: 'fivethirtyeight',
      repo: 'data',
      path: datasetName,
      ref: 'master'
    });

    const csvFiles = response.data
      .filter(file => file.name.endsWith('.csv'))
      .map(file => `https://raw.githubusercontent.com/fivethirtyeight/data/master/${datasetName}/${file.name}`);

    return csvFiles;
  } catch (error) {
    console.log(`Warning: Could not fetch files for ${datasetName}:`, error.message);
    return [];
  }
}

async function getReadmeContent(octokit, datasetName) {
  try {
    const readmeVariants = ['README.md', 'readme.md', 'Readme.md'];

    for (const readme of readmeVariants) {
      try {
        const response = await octokit.rest.repos.getContent({
          owner: 'fivethirtyeight',
          repo: 'data',
          path: `${datasetName}/${readme}`,
          ref: 'master'
        });

        const content = Buffer.from(response.data.content, 'base64').toString();
        return content;
      } catch (e) {
        continue;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

function parseArticlesFromReadme(readmeContent, articleUrls) {
  if (!readmeContent) return [];

  const articles = [];

  for (const articleUrl of articleUrls) {
    const urlWithoutProtocol = articleUrl.url.replace(/^https?:\/\//, '');
    const markdownLinkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    let found = false;

    while ((match = markdownLinkPattern.exec(readmeContent)) !== null) {
      const title = match[1];
      const url = match[2];
      const urlNormalized = url.replace(/^https?:\/\//, '');

      if (urlNormalized === urlWithoutProtocol || url === articleUrl.url) {
        let date = '';

        const contextStart = Math.max(0, match.index - 100);
        const contextEnd = Math.min(readmeContent.length, match.index + match[0].length + 100);
        const context = readmeContent.substring(contextStart, contextEnd);

        const datePatterns = [
          /\(([A-Za-z]+\s+\d+,\s+\d{4})\)/,
          /([A-Za-z]+\s+\d+,\s+\d{4})/,
          /(\d{4}-\d{2}-\d{2})/
        ];

        for (const pattern of datePatterns) {
          const dateMatch = context.match(pattern);
          if (dateMatch) {
            try {
              date = new Date(dateMatch[1]).toISOString();
              break;
            } catch (e) {
              continue;
            }
          }
        }

        articles.push({
          url: articleUrl.url,
          title: title.trim(),
          date: date
        });
        found = true;
        break;
      }
    }

    if (!found) {
      articles.push({
        url: articleUrl.url,
        title: '',
        date: ''
      });
    }
  }

  return articles;
}

function formatDisplayName(name) {
  const words = name.split('-');
  if (words.length > 0) {
    const lastWord = words[words.length - 1];
    words[words.length - 1] = `<span class="lastword">${lastWord}</span>`;
  }
  return words.join('-');
}

async function buildDatasets() {
  const octokit = new Octokit({
    auth: process.env.GITHUB_PAT || process.env.GITHUB_TOKEN
  });

  const indexPath = path.join(__dirname, '..', 'index.csv');
  const datasetsJsonPath = path.join(__dirname, '..', 'datasets.json');

  console.log('Loading existing datasets.json...');
  const existingDatasets = await loadExistingDatasets(datasetsJsonPath);
  console.log(`Found ${existingDatasets.size} existing datasets`);

  console.log('Parsing index.csv...');
  const indexDatasets = await parseIndexCsv(indexPath);
  console.log(`Found ${indexDatasets.length} datasets in index.csv`);

  const enrichedDatasets = [];
  let updatedCount = 0;
  let newCount = 0;

  for (let i = 0; i < indexDatasets.length; i++) {
    const dataset = indexDatasets[i];
    console.log(`Processing ${i + 1}/${indexDatasets.length}: ${dataset.name}`);

    const existingDataset = existingDatasets.get(dataset.name);

    if (existingDataset) {
      console.log(`  -> Updating existing dataset`);
      updatedCount++;

      const [files, lastCommitDate] = await Promise.all([
        getDatasetFiles(octokit, dataset.name),
        getLastCommitDate(octokit, dataset.name)
      ]);

      const updatedArticles = existingDataset.articles.map(article => ({
        ...article,
        date: article.date || lastCommitDate
      }));

      enrichedDatasets.push({
        url: dataset.url,
        name: dataset.name,
        displayName: existingDataset.displayName || formatDisplayName(dataset.name),
        articles: updatedArticles,
        files: files.length > 0 ? files : existingDataset.files
      });
    } else {
      console.log(`  -> Adding new dataset`);
      newCount++;

      const [files, lastCommitDate, readmeContent] = await Promise.all([
        getDatasetFiles(octokit, dataset.name),
        getLastCommitDate(octokit, dataset.name),
        getReadmeContent(octokit, dataset.name)
      ]);

      const articles = parseArticlesFromReadme(readmeContent, dataset.articles);

      const articlesWithDate = articles.map(article => ({
        url: article.url,
        title: article.title || '',
        date: article.date || lastCommitDate
      }));

      enrichedDatasets.push({
        url: dataset.url,
        name: dataset.name,
        displayName: formatDisplayName(dataset.name),
        articles: articlesWithDate,
        files: files.length > 0 ? files : undefined
      });
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  enrichedDatasets.sort((a, b) => {
    const dateA = new Date(a.articles[0]?.date || 0);
    const dateB = new Date(b.articles[0]?.date || 0);
    return dateB - dateA;
  });

  const outputPath = path.join(__dirname, '..', 'datasets.json');
  await fs.writeFile(outputPath, JSON.stringify(enrichedDatasets, null, 2));

  console.log(`\n✅ Successfully generated datasets.json`);
  console.log(`   Total datasets: ${enrichedDatasets.length}`);
  console.log(`   Updated existing: ${updatedCount}`);
  console.log(`   Added new: ${newCount}`);
  console.log(`   Output: ${outputPath}`);
}

buildDatasets().catch(console.error);
