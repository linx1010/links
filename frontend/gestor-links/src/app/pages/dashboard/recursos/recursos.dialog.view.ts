import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-recursos-dialog',
  templateUrl: './recursos.dialog.view.html',
  styleUrls: ['./recursos.dialog.view.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class RecursosDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
