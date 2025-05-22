---
metatitle: 'How to enable direct file uploads to Cloudflare on CKAN'
metadescription: This setup allows users to upload resources directly via the API while seamlessly integrating with Cloudflare R2 storage. 
title: 'Enabling Direct File Uploads via API in CKAN with Cloudflare R2'
description: 'This setup allows users to upload resources directly via the API while seamlessly integrating with Cloudflare R2 storage. '
---

## Files and Modifications Required:

- logic/action.py – Contains API endpoints for generating pre-signed URLs.
- plugin.py – Registers the new API actions.
- Dockerfile – Installs the ckanext-s3filestore dependency.
- .env – Enables the s3filestore plugin in CKAN.

This setup allows users to upload resources directly via the API while seamlessly integrating with Cloudflare R2 storage. 🚀

## 1. API Endpoints Setup in logic/action.py

Create or modify logic/action.py to include the following API functions:

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


        params = {
            'Bucket': bucket_name,
            'Key': object_key,
        }
        presigned_url = s3_client.generate_presigned_url(
            ClientMethod='put_object',
            Params=params,
            ExpiresIn=3600  # URL expires in 1 hour
        )


        return presigned_url
    except ClientError as e:
        log.error({"error": f"Failed to generate presigned URL: {str(e)}"})
        raise ValidationError({"error": f"Failed to generate presigned URL: {str(e)}"})


def resource_upload(context, data_dict):
    resource_id = data_dict.get('id')
    if not resource_id:
        raise ValidationError({"id": "Resource ID is required to generate upload URL."})


    resource = get_action('resource_show')(context, {'id': resource_id})


    try:
        presigned_url = _generate_presigned_url(resource_id)
    except Exception as e:
        log.error(f"Error generating presigned URL: {e}")
        raise ValidationError(f"Error generating presigned URL: {e}")
        
    return {"presigned_url": presigned_url}


@tk.chained_action
def resource_create(up_func, context, data_dict):
    result = up_func(context, data_dict)
    resource_id = result.get("id")
    if not resource_id:
        raise ValidationError({"id": "Resource creation failed, no ID returned."})
    try:
        presigned_url = _generate_presigned_url(resource_id)
    except Exception as e:
        log.error(f"Error generating presigned URL: {e}")
        raise ValidationError(f"Error generating presigned URL: {e}")


    result["presigned_url"] = presigned_url
    return result
```

## 2. Register API Endpoints in plugin.py

Modify plugin.py to register the new actions:

```python
from ckan.plugins import implements, SingletonPlugin
from ckan.plugins.interfaces import IActions


class CustomPlugin(SingletonPlugin):
    implements(IActions)


    def get_actions(self):
        return {
            'resource_upload': resource_upload,
            'resource_create': resource_create,
        }
```
## 3. Install ckanext-s3filestore Dependency in Dockerfile

Modify your Dockerfile to include the following line:

```dockerfile
RUN pip install -r https://raw.githubusercontent.com/luccasmmg/ckanext-s3filestore/75b97dedc4fdbe4dd514c1bece623fd83e6cd988/requirements.txt
```

This ensures that ckanext-s3filestore is installed during the container build.

## 4. Enable s3filestore in .env

Modify your .env file to include s3filestore in the CKAN plugins:


```python
CKAN__PLUGINS = s3filestore`
```

This setup ensures that:

- API endpoints for resource_upload and resource_create are added to logic/action.py.
- Endpoints are registered in plugin.py.
- Required dependencies are installed in the Docker container.
- s3filestore is enabled in CKAN plugins via the .env file.

