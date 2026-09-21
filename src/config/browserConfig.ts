export type BrowserName =
  | 'Chrome'
  | 'Edge'
  | 'Safari'
  | 'Firefox'
  | 'Opera'
  | 'Samsung'
  | 'Brave'
  | 'Unknown';

export type OperatingSystem =
  | 'iOS'
  | 'Android'
  | 'macOS'
  | 'Windows'
  | 'Linux'
  | 'Unknown';

export type PwaInstallMethod = 'native-prompt' | 'ios-share' | 'manual-menu' | 'unsupported';

export interface IBrowserDetails {
  name: BrowserName;
  os: OperatingSystem;
  version: string;
  isMobile: boolean;
  isStandalone: boolean;
  canPromptNativeInstall: boolean;
  installMethod: PwaInstallMethod;
  installInstructions: string[];
  pushSupported: boolean;
  pushRequiresPwaFirst: boolean;
  pushTroubleshooting: string[];
}

export const BROWSER_INSTALL_GUIDES: Record<
  BrowserName,
  {
    name: string;
    installMethod: PwaInstallMethod;
    instructions: string[];
    pushQuirks?: string;
  }
> = {
  Chrome: {
    name: 'Google Chrome',
    installMethod: 'native-prompt',
    instructions: ['Click "Install" when prompted to add Edziban to your device.'],
  },
  Edge: {
    name: 'Microsoft Edge',
    installMethod: 'native-prompt',
    instructions: ['Click "Install" to add Edziban to your taskbar or app library.'],
  },
  Safari: {
    name: 'Apple Safari',
    installMethod: 'ios-share',
    instructions: [
      'Tap the Share button (square with arrow pointing up) at the bottom or top of Safari.',
      'Scroll down and tap "Add to Home Screen".',
      'Tap "Add" in the top right to complete installation.',
    ],
    pushQuirks: 'On iOS 16.4+, Apple requires adding the app to your Home Screen first before Web Push notifications can be received.',
  },
  Samsung: {
    name: 'Samsung Internet',
    installMethod: 'native-prompt',
    instructions: ['Tap "Install" on the prompt or tap Menu (☰) -> "Add page to" -> "App screen".'],
  },
  Opera: {
    name: 'Opera',
    installMethod: 'native-prompt',
    instructions: ['Click "Install" or click the install icon in the address bar.'],
  },
  Brave: {
    name: 'Brave',
    installMethod: 'native-prompt',
    instructions: ['Click "Install" to add Edziban as a standalone application.'],
  },
  Firefox: {
    name: 'Mozilla Firefox',
    installMethod: 'manual-menu',
    instructions: [
      'On Android Firefox: tap Menu (⋮) -> "Install".',
      'On Desktop: Firefox does not support full PWA installation natively; you can bookmark or create a shortcut.',
    ],
    pushQuirks: 'Firefox in Private Browsing blocks push notifications.',
  },
  Unknown: {
    name: 'Web Browser',
    installMethod: 'native-prompt',
    instructions: ['Look for the "Install" option in your browser menu or address bar.'],
  },
};
