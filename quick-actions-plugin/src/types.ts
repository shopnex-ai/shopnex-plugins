import { Action } from "kbar";

export interface QuickAction extends Action {
    link?: string;
}
