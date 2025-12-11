import {
  Component, ViewChild, inject, signal, computed,
  OnInit, AfterViewInit
} from '@angular/core';

import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SizeService } from './size.service';
import { Size } from '../model/size.model';

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
  selector: 'app-size-list',
  templateUrl: './size-list.component.html',
  styleUrls: ['./size-list.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSidenavModule, MatTooltipModule,
    MatDialogModule, MatSnackBarModule
  ]
})
export class SizeListComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('drawer') drawer!: MatDrawer;

  // FIXED 👇 (use 'name' column)
  displayedColumns = ['name', 'sqMtr', 'actions'];

  ds = new MatTableDataSource<Size>([]);

  loading = signal(false);
  search = signal('');

  editingId = signal<number | null>(null);
  isEdit = computed(() => this.editingId() !== null);

  form!: FormGroup;

  private fb = inject(FormBuilder);
  private api = inject(SizeService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  constructor() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      sqMtr: [0, Validators.required]   // FIXED
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
    this.api.list(this.search()).subscribe({
      next: data => {
        this.ds.data = data;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('❌ Failed to load sizes', 'Close', { duration: 3000 });
      }
    });
  }

  applyFilter(value: string) {
    this.search.set(value);
    this.load();
  }

  openAdd() {
    this.editingId.set(null);
    this.form.reset({ name: '' });   // FIXED
    this.drawer.open();
  }

  openEdit(row: Size) {
    this.editingId.set(row.id);
    // ✅ Patch both fields (name + sqMtr)
    this.form.patchValue({
      name: row.name,
      sqMtr: row.sqMtr
    });
    this.drawer.open();
  }

  save() {
    if (this.form.invalid) return;

    const id = this.editingId();
    const obs = id === null ? this.api.create(this.form.value) : this.api.update(id, this.form.value);

    obs.subscribe({
      next: () => {
        this.drawer.close();
        this.load();
        this.snack.open(id === null ? '✔ Size added' : '✔ Size updated', 'Close', {
          duration: 3000,
          panelClass: ['snack-success']
        });
      },
      error: () => {
        this.snack.open('❌ Save failed', 'Close', {
          duration: 3000,
          panelClass: ['snack-error']
        });
      }
    });
  }

  remove(row: Size) {
    const ref = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      data: {
        title: 'Delete Size',
        message: `Are you sure you want to delete "${row.name}"?` // FIXED
      }
    });

    ref.afterClosed().subscribe(result => {
      if (result) {
        this.api.delete(row.id).subscribe({
          next: () => {
            this.load();
            this.snack.open('🗑️ Size deleted', 'Close', {
              duration: 3000,
              panelClass: ['snack-success']
            });
          },
          error: () => {
            this.snack.open('❌ Delete failed', 'Close', {
              duration: 3000,
              panelClass: ['snack-error']
            });
          }
        });
      }
    });
  }
}
