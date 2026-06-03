---
title: Create a catalog of anything using Markdown files in Obsidian
date: 2023-05-30
authors: ['Ola Rubaj']
filetype: 'blog'
---

![[dataview.gif]]

Have you ever wanted to create a catalog of stuff? Maybe it's a list of personal projects, maybe favourite books or movies, or perhaps the options for the next smartphone you'll buy. But you've found yourself deterred by expensive software, lack of flexibility in capturing and modifying the structure of the data, or lack of control over it?

Markdown files, with their unique combination of 1) rich content, including text, images, links, and more, with 2) structured metadata allowing for data retrieval, are an excellent tool for this task. These features, coupled with the user-friendly interface of Obsidian and the analytical power of the Dataview plugin, make creating a data catalog an easy task. And it's free!

This tutorial will provide you with an easy yet extendable approach to creating your personal data catalogs using Markdown, in Obsidian.

## What are we going to build?

In this tutorial, we're going to create a catalog of characters from the Harry Potter series. Each character will have their own markdown file containing some unstructured data like character's quotes, as well as structured metadata, such as the character's name, house, creature they own, and status (alive or dead).

## Step 1: Setup

Here are the steps to get you started:

1. Download and install Obsidian from their [official website](https://obsidian.md/).
2. Create a new Obsidian vault.
   1. Open the app.
   2. Click the "New" button to create a new vault.
   3. Choose a name and a location for your vault. For this tutorial, you might name it "Harry Potter Characters".
   4. Click "Create" to create the vault.
3. Install the ["Dataview" plugin](https://github.com/blacksmithgu/obsidian-dataview) from Obsidian's community plugins.
   1. Open the newly created vault in Obsidian.
   2. Click on the settings icon ⚙️ in the left-hand pane to open the Settings view.
   3. In the Settings view, find the "Community plugins" section and click on it.
   4. Click on the button "Turn on community plugins".
   5. Click on "Browse" and search for "Dataview" in the plugin browser.
   6. Click on "Install" to install the Dataview plugin.
   7. After the plugin is installed, click on "Enable" to enable the plugin in your vault.

## Step 2: Add some data about the characters

Let's start by creating a subfolder in our Obsidian vault, that will store all the markdown files with our characters data. Let's name it e.g. `/characters`. Then, we're going to create three markdown files in it for data about Harry Potter, Hermione, and Malfoy.

Here's an example file for Harry Potter:

```md
---
name: Harry Potter
house: Gryffindor
status: Alive
---

## Quotes

"I solemnly swear I am up to no good."
```

Here's an example file for Hermione:

```md
---
name: Hermione Granger
house: Gryffindor
status: Alive
---

## Quotes

"Books! And cleverness! There are more important things - friendship and bravery."
```

Here's an example file for Malfoy:

```md
---
name: Draco Malfoy
house: Slytherin
status: Alive
---

Draco Malfoy is Harry's rival and a member of Slytherin House.

## Quotes

"My father will hear about this!"
```

By the end of this step you should end up with the following folder structure:

```
Harry Potter Characters
└── characters
    ├── Harry Potter.md
    ├── Hermione.md
    └── Malfoy.md
```

## Step 3: Create a data catalog

Now let's create a data catalog of our Harry Potter characters!

In the root of our vault, let's create a file called `Catalog` (but you can name it whatever you want) that's going to display a table with all our characters and their metadata. Inside it, we're going to write the following code block with a simple Dataview query:

````md
```dataview
table name, house, status
from "characters"
sort name asc
```
````

Let's break it down:

- `table name, house, status`: This line instructs Dataview to create a table that includes columns for "name", "house", and "status". These are fields that you should have defined in your markdown files' frontmatter, but you don't have to. For any missing field Dataview will just display `-`.
- `from "characters"`: This tells Dataview to pull the data from all markdown files located in the `/characters` folder in your Obsidian vault.
- `sort name asc`: This command sorts the data based on the "name" field, in ascending order.

After you click somewhere outside of this code block, you should see the following table:

![[table1.png]]

## Step 4: Add more metadata about characters

We can continue to add more information about our characters. For example, let's add creatures each character owns:

```md=
---
name: Harry Potter
...
creature: Hedwig (Owl)
---

...

---

name: Hermione Granger
...
creature: Crookshanks (Cat)
---

...

```

Now, if we want to show this field in our Dataview table, we need to add it to the first line of our dataview code block:

````md
```dataview
table name, house, status, creature
from "characters"
sort name asc
```
````

After clicking somewhere outside the code block, you should see an updated table that includes the column `creature`.

![[table2.png]]

## Step 5: Enrich content with images and links

To enhance your catalog, you can add images of characters, and links to other characters in your markdown content.

#### Add images

To add an image of a character, right-click on the image you want to embed and copy it to clipboard - you can use the image below - and paste it directly in your markdown file.

![[harry_original.png]]

Obsidian will automatically save the file to the root of your vault and create a link to it in your content, so you'll end up with a link similar to this one:

```md
![[Pasted image 20230525212302.png]]
```

Which will render as:

![[harry.png]]

#### Add links to other pages

Obsidian allows you to create links between different notes (or in this case, characters). To add a link to another character, use the double bracket `[[]]` syntax.

For example, if you're writing about Harry Potter and want to mention that he is friends with Hermione, you can link to Hermione's markdown file like this:

```md
He is a friend of [[Hermione]].
```

When you click on Hermione's name in the rendered link, Obsidian will take you to Hermione's file in your vault. If you hover over it, you'll see a preview of Hermione's file:

![[link-preview.png]]

## Summary

And there you have it! We've walked through the process of creating a personal data catalog using markdown files, the Obsidian application, and its Dataview plugin. We've transformed scattered data into a well-organized, easy-to-navigate, and visually pleasing catalog. Whether you've used our example of a Harry Potter character catalog or applied these steps to a different topic of your choosing, we hope you've found this tutorial helpful and empowering.

Happy data cataloging!

---

You can find the [vault created in this tutorial here](https://github.com/datopian/markdowndb/tree/main/examples/obsidian-dataview).
