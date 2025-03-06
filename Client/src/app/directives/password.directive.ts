import { Directive, forwardRef } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors } from '@angular/forms';
import { passwordValidator } from '../utils/validators/passwrod.validator';

@Directive({
  selector: '[appPassword]',
   providers: [{
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PasswordDirective),
      multi: true
    }]
})
export class PasswordDirective {

  constructor() { }

  validate(control: AbstractControl): ValidationErrors | null {
      const validatorFn = passwordValidator();
  
      return validatorFn(control);  
    }
  
}
