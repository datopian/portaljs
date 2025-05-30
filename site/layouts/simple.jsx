/* eslint import/no-default-export: off */
import { Container } from "@/components/Container.jsx";

export default function SimpleLayout({ children, frontMatter }) {
  return (
    <Container className="my-16 sm:mt-32">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 ">
          {frontMatter?.title}
        </h1>
        <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
          {frontMatter?.description}
        </p>
      </header>
      <div className="mt-16 sm:mt-20">{children}</div>
    </Container>
  );
}
