import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { OtpVerification } from './OtpVerification';

const mockVerifyOtp = jest.fn();

jest.mock('../../../../api/useApiQueries', () => ({
  useGeneratePasswordTokenMutation: () => ({ mutateAsync: jest.fn() }),
  useVerifyOtpMutation: () => ({ mutateAsync: mockVerifyOtp }),
}));

describe('OtpVerification Page', () => {
  it('renders the OTP heading', () => {
    render(
      <MemoryRouter>
        <OtpVerification />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /OTP/i })).toBeInTheDocument();
  });

  it('renders the OTP image', () => {
    render(
      <MemoryRouter>
        <OtpVerification />
      </MemoryRouter>,
    );
    expect(screen.getByAltText('OTP')).toBeInTheDocument();
  });

  it('renders the description text', () => {
    render(
      <MemoryRouter>
        <OtpVerification />
      </MemoryRouter>,
    );
    expect(screen.getByText(/sent a code to your email address/i)).toBeInTheDocument();
  });

  it('renders OTP input fields', () => {
    render(
      <MemoryRouter>
        <OtpVerification />
      </MemoryRouter>,
    );
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(5);
  });

  it('renders the Verify button', () => {
    render(
      <MemoryRouter>
        <OtpVerification />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: /Verify/i })).toBeInTheDocument();
  });

  it('renders the Verify button as disabled initially', () => {
    render(
      <MemoryRouter>
        <OtpVerification />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: /Verify/i })).toBeDisabled();
  });

  it('renders the Resend button', () => {
    render(
      <MemoryRouter>
        <OtpVerification />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: /Resend/i })).toBeInTheDocument();
  });

  it('renders the "Didn\'t receive code?" text', () => {
    render(
      <MemoryRouter>
        <OtpVerification />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Didn't receive code\?/i)).toBeInTheDocument();
  });

  it('shows the verification error for an invalid OTP', async () => {
    mockVerifyOtp.mockRejectedValueOnce(new Error('Invalid code.'));
    render(
      <MemoryRouter>
        <OtpVerification />
      </MemoryRouter>,
    );
    const inputs = screen.getAllByRole('textbox');
    // Enter an invalid OTP
    fireEvent.change(inputs[0], { target: { value: '1' } });
    fireEvent.change(inputs[1], { target: { value: '2' } });
    fireEvent.change(inputs[2], { target: { value: '3' } });
    fireEvent.change(inputs[3], { target: { value: '4' } });
    fireEvent.change(inputs[4], { target: { value: '5' } });

    const verifyButton = screen.getByRole('button', { name: /Verify/i });
    fireEvent.click(verifyButton);

    expect(await screen.findByText('Invalid code.')).toBeInTheDocument();
  });
});
