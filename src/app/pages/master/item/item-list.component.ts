import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  signal,
  computed,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup
} from '@angular/forms';
import { ItemService, Item } from './item.service';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// ✅ Import your custom dialog
import { ConfirmationDialogComponent } from '../../confirmation-box/confirmation-dialog.component';

@Component({
  standalone: true,
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule
  ]
})
export class ItemListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('drawer') drawer!: MatDrawer;
  @ViewChild('fileInput') fileInput!: any;

  displayedColumns = ['image', 'name', 'isActive', 'actions'];
  ds = new MatTableDataSource<Item>([]);
  loading = signal(false);
  search = signal('');

  editingId = signal<number | null>(null);
  isEdit = computed(() => this.editingId() !== null);

  form!: FormGroup;

  previewUrl: string | null = null;
  selectedFile: File | null = null;
  private fb = inject(FormBuilder);
  private api = inject(ItemService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      isActive: [true],
      image: [null]   // ← NEW FIELD
    });

  }

  ngOnInit(): void {
    this.load();
  }

  ngAfterViewInit(): void {
    if (this.paginator) this.ds.paginator = this.paginator;
    if (this.sort) this.ds.sort = this.sort;
  }

  // ✅ Load Items
  load() {
    this.loading.set(true);
    this.api.list(this.search()).subscribe({
      next: (data) => {
        this.ds.data = data;
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load items', err);
        this.loading.set(false);
        this.showSnack('❌ Failed to load items', 'error');
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
      name: '',
      isActive: true
    });

    // Reset image values
    this.selectedFile = null;
    this.previewUrl = null;

    // 🔥 Clear actual <input type="file">
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }

    setTimeout(() => this.drawer.open(), 0);
  }

  openEdit(row: Item) {
    this.editingId.set(row.id);
    this.form.patchValue({ name: row.name, isActive: row.isActive });
    setTimeout(() => this.drawer?.open(), 0);
  }

  save() {
    if (this.form.invalid) return;

    const id = this.editingId();

    const formData = new FormData();
    formData.append("name", this.form.value.name);
    formData.append("isActive", this.form.value.isActive);
    if (this.selectedFile) {
      formData.append("image", this.selectedFile);
    }

    const request = id
      ? this.api.update(id, formData)
      : this.api.create(formData);

    request.subscribe({
      next: () => {
        this.drawer.close();
        this.load();
        this.showSnack(id ? "Updated" : "Added", "success");
      },
      error: () => this.showSnack("Failed", "error")
    });
  }

  // ✅ Delete with Custom Dialog
  remove(row: Item) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete "${row.name}"?`
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.api.delete(row.id).subscribe({
          next: () => {
            this.load();
            this.showSnack('🗑️ Item deleted successfully', 'success');
          },
          error: (err) => {
            console.error('Delete failed', err);
            this.showSnack('❌ Delete failed', 'error');
          }
        });
      }
    });
  }

  // ✅ Snackbar Helper
  private showSnack(message: string, type: 'success' | 'error') {
    this.snack.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: type === 'success' ? ['snack-success'] : ['snack-error']
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => this.previewUrl = reader.result as string;
    reader.readAsDataURL(file);
  }
}
