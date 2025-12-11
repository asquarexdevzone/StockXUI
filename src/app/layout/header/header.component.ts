import { Component,EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  constructor(public auth: AuthService) {}  // << Make it public so HTML can access
  @Output() mobileToggle = new EventEmitter<void>();
}
