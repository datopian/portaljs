import siteConfig from '@/config/siteConfig'
import { NextSeo } from 'next-seo'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import Footer from './custom/Footer'
import Hero from './Hero'
import Nav from './Nav'
import Navigation from './Navigation'
import { useRouter } from 'next/router'

function useTableOfContents(tableOfContents) {
  const [currentSection, setCurrentSection] = useState(tableOfContents[0]?.id)
  const getHeadings = useCallback((toc) => {
    return toc
      .flatMap((node) => [node.id, ...node.children.map((child) => child.id)])
      .map((id) => {
        const el = document.getElementById(id)
        if (!el) return null

        const style = window.getComputedStyle(el)
        const scrollMt = parseFloat(style.scrollMarginTop)

        const top = window.scrollY + el.getBoundingClientRect().top - scrollMt
        return { id, top }
      })
      .filter((el) => !!el)
  }, [])

  useEffect(() => {
    if (tableOfContents.length === 0) return
    const headings = getHeadings(tableOfContents)
    function onScroll() {
      const top = window.scrollY + 4.5
      let current = headings[0].id
      headings.forEach((heading) => {
        if (top >= heading.top) {
          current = heading.id
        }
        return current
      })
      setCurrentSection(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [getHeadings, tableOfContents])

  return currentSection
}

export default function Layout({
  children,
  title,
  description,
  tableOfContents = [],
  isHomePage = false,
  sidebarTree = [],
  layout,
}: {
  children
  title?: string
  description?: string
  tableOfContents?
  urlPath?: string
  sidebarTree?: []
  isHomePage?: boolean
  layout?: string
}) {
  //const { toc } = children.props;
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const currentSection = useTableOfContents(tableOfContents)
  const getHeadings = useCallback((toc) => {
    return toc
      .flatMap((node) => [node.id, ...node.children.map((child) => child.id)])
      .map((id) => {
        const el = document.getElementById(id)
        if (!el) return null

        const style = window.getComputedStyle(el)
        const scrollMt = parseFloat(style.scrollMarginTop)

        const top = window.scrollY + el.getBoundingClientRect().top - scrollMt
        return { id, top }
      })
      .filter((el) => !!el)
  }, [])
  function isActive(section) {
    if (section.id === currentSection) {
      return true
    }
    if (!section.children) {
      return false
    }
    return section.children.findIndex(isActive) > -1
  }
  return (
    <>
      <Nav />
      <div className=" bg-background dark:bg-background-dark text-primary dark:text-primary-dark pt-32">
        <div className="h-full">
          <div
            className={`relative mx-auto flex ${
              layout == 'casestudy' || isHomePage ? 'max-w-none !px-0 !mx-0' : 'max-w-8xl'
            } justify-center sm:px-2 lg:px-8 xl:px-12 `}
          >
            {!!sidebarTree.length && (
              <div className="hidden lg:relative lg:block lg:flex-none">
                <div className="absolute inset-y-0 right-0 w-[50vw] dark:hidden" />
                <div className="absolute bottom-0 right-0 top-16 hidden h-12 w-px bg-gradient-to-t from-slate-800 dark:block" />
                <div className="absolute bottom-0 right-0 top-28 hidden w-px bg-slate-800 dark:block" />
                <div className="sticky top-[4.5rem] -ml-0.5 h-[calc(100vh-4.5rem)] overflow-y-auto overflow-x-hidden py-16 pl-0.5">
                  <Navigation
                    navigation={sidebarTree}
                    className="w-64 pr-8 xl:w-72 xl:pr-16"
                  />
                </div>
              </div>
            )}
            <div
              className={`min-w-0 ${
                layout == 'casestudy'
                  ? 'max-w-none'
                  : 'max-w-2xl px-4 lg:max-w-none lg:pl-0 lg:pr-0 '
              } flex-auto ${isHomePage ? 'py-0' : 'py-8'} `}
            >
              {children}
            </div>
            {/** TABLE OF CONTENTS */}
            {router.asPath.startsWith('/casestudies') == false && (
              <div className="hidden xl:sticky xl:right-0 xl:top-[4.5rem] xl:block xl:h-[calc(100vh-4.5rem)] xl:flex-none xl:overflow-y-auto xl:py-16 xl:mb-16 ">
                {tableOfContents.length > 0 && (
                  <nav aria-labelledby="on-this-page-title" className="w-56">
                    <h2 className="font-display text-sm font-medium">
                      On this page
                    </h2>
                    <ol className="mt-4 space-y-4 text-sm">
                      {tableOfContents.map((section) => (
                        <li key={section.id}>
                          <h3>
                            <Link
                              href={`#${section.id}`}
                              className={
                                isActive(section)
                                  ? 'text-secondary font-semibold'
                                  : 'font-normal text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                              }
                            >
                              {section.title}
                            </Link>
                          </h3>
                          {section.children && section.children.length > 0 && (
                            <ol className="mt-4 space-y-4 pl-5 text-slate-500 dark:text-slate-400">
                              {section.children.map((subSection) => (
                                <li key={subSection.id}>
                                  <Link
                                    href={`#${subSection.id}`}
                                    className={
                                      isActive(subSection)
                                        ? 'text-secondary font-semibold'
                                        : 'hover:text-slate-600 dark:hover:text-slate-300'
                                    }
                                  >
                                    {subSection.title}
                                  </Link>
                                </li>
                              ))}
                            </ol>
                          )}
                        </li>
                      ))}
                    </ol>
                  </nav>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
