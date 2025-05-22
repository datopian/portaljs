import Link from "next/link";

export default function CustomLink({ as, href, ...otherProps }) {
  return (
    <>
      <Link legacyBehavior as={as} href={href}>
        <a {...otherProps} />
      </Link>
      <style jsx>{`
        a {
          color: tomato;
        }
      `}</style>
    </>
  );
}
