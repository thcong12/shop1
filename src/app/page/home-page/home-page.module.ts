import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { HomePageIntroComponent } from './home-page-intro/home-page-intro.component';
import { HomePageListComponent } from './home-page-list/home-page-list.component';
import { HomePageProductComponent } from './home-page-product/home-page-product.component';
import { HomePageRoutingModule } from './home-page-routing.module';
import { HomePageSlideComponent } from './home-page-slide/home-page-slide.component';
import { HomePageComponent } from './home-page.component';

const declarations: any[] = [
  HomePageSlideComponent,
  HomePageComponent,
  HomePageIntroComponent,
  HomePageProductComponent,
  HomePageListComponent,
];
const imports = [
  CommonModule,
  SharedModule,
  HttpClientModule,
  HomePageRoutingModule,

];

@NgModule({
  declarations: [...declarations, ],
  imports: [...imports],
  exports: [...declarations, ...imports],
})
export class HomePageModule {}
