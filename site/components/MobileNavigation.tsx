import { Dialog, Menu, Transition } from "@headlessui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";

import siteConfig from "@/config/siteConfig";
import { track } from "@/lib/track";
import { BaseLink } from "./BaseLink";
import { SearchContext, SearchField } from "./search/index.jsx";

const Search = SearchContext(siteConfig?.search?.provider);

function MenuIcon(props) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      {...props}
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon(props) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      {...props}
    >
      <path d="M5 5l14 14M19 5l-14 14" />
    </svg>
  );
}

export function MobileNavigation({ navigation }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    function onRouteChange() {
      setIsOpen(false);
    }

    router.events.on("routeChangeComplete", onRouteChange);
    router.events.on("routeChangeError", onRouteChange);

    return () => {
      router.events.off("routeChangeComplete", onRouteChange);
      router.events.off("routeChangeError", onRouteChange);
    };
  }, [router, isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="relative"
        aria-label="Open navigation"
      >
        <MenuIcon className="h-6 w-6 stroke-slate-500" />
      </button>
      <Dialog
        open={isOpen}
        onClose={setIsOpen}
        className="fixed inset-0 z-50 flex items-start overflow-y-auto bg-background-dark/50 pr-10 backdrop-blur lg:hidden"
        aria-label="Navigation"
      >
        <Dialog.Panel className="relative min-h-full w-full max-w-xs bg-background px-4 pt-5 pb-12 dark:bg-background-dark sm:px-6">
          <div className="flex items-center mb-6">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close navigation"
            >
              <CloseIcon className="h-6 w-6 stroke-slate-500" />
            </button>
            <Link
              href="/"
              className="ml-6"
              aria-label="Home page"
              legacyBehavior
            >
              {/* <Logomark className="h-9 w-9" /> */}
              <div className="font-extrabold text-2xl ml-6">
                {siteConfig.author}
              </div>
            </Link>
          </div>
          {Search && (
            <Search>
              {({ query }: any) => <SearchField mobile onOpen={query.toggle} />}
            </Search>
          )}
          {/* Primary CTA first, before the 24 navigation links (po-80u). The menu
              is the only full-height surface a mobile visitor opens deliberately;
              burying the builder under Showcase/Integrations/Compare/Resources is
              how the mobile funnel ends up with one entry point. */}
          <Link
            href="/build"
            onClick={() => track("nav_cta_clicked", { target: "build", source: "mobile_menu" })}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_-4px_rgba(37,99,235,0.5)]"
          >
            Get started
            <span aria-hidden="true">→</span>
          </Link>
          <ul className="mt-2 space-y-2 border-l-2 border-slate-100 dark:border-slate-800 lg:mt-4 lg:space-y-4 lg:border-slate-200">
            {navigation.map((link) => (
              <div key={link.name}>
                {Object.prototype.hasOwnProperty.call(link, "href") ? (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`
                block w-full pl-3.5 before:pointer-events-none before:absolute before:-left-1 before:top-1/2 before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full text-slate-500 before:hidden before:bg-slate-300 hover:text-slate-600 hover:before:block dark:text-slate-400 dark:before:bg-slate-700 dark:hover:text-slate-300`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ) : (
                  <Menu as="div" className="relative">
                    <Menu.Button as="li" className="relative">
                      <div className="flex w-full pl-3.5 before:pointer-events-none before:absolute before:-left-1 before:top-1/2 before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full text-slate-500 before:hidden before:bg-slate-300 hover:text-slate-600 hover:before:block dark:text-slate-400 dark:before:bg-slate-700 dark:hover:text-slate-300 dark:hover:fill-slate-300 fill-slate-500 hover:fill-slate-600 cursor-pointer">
                        {link.name}
                        <svg
                          height="20"
                          viewBox="0 0 20 20"
                          width="20"
                          xmlns="http://www.w3.org/2000/svg"
                          className="ml-auto"
                        >
                          <path d="M7 10l5 5 5-5z" />
                        </svg>
                      </div>
                    </Menu.Button>
                    {Object.prototype.hasOwnProperty.call(link, "subItems") && (
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="flex flex-col ml-3 mt-2">
                          {link.subItems.map((subItem) => (
                            <Menu.Item key={subItem.name}>
                              <BaseLink
                                href={subItem.href}
                                className="text-slate-500 inline-flex items-center mt-2 px-1 pt-1 text-sm font-medium hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300"
                              >
                                {subItem.name}
                              </BaseLink>
                            </Menu.Item>
                          ))}
                        </Menu.Items>
                      </Transition>
                    )}
                  </Menu>
                )}
              </div>
            ))}
            {/* The navbar's star counter is desktop-only now that the CTA holds
                that slot below `lg`, so starring keeps a home here. */}
            {siteConfig.github && (
              <li>
                <a
                  href={siteConfig.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full pl-3.5 text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300"
                >
                  Star on GitHub
                </a>
              </li>
            )}
          </ul>
        </Dialog.Panel>
      </Dialog>
    </>
  );
}
