import { ILoginPageUI } from './login_page_schema';

export const buildLoginPageUI = (): ILoginPageUI => {
  return {
    title: 'Wall Decor Visualizer',
    form: {
      fields: [
        {
          name: 'email',
          type: 'email',
          label: 'Email',
          placeholder: 'Enter your email',
          required: true
        },
        {
          name: 'password',
          type: 'password',
          label: 'Password',
          placeholder: 'Enter your password',
          required: true
        }
      ],
      submitButton: {
        text: 'Login',
        action: 'submit'
      }
    },
    footer: {
      text: 'Forgot password?',
      link: '/forgot-password'
    }
  };
};
