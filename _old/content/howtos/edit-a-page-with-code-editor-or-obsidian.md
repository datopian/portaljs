---
title: 'How to edit a page with a code editor or Obsidian'
date: 2023-07-27
authors: ['Jake Hirsch', 'Ola Rubaj']
filetype: 'blog'
isDraft: true
---

#### Setup

- Create a [GitHub](https://github.com/) account if you don’t already have one
- Download [VS Code](https://code.visualstudio.com/) or [Obsidian](https://obsidian.md/). You can use whichever one you prefer. This is what you’ll use to view and edit the website’s Markdown files.

#### Key steps

##### Stage 1: Fork

In this stage, you ‘fork’ the Life Itself Web3 repository, i.e. you make a remote copy of the repository in your own GitHub account. If you’ve forked the repo before, skip this stage.

- Go to the repo storing the website content: [https://github.com/life-itself/web3](https://github.com/life-itself/web3) (0:00-0:02)
- Click the ‘Fork’ button in the upper right-hand corner of the repo page to fork the repository

##### Stage 2: Clone

In this stage, you ‘clone’ your forked repository, i.e. you copy your forked version of the Life Itself Web3 repo to your computer so that you can make edits on your local machine without affecting the remote git repo. 00:40-01:50 of the [video tutorial](https://drive.google.com/file/d/1mWqXDx6ICJ_1qreoYoB774weWi-AtyDo/view) corresponds to this stage. _If you’ve cloned the forked repo before, skip this stage._

- Search your computer for its ‘terminal’ and open it. The terminal is simply a text-based way of interacting with the computer through commands. In the terminal, you can type commands, manipulate files, execute programs, and open documents. (00:03-00:39)
- On your forked repo page (make sure you’re not on the main repo page), click the green ‘Code’ button and copy the HTTPS link
- Type into Terminal "cd `directory`", where `directory` is replaced by the path to the folder you want to navigate to. E.g. “cd Desktop/Folder/life_itself/tutorial”. On a Mac, you can drag the folder to the terminal after typing “cd”. Otherwise, you can find the folder path [Mac](https://www.howtogeek.com/721126/3-ways-to-see-the-current-folder-path-on-mac/#:~:text=Open%20a%20Finder%20window%2C%20and,path%20to%20the%20current%20folder.); [Windows](https://www.wikihow.com/Find-a-File%27s-Path-on-Windows) and type or paste it in manually.
- What you’re doing here is navigating in Terminal to the folder on your computer where you want to save the cloned repository (i.e. changing the working directory). Normally, on your computer you do this by searching for a folder and clicking on the icon to open it. In Terminal, you do this by typing commands. The command for changing directory is: `directory`. (00:40-1:11)
- Type into Terminal the command “git clone” and then paste the repo URL you copied. E.g. “git clone https://github.com/life-itself/web3.git”. Press enter. (1:13-1:48)
  - N.B. When you try this, you may be prompted to install command line developer tools to be able to run git commands, e.g. XCode for Mac. If this is the case, follow the instructions for installation.

##### Stage 3: Branch

In this stage, you create a new ‘branch’, or temporary version, of the repository on which to make edits. These edits will later be merged with the main repository branch.

- Navigate in Terminal to the Life Itself Web3 repo which has been cloned to your computer. To do this, type "cd web3" or "cd `directory`" (as in Stage 2). Press enter. (1:49-2:02)
- Update your local clone of the remote repository. _You don’t need to do this if you’ve only just cloned the repo just now._
  - Type into Terminal “git pull”. Press enter.
- Create a branch on which to make edits
  - Type "git checkout -b `your_branch_name`". E.g. you might name your branch “edits”. So you would type “git checkout -b edits”. This command will create a new branch and switch you to this branch. N.B. the branch name cannot contain spaces.

##### Stage 4: Edit

In this stage, you use either a code editor, such as VS Code (see 4a), or Obsidian (see 4b) to view and edit the website’s Markdown files.

###### 4a: VS Code

- Open VS Code
- Click the ‘Explorer’ icon at the top left hand side of the window. Then click ‘Open Folder’ to open the Life Itself Web3 repo which you cloned. You will then be able to see the list of folders from the repo on the left side of the window. (2:03-3:35)
- Find the file that corresponds with the page you want to edit.\* (3:31-4:03)
- Make your edits and save

###### 4b: Obsidian

- Open Obsidian
- Open the cloned github repo folder as a vault (10:07)
- Find the file that corresponds with the page you want to edit.\*
- Make your edits and save.
  - See video tutorial (13:05-15:26) for info on useful Obsidian features such as shortcuts for linking to other pages.

\*N.B. To find the file that corresponds with the page you want to edit, it might help to look at the page URL. E.g. To find the file containing the “Blockchain” page ([https://web3.lifeitself.us/concepts/blockchain](https://web3.lifeitself.us/concepts/blockchain)), go to the folder “concepts“, then the file “blockchain.md”.

##### Stage 5: Pull request

In this stage, you prepare the changes you have made (and saved) to a Markdown file to be published on the website.

- Go to your computer’s Terminal (4:59-5:08)
- Type “git status”. Press enter. (5:09-5:30)
- Type "git add `name of modified file`". E.g. “git add site/content/test.md”. Press enter. (5:31-6:06) If you’ve edited more than one file, you can type “git add.” to add all the modified files with one command.
- Type "git commit -m “`description of edit`"". E.g. "git commit -m “fix typo”" or "git commit -m “add extra text to definition”". Press enter. Note that the description of the edit must be in double quotation marks. (6:07-7:01)
- Type "git push origin `your_branch_name`", replacing `your_branch_name` with the name of the branch you create.
- Submit your changes for review: Go to your Github repo and click on the “Compare & pull request” button. Add a description and submit the pull request.
- Someone from our team will review and confirm the merge. Once they’ve done that, your edit will appear on the site! Thanks for contributing!

##### Resolving merge conflicts

On occasion, it is possible that after submitting a pull request you may get a message flagging merge conflicts. This could be because when you were making your changes, someone else might have pushed new changes to the same content you were editing. If this happens, see here for what to do to [resolve a merge conflict](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts/resolving-a-merge-conflict-using-the-command-line).

# Contact

If you run into any issues while following this guide, please [let us know](https://lifeitself.us/contact/) so we can improve this guide to help future contributors.
