import { AnchorHTMLAttributes } from "react";

type ButtonLinkProps = {
  style?: "primary" | "secondary" | "tertiary";
  children: string;
  className?: string;
  title?: string;
  href?: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "style">;

export default function ButtonLink({
  style = "primary",
  children,
  className = "",
  href = "https://cloud.portaljs.com/",
  title = "Get started with PortalJS Cloud",
  ...rest
}: ButtonLinkProps) {
  let _className: string =
    "inline-block items-center justify-center px-4 py-2 border text-base font-semibold text-center rounded transition duration-300 ";

  if (style == "primary") {
    _className += `border-transparent bg-secondary hover:bg-secondary-hover text-black`;
  } else if (style == "secondary") {
    _className += `border-secondary hover:bg-secondary-hover hover:text-black text-secondary`;
  } else if (style == "tertiary") {
    _className += `border-none hover:bg-slate-700 text-slate-300 bg-slate-800 `;
  }


  _className += ` ${className}`;

  return (
    <a
      href={href}
      title={title}
      className={_className}
      {...rest}
    >
      {children}
    </a>
  );
}
