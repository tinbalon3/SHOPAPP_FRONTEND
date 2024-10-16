import { Component, EventEmitter, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-category-dialog',
  templateUrl: './category-dialog.component.html',
  styleUrl: './category-dialog.component.scss'
})
export class CategoryDialogComponent {
  title?: string;
  
  nameInputCategory = ""
  @Output() confirm: EventEmitter<String> = new EventEmitter<String>();
  @Output() decline: EventEmitter<void> = new EventEmitter<void>();

  constructor(public bsModalRef: BsModalRef) { }

  confirmAction() {
    this.confirm.emit(this.nameInputCategory);
    this.bsModalRef.hide();
  }

  declineAction() {
    this.decline.emit();
    this.bsModalRef.hide();
  }
}
