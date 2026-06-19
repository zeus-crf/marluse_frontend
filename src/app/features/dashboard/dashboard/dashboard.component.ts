import { Component, inject, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ToastModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private messageService = inject(MessageService);

  ngOnInit(): void {
    const state = history.state?.toast;
    if (state) {
      // Pequeno delay para garantir que o componente está renderizado
      setTimeout(() => this.messageService.add({ ...state, life: 3000 }), 100);
    }
  }
}
