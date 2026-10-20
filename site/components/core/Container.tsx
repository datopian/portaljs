import { forwardRef } from "react";
import clsx from "clsx";

const OuterContainer = forwardRef<
  HTMLDivElement,
  React.PropsWithChildren & { className?: string }
>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={clsx("sm:px-8", className)} {...props}>
      <div className="mx-auto max-w-5xl lg:px-8">{children}</div>
    </div>
  );
});

const InnerContainer = forwardRef<
  HTMLDivElement,
  React.PropsWithChildren & { className?: string }
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={clsx("relative px-4 sm:px-8 lg:px-12", className)}
      {...props}
    >
      <div className="mx-auto max-w-2xl lg:max-w-5xl">{children}</div>
    </div>
  );
});

export const Container = forwardRef<
  HTMLDivElement,
  React.PropsWithChildren & { className?: string }
>(({ children, ...props }, ref) => {
  return (
    <OuterContainer ref={ref} {...props}>
      <InnerContainer>{children}</InnerContainer>
    </OuterContainer>
  );
});
