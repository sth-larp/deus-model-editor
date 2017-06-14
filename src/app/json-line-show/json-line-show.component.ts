import { Component, OnInit, Input } from '@angular/core';
import { JsonTextLine } from "../json-view/json-view.component"


@Component({
    selector: 'dme-json-lines-show',
    templateUrl: './json-line-show.component.html',
    styleUrls: ['./json-line-show.component.css']
})
export class JsonLineShowComponent implements OnInit {
    selectedLineClass = "bg-mod-lines"
    normalLineClass = "";


    @Input() public jsonLines: JsonTextLine[];

    constructor() { }

    ngOnInit() {
    }

    getRowClass(line: JsonTextLine): string{
        if(line.status != "none"){
            return this.selectedLineClass;
        }

        return this.normalLineClass;
    }

}
