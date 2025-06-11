export const CASE_STUDY_TABLES = [
  {
    table: 'default',
    title: 'Why PortalJS Cloud?',
    headers: ['Feature', 'Self-Hosted CKAN', 'PortalJS Cloud'],
    rows: [
      [
        'Infrastructure Management',
        'Requires dedicated IT staff',
        'Fully managed, zero maintenance',
      ],
      [
        'Cost Efficiency',
        'High AWS and staffing costs',
        'Predictable pricing, reduced costs',
      ],
      [
        'Performance Optimization',
        'Manual scaling needed',
        'Automatic performance tuning',
      ],
      [
        'Security & Compliance',
        'Requires manual updates',
        'Automated security, GDPR compliance',
      ],
      [
        'Customization & UX',
        'Requires in-house development',
        'Pre-built UI/UX enhancements',
      ],
    ],
  },
  {
    table: 'ssen',
    title: 'Why PortalJS + CKAN?',
    headers: ['Feature', 'Before PortalJS', 'With PortalJS + CKAN'],
    rows: [
      [
        'Data Handling',
        'Slow and unreliable queries',
        'Fast, seamless data processing',
      ],
      [
        'User Experience',
        'Basic, clunky interface',
        'Modern, responsive design',
      ],
      [
        'Security',
        'Weak access controls',
        'Advanced security with restricted access',
      ],
      [
        'Scalability',
        'Struggled with large data',
        'Easily handles 1TB+ daily datasets',
      ],
      [
        'Customization',
        'Minimal flexibility',
        'Fully customizable to meet SSEN’s needs',
      ],
    ],
  },
  {
    table: 'moei',
    title: 'Comparing What Was vs. What Is',
    headers: ['Feature', 'Before PortalJS', 'With PortalJS + CKAN'],
    rows: [
      [
        'Language Support',
        'English only, no RTL',
        'Full bilingual support with Arabic RTL layout',
      ],
      [
        'Dataset Organization',
        'Scattered, manual',
        'Centralized, structured, and searchable',
      ],
      [
        'Public Access',
        'Limited',
        'Fully public, searchable, and API-accessible',
      ],
      [
        'Visualizations',
        'Not available',
        'Built-in chart builder + live resource previews',
      ],
      [
        'Branding',
        'Generic or inconsistent',
        'Fully customized, ministry-aligned UI and UX',
      ],
      [
        'Mobile Support',
        'Inconsistent',
        'Fully responsive on all devices',
      ],
      [
        'Developer Access',
        'No clear API layer',
        'RESTful APIs for seamless integration',
      ],
      [
        'Content Management',
        'Developer-dependent',
        'GhostCMS integration for easy non-technical updates',
      ],
      [
        'Feedback Mechanisms',
        'None',
        'Built-in dataset feedback and request tools',
      ],
      [
        'Hosting & Maintenance',
        'Internal burden or unclear ownership',
        'Fully managed via PortalJS Cloud, zero client overhead',
      ],
      [
        'Security & Permissions',
        'Basic or unavailable',
        'Role-based access, secure hosting, and API-level protection',
      ],
      [
        'User Engagement',
        'Passive, limited interaction',
        'Active public interaction via forms, charts, and dataset discovery',
      ],
    ],
  },
  {
    table: 'healthcare',
    title: 'Comparing What Was vs. What Is',
    description: 'By combining OpenMetadata with PortalJS, we preserved robust data governance and observability while layering on a fast, intuitive frontend. OpenMetadata handles the metadata, access control, and backend integration. PortalJS transforms that into a clean, searchable interface designed for real human use.',
    headers: ['Feature', 'Before PortalJS', 'With PortalJS'],
    rows: [
      [
        'Dataset Discovery',
        'Fragmented, invisible across workspaces',
        'Unified catalog, searchable and filterable',
      ],
      [
        'Non-tech User Experience',
        'Complex, engineer-focused',
        'Simple, human-first UI',
      ],
      [
        'Dataset Q&A',
        'Manual via email or ticketing',
        'Built-in threaded discussions',
      ],
      [
        'Dataset Updates',
        'Hard to communicate changes',
        'Inline publication notes from stewards',
      ],
      [
        'Workspace Provisioning',
        'Manual coordination',
        'One-click “Add to Workspace” action',
      ],
    ],
  },
]