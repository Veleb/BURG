import { ValidatorFn } from "@angular/forms";

export function passwordValidator(): ValidatorFn {
  return (control) => {
    const passwordValue = control.value;
    const regExp = new RegExp(`^[A-Za-z0-9_@!]{8,64}$`);

    const isValid = passwordValue === '' || regExp.test(passwordValue);
    
    return isValid ? null : { passwordValidator: true };
  }
}