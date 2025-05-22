import { useDocSearchKeyboardEvents } from "@docsearch/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { createContext, useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

let DocSearchModal = null;

function Hit({ hit, children }) {
  return (
    <Link href={hit.url} legacyBehavior>
      {children}
    </Link>
  );
}

export const AlgoliaSearchContext = createContext({});

export function AlgoliaSearchProvider({ children, ...props }) {
  const { algoliaConfig } = props;

  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState(undefined);

  const importDocSearchModalIfNeeded = useCallback(() => {
    if (DocSearchModal) {
      return Promise.resolve();
    }

    return Promise.all([import("./AlgoliaModal")]).then(
      ([{ DocSearchModal: Modal }]) => {
        // eslint-disable-next-line
        DocSearchModal = Modal;
      }
    );
  }, []);

  const onOpen = useCallback(() => {
    importDocSearchModalIfNeeded().then(() => {
      setIsOpen(true);
    });
  }, [importDocSearchModalIfNeeded, setIsOpen]);

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const onInput = useCallback(
    (event) => {
      importDocSearchModalIfNeeded().then(() => {
        setIsOpen(true);
        setInitialQuery(event.key);
      });
    },
    [importDocSearchModalIfNeeded, setIsOpen, setInitialQuery]
  );

  const navigator = useRef({
    navigate({ itemUrl }) {
      // Algolia results could contain URL's from other domains which cannot
      // be served through history and should navigate with window.location
      const isInternalLink = itemUrl.startsWith("/");
      const isAnchorLink = itemUrl.startsWith("#");
      if (!isInternalLink && !isAnchorLink) {
        window.location.href = itemUrl;
      } else {
        router.push(itemUrl);
      }
    },
  }).current;

  const transformItems = useRef((items) =>
    items.map((item) => {
      // If Algolia contains a external domain, we should navigate without
      // relative URL
      const isInternalLink = item.url.startsWith("/");
      const isAnchorLink = item.url.startsWith("#");
      if (!isInternalLink && !isAnchorLink) {
        return item;
      }

      // We transform the absolute URL into a relative URL.
      const url = new URL(item.url);
      return {
        ...item,
        // url: withBaseUrl(`${url.pathname}${url.hash}`),
        url: `${url.pathname}${url.hash}`,
      };
    })
  ).current;

  useDocSearchKeyboardEvents({
    isOpen,
    onOpen,
    onClose,
    onInput,
  });

  const providerValue = useMemo(
    () => ({ query: { setSearch: setInitialQuery, toggle: onOpen } }),
    [setInitialQuery, onOpen]
  );

  return (
    <AlgoliaSearchContext.Provider value={providerValue}>
      <Head>
        {/* This hints the browser that the website will load data from Algolia,
        and allows it to preconnect to the DocSearch cluster. It makes the first
        query faster, especially on mobile. */}
        <link
          rel="preconnect"
          href={`https://${algoliaConfig.appId}-dsn.algolia.net`}
          crossOrigin="anonymous"
        />
      </Head>
      {children}
      {isOpen &&
        DocSearchModal &&
        createPortal(
          <DocSearchModal
            onClose={onClose}
            initialScrollY={window.scrollY}
            initialQuery={initialQuery}
            navigator={navigator}
            transformItems={transformItems}
            hitComponent={Hit}
            {...algoliaConfig}
          />,
          document.body
        )}
    </AlgoliaSearchContext.Provider>
  );
}
