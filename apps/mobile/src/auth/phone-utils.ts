import { getCountryCallingCode, isValidPhoneNumber, type CountryCode } from "libphonenumber-js";

export function toE164(nationalNumber: string, country: CountryCode) {
  const digits = nationalNumber.replace(/\D/g, "").replace(/^0+/, "");
  return `+${getCountryCallingCode(country)}${digits}`;
}

export function validPhone(nationalNumber: string, country: CountryCode) {
  try { return isValidPhoneNumber(toE164(nationalNumber, country)); } catch { return false; }
}
