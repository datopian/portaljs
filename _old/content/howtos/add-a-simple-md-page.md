---
title: How to quickly add a simple Markdown-based page
date: 2023-07-27
authors: ['Lauren Wigmore', 'Ola Rubaj']
filetype: 'blog'
---

Welcome to this howto on how to quickly add a simple Markdown-based page to your website. The steps here are designed for non-technical contributors. There's no need to know how to code!

> [!important]
> This "How to" is only recommended for very simple Markdown pages, e.g. those without images, links to other pages, diagrams, or other elements that can't be previewed in GitHub preview mode.

> [!tip]
> If you are unfamiliar with Markdown (and its different flavours and extra elements supported by Flowershow based websites), check out [this short guide](https://flowershow.app/docs/syntax) on available syntax elements.

## Steps

1. Go to the repository of your website in GitHub.
2. Click on the `content` folder to open it. This is where all the Markdown files for a Flowershow-based website are stored.
3. Optionally, navigate to a subfolder where you want to add your page.
4. Click “Add file” and write the page name + extension `.md`, e.g. `my-new-page.md`.

> [!tip]
> If you want to add your page to a new subfolder, in the "Name your file..." field, first type the name of the new subfolder, followed by a forward slash, .e.g., `blog/`. After you hit the slash, you'll see the name field gets cleared, but the path before it has been extended with your subfolder name. You can repeat this process if you want to put your file into further nested subfolders. Then, simply type the name of the file with ".md" extension.

5. Paste or write the contents of the file in Markdown format.
6. (Optionally) Switch to the "Preview" mode, by toggling from "Edit" -> "Preview" at the top of the file content, to see a rough visualisation of your changes. Keep in mind though, that the actual website may have different styling and may support additional Markdown elements that GitHub doesn't render on the preview.
7. When you're happy with the content, click on the “Commit changes...” button. In the "Commit message" field, provide a concise summary of your changes. If necessary, you can add further explanation in the "Extended description" text field. Then select “Commit directly to the main branch”, and hit "Commit changes."
8. The site is now going to be rebuilt to reflect the changes saved to the `main` branch. This can take up to a few minutes. After this time you should see your page live.

## Summary

Congratulations, you've now learned how to create a new Markdown page on your Flowershow-based website.

If anything is not clear to you, or you have suggestions on how we can make this 'How to' better, please don't hesitate to let us know.

Happy editing!
