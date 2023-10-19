import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
})
export class TableComponent {
  tableClass = 'card-body table-responsive';

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: Event): void {
    /*
    Example:

    if (window.innerWidth < 768) {
      this.tableClass = 'small-screen-class';
    } else {
      this.tableClass = 'large-screen-class';
    }
    
    */
  }
}
