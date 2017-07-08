/**
 * Модель одной строки в показе JSONа
 * Создаеся при получении нового JSONа от источника
 *
 * @export
 * @class JsonTextLine
 */
export class JsonTextLine{
    public isTriggerCollapsed: boolean = false;
    public isVisible: boolean = true;

    constructor( public text: string,
                 public status: string = "none",
                 public collapseTrigger: boolean = false,
                 public collapseStub: string = null,
                 public collapseFinish: boolean = false,
                 public defaultShowLevels: number = 1   ) { }
};

/**
 * Класс инкапсулирующий оборабтку объектов для показа
 * (превращается объект в набор строк для View)
 *
 * @export
 * @class PrepareViewData
 */
export class PrepareViewData{
//Constants
    private static indentString = '<span class="dmeJsonIndent"></span>';

    //JSON tokens classes
    private static elementsClass = {
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

    static process(obj: any): JsonTextLine[]{
        return this.genObjectView(obj, 0);
    }


     //Возвращает тип объекта в JSONе (simple, numArray, array, object)
    static getModelObjectType(obj: any): string{
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
    static testSimpleJsonArray(obj: any): boolean{
        if(!Array.isArray(obj)) return false;

        for(let i=0; i<obj.length; i++){
            if(!this.testSimpleJsonNode(obj[i]) || (typeof obj[i].__value != "number")){
                return false;
            }
        }

        return true;
    }

    //Проверка на то, что это простое значение (не массив и не объект)
    static testSimpleJsonNode(obj: any): boolean {
        if(obj.hasOwnProperty("__value") && obj.hasOwnProperty("__status") && (Object.keys(obj).length == 2)){
            return true;
        }

        return false;
    }

    //Общая функция для получения строк для отображения
    static genModelValueView(obj: any, indent: number): JsonTextLine[]{

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
    static genSimpleArrayView(obj: any, indent: number): JsonTextLine[] {
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
    static genArrayView(obj: any, indent: number): JsonTextLine[] {
        if(obj.length == 0) { return [new JsonTextLine(
                                            this.toSpan("[ ]","emptyBrackets"),
                                            obj.__status)]
                            }

        let retText: JsonTextLine[] = [ new JsonTextLine( this.toSpan("[", "leftBracket"),
                                                          "none",
                                                          true,
                                                          this.toSpan("]", "rightBracket"),
                                                          false,
                                                          2  ) ];

        let lineIndent = this.indentString.repeat(indent+1);

        for(let i=0; i<obj.length; i++){
             let nodeLines = this.genModelValueView(obj[i], indent+1);
             nodeLines[0].text = lineIndent + nodeLines[0].text;

             if(i != obj.length-1){
                nodeLines[nodeLines.length-1].text = nodeLines[nodeLines.length-1].text + ","
            }

            retText.push(...nodeLines)
        }

        retText.push( new JsonTextLine( this.indentString.repeat(indent) + this.toSpan("]", "rightBracket"),
                                        "none",
                                        false, null, true ) );

        return retText;
    }

    //Генерации строк отображения для объекта
    static genObjectView(obj: any, indent: number): JsonTextLine[]{
        if(Object.keys(obj).length == 0) { return [new JsonTextLine(
                                                            this.toSpan("{ }","emptyBrackets"),
                                                            obj.__status)]
                                          }

        let retText: JsonTextLine[] = [ new JsonTextLine(
                                            this.toSpan("{", "leftBracket"),
                                            obj.__status,
                                            true,
                                            this.toSpan("}", "rightBracket"),
                                            ) ];

        let lineIndent = this.indentString.repeat(indent+1);

        let i = 0

        for (let p in obj) {
            if(p == "__status") {
                i++;
                continue;
            }

            let nodeLines: JsonTextLine[] = this.genModelValueView(obj[p], indent+1);
            nodeLines[0].text = lineIndent + this.toSpan(`"${p}"`,"field") + " : " + nodeLines[0].text;

            if(i != Object.keys(obj).length-1){
                nodeLines[nodeLines.length-1].text = nodeLines[nodeLines.length-1].text + ","
            }

            retText.push(...nodeLines);

            i++;
        }

        retText.push( new JsonTextLine(this.indentString.repeat(indent) +
                                                this.toSpan("}","rightBracket"),
                                                obj.__status,
                                                false, null, true) );

        return retText;
    }

    //Генерации строк отображения для простого значения (строка, цифра, boolean, null)
    static genSimpleView(obj: any, indent: number): JsonTextLine {
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
    static toSpan(val: string, type: string){
        return `<span class="${this.elementsClass[type]}">${val}</span>`;
    }
}
