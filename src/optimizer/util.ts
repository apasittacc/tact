import {
    ASTExpression,
    ASTUnaryOperation,
    ASTBinaryOperation,
    createNode
} from "../grammar/ast";
import { Value } from "../types/types";
import { DUMMY_LOCATION, ValueExpression } from "./types";

export function isValue(ast: ASTExpression): boolean {
    switch (ast.kind) { // Missing structs
        case "null":
        case "boolean":
        case "number":
        case "string":
            return true;

        case "id":
        case "op_call":
        case "init_of":
        case "op_unary":
        case "op_binary":
        case "conditional":
        case "op_new":
        case "op_field":
        case "op_static_call":
            return false;
    }
}

export function extractValue(ast: ValueExpression): Value {
    switch (ast.kind) { // Missing structs
        case "null":
            return null;
        case "boolean":
            return ast.value;
        case "number":
            return ast.value;
        case "string":
            return ast.value;
    }
}

export function makeValueExpression(value: Value): ValueExpression {
    if (value === null) {
        const result = createNode({
            kind: "null",
            loc: DUMMY_LOCATION
        });
        return result as ValueExpression;
    }
    if (typeof value === "string") {
        const result = createNode({
            kind: "string",
            value: value,
            loc: DUMMY_LOCATION
        });
        return result as ValueExpression;
    }
    if (typeof value === "bigint") {
        const result = createNode({
            kind: "number",
            value: value,
            loc: DUMMY_LOCATION
        });
        return result as ValueExpression;
    }
    if (typeof value === "boolean") {
        const result = createNode({
            kind: "boolean",
            value: value,
            loc: DUMMY_LOCATION
        });
        return result as ValueExpression;
    }
    throw `Unsupported value ${value}`;
}


export function makeUnaryExpression(op: ASTUnaryOperation, operand: ASTExpression): ASTExpression {
    const result = createNode({
        kind: "op_unary",
        op: op,
        right: operand,
        loc: DUMMY_LOCATION
    });
    return result as ASTExpression;
}

export function makeBinaryExpression(op: ASTBinaryOperation, left: ASTExpression, right: ASTExpression): ASTExpression {
    const result = createNode({
        kind: "op_binary",
        op: op,
        left: left,
        right: right,
        loc: DUMMY_LOCATION
    });
    return result as ASTExpression;
}

// Checks if the top level node is a binary op node
export function checkIsBinaryOpNode(ast: ASTExpression): boolean {
    return (ast.kind === "op_binary");
}

// Checks if top level node is a binary op node
// with a non-value node on the left and
// value node on the right
export function checkIsBinaryOp_NonValue_Value(ast: ASTExpression): boolean {
    if (ast.kind === "op_binary") {
        return (!isValue(ast.left) && isValue(ast.right))
    } else {
        return false;
    }
}

// Checks if top level node is a binary op node
// with a value node on the left and
// non-value node on the right
export function checkIsBinaryOp_Value_NonValue(ast: ASTExpression): boolean {
    if (ast.kind === "op_binary") {
        return (isValue(ast.left) && !isValue(ast.right))
    } else {
        return false;
    }
}

// bigint arithmetic

// precondition: the divisor is not zero
// rounds the division result towards negative infinity
export function divFloor(a: bigint, b: bigint): bigint {
    const almostSameSign = a > 0n === b > 0n;
    if (almostSameSign) {
        return a / b;
    }
    return a / b + (a % b === 0n ? 0n : -1n);
}

export function abs(a: bigint): bigint {
    return a < 0n ? -a : a;
}

export function sign(a: bigint): bigint {
    if (a === 0n) 
        return 0n;
    else 
        return a < 0n ? -1n : 1n;
}

// precondition: the divisor is not zero
// rounds the result towards negative infinity
// Uses the fact that a / b * b + a % b == a, for all b != 0.
export function modFloor(a: bigint, b: bigint): bigint {
    return a - divFloor(a, b) * b;
}