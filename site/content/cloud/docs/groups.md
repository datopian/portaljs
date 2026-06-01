---
title: "Groups"
description: "Create and manage groups to categorize datasets in PortalJS Cloud."
---


Groups categorize datasets thematically — for example, "Health", "Transport", "Open Budgets". A dataset can belong to multiple groups. Groups map to CKAN groups in the underlying catalog.

## Permissions

Browsing groups is available to every signed-in user. Creating, editing, and deleting groups requires **sysadmin** privileges — that is, admin of the portal's main organization (see [Organizations → Managing sysadmins](/cloud/docs/organizations#managing-sysadmins)).

| Action | Required role |
|--------|---------------|
| Browse groups | Any signed-in user |
| Assign a dataset to a group | Editor or admin of the dataset's organization |
| Create, edit, delete groups | Sysadmin |

Users without sysadmin privileges do not see the **Add group**, **Edit**, or **Delete** controls.

## Browse groups

1. In the sidebar, click **Groups**.

   ![placeholder: groups list](/static/img/cloud-docs/groups-list.png)

2. The table lists all groups in your portal. Sysadmins additionally see selection checkboxes and **Edit** actions on each row.

## Create a group

1. On the **Groups** page, click **Add group**.

   ![placeholder: add group button](/static/img/cloud-docs/group-add-button.png)

2. Fill in the form fields (see [Group fields](#group-fields)).

   ![placeholder: create group form](/static/img/cloud-docs/group-create-form.png)

3. Click **Create group**. The new group appears in the list.

   ![placeholder: create group form](/static/img/cloud-docs/group-creatd.png)

## Edit a group

1. From the **Groups** list, click **Edit** on the group's row. The edit form opens in a modal.
2. Update the fields and click **Apply changes**.

   ![placeholder: edit group form](/static/img/cloud-docs/group-edit-form.png)

## Delete a group

1. On the **Groups** list, tick the checkbox to the left of each group you want to delete. Use the header checkbox to select all.

   ![placeholder: select groups for deletion](/static/img/cloud-docs/group-bulk-select.png)

2. Click **Delete all** in the toolbar that appears above the table.
3. Confirm.

Datasets previously assigned to the group remain — only their association with this group is removed.

## Assigning datasets to groups

Open a dataset, edit it, and use the **Groups** field to add or remove group associations. See [Datasets → Edit](/cloud/docs/datasets#edit-a-dataset). A dataset can belong to any number of groups.

## Group fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **Title** | string | yes | Human-readable name shown across the portal. |
| **Name** | string (slug) | yes | URL-safe identifier. Cannot contain spaces or the characters `.`, `+`, `&`. Use lowercase letters, numbers, and dashes. |
| **Description** | text | no | Summary of what the group covers. |
| **Image** | URL | no | Logo or banner uploaded for the group. |
