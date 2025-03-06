import { Directive, forwardRef } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors } from '@angular/forms';
import { repasswordValidator } from '../utils/validators/repass.validator';

@Directive({
  selector: '[appRepass]',
   providers: [{
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => RepassDirective),
      multi: true
    }]
})
export class RepassDirective {

  constructor() { }

  validate(control: AbstractControl): ValidationErrors | null {
      const validatorFn = repasswordValidator();
  
      return validatorFn(control);  
    }
  
}
