import { 
    Cell,
    Slice, 
    Address, 
    Builder, 
    beginCell, 
    ComputeError, 
    TupleItem, 
    TupleReader, 
    Dictionary, 
    contractAddress, 
    ContractProvider, 
    Sender, 
    Contract, 
    ContractABI, 
    TupleBuilder,
    DictionaryValue
} from 'ton-core';

export type StateInit = {
    $$type: 'StateInit';
    code: Cell;
    data: Cell;
}

export function storeStateInit(src: StateInit) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeRef(src.code);
        b_0.storeRef(src.data);
    };
}

export function loadStateInit(slice: Slice) {
    let sc_0 = slice;
    let _code = sc_0.loadRef();
    let _data = sc_0.loadRef();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

function loadTupleStateInit(source: TupleReader) {
    let _code = source.readCell();
    let _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

function storeTupleStateInit(source: StateInit) {
    let builder = new TupleBuilder();
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}

function dictValueParserStateInit(): DictionaryValue<StateInit> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeStateInit(src)).endCell());
        },
        parse: (src) => {
            return loadStateInit(src.loadRef().beginParse());
        }
    }
}

export type Context = {
    $$type: 'Context';
    bounced: boolean;
    sender: Address;
    value: bigint;
    raw: Cell;
}

export function storeContext(src: Context) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeBit(src.bounced);
        b_0.storeAddress(src.sender);
        b_0.storeInt(src.value, 257);
        b_0.storeRef(src.raw);
    };
}

export function loadContext(slice: Slice) {
    let sc_0 = slice;
    let _bounced = sc_0.loadBit();
    let _sender = sc_0.loadAddress();
    let _value = sc_0.loadIntBig(257);
    let _raw = sc_0.loadRef();
    return { $$type: 'Context' as const, bounced: _bounced, sender: _sender, value: _value, raw: _raw };
}

function loadTupleContext(source: TupleReader) {
    let _bounced = source.readBoolean();
    let _sender = source.readAddress();
    let _value = source.readBigNumber();
    let _raw = source.readCell();
    return { $$type: 'Context' as const, bounced: _bounced, sender: _sender, value: _value, raw: _raw };
}

function storeTupleContext(source: Context) {
    let builder = new TupleBuilder();
    builder.writeBoolean(source.bounced);
    builder.writeAddress(source.sender);
    builder.writeNumber(source.value);
    builder.writeSlice(source.raw);
    return builder.build();
}

function dictValueParserContext(): DictionaryValue<Context> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeContext(src)).endCell());
        },
        parse: (src) => {
            return loadContext(src.loadRef().beginParse());
        }
    }
}

export type SendParameters = {
    $$type: 'SendParameters';
    bounce: boolean;
    to: Address;
    value: bigint;
    mode: bigint;
    body: Cell | null;
    code: Cell | null;
    data: Cell | null;
}

export function storeSendParameters(src: SendParameters) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeBit(src.bounce);
        b_0.storeAddress(src.to);
        b_0.storeInt(src.value, 257);
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        if (src.code !== null && src.code !== undefined) { b_0.storeBit(true).storeRef(src.code); } else { b_0.storeBit(false); }
        if (src.data !== null && src.data !== undefined) { b_0.storeBit(true).storeRef(src.data); } else { b_0.storeBit(false); }
    };
}

export function loadSendParameters(slice: Slice) {
    let sc_0 = slice;
    let _bounce = sc_0.loadBit();
    let _to = sc_0.loadAddress();
    let _value = sc_0.loadIntBig(257);
    let _mode = sc_0.loadIntBig(257);
    let _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    let _code = sc_0.loadBit() ? sc_0.loadRef() : null;
    let _data = sc_0.loadBit() ? sc_0.loadRef() : null;
    return { $$type: 'SendParameters' as const, bounce: _bounce, to: _to, value: _value, mode: _mode, body: _body, code: _code, data: _data };
}

function loadTupleSendParameters(source: TupleReader) {
    let _bounce = source.readBoolean();
    let _to = source.readAddress();
    let _value = source.readBigNumber();
    let _mode = source.readBigNumber();
    let _body = source.readCellOpt();
    let _code = source.readCellOpt();
    let _data = source.readCellOpt();
    return { $$type: 'SendParameters' as const, bounce: _bounce, to: _to, value: _value, mode: _mode, body: _body, code: _code, data: _data };
}

function storeTupleSendParameters(source: SendParameters) {
    let builder = new TupleBuilder();
    builder.writeBoolean(source.bounce);
    builder.writeAddress(source.to);
    builder.writeNumber(source.value);
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}

function dictValueParserSendParameters(): DictionaryValue<SendParameters> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeSendParameters(src)).endCell());
        },
        parse: (src) => {
            return loadSendParameters(src.loadRef().beginParse());
        }
    }
}

