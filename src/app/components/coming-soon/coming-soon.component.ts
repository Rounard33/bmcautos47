import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="coming-soon">
      <div class="content">
        <div class="logo-container">
          <img src="assets/logo/logo.png" alt="BMC AUTOS 47 Logo" class="logo">
        </div>
        <h1>Notre site <span class="highlight">arrive bientôt</span></h1>
        <p>Nous travaillons actuellement sur notre nouveau site web.</p>
        <p class="contact">Contactez-nous : <strong>05.53.01.66.97</strong></p>
      </div>
    </div>
  `,
  styles: [`
    .coming-soon {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-primary);
      padding: var(--spacing-4xl) var(--spacing-lg);
    }

    .content {
      text-align: center;
      max-width: 600px;
    }

    .logo-container {
      margin-bottom: var(--spacing-3xl);
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .logo {
      width: 200px;
      height: auto;
      max-width: 100%;
      transition: transform var(--transition-normal);
    }

    .logo:hover {
      transform: scale(1.05);
    }

    h1 {
      font-family: var(--font-display);
      font-size: clamp(2.5rem, 5vw, 4rem);
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: var(--spacing-xl);
      line-height: 1.2;
    }

    .highlight {
      color: var(--accent-500);
    }

    p {
      font-size: 1.125rem;
      color: var(--text-secondary);
      margin-bottom: var(--spacing-md);
      line-height: 1.8;
    }

    .contact {
      margin-top: var(--spacing-2xl);
      font-size: 1rem;
      color: var(--text-muted);
    }

    .contact strong {
      color: var(--accent-500);
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .logo {
        width: 150px;
      }

      .logo-container {
        margin-bottom: var(--spacing-2xl);
      }
    }
  `]
})
export class ComingSoonComponent {}

