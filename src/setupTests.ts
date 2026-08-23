import '@testing-library/jest-dom';

jest.setTimeout(60000);

/* eslint-disable @typescript-eslint/no-explicit-any */
import * as util from 'util';

if (typeof (globalThis as any).TextEncoder === 'undefined') {
  (globalThis as any).TextEncoder = util.TextEncoder;
  (globalThis as any).TextDecoder = util.TextDecoder;
}
