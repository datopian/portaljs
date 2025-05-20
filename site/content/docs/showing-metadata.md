---
title: Showing metadata 
description: "Learn how to display metadata on the dataset page of a data portal built with PortalJS"
---

If you go now to `http://localhost:3000/my-awesome-dataset`, you will see that we now have two titles on the page. That's because `title` is one of the default metadata fields supported by PortalJS.

![Example of a page displaying the title metadata twice](https://i.imgur.com/O145uuc.png)

Change the content inside `/content/my-awesome-dataset/index.md` to this.

```
---
title: 'My awesome dataset'
author: 'Rufus Pollock'
description: 'An awesome dataset displaying some awesome data'
modified: '2023-05-04'
files: ['data.csv']
group: 'Awesome'
---

Built with PortalJS

## Table

<Table url="data.csv" />
```

Once you refresh the page at `http://localhost:3000/my-awesome-dataset` you should see something like this at the top:

![Example of a dataset page displaying metadata](https://i.imgur.com/nvDYJQT.png)

These are the standard metadata fields that will be shown at the top of the page if you add them.

- `title` that gets displayed as a big header at the top of the page
- `author`, `description`, and `modified` which gets displayed below the title
- `files` that get displayed as a table with two columns: `File` which is linked directly to the file, and `Format` which show the file format.

Feel free to experiment with these metadata fields. At this point, you might want to deploy the app, and that's what you are going to learn in the next lesson.

<DocsPagination prev="/docs/searching-datasets" next="/docs/deploying-your-portaljs-app" />
