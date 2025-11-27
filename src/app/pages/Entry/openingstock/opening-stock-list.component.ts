import {
  Component, ViewChild, inject, signal, computed,
  OnInit, AfterViewInit
} from '@angular/core';

import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OpeningStockService } from './opening-stock.service';

import { MatRadioModule } from '@angular/material/radio';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { ConfirmationDialogComponent } from '../../confirmation-box/confirmation-dialog.component';

import { ItemService } from '../../master/item/item.service';
import { SizeService } from '../../master/size/size.service';
import { GradeService } from '../../master/grade/grade.service';

@Component({
  standalone: true,
  selector: 'app-opening-stock-list',
  templateUrl: './opening-stock-list.component.html',
  styleUrls: ['./opening-stock-list.component.scss'],
  imports: [
    CommonModule, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSidenavModule, MatSelectModule,
    MatSnackBarModule, MatDialogModule, MatRadioModule
  ]
})
export class OpeningStockListComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('drawer') drawer!: MatDrawer;

  displayedColumns = ['item', 'size', 'grade', 'boxQty', 'totalSqft', 'actions'];
  ds = new MatTableDataSource<any>([]);
  search = signal('');

  items: any[] = [];
  sizes: any[] = [];
  grades: any[] = [];

  form!: FormGroup;
  editingId = signal<number | null>(null);
  isEdit = computed(() => this.editingId() !== null);

  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);
  private api = inject(OpeningStockService);
  private snack = inject(MatSnackBar);
  private itemApi = inject(ItemService);
  private sizeApi = inject(SizeService);
  private gradeApi = inject(GradeService);

  constructor() {
    this.form = this.fb.group({
      itemId: ['', Validators.required],
      sizeId: ['', Validators.required],
      gradeId: ['', Validators.required],
      boxQty: ['', Validators.required],
      sqft: [{ value: '', disabled: true }]   // FINAL CORRECT CONTROL
    });
  }

  ngOnInit() {
    this.load();
    this.loadMasters();
  }

  ngAfterViewInit() {
    this.ds.paginator = this.paginator;
    this.ds.sort = this.sort;
  }

  loadMasters() {
    this.itemApi.list('').subscribe(res => this.items = res);
    this.sizeApi.list('').subscribe(res => this.sizes = res);
    this.gradeApi.list('').subscribe(res => this.grades = res);
  }

  load() {
    this.api.list().subscribe(res => this.ds.data = res);
  }

  onSizeChange() {
    this.calculateSqft();
  }

  calculateSqft() {
    const size = this.sizes.find(s => s.id === this.form.value.sizeId);
    const box = Number(this.form.value.boxQty);

    if (!size || !box) {
      this.form.patchValue({ sqft: '' });
      return;
    }

    const sizeSqft = Number(size.sqMtr);
    const totalSqFt = sizeSqft * box;

    this.form.patchValue({ sqft: totalSqFt });
  }


  openAdd() {
    this.editingId.set(null);
    this.form.reset({ boxQty: '', sqft: '' });
    this.drawer.open();
  }

  openEdit(row: any) {
    this.editingId.set(row.id);

    this.form.patchValue({
      itemId: row.itemId,
      sizeId: row.sizeId,
      gradeId: row.gradeId,
      boxQty: row.boxQty,
      sqft: row.totalSqft   // API RETURNS totalSqft → map to form.sqft
    });

    this.drawer.open();
  }

  save() {
    if (this.form.invalid) return;

    const id = this.editingId();

    const payload = this.form.getRawValue();  // sqft included

    const req = id
      ? this.api.update(id!, payload)
      : this.api.create(payload);

    req.subscribe(() => {
      this.drawer.close();
      this.load();
      this.snack.open(id ? "Updated" : "Added", "Close", { duration: 2500 });
    });
  }


  remove(row: any) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      data: {
        title: 'Delete Opening Stock',
        message: 'Are you sure you want to delete this entry?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.api.delete(row.id).subscribe(() => {
          this.load();
          this.snack.open("🗑 Deleted", "Close", { duration: 2500 });
        });
      }
    });
  }


  applyFilter(v: string) {
    this.search.set(v);
    this.load();
  }
}
