import { Component, OnInit, Input, Output } from '@angular/core';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { CustomDatepickerFormater } from '../services/datepicker.service';
import * as moment from 'moment';

const lastUpdateDefault = { year: 1990, day: 1, month: 1 };
const lastUpdateHour = "10";
const lastUpdateMinute = "15";


@Component({
    selector: 'app-import-page',
    templateUrl: './import-page.component.html',
    styleUrls: ['./import-page.component.scss'],
    providers: [
        {provide: NgbDateParserFormatter, useClass: CustomDatepickerFormater}
     ]
})
export class ImportPageComponent implements OnInit {

    filterDate = lastUpdateDefault;
    filerSelectorValue = "changed";
    timeHours = lastUpdateHour;
    timeMinutes = lastUpdateMinute;

    public get loadFilterDate():any {
        try{
            return moment( [this.filterDate.year,
                            this.filterDate.month-1,
                            this.filterDate.day,
                            Number.parseInt(this.timeHours),
                            Number.parseInt(this.timeMinutes)
                        ]);
        }catch(e){
            return moment([1900,1,1]);
        }
    }

    public set loadFilterDate(t: any) {
        this.filterDate = { year: t.year(), day: t.date(), month: t.month()+1 };
        this.timeHours = t.hour();
        this.timeMinutes = t.minute();
    }

    getTestString(): string{
        return this.loadFilterDate.format("MM-DD-YYYY HH:mm");
    }

    constructor() {}


    ngOnInit() {
    }

    onFilterSelector(e){
        if(this.filerSelectorValue == "changed"){
            this.filterDate = lastUpdateDefault;
            this.timeHours = lastUpdateHour;
            this.timeMinutes = lastUpdateMinute;
        }else if(this.filerSelectorValue == "all"){
            this.filterDate = { year: 1900, day: 1, month: 1 };
            this.timeHours = "0";
            this.timeMinutes = "0";
        }else{
            let d = moment();
            console.log(d.format("DD-MM-YYYY"));
            this.filterDate = { year: d.year(), day: d.date(), month: d.month()+1 };
        }
    }

}
