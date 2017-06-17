import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Observable, ConnectableObservable, Subscription } from 'rxjs/Rx';

import { DeusModelService } from '../model/deus-model.service';
import { JsonLineShowComponent } from "../json-line-show/json-line-show.component"

export class JsonTextLine{
    lineNumber: number = 0;

    constructor(public text: string,
                public status:string = "none",
                public subLines:JsonTextLine[] = null){}
};



@Component({
    selector: 'dme-json-view',
    templateUrl: './json-view.component.html',
    styleUrls: ['./json-view.component.css']
})
export class JsonViewComponent implements OnInit {
//Constants
    private indentString = '<span class="dmeJsonIndent"></span>';

//Data fields
    public textModelLines: JsonTextLine[] = [];

//DataSource
    private subscription: Subscription = null;

//Constructor
    constructor(private modelService: DeusModelService) {}

//JSON tokens classes
    elementsClass = {
        field: "dmeJsonField",
        stringValue : "dmeJsonString",
        numValue : "dmeJsonNum",
        boolValue : "dmeJsonBool",
        nullValue : "dmeJsonNull",
        indent : "dmeJsonIndent",
        leftBracket : "dmeJsonLBracket",
        rightBracket : "dmeJsonRBracket",
        emptyBrackets : "dmeJsonEmptyBrackets"
    }

//Members
    ngOnInit() {}

    subscribeModel( type: string ): boolean{
        this.unsubscribeModel();
        this.subscription = this.modelService.getModel(type).subscribe( data => this.refreshModelLInes(data) );

        return (this.subscription != null);
    }

    unsubscribeModel(): boolean{
        if(this.subscription && !this.subscription.closed){
            this.subscription.unsubscribe();
            return true;
        }
        return false;
    }

    //Перезаливает список строк для отображения из источника
    refreshModelLInes( obj : any ){
        this.textModelLines = this.genObjectView(obj, 0);
        this.setLineNumbers(this.textModelLines, 0);
    }

    //Проставляет номера строк после генерации строк для отображения
    setLineNumbers( lines: JsonTextLine[], startNumber: number ): number {
        let n = startNumber;

        lines.forEach( (cur, index) => {
                if(!cur.subLines){
                    cur.lineNumber = n;
                    n++;
                }else{
                    n += this.setLineNumbers(cur.subLines, n);
                }
            },this );

        return n - startNumber;
    }

    //Возвращает тип объекта в JSONе (simple, numArray, array, object)
    getModelObjectType(obj: any): string{
        if(obj == null){
            return "simple";
        }else if(this.testSimpleJsonArray(obj)){
            return "numArray";
        }else if(Array.isArray(obj)){
            return "array";
        }else if(this.testSimpleJsonNode(obj)){
            return "simple";
        }else{
            return "object";
        }
    }

    //Проверка простой массив (только цифры)
    testSimpleJsonArray(obj: any): boolean{
        if(!Array.isArray(obj)) return false;

        for(let i=0; i<obj.length; i++){
            if(!this.testSimpleJsonNode(obj[i]) || (typeof obj[i].__value != "number")){
                return false;
            }
        }

        return true;
    }

    //Проверка на то, что это простое значение (не массив и не объект)
    testSimpleJsonNode(obj: any): boolean {
        if(obj.hasOwnProperty("__value") && obj.hasOwnProperty("__status") && (Object.keys(obj).length == 2)){
            return true;
        }

        return false;
    }

    //Общая функция для получения строк для отображения
    genModelValueView(obj: any, indent: number): JsonTextLine[]{

        switch(this.getModelObjectType(obj)){
            case "object":
                return this.genObjectView(obj, indent);

            case "array":
                return this.genArrayView(obj, indent);

            case "numArray":
                return this.genSimpleArrayView(obj,indent);

            case "simple":
                return [ this.genSimpleView(obj, indent) ];
        }
    }

