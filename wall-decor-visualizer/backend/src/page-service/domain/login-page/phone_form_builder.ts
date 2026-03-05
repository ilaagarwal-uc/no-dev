// Phone Number Form Builder for Login Page BFF

import { IForm } from './interface.js';

export function buildPhoneNumberForm(): IForm {
  return {
    type: 'phone-number-form',
    fields: [
      {
        name: 'phoneNumber',
        type: 'tel',
        label: 'Phone Number',
        placeholder: 'Enter your 10-digit phone number',
        maxLength: 10,
        required: true,
        autoFocus: true
      }
    ],
    buttons: [
      {
        text: 'Send OTP',
        type: 'submit'
      }
    ]
  };
}
