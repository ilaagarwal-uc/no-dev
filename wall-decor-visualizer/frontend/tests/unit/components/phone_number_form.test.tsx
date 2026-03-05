import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PhoneNumberForm } from '../../../src/page-service/domain/login-page/phone_number_form';
import * as authApi from '../../../src/data-service/application/auth';

vi.mock('../../../src/data-service/application/auth');

describe('PhoneNumberForm Component', () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render phone number input field', () => {
    render(<PhoneNumberForm onSuccess={mockOnSuccess} />);
    
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your 10-digit phone number/i)).toBeInTheDocument();
  });

  it('should render "Send OTP" button', () => {
    render(<PhoneNumberForm onSuccess={mockOnSuccess} />);
    
    expect(screen.getByRole('button', { name: /send otp/i })).toBeInTheDocument();
  });

  it('should disable button when phone number is empty', () => {
    render(<PhoneNumberForm onSuccess={mockOnSuccess} />);
    
    const button = screen.getByRole('button', { name: /send otp/i });
    expect(button).toBeDisabled();
  });

  it('should enable button when phone number is valid', () => {
    render(<PhoneNumberForm onSuccess={mockOnSuccess} />);
    
    const input = screen.getByLabelText(/phone number/i);
    fireEvent.change(input, { target: { value: '1234567890' } });
    
    const button = screen.getByRole('button', { name: /send otp/i });
    expect(button).not.toBeDisabled();
  });

  it('should show error message for invalid phone number on submit', async () => {
    render(<PhoneNumberForm onSuccess={mockOnSuccess} />);
    
    const input = screen.getByLabelText(/phone number/i);
    fireEvent.change(input, { target: { value: '123' } });
    
    const button = screen.getByRole('button', { name: /send otp/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/phone number must be exactly 10 digits/i)).toBeInTheDocument();
    });
  });

  it('should clear error message when user types', async () => {
    render(<PhoneNumberForm onSuccess={mockOnSuccess} />);
    
    const input = screen.getByLabelText(/phone number/i);
    
    // Trigger error
    fireEvent.change(input, { target: { value: '123' } });
    const button = screen.getByRole('button', { name: /send otp/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/phone number must be exactly 10 digits/i)).toBeInTheDocument();
    });
    
    // Type again
    fireEvent.change(input, { target: { value: '1234' } });
    
    expect(screen.queryByText(/phone number must be exactly 10 digits/i)).not.toBeInTheDocument();
  });

  it('should call onSuccess with phone number when form submitted successfully', async () => {
    vi.mocked(authApi.generateOTP).mockResolvedValue({
      success: true,
      message: 'OTP sent'
    });
    
    render(<PhoneNumberForm onSuccess={mockOnSuccess} />);
    
    const input = screen.getByLabelText(/phone number/i);
    fireEvent.change(input, { target: { value: '1234567890' } });
    
    const button = screen.getByRole('button', { name: /send otp/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith('1234567890');
    });
  });

  it('should show loading state while submitting', async () => {
    vi.mocked(authApi.generateOTP).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true, message: 'OTP sent' }), 100))
    );
    
    render(<PhoneNumberForm onSuccess={mockOnSuccess} />);
    
    const input = screen.getByLabelText(/phone number/i);
    fireEvent.change(input, { target: { value: '1234567890' } });
    
    const button = screen.getByRole('button', { name: /send otp/i });
    fireEvent.click(button);
    
    expect(screen.getByText(/sending\.\.\./i)).toBeInTheDocument();
    expect(button).toBeDisabled();
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should disable input and button while loading', async () => {
    vi.mocked(authApi.generateOTP).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true, message: 'OTP sent' }), 100))
    );
    
    render(<PhoneNumberForm onSuccess={mockOnSuccess} />);
    
    const input = screen.getByLabelText(/phone number/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1234567890' } });
    
    const button = screen.getByRole('button', { name: /send otp/i });
    fireEvent.click(button);
    
    expect(input.disabled).toBe(true);
    expect(button).toBeDisabled();
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should only allow numeric input', () => {
    render(<PhoneNumberForm onSuccess={mockOnSuccess} />);
    
    const input = screen.getByLabelText(/phone number/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'abc123def456' } });
    
    expect(input.value).toBe('123456');
  });

  it('should limit input to 10 digits', () => {
    render(<PhoneNumberForm onSuccess={mockOnSuccess} />);
    
    const input = screen.getByLabelText(/phone number/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '12345678901234' } });
    
    expect(input.value).toBe('1234567890');
  });

  it('should show error message on API failure', async () => {
    vi.mocked(authApi.generateOTP).mockRejectedValue(new Error('Network error'));
    
    render(<PhoneNumberForm onSuccess={mockOnSuccess} />);
    
    const input = screen.getByLabelText(/phone number/i);
    fireEvent.change(input, { target: { value: '1234567890' } });
    
    const button = screen.getByRole('button', { name: /send otp/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });
});
