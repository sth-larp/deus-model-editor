import { REFRESH_EVENT_NAME } from "../data/preload-events"

export interface IDeusEvent {
        _id?: string,
        characterId: string,
        timestamp : number,
        eventType : string,
        data : any,
        dataAsString?: string
};

export class DeusEvent implements IDeusEvent{
    public constructor( public characterId: string,
                        public eventType: string,
                        public data: any = {},
                        public timestamp: number = Date.now(),
                        public _id: string = "" ){}

    public static getRefreshEvent(characterId: string): DeusEvent{
        return new DeusEvent(characterId, REFRESH_EVENT_NAME);
    }

    public get dataAsString(): string{
        return JSON.stringify(this.data);
    }

    public static fromEvent(e: IDeusEvent): DeusEvent{
        return new DeusEvent(e.characterId, e.eventType, e.data, e.timestamp, e._id);
    }
}