export type Entry = {
    $$type: 'Entry';
    amountToAdd: bigint;
    toAddress: Address;
}

export function storeEntry(src: Entry) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(3838520892, 32);
        b_0.storeUint(src.amountToAdd, 32);
        b_0.storeAddress(src.toAddress);
    };
}

export function loadEntry(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 3838520892) { throw Error('Invalid prefix'); }
    let _amountToAdd = sc_0.loadUintBig(32);
    let _toAddress = sc_0.loadAddress();
    return { $$type: 'Entry' as const, amountToAdd: _amountToAdd, toAddress: _toAddress };
}

function loadTupleEntry(source: TupleReader) {
    let _amountToAdd = source.readBigNumber();
    let _toAddress = source.readAddress();
    return { $$type: 'Entry' as const, amountToAdd: _amountToAdd, toAddress: _toAddress };
}

function storeTupleEntry(source: Entry) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.amountToAdd);
    builder.writeAddress(source.toAddress);
    return builder.build();
}

function dictValueParserEntry(): DictionaryValue<Entry> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeEntry(src)).endCell());
        },
        parse: (src) => {
            return loadEntry(src.loadRef().beginParse());
        }
    }
}

export type First = {
    $$type: 'First';
    amount: bigint;
    myCoins: bigint;
    myBool3: boolean;
    anAddress: Address;
}

export function storeFirst(src: First) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(3200290616, 32);
        b_0.storeUint(src.amount, 32);
        b_0.storeCoins(src.myCoins);
        b_0.storeBit(src.myBool3);
        b_0.storeAddress(src.anAddress);
    };
}

export function loadFirst(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 3200290616) { throw Error('Invalid prefix'); }
    let _amount = sc_0.loadUintBig(32);
    let _myCoins = sc_0.loadCoins();
    let _myBool3 = sc_0.loadBit();
    let _anAddress = sc_0.loadAddress();
    return { $$type: 'First' as const, amount: _amount, myCoins: _myCoins, myBool3: _myBool3, anAddress: _anAddress };
}

function loadTupleFirst(source: TupleReader) {
    let _amount = source.readBigNumber();
    let _myCoins = source.readBigNumber();
    let _myBool3 = source.readBoolean();
    let _anAddress = source.readAddress();
    return { $$type: 'First' as const, amount: _amount, myCoins: _myCoins, myBool3: _myBool3, anAddress: _anAddress };
}

function storeTupleFirst(source: First) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.amount);
    builder.writeNumber(source.myCoins);
    builder.writeBoolean(source.myBool3);
    builder.writeAddress(source.anAddress);
    return builder.build();
}

function dictValueParserFirst(): DictionaryValue<First> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeFirst(src)).endCell());
        },
        parse: (src) => {
            return loadFirst(src.loadRef().beginParse());
        }
    }
}

export type Second = {
    $$type: 'Second';
    amount_bigger: bigint;
    myBool: boolean;
    thisDoesNotFit: bigint;
    myAddress: Address;
    myBool2: boolean;
    myStruct: MyStruct;
    myStruct2: MyStruct;
}

export function storeSecond(src: Second) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(391585480, 32);
        b_0.storeUint(src.amount_bigger, 64);
        b_0.storeBit(src.myBool);
        b_0.storeUint(src.thisDoesNotFit, 256);
        b_0.storeAddress(src.myAddress);
        b_0.storeBit(src.myBool2);
        b_0.store(storeMyStruct(src.myStruct));
        let b_1 = new Builder();
        b_1.store(storeMyStruct(src.myStruct2));
        b_0.storeRef(b_1.endCell());
    };
}

export function loadSecond(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 391585480) { throw Error('Invalid prefix'); }
    let _amount_bigger = sc_0.loadUintBig(64);
    let _myBool = sc_0.loadBit();
    let _thisDoesNotFit = sc_0.loadUintBig(256);
    let _myAddress = sc_0.loadAddress();
    let _myBool2 = sc_0.loadBit();
    let _myStruct = loadMyStruct(sc_0);
    let sc_1 = sc_0.loadRef().beginParse();
    let _myStruct2 = loadMyStruct(sc_1);
    return { $$type: 'Second' as const, amount_bigger: _amount_bigger, myBool: _myBool, thisDoesNotFit: _thisDoesNotFit, myAddress: _myAddress, myBool2: _myBool2, myStruct: _myStruct, myStruct2: _myStruct2 };
}

