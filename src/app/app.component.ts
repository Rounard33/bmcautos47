import {Component, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {FooterComponent} from './components/footer/footer.component';
import {HeaderComponent} from './components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'BMC AUTOS 47 - Vente de véhicules d\'occasion et neufs';

  ngOnInit(): void {
    // Mark app as loaded for CSS fallback
    this.markAppAsLoaded();
    
    // Force dark theme for BMC AUTOS 47
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  
  private markAppAsLoaded(): void {
    document.body.classList.add('app-loading');
    
    setTimeout(() => {
      document.body.classList.remove('app-loading');
      document.body.classList.add('app-loaded');
    }, 100);
  }
}
