---
title: "Visualizations"
description: "Publish and manage visualizations and data apps in PortalJS Cloud."
---


A visualization is a catalog record that points to an externally hosted dashboard, report, or data app via its URL. It is published to your portal alongside datasets and, when public, appears on the public site.

Like a dataset, every visualization **belongs to one organization** and has a **visibility** setting. Who can edit or delete it follows the same organization-membership model — see [Permissions](#permissions).

## Permissions

A visualization is owned by an organization (the **Organization** field is required). Edit and delete rights follow the standard CKAN role model, identical to datasets: editors and admins of the owning organization can manage it. See [Datasets → Permissions](/cloud/docs/datasets#permissions) and [Organizations → Roles](/cloud/docs/organizations#roles).

## Browse visualizations

1. In the sidebar, click **Visualizations**.

   ![placeholder: visualizations list](/static/img/cloud-docs/visualizations-list.png)

2. The table shows each visualization's **Title**, **Name**, **Description**, **Visibility** (Public/Private), **Public access** (a *View online* link, or *No online link* when private), and **External URL** (an *Access* link that opens the hosted visualization in a new tab). The **Actions** column has an **Edit** link.

3. Use the **search bar** above the table to filter by query, organization, group, or tag.

## Publish a visualization

1. From the **Visualizations** page, click **Publish visualization**.

   ![placeholder: publish visualization button](/static/img/cloud-docs/visualizations-publish-button.png)

2. Fill in the form (see [Visualization fields](#visualization-fields) for the complete list). At minimum:
   - **Title**.
   - **External URL** — the address where the visualization is hosted.
   - **Organization** — the owning organization.

   ![placeholder: publish form](/static/img/cloud-docs/visualizations-create-form.png)

3. Click **Create Visualization**. The visualization appears in the table and, if public, on the portal.

![placeholder: publish form](/static/img/cloud-docs/viz-list.png)


## Edit a visualization

1. From the **Visualizations** list, click **Edit** on the visualization's row. This opens the edit page.
2. Update any field and click **Apply Changes**.

   ![placeholder: edit visualization form](/static/img/cloud-docs/visualization-edit.png)

## Delete visualizations

1. On the **Visualizations** list, tick the checkbox to the left of each visualization you want to delete. Use the header checkbox to select all.

   ![placeholder: select visualizations for deletion](/static/img/cloud-docs/visualizations-bulk-select.png)

2. Click **Delete all** in the toolbar that appears above the table.
3. Confirm. Deleted visualizations are removed from both the admin dashboard and the public portal.

## Visibility — public vs private

Each visualization has a **Private** setting:

- **Public** — appears on the public portal; the *View online* link is active.
- **Private** — visible only in the admin dashboard; the list shows *No online link*.

## Visualization fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **Title** | string | yes | Human-readable name shown across the portal. |
| **Name** | string (slug) | yes | URL-safe identifier. Lowercase letters, numbers, underscores, and dashes only. |
| **External URL** | URL | yes | Address of the externally hosted dashboard, report, or data app. |
| **Organization** (`owner_org`) | reference | yes | The organization that owns the visualization. Controls [permissions](#permissions). |
| **Description** | text | no | Summary of what the visualization shows (stored as `notes`). |
| **Tags** | list of strings | no | Free-form keywords. |
| **Groups** | list of references | no | Thematic groups the visualization belongs to. |
| **Author** | string | no | Name of the author. |
| **Author Email** | string | no | Contact email for the author. |
| **Contact Point** | string | no | Primary contact for questions about the visualization. |
| **Language** | string | no | Language of the visualization. |
| **Private** | boolean | no | Hides the visualization from the public portal. |

## Data App Addon (BETA)

If you do not already host a dashboard or report somewhere, the **Data App Addon** can create and deploy one for you. It is powered by the [ObservableHQ Framework](https://observablehq.com/framework/).

1. On the **Visualizations** page, click **Data App** (marked **BETA**).

   ![placeholder: Data App addon button](/static/img/cloud-docs/visualizations-dataapp-button.png)

2. In the modal, enable the addon. PortalJS Cloud then:
   - Creates a GitHub repository for your data app from the [PortalJS Data App Starter template](https://github.com/datopian/portaljs-data-app-starter) and deploys it.
   - Makes it available at `https://app.<your-org>.portaljs.com`.

   ![placeholder: Data App addon modal](/static/img/cloud-docs/visualizations-dataapp-modal.png)

3. Develop your dashboards and reports: run the data app locally, build your content, then push changes to the repository. The app is redeployed with the new content.

4. Publish the result by creating a visualization (see [Publish a visualization](#publish-a-visualization)) whose **External URL** points to your data app.

While the addon is provisioning, the modal shows progress (*Creating your Data App*, *Deploying your Data App*) and, once ready, a **Visit Data App** link and a **Data App GitHub repo** link.
