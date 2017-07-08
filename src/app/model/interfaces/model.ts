import { DeusModifier } from './modifier';
import { DeusCondition } from './condition';

export interface DeusModel {
        _id: string,
        _rev?: string,
        memory?: Array<any>,
        firstName: string,
        lastName:  string,
        skills?: Array<any>,
        sex: string,
        corporation?: string,
        hp: number,
        maxHp: number,
        mind: any,
        timestamp: number,
        conditions: Array<DeusCondition>,
        modifiers: Array<DeusModifier>,
        age: number,
        timers: Array<any>
};
