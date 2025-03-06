import { ValidatorFn, AbstractControl } from "@angular/forms";

export function customEmailValidator(): ValidatorFn {
  return (control: AbstractControl) => {
    const email = control.value;
    if (!email) return { emailRequired: true };

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailPattern.test(email)) {
      return { emailInvalid: true }; 
    }

    return null;
  };
}
