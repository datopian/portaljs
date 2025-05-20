import fs from 'fs'
import glob from 'glob'
import path from 'path'

// POSTS_PATH is useful when you want to get the path to a specific file
export const POSTS_PATH = path.join(process.cwd(), 'content')

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {

    filelist = fs.statSync(path.join(dir, file)).isDirectory()
      ? walkSync(path.join(dir, file), filelist)
      : filelist.concat(path.join(dir, file))

  })
  return filelist
}

// postFilePaths is the list of all mdx files inside the POSTS_PATH directory
export const postFilePaths = walkSync(POSTS_PATH)
  .map((file) => { return file.slice(POSTS_PATH.length) })
  // Only include md(x) files
  .filter((path) => /\.mdx?$/.test(path))
