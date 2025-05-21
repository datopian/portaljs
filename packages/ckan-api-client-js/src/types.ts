export interface CkanResponse<T> {
  help: string;
  success: boolean;
  result: T;
  error?: {
    __type: string;
    message: string;
  };
}

export enum CkanErrorType {
  ValidationError = "Validation Error",
  AuthorizationError = "Authorization Error",
  NotFoundError = "Not Found Error"
}
export type CkanErrorBody = {
  help: string;
  error: {
    [field: string]: string[] | string;
    __type: CkanErrorType;
  };
};

export interface RequestOptions {
  headers?: { [k: string]: any };
  apiKey?: string;
  ckanUrl?: string;
}

export interface GetRequestOptions extends RequestOptions {}

export interface PostRequestOptions extends RequestOptions {
  json?: any; // TODO: it should be either json OR formData
  formData?: any;
}
