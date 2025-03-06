import { Directive, forwardRef } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors } from '@angular/forms';
import { customEmailValidator } from '../utils/validators/email.validator';

@Directive({
  selector: '[appEmail]',
  providers: [{
     provide: NG_VALIDATORS,
     useExisting: forwardRef(() => EmailDirective),
     multi: true
  }]
})
export class EmailDirective {

  constructor() { }

  validate(control: AbstractControl): ValidationErrors | null {
      const validatorFn = customEmailValidator();
  
      return validatorFn(control);  
    }
  
}
