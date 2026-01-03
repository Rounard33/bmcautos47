import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-section-divider',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="section-divider" [class.with-icon]="showIcon">
      <div class="divider-line"></div>
      @if (showIcon) {
        <div class="divider-icon">
          <img src="assets/logo/logo.png" alt="BMC AUTOS 47">
        </div>
      }
      <div class="divider-line"></div>
    </div>
  `,
  styleUrls: ['./section-divider.component.scss']
})
export class SectionDividerComponent {
  @Input() showIcon: boolean = true;
}

