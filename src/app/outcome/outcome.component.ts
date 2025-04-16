import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { StateService } from '../services/state.service';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon'; 
import { CommonModule } from '@angular/common'; 
import { AppState } from '../types/appdata';

@Component({
  selector: 'app-outcome',
  standalone: true, 
  imports: [
    CommonModule, 
    MatIconModule,
  ],
  templateUrl: './outcome.component.html',
  styleUrls: ['./outcome.component.scss'],
})
export class OutcomeComponent implements OnInit {

  private router = inject(Router);
  private stateService = inject(StateService);

  state$: Observable<AppState> | undefined;

  reasons$: Observable<string[]> | undefined;

  ngOnInit(): void {
  
    this.state$ = this.stateService.state$.pipe(
      tap((state) => {
        if (
          state.isQualified === null ||
          !state.userData ||
          !state.creditData
        ) {
          console.warn(
            'Evaluation data missing or incomplete, redirecting to registration.'
          );
         
          this.router.navigate(['/register'], { replaceUrl: true });
        }
      })
    );

   
    this.reasons$ = this.state$.pipe(
      map((state) => {
        const reasons: string[] = [];
       
        if (state.isQualified === false && state.creditData) {
          const netThreshold =
            state.creditData.netSalary !== undefined
              ? state.creditData.netSalary * 0.5
              : 0;

        
          if (
            state.creditData.expenses !== undefined &&
            state.creditData.expenses > netThreshold
          ) {
            reasons.push(
              `Expenses (R${state.creditData.expenses.toFixed(
                2
              )}) exceed 50% of Net Salary (Threshold: R${netThreshold.toFixed(
                2
              )}).`
            );
          }
        
          if (reasons.length === 0) {
            reasons.push(
              'You did not qualify for credit based on our criteria.'
            );
          }
        } else if (state.isQualified === false) {
          reasons.push('You did not qualify for credit based on our criteria.');
        }
        return reasons;
      })
    );
  }

  startNewEvaluation(): void {
    this.stateService.resetState();
    this.router.navigate(['/register']);
  }
}
