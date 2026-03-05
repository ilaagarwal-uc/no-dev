// UI Component Type Definitions for Login Page BFF

export interface IFormField {
  name: string;
  type: 'text' | 'tel' | 'email' | 'password' | 'number';
  label: string;
  placeholder?: string;
  maxLength?: number;
  required: boolean;
  autoFocus?: boolean;
}

export interface IFormButton {
  text: string;
  type: 'submit' | 'button';
  disabled?: boolean;
}

export interface IForm {
  type: string;
  fields: IFormField[];
  buttons: IFormButton[];
}

export interface ILoginPage {
  title: string;
  subtitle: string;
  forms: IForm[];
}

export interface IPageResponse {
  success: boolean;
  page?: ILoginPage;
  error?: {
    message: string;
    code: string;
  };
}
