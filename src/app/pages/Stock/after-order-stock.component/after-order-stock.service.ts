import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { tick } from "@angular/core/testing";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root'})
export class AfterOrderStockService{
    private base ="https://localhost:44361/api/AfterOrderStock"

    constructor(private http: HttpClient){}

    list(): Observable<any[]>{
        return this.http.get<any[]>(this.base);
    }
}