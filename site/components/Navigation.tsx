import Link from "next/link";
import { useRouter } from "next/router";
import clsx from "clsx";

export default function Navigation({ navigation, className }) {
  let router = useRouter();

  const currentPath = router.asPath.split(/[#?]/)[0];

  return (
    <nav className={clsx("text-base lg:text-sm", className)}>
      <ul role="list" className="space-y-9">
        {navigation.map((section) => (
          <li key={section.title}>
            <h2 className="font-display font-medium">
              {section.title}
            </h2>
            <ul
              role="list"
              className="mt-2 space-y-2 border-l-2 border-slate-100 dark:border-slate-800 lg:mt-4 lg:space-y-4 lg:border-slate-200"
            >
              {section.links.map((link) => {
                const linkPath = link.href.split(/[#?]/)[0];
                return (
                  <li key={link.href} className="relative">
                    <Link
                      href={link.href}
                      target={link.target == "_blank" ? "_blank" : "_self"}
                      className={clsx(
                        "block w-full pl-3.5 before:pointer-events-none before:absolute before:-left-1 before:top-1/2 before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full",
                        linkPath === currentPath
                          ? "font-semibold text-secondary before:bg-secondary"
                          : "text-slate-500 before:hidden before:bg-slate-300 hover:text-slate-600 hover:before:block dark:text-slate-400 dark:before:bg-slate-700 dark:hover:text-slate-300"
                      )}
                    >
                      {link.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}
