import { Component, OnInit } from '@angular/core';
import { DashboardService } from './dashboard.service';
import Chart from 'chart.js/auto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
}
)
export class DashboardComponent implements OnInit {

  items: any[] = [];
  summary: any = { openingStock: 0, finishStock: 0, afterOrderStock: 0 };

  selectedItemId: number | null = null;
  fromDate: string | null = null;
  toDate: string | null = null;

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.loadItems();
    this.loadMarketerPartyChart();
  }

  // Month helper
  monthName(m: number): string {
    return new Date(2000, m - 1, 1).toLocaleString('en-US', { month: 'short' });
  }

  // ===========================
  // MAIN FILTER TRIGGER
  // ===========================
  applyFilters() {
    this.loadSummary();
    this.refreshAllCharts();
  }

  // ===========================
  // SUMMARY
  // ===========================
  loadSummary() {
    this.dashboardService.getSummary(this.selectedItemId, this.fromDate, this.toDate)
      .subscribe(res => this.summary = res);
  }

  // ===========================
  // REFRESH ALL CHARTS
  // ===========================
  refreshAllCharts() {
    this.openingStockChart();
    this.purchaseChart();
    this.finishStockChart();
    this.afterOrderStockChart();
    this.itemWiseChart();
  }

  ///  solution for getting destroy error in dashboard component if select items

  //chart variables 
  openingChartInstance: any;
  purchaseChartInstance: any;
  finishChartInstance: any;
  afterOrderChartInstance: any;
  itemWiseChartInstance: any;

  // safe destroy helper
  private destroyChart(instance: Chart | null) {
    if (instance) {
      try { instance.destroy(); } catch (e) { /* ignore errors */ }
    }
  }


  // OPENING
  openingStockChart() {
    // destroy previous instance
    this.destroyChart(this.openingChartInstance);

    // get canvas element
    const canvas = document.getElementById('openingChart') as HTMLCanvasElement | null;
    if (!canvas) return;

    this.dashboardService.getOpeningMonthly(this.selectedItemId, this.fromDate, this.toDate)
      .subscribe((res: any[]) => {
        const labels = res.map(x => this.monthName(x.month));
        const values = res.map(x => x.totalBox);

        this.openingChartInstance = new Chart(canvas, {
          type: 'bar',
          data: { labels, datasets: [{ label: 'Opening Stock', data: values }] },
        });
      });
  }

  // PURCHASE
  purchaseChart() {
    this.destroyChart(this.purchaseChartInstance);
    const canvas = document.getElementById('purchaseChart') as HTMLCanvasElement | null;
    if (!canvas) return;

    this.dashboardService.getPurchaseMonthly(this.selectedItemId, this.fromDate, this.toDate)
      .subscribe((res: any[]) => {

        if (!res || res.length === 0) {
        this.purchaseChartInstance = new Chart(canvas, {
          type: 'line',
          data: { labels: [], datasets: [{ label: 'No Data', data: [] }] }
        });
        return;
      }
        const labels = res.map(x => this.monthName(x.month));
        const values = res.map(x => x.totalBox);

        this.purchaseChartInstance = new Chart(canvas, {
          type: 'line',
          data: { labels, datasets: [{ label: 'Purchase Stock', data: values, fill: true }] },
        });
      });
  }

  // FINISH
  finishStockChart() {
    this.destroyChart(this.finishChartInstance);
    const canvas = document.getElementById('finishChart') as HTMLCanvasElement | null;
    if (!canvas) return;

    this.dashboardService.getFinishMonthly(this.selectedItemId, this.fromDate, this.toDate)
      .subscribe((res: any[]) => {
        const labels = res.map(x => this.monthName(x.month));
        const values = res.map(x => x.finish);

        this.finishChartInstance = new Chart(canvas, {
          type: 'bar',
          data: { labels, datasets: [{ label: 'Finish Stock', data: values }] },
        });
      });
  }

  // AFTER ORDER
  afterOrderStockChart() {
    this.destroyChart(this.afterOrderChartInstance);
    const canvas = document.getElementById('afterOrderChart') as HTMLCanvasElement | null;
    if (!canvas) return;

    this.dashboardService.getAfterOrderMonthly(this.selectedItemId, this.fromDate, this.toDate)
      .subscribe((res: any[]) => {
        const labels = res.map(x => this.monthName(x.month));
        const values = res.map(x => x.afterOrder);

        this.afterOrderChartInstance = new Chart(canvas, {
          type: 'line',
          data: { labels, datasets: [{ label: 'After Order Stock', data: values, fill: true }] },
        });
      });
  }

  // ITEM WISE
  itemWiseChart() {
    this.destroyChart(this.itemWiseChartInstance);
    const canvas = document.getElementById('itemWiseChart') as HTMLCanvasElement | null;
    if (!canvas) return;

    this.dashboardService.getItemWiseStock(this.fromDate, this.toDate)
      .subscribe((res: any[]) => {
        const labels = res.map(x => x.name);
        const f = res.map(x => x.finishStock);
        const a = res.map(x => x.afterOrderStock);

        this.itemWiseChartInstance = new Chart(canvas, {
          type: 'bar',
          data: {
            labels,
            datasets: [
              { label: 'Finish Stock', data: f },
              { label: 'After Order Stock', data: a }
            ]
          }
        });
      });
  }

  // load items and set default
  loadItems() {
    this.dashboardService.getItems().subscribe((res: any[]) => {
      this.items = res;
      // ensure default selection is null (All Items)
      this.selectedItemId = null;
      // initial load after items are ready
      this.applyFilters();
    });
  }

  //   marketer pie chart
  loadMarketerPartyChart() {
    this.dashboardService.getMarketerPartyChart().subscribe(res => {
      const labels = res.map((x: any) => x.marketerName);
      const data = res.map((x: any) => x.partyCount);

      this.renderPieChart(labels, data);
    });
  }

  // render pie chart
   renderPieChart(labels: string[], data: number[]) {
    new Chart("partyPieChart", {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          label: 'Parties by Marketer',
          data: data,
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right'
          }
        }
      }
    });
  }
}
