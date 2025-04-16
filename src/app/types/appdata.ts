import { CreditData } from "./creditdata";
import { UserData } from "./userdata";


// Interface for the overall application state
export interface AppState {
  userData: UserData | null;
  creditData: CreditData | null;
  isQualified: boolean | null; 
}
