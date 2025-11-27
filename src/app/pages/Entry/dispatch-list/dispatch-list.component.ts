// /src/app/pages/Entry/dispatch/dispatch-list.component.ts
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
import { DispatchService } from '../dispatch-list/dispatch.service';
import { PartyService } from '../../master/party/party.service';
import { ItemService } from '../../master/item/item.service';
import { SizeService } from '../../master/size/size.service';
import { GradeService } from '../../master/grade/grade.service';
import { ConfirmationDialogComponent } from '../../confirmation-box/confirmation-dialog.component';

@Component({
  standalone: true,
  selector: 'app-dispatch',
  templateUrl: './dispatch-list.component.html',
  styleUrls: ['./dispatch-list.component.scss'],
  imports: [
    CommonModule, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSidenavModule, MatSelectModule,
    MatSnackBarModule, MatDialogModule, MatDividerModule
  ]
})
export class DispatchListComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('drawer') drawer!: MatDrawer;

  displayed = ['date', 'voucherNo', 'party', 'itemsCount', 'totalSqmt', 'export', 'actions'];
  ds = new MatTableDataSource<any>([]);

  parties: any[] = [];
  items: any[] = [];
  sizes: any[] = [];
  grades: any[] = [];

  form!: FormGroup;
  editingId: number | null = null;

  private fb = inject(FormBuilder);
  private api = inject(DispatchService);
  private partyApi = inject(PartyService);
  private itemApi = inject(ItemService);
  private sizeApi = inject(SizeService);
  private gradeApi = inject(GradeService);
  private snack = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  constructor() {
    this.form = this.fb.group({
      date: ['', Validators.required],
      voucherNo: ['', Validators.required],
      partyId: ['', Validators.required],
      remark: [''],
      transportNo: [''],
      details: this.fb.array([]) // Array for multiple items
    });
  }

  // Getter for details form array
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
      // Transform the data to show summary in list
      const transformedData = res.map(dispatch => ({
        ...dispatch,
        itemsCount: dispatch.details?.length || 0,
        totalSqmt: dispatch.details?.reduce((sum: number, detail: any) => sum + (detail.sqmt || 0), 0) || 0
      }));
      this.ds.data = transformedData;
    });
  }

  loadMasters() {
    this.partyApi.list('').subscribe(r => this.parties = r);
    this.itemApi.list('').subscribe(r => this.items = r);
    this.sizeApi.list('').subscribe(r => this.sizes = r);
    this.gradeApi.list('').subscribe(r => this.grades = r);
  }

  // Create a new detail form group
  createDetailFormGroup(): FormGroup {
    return this.fb.group({
      itemId: ['', Validators.required],
      sizeId: ['', Validators.required],
      gradeId: ['', Validators.required],
      boxQty: ['', [Validators.required, Validators.min(1)]],
      sqmt: [{ value: '', disabled: true }]
    });
  }

  // Add new item row
  addItem() {
    this.details.push(this.createDetailFormGroup());
  }

  // Remove item row
  removeItem(index: number) {
    this.details.removeAt(index);
  }

  // Calculate SqMt for a specific detail
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

    // Clear existing details
    while (this.details.length !== 0) {
      this.details.removeAt(0);
    }

    // Add one empty detail row
    this.addItem();

    this.form.patchValue({
      date: new Date().toISOString().substring(0, 10),
      partyId: '',
      remark: '',
      transportNo: ''
    });

    this.api.getNextVoucherNo().subscribe(no => {
      this.form.patchValue({ voucherNo: no });
    });

    this.drawer.open();
  }

  openEdit(dispatch: any) {
    this.editingId = dispatch.id;

    // Clear existing details
    while (this.details.length !== 0) {
      this.details.removeAt(0);
    }

    // Populate form with dispatch data
    this.form.patchValue({
      date: dispatch.date,
      voucherNo: dispatch.voucherNo,
      partyId: this.getPartyIdByName(dispatch.partyName),
      remark: dispatch.remark || '',
      transportNo: dispatch.transportNo || ''
    });

    // Add details
    if (dispatch.details && dispatch.details.length > 0) {
      dispatch.details.forEach((detail: any) => {
        const detailGroup = this.createDetailFormGroup();
        detailGroup.patchValue({
          itemId: detail.itemId,
          sizeId: detail.sizeId,
          gradeId: detail.gradeId,
          boxQty: detail.boxQty,
          // REMOVED: breakageBox: detail.breakageBox || 0,
          sqmt: detail.sqmt
        });
        this.details.push(detailGroup);
      });
    } else {
      // Add one empty row if no details
      this.addItem();
    }

    this.drawer.open();
  }

  // Helper method to get party ID by name
  getPartyIdByName(partyName: string): number {
    const party = this.parties.find(p => p.name === partyName);
    return party ? party.id : 0;
  }

  save() {
    if (this.form.invalid || this.details.length === 0) {
      this.snack.open('Please fill all required fields and add at least one item', 'Close', { duration: 3000 });
      return;
    }

    // Enable sqmt field to get values
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
      transportNo: this.form.value.transportNo,
      details: this.details.value.map((detail: any) => ({
        itemId: Number(detail.itemId),
        sizeId: Number(detail.sizeId),
        gradeId: Number(detail.gradeId),
        boxQty: Number(detail.boxQty),
        // REMOVED: breakageBox: detail.breakageBox ? Number(detail.breakageBox) : 0,
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
        this.snack.open('Error saving dispatch', 'Close', { duration: 3000 });
        console.error('Save error:', error);
      }
    });
  }

  remove(dispatch: any) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      data: {
        title: 'Delete Dispatch',
        message: 'Are you sure you want to delete this dispatch entry?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.api.delete(dispatch.id).subscribe(() => {
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
      a.download = `dispatch_${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      this.snack.open("📄 PDF Exported", "Close", { duration: 2000 });
    });
  }
}