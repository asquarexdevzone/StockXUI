import {
  Component, ViewChild, inject, signal, computed,
  OnInit, AfterViewInit
} from '@angular/core';

import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { TransportService } from './transport.service';
import { Transport } from '../model/transport.model';

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
  selector: 'app-transport-list',
  templateUrl: './transport-list.component.html',
  styleUrls: ['./transport-list.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSidenavModule, MatTooltipModule,
    MatDialogModule, MatSnackBarModule
  ]
})
export class TransportListComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('drawer') drawer!: MatDrawer;

  displayedColumns = ['name', 'actions'];
  ds = new MatTableDataSource<Transport>([]);

  loading = signal(false);
  search = signal('');

  editingId = signal<number | null>(null);
  isEdit = computed(() => this.editingId() !== null);

  form!: FormGroup;

  private fb = inject(FormBuilder);
  private api = inject(TransportService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  constructor() {
    this.form = this.fb.group({
      transportName: ['', Validators.required]
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
        this.snack.open('❌ Failed to load transports', 'Close', { duration: 3000 });
      }
    });
  }

  applyFilter(value: string) {
    this.search.set(value);
    this.load();
  }

  openAdd() {
    this.editingId.set(null);
    this.form.reset({
      transportName: '',
      isActive: true
    });
    this.drawer.open();
  }


  openEdit(row: Transport) {
    this.editingId.set(row.id);
    this.form.patchValue({
      transportName: row.transportName,
      isActive: row.isActive
    });
    this.drawer.open();
  }


  save() {
    if (this.form.invalid) return;

    const id = this.editingId();
    let obs;

    if (id === null) {
      obs = this.api.create(this.form.value);
    } else {
      obs = this.api.update(id, this.form.value);
    }

    obs.subscribe({
      next: () => {
        this.drawer.close();
        this.load();
        this.snack.open(
          id === null ? '✔ Transport added' : '✔ Transport updated',
          'Close',
          { duration: 3000, panelClass: ['snack-success'] }
        );
      },
      error: () => {
        this.snack.open('❌ Save failed', 'Close', {
          duration: 3000,
          panelClass: ['snack-error']
        });
      }
    });
  }


  remove(row: Transport) {
    const ref = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      data: {
        title: 'Delete Transport',
        message: `Are you sure you want to delete "${row.transportName}"?`
      }
    });

    ref.afterClosed().subscribe(result => {
      if (result) {
        this.api.delete(row.id).subscribe({
          next: () => {
            this.load();
            this.snack.open('🗑️ Transport deleted',
              'Close', { duration: 3000, panelClass: ['snack-success'] });
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