function loadTupleSecond(source: TupleReader) {
    let _amount_bigger = source.readBigNumber();
    let _myBool = source.readBoolean();
    let _thisDoesNotFit = source.readBigNumber();
    let _myAddress = source.readAddress();
    let _myBool2 = source.readBoolean();
    const _myStruct = loadTupleMyStruct(source.readTuple());
    const _myStruct2 = loadTupleMyStruct(source.readTuple());
    return { $$type: 'Second' as const, amount_bigger: _amount_bigger, myBool: _myBool, thisDoesNotFit: _thisDoesNotFit, myAddress: _myAddress, myBool2: _myBool2, myStruct: _myStruct, myStruct2: _myStruct2 };
}

function storeTupleSecond(source: Second) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.amount_bigger);
    builder.writeBoolean(source.myBool);
    builder.writeNumber(source.thisDoesNotFit);
    builder.writeAddress(source.myAddress);
    builder.writeBoolean(source.myBool2);
    builder.writeTuple(storeTupleMyStruct(source.myStruct));
    builder.writeTuple(storeTupleMyStruct(source.myStruct2));
    return builder.build();
}

function dictValueParserSecond(): DictionaryValue<Second> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeSecond(src)).endCell());
        },
        parse: (src) => {
            return loadSecond(src.loadRef().beginParse());
        }
    }
}

export type MyStruct = {
    $$type: 'MyStruct';
    amount: bigint;
}

export function storeMyStruct(src: MyStruct) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeInt(src.amount, 257);
    };
}

export function loadMyStruct(slice: Slice) {
    let sc_0 = slice;
    let _amount = sc_0.loadIntBig(257);
    return { $$type: 'MyStruct' as const, amount: _amount };
}

function loadTupleMyStruct(source: TupleReader) {
    let _amount = source.readBigNumber();
    return { $$type: 'MyStruct' as const, amount: _amount };
}

function storeTupleMyStruct(source: MyStruct) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.amount);
    return builder.build();
}

function dictValueParserMyStruct(): DictionaryValue<MyStruct> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeMyStruct(src)).endCell());
        },
        parse: (src) => {
            return loadMyStruct(src.loadRef().beginParse());
        }
    }
}

 type SampleContract_init_args = {
    $$type: 'SampleContract_init_args';
}

function initSampleContract_init_args(src: SampleContract_init_args) {
    return (builder: Builder) => {
        let b_0 = builder;
    };
}

