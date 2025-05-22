import { AnchorHTMLAttributes } from "react";

type ButtonLinkProps = {
  style?: "primary" | "secondary";
  children: string;
  className?: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "style">;

export default function ButtonLink({
  style = "primary",
  children,
  className = "",
  ...rest
}: ButtonLinkProps) {
  let _className: string =
    "inline-block items-center justify-center px-4 py-2 border text-base font-semibold text-center rounded transition duration-300 ";

  if (style == "primary") {
    _className += `border-transparent bg-secondary hover:bg-secondary-hover text-black`;
  } else if (style == "secondary") {
    _className += `border-secondary hover:bg-secondary-hover hover:text-black text-secondary`;
  }

  _className += ` ${className}`;

  return (
    <a
      href="https://cloud.portaljs.com/"
      title="Get started with PortalJS Cloud"
      className={_className}
      {...rest}
    >
      {children}
    </a>
  );
}
