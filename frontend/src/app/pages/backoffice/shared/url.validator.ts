import { AbstractControl, ValidationErrors } from '@angular/forms';

export function httpUrlValidator(control: AbstractControl): ValidationErrors | null {
  const raw = (control.value ?? '').toString().trim();
  if (!raw) return null; 

  try {
    const url = new URL(raw);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return { url: true };
    return null;
  } catch {
    return { url: true };
  }
}
