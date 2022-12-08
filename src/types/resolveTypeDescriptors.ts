import { ASTField, ASTFunction, ASTInitFunction, ASTNativeFunction, ASTTypeRef, throwError } from "../ast/ast";
import { CompilerContext, createContextStore } from "../ast/context";
import { FieldDescription, FunctionArgument, FunctionDescription, InitDescription, TypeDescription, TypeRef } from "./types";

let store = createContextStore<TypeDescription>();
let staticFunctionsStore = createContextStore<FunctionDescription>();

export function resolveTypeRef(ctx: CompilerContext, src: ASTTypeRef): TypeRef {
    if (src.kind === 'type_ref_simple') {
        let n = getType(ctx, src.name).name; // TODO: Check
        return {
            kind: 'ref',
            name: n,
            optional: src.optional
        };
    }
    if (src.kind === 'type_ref_map') {
        let k = getType(ctx, src.key).name;
        let v = getType(ctx, src.value).name;
        return {
            kind: 'map',
            key: k,
            value: v
        };
    }
    throw Error('Invalid type ref');
}

export function resolveTypeDescriptors(ctx: CompilerContext) {
    let types: { [key: string]: TypeDescription } = {};
    let staticFunctions: { [key: string]: FunctionDescription } = {};

    // Register types
    for (let t in ctx.astTypes) {
        let a = ctx.astTypes[t];
        if (types[a.name]) {
            throwError(`Type ${a.name} already exists`, a.ref);
        }
        if (a.kind === 'primitive') {
            types[a.name] = {
                kind: 'primitive',
                name: a.name,
                fields: [],
                functions: [],
                receivers: [],
                init: null,
                ast: a
            };
        } else if (a.kind === 'def_contract') {
            types[a.name] = {
                kind: 'contract',
                name: a.name,
                fields: [],
                functions: [],
                receivers: [],
                init: null,
                ast: a
            };
        } else if (a.kind === 'def_struct') {
            types[a.name] = {
                kind: 'struct',
                name: a.name,
                fields: [],
                functions: [],
                receivers: [],
                init: null,
                ast: a
            };
        }
    }

    function resolveTypeRef(src: ASTTypeRef): TypeRef {
        if (src.kind === 'type_ref_simple') {
            if (!types[src.name]) {
                throwError('Type ' + src.name + ' not found', src.ref);
            }
            return {
                kind: 'ref',
                name: src.name,
                optional: src.optional
            };
        }
        if (src.kind === 'type_ref_map') {
            if (!types[src.key]) {
                throwError('Type ' + src.key + ' not found', src.ref);
            }
            if (!types[src.value]) {
                throwError('Type ' + src.value + ' not found', src.ref);
            }
            return {
                kind: 'map',
                key: src.key,
                value: src.value
            };
        }

        throw Error('Unknown type ref');
    }

    function resolveFunctionDescriptor(self: TypeDescription | null, a: ASTFunction | ASTNativeFunction): FunctionDescription {

        // Resolve return
        let returns: TypeRef | null = null;
        if (a.return) {
            returns = resolveTypeRef(a.return);
        }

        // Resolve args
        let args: FunctionArgument[] = [];
        for (let r of a.args) {
            args.push({
                name: r.name,
                type: resolveTypeRef(r.type),
                as: null
            });
        }

        // Resolve flags
        let isPublic = a.attributes.some(a => a.type === 'public');
        let isGetter = a.attributes.some(a => a.type === 'get');
        let isMutating = a.attributes.some(a => a.type === 'mutates');
        if (a.kind === 'def_native_function') {
            if (isPublic) {
                throw throwError('Native functions cannot be public', a.ref);
            }
            if (isGetter) {
                throw throwError('Native functions cannot be getters', a.ref);
            }
        }

        // TODO: Validate
        // if (isMutating) {

        // }
        // if (isMutating && !!self) {
        //     throw throwError('Mutating functions must be defined as extensions', a.ref);
        // }
        // if (isMutating && args.length < 1) {
        //     throw throwError('Mutating functions must have a self argument', a.ref);
        // }
        // if (isMutating && !returns) {
        //     throw throwError('Mutating functions must have a return type', a.ref);
        // }
        

        // Register function
        return {
            name: a.name,
            self,
            args,
            returns,
            ast: a,
            isMutating,
            isPublic,
            isGetter
        };
    }

    function resolveInitFunction(a: ASTInitFunction): InitDescription {
        let args: FunctionArgument[] = [];
        for (let r of a.args) {
            args.push({
                name: r.name,
                type: resolveTypeRef(r.type),
                as: null
            });
        }
        return {
            args,
            ast: a
        }
    }

    // Resolve static functions
    for (let f in ctx.astFunctionStatic) {
        let a = ctx.astFunctionStatic[f];
        if (staticFunctions[a.name]) {
            throw Error('Function ' + a.name + ' already exists');
        }

        // Register function
        staticFunctions[a.name] = resolveFunctionDescriptor(null, a);
    }

    // Resolve fields
    function resolveField(src: ASTField, index: number): FieldDescription {
        return { name: src.name, type: resolveTypeRef(src.type), index, as: src.as, default: src.init };
    }
    for (let t in ctx.astTypes) {
        let a = ctx.astTypes[t];

        // Contract
        if (a.kind === 'def_contract') {
            for (const f of a.declarations) {
                if (f.kind !== 'def_field') {
                    continue;
                }
                if (types[a.name].fields.find((v) => v.name === f.name)) {
                    throw Error('Field ' + f.name + ' already exists');
                }
                types[a.name].fields.push(resolveField(f, types[a.name].fields.length));
            }
        }

        // Struct
        if (a.kind === 'def_struct') {
            for (let f of a.fields) {
                if (types[a.name].fields.find((v) => v.name === f.name)) {
                    throw Error('Field ' + f.name + ' already exists');
                }
                types[a.name].fields.push(resolveField(f, types[a.name].fields.length));
            }
        }
    }

    // Resolve contract functions
    for (let t in ctx.astTypes) {
        let a = ctx.astTypes[t];
        if (a.kind === 'def_contract') {
            let s = types[a.name];
            for (let d of a.declarations) {
                if (d.kind === 'def_function') {
                    s.functions.push(resolveFunctionDescriptor(s, d));
                }
                if (d.kind === 'def_init_function') {
                    if (s.init) {
                        throw Error('Init function already exists');
                    }
                    s.init = resolveInitFunction(d);
                }
                if (d.kind === 'def_receive') {
                    if (d.arg.type.kind !== 'type_ref_simple') {
                        throw Error('Receive function cannot accept optional argument');
                    }
                    if (d.arg.type.optional) {
                        throw Error('Receive function cannot accept optional argument');
                    }
                    let t = types[d.arg.type.name];
                    if (t.kind !== 'struct') {
                        throw Error('Receive function can only accept message');
                    }
                    if (t.ast.kind !== 'def_struct') {
                        throw Error('Receive function can only accept message');
                    }
                    if (!t.ast.message) {
                        throw Error('Receive function can only accept message');
                    }
                    s.receivers.push({
                        name: d.arg.name,
                        type: d.arg.type.name,
                        ast: d
                    });
                }
            }
        }
    }

    // Register types in context
    for (let t in types) {
        ctx = store.set(ctx, t, types[t]);
    }
    for (let t in staticFunctions) {
        ctx = staticFunctionsStore.set(ctx, t, staticFunctions[t]);
    }

    return ctx;
}

export function getType(ctx: CompilerContext, name: string): TypeDescription {
    let r = store.get(ctx, name);
    if (!r) {
        throw Error('Type ' + name + ' not found');
    }
    return r;
}

export function getAllTypes(ctx: CompilerContext) {
    return store.all(ctx);
}

export function getStaticFunction(ctx: CompilerContext, name: string): FunctionDescription {
    let r = staticFunctionsStore.get(ctx, name);
    if (!r) {
        throw Error('Static function ' + name + ' not found');
    }
    return r;
}

export function getAllStaticFunctions(ctx: CompilerContext) {
    return staticFunctionsStore.all(ctx);
}