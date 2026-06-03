---
title: How to quickly edit text on a single Markdown-based page
date: 2023-07-27
authors: ['Ola Rubaj']
filetype: 'blog'
---

Welcome to this tutorial on how to quickly edit text content on a single Markdown-based page. The steps here are designed for non-technical contributors. There's no need to know how to code!

> [!important]
> This "How to" is only recommended for text changes only, e.g. those that don't include adding images, links to other pages, diagrams, or other elements that can't be previewed in GitHub preview mode.

> [!tip]
> If you are unfamiliar with Markdown (and its different flavours and extra elements supported by Flowershow based websites), check out [this short guide](https://flowershow.app/docs/syntax) on available syntax elements.

## Steps

### Step 1: Navigate to the underlying Markdown file and edit it

**Option A: Use the "Edit this page" button**

If it was enabled, some pages on your website may have an "Edit this page" button at the bottom. By clicking it, you would be redirected to the corresponding Markdown file in your repository, ready for editing.

**Option B: Locate the underlying Markdown file in the repository yourself**

If the "Edit this page" button is unavailable, or if want to familiarise yourself more deeply with the repository's structure 💪, follow these steps:

1. Go to the repository.
2. Click on the `content` folder to open it. This is where all the Markdown files for the website content are stored.
3. Navigate through the subfolders within the `content` folder to find the file corresponding to the page you wish to edit.

> [!tip]
> To know exactly which file to look for, consider the URL of the web page you're trying to edit. The URL should correspond to the path of the file in the repository (excluding the `/content` prefix). E.g. a web page at `my.app.org/blog/welcome` will have its Markdown file located at `/content/blog/welcome.md`.
> If you can't find the corresponding markdown file in the repository, it may have been written in JSX instead of MD. For JSX you would need to know frontend programming, in which case submit an issue to your repository for the editing to be completed.

4. Once you've found the correct file, click on it to see its contents.
5. Click on the pencil icon near the top right corner. This will open the file in edit mode. Now you can make your changes.
6. (Optionally) Switch to the "Preview" mode, by toggling from "Edit" -> "Preview" at the top of the file content, to see a rough visualisation of your changes. Keep in mind though, that the actual website may have different styling and may support additional Markdown elements that GitHub doesn't render on the preview.

### Step 2: Save your changes

When you're happy with the content, click on the “Commit changes...” button. In the "Commit message" field, provide a concise summary of your changes. If necessary, you can add further explanation in the "Extended description" text field. Then select “Commit directly to the main branch”, and hit "Commit changes."

The site is now going to be rebuilt to reflect the changes saved to the `main` branch. This can take up to a few minutes. After this time you should see your page live.

## Summary

Congratulations! You've now learned how to edit the text content on a single Markdown-based page on your website.

If anything is not clear to you, or you have suggestions on how we can make this 'How to' better, please don't hesitate to let us know.

Happy editing!
