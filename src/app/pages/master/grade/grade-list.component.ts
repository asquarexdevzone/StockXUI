import {
  Component, ViewChild, inject, signal, computed,
  OnInit, AfterViewInit
} from '@angular/core';

import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
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
import { GradeService } from '../grade/grade.service'
import { Grade } from '../model/grade.model';

@Component({
  standalone: true,
  selector: 'app-grade-list',
  templateUrl: './grade-list.component.html',
  styleUrls: ['./grade-list.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSidenavModule, MatTooltipModule,
    MatDialogModule, MatSnackBarModule
  ]
})
export class GradeListComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('drawer') drawer!: MatDrawer;

  displayedColumns = ['name', 'actions'];
  ds = new MatTableDataSource<Grade>([]);

  loading = signal(false);
  search = signal('');

  editingId = signal<number | null>(null);
  isEdit = computed(() => this.editingId() !== null);

  form!: FormGroup;

  private fb = inject(FormBuilder);
  private api = inject(GradeService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  constructor() {
    this.form = this.fb.group({
      name: ['', Validators.required]
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
        this.snack.open('❌ Failed to load grades', 'Close', { duration: 3000 });
      }
    });
  }

  applyFilter(value: string) {
    this.search.set(value);
    this.load();
  }

  openAdd() {
    this.editingId.set(null);
    this.form.reset({ name: '' });
    this.drawer.open();
  }

  openEdit(row: Grade) {
    this.editingId.set(row.id);
    this.form.patchValue({ name: row.name });
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
        this.snack.open(id === null ? '✔ Grade added' : '✔ Grade updated',
          'Close', { duration: 3000, panelClass: ['snack-success'] });
      },
      error: () => {
        this.snack.open('❌ Save failed', 'Close', { duration: 3000, panelClass: ['snack-error'] });
      }
    });
  }

  remove(row: Grade) {
    const ref = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      data: {
        title: 'Delete Grade',
        message: `Are you sure you want to delete "${row.name}"?`
      }
    });

    ref.afterClosed().subscribe(result => {
      if (result) {
        this.api.delete(row.id).subscribe({
          next: () => {
            this.load();
            this.snack.open('🗑️ Grade deleted', 'Close',
              { duration: 3000, panelClass: ['snack-success'] });
          },
          error: () => {
            this.snack.open('❌ Delete failed', 'Close',
              { duration: 3000, panelClass: ['snack-error'] });
          }
        });
      }
    });
  }
}
