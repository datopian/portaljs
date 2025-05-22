import { forwardRef, Fragment, useImperativeHandle, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { PuzzlePieceIcon } from "@heroicons/react/24/solid";

export type AddonModalHandle = {
  open: (props: Partial<AddonModalProps>) => void;
  close: () => void;
};

export type AddonModalProps = {
  title?: string;
  addons?: {
    type: "list" | "table";
    items: { text: string }[] | { key: string; value: string }[];
  };
};

export default forwardRef<AddonModalHandle, AddonModalProps>(
  function AddonModal(props, ref) {
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState<AddonModalProps>(props);

    const open = (props: Partial<AddonModalProps>) => {
      setContent((prev) => {
        const tmp = { ...prev };
        Object.assign(tmp, props);
        return tmp;
      });

      setIsOpen(true);
    };

    const close = () => {
      setIsOpen(false);
    };

    useImperativeHandle(ref, () => ({
      open,
      close,
    }));

    return (
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setIsOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-900 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                    <button
                      type="button"
                      className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-neutral-100 sm:mx-0 sm:h-10 sm:w-10">
                      <PuzzlePieceIcon
                        className="h-6 w-6 text-neutral-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6"
                      >
                        {content.title}
                      </Dialog.Title>
                      <div className="mt-3">
                        <p className="text-sm">
                          {content.addons &&
                            content.addons.type === "table" && (
                                <table className="w-full text-left">
                                  <tbody>
                                    {content.addons.items.map((item) => (
                                      <tr key={item.key}>
                                        <td className="relative py-2 pr-3 text-sm font-medium">
                                          {item.key}
                                        </td>
                                        <td className="hidden px-3 py-2 text-sm opacity-50 sm:table-cell">
                                          {item.value}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                            )}
                          {content.addons && content.addons.type === "list" && (
                            <ul className="list-disc">
                              {content.addons.items.map((item) => (
                                <li className="mb-3">{item.text}</li>
                              ))}
                            </ul>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => setIsOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    );
  }
);
