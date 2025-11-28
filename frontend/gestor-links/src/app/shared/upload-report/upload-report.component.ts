import { Component, Input, Output, EventEmitter, Inject } from '@angular/core';
import {CalendarService} from '../../pages/dashboard/calendar/calendar.service';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {ToastService}from '../../shared/toast.service'

@Component({
  selector: 'app-upload-report',
  standalone:true,
  templateUrl: './upload-report.component.html',
  styleUrls: ['./upload-report.component.scss'],
  imports: [
    MatFormFieldModule, 
    MatProgressBarModule,
    CommonModule,
    FormsModule
  ]
})
export class UploadReportComponent {
  @Input() event: any; // recebe o evento do pai
  @Output() finished = new EventEmitter<void>(); // notifica o pai quando terminar

  selectedFile: File | null = null;
  notes: string = '';
  uploading = false;
  uploadProgress = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data:any,
    private calendarService: CalendarService,
    private toast:ToastService,
  ) {
    this.event=data.event;
  }

  selectFile(event: any) {
    this.selectedFile = event.target.files[0] || null;
  }

  sendFile() {
    if (!this.event || !this.selectedFile) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];

      const payload = {
        action: 'upload_report',
        organization_id: Number(sessionStorage.getItem('organizationId')) || 1,
        schedule_id: this.event.schedule_id,
        user_id: Number(localStorage.getItem('userId')) || 0,
        report_date: this.event.start_time,
        file_name: this.selectedFile!.name,
        mime_type: this.selectedFile!.type,
        file_base64: base64,
        notes: this.notes
      };

      this.uploading = true;
      this.uploadProgress = 10;

      this.calendarService.uploadReport(payload).subscribe({
        next: (res: any) => {
          if (res?.status === true) {
            this.toast.show('Arquivo enviado','sucess')
            this.uploadProgress = 100;
            setTimeout(() => {
              this.uploading = false;
              this.uploadProgress = 0;
              this.finished.emit({ ...this.event, status: 'pending' });
            }, 300);
          } else {
            this.uploading = false;
            this.uploadProgress = 0;
            this.toast.show(`Upload error: ${res?.message || 'Failed'}`,'error');
          }
        },
        error: (err: any) => {
          this.uploading = false;
          this.uploadProgress = 0;
          this.toast.show(err?.error?.message || 'Error uploading report.','error');
        }
      });
    };

    reader.readAsDataURL(this.selectedFile);
  }

  cancel() {
    this.selectedFile = null;
    this.notes = '';
    this.uploading = false;
    this.uploadProgress = 0;
    this.finished.emit();
  }
}
