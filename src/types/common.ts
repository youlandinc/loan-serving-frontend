export interface TaskFiles {
  originalFileName: string;
  fileName: string;
  url: string;
  uploadTime: string;
}

export interface AddressData {
  address: string;
  aptNumber: string;
  city: string;
  state: string;
  postcode: string;
}

export enum HttpErrorType {
  tokenExpired = '40001',
}

export enum HttpVariant {
  error = 'error',
  success = 'success',
  warning = 'warning',
  info = 'info',
}

export interface HttpError {
  message: string;
  header: string;
  variant: HttpVariant;
}
