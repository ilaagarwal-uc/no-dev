import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from '../../../src/page-service/domain/login-page/login_page';
import * as authApi from '../../../src/data-service/application/auth';

vi.mock('../../../src/data-service/application/auth');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('LoginPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render PhoneNumberForm initially', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );
    
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send otp/i })).toBeInTheDocument();
  });

  it('should show OTPForm after phone number submitted', async () => {
    vi.mocked(authApi.generateOTP).mockResolvedValue({
      success: true,
      message: 'OTP sent'
    });
    
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );
    
    const input = screen.getByLabelText(/phone number/i);
    fireEvent.change(input, { target: { value: '1234567890' } });
    
    const button = screen.getByRole('button', { name: /send otp/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/enter otp/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /verify otp/i })).toBeInTheDocument();
    });
  });

  it('should display phone number in OTPForm', async () => {
    vi.mocked(authApi.generateOTP).mockResolvedValue({
      success: true,
      message: 'OTP sent'
    });
    
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );
    
    const input = screen.getByLabelText(/phone number/i);
    fireEvent.change(input, { target: { value: '1234567890' } });
    
    const button = screen.getByRole('button', { name: /send otp/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/we've sent a 4-digit code to 1234567890/i)).toBeInTheDocument();
    });
  });

  it('should call generate OTP API when phone submitted', async () => {
    vi.mocked(authApi.generateOTP).mockResolvedValue({
      success: true,
      message: 'OTP sent'
    });
    
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );
    
    const input = screen.getByLabelText(/phone number/i);
    fireEvent.change(input, { target: { value: '1234567890' } });
    
    const button = screen.getByRole('button', { name: /send otp/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(authApi.generateOTP).toHaveBeenCalledWith('1234567890');
    });
  });

  it('should show error message on generate OTP failure', async () => {
    vi.mocked(authApi.generateOTP).mockResolvedValue({
      success: false,
      message: 'Rate limit exceeded'
    });
    
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );
    
    const input = screen.getByLabelText(/phone number/i);
    fireEvent.change(input, { target: { value: '1234567890' } });
    
    const button = screen.getByRole('button', { name: /send otp/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/rate limit exceeded/i)).toBeInTheDocument();
    });
  });

  it('should allow going back to phone form', async () => {
    vi.mocked(authApi.generateOTP).mockResolvedValue({
      success: true,
      message: 'OTP sent'
    });
    
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );
    
    // Submit phone number
    const phoneInput = screen.getByLabelText(/phone number/i);
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    
    const sendButton = screen.getByRole('button', { name: /send otp/i });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/enter otp/i)).toBeInTheDocument();
    });
    
    // Go back
    const backButton = screen.getByText(/← back to phone number/i);
    fireEvent.click(backButton);
    
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
  });
});
