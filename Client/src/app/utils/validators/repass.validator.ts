import { ValidatorFn } from "@angular/forms";

export function repasswordValidator(): ValidatorFn {
  return (control) => {
    const repasswordValue = control.value;
    const passwordValue = control.parent?.get('password')?.value;
    
    if (repasswordValue === '') {
      return null;
    }

    const isValid = repasswordValue === passwordValue;
    
    return isValid ? null : { repasswordValidator: true };
  }
}