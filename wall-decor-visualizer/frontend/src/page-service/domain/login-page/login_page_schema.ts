export interface ILoginPageUI {
  title: string;
  form: ILoginForm;
  footer: IFooter;
}

export interface ILoginForm {
  fields: IFormField[];
  submitButton: IButton;
}

export interface IFormField {
  name: string;
  type: string;
  label: string;
  placeholder: string;
  required: boolean;
}

export interface IButton {
  text: string;
  action: string;
}

export interface IFooter {
  text: string;
  link: string;
}
