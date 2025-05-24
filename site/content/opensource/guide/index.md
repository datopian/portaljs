---
title: Dataset Management in PortalJS Cloud
description: Learn how to use PortalJS Cloud via Admin panel or API
---

## Introduction

PortalJS Cloud is a powerful data management platform that enables users to create, manage, and migrate datasets seamlessly via an intuitive UI and API. This document provides a guide to using PortalJS Cloud through the Admin Dashboard, API, and CLI.

## 1. Using PortalJS Cloud via UI (Admin Dashboard)

PortalJS Cloud provides an Admin Dashboard for managing datasets without requiring technical knowledge. Users can:

- Create new datasets.
- Upload resources (files) directly.
- Manage metadata for datasets.
- View and search existing datasets.

### Steps to Use the Admin Dashboard

- Login to the PortalJS Cloud Admin Dashboard.
![PortalJS Cloud Login](/static/img/docs/portaljs-login.webp)

- Click on "Add Dataset"
![Add Dataset](/static/img/docs/portaljs-add-dataset.webp)

- Upload a resource (file).
![Upload Resource](/static/img/docs/portaljs-create-resource.webp)

- Enter the dataset name, description, and relevant metadata (or use the AI generated fields).
![Dataset Metadata](/static/img/docs/portaljs-dataset-metadata.webp)

- Publish the dataset.
![AI Metadata](/static/img/docs/portaljs-ai-metadata.webp)

- Access and manage datasets via the dashboard.
![PortalJS Cloud Dashboard](/static/img/docs/portaljs-dashboard.webp)

## 2. Creating Datasets via API

For programmatic access, users can create datasets via API. The API allows dataset creation, metadata updates, and resource uploads.

### API Endpoint for Creating a Dataset

Endpoint:

```javascript
POST /api/3/action/package_create
```

Request Payload:

```javascript
{
  "name": "sample-dataset",
  "title": "Sample Dataset",
  "notes": "This is a test dataset",
  "owner_org": "example-org"
}
```

Response:

```javascript
{
  "success": true,
  "result": {
    "id": "dataset-id",
    "name": "sample-dataset"
  }
}
```

## 3. Migrating Existing Datasets via API or CLI

### Migrating via API

To migrate an existing dataset, use the package_create or package_update endpoints.

Example:

```javascript
POST /api/3/action/package_update
```

Request Payload:

```javascript
{
  "id": "existing-dataset-id",
  "title": "Updated Dataset Title",
  "resources": [
    {
      "url": "https://example.com/data.csv",
      "format": "CSV"
    }
  ]
}
```

### Migrating via CLI

For bulk migration, use the CLI tool:

```bash
ckanapi dump datasets -r https://old-portal.com/api/3/ \
| ckanapi load datasets -c portaljs_config.ini
```

## 4. Authentication & Configuration for API Access

PortalJS Cloud uses API keys for authentication. To access the API:

- Obtain an API key from the Admin Dashboard.
- Include it in the Authorization header in API requests.

Example:

- Authorization: API_KEY_GOES_HERE
- Configuration File (For CLI Usage)
- Create a configuration file (portaljs_config.ini):

```javascript
[portaljs]
api_key = YOUR_API_KEY
base_url = https://portaljs.com/api/3/
```

## 5. Using resource_upload and resource_create

### resource_upload Endpoint

This API generates a pre-signed URL for direct resource uploads.

Endpoint:

```javascript
POST /api/3/action/resource_upload
```

Request Payload:

```javascript
{
  "id": "resource-id"
}
```

Response:

```javascript
{
  "presigned_url": "https://storage.portaljs.com/resources/api_uploads/resource-id"
}
```

How to Use:

- Request a pre-signed URL using resource_upload.
- Upload the file using an HTTP PUT request to the returned URL.

Example file upload:


```bash
curl -X PUT -T "data.csv" "https://storage.portaljs.com/resources/api_uploads/resource-id"
```

### resource_create Endpoint

This API creates a new resource and generates a pre-signed URL automatically.

Endpoint:

```javascript
POST /api/3/action/resource_create
```

Request Payload:

```javascript
{
  "package_id": "dataset-id",
  "name": "Sample Resource",
  "format": "CSV"
}
```

Response:

```javascript
{
  "id": "new-resource-id",
  "presigned_url": "https://storage.portaljs.com/resources/api_uploads/new-resource-id"
}
```

How to Use:

- Call resource_create to create a new resource.
- The response includes a presigned_url.
- Upload the file using the provided URL.

## 6. Clear Examples

Creating a Dataset via API

```bash
curl -X POST https://portaljs.com/api/3/action/package_create \
     -H "Authorization: API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"name": "sample-dataset", "title": "Sample Dataset", "owner_org": "example-org"}'
```

Uploading a File via resource_upload

```bash
curl -X POST https://portaljs.com/api/3/action/resource_upload \
     -H "Authorization: API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"id": "resource-id"}'
```

Migrating a Dataset

```bash
ckanapi dump datasets -r https://old-portal.com/api/3/ | ckanapi load datasets -c portaljs_config.ini
```

## Conclusion

This documentation provides a step-by-step guide for using PortalJS Cloud via the UI, API, and CLI. It covers dataset creation, migration, authentication, and resource management, including how to use resource_upload and resource_create for seamless file uploads.
For further assistance, refer to the official documentation or contact support.