async function SampleContract_init() {
    const __code = Cell.fromBase64('te6ccgECFAEAA68AART/APSkE/S88sgLAQIBYgIDAprQAdDTAwFxsKMB+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiFRQUwNvBPhhAvhi2zxZ2zwwyPhDAcx/AcoAAQGBAQHPAMntVA8EAgFYCwwB9O2i7fshlIAg1yHecCHXScIflTAg1wsf3gKOUAGCEL7Ajzi6jivTHwGCEL7Ajzi68uCB0x/6ANIAVSBsE1uLpJbiBib3VuY2Uhj+FDCgpv5/4DCNBJJbiBnZW5lcmljIGJvdW5jZSGD+FDB/4CHAACHXScEhsJJbf+AhBQOughDkyy48uo6yMdMfAYIQ5MsuPLry4IHTH/pAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IgSbBLgIYIQF1ceyLqOiDHbPGwXXwd/4AHAAJEw4w1wBgcIAaZRIaGCEDuaygByf3Nw+EIQN8hVMIIQvsCPOFAFyx8Tyx8B+gLKAAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxbJEEVBMBUUQzBtbds8fwkAmNMfAYIQF1ceyLry4IHTP9IA0//6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIAdIAgQEB1wABAdQB0IEBAdcAATEXFhUUQzAAVPkBgvDN0PWWajeSIjimlU7pGKFizFkECe9l8JTO6B6dC8UrtLqTf9sx4AHKyHEBygFQBwHKAHABygJQBSDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFlAD+gJwAcpoI26zkX+TJG6z4pczMwFwAcoA4w0hbrOcfwHKAAEgbvLQgAHMlTFwAcoA4skB+wAKAJh/AcoAyHABygBwAcoAJG6znX8BygAEIG7y0IBQBMyWNANwAcoA4iRus51/AcoABCBu8tCAUATMljQDcAHKAOJwAcoAAn8BygACyVjMAgEgDQ4CAUgSEwIPtV2bZ5tnhjAPEAC5t3owTgudh6ullc9j0J2HOslQo2zQThO6xqWlbI+WZFp15b++LEcwTgQKuANwDOxymcsHVcjktlhwTgN6k73yqLLeOOp6e8CrOGTQThOy6ctWadluZ0HSzbKM3RSQAULtRNDUAfhj0gABl4EBAdcAATHgMPgo1wsKgwm68uCJ2zwRAAIgAASAZAARsK+7UTQ0gABgAHWybuNDVpcGZzOi8vUW1jZWhoWnpRd2VhZ2QxS0xlQ25FYVZXSm9pQWFkTnVCRGNNWjZldlVFNWNmWoIA==');
    const __system = Cell.fromBase64('te6cckECFgEAA7kAAQHAAQEFoIcVAgEU/wD0pBP0vPLICwMCAWIMBAIBWAgFAgFIBwYAdbJu40NWlwZnM6Ly9RbWNlaGhaelF3ZWFnZDFLTGVDbkVhVldKb2lBYWROdUJEY01aNmV2VUU1Y2ZaggABGwr7tRNDSAAGACASAKCQC5t3owTgudh6ullc9j0J2HOslQo2zQThO6xqWlbI+WZFp15b++LEcwTgQKuANwDOxymcsHVcjktlhwTgN6k73yqLLeOOp6e8CrOGTQThOy6ctWadluZ0HSzbKM3RSQAg+1XZtnm2eGMBQLAAIgAprQAdDTAwFxsKMB+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiFRQUwNvBPhhAvhi2zxZ2zwwyPhDAcx/AcoAAQGBAQHPAMntVBQNAfTtou37IZSAINch3nAh10nCH5UwINcLH94CjlABghC+wI84uo4r0x8BghC+wI84uvLggdMf+gDSAFUgbBNbi6SW4gYm91bmNlIY/hQwoKb+f+AwjQSSW4gZ2VuZXJpYyBib3VuY2Uhg/hQwf+AhwAAh10nBIbCSW3/gIQ4DroIQ5MsuPLqOsjHTHwGCEOTLLjy68uCB0x/6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIEmwS4CGCEBdXHsi6jogx2zxsF18Hf+ABwACRMOMNcBEQDwBU+QGC8M3Q9ZZqN5IiOKaVTukYoWLMWQQJ72XwlM7oHp0LxSu0upN/2zHgAJjTHwGCEBdXHsi68uCB0z/SANP/+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiAHSAIEBAdcAAQHUAdCBAQHXAAExFxYVFEMwAaZRIaGCEDuaygByf3Nw+EIQN8hVMIIQvsCPOFAFyx8Tyx8B+gLKAAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxbJEEVBMBUUQzBtbds8fxIByshxAcoBUAcBygBwAcoCUAUg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxZQA/oCcAHKaCNus5F/kyRus+KXMzMBcAHKAOMNIW6znH8BygABIG7y0IABzJUxcAHKAOLJAfsAEwCYfwHKAMhwAcoAcAHKACRus51/AcoABCBu8tCAUATMljQDcAHKAOIkbrOdfwHKAAQgbvLQgFAEzJY0A3ABygDicAHKAAJ/AcoAAslYzAFC7UTQ1AH4Y9IAAZeBAQHXAAEx4DD4KNcLCoMJuvLgids8FQAEgGSwchAQ');
    let builder = beginCell();
    builder.storeRef(__system);
    builder.storeUint(0, 1);
    initSampleContract_init_args({ $$type: 'SampleContract_init_args' })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

const SampleContract_errors: { [key: number]: { message: string } } = {
    2: { message: `Stack undeflow` },
    3: { message: `Stack overflow` },
    4: { message: `Integer overflow` },
    5: { message: `Integer out of expected range` },
    6: { message: `Invalid opcode` },
    7: { message: `Type check error` },
    8: { message: `Cell overflow` },
    9: { message: `Cell underflow` },
    10: { message: `Dictionary error` },
    13: { message: `Out of gas error` },
    32: { message: `Method ID not found` },
    34: { message: `Action is invalid or not supported` },
    37: { message: `Not enough TON` },
    38: { message: `Not enough extra-currencies` },
    128: { message: `Null reference exception` },
    129: { message: `Invalid serialization prefix` },
    130: { message: `Invalid incoming message` },
    131: { message: `Constraints error` },
    132: { message: `Access denied` },
    133: { message: `Contract stopped` },
    134: { message: `Invalid argument` },
    135: { message: `Code of a contract was not found` },
    136: { message: `Invalid address` },
    137: { message: `Masterchain support is not enabled for this contract` },
}

export class SampleContract implements Contract {
    
    static async init() {
        return await SampleContract_init();
    }
    
    static async fromInit() {
        const init = await SampleContract_init();
        const address = contractAddress(0, init);
        return new SampleContract(address, init);
    }
    
    static fromAddress(address: Address) {
        return new SampleContract(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        errors: SampleContract_errors
    };
    
    private constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: null | Entry | Second | 'Increment') {
        
        let body: Cell | null = null;
        if (message === null) {
            body = new Cell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Entry') {
            body = beginCell().store(storeEntry(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Second') {
            body = beginCell().store(storeSecond(message)).endCell();
        }
        if (message === 'Increment') {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getAmount(provider: ContractProvider) {
        let builder = new TupleBuilder();
        let source = (await provider.get('amount', builder.build())).stack;
        let result = source.readBigNumber();
        return result;
    }
    
}