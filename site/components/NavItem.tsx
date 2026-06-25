import { Popover, Transition } from "@headlessui/react";
import Link from "next/link";
import { Fragment, useRef, useState } from "react";

import { BaseLink } from "./BaseLink";

export function NavItem({ item, target }) {
  const [isHovered, setIsHovered] = useState(false);

  const timeoutDuration = 200;
  let timeoutId: ReturnType<typeof setTimeout>;

  const openDropdown = () => {
    clearTimeout(timeoutId);
    setIsHovered(true);
  };
  const closeDropdown = () => {
    timeoutId = setTimeout(() => setIsHovered(false), timeoutDuration);
  };

  return (
    <Popover className="relative">
      <Popover.Button
        as="div"
        onMouseEnter={openDropdown}
        onMouseLeave={closeDropdown}
        className="outline-none"
      >
        {Object.prototype.hasOwnProperty.call(item, "href") ? (
          <Link
            href={item.href}
            title={item.name}
            className={`${item.name.includes("Open source") ? "text-blue-600 dark:hover:!text-slate-300 hover:text-secondary-hover dark:text-blue-400 inline-flex items-center mr-2 px-1 pt-1 text-sm font-medium transition duration-300" : "text-slate-600 dark:text-slate-400 inline-flex items-center mr-2 px-1 pt-1 text-sm font-medium hover:text-blue-500 dark:hover:text-blue-400 transition duration-300"}`}
          >
            {item.name}
          </Link>
        ) : (
          <div className="text-slate-600 dark:text-slate-400 inline-flex items-center mr-2 px-1 pt-1 text-sm font-medium hover:text-blue-500 dark:hover:text-blue-400 transition duration-300 cursor-default">
            {item.name}
            {Object.prototype.hasOwnProperty.call(item, "subItems") && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1 text-slate-600 dark:text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        )}
      </Popover.Button>

      {Object.prototype.hasOwnProperty.call(item, "subItems") && (
        <Transition
          as={Fragment}
          show={isHovered}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <Popover.Panel
            static
            className="absolute top-7 z-10 flex flex-col min-w-max bg-white dark:bg-slate-900/95 backdrop-blur shadow-lg rounded-md py-2 px-3"
            onMouseEnter={openDropdown}
            onMouseLeave={closeDropdown}
          >
            {item.subItems.map((subItem) =>
              subItem.disabled ? (
                <span
                  key={subItem.name}
                  className={`text-slate-400 cursor-not-allowed py-1.5 px-1 text-sm font-medium whitespace-nowrap ${subItem.style || ''}`}
                >
                  {subItem.name}
                </span>
              ) : (
                <BaseLink
                  key={subItem.name}
                  href={subItem.href}
                  title={subItem.name}
                  onClick={() => setIsHovered(false)}
                  className="text-slate-700 dark:text-slate-300 py-1.5 px-1 text-sm font-medium whitespace-nowrap hover:text-blue-500 dark:hover:text-blue-400"
                >
                  {subItem.name}
                </BaseLink>
              )
            )}
          </Popover.Panel>
        </Transition>
      )}
    </Popover>
  );
}
