import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../auth.service';
import { OverlayContainer } from '@angular/cdk/overlay';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    FormsModule,
    MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule
  ]
})
export class LoginComponent {

  username = '';
  password = '';

  private overlay = inject(OverlayContainer);

  constructor(private auth: AuthService, private router: Router) { }

  onLogin() {
    this.auth.login({ username: this.username, password: this.password })
      .subscribe({
        next: () => {
          // 🔥 FIX: Remove leftover overlays (grey background)
          this.overlay.getContainerElement().classList.remove('cdk-global-overlay-wrapper');

          // Route now works correctly
          this.router.navigate(['/dashboard']);
        },
        error: () => alert('Invalid username or password')
      });
  }
}
