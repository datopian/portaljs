/* eslint import/no-default-export: off */
export const UnstyledLayout: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return <div className="unstyled dark:text-white">{children}</div>;
};
