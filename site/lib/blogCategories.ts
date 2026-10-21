// ─────────────────────────────────────────────────────────────────────────────
// BLOG CATEGORIES — the closed vocabulary for `categories:` in blog post
// frontmatter (site/content/blog/*.md). This list is the single source for both
// the label chips on blog cards and the filter buttons on /blog, in this order.
//
// A post declaring a category that is not listed here fails the build (see
// getStaticProps in site/pages/blog.tsx). To add a category, add it here.
// `icon` picks one of the small icons rendered on the filter button.
// ─────────────────────────────────────────────────────────────────────────────
export const BLOG_CATEGORIES = [
  { label: 'PortalJS', icon: 'dev' },
  { label: 'PortalJS Cloud', icon: 'cloud' },
  { label: 'CKAN' },
  { label: 'AI Integration' },
  { label: 'Open Data' },
  { label: 'Tutorial' },
  { label: 'Case Study' },
  { label: 'Civic Data' },
  { label: 'Research Data' },
] as const satisfies ReadonlyArray<{ label: string; icon?: 'dev' | 'cloud' }>

export type BlogCategory = (typeof BLOG_CATEGORIES)[number]['label']

export const BLOG_CATEGORY_LABELS: readonly string[] = BLOG_CATEGORIES.map((c) => c.label)

/**
 * Validate a post's frontmatter `categories` value and return it deduplicated
 * and in vocabulary order. Throws (failing the build) when the value is not a
 * list of strings or names a category outside BLOG_CATEGORIES.
 */
export function parseBlogCategories(value: unknown, postPath: string): BlogCategory[] {
  if (value === undefined || value === null) return []
  const valid = `Valid categories: ${BLOG_CATEGORY_LABELS.join(', ')}.`
  if (!Array.isArray(value) || value.some((c) => typeof c !== 'string')) {
    throw new Error(
      `Blog post "${postPath}" has an invalid \`categories:\` frontmatter value ` +
        `(${JSON.stringify(value)}); it must be a list of category names. ${valid}`
    )
  }
  const unknown = value.filter((c) => !BLOG_CATEGORY_LABELS.includes(c))
  if (unknown.length > 0) {
    throw new Error(
      `Blog post "${postPath}" declares unknown categor${unknown.length > 1 ? 'ies' : 'y'} ` +
        `${unknown.map((c) => `"${c}"`).join(', ')} in its \`categories:\` frontmatter. ${valid} ` +
        `Fix the post, or add the category to site/lib/blogCategories.ts.`
    )
  }
  return BLOG_CATEGORY_LABELS.filter((c) => value.includes(c)) as BlogCategory[]
}
