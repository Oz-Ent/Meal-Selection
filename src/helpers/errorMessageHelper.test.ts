import { AxiosError, AxiosHeaders } from 'axios';
import { getErrorMessage } from './errorMessageHelper';

const makeAxiosError = (data: unknown, message = 'req failed'): AxiosError => {
  const err = new AxiosError(message);
  err.response = {
    data,
    status: 400,
    statusText: 'Bad Request',
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
  return err;
};

describe('getErrorMessage', () => {
  it('prefers response.data.messages for axios errors', () => {
    expect(getErrorMessage(makeAxiosError({ messages: 'first', message: 'second' }))).toBe('first');
  });

  it('falls back to response.data.message', () => {
    expect(getErrorMessage(makeAxiosError({ message: 'second' }))).toBe('second');
  });

  it('falls back to the axios error message', () => {
    expect(getErrorMessage(makeAxiosError({}, 'network down'))).toBe('network down');
  });

  it('returns the message of a plain Error', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('returns the provided fallback for unknown values', () => {
    expect(getErrorMessage('nope', 'fallback text')).toBe('fallback text');
  });

  it('uses the default fallback when none is provided', () => {
    expect(getErrorMessage(42)).toBe('Something went wrong.');
  });
});
