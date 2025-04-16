import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { StateService } from '../services/state.service';
import { Observable, Subscription } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { CreditData } from '../types/creditdata';

@Component({
  selector: 'app-credit-evaluation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './credit-evaluation.component.html',
  styleUrls: ['./credit-evaluation.component.scss'],
})
export class CreditEvaluationComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private stateService = inject(StateService);

  creditForm!: FormGroup;
  userName$: Observable<string | undefined> | undefined;
  private creditDataSubscription?: Subscription;

  ngOnInit(): void {
    this.creditForm = this.fb.group(
      {
        grossSalary: [
          '',
          [
            Validators.required,
            Validators.min(0),
            Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/),
          ],
        ],
        netSalary: [
          '',
          [
            Validators.required,
            Validators.min(0),
            Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/),
          ],
        ],
        expenses: [
          '',
          [
            Validators.required,
            Validators.min(0),
            Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/),
          ],
        ],
      },
      { validators: this.netSalaryLessThanGross }
    );

    const existingCreditData = this.stateService.currentState.creditData;
    if (existingCreditData) {
      this.creditForm.patchValue(existingCreditData);
    }

    this.creditDataSubscription = this.creditForm.valueChanges.subscribe(
      (value) => {
        const creditData: CreditData = {
          grossSalary: value.grossSalary
            ? parseFloat(value.grossSalary)
            : undefined,
          netSalary: value.netSalary ? parseFloat(value.netSalary) : undefined,
          expenses: value.expenses ? parseFloat(value.expenses) : undefined,
        };
        this.stateService.setCreditDataAndEvaluate(creditData);
      }
    );

    this.userName$ = this.stateService.state$.pipe(
      map((state) => state.userData?.name),
      tap((name) => {
        if (!name && !this.stateService.currentState.userData) {
          console.warn('User data missing, redirecting to registration.');
          this.router.navigate(['/register'], { replaceUrl: true });
        }
      }),
      take(1)
    );
  }

  ngOnDestroy(): void {
    if (this.creditDataSubscription) {
      this.creditDataSubscription.unsubscribe();
    }
  }

  /**
   * Custom validator to check if net salary is less than or equal to gross salary.
   * @param control The form group containing salary fields.
   * @returns Validation error object or null.
   */
  netSalaryLessThanGross(control: AbstractControl): ValidationErrors | null {
    const gross = control.get('grossSalary')?.value;
    const net = control.get('netSalary')?.value;
    const netControl = control.get('netSalary');

    if (
      netControl &&
      gross !== null &&
      net !== null &&
      gross !== '' &&
      net !== '' &&
      !isNaN(parseFloat(gross)) &&
      !isNaN(parseFloat(net))
    ) {
      if (parseFloat(net) > parseFloat(gross)) {
        netControl.setErrors({ ...netControl.errors, netExceedsGross: true });
        return { netExceedsGross: true };
      } else {
        const currentErrors = { ...netControl.errors };
        if (currentErrors && currentErrors['netExceedsGross']) {
          delete currentErrors['netExceedsGross'];

          netControl.setErrors(
            Object.keys(currentErrors).length === 0 ? null : currentErrors
          );
        }
      }
    } else if (netControl && netControl.hasError('netExceedsGross')) {
      const currentErrors = { ...netControl.errors };
      delete currentErrors['netExceedsGross'];
      netControl.setErrors(
        Object.keys(currentErrors).length === 0 ? null : currentErrors
      );
    }

    return null;
  }

  onSubmit(): void {
    if (this.creditForm.valid) {
      const navigationExtras: NavigationExtras = {
        replaceUrl: true,
      };
      this.router.navigate(['/outcome'], navigationExtras);
    } else {

      this.creditForm.markAllAsTouched();
    }
  }

  goBack(): void {
    this.router.navigate(['/register']);
  }

  get grossSalary() {
    return this.creditForm.get('grossSalary');
  }
  get netSalary() {
    return this.creditForm.get('netSalary');
  }
  get expenses() {
    return this.creditForm.get('expenses');
  }
}
