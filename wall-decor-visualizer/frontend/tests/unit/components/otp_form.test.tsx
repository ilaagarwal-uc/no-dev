import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OTPForm } from '../../../src/page-service/domain/login-page/otp_form';
import * as authApi from '../../../src/data-service/application/auth';

vi.mock('../../../src/data-service/application/auth');

describe('OTPForm Component', () => {
  const mockOnSuccess = vi.fn();
  const mockOnBack = vi.fn();
  const phoneNumber = '1234567890';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render OTP input field', () => {
    render(<OTPForm phoneNumber={phoneNumber} onSuccess={mockOnSuccess} onBack={mockOnBack} />);
    
    expect(screen.getByLabelText(/enter otp/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter 4-digit otp/i)).toBeInTheDocument();
  });

  it('should render "Verify OTP" button', () => {
    render(<OTPForm phoneNumber={phoneNumber} onSuccess={mockOnSuccess} onBack={mockOnBack} />);
    
    expect(screen.getByRole('button', { name: /verify otp/i })).toBeInTheDocument();
  });

  it('should render "Resend OTP" link', () => {
    render(<OTPForm phoneNumber={phoneNumber} onSuccess={mockOnSuccess} onBack={mockOnBack} />);
    
    expect(screen.getByText(/didn't receive the code\? resend otp/i)).toBeInTheDocument();
  });

  it('should disable verify button when OTP is empty', () => {
    render(<OTPForm phoneNumber={phoneNumber} onSuccess={mockOnSuccess} onBack={mockOnBack} />);
    
    const button = screen.getByRole('button', { name: /verify otp/i });
    expect(button).toBeDisabled();
  });

  it('should enable verify button when OTP is 4 digits', () => {
    render(<OTPForm phoneNumber={phoneNumber} onSuccess={mockOnSuccess} onBack={mockOnBack} />);
    
    const input = screen.getByLabelText(/enter otp/i);
    fireEvent.change(input, { target: { value: '2213' } });
    
    const button = screen.getByRole('button', { name: /verify otp/i });
    expect(button).not.toBeDisabled();
  });

  it('should show error message for invalid OTP format on submit', async () => {
    render(<OTPForm phoneNumber={phoneNumber} onSuccess={mockOnSuccess} onBack={mockOnBack} />);
    
    const input = screen.getByLabelText(/enter otp/i);
    fireEvent.change(input, { target: { value: '12' } });
    
    const button = screen.getByRole('button', { name: /verify otp/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/otp must be exactly 4 digits/i)).toBeInTheDocument();
    });
  });

  it('should call onSuccess when OTP verified successfully', async () => {
    vi.mocked(authApi.verifyOTP).mockResolvedValue({
      success: true,
      token: 'mock-token',
      userId: 'mock-user-id'
    });
    
    render(<OTPForm phoneNumber={phoneNumber} onSuccess={mockOnSuccess} onBack={mockOnBack} />);
    
    const input = screen.getByLabelText(/enter otp/i);
    fireEvent.change(input, { target: { value: '2213' } });
    
    const button = screen.getByRole('button', { name: /verify otp/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should call onResend when "Resend OTP" clicked', async () => {
    vi.mocked(authApi.generateOTP).mockResolvedValue({
      success: true,
      message: 'OTP sent'
    });
    
    render(<OTPForm phoneNumber={phoneNumber} onSuccess={mockOnSuccess} onBack={mockOnBack} />);
    
    const resendButton = screen.getByText(/didn't receive the code\? resend otp/i);
    fireEvent.click(resendButton);
    
    await waitFor(() => {
      expect(authApi.generateOTP).toHaveBeenCalledWith(phoneNumber);
    });
  });

  it('should show loading state while verifying', async () => {
    vi.mocked(authApi.verifyOTP).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true, token: 'token', userId: 'id' }), 100))
    );
    
    render(<OTPForm phoneNumber={phoneNumber} onSuccess={mockOnSuccess} onBack={mockOnBack} />);
    
    const input = screen.getByLabelText(/enter otp/i);
    fireEvent.change(input, { target: { value: '2213' } });
    
    const button = screen.getByRole('button', { name: /verify otp/i });
    fireEvent.click(button);
    
    expect(screen.getByText(/verifying\.\.\./i)).toBeInTheDocument();
    expect(button).toBeDisabled();
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should only allow numeric input', () => {
    render(<OTPForm phoneNumber={phoneNumber} onSuccess={mockOnSuccess} onBack={mockOnBack} />);
    
    const input = screen.getByLabelText(/enter otp/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'abc1def2' } });
    
    expect(input.value).toBe('12');
  });

  it('should limit input to 4 digits', () => {
    render(<OTPForm phoneNumber={phoneNumber} onSuccess={mockOnSuccess} onBack={mockOnBack} />);
    
    const input = screen.getByLabelText(/enter otp/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '123456' } });
    
    expect(input.value).toBe('1234');
  });

  it('should show remaining attempts on incorrect OTP', async () => {
    vi.mocked(authApi.verifyOTP).mockResolvedValue({
      success: false,
      error: {
        message: 'Incorrect OTP. 2 attempts remaining.',
        code: 'INCORRECT_OTP',
        remainingAttempts: 2
      }
    });
    
    render(<OTPForm phoneNumber={phoneNumber} onSuccess={mockOnSuccess} onBack={mockOnBack} />);
    
    const input = screen.getByLabelText(/enter otp/i);
    fireEvent.change(input, { target: { value: '1111' } });
    
    const button = screen.getByRole('button', { name: /verify otp/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getAllByText(/2 attempts remaining/i).length).toBeGreaterThan(0);
    });
  });

  it('should call onBack when back button clicked', () => {
    render(<OTPForm phoneNumber={phoneNumber} onSuccess={mockOnSuccess} onBack={mockOnBack} />);
    
    const backButton = screen.getByText(/← back to phone number/i);
    fireEvent.click(backButton);
    
    expect(mockOnBack).toHaveBeenCalled();
  });
});
