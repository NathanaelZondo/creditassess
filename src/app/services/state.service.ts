import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppState } from '../types/appdata';
import { UserData } from '../types/userdata';
import { CreditData } from '../types/creditdata';

const STATE_STORAGE_KEY = 'creditAppState';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  private readonly defaultInitialState: AppState = {
    userData: null,
    creditData: null,
    isQualified: null,
  };

  private readonly _state = new BehaviorSubject<AppState>(this.loadState());

  readonly state$: Observable<AppState> = this._state.asObservable();

  constructor() {}

  private loadState(): AppState {
    try {
      if (typeof sessionStorage !== 'undefined') {
        const storedState = sessionStorage.getItem(STATE_STORAGE_KEY);
        if (storedState) {
          const parsedState = JSON.parse(storedState);

          if (parsedState && typeof parsedState === 'object') {
            return parsedState as AppState;
          }
        }
      }
    } catch (error) {
      console.error('Error loading state from sessionStorage:', error);
    }

    return this.defaultInitialState;
  }

  private saveState(state: AppState): void {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(state));
      }
    } catch (error) {
      console.error('Error saving state to sessionStorage:', error);
    }
  }

  /** Gets the current state object */
  get currentState(): AppState {
    return this._state.getValue();
  }

  /**
   * Updates the user data in the state and saves it.
   * @param userData - The user data from the registration form.
   */
  setUserData(userData: UserData): void {
    const newState = {
      ...this.currentState,
      userData: userData,
    };
    this._state.next(newState);
    this.saveState(newState);
  }

  /**
   * Updates the credit data, performs the evaluation, and saves the state.
   * @param creditData - The credit data from the evaluation form.
   */
  setCreditDataAndEvaluate(creditData: CreditData): void {
    let isQualified: boolean | null = null; // Initialize as null

    if (
      creditData.expenses !== undefined &&
      creditData.netSalary !== undefined
    ) {
      isQualified = creditData.expenses <= creditData.netSalary * 0.5;
    } else {
      console.warn(
        'Cannot evaluate credit data: Missing required net salary or expenses.'
      );
    }

    const newState = {
      ...this.currentState,
      creditData: creditData,
      isQualified: isQualified,
    };
    this._state.next(newState);
    this.saveState(newState);
  }

  resetState(): void {
    this._state.next(this.defaultInitialState);
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(STATE_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error clearing state from sessionStorage:', error);
    }
  }
}
