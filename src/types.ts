import { Ctx } from "./lib/Bot";

export interface Command {
    name: string,
    module?: string,
    ownerOnly?: boolean,
    description?: string,
    run: (ctx: Ctx) => unknown | Promise<unknown>
}

export interface WeightHistory {
    /** Historical date */
    date: number,
    /** Weight in kilograms */
    weight: number
}

export interface UserStorage {
    /** Weight in kilogram */
    weight: number,
    /** Height in meter */
    height: number,
    /**  Biological sex (false is female, true is male) */
    sex: boolean,
    age: number,
    timezone: string,
    /** Date since the user has sent their weight record */
    date: number,
    didCountTheirWeightToday?: boolean,
    disableNotify?: boolean
    history?: WeightHistory[]
}

export type SessionCache = object