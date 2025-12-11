import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { NgFor, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [NgFor, NgIf, MatIconModule]
})
export class SidebarComponent {

  constructor(public auth: AuthService, public router: Router) { }

  isCollapsed = signal(false);
  isMobileOpen = false;


  toggleSidebar() {
    if (window.innerWidth < 768) {
      this.isMobileOpen = !this.isMobileOpen;  // mobile behavior
    } else {
      this.isCollapsed.update(v => !v);        // desktop behavior
    }
  }
  closeMobileSidebar() {
    this.isMobileOpen = false;
  }
  navigate(path: string) {
    this.router.navigate([path]);
    if (window.innerWidth < 768) {
      this.isMobileOpen = false;
    }
  }


  menuItems = [
    { label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    {
      label: 'Master',
      icon: 'category',
      children: [
        { label: 'Item Master', path: '/master/items' },
        { label: 'Size Master', path: '/master/size' },
        { label: 'Marketer Master', path: '/master/marketer' },
         { label: 'Party Master', path: '/master/party' },
        // { label: 'Grade Master', path: '/master/grade' },
        // { label: 'Transport Master', path: '/master/transport' }
      ]
    },
    {
      label: 'Entry',
      icon: 'inventory_2',
      children: [
        { label: 'Opening Stock', path: '/entry/opening-stock' },
        { label: 'Purchase', path: '/entry/purchase' },
        { label: 'Order', path: '/entry/order' },
        { label: 'Dispatch', path: '/entry/dispatch' }
      ]
    },
    {
      label: 'Stock',
      icon: 'warehouse',   // you can use any Material icon
      children: [
        { label: 'Finish Stock', path: '/stock/finish-stock' },
        { label: 'After Order Stock', path: '/stock/after-order-stock' }
      ]
    }
  ];

  get filteredMenu() {
    return this.menuItems;
  }

  isActive(path?: string) {
    return path ? this.router.url.startsWith(path) : false;
  }

  isActiveGroup(children: any[]) {
    return children.some(c => this.isActive(c.path));
  }


  logout() {
    this.auth.logout();
  }

  expandedGroup = signal<string | null>(null);

  toggleGroup(label: string) {
    this.expandedGroup.set(this.expandedGroup() === label ? null : label);
  }
}
