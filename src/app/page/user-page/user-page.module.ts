import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfilePageComponent } from './user-profile-page/user-profile-page.component';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from 'primeng/api';
import { UserPageRoutingModule } from './user-page-routing.module';
import { UserPageComponent } from './user-page.component';


const declarations: any[] = [
  UserPageComponent,
  UserProfilePageComponent
];
const imports = [
  CommonModule,
  SharedModule,
  HttpClientModule,
  UserPageRoutingModule

];

@NgModule({
  declarations: [...declarations,],
  imports: [...imports],
  exports: [...declarations, ...imports],
})
export class UserPageModule { }
