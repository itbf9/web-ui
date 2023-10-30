import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PageSubTitleComponent } from './page-subtitle.component';
import { PageTitleComponent } from './page-title.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    FontAwesomeModule,
    MatButtonModule,
    MatIconModule,
  ],
  exports: [
    PageTitleComponent,
    PageSubTitleComponent
  ],
  declarations: [
    PageTitleComponent,
    PageSubTitleComponent
  ]
})
export class PageTitleModule { }
