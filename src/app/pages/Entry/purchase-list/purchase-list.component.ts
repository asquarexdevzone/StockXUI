import {
  Component, OnInit, AfterViewInit, ViewChild, inject
} from '@angular/core';

import {
  FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule
} from '@angular/forms';

import { CommonModule } from '@angular/common';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDrawer } from '@angular/material/sidenav';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';

import { PurchaseService, PurchaseDto, PurchaseItemDto } from './purchase.service';
import { PartyService } from '../../master/party/party.service';
import { ItemService } from '../../master/item/item.service';
import { SizeService } from '../../master/size/size.service';
import { GradeService } from '../../master/grade/grade.service';
import { ConfirmationDialogComponent } from '../../confirmation-box/confirmation-dialog.component';

@Component({
  standalone: true,
  selector: 'app-purchase',
  templateUrl: './purchase-list.component.html',
  styleUrls: ['./purchase-list.component.scss'],
  imports: [
    CommonModule, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSidenavModule, MatSelectModule,
    MatSnackBarModule, MatDialogModule, MatTooltipModule
  ]
})
export class PurchaseListComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('drawer') drawer!: MatDrawer;

  displayed = ['date', 'voucherNo', 'party', 'itemsCount', 'totalSqmt', 'actions'];
  ds = new MatTableDataSource<any>([]);

  form!: FormGroup;

  parties: any[] = [];
  items: any[] = [];
  sizes: any[] = [];
  grades: any[] = [];

  editingId: number | null = null;

  private fb = inject(FormBuilder);
  private api = inject(PurchaseService);
  private partyApi = inject(PartyService);
  private itemApi = inject(ItemService);
  private sizeApi = inject(SizeService);
  private gradeApi = inject(GradeService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  constructor() {
    this.form = this.fb.group({
      date: ['', Validators.required],
      voucherNo: ['', Validators.required],
      partyId: ['', Validators.required],
      remark: [''],
      transportNo: [''],
      details: this.fb.array([])   // 🚀 FormArray for item cards
    });
  }

  // ======================================
  // GET FORMARRAY
  // ======================================
  get details(): FormArray {
    return this.form.get('details') as FormArray;
  }

  // ======================================
  // CREATE ITEM FORM GROUP
  // ======================================
  createItem(): FormGroup {
    return this.fb.group({
      itemId: ['', Validators.required],
      sizeId: ['', Validators.required],
      gradeId: ['', Validators.required],
      boxQty: ['', Validators.required],
      breakageBox: [0],
      sqmt: [{ value: 0, disabled: true }]
    });
  }

  ngOnInit() {
    this.loadMasters();
    this.load();
  }

  ngAfterViewInit() {
    this.ds.paginator = this.paginator;
    this.ds.sort = this.sort;
  }

  // ======================================
  // LOAD MASTER DROPDOWNS
  // ======================================
  loadMasters() {
    this.partyApi.list('').subscribe(r => this.parties = r);
    this.itemApi.list('').subscribe(r => this.items = r);
    this.sizeApi.list('').subscribe(r => this.sizes = r);
    this.gradeApi.list('').subscribe(r => this.grades = r);
  }

  // ======================================
  // LOAD PURCHASE LIST
  // ======================================
  load() {
    this.api.list().subscribe(res => {
      const mapped = res.map((x: any) => ({
        ...x,
        itemsCount: x.items?.length || 0,
        totalSqmt: x.items?.reduce((a: number, b: any) => a + Number(b.sqmt || 0), 0)
      }));

      this.ds.data = mapped;
    });
  }

  // ======================================
  // ADD ITEM (like Order UI)
  // ======================================
  addItem() {
    this.details.push(this.createItem());
  }

  // ======================================
  // REMOVE ITEM
  // ======================================
  removeItem(i: number) {
    this.details.removeAt(i);
  }

  // ======================================
  // SQMT CALCULATION
  // ======================================
  calculateSqmt(i: number) {
    const row = this.details.at(i) as FormGroup;
    const size = this.sizes.find(x => x.id == row.value.sizeId);
    const box = Number(row.value.boxQty);

    if (!size || !box) {
      row.patchValue({ sqmt: 0 }, { emitEvent: false });
      return;
    }

    const sqm = Number(size.sqmt || size.sqMtr || size.sqm || 0);
    const total = sqm * box;

    row.patchValue({ sqmt: total.toFixed(2) }, { emitEvent: false });
  }

  // ======================================
  // OPEN ADD PURCHASE
  // ======================================
  openAdd() {
    this.editingId = null;
    this.form.reset();
    this.details.clear();

    this.form.patchValue({
      date: new Date().toISOString().substring(0, 10)
    });

    this.api.getNextVoucherNo().subscribe(no => {
      this.form.patchValue({ voucherNo: no });
    });

    this.addItem(); // Start with one item card
    this.drawer.open();
  }

  // ======================================
  // OPEN EDIT PURCHASE
  // ======================================
  openEdit(m: any) {
    this.editingId = m.id;
    this.form.patchValue({
      date: m.date,
      voucherNo: m.voucherNo,
      partyId: m.partyId,
      remark: m.remark,
      transportNo: m.transportNo
    });

    this.details.clear();

    m.items.forEach((it: any) => {
      const fg = this.createItem();
      fg.patchValue({
        itemId: it.itemId,
        sizeId: it.sizeId,
        gradeId: it.gradeId,
        boxQty: it.boxQty,
        breakageBox: it.breakageBox,
        sqmt: it.sqmt
      });
      this.details.push(fg);
    });

    this.drawer.open();
  }

  // ======================================
  // SAVE PURCHASE
  // ======================================
  save() {
    if (this.form.invalid) {
      this.snack.open("Please fill required fields", "Close", { duration: 2000 });
      return;
    }

    if (this.details.length === 0) {
      this.snack.open("Add at least one item", "Close", { duration: 2000 });
      return;
    }

    // Convert FormArray → DTO
    const items: PurchaseItemDto[] = this.details.getRawValue();

    const payload: PurchaseDto = {
      date: this.form.value.date,
      voucherNo: Number(this.form.value.voucherNo),
      partyId: Number(this.form.value.partyId),
      remark: this.form.value.remark,
      transportNo: this.form.value.transportNo,
      items
    };

    const req = this.editingId
      ? this.api.update(this.editingId, payload)
      : this.api.create(payload);

    req.subscribe(() => {
      this.drawer.close();
      this.load();
      this.snack.open(
        this.editingId ? "Purchase Updated" : "Purchase Added",
        "Close",
        { duration: 2000 }
      );
    });
  }

  // ======================================
  // DELETE PURCHASE
  // ======================================
  remove(m: any) {
    const d = this.dialog.open(ConfirmationDialogComponent, {
      width: "360px",
      data: {
        title: "Delete Purchase",
        message: "Are you sure?"
      }
    });

    d.afterClosed().subscribe(result => {
      if (result) {
        this.api.delete(m.id).subscribe(() => {
          this.load();
          this.snack.open("Deleted Successfully", "Close", { duration: 2000 });
        });
      }
    });
  }

  applyFilter(v: string) {
    this.ds.filter = v.trim().toLowerCase();
  }
}
