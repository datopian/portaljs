import { loadScripts } from '@/lib/loadNewsletterScripts';
import Script from 'next/script';
import { useEffect } from 'react';
import { CloudIcon } from '@heroicons/react/solid';

export default function NewsletterForm() {
  useEffect(() => {
    /*
     * The newsletter scripts MUST be loaded after
     * the document is loaded, as they depend on
     * the presence of some elements
     *
     */
    if (document.readyState === 'complete') {
      const { resetElements } = loadScripts();

      return () => {
        resetElements();
      };
    } else {
      window.addEventListener('load', loadScripts);
      return () => window.removeEventListener('load', loadScripts);
    }
  }, []);

  return (
    <div>
      <div
        id="sib-form-container"
        className="mt-8 sm:mx-auto sm:text-center lg:text-left lg:mx-0"
      >
        <p className="text-base font-medium flex items-center">
          <CloudIcon className="w-6 h-6 mr-1" />
          Join the PortalJS Cloud waitlist and get early access!
        </p>
        <div id="sib-container" className="!bg-transparent !p-0 !pb-5">
          <form
            id="sib-form"
            method="POST"
            action="https://0613d040.sibforms.com/serve/MUIEAGd31Nknuf7_fodoNJ3t0B71KWpbFfnzgk_VewvONuLQG8JO3qOotew23kQT3HpoJQUG_vzcjOTjn29B6GpXxPbSml_XWwHgG2mWq-jhrjfqpHCcPoOY_ge-rN2vDFWYZ80l242DTYGDRRWtTusdAYIk2oyf-nhJyOqQrUzTnXlAlKc7SxWgynSQ1GHr3jU5s57h6986IoK4"
            data-type="subscription"
            className="mt-3 sm:flex"
          >
            <div className="sib-input sib-form-block !p-0 block w-full sm:flex-auto sm:w-64 mt-3 sm:mt-0">
              <div className="form__entry entry_block w-full">
                <label htmlFor="email" className="sr-only entry__label">
                  Email address
                </label>
                <input
                  id="EMAIL"
                  name="EMAIL"
                  type="email"
                  required
                  placeholder="Your email"
                  className="input entry__field !w-full px-2 py-2 text-base rounded-md bg-slate-200 dark:bg-slate-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 focus:ring-offset-gray-900"
                />

                <label className="entry__error entry__error--primary px-2 text-red-400 text-sm"></label>
              </div>
            </div>

            <input type="hidden" name="form-name" value="get-updates" />
            <button
              type="submit"
              className="sib-form-block__button sib-form-block__button-with-loader flex-none mt-3 px-4 py-2 border border-transparent text-base font-medium rounded-md text-slate-900 bg-blue-400 hover:bg-blue-300 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300/50 active:bg-sky-500 sm:mt-0 sm:ml-3"
            >
              <svg
                className="icon clickable__icon progress-indicator__icon sib-hide-loader-icon hidden"
                viewBox="0 0 512 512"
              >
                <path d="M460.116 373.846l-20.823-12.022c-5.541-3.199-7.54-10.159-4.663-15.874 30.137-59.886 28.343-131.652-5.386-189.946-33.641-58.394-94.896-95.833-161.827-99.676C261.028 55.961 256 50.751 256 44.352V20.309c0-6.904 5.808-12.337 12.703-11.982 83.556 4.306 160.163 50.864 202.11 123.677 42.063 72.696 44.079 162.316 6.031 236.832-3.14 6.148-10.75 8.461-16.728 5.01z" />
              </svg>
              Join now
            </button>
            <input
              type="text"
              name="email_address_check"
              value=""
              className="input--hidden"
            />
            <input type="hidden" name="locale" value="en" />
          </form>
        </div>
        <div id="error-message" className="sib-form-message-panel !border-none">
          <div className="sib-form-message-panel__text sib-form-message-panel__text--center !text-red-400 justify-center">
            <svg
              viewBox="0 0 512 512"
              className="sib-icon sib-notification__icon"
            >
              <path d="M256 40c118.621 0 216 96.075 216 216 0 119.291-96.61 216-216 216-119.244 0-216-96.562-216-216 0-119.203 96.602-216 216-216m0-32C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm-11.49 120h22.979c6.823 0 12.274 5.682 11.99 12.5l-7 168c-.268 6.428-5.556 11.5-11.99 11.5h-8.979c-6.433 0-11.722-5.073-11.99-11.5l-7-168c-.283-6.818 5.167-12.5 11.99-12.5zM256 340c-15.464 0-28 12.536-28 28s12.536 28 28 28 28-12.536 28-28-12.536-28-28-28z" />
            </svg>
            <span className="sib-form-message-panel__inner-text !text-md">
              Your subscription could not be saved. Please try again.
            </span>
          </div>
        </div>
        <div
          id="success-message"
          className="sib-form-message-panel !border-none"
        >
          <div className="sib-form-message-panel__text sib-form-message-panel__text--center text-green-400 justify-center">
            <svg
              viewBox="0 0 512 512"
              className="sib-icon sib-notification__icon"
            >
              <path d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 464c-118.664 0-216-96.055-216-216 0-118.663 96.055-216 216-216 118.664 0 216 96.055 216 216 0 118.663-96.055 216-216 216zm141.63-274.961L217.15 376.071c-4.705 4.667-12.303 4.637-16.97-.068l-85.878-86.572c-4.667-4.705-4.637-12.303.068-16.97l8.52-8.451c4.705-4.667 12.303-4.637 16.97.068l68.976 69.533 163.441-162.13c4.705-4.667 12.303-4.637 16.97.068l8.451 8.52c4.668 4.705 4.637 12.303-.068 16.97z" />
            </svg>
            <span className="sib-form-message-panel__inner-text !text-md !text-green-500">
              Your subscription has been successful.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
