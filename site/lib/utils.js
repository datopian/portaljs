import remark from 'remark'
import html from 'remark-html'
import fs from 'fs'

export async function formatMD(mdFilePath) {
    const mdFile = fs.readFileSync(mdFilePath, "utf-8")
    const processed = await remark()
        .use(html)
        .process(mdFile)

    const readmeHtml = processed.toString()
    return readmeHtml
}