---
title: How to push an Obsidian vault to a GitHub repository
date: 2023-07-27
authors: ['Jake Hirsch', 'Ola Rubaj']
filetype: 'blog'
---

This howto walks you through the process of setting up your Obsidian vault as a GitHub repository. Here are some of the benefits of doing so:

1. Creating a backup of your notes, accessible from anywhere.
2. Keeping track of your note-taking history, thereby enabling you to see the evolution of your ideas over time.
3. Collaborating with others on your notes.

In this howto, we will use the GitHub Desktop application, an easy-to-use interface for managing your Git repositories locally and on GitHub. This tool is particularly useful if you're not comfortable with Git's command line interface or if you just prefer a more visual representation of your Git operations.

## Steps

### Step 1: Setting Up GitHub Desktop App

1.1. If you haven't already done so, create a GitHub account at https://github.com

1.2. Download and install the GitHub Desktop app from https://desktop.github.com

1.3. Once installed, open the GitHub Desktop app. You'll be prompted to sign in with your GitHub account.

### Step 2: Setting Up Your Vault as a GitHub Repository

2.1. In the GitHub Desktop app, click on "Add an Existing Repository from your Hard Drive"

2.2. Navigate to your Obsidian vault's folder using the file explorer.

2.3. After selecting it, you'll see a warning saying "This directory does not appear to be a Git repository. Would you like to create a repository here instead?" Click on the link "create a repository".

2.4. You'll be brought to the "Create a New Repository" page with the vault's location already in the "Local Path" box.

2.5. Choose a name for your repository. It's best to use lowercase and dashes. (For the sake of simplicity use the same or similar name to your vault's folder name.)

2.6. Add an optional description.

2.7. Make sure the checkbox "Initialise this repository with a README" is unchecked, and "Git Ignore" and "License" are set to "None".

2.8. Click on "Create Repository".

Great! Now you have your Obsidian vault set up as a git repository. Now, let's push it to GitHub.

### Step 3: Pushing Your Vault to GitHub

3.1. After you've created the repository, in the GitHub Desktop app you'll see a dashboard with the heading "No local changes". Below you'll see a suggestion with a button "Publish repository". Click on it. (You could also use "Publish repository" button in the top application bar.)

3.2. A new window will appear. Choose a name (it will automatically suggest the one you chose during the creation process, and its best to leave it this way), add an optional description, and select whether you want it to be public or private.

> [!Important]
> Please be aware that if your GitHub repository is public, this process will make your Obsidian vault publicly accessible. If you wish to keep your vault private, you'll need to select "Private" when publishing the repository.

3.3. Click on "Publish Repository".

3.4. Wait for the process to finish. You'll see a small prompt when the upload is complete.

3.5. You can now visit your repository on GitHub's website to see your uploaded Obsidian vault.

## Summary

Congratulations, you've now learned how to push an Obsidian vault to your Github repository.

If anything is not clear to you, or you have suggestions on how we can make this 'How to' better, please don't hesitate to let us know.

Happy editing!
