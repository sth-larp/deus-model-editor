export class DeusModel{

    _srcData : any = null;

    private _data : any = null;

    constructor() {
        this._srcData = this.getDefaultModel();
        this.updateWorkModel();
    }

    get data(): any {
        return this._data;
    }

    get sourceData(): any {
        return this._srcData;
    }

    set sourceData( srcData: any ) {
        this._srcData = srcData;
    }


    getDefaultModel() : any{
        return {
                id        : "8888",
                password  : "P@ssw0rd",
                firstName : "Test",
                lastName  : "Player02",
                age       :  17,
                sex       : "male",
                corporation: "Skynet",
                maxHp : 5,
                hp    : 5,

                memory : [
                    {
                        title : "Название воспоминания №1",
                        text : "Какие-то воспоминания о хрен знает чем...",
                        url : "http://link-to-local-server.local/url"
                    },
                    {
                        title : "Название воспоминания №2",
                        url : "http://link-to-local-server.local/url2"
                    }
                ],
                mind : {
                    A : [0,1,2,3,4,5],
                    B : [0,1,2,3],
                    C : [1,2,3]
                },

                modifiers :   [
                    {
                        mID          : "dcc9a295-7892-44ad-8e5c-ebb69e68494d",
                        name         : "_defaultModifier",
                        displayName  : "",
                        class        : "default",
                        enabled      : true,

                        effects : [
                            {
                                enabled     : true,
                                name        : "_illnessStageShow",
                                type        : "normal",
                                handler     : "illnessStageShow"
                            }
                        ]
                    }
                ],

            conditions : [],
            timers : []
        };
    }

    updateWorkModel() : void{
        this._data = this.processModelNode(this._srcData);
    }

    private processModelNode( obj : any ): any {
        let retObj: any = null;

        if(!Array.isArray(obj)){
            retObj = {};
            retObj["__status"] = "none";

            /*if(Math.random() > 0.5){
                retObj["__status"] = "mod";
            }*/
        }else{
            retObj = [];
        }

        for(let p in obj){
            if(obj[p] == null ){
                retObj[p] = null;
            }else if(typeof obj[p] == "object"){
                retObj[p] = this.processModelNode( obj[p] );
            }else if(typeof obj[p] == "string" || typeof obj[p] == "number" ||  typeof obj[p] == "boolean"){
                retObj[p] = { __value: obj[p], __status: "none" }

                //TODO test!!!
                /*if(Math.random() > 0.5){
                    retObj[p].__status = "mod";
                }*/
            }
        }

        return retObj;
    }

}
