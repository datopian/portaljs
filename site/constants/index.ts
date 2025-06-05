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

export const CASE_STUDY_QUESTIONS = {
  healthcare: [
    {
      question: 'Does this replace OpenMetadata?',
      answer:
        'No — it extends it.PortalJS acts as a frontend layer while OpenMetadata remains the backend.',
    },
    {
      question: 'Is this secure enough for healthcare data?',
      answer:
        'Yes.All access is governed via Microsoft Entra ID.No data is exposed unless authorized.',
    },
    {
      question: 'Can I deploy this on my own infrastructure?',
      answer:
        'Absolutely.The solution is delivered as a Docker container and works seamlessly with Azure-based environments.',
    },
    {
      question: 'What if I’m not in healthcare?',
      answer:
        'No problem — PortalJS works across sectors: government, energy, finance, climate, and more.',
    },
  ],
  tdc: [
    {
      question: 'Is PortalJS only for CKAN?',
      answer:
        'No — PortalJS is backend - agnostic.It works equally well with CKAN, OpenMetadata, or custom APIs.',
    },
    {
      question: 'Do I need a developer to manage the portal?',
      answer:
        'Not for everyday content.Editors can manage FAQs, About pages, and more via GitHub or your preferred CMS.',
    },
    {
      question: 'How long does a PortalJS portal take to launch?',
      answer:
        'Most deployments go live in 1–2 weeks, depending on the features needed.',
    },
    {
      question: 'Can we manage our own hosting later?',
      answer:
        'Yes. Many clients start with Datopian - hosted and then move to internal infrastructure.We help with migration.',
    },
    {
      question: 'What makes this better than just CKAN?',
      answer:
        'CKAN is great for metadata and APIs.PortalJS adds the human layer — modern search, visualizations, dashboards, and guided user experiences.',
    },
  ]
}