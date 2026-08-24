export const EMAIL_REGEX =
  /^[^\s@]+@(gmail\.com|heidelbergmaterials\.com|hcconnect\.com|outlook\.com|heidelbergcement\.com|yahoo\.com)$/i;

export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const TOKEN_REGEX = /^[A-Za-z0-9]{6}$/;