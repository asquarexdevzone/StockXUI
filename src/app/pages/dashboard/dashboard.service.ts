import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })

export class DashboardService {
    private base = "https://localhost:44361/api/Dashboard";

    constructor(private http: HttpClient) { }

    getOpeningMonthly(itemId?: number | null, from?: string | null, to?: string | null) {
        let params: any = {};
        if (itemId) params.itemId = itemId;
        if (from) params.from = from;
        if (to) params.to = to;

        return this.http.get<any[]>(`${this.base}/opening-monthly`, { params });
    }

    getPurchaseMonthly(itemId?: number | null, from?: string | null, to?: string | null) {
        let params: any = {};

        if (itemId !== null && itemId !== undefined)
            params.itemId = itemId;

        if (from)
            params.from = from + "T00:00:00";

        if (to)
            params.to = to + "T23:59:59";

        return this.http.get<any[]>(`${this.base}/purchase-monthly`, { params });
    }



    getFinishMonthly(itemId?: number | null, from?: string | null, to?: string | null) {
        let params: any = {};
        if (itemId) params.itemId = itemId;
        if (from) params.from = from;
        if (to) params.to = to;

        return this.http.get<any[]>(`${this.base}/finish-monthly`, { params });
    }


    getAfterOrderMonthly(itemId?: number | null, from?: string | null, to?: string | null) {
        let params: any = {};
        if (itemId) params.itemId = itemId;
        if (from) params.from = from;
        if (to) params.to = to;

        return this.http.get<any[]>(`${this.base}/afterorder-monthly`, { params });
    }

    getItemWiseStock(from?: string | null, to?: string | null) {
        let params: any = {};
        if (from) params.from = from;
        if (to) params.to = to;

        return this.http.get<any[]>(`${this.base}/itemwise-stock`, { params });
    }


    getItems(): Observable<any[]> {
        return this.http.get<any[]>(`${this.base}/items`);
    }


    getSummary(itemId?: number | null, from?: string | null, to?: string | null) {
        let params: any = {};
        if (itemId) params.itemId = itemId;
        if (from) params.from = from;
        if (to) params.to = to;

        return this.http.get(`${this.base}/summary`, { params });
    }

    //  marketer pie chart
    getMarketerPartyChart() {
        return this.http.get<any[]>(`${this.base}/marketer-party-chart`);
    }

}