// Login Page API Handler - BFF Endpoint

import { Request, Response } from 'express';
import * as LoginPageDomain from '../../domain/login-page/index.js';
import { PageBuildError } from '../errors.js';

export interface IGetLoginPageResponse {
  success: boolean;
  page?: LoginPageDomain.ILoginPage;
  error?: {
    message: string;
    code: string;
  };
}

export async function getLoginPageHandler(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const page = LoginPageDomain.buildLoginPage();

    const response: IGetLoginPageResponse = {
      success: true,
      page
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof PageBuildError) {
      res.status(400).json({
        success: false,
        error: {
          message: error.message,
          code: 'PAGE_BUILD_ERROR'
        }
      });
      return;
    }

    console.error('Error building login page:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to build login page',
        code: 'SERVER_ERROR'
      }
    });
  }
}
