import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  private authService = inject(AuthService);

  menuItems: MenuItem[] = [
    { label: 'Dashboard',  icon: 'pi pi-home',          route: '/dashboard' },
    { label: 'Vendas',     icon: 'pi pi-shopping-cart', route: '/vendas' },
    { label: 'Locações',   icon: 'pi pi-box',           route: '/locacoes' },
    { label: 'Estoque',    icon: 'pi pi-warehouse',     route: '/estoque' },
    { label: 'Clientes',   icon: 'pi pi-users',         route: '/clientes' },
    { label: 'Financeiro', icon: 'pi pi-wallet',        route: '/financeiro' },
  ];

  logout(): void {
    this.authService.logout();
  }
}