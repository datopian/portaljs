import Link from 'next/link';

export default function ButtonLink({
  style = 'primary',
  className = '',
  href = '',
  children,
}) {
  let styleClassName = '';

  if (style == 'primary') {
    styleClassName = 'text-primary bg-blue-400 hover:bg-blue-300';
  } else if (style == 'secondary') {
    styleClassName =
      'text-secondary border !border-secondary hover:text-primary hover:bg-blue-300';
  }

  return (
    <Link
      href={href}
      className={`inline-block px-4 py-2 border border-transparent text-base font-medium rounded-md focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300/50 active:bg-sky-500 ${styleClassName} ${className}`}
    >
      {children}
    </Link>
  );
}
