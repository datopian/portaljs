import { SimpleLayout, UnstyledLayout } from '@portaljs/core'
import { BlogLayout } from './blog'
import DefaultLayout from './default'
import { DocsLayout } from '@portaljs/core'
import CaseStudyLayout from './casestudy'

export default {
  simple: SimpleLayout,
  docs: DocsLayout,
  unstyled: UnstyledLayout,
  blog: BlogLayout,
  default: DefaultLayout,
  casestudy: CaseStudyLayout,
}
