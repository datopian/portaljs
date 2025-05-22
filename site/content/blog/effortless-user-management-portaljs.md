---
title: 'Effortless User Management in PortalJS'
description: 'The latest PortalJS user management update makes this process more intuitive.'
created: 2025-01-28
authors: ['popovayoana', 'lucasbispo']
filetype: 'blog'
---


>[!Key Takeaways]
> PortalJS has made user management much smoother. Admins can now add existing users to organizations instantly by entering their email—no redundant invites, no errors. If the user isn’t in the system, the invite process works as usual. This update streamlines team management, reduces admin workload, and ensures a better onboarding experience.


## PortalJS Now Supports Smoother User Management

Managing users across multiple organizations should be simple, not a tedious task. Yet, until now, adding existing users to a new team in PortalJS required unnecessary steps, redundant invitations, and, at times, frustrating errors.
 
The latest PortalJS user management update makes this process more intuitive. Now, admins can add existing users to an organization by simply entering their registered email in the Members tab. If the user already exists, the system assigns them instantly. No extra steps. No unnecessary complications. If not, the usual invite process applies. This ensures a smooth and efficient team management for data platforms. 

## What’s Improved?

Previously, the system would always attempt to create a new user when sending an invite, causing errors if the user was already registered. The update refines the `user_invite` function by:

- Checking for existing users before sending an invite.
- Assigning users instantly if they are already in the system.
- Falling back to the traditional invite process only if necessary.
- Improving error handling so issues with email invites don’t block the process.

![Add user to organization](/images/blog/add-user.webp)

These refinements remove friction, ensuring admins spend less time on user management and more time on their actual work.

## A More Streamlined Onboarding Experience

For businesses and organizations scaling their data portals with PortalJS, efficient user administration is critical. This update reduces administrative workload for PortalJS admins, allowing them to focus on managing data, not troubleshooting user invites.

With these improved user management features in PortalJS, teams can collaborate more effectively, ensuring smooth workflows for data-driven organizations. 

## Get Started with PortalJS Cloud Today

Launch your Data portal in under 5 minutes with PortalJS Cloud—the fastest and simplest way to share, manage, and collaborate on data. No infrastructure setup, no complex configurations—just a streamlined solution for governments, non-profits, academics, and companies of all sizes.

[Get started now](https://cloud.portaljs.com/) and bring your data to life effortlessly.