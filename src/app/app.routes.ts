import { Routes } from '@angular/router';
import { UserRegistrationComponent } from './user-registration/user-registration.component';
import { CreditEvaluationComponent } from './credit-evaluation/credit-evaluation.component';
import { OutcomeComponent } from './outcome/outcome.component';

export const routes: Routes = [

  { path: '', redirectTo: '/register', pathMatch: 'full' },
  {
    path: 'register',
    component: UserRegistrationComponent,
    title: 'User Details'
  },
  {
    path: 'credit-evaluation',
    component: CreditEvaluationComponent,
    title: 'Credit Evaluation'
  },
  {
    path: 'outcome',
    component: OutcomeComponent,
    title: 'Evaluation Outcome'
  },
  { path: '**', redirectTo: '/register' }
];
