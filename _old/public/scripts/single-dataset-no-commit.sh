#!/bin/bash
git checkout -b gh-pages
git rm -r --cached . 
rm -rf portal
mkdir -p portal
npx create-next-app portal -e https://github.com/datopian/datahub/tree/main/examples/dataset-frictionless 
mkdir portal/public/dataset

cp -a ./data portal/public/dataset
cp -a ./datapackage.json portal/public/dataset
cp -a ./README.md portal/public/dataset

PORTAL_DATASET_PATH=$PWD"/portal/public/dataset"
export PORTAL_DATASET_PATH

cd portal
assetPrefix='"/'$PORTAL_REPO_NAME'/"'
basePath='"/'$PORTAL_REPO_NAME'"'
echo 'module.exports = {assetPrefix:' ${assetPrefix}', basePath: '${basePath}' }' > next.config.js ## This ensures css and public folder works
yarn export

cd ..
cp -R -a portal/out/* ./
touch .nojekyll
git add $PWD'/_next' $PWD'/index.html' $PWD'/dataset' $PWD'/404.html' $PWD'/.nojekyll' $PWD'/favicon.ico'
git commit -m "Build new dataset page"
git push origin gh-pages
