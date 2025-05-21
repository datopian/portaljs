import {
  CkanErrorBody,
  CkanErrorType,
  GetRequestOptions,
  PostRequestOptions,
  RequestOptions,
} from "./types";

export class CkanRequestError extends Error implements CkanErrorBody {
  //  Default error fields returned by CKAN
  public help: string;
  public error: CkanErrorBody["error"];

  //  Custom helper properties
  constructor(ckanErrorBody: CkanErrorBody) {
    const error = ckanErrorBody.error;

    let errorMessage = "An unknown error happened";
    if (error?.__type == CkanErrorType.AuthorizationError) {
      // TODO: other error types might follow this same behavior
      errorMessage = `${error.message}`;
    }

    if (error?.__type == CkanErrorType.NotFoundError) {
      errorMessage = `${error.message}`;
    }

    if (error?.__type == CkanErrorType.ValidationError) {
      const errorFields = Object.keys(error).filter((f) => !f.startsWith("__"));
      errorMessage = errorFields
        ? errorFields
            .map((f) => {
              const errorField = error[f];
              let errorMessage = `"${f}": `;
              errorMessage +=
                typeof errorField !== "string"
                  ? errorField?.join(" ")
                  : errorField;
              return errorMessage;
            })
            .join(" ")
        : "An error happened";

      errorMessage = `Validation error: ${errorMessage}`;
    }

    super(errorMessage);
    this.name = "CkanRequestError";

    this.help = ckanErrorBody.help;
    this.error = error;
  }
}

const methodFactory = <ReqOpts extends RequestOptions>(
  method: (
    action: string,
    options?: PostRequestOptions | GetRequestOptions
  ) => Promise<Response>
): (<FnRes>(action: string, options?: ReqOpts) => Promise<FnRes>) => {
  return async <FnRes>(url: string, options?: any): Promise<FnRes> => {
    let ckanUrl = options?.ckanUrl ?? process.env.NEXT_PUBLIC_CKAN_URL;

    if (!ckanUrl) {
      throw new Error("ckanUrl option or NEXT_PUBLIC_CKAN_URL env not set");
    }
    ckanUrl = ckanUrl.replace(/\/$/g, "");
    const ckanActionUrl = `${ckanUrl}/api/3/action/${url}`;
    try {
      const response: Response = await method(ckanActionUrl, options);
      const data: FnRes = (await response.json()) as FnRes;
      if (response.ok) {
        return data;
      } else {
        throw data;
      }
    } catch (e) {
      console.error(e);
      if (e) {
        throw new CkanRequestError(e as CkanErrorBody);
      }
      throw Error("An unknown error happened while reaching the server");
    }
  };
};

const headersFromOptions = (
  options: GetRequestOptions | PostRequestOptions | undefined
) => {
  const headers: RequestOptions["headers"] = {};

  if (options) {
    if (options.apiKey) {
      headers["Authorization"] = options.apiKey;
    }

    if ("json" in options) {
      headers["content-type"] = "application/json";
    } else if ("formData" in options) {
      headers["content-type"] = "multipart/form-data";
    }
  }

  // NOTE: this allows users to override calculated headers
  return { ...headers, ...options?.headers };
};

const customPost = async (actionUrl: string, options?: PostRequestOptions) => {
  const response = await fetch(actionUrl, {
    method: "POST",
    headers: headersFromOptions(options),
    body: options?.formData ?? JSON.stringify(options?.json),
  });
  return response;
};

const customGet = async (actionUrl: string, options?: GetRequestOptions) => {
  const response = await fetch(actionUrl, {
    method: "GET",
    headers: headersFromOptions(options),
  });
  return response;
};

const postMethod = methodFactory<PostRequestOptions>(customPost);
const getMethod = methodFactory<GetRequestOptions>(customGet);

export const CkanRequest = {
  post: postMethod,
  get: getMethod,
};
