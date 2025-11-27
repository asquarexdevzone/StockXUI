import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FinishStockService } from '../finish-stock/finish-stock.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'app-finish-stock',
  templateUrl: './finish-stock.component.html',
  styleUrls: ['./finish-stock.component.scss'],
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ]
})
export class FinishStockComponent implements OnInit {

  displayedColumns = ['item', 'size', 'grade', 'boxQty', 'sqft'];
  ds = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private api: FinishStockService) {}

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
