import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
    template: `
        <div class="card flex justify-center gap-2">
            <p-toast />
            <p-confirmdialog />
            <!-- <p-button (click)="confirm1($event)" label="Save" [outlined]="true" /> -->
            <p-button (click)="confirm2($event)" label="Delete" severity="danger" [outlined]="true" />
        </div>
    `,
    standalone: true,
    imports: [ButtonModule, ConfirmDialogModule, ToastModule],
    providers: [ConfirmationService, MessageService]
})
export class ConfirmdialogBasicDemo {
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);

    confirm2(event: Event) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Tem certeza que deseja apagar essa venda?',
            header: 'Danger Zone',
            icon: 'pi pi-info-circle',
            rejectLabel: 'Cancel',
            rejectButtonProps: {
                label: 'Cancel',
                severity: 'secondary',
                outlined: true
            },
            acceptButtonProps: {    
                label: 'Delete',
                severity: 'danger'
            },
        
            accept: () => {
                this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Venda deletada com sucesso' });
            },
            reject: () => {
                this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'Cancelado' });
            }
        });
    }
}