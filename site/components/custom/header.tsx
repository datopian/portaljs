import React, { FC, ReactNode } from "react";

type HeadingProps = {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  sub?: boolean;
};

const H1: FC<HeadingProps> = ({ children, className = "", style, id, sub }) => {
  if (sub)
    return (
      <h1
        style={style}
        className={`text-4xl font-semibold tracking-tight ${className}`}
        id={id}
      >
        {children}
      </h1>
    )
  else
    return (
      <h1
        style={style}
        className={`text-[40px] tracking-tight font-semibold ${className}`}
        id={id}
      >
        {children}
      </h1>
    )
};

const H2: FC<HeadingProps> = ({ children, className = "", style, id, sub }) => {
  if (sub)
    return (
      <h2
        style={style}
        className={`text-lg ${className} opacity-75`}
        id={id}
      >
        {children}
      </h2>
    )
  else
    return (
      <h2
        style={style}
        className={`text-4xl font-semibold tracking-tight ${className}`}
        id={id}
      >
        {children}
      </h2>
    )
};

const H3: FC<HeadingProps> = ({ children, className = "", style, id, sub }) => (
  <h3
    style={style}
    className={`text-lg ${className} opacity-75 mt-3`}
    id={id}
  >
    {children}
  </h3>
);
export { H1, H2, H3 };