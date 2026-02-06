import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';
import { ComingSoonComponent } from './components/coming-soon/coming-soon.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { LoaderComponent } from './components/loader/loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, LoaderComponent, ComingSoonComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'BMC AUTOS 47 - Vente de véhicules d\'occasion et neufs';
  comingSoon = environment.comingSoon;

  ngOnInit(): void {
    // Prevent scrolling while loader is active
    document.body.style.overflow = 'hidden';
    
    // Force dark theme for BMC AUTOS 47
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  }
}
