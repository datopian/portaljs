---
title: 'Making PortalJS Cloud Admin Panel Accessible: The Digital Ramp Everyone Deserves'
description: 'Learn how PortalJS Cloud’s commitment to accessibility enhances the user experience for everyone.'
created: 2025-01-26
authors: ['popovayoana', 'shreyas']
filetype: 'blog'
---

## The Need for Accessibility: Building a Digital City for All

Imagine a city where half the streets have potholes so deep that some people can’t pass through. Where doors swing open only for those who fit a certain mold. Where street signs disappear when you look at them from a different angle. Sounds frustrating, right? That’s exactly how the web feels for millions of users when accessibility isn’t a priority.

Accessibility isn’t a nice-to-have—it’s the foundation of a web that welcomes everyone. At PortalJS Cloud, we didn’t just tick compliance checkboxes; we built a digital ramp that ensures everyone gets through the front door.

And we didn’t stop at the admin panel. Every **data portal built with PortalJS Cloud—in just five minutes—is fully WCAG-compliant.** Because accessibility isn’t a checkbox—it’s a mindset woven into everything we build.

## WCAG 2.1 vs. WCAG 2.2: The Blueprint for Digital Inclusion

Think of WCAG (Web Content Accessibility Guidelines) as an evolving map for a fairer internet.

- **WCAG 2.1 (2018)** was like upgrading a city’s infrastructure to accommodate more people—introducing smoother sidewalks, better-lit streets, and accessible public transport for those with diverse needs.
- **WCAG 2.2 (2023)** took it further by fine-tuning details that improve usability for people with cognitive disabilities and motor impairments. Think of it as adjusting traffic lights, widening sidewalks, and ensuring door handles work for everyone.

## The Journey to an Accessible Admin Panel
### **1. Auditing and Identifying Issues: Finding the Potholes**

Before fixing anything, we needed to see where the cracks were. Using industry-standard tools like [WAVE](https://wave.webaim.org/), [axe DevTools](https://www.deque.com/axe/), and [Lighthouse](https://developer.chrome.com/docs/lighthouse/accessibility/), we ran a full audit. Every missing label, poor contrast ratio, and keyboard trap was a pothole we needed to fill.

![Lighthouse accessibility check image](/images/blog/lighthouse.png)

### **2. Keyboard Navigation: Every Click Should Have a Clear Path**

For some users, a mouse is as useful as a submarine in a desert. They navigate using keyboards, screen readers, or voice commands. So we made sure that:

- Every button, link, and form could be reached using only a keyboard. 
![Keyboard navigation image](/images/blog/keyboard-navigation-1.png)
- A clear visual focus was added to show users where they were on the page.
- We built skip navigation links, the express lanes of web browsing, allowing users to jump straight to important sections.
  <img src="/images/blog/keyboard-navigation-2.png" alt="Keyboard navigation image" width="200"/>
- All interactive elements were designed with a minimum target size of 24x24 pixels, ensuring ease of use for users with motor impairments.

### **3. Fixing Forms: Because Guesswork Shouldn’t Be a Requirement**

Forms are the bureaucratic paperwork of the web. Done wrong, they become a maze. Done right, they feel like a conversation. We ensured that:

- Every form field had clear labels and instructions.
- Error messages were descriptive and polite, guiding users instead of scolding them.
- Focus didn’t disappear like a magician’s trick—it stayed predictable and logical.
- Error prevention mechanisms were implemented for sensitive data entries, giving users confirmation prompts or undo options.
  ![Error message image](/images/blog/error-message-1.png)
  <img src="/images/blog/error-message-2.png" alt="Error message image" width="400"/>

### **4. Color Contrast: Making Text Stand Out Like a Lighthouse**

Imagine reading a book where the ink is only a shade darker than the page. That’s what poor color contrast feels like. We ensured that:

- Text and interactive elements had a minimum contrast ratio of 4.5:1, making them readable in all lighting conditions.
- Alternative visual indicators (icons, underlines, patterns) helped those with color blindness navigate effortlessly.
  ![Colour contrast image](/images/blog/color-contrast.png)

### **5. Using Semantic HTML and ARIA Roles: Speaking a Universal Language**

Screen readers rely on structure. If a webpage isn’t built with **semantic HTML**, it’s like trying to read a scrambled recipe. We:

- Used semantic HTML to ensure that screen readers understood the page structure.
- Added ARIA roles and attributes so users with assistive tech could grasp the purpose of each section.
- Ensured consistent navigation elements throughout the admin panel to maintain familiarity for users.
  <img src="/images/blog/aria-labels.png" alt="Aria labels image" width="300"/>

### **6. Testing with Real Users: Because Theory is Nothing Without Practice**

Automated audits are useful, but they don’t catch everything. So we tested the admin panel with:

- Screen readers (NVDA, JAWS, VoiceOver) to ensure content made sense.
- Keyboard-only navigation to confirm smooth interactions.
- Real users with disabilities, because lived experience trumps theory every time.

## Why Accessibility is a Competitive Advantage

This isn’t just about being compliant—it’s about creating an exceptional product. Here’s why accessibility matters:

- **Inclusivity is Innovation** — The best designs work for everyone. Curb cuts, originally made for wheelchair users, are now a blessing for cyclists and parents with strollers. Digital accessibility follows the same rule.
- **SEO Rewards Accessibility** — Search engines love structured, accessible content. Fixing accessibility often improves rankings.
- **Legal Risks are Real** — Many companies have faced lawsuits for failing to meet accessibility standards. Avoiding them is smart business.
- **Better UX for Everyone** — Accessibility improvements make life easier for **all** users—whether they’re on mobile, in a rush, or in a low-bandwidth area.

## Accessibility Beyond the Admin Panel: A Fully Compliant Data Portal

Accessibility isn’t a feature—it’s the foundation. That’s why **every data portal built with PortalJS Cloud is fully WCAG-compliant right out of the box**. In just five minutes, users can deploy a portal that:

- **Provides seamless screen reader support**, ensuring datasets are easily navigable.
- **Offers fully accessible data preview tables**, making data exploration effortless for everyone.
- **Maintains optimized color contrast and keyboard accessibility**, enhancing usability across all devices.
- **Eliminates mandatory dragging movements**, allowing users to interact without precision-based gestures.

In an upcoming article, we’ll dive deeper into how we designed our out-of-the-box data portal templates to be fully WCAG-compliant, ensuring that accessibility is baked into every dataset preview, every UI element, and every interaction.

## Accessibility is a Journey, Not a Destination

Making the PortalJS Cloud Admin Panel accessible wasn’t a one-and-done project. It’s an ongoing commitment—like maintaining roads, updating maps, and making sure everyone can move freely in our digital city.

The internet is a vast landscape, but we get to decide what kind of world we build. At PortalJS, we’re choosing one where **everyone** has a way in.

Want to make your product accessible? Start with the [official WCAG guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/) and build a web that works for all.
