---
title: 'Enhancing CKAN Resource Uploads via API with Cloudflare R2, Workers, and Queues.'
description: 'Integrating Cloudflare R2 with CKAN revolutionizes resource uploads by enabling direct API-based file storage. Using pre-signed URLs, event-driven processing, and automated metadata updates via Workers and Queues, this approach streamlines uploads, enhances data consistency, and eliminates manual intervention.'
created: 2025-02-26
authors: ['shreyas']
filetype: 'blog'
---

### Introduction
CKAN, a powerful open-source data management system, traditionally stores only metadata about uploaded resources, leaving file storage to external solutions. In our implementation, we used Cloudflare R2 for resource storage, enabling users to upload assets either through a frontend application.

However, we lacked an API-based approach for users to upload files directly. This blog details how we solved this limitation by introducing a new API endpoint for resource uploads and integrating Cloudflare R2 with CKAN using Cloudflare Workers, Queues, and Notifications to automate metadata updates.

### Problem Statement
By default, CKAN only stores metadata for resources, not the actual files. Users could:
- Upload files through the frontend, which would generate and store the file URL in CKAN.
- Provide an external URL directly via the UI or API.

However, there was no provision for users to upload images through the API while ensuring seamless metadata association.

### Solution Approach
We tackled the issue in two steps:
1. Enhancing CKAN API to support pre-signed URLs for uploads.
2. Automating metadata linking after the upload using Cloudflare services.

### Step 1: Modifying and Adding API Endpoints
We introduced two key API improvements:
- **`resource_upload` Endpoint**: Returns a pre-signed URL for an existing resource, allowing users to upload assets directly.
- **Enhanced `resource_create` Endpoint**: Generates a pre-signed URL whenever a new resource is created, enabling direct uploads.

#### Implementation:
```python
from ckanext.s3filestore.uploader import BaseS3Uploader
from ckan.plugins.toolkit import get_action
import ckan.plugins.toolkit as tk
import ckan.logic as logic
import logging

ValidationError = logic.ValidationError
log = logging.getLogger(__name__)

def _generate_presigned_url(resource_id):
    try:
        uploader = BaseS3Uploader()
        s3_client = uploader.get_s3_client()
        bucket_name = uploader.bucket_name
        object_key = f"resources/api_uploads/{resource_id}"

        params = {'Bucket': bucket_name, 'Key': object_key}
        presigned_url = s3_client.generate_presigned_url(
            ClientMethod='put_object', Params=params, ExpiresIn=3600)

        return presigned_url
    except Exception as e:
        log.error(f"Failed to generate presigned URL: {e}")
        raise ValidationError({"error": f"Failed to generate presigned URL: {e}"})

def resource_upload(context, data_dict):
    resource_id = data_dict.get('id')
    if not resource_id:
        raise ValidationError({"id": "Resource ID is required to generate upload URL."})

    get_action('resource_show')(context, {'id': resource_id})
    presigned_url = _generate_presigned_url(resource_id)
    return {"presigned_url": presigned_url}

@tk.chained_action
def resource_create(up_func, context, data_dict):
    result = up_func(context, data_dict)
    resource_id = result.get("id")
    presigned_url = _generate_presigned_url(resource_id)
    result["presigned_url"] = presigned_url
    return result
```
This enhancement enables users to securely upload files via the API without needing to interact with the frontend.

### Step 2: Automating Metadata Linking Using Cloudflare
Once the file is uploaded, we need to link the uploaded file’s metadata with its CKAN resource entry. While the frontend seamlessly handles this by storing the file URL during resource creation, our API-based approach required an additional step to update metadata post-upload.

To automate this process, we leveraged:
- **Cloudflare R2 Event Notifications**
- **Cloudflare Queues**
- **Cloudflare Workers**

#### Why Use These Cloudflare Features?
- **Notifications**: Detect file uploads in real-time.
- **Queues**: Buffer file upload events and handle them asynchronously.
- **Workers**: Process queued events and update CKAN accordingly.

#### Implementation
##### Configuring R2 Event Notifications
- Events triggered for objects in `resources/api_uploads/` on `PutObject`, `CopyObject`, and `CompleteMultipartUpload`.
- Sends an event to the `r2-file-uploads` queue.

##### Processing Events with Cloudflare Worker
```javascript
export default {
  async queue(batch, env, ctx) {
    for (const message of batch.messages) {
      try {
        let data = typeof message.body === "string" ? JSON.parse(message.body) : message.body;
        console.log("Received R2 Event:", data);

        const objectKey = data?.object?.key;
        const resourceId = objectKey.replace("resources/api_uploads/", "");
        const fileUrl = `https://blob.datopian.com/${objectKey}`;

        console.log("Updating CKAN with URL:", fileUrl);

        // Fetch metadata (Content-Type)
        const metadataResponse = await fetch(fileUrl, { method: "HEAD" });
        if (!metadataResponse.ok) continue;

        const fileType = metadataResponse.headers.get("Content-Type") || "application/octet-stream";
        console.log("Detected MIME Type:", fileType);

        // Update CKAN resource metadata
        const ckanApiUrl = "https://demo.dev.datopian.com/api/3/action/resource_update";
        const ckanApiKey = env.CKAN_API_KEY;

        const updatePayload = { id: resourceId, url: fileUrl, format: fileType };
        const response = await fetch(ckanApiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": ckanApiKey },
          body: JSON.stringify(updatePayload)
        });

        if (!response.ok) console.error("CKAN API Error:", await response.text());
        else console.log("CKAN update successful!");
      } catch (error) {
        console.error("Error processing message:", error);
      }
    }
  }
};
```
The provided JavaScript code is a Cloudflare Worker that processes events from a Cloudflare Queue triggered by file uploads to Cloudflare R2 storage. Here's a brief explanation:

1. **Event Processing**: The Worker listens for batch messages from the `r2-file-uploads` queue, which contains details about uploaded files.  

2. **Extracting Metadata**: It extracts the uploaded file's key (path) and derives the `resourceId` from it.  

3. **Fetching File Type**: It makes a `HEAD` request to the file URL to determine the MIME type.  

4. **Updating CKAN**: It sends an API request to CKAN to update the resource metadata (file URL and format).  

5. **Error Handling**: Logs errors if any step fails.  

This automates linking uploaded files to CKAN resources, ensuring seamless metadata updates.

### Future Possibilities
This automation can be extended to other CKAN functionalities, such as:
- Uploading organization or group images via API.
- Supporting other cloud providers (AWS S3, Azure Blob Storage) using their event-driven tools like AWS Lambda and Azure Functions.

### Example Integrations
**AWS S3 → SNS + SQS + Lambda → CKAN API**
- A file is uploaded to an S3 bucket.
- An event notification triggers an SNS topic.
- The SNS topic sends a message to an SQS queue.
- A Lambda function reads the SQS message and updates the CKAN API with the file metadata.

**Azure Blob → Event Grid + Functions → CKAN API**
- A file is uploaded to an Azure Blob Storage container.
- Event Grid detects the upload and triggers an Azure Function.
- The Azure Function extracts metadata and updates the CKAN API accordingly.

These platforms offer similar event-driven mechanisms, making it easy to integrate CKAN with different cloud providers.

### Conclusion
By integrating CKAN APIs with Cloudflare R2, Workers, and Queues, we successfully:
- Enabled direct file uploads via API.
- Automated the linking of uploaded files to CKAN resources.
- Leveraged event-driven processing to ensure seamless user experience.

This approach reduces API complexity for users while maintaining data consistency across systems. With similar integrations, CKAN can be extended to other cloud storage providers, enabling flexible and scalable data management.

