import { Menu, Transition } from "@headlessui/react";
import Link from "next/link";
import { Fragment, useRef, useState } from "react";

import { BaseLink } from "./BaseLink";

export function NavItem({ item, target }) {
  const dropdownRef = useRef(null);
  const [showDropdown, setshowDropdown] = useState(false);

  const timeoutDuration = 200;
  let timeoutId;

  const openDropdown = () => {
    clearTimeout(timeoutId);
    setshowDropdown(true);
  };
  const closeDropdown = () => {
    timeoutId = setTimeout(() => setshowDropdown(false), timeoutDuration);
  };

  return (
    <Menu as="div" className="relative">
      <Menu.Button
        onClick={() => setshowDropdown(!showDropdown)}
        onMouseEnter={openDropdown}
        onMouseLeave={closeDropdown}
      >
        {Object.prototype.hasOwnProperty.call(item, "href") ? (
          <Link
            href={item.href}
            title={item.name}
            className={`${item.name.includes("Open source") ? "text-blue-600 dark:hover:!text-slate-300 hover:text-secondary-hover dark:text-blue-400 inline-flex items-center mr-2 px-1 pt-1 text-sm font-medium transition duration-300" : "text-slate-400 inline-flex items-center mr-2 px-1 pt-1 text-sm font-medium hover:text-blue-400 transition duration-300"}`}
          >
            {item.name}
          </Link>
        ) : (
          <div className="text-slate-400 inline-flex items-center mr-2 px-1 pt-1 text-sm font-medium hover:text-slate-300 fill-slate-500 hover:fill-slate-600  transition duration-300">
            {item.name}
          </div>
        )}
      </Menu.Button>

      {Object.prototype.hasOwnProperty.call(item, "subItems") && (
        <Transition
          as={Fragment}
          show={showDropdown}
          enter="transition ease-out duration-200"
          enterFrom="transform opacity-0 scale-5"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-5"
        >
          <Menu.Items
            className="absolute top-5 flex flex-col dark:bg-slate-900/95 backdrop-blur"
            ref={dropdownRef}
            onMouseEnter={openDropdown}
            onMouseLeave={closeDropdown}
          >
            {item.subItems.map((subItem) => (
              <Menu.Item
                key={subItem.name}
                //  @ts-ignore
                onClick={() => setshowDropdown(false)}
              >
                <BaseLink
                  href={subItem.href}
                  title={subItem.name}
                  className="text-slate-500 inline-flex items-center mt-2 px-1 pt-1 text-sm font-medium hover:text-slate-600"
                >
                  {subItem.name}
                </BaseLink>
              </Menu.Item>
            ))}
          </Menu.Items>
        </Transition>
      )}
    </Menu>
  );
}
