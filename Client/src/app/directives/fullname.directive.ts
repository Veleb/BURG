import { Directive, forwardRef } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';
import { fullNameValidator } from '../utils/validators/fullname.validator';

@Directive({
  selector: '[appFullname]',
  providers: [{
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => FullnameDirective),
    multi: true
  }]
})
export class FullnameDirective implements Validator {

  validate(control: AbstractControl): ValidationErrors | null {
    return fullNameValidator()(control);
  }
}