import { REFRESH_EVENT_NAME } from "../data/preload-events"

import * as df from 'format-duration'

export interface IDeusEvent {
        _id?: string,
        characterId: string,
        timestamp : number,
        eventType : string,
        data : any,
        dataAsString?: string,
        timeOffsetAsString?: string,
        json?: string

};

export class DeusEvent implements IDeusEvent{
    public timeOffsetAsString = "";

    public constructor( public characterId: string,
                        public eventType: string,
                        public data: any = {},
                        public timestamp: number = Date.now(),
                        public _id: string = undefined ){

    }

    public static getRefreshEvent(characterId: string): IDeusEvent{
        return new DeusEvent(characterId, REFRESH_EVENT_NAME);
    }

    public get dataAsString(): string{
        return JSON.stringify(this.data);
    }

    public static fromEvent(e: IDeusEvent): DeusEvent{
        return (new DeusEvent(e.characterId, e.eventType, e.data, e.timestamp, e._id)).withTimeOffset();
    }

    public get json(): string{
        return JSON.stringify(
            {
                _id: this._id,
                characterId: this.characterId,
                timestamp: this.timestamp,
                eventType: this.eventType,
                data: this.data
            }, null, 4);
    }

    public withTimeOffset(): DeusEvent {
        let offset = this.timestamp - Date.now();

        if(Math.abs(offset) > 86400000){
            this.timeOffsetAsString = ' > 24h';
        }else{
            if(offset > 0){
                this.timeOffsetAsString = df(offset);
            }else{
                this.timeOffsetAsString = "-" + df(Math.abs(offset));
            }
        }

        return this;
    }

}
