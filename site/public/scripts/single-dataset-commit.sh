#!/bin/bash
rm -rf portal
mkdir -p portal
npx create-next-app portal -e https://github.com/datopian/datahub/tree/main/examples/dataset-frictionless 
mkdir portal/public/dataset

cp -a ./data portal/public/dataset
cp -a ./datapackage.json portal/public/dataset
cp -a ./README.md portal/public/dataset

PORTAL_DATASET_PATH=$PWD"/portal/public/dataset"
export PORTAL_DATASET_PATH

mkdir -p .github && mkdir -p .github/workflows && touch .github/workflows/main.yml
curl https://raw.githubusercontent.com/datopian/datahub/main/site/public/scripts/gh-page-builder-action.yml > .github/workflows/main.yml

cd portal
assetPrefix='"/'$PORTAL_REPO_NAME'/"'
basePath='"/'$PORTAL_REPO_NAME'"'
echo 'module.exports = {assetPrefix:' ${assetPrefix}', basePath: '${basePath}' }' > next.config.js ## This ensures css and public folder works

cd ..
git add .
git commit -m "Add dataset build feature"
git push 
echo "Portal generated, please push your code to github"
