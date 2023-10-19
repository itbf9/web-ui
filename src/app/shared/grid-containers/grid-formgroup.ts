import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { Component, Input, OnInit } from '@angular/core'

@Component({
  selector: 'grid-form-input',
  template: `
<div class="form-group">
  <div [ngClass]="cssClasses">
    <label class="form-label {{labelclass}}" for={{name}}>{{name}}</label>
    <fa-icon
      placement="bottom"
      ngbTooltip='{{tooltip}}'
      container="body"
      [icon]="faInfoCircle"
      aria-hidden="true"
      class="gray-light-ico display-col"
      *ngIf="tooltip">
    </fa-icon>
    <div #content><ng-content></ng-content></div>
  </div>
</div>
  `
})
export class GridFormInputComponent {

  faInfoCircle = faInfoCircle

  @Input() name?: string
  @Input() labelclass?: string
  @Input() tooltip?: any
  @Input() additionalClasses: string[] = []

  get cssClasses(): string {
    return ['form-outline', 'form-input-custom', ...this.additionalClasses].join(' ');
  }

}


