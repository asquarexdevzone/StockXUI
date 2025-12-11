import {
  Component, ViewChild, inject, signal, computed,
  OnInit, AfterViewInit
} from '@angular/core';

import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MarketerService } from './marketer.service';
import { Marketer } from '../model/marketer.model';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ConfirmationDialogComponent } from '../../confirmation-box/confirmation-dialog.component';

@Component({
  standalone: true,
  selector: 'app-marketer',
  templateUrl: './marketer.component.html',
  styleUrls: ['./marketer.component.scss'],
  imports: [
    CommonModule, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSidenavModule, MatTooltipModule,
    MatDialogModule, MatSnackBarModule
  ]
})
export class MarketerComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('drawer') drawer!: MatDrawer;

  displayedColumns = ['name', 'number', 'actions'];
  ds = new MatTableDataSource<Marketer>([]);

  loading = signal(false);
  search = signal('');
  editingId = signal<number | null>(null);
  isEdit = computed(() => this.editingId() !== null);

  form!: FormGroup;

  private fb = inject(FormBuilder);
  private api = inject(MarketerService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  constructor() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      number: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]]
    });
  }

  ngOnInit() {
    this.load();
  }

  ngAfterViewInit() {
    this.ds.paginator = this.paginator;
    this.ds.sort = this.sort;
  }

  load() {
    this.loading.set(true);

    this.api.list().subscribe({
      next: res => {
        this.ds.data = res;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('❌ Failed to load marketers', 'Close', { duration: 3000 });
      }
    });
  }

  applyFilter(value: string) {
    this.ds.filter = value.trim().toLowerCase();
  }

  openAdd() {
    this.editingId.set(null);
    this.form.reset({ name: '', number: '' });
    this.drawer.open();
  }

  openEdit(row: Marketer) {
    this.editingId.set(row.id);
    this.form.patchValue(row);
    this.drawer.open();
  }

  save() {
    if (this.form.invalid) return;

    const id = this.editingId();
    const request = id === null
      ? this.api.create(this.form.value)
      : this.api.update(id, this.form.value);

    const msg = id === null ? '✔ Marketer added' : '✔ Marketer updated';

    request.subscribe({
      next: () => {
        this.drawer.close();
        this.load();
        this.snack.open(msg, 'Close', { duration: 3000 });
      },
      error: () => {
        this.snack.open('❌ Operation failed', 'Close', { duration: 3000 });
      }
    });
  }

  remove(row: Marketer) {
    const ref = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      data: { title: 'Delete Marketer', message: `Delete "${row.name}"?` }
    });

    ref.afterClosed().subscribe(res => {
      if (res) {
        this.api.delete(row.id).subscribe({
          next: () => {
            this.load();
            this.snack.open('🗑️ Marketer deleted', 'Close', { duration: 3000 });
          },
          error: () => {
            this.snack.open('❌ Delete failed', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
}
