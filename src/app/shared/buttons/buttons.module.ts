import { ButtonSubmitComponent } from './button-submit';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { ButtonResetComponent } from './button-reset';

@NgModule({
  imports: [
    FormsModule,
    CommonModule
  ],
  exports: [
    ButtonSubmitComponent,
    ButtonResetComponent
  ],
  declarations: [
    ButtonSubmitComponent,
    ButtonResetComponent
  ]
})
export class ButtonsModule { }
