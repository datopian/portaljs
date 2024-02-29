import Link from "next/link.js";
import clsx from "clsx";
import { Disclosure, Transition } from "@headlessui/react";

export interface NavItem {
  name: string;
  href: string;
}

export interface NavGroup {
  name: string;
  path: string;
  level: number;
  children: Array<NavItem | NavGroup>;
}

interface Props {
  currentPath: string;
  nav: Array<NavItem | NavGroup>;
}

function isNavGroup(item: NavItem | NavGroup): item is NavGroup {
  return (item as NavGroup).children !== undefined;
}

function navItemBeforeNavGroup(a, b) {
  if (isNavGroup(a) === isNavGroup(b)) {
    return 0;
  }
  if (isNavGroup(a) && !isNavGroup(b)) {
    return 1;
  }
  return -1;
}

function sortNavGroupChildren(items: Array<NavItem | NavGroup>) {
  return items.sort(
    (a, b) => navItemBeforeNavGroup(a, b) || a.name.localeCompare(b.name)
  );
}

export const SiteToc: React.FC<Props> = ({ currentPath, nav }) => {
  function isActiveItem(item: NavItem) {
    return item.href === currentPath;
  }

  return (
    <nav data-testid="lhs-sidebar" className="flex flex-col space-y-3 text-sm">
      {sortNavGroupChildren(nav).map((n, index) => (
        <NavComponent key={index} item={n} isActive={false} />
      ))}
    </nav>
  );
};

const NavComponent: React.FC<{
  item: NavItem | NavGroup;
  isActive: boolean;
}> = ({ item, isActive }) => {
  return !isNavGroup(item) ? (
    <Link
      key={item.name}
      href={item.href}
      className={clsx(
        isActive
          ? "text-sky-500"
          : "font-normal text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300",
        "block"
      )}
    >
      {item.name}
    </Link>
  ) : (
    <Disclosure as="div" key={item.name} className="flex flex-col space-y-3">
      {({ open }) => (
        <div>
          <Disclosure.Button className="group w-full flex items-center text-left text-md font-medium text-slate-900 dark:text-white">
            <svg
              className={clsx(
                open ? "text-slate-400 rotate-90" : "text-slate-300",
                "h-3 w-3 mr-2 flex-shrink-0 transform transition-colors duration-150 ease-in-out group-hover:text-slate-400"
              )}
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M6 6L14 10L6 14V6Z" fill="currentColor" />
            </svg>
            {item.name}
          </Disclosure.Button>
          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Disclosure.Panel className="flex flex-col space-y-3 pl-5 mt-3">
              {sortNavGroupChildren(item.children).map((subItem, index) => (
                <NavComponent key={index} item={subItem} isActive={false} />
              ))}
            </Disclosure.Panel>
          </Transition>
        </div>
      )}
    </Disclosure>
  );
};
