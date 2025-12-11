import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <div style="padding: 20px; text-align: center; max-width: 320px;">
      <h3 style="margin: 0 0 10px;">{{ data.title }}</h3>
      <p style="margin: 0 0 20px; color: #555;">{{ data.message }}</p>

      <div style="display: flex; justify-content: center; gap: 12px;">

          <!-- OK Only Button -->
        <button
          *ngIf="data.okOnly"
          mat-raised-button
          color="primary"
          (click)="close(true)">
          OK
        </button>
        
        <button *ngIf="!data.okOnly" mat-stroked-button color="primary" (click)="close(false)">
          Cancel
        </button>
        <button *ngIf="!data.okOnly" mat-raised-button color="warn" (click)="close(true)">
          Delete
        </button>
      </div>
    </div>
  `
})
export class ConfirmationDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string ; okOnly?: boolean}
  ) { }

  close(result: boolean) {
    this.dialogRef.close(result);
  }
}
