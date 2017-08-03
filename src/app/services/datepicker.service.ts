import {Component, Injectable} from '@angular/core';
import {NgbDateParserFormatter, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';

@Injectable()
export class CustomDatepickerFormater extends NgbDateParserFormatter {

    constructor() {
        super();
    }

    public parse(value: string): NgbDateStruct{
        let d = moment(value,"DD-MM-YYYY");
        return { year: d.year(), day: d.date(), month: d.month()+1 }
    }

    format(d: NgbDateStruct): string {
        try{
            console.log(d);
            return moment([d.year, d.month-1, d.day,0,0,0]).format("DD-MM-YYYY");
        }catch(e){
            return moment([1900,0,1]).format("DD-MM-YYYY");
        }
    }
}
