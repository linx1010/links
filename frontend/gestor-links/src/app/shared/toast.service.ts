import { Injectable } from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar'

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private snackBar: MatSnackBar) {}
  show(message: string, type: 'sucess'|'error'='sucess',duration:number=3000){
    this.snackBar.open(message,'Fechar',{
      duration,
      horizontalPosition:'right',
      verticalPosition:'bottom',
      panelClass: type ==='sucess'?'toast-success':'toast-error'
    });
  }
}
