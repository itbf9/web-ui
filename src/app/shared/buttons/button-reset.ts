import { Component, Input } from '@angular/core';

@Component({
  selector: 'button-reset',
  template: `
<button class="btn btn-outline-gray-600" type="button">{{ label }}</button>
  `
})
export class ButtonResetComponent {
  @Input() label: string;
}
