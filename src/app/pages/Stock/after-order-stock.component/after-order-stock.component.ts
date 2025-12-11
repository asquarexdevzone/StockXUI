import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AfterOrderStockService } from './after-order-stock.service';

        
@Component({
  selector: 'app-after-order-stock.component',
  imports: [CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './after-order-stock.component.html',
  styleUrls: ['./after-order-stock.component.scss'],
})
export class AfterOrderStockComponent {
  displayedColumns = [  'item',  'size',   'openingBox', 'sampleQty',
  'breakage', 'finalBox',  'openingSqft',  'finalSqft'];
  ds = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private api: AfterOrderStockService) {}
  
    ngOnInit() {
      this.load();
    }
  
    ngAfterViewInit() {
      this.ds.paginator = this.paginator;
      this.ds.sort = this.sort;
    }
  
    load() {
      this.api.list().subscribe(res => this.ds.data = res);
    }
  
    applyFilter(v: string) {
      this.ds.filter = v.trim().toLowerCase();
    }
}
