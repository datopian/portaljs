---
title: 'Tutorial 1: Create a website from scratch using Markdown and Flowershow'
date: 2023-06-20
authors: ['Ola Rubaj']
filetype: 'blog'
---

In this tutorial we will walk you through creating an elegant, fully functional website written in simple markdown and published with Flowershow.

By the end of this tutorial you will:

- have a working markdown-based website powered by Flowershow.
- be able to edit the text and add pages, all from an online interface without installing anything.

Below is a screenshot of how the final website will look like:
![[tutorial-1-result.png]]

## Prerequisites

- A [GitHub](https://github.com/) account.
- A [Vercel](https://vercel.com/) account. You can set it up using your GitHub account.

## Setting up a sandbox website

### 1. Navigate to the [datopian/flowershow repository](https://github.com/datopian/flowershow).

### 2. Scroll down and click on the "Deploy" button

After clicking on it, you'll be redirected to Vercel's "Create Git Repository" page.

![Step 2 screenshot](https://images.tango.us/workflows/9bef984b-9dd1-4c07-ae32-88bb426c306e/steps/35cb9df6-d93e-4ce6-9741-54be744cf9e7/55ca0e14-6780-40e3-9ecc-148a7fa7c08e.png?crop=focalpoint&fit=crop&fp-x=0.0945&fp-y=0.4783&fp-z=2.5970&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=162&mark-y=440&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0yNjUmaD03MiZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 3. Select your GitHub account in "Git Scope"

Click on "Select Git Scope" dropdown and select your GitHub account name from the list if it's there.

![Step 3 screenshot](https://images.tango.us/workflows/9bef984b-9dd1-4c07-ae32-88bb426c306e/steps/bdd61961-e1fe-4282-abec-75ae66bfeaa5/85df39b9-51a8-410a-a83b-93f2d2d6256c.png?crop=focalpoint&fit=crop&fp-x=0.2455&fp-y=0.4226&fp-z=1.4615&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=94&mark-y=427&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz02NzQmaD05OSZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

If your GitHub account is not available in the dropdown list, click on "Add GitHub Account"...

![Step 3 screenshot](https://images.tango.us/workflows/9bef984b-9dd1-4c07-ae32-88bb426c306e/steps/879ebed5-fec7-443e-8be9-66b73a4ec044/583f8a42-fc35-43d8-b791-70e22976ed46.png?crop=focalpoint&fit=crop&fp-x=0.2455&fp-y=0.5030&fp-z=1.5031&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=113&mark-y=429&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz02NTkmaD05NCZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

...and authorize Vercel to access your GitHub repositories by clicking "Install".

![Step 3 screenshot](https://images.tango.us/workflows/9bef984b-9dd1-4c07-ae32-88bb426c306e/steps/61441f7d-ccc4-45ca-b52d-4ccc0573d787/ff97c393-2fff-407e-abe2-bc96c18562cc.png?crop=focalpoint&fit=crop&fp-x=0.2922&fp-y=0.7621&fp-z=2.4427&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=440&mark-y=385&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0zMjEmaD0xMjgmZml0PWNyb3AmY29ybmVyLXJhZGl1cz0xMA%3D%3D)

Now you can select your GitHub account.

![Step 3 screenshot](https://images.tango.us/workflows/9bef984b-9dd1-4c07-ae32-88bb426c306e/steps/d2382391-f4bc-4ffe-b8e8-e22b9f6550ad/f4817109-ae2e-49f9-98ad-2f8dfe9a5b3b.png?crop=focalpoint&fit=crop&fp-x=0.2455&fp-y=0.5833&fp-z=1.5031&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=113&mark-y=429&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz02NTkmaD05NCZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 4. Give your repository a name

A good practice is to use lowercase and dashes.

![Step 4 screenshot](https://images.tango.us/workflows/9bef984b-9dd1-4c07-ae32-88bb426c306e/steps/a9b6af4c-4645-4b93-9c28-75d23e7f48a3/55dcaf47-8851-4808-ab9e-6fe6c4d552aa.png?crop=focalpoint&fit=crop&fp-x=0.6919&fp-y=0.4929&fp-z=1.7767&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=57&mark-y=416&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0xMDg2Jmg9MTIxJmZpdD1jcm9wJmNvcm5lci1yYWRpdXM9MTA%3D)

### 5. Click on "Create" and wait until the site deploys

After you click "Create", Vercel will create a new repository on your GitHub account, using the `datopian/flowershow` repository as a template. Then, it will immediately start buidling the initial version of your website. This may take about 1-2 minutes.

![Step 5 screenshot](https://images.tango.us/workflows/9bef984b-9dd1-4c07-ae32-88bb426c306e/steps/ae740310-736d-48e5-9fbf-cf567a2ff966/2bc653a7-0e6c-4eaa-a11b-85a2a4d4c1d3.png?crop=focalpoint&fit=crop&fp-x=0.5007&fp-y=0.5152&fp-z=1.0564&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=33&mark-y=379&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0xMTM0Jmg9MTk1JmZpdD1jcm9wJmNvcm5lci1yYWRpdXM9MTA%3D)

### 6. See your published website!

And voila! Your site is up and running. Once on the "Congratulations" screen, navigate to the project dashboard...

![Step 6 screenshot](https://images.tango.us/workflows/9bef984b-9dd1-4c07-ae32-88bb426c306e/steps/1df8967e-2bcf-43ec-b3d0-a9d638d21ff7/af6d363d-2872-4a45-b5e5-16ca754e4702.png?crop=focalpoint&fit=crop&fp-x=0.5005&fp-y=0.3351&fp-z=1.8197&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=328&mark-y=414&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz01NDUmaD0xMjQmZml0PWNyb3AmY29ybmVyLXJhZGl1cz0xMA%3D%3D)

... and click on "Visit" to see your published website!

![Step 6 screenshot](https://images.tango.us/workflows/9bef984b-9dd1-4c07-ae32-88bb426c306e/steps/319f8eef-5007-4885-a3d6-6dc7fd7472ea/80b34413-f7da-4765-90d6-89a93fb4eab5.png?crop=focalpoint&fit=crop&fp-x=0.0697&fp-y=0.3482&fp-z=2.5500&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=72&mark-y=390&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0yODImaD0xNzQmZml0PWNyb3AmY29ybmVyLXJhZGl1cz0xMA%3D%3D)

## Editing a page on your website

Once your site is up and running, the next step is to customize it to your liking. Let's start by editing our home page.

### 1. Navigate to the repository of your website on GitHub

You can get there by going to GitHub, clicking on your profile icon, and going to "Your repositories".

![Step 1 screenshot](https://images.tango.us/workflows/5b5166f4-2965-4a91-9bec-47108fe34234/steps/adecdf18-e46a-4003-984e-1dc1945963df/6792cf00-20fc-4e24-88ca-8d35a41aadab.png?crop=focalpoint&fit=crop&fp-x=0.9589&fp-y=0.0345&fp-z=3.0108&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=992&mark-y=53&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0xMjAmaD05MiZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

![Step 1 screenshot](https://images.tango.us/workflows/5b5166f4-2965-4a91-9bec-47108fe34234/steps/8578ff07-5dc9-4908-bc81-197293970344/9b01a3fb-47fe-48ed-a7bc-c9910e9e42ef.png?crop=focalpoint&fit=crop&fp-x=0.8963&fp-y=0.1997&fp-z=2.9422&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=553&mark-y=420&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz01NjImaD0xMTImZml0PWNyb3AmY29ybmVyLXJhZGl1cz0xMA%3D%3D)

Or, you can navigate to [your Vercel dashboard](https://vercel.com/dashboard), select your project in the "Overview" tab...

![Step 1 screenshot](https://images.tango.us/workflows/4aa9bd80-6829-415e-b3a8-6136bfb176eb/steps/b7f96b7d-28b1-4366-b889-681b327b5f40/a0d2bffd-2e81-4878-854b-0766cf710339.png?crop=focalpoint&fit=crop&fp-x=0.2578&fp-y=0.4408&fp-z=1.3063&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=39&mark-y=274&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz03MzAmaD00MDQmZml0PWNyb3AmY29ybmVyLXJhZGl1cz0xMA%3D%3D)

...and click on "Git Repository". You'll be redirected to the repository of your website on GitHub.

![Step 1 screenshot](https://images.tango.us/workflows/4aa9bd80-6829-415e-b3a8-6136bfb176eb/steps/2cfbda16-23dc-45b2-9be9-a4b5b3a255d1/da2be1ca-da13-4257-a830-3ece2b89ff51.png?crop=focalpoint&fit=crop&fp-x=0.4560&fp-y=0.4590&fp-z=1.1707&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=321&mark-y=313&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0yMjYmaD04MCZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 2. Navigate to the "content" folder

This is where all the Markdown-based pages live in a Flowershow-based project.

![Step 2 screenshot](https://images.tango.us/workflows/4aa9bd80-6829-415e-b3a8-6136bfb176eb/steps/4ce5b74e-40e5-4c3f-a3ce-be7fa8959489/25b9ddc8-c1df-44f8-bf3e-7d08960f0592.png?crop=focalpoint&fit=crop&fp-x=0.0900&fp-y=0.4574&fp-z=2.8680&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=226&mark-y=441&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0xNjgmaD03MCZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 3. Edit the "index.md" file

The homepage on your website is built with the "index.md" file in the root of the "content" folder. Click on it to open.

![Step 3 screenshot](https://images.tango.us/workflows/4aa9bd80-6829-415e-b3a8-6136bfb176eb/steps/b14c059d-89e4-419b-8ac4-0e219ed195af/4d86a32a-b5f8-48d1-bccd-ddbfd140fe5a.png?crop=focalpoint&fit=crop&fp-x=0.0754&fp-y=0.4711&fp-z=2.7997&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=157&mark-y=442&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0xOTImaD02OCZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

Then, click on the "Edit this file" icon...

![Step 3 screenshot](https://images.tango.us/workflows/4aa9bd80-6829-415e-b3a8-6136bfb176eb/steps/e4d28cd5-3863-46e3-813d-5304ec0d769f/ce2bf765-9bef-4d96-8354-0eed3aa88c03.png?crop=focalpoint&fit=crop&fp-x=0.9435&fp-y=0.3449&fp-z=2.9525&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=945&mark-y=422&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0xMDkmaD0xMDkmZml0PWNyb3AmY29ybmVyLXJhZGl1cz0xMA%3D%3D)

... and add some content.

![Step 3 screenshot](https://images.tango.us/workflows/4aa9bd80-6829-415e-b3a8-6136bfb176eb/steps/daad6528-db93-426c-8b8b-ae67d0a28189/a5767c01-a16e-4c4b-b4a0-5595663b175d.png?crop=focalpoint&fit=crop&fp-x=0.5170&fp-y=0.3762&fp-z=1.0470&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=7&mark-y=300&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0xMTg2Jmg9MTUwJmZpdD1jcm9wJmNvcm5lci1yYWRpdXM9MTA%3D)

### 4. Save your changes

To see your changes live, you need to "commit" them. Click on "Commit changes..." buttom in the top-tight corner.

![Step 4 screenshot](https://images.tango.us/workflows/4aa9bd80-6829-415e-b3a8-6136bfb176eb/steps/74159a33-2897-4ffb-af3d-ce2fa109e570/0e96f7a4-b4ff-418e-9b44-73573a4354d1.png?crop=focalpoint&fit=crop&fp-x=0.9227&fp-y=0.2208&fp-z=2.9167&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=696&mark-y=417&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz00NjgmaD0xMTkmZml0PWNyb3AmY29ybmVyLXJhZGl1cz0xMA%3D%3D)

In the "Commit message" field add a concise description of your changes. Optionally, if the commit message is not enough, you can add more info in the "Extended description" field.

![Step 4 screenshot](https://images.tango.us/workflows/4aa9bd80-6829-415e-b3a8-6136bfb176eb/steps/09130863-221f-436e-bab0-a46bea2fd5c4/bdbd1458-3b5c-4352-a8fb-5921132ee3e4.png?crop=focalpoint&fit=crop&fp-x=0.4998&fp-y=0.3476&fp-z=1.4555&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=262&mark-y=447&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz02NzYmaD01OCZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

Leave "Commit directly to `main` branch" selected and click on "Commit changes". Doing that will trigger rebuilding of your site on Vercel.

![Step 4 screenshot](https://images.tango.us/workflows/4aa9bd80-6829-415e-b3a8-6136bfb176eb/steps/40bf87e4-a2b1-4a99-97da-5e87530d0622/88a19d05-ce63-4da0-9e85-e427b063245e.png?crop=focalpoint&fit=crop&fp-x=0.5545&fp-y=0.5989&fp-z=1.3207&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=612&mark-y=616&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0yMDcmaD01NSZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 5. See your site getting rebuild

If you want to see the current progress of rebuilding your website after you've commited the changes, click on the dot next to your commit message.

> [!note]
> It will be either a dot (if the site is currently being rebuilt after your changes), a check mark (if the site has finished building) or a cross (if something went wrong when rebuilding it).

![Step 5 screenshot](https://images.tango.us/workflows/4aa9bd80-6829-415e-b3a8-6136bfb176eb/steps/0d273173-d852-47e4-b41e-418b9196e0fd/fbf1afe6-7af3-4b06-8ab0-d3c41d2923ce.png?crop=focalpoint&fit=crop&fp-x=0.5000&fp-y=0.5000&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n)

Click on "Details" to see your project's deployment status on Vercel.

![Step 5 screenshot](https://images.tango.us/workflows/4aa9bd80-6829-415e-b3a8-6136bfb176eb/steps/94b4e4ab-458c-4be9-b7a9-e34c7b4185b9/645687a4-b91d-4870-a935-48403b8ce33c.png?crop=focalpoint&fit=crop&fp-x=0.5000&fp-y=0.5000&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n)

### 6. Preview your site after changes

Once the site has been rebuilt, click the preview to see your changes live.

![Step 6 screenshot](https://images.tango.us/workflows/4aa9bd80-6829-415e-b3a8-6136bfb176eb/steps/a1294580-7d0d-492c-a880-32040b4bee48/5e7ddd43-03e3-4545-b1b3-cd631da401d8.png?crop=focalpoint&fit=crop&fp-x=0.2207&fp-y=0.3824&fp-z=1.4465&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=43&mark-y=261&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz02NzkmaD00MzEmZml0PWNyb3AmY29ybmVyLXJhZGl1cz0xMA%3D%3D)

## Add a single Markdown-based page

### 1. Navigate to the "content" folder in your website's repository

See how to find it in the previous section.

### 2. Create new file

Click on "Add file"...

![Step 2 screenshot](https://images.tango.us/workflows/c14ae6dc-9e15-49f5-af87-b513daa701ba/steps/1708e4fa-8234-4393-a8e9-cd972afce770/b986ab26-d53f-4b57-8520-fb87782dfb22.png?crop=focalpoint&fit=crop&fp-x=0.9119&fp-y=0.2208&fp-z=2.9167&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=737&mark-y=417&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0zMDkmaD0xMTkmZml0PWNyb3AmY29ybmVyLXJhZGl1cz0xMA%3D%3D)

...and "Create new file".

![Step 2 screenshot](https://images.tango.us/workflows/c14ae6dc-9e15-49f5-af87-b513daa701ba/steps/e79d32ef-9385-4903-8ca1-408f78752633/7006ac1c-796c-4bb6-95ef-dd4d9969c9b6.png?crop=focalpoint&fit=crop&fp-x=0.8712&fp-y=0.2679&fp-z=2.9167&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=476&mark-y=417&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz01NDcmaD0xMTkmZml0PWNyb3AmY29ybmVyLXJhZGl1cz0xMA%3D%3D)

### 3. Type the name of the new file you want to create

![Step 3 screenshot](https://images.tango.us/workflows/c14ae6dc-9e15-49f5-af87-b513daa701ba/steps/54c786cb-15d6-4abe-8893-fa95dff3ed0a/c39152b2-f446-4e39-a2f3-9b3cf0e7c193.png?crop=focalpoint&fit=crop&fp-x=0.3476&fp-y=0.2214&fp-z=2.1864&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=394&mark-y=418&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz00MTMmaD04NyZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 4. Write the content of the file

![Step 4 screenshot](https://images.tango.us/workflows/c14ae6dc-9e15-49f5-af87-b513daa701ba/steps/8ffe1e8c-45f9-42b7-8053-bc8bc61b098c/56489034-d5a9-495e-8fb7-1fbfff62d7f3.png?crop=focalpoint&fit=crop&fp-x=0.5170&fp-y=0.3440&fp-z=1.0470&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=7&mark-y=300&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0xMTg2Jmg9ODYmZml0PWNyb3AmY29ybmVyLXJhZGl1cz0xMA%3D%3D)

### 5. Save your changes

To see your changes live, you need to "commit" them. Click on "Commit changes..." buttom in the top-tight corner.

![Step 5 screenshot](https://images.tango.us/workflows/c14ae6dc-9e15-49f5-af87-b513daa701ba/steps/382d133d-19f3-4aee-a0fa-535fcb361090/fe7b1fc6-c8f0-4f3f-958a-204c4fc65cf8.png?crop=focalpoint&fit=crop&fp-x=0.9227&fp-y=0.2208&fp-z=2.9167&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=696&mark-y=417&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz00NjgmaD0xMTkmZml0PWNyb3AmY29ybmVyLXJhZGl1cz0xMA%3D%3D)

In the "Commit message" field add a concise description of your changes. Optionally, if the commit message is not enough, you can add more info in the "Extended description" field.

![Step 5 screenshot](https://images.tango.us/workflows/c14ae6dc-9e15-49f5-af87-b513daa701ba/steps/13c5873d-4071-4ae2-b641-d6202631076c/53029856-5543-4681-919a-092ed2dacb02.png?crop=focalpoint&fit=crop&fp-x=0.4998&fp-y=0.3476&fp-z=1.4555&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=262&mark-y=447&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz02NzYmaD01OCZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

Leave "Commit directly to `main` branch" selected and click on "Commit changes". Doing that will trigger rebuilding of your site on Vercel.

![Step 5 screenshot](https://images.tango.us/workflows/c14ae6dc-9e15-49f5-af87-b513daa701ba/steps/68002c21-451a-4536-89b6-8a0d01d327eb/bb71cbb3-7a79-45f3-a71e-2500a380556c.png?crop=focalpoint&fit=crop&fp-x=0.6278&fp-y=0.7315&fp-z=2.3207&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=418&mark-y=428&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0zNjUmaD05NyZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 6. Preview your site after changes

As you already know, Vercel will now start rebuilding your website. When it's done, you can navigate to `/about` url on your website to see the new file we've just added.

## What's next?

While editing on GitHub UI is acceptable, it has its limitations – it doesn't support working offline, adding multiple files simultaneously, or previewing many markdown syntax elements supported by Flowershow-based websites. We'll delve into these issues and solutions to overcome them in our next tutorial. Stay tuned!
