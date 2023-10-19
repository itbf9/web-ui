import { Component } from '@angular/core';
import { AutoTitleService } from 'src/app/core/_services/shared/autotitle.service';

@Component({
  selector: 'app-chunks',
  templateUrl: './chunks.component.html'
})
export class ChunksComponent {
  constructor(private titleService: AutoTitleService) {
    this.titleService.set(['Show Chunks'])
  }
}
