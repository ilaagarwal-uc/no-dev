// OTP Form Builder for Login Page BFF

import { IForm } from './interface.js';

export function buildOTPForm(): IForm {
  return {
    type: 'otp-form',
    fields: [
      {
        name: 'otp',
        type: 'text',
        label: 'OTP',
        placeholder: 'Enter 4-digit OTP',
        maxLength: 4,
        required: true,
        autoFocus: true
      }
    ],
    buttons: [
      {
        text: 'Verify OTP',
        type: 'submit'
      },
      {
        text: 'Back',
        type: 'button'
      }
    ]
  };
}
