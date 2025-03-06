import { AbstractControl, ValidatorFn } from "@angular/forms";

export function fullNameValidator(): ValidatorFn {
  return (control: AbstractControl) => {
    const fullName = control.value?.trim();

    if (!fullName) return { fullNameRequired: true };

    const regExp = /^(?!.*\d)[A-Za-z]+(?:['-][A-Za-z]+)*(?:\s+[A-Za-z]+(?:['-][A-Za-z]+)*)+$/;

    return regExp.test(fullName) 
      ? null 
      : { fullNameInvalid: true };
  };
}