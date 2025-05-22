---
metatitle: 'How to automate CKAN resource creation with Cloudflare Workers'
metadescription: How to set up and integrate Cloudflare Workers, Queues, and Notifications to automate the linking of uploaded resources in CKAN.
title: 'Automating CKAN Resource Uploads with Cloudflare R2, Queues, and Workers'
description: 'How to set up and integrate Cloudflare Workers, Queues, and Notifications to automate the linking of uploaded resources in CKAN.'
---

## Introduction

This guide explains how to set up and integrate Cloudflare Workers, Queues, and Notifications to automate the linking of uploaded resources in CKAN.

Overview of the Workflow:

- Users upload files via a pre-signed URL to Cloudflare R2.
- Cloudflare R2 triggers an event notification upon upload.
- A Cloudflare Queue stores the event and forwards it to a Worker.
- The Cloudflare Worker processes the event and updates CKAN with the uploaded file's URL and metadata.

## 1. Cloudflare R2 Bucket Setup (skip this step if you already have a bucket)

Cloudflare R2 serves as the file storage where CKAN users' uploaded resources will be stored.

Steps to Create an R2 Bucket:

- Log in to the Cloudflare Dashboard and select your account.
- Navigate to R2 Storage and click Create Bucket.
- Enter a Bucket Name (e.g., my-ckan-bucket).
- Set Public Access to Private.
- Click Create Bucket.

## 2. Create a Cloudflare Queue

Cloudflare Queues handle incoming event messages when a file is uploaded to R2.

Steps to Create a Queue:

- Go to Cloudflare Dashboard → Select your account.
- Navigate to Workers & Queues → Click Queues.
- Click Create Queue.
- Enter a Queue Name (e.g., r2-file-uploads).
- Click Create.

## 3. Setup R2 Bucket Notification

A notification event is required to trigger an action when a file is uploaded.

Steps to Create an R2 Event Notification:

- Open Cloudflare Dashboard → Navigate to R2 Buckets.
- Select your Bucket (e.g., my-ckan-bucket).
- Navigate to Notifications → Click Create Notification.
- Set Destination to Cloudflare Queues.
- Select the Queue: r2-file-uploads.
- Set Filters:

Prefix: resources/api_uploads/
Event Types: PutObject, CopyObject, CompleteMultipartUpload

- Click Save.

🔹 Now, every time a file is uploaded to R2, an event is sent to the queue.

## 4. Deploy Cloudflare Worker

The Cloudflare Worker listens to the queue and updates CKAN.

Steps to Create a Worker:

- Navigate to Workers in the Cloudflare Dashboard.
- Click Create Application → Choose Worker.
- Enter Worker Name (e.g., r2-resource-imageurl-updater).
- Click Create Worker.
- Go to Variables & Bindings → Add the following:

```javascript
Queue Binding
Name: R2_FILE_UPLOADS_QUEUE
Type: Queue
Queue: r2-file-uploads
Environment Variable
Name: CKAN_API_KEY
Value: Your CKAN API Key
```

- Replace the default worker code with the following:

```javascript
export default {
  async queue(batch, env, ctx) {
    for (const message of batch.messages) {
      try {
        let data;


        if (typeof message.body === "string") {
          data = JSON.parse(message.body);
        } else if (typeof message.body === "object") {
          data = message.body;
        } else {
          throw new Error("Unexpected message body format");
        }


        console.log("Received R2 Event:", data);


        const objectKey = data?.object?.key;
        const resourceId = objectKey.replace("resources/api_uploads/", "");


        const fileUrl = `https://blob.datopian.com/${objectKey}`;
        console.log("Updating CKAN with URL:", fileUrl);


        // Fetch file metadata
        const metadataResponse = await fetch(fileUrl, { method: "HEAD" });


        if (!metadataResponse.ok) {
          console.error("Failed to fetch metadata from R2:", await metadataResponse.text());
          continue;
        }


        const fileType = metadataResponse.headers.get("Content-Type") || "application/octet-stream";
        console.log("Detected MIME Type:", fileType);


        // Call CKAN resource_update API
        const ckanApiUrl = "https://your-ckan-instance.com/api/3/action/resource_update";
        const ckanApiKey = env.CKAN_API_KEY;


        const updatePayload = { id: resourceId, url: fileUrl, format: fileType };


        const response = await fetch(ckanApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": ckanApiKey
          },
          body: JSON.stringify(updatePayload)
        });


        if (!response.ok) {
          console.error("CKAN API Error:", await response.text());
        } else {
          console.log("CKAN update successful!");
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    }
  }
};
```

- Click Deploy.

## 5. Link the Worker to the Queue

- Go to Workers → Open r2-resource-imageurl-updater.
- Navigate to Triggers → Click Add Queue Trigger.
- Select Queue: r2-file-uploads.
- Click Save.

## 6. Verify the Setup

Test Uploading a File:

- Create a CKAN resource via API:

`POST /api/3/action/resource_create`

```javascript
{
    "package_id": "dataset-id",
    "name": "My File"
}
```

Response:

```javascript
{
    "id": "resource-id",
    "presigned_url": "https://s3.r2.cloudflarestorage.com/my-bucket/resources/api_uploads/resource-id"
}
```

- Upload a file using the pre-signed URL:

```bash
curl -X PUT "https://s3.r2.cloudflarestorage.com/my-bucket/resources/api_uploads/resource-id" \
  -H "Content-Type: application/pdf" \
  --data-binary "@myfile.pdf"
```

- Check Cloudflare Worker logs (Dashboard → Workers → Logs).
- Verify in CKAN if the resource's url is updated.

## Conclusion

With this setup, CKAN users can now upload files via API, and the system will automatically:

✅ Trigger an event notification when a file is uploaded.
✅ Queue the event for processing.
✅ Process the event with a Cloudflare Worker to update CKAN.

🔹 This solution automates resource linking without requiring additional API calls from users. 🚀