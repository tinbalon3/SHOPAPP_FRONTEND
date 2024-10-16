import { Component, EventEmitter, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
  title?: string;
  message?: string;

  @Output() confirm: EventEmitter<void> = new EventEmitter<void>();
  @Output() decline: EventEmitter<void> = new EventEmitter<void>();

  constructor(public bsModalRef: BsModalRef) { }

  confirmAction() {
    this.confirm.emit();
    this.bsModalRef.hide();
  }

  declineAction() {
    this.decline.emit();
    this.bsModalRef.hide();
  }
}
