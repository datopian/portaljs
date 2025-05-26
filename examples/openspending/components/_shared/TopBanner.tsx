import { XMarkIcon } from '@heroicons/react/outline';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'topBannerDismissed';

export default function TopBanner({
  title,
  text,
  link,
  buttonLabel,
  target = '_blank',
}: {
  title: string;
  text: string;
  link: string;
  buttonLabel: string;
  target?: React.HTMLAttributeAnchorTarget;
}) {
  const [show, setShow] = useState<boolean>(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) setShow(true);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="relative z-[100] isolate flex items-center gap-x-6 overflow-hidden bg-gray-50 px-6 py-2.5 sm:px-3.5 sm:before:flex-1">
      {/* Background blobs */}
      <div
        aria-hidden="true"
        className="absolute left-[max(-7rem,calc(50%-52rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl"
      >
        <div
          style={{
            clipPath:
              'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)',
          }}
          className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-[#60a5fa] to-[#9089fc] opacity-30"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute left-[max(45rem,calc(50%+8rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl"
      >
        <div
          style={{
            clipPath:
              'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)',
          }}
          className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-[#60a5fa] to-[#9089fc] opacity-30"
        />
      </div>

      <Link
        target={target}
        href={link}
        className="flex flex-wrap items-center gap-x-4 gap-y-2"
      >
        <p className="text-sm/6 text-gray-900">
          <strong className="font-semibold">{title} </strong>
          {text}
        </p>
        <span className="flex-none rounded-full bg-gray-900 px-3.5 py-1 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900">
          {buttonLabel} <span aria-hidden="true">&rarr;</span>
        </span>
      </Link>
      <div className="flex flex-1 justify-end">
        <button
          type="button"
          className="-m-3 p-3 focus-visible:-outline-offset-4"
          onClick={handleDismiss}
        >
          <span className="sr-only">Dismiss</span>
          <XMarkIcon aria-hidden="true" className="w-5 h-5 text-gray-900" />
        </button>
      </div>
    </div>
  );
}
