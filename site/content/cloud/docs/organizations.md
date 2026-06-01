---
title: "Organizations"
description: "Manage organizations, members, roles, and sysadmins in PortalJS Cloud."
---


Organizations own datasets and control who can edit them. Every dataset belongs to exactly one organization. Every PortalJS Cloud account has a **main organization** created at sign-up; you can add more.

> **Note:** Creating and deleting organizations requires **sysadmin** privileges (admin of the main organization). Editing an organization requires admin role on that specific organization.

## The main organization

The **main organization** is created automatically when you sign up. Its slug (name) matches your portal subdomain — `<main-org-slug>.portaljs.com` — and admins of the main organization are the portal's **sysadmins** (see [Roles](#roles)).

Because the main organization underpins the portal itself, it is subject to special constraints:

- **Its slug (Name) cannot be changed.** On the edit form, the **Name** field is disabled for the main organization. You can still update its Title, Description, and Image.
- **It cannot be deleted.** Attempting to delete it returns: *"Main organization cannot be deleted."*

All other organizations you create have no such restrictions.

## Managing sysadmins

A **sysadmin** is simply an **admin of the main organization**. Sysadmins have full control over the entire portal: every organization, every dataset, plus the ability to create organizations and groups.

- **The user who created the portal is automatically an admin of the main organization, and therefore a sysadmin.** This happens during sign-up — no extra setup is required.
- **To create additional sysadmins, add users to the main organization with the Admin role.** Open the main organization, go to the **Members** tab, and invite the user (or change an existing member's role) to **Admin**. They immediately gain sysadmin privileges across the whole portal. See [Manage members](#manage-members).

To revoke sysadmin access, change the user's role in the main organization away from Admin, or remove them from the main organization.

## Browse organizations

1. In the sidebar, click **Organizations**.

   ![placeholder: organizations list](/static/img/cloud-docs/organizations-list.png)

2. The table shows each organization's title, name, description, public link, and an **Edit** action (visible if you are an admin of that organization).

3. Click **View online** to open the organization's public page.

## Create an organization

1. From the **Organizations** page, click **Add organization**. (Visible only to sysadmins.)

   ![placeholder: add organization button](/static/img/cloud-docs/organization-add-button.png)

2. Fill in:
   - **Title** and **Name** (slug).
   - **Description**.
   - **Image** (optional).

   ![placeholder: create organization form](/static/img/cloud-docs/organization-create-form.png)

3. Click **Save**.

## Edit an organization

1. From the **Organizations** list, click **Edit**.
2. The edit page has two tabs:
   - **Edit** — change the Name (slug), Title, Description, and Image.
   - **Members** — manage who belongs to the organization.

   ![placeholder: organization edit tabs](/static/img/cloud-docs/organization-edit-tabs.png)

3. Make changes and click **Apply changes**.

For the [main organization](#the-main-organization), the **Name** field is disabled and cannot be changed.

## Manage members

Members of an organization can create, edit, and (depending on role) delete datasets owned by that organization.

1. From the organization edit page, click the **Members** tab.

2. The table lists current members and their roles.

   ![placeholder: members tab](/static/img/cloud-docs/organization-members.png)

### Roles

Each member holds one of three roles within the organization, following the standard CKAN role model. The role applies only to that organization; a user can hold different roles in different organizations.

| Role | View private datasets | Create / edit / delete datasets | Edit organization settings | Manage members |
|------|-----------------------|---------------------------------|----------------------------|----------------|
| **Member** | Yes | — | — | — |
| **Editor** | Yes | Yes | — | — |
| **Admin** | Yes | Yes | Yes | Yes |

A **sysadmin** (admin of the portal's main organization) has full control over every organization regardless of explicit membership.

### Invite a member

1. On the **Members** tab, click **Invite member**.

   ![placeholder: invite member modal](/static/img/cloud-docs/organization-invite-modal.png)

2. Enter the user's email address and select a role (member, editor, admin).
3. Click **Invite user**.

What happens next depends on whether the email already belongs to a portal user:

- **Email not yet registered.** A new account is created, added to the organization with the chosen role, and left in a **pending** state. The person receives an email with a link; once they click it and set a password, their account becomes active.
- **Email belongs to an existing user.** The user is added to the organization with the chosen role. No email is sent and no further action is required from them.

In both cases the user appears in the members list immediately — a pending user remains listed until they complete sign-up.

### Remove or change a member's role

Use the actions on the member's row (edit role or remove). Removing a member revokes their ability to edit datasets owned by this organization.

## Delete an organization

1. From the **Organizations** list, select the organization's checkbox and click **Delete all**, or use a delete action on the row.
2. Confirm.

Restrictions:
- **An organization that still has datasets cannot be deleted.** Reassign or delete its datasets first. You will see: *"organization cannot be deleted because it contains datasets."*
- **The [main organization](#the-main-organization) cannot be deleted.** You will see: *"Main organization cannot be deleted."*