    //Генерации строки отображения для простого массива
    genSimpleArrayView(obj: any, indent: number): JsonTextLine[] {
        if(obj.length == 0) { return [new JsonTextLine(
                                            this.toSpan("[ ]","emptyBrackets"),
                                            obj.__status)]; }

        let retText: string = this.toSpan("[", "leftBracket") + " ";
        let status = "none";

        for(let i=0; i<obj.length; i++){
            let simpleVal = this.genSimpleView(obj[i],indent);
            retText += simpleVal.text;

            if(i != obj.length-1) {
                 retText += ", ";
            }

            if(simpleVal.status != "none") { status = simpleVal.status; }
        }

        retText += " " + this.toSpan("]", "rightBracket");

        return [new JsonTextLine(retText,status)]
    }


    //Генерации строк отображения для обычного массива
    genArrayView(obj: any, indent: number): JsonTextLine[] {
        if(obj.length == 0) { return [new JsonTextLine(
                                            this.toSpan("[ ]","emptyBrackets"),
                                            obj.__status)]
                            }

        let retText: JsonTextLine[] = [ new JsonTextLine(this.toSpan("[", "leftBracket")) ];

        let lineIndent = this.indentString.repeat(indent+1);

        for(let i=0; i<obj.length; i++){
             let nodeLines = this.genModelValueView(obj[i], indent+1);
             nodeLines[0].text = lineIndent + nodeLines[0].text;

             if(i != obj.length-1){
                nodeLines[nodeLines.length-1].text = nodeLines[nodeLines.length-1].text + ","
            }

            if(nodeLines.length == 1){
                retText.push(nodeLines[0]);
            }else{
                retText.push( new JsonTextLine("","none",nodeLines) );
            }
        }

        retText.push( new JsonTextLine(this.indentString.repeat(indent) + this.toSpan("]", "rightBracket")) );

        return retText;
    }

    //Генерации строк отображения для объекта
    genObjectView(obj: any, indent: number): JsonTextLine[]{
        if(Object.keys(obj).length == 0) { return [new JsonTextLine(
                                                            this.toSpan("{ }","emptyBrackets"),
                                                            obj.__status)]
                                          }

        let retText: JsonTextLine[] = [ new JsonTextLine(
                                            this.toSpan("{", "leftBracket"),
                                            obj.__status) ];

        let lineIndent = this.indentString.repeat(indent+1);

        let i = 0

        for (let p in obj) {
            if(p == "__status") {
                i++;
                continue;
            }

            let nodeLines = this.genModelValueView(obj[p], indent+1);
            nodeLines[0].text = lineIndent + this.toSpan(`"${p}"`,"field") + " : " + nodeLines[0].text;

            if(i != Object.keys(obj).length-1){
                nodeLines[nodeLines.length-1].text = nodeLines[nodeLines.length-1].text + ","
            }

            if(nodeLines.length == 1){
                retText.push(nodeLines[0]);
            }else{
                retText.push( new JsonTextLine("","none",nodeLines) );
            }

            i++;
        }

        retText.push( new JsonTextLine(this.indentString.repeat(indent) +
                                                this.toSpan("}","rightBracket"),
                                                obj.__status) );

        return retText;
    }

    //Генерации строк отображения для простого значения (строка, цифра, boolean, null)
    genSimpleView(obj: any, indent: number): JsonTextLine {
        let ret: JsonTextLine = new JsonTextLine("");

        switch(typeof obj.__value){
            case "string":
                ret.text = this.toSpan(`"${obj.__value}"`, "stringValue");
                break;

            case "boolean":
                ret.text = this.toSpan(`${obj.__value}`, "boolValue");
                break;

            case "number":
                 ret.text = this.toSpan(`${obj.__value}`, "numValue");
                 break;

            default:
                 ret.text = this.toSpan("null", "nullValue");
        }

        ret.status = obj.__status;

        return ret;
    }

    //Подставляет <span></span> вокруг значения
    toSpan(val: string, type: string){
        return `<span class="${this.elementsClass[type]}">${val}</span>`;
    }

}
