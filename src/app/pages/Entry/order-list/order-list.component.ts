// /src/app/pages/Entry/order/order-list.component.ts
import {
  Component, ViewChild, inject, OnInit, AfterViewInit
} from '@angular/core';

import { FormBuilder, Validators, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
import { MatDividerModule } from '@angular/material/divider';

import { OrderService } from '../order-list/order.service';
import { PartyService } from '../../master/party/party.service';
import { ItemService } from '../../master/item/item.service';
import { SizeService } from '../../master/size/size.service';
import { GradeService } from '../../master/grade/grade.service';
import { ConfirmationDialogComponent } from '../../confirmation-box/confirmation-dialog.component';

@Component({
  standalone: true,
  selector: 'app-order',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss'],
  imports: [
    CommonModule, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSidenavModule, MatSelectModule,
    MatSnackBarModule, MatDialogModule, MatDividerModule
  ]
})
export class OrderListComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('drawer') drawer!: MatDrawer;

  displayed = ['date', 'voucherNo', 'party', 'itemsCount', 'totalSqmt', 'export', 'actions'];
  ds = new MatTableDataSource<any>([]);

  parties: any[] = [];
  items: any[] = [];
  sizes: any[] = [];
  // grades: any[] = [];

  form!: FormGroup;
  editingId: number | null = null;
  search: string = '';


  private fb = inject(FormBuilder);
  private api = inject(OrderService);
  private partyApi = inject(PartyService);
  private itemApi = inject(ItemService);
  private sizeApi = inject(SizeService);
  // private gradeApi = inject(GradeService);
  private snack = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  constructor() {
    this.form = this.fb.group({
      date: ['', Validators.required],
      voucherNo: ['', Validators.required],
      partyId: ['', Validators.required],
      remark: [''],
      billNo: [''],
      details: this.fb.array([])
    });
  }

  get details(): FormArray {
    return this.form.get('details') as FormArray;
  }

  ngOnInit() {
    this.load();
    this.loadMasters();
  }

  ngAfterViewInit() {
    this.ds.paginator = this.paginator;
    this.ds.sort = this.sort;
  }

  load() {
    this.api.list().subscribe(res => {
      const transformedData = res.map(order => ({
        ...order,
        itemsCount: order.details?.length || 0,
        totalSqmt: order.details?.reduce((sum: number, detail: any) => sum + (detail.sqmt || 0), 0) || 0
      }));
      this.ds.data = transformedData;
    });
  }

  loadMasters() {
    this.partyApi.list('').subscribe(r => this.parties = r);
    this.itemApi.list('').subscribe(r => this.items = r);
    this.sizeApi.list('').subscribe(r => this.sizes = r);
    // this.gradeApi.list('').subscribe(r => this.grades = r);
  }

  createDetailFormGroup(): FormGroup {
    return this.fb.group({
      itemId: ['', Validators.required],
      sizeId: ['', Validators.required],
      // gradeId: ['', Validators.required],
      boxQty: ['', [Validators.required, Validators.min(1)]],
      sqmt: [{ value: '', disabled: true }]
    });
  }

  addItem() {
    this.details.push(this.createDetailFormGroup());
  }

  removeItem(index: number) {
    this.details.removeAt(index);
  }

  calculateSqmt(detailIndex: number) {
    const detail = this.details.at(detailIndex);
    const sizeId = detail.get('sizeId')?.value;
    const boxQty = detail.get('boxQty')?.value;

    if (!sizeId || !boxQty) {
      detail.patchValue({ sqmt: '' });
      return;
    }

    const size = this.sizes.find(x => x.id == sizeId);
    if (size) {
      const sizeSqmt = Number(size.sqmt || size.sqMtr || size.sqm || 0);
      const calculatedSqmt = (sizeSqmt * boxQty).toFixed(2);
      detail.patchValue({ sqmt: calculatedSqmt });
    }
  }

  openAdd() {
    this.editingId = null;

    while (this.details.length !== 0) {
      this.details.removeAt(0);
    }

    this.addItem();

    this.form.patchValue({
      date: new Date().toISOString().substring(0, 10),
      partyId: '',
      remark: '',
      billNo: ''
    });

    this.api.getNextVoucherNo().subscribe(no => {
      this.form.patchValue({ voucherNo: no });
    });

    this.drawer.open();
  }

  openEdit(order: any) {
    this.editingId = order.id;

    this.api.getById(order.id).subscribe({
      next: (fullOrder) => {
        while (this.details.length !== 0) {
          this.details.removeAt(0);
        }

        this.form.patchValue({
          date: fullOrder.date,
          voucherNo: fullOrder.voucherNo,
          partyId: this.getPartyIdByName(fullOrder.partyName),
          remark: fullOrder.remark || '',
          billNo: fullOrder.billNo || ''
        });

        if (fullOrder.details && fullOrder.details.length > 0) {
          fullOrder.details.forEach((detail: any) => {
            const detailGroup = this.createDetailFormGroup();
            detailGroup.patchValue({
              itemId: detail.itemId,
              sizeId: detail.sizeId,
              // gradeId: detail.gradeId,
              boxQty: detail.boxQty,
              sqmt: detail.sqmt
            });
            this.details.push(detailGroup);
          });
        } else {
          this.addItem();
        }
        this.drawer.open();
      },
      error: (error) => {
        this.snack.open('Error loading order data', 'Close', { duration: 3000 });
        console.error('Error loading order:', error);
      }
    });
  }

  getPartyIdByName(partyName: string): number {
    const party = this.parties.find(p => p.name === partyName);
    return party ? party.id : 0;
  }

  save() {
    if (this.form.invalid || this.details.length === 0) {
      this.snack.open('Please fill all required fields and add at least one item', 'Close', { duration: 3000 });
      return;
    }

    this.details.controls.forEach(control => {
      const sqmtControl = control.get('sqmt');
      if (sqmtControl) {
        sqmtControl.enable();
      }
    });

    const payload = {
      date: this.form.value.date,
      voucherNo: this.form.value.voucherNo,
      partyId: Number(this.form.value.partyId),
      remark: this.form.value.remark,
      billNo: this.form.value.billNo,
      details: this.details.value.map((detail: any) => ({
        itemId: Number(detail.itemId),
        sizeId: Number(detail.sizeId),
        // gradeId: Number(detail.gradeId),
        boxQty: Number(detail.boxQty),
        sqmt: Number(detail.sqmt) || 0
      }))
    };

    const req = this.editingId ?
      this.api.update(this.editingId, payload) :
      this.api.create(payload);

    req.subscribe({
      next: () => {
        this.drawer.close();
        this.load();
        this.snack.open(this.editingId ? 'Updated' : 'Added', 'Close', { duration: 2000 });
      },
      error: (error) => {
        const msg = error.error?.message || "Error saving order";

        this.dialog.open(ConfirmationDialogComponent, {
          width: '360px',
          data: {
            title: 'Warning',
            message: msg,
            okOnly: true  
          }
        });

        console.error("Save error:", error);
      }

    });
  }

  remove(order: any) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      data: {
        title: 'Delete Order',
        message: 'Are you sure you want to delete this order entry?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.api.delete(order.id).subscribe(() => {
          this.load();
          this.snack.open('🗑 Deleted', 'Close', { duration: 2000 });
        });
      }
    });
  }

  exportPdf(id: number) {
    this.api.exportPdf(id).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `order_${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      this.snack.open("📄 PDF Exported", "Close", { duration: 2000 });
    });
  }
  applyFilter(value: string) {
  this.search = value.trim().toLowerCase();
  this.ds.filter = this.search;

  // Optional: keep paginator at first page after filtering
  if (this.ds.paginator) {
    this.ds.paginator.firstPage();
  }
}

  
}