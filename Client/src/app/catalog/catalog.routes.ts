import { Routes } from "@angular/router";
import { CatalogComponent } from "./catalog.component";
import { DetailsComponent } from "../vehicle/details/details.component";

export const CATALOG_ROUTES: Routes = [
  { path: "", component: CatalogComponent },
  { path: ":slug" , component: DetailsComponent},
];