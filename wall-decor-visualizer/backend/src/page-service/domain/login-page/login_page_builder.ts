// Login Page Builder for Login Page BFF

import { ILoginPage } from './interface.js';
import { buildPhoneNumberForm } from './phone_form_builder.js';
import { buildOTPForm } from './otp_form_builder.js';

export function buildLoginPage(): ILoginPage {
  return {
    title: 'Wall Decor Visualizer',
    subtitle: 'Sign in to your account',
    forms: [
      buildPhoneNumberForm(),
      buildOTPForm()
    ]
  };
}
