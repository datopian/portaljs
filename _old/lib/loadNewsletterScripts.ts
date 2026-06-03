
import { HTMLProps } from "react";

const loadScript = (
  props: HTMLProps<HTMLScriptElement> & { textContent?: string }
): (() => void) => {
  const script = document.createElement("script");
  Object.assign(script, props);
  document.head.appendChild(script);
  return () => document.head.removeChild(script);
};

export const loadScripts = () => {
  const formValidationScript = loadScript({
    id: "newsletter-form-validation-message",
    textContent: `
          window.LOCALE = 'en';
          window.EMAIL_INVALID_MESSAGE = "The information provided is invalid. Please review the field format and try again.";
          window.REQUIRED_ERROR_MESSAGE = "This field cannot be left blank. ";
          window.GENERIC_INVALID_MESSAGE = "The information provided is invalid. Please review the field format and try again.";
          window.translation = {
            common: {
              selectedList: '{quantity} list selected',
              selectedLists: '{quantity} lists selected'
            }
          };
          var AUTOHIDE = Boolean(0);
        `,
  });

  const formSubmitScript = loadScript({
    id: "newsletter-submit-form",
    src: "https://sibforms.com/forms/end-form/build/main.js",
    async: true,
    defer: true,
  });

  return {
    resetElements: () => {
      formSubmitScript();
      formValidationScript();
    },
  };
};

