import { Category } from "./enums";

export interface Environment {
  production: boolean;
  apiUrl: string;
  categories: Category[];
  publishable_key: string;
}