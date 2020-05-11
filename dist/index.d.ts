declare type FsmxEvent = (from: string, to: string) => void;
interface IFsmxEvents {
    onLeaveState?: FsmxEvent;
    onEnterState?: FsmxEvent;
}
interface IFsmxSchemaItem {
    from: string | string[];
    to: string;
}
declare type FsmxInitialState = string;
declare type FsmxActions = {
    [key: string]: {
        from: string | string[];
        to: string;
    };
};
interface FsmxInitialOptions {
    initial: FsmxInitialOptions;
    actions: FsmxActions;
    events?: IFsmxEvents;
}
declare class Fsmx {
    initial: FsmxInitialState;
    events: IFsmxEvents;
    schema: IFsmxSchemaItem[];
    state: string;
    constructor(options: FsmxInitialOptions);
    transit(from: string | string[], to: string): Promise<void>;
    private emit;
    private buildSchema;
    can(stateName: string): boolean;
    is(stateName: string): boolean;
    reset(): void;
}
export default Fsmx;
