export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  suggestion?: string;
}

export const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'trashmail.com',
  'yopmail.com',
  'sharklasers.com',
  'dispostable.com',
  'getairmail.com',
  'throwawaymail.com',
  'temp-mail.org',
  'fakeinbox.com',
  'burnermail.io',
  'maildrop.cc',
  'inboxkitten.com',
  'mytemp.email',
]);

export const COMMON_DOMAIN_TYPOS: Record<string, string> = {
  'gmai.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmaik.com': 'gmail.com',
  'gmaul.com': 'gmail.com',
  'gemail.com': 'gmail.com',
  'outlok.com': 'outlook.com',
  'outllok.com': 'outlook.com',
  'ootlook.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'outllook.com': 'outlook.com',
  'hotmial.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'hotmaill.com': 'hotmail.com',
  'hotamail.com': 'hotmail.com',
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yhoo.com': 'yahoo.com',
  'yahoo.co': 'yahoo.com',
  'iclud.com': 'icloud.com',
  'icoud.com': 'icloud.com',
  'icloud.co': 'icloud.com',
  'heidelbergmaterial.com': 'heidelbergmaterials.com',
};

/**
 * Validates whether an email is properly formatted and capable of receiving emails.
 * Performs syntax checks, local/domain part rules, TLD validation,
 * disposable domain detection, and common typo suggestions.
 */
export function validateEmail(email?: string | null): EmailValidationResult {
  const trimmed = email?.trim() ?? '';

  if (!trimmed) {
    return {
      isValid: false,
      error: 'Email address is required.',
    };
  }

  if (trimmed.length > 254) {
    return {
      isValid: false,
      error: 'Email address is too long (max 254 characters).',
    };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return {
      isValid: false,
      error: 'Please enter a valid email address with a single "@".',
    };
  }

  const [localPart, domainPart] = parts;

  if (!localPart || localPart.length > 64) {
    return {
      isValid: false,
      error: 'Email username is invalid or exceeds 64 characters.',
    };
  }

  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return {
      isValid: false,
      error: 'Email username cannot start or end with a dot.',
    };
  }

  if (localPart.includes('..')) {
    return {
      isValid: false,
      error: 'Email username cannot contain consecutive dots.',
    };
  }

  if (!domainPart || domainPart.length > 255) {
    return {
      isValid: false,
      error: 'Please enter a valid domain name.',
    };
  }

  if (
    domainPart.startsWith('.') ||
    domainPart.endsWith('.') ||
    domainPart.startsWith('-') ||
    domainPart.endsWith('-')
  ) {
    return {
      isValid: false,
      error: 'Domain name cannot start or end with a dot or hyphen.',
    };
  }

  if (domainPart.includes('..')) {
    return {
      isValid: false,
      error: 'Domain name cannot contain consecutive dots.',
    };
  }

  const domainSubparts = domainPart.split('.');
  if (domainSubparts.length < 2) {
    return {
      isValid: false,
      error: 'Domain must include an extension (e.g., .com, .org).',
    };
  }

  const tld = domainSubparts[domainSubparts.length - 1];
  if (!/^[a-zA-Z]{2,24}$/.test(tld)) {
    return {
      isValid: false,
      error: 'Domain extension must contain at least 2 alphabetic characters.',
    };
  }

  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address format (e.g. user@example.com).',
    };
  }

  const lowerDomain = domainPart.toLowerCase();

  // Disposable domain check
  if (DISPOSABLE_EMAIL_DOMAINS.has(lowerDomain)) {
    return {
      isValid: false,
      error: 'Disposable / temporary email addresses cannot receive notification emails.',
    };
  }

  // Typo suggestion check
  let suggestion: string | undefined;
  if (COMMON_DOMAIN_TYPOS[lowerDomain]) {
    suggestion = `${localPart}@${COMMON_DOMAIN_TYPOS[lowerDomain]}`;
  }

  return {
    isValid: true,
    suggestion,
  };
}
