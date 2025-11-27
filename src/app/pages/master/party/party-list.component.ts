import {
    Component, ViewChild, inject, signal, computed, AfterViewInit, OnInit
} from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PartyService } from './party.service';
import { Party } from '../model/party.model';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ConfirmationDialogComponent } from '../../confirmation-box/confirmation-dialog.component';

@Component({
    standalone: true,
    selector: 'app-party-list',
    templateUrl: './party-list.component.html',
    styleUrls: ['./party-list.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatTableModule, MatPaginatorModule, MatSortModule,
        MatFormFieldModule, MatInputModule, MatButtonModule,
        MatIconModule, MatSidenavModule, MatSlideToggleModule,
        MatTooltipModule, MatDialogModule, MatSnackBarModule,
        MatSelectModule, MatAutocompleteModule
    ]
})
export class PartyListComponent implements OnInit, AfterViewInit {

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild('drawer') drawer!: MatDrawer;

    displayedColumns = ['name', 'city', 'mobileNo', 'state', 'actions'];
    ds = new MatTableDataSource<Party>([]);
    loading = signal(false);
    search = signal('');

    editingId = signal<number | null>(null);
    isEdit = computed(() => this.editingId() !== null);

    form!: FormGroup;

    private fb = inject(FormBuilder);
    private api = inject(PartyService);
    private dialog = inject(MatDialog);
    private snack = inject(MatSnackBar);

    states = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
        "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
        "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
        "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
        "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
        "Uttar Pradesh", "Uttarakhand", "West Bengal",
        "Andaman and Nicobar Islands", "Chandigarh", "Dadra & Nagar Haveli",
        "Daman & Diu", "Delhi", "Jammu & Kashmir", "Ladakh", "Lakshadweep",
        "Puducherry"
    ];

    constructor() {
        this.form = this.fb.group({
            name: ['', Validators.required],
            address: [''],        // no validation
            city: ['', Validators.required],
            mobileNo: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
            state: ['', Validators.required]
        });
    }

    filteredStates: string[] = [...this.states];

    filterStates() {
        const search = this.form.get('state')?.value?.toLowerCase() || '';
        this.filteredStates = this.states.filter(s =>
            s.toLowerCase().includes(search)
        );
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
                this.snack.open('❌ Failed to load parties', 'Close', { duration: 3000 });
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
            address: '',
            city: '',
            mobileNo: '',
            state: '',
            isActive: true
        });
        this.drawer.open();
    }

    openEdit(row: Party) {
        this.editingId.set(row.id);
        this.form.patchValue({
            name: row.name,
            address: row.address,
            city: row.city,
            mobileNo: row.mobileNo,
            state: row.state
        });

        this.drawer.open();
    }

    save() {
        if (this.form.invalid) return;

        const id = this.editingId();
        const obs = id === null ? this.api.create(this.form.value) : this.api.update(id, this.form.value);
        const msg = id === null ? '✔ Party added' : '✔ Party updated';

        obs.subscribe({
            next: () => {
                this.drawer.close();
                this.load();
                this.snack.open(msg, 'Close', { duration: 3000, panelClass: ['snack-success'] });
            },
            error: () => {
                this.snack.open('❌ Operation failed', 'Close', { duration: 3000, panelClass: ['snack-error'] });
            }
        });
    }

    remove(row: Party) {
        const ref = this.dialog.open(ConfirmationDialogComponent, {
            width: '360px',
            data: {
                title: 'Delete Party',
                message: `Are you sure you want to delete "${row.name}"?`
            }
        });

        ref.afterClosed().subscribe(res => {
            if (res) {
                this.api.delete(row.id).subscribe({
                    next: () => {
                        this.load();
                        this.snack.open('🗑️ Party deleted', 'Close', { duration: 3000, panelClass: ['snack-success'] });
                    },
                    error: () => {
                        this.snack.open('❌ Delete failed', 'Close', { duration: 3000, panelClass: ['snack-error'] });
                    }
                });
            }
        });
    }
}
