import { validateEmail } from './emailValidation';

describe('validateEmail', () => {
  it('rejects empty or whitespace email', () => {
    expect(validateEmail('')).toEqual({
      isValid: false,
      error: 'Email address is required.',
    });
    expect(validateEmail('   ')).toEqual({
      isValid: false,
      error: 'Email address is required.',
    });
  });

  it('rejects email without @ or with multiple @', () => {
    expect(validateEmail('plainaddress')).toEqual({
      isValid: false,
      error: 'Please enter a valid email address with a single "@".',
    });
    expect(validateEmail('user@@example.com')).toEqual({
      isValid: false,
      error: 'Please enter a valid email address with a single "@".',
    });
  });

  it('rejects invalid local parts', () => {
    expect(validateEmail('.user@example.com').isValid).toBe(false);
    expect(validateEmail('user.@example.com').isValid).toBe(false);
    expect(validateEmail('user..name@example.com').isValid).toBe(false);
  });

  it('rejects invalid domain structures', () => {
    expect(validateEmail('user@example').isValid).toBe(false);
    expect(validateEmail('user@.example.com').isValid).toBe(false);
    expect(validateEmail('user@example.com.').isValid).toBe(false);
    expect(validateEmail('user@-example.com').isValid).toBe(false);
    expect(validateEmail('user@example..com').isValid).toBe(false);
    expect(validateEmail('user@example.c').isValid).toBe(false);
  });

  it('rejects disposable email domains', () => {
    const result = validateEmail('tester@mailinator.com');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Disposable');
  });

  it('provides suggestions for common domain typos', () => {
    const result = validateEmail('john.doe@gmai.com');
    expect(result.isValid).toBe(true);
    expect(result.suggestion).toBe('john.doe@gmail.com');

    const result2 = validateEmail('sarah@outlok.com');
    expect(result2.isValid).toBe(true);
    expect(result2.suggestion).toBe('sarah@outlook.com');
  });

  it('accepts valid email addresses', () => {
    expect(validateEmail('john.doe@example.com').isValid).toBe(true);
    expect(validateEmail('kofi.mensah@outlook.com').isValid).toBe(true);
    expect(validateEmail('user.name+tag@heidelbergmaterials.com').isValid).toBe(true);
    expect(validateEmail('admin@seneca.com').isValid).toBe(true);
  });
});
