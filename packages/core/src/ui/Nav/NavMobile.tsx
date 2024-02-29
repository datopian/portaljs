import { Dialog, Menu } from "@headlessui/react";
import Link from "next/link.js";
import { useRouter } from "next/router.js";
import { useEffect, useState } from "react";
import { SearchContext, SearchField } from "../Search";
import { MenuIcon, CloseIcon } from "../Icons";
import type { NavConfig, ThemeConfig } from "./Nav";

interface Props extends NavConfig, ThemeConfig, React.PropsWithChildren {}

// TODO: Search doesn't appear
export const NavMobile: React.FC<Props> = ({
  children,
  title,
  links,
  search,
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [Search, setSearch] = useState<any>(); // TODO types

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

  useEffect(() => {
    if (search) {
      setSearch(SearchContext(search.provider));
    }
  }, [search]);

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
              <div className="font-extrabold text-primary dark:text-primary-dark text-lg ml-6">
                {title}
              </div>
            </Link>
          </div>
          {Search && (
            <Search>
              {({ query }: any) => <SearchField mobile onOpen={query.toggle} />}
            </Search>
          )}
          {links && (
            <ul className="mt-2 space-y-2 border-l-2 border-slate-100 dark:border-slate-800 lg:mt-4 lg:space-y-4 lg:border-slate-200">
              {links.map((link) => (
                <Menu as="div" key={link.name} className="relative">
                  <Menu.Button>
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={`
                  block w-full pl-3.5 before:pointer-events-none before:absolute before:-left-1 before:top-1/2 before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full text-slate-500 before:hidden before:bg-slate-300 hover:text-slate-600 hover:before:block dark:text-slate-400 dark:before:bg-slate-700 dark:hover:text-slate-300`}
                      >
                        {link.name}
                      </Link>
                    </li>
                  </Menu.Button>
                </Menu>
              ))}
            </ul>
          )}
          <div className="pt-6">{children}</div>
        </Dialog.Panel>
      </Dialog>
    </>
  );
};
