import {
    AstExpression,
    __DANGER_resetNodeId,
    cloneAstNode,
} from "../../grammar/ast";
import { parseExpression } from "../../grammar/grammar";
import {
    areEqualExpressions,
    extractValue,
    isValue,
    makeValueExpression,
} from "../../optimizer/util";
import { evalUnaryOp, partiallyEvalExpression } from "../../constEval";
import { CompilerContext } from "../../context";
import { ValueExpression } from "../../optimizer/types";

const additiveExpressions = [
    { original: "X + 3 + 1", simplified: "X + 4" },
    { original: "3 + X + 1", simplified: "X + 4" },
    { original: "1 + (X + 3)", simplified: "X + 4" },
    { original: "1 + (3 + X)", simplified: "4 + X" },

    // Should NOT simplify to X + 2, because X could be MAX - 2,
    // so that X + 3 causes an overflow, but X + 2 does not overflow
    { original: "X + 3 - 1", simplified: "X + 3 - 1" },
    { original: "3 + X - 1", simplified: "3 + X - 1" },

    // Should NOT simplify to X - 2, because X could be MIN + 2
    { original: "1 + (X - 3)", simplified: "1 + (X - 3)" },

    { original: "1 + (3 - X)", simplified: "4 - X" },

    { original: "X + 3 - (-1)", simplified: "X + 4" },
    { original: "3 + X - (-1)", simplified: "X + 4" },

    // Should NOT simplify, because the current rules require that - commutes,
    // which does not. This could be fixed in future rules.
    { original: "-1 + (X - 3)", simplified: "-1 + (X - 3)" },

    // Should NOT simplify to 2 - X, because X could be MIN + 3,
    // so that 3 - X = -MIN = MAX + 1 causes an overflow,
    // but 2 - X = -MIN - 1 = MAX does not
    { original: "-1 + (3 - X)", simplified: "-1 + (3 - X)" },

    // All the following cases should NOT simplify because -
    // does not associate on the left with - or +.
    // The following "associative rule" for - will be added in the future:
    // (x - c1) op c2 -----> x + (-c1 op c2), where op \in {-,+}
    { original: "1 - (X + 3)", simplified: "1 - (X + 3)" },
    { original: "1 - (3 + X)", simplified: "1 - (3 + X)" },
    { original: "1 - X + 3", simplified: "1 - X + 3" },
    { original: "X - 1 + 3", simplified: "X - 1 + 3" },
    { original: "1 - (X - 3)", simplified: "1 - (X - 3)" },
    { original: "1 - (3 - X)", simplified: "1 - (3 - X)" },
    { original: "1 - X - 3", simplified: "1 - X - 3" },
    { original: "X - 1 - 3", simplified: "X - 1 - 3" },
];

const multiplicativeExpressions = [
    { original: "X * 3 * 2", simplified: "X * 6" },
    { original: "3 * X * 2", simplified: "X * 6" },
    { original: "2 * (X * 3)", simplified: "X * 6" },
    { original: "2 * (3 * X)", simplified: "6 * X" },

    { original: "X * -3 * -2", simplified: "X * 6" },
    { original: "-3 * X * -2", simplified: "X * 6" },
    { original: "-2 * (X * -3)", simplified: "X * 6" },
    { original: "-2 * (-3 * X)", simplified: "6 * X" },

    // The following 4 cases should NOT simplify to X * 0.
    // the reason is that X could be MAX, so that X*3 causes
    // an overflow, but X*0 does not.
    { original: "X * 3 * 0", simplified: "X * 3 * 0" },
    { original: "3 * X * 0", simplified: "3 * X * 0" },
    { original: "0 * (X * 3)", simplified: "0 * (X * 3)" },
    { original: "0 * (3 * X)", simplified: "0 * (3 * X)" },

    { original: "X * 0 * 3", simplified: "X * 0" },
    { original: "0 * X * 3", simplified: "X * 0" },
    { original: "3 * (X * 0)", simplified: "X * 0" },
    { original: "3 * (0 * X)", simplified: "0 * X" },

    // This expression cannot be further simplified to X,
    // because X could be MIN, so that X * -1 causes an overflow
    { original: "X * -1 * 1 * -1", simplified: "X * -1 * -1" },

    // This expression could be further simplified to X * -1
    // but, currently, there are no rules that reduce three multiplied -1
    // to a single -1. This should be fixed in the future.
    { original: "X * -1 * 1 * -1 * -1", simplified: "X * -1 * -1 * -1" },

    // Even though, X * -1 * 1 * -1 cannot be simplified to X,
    // when we multiply with a number with absolute value bigger than 1,
    // we ensure that the overflows are preserved, so that we can simplify
    // the expression.
    { original: "X * -1 * 1 * -1 * 2", simplified: "X * 2" },

    // Should NOT simplify to X * 2, because X could be MIN/2 = -2^255,
    // so that X * -2 = 2^256 = MAX + 1 causes an overflow,
    // but X * 2 = -2^256 does not.
    { original: "X * -2 * -1", simplified: "X * -2 * -1" },

    // Note however that multiplying first by -1 allow us
    // to simplify the expression, because if X * -1 overflows,
    // X * 2 will also.
    { original: "X * -1 * -2", simplified: "X * 2" },
];

function testExpression(original: string, simplified: string) {
    expect(
        areEqualExpressions(
            partiallyEvalExpression(
                parseExpression(original),
                new CompilerContext(),
            ),
            unaryNegNodesToNumbers(parseExpression(simplified)),
        ),
    ).toBe(true);
}

// Evaluates UnaryOp nodes with operator - into a single a node having a value.
// The reason for doing this is that the partial evaluator will transform negative
// numbers in an expression, e.g., "-1" into a tree with a single node with value -1, so that
// when comparing the tree with those produced by the parser, the two trees
// do not match, because the parser will produce a UnaryOp node with a child node with value 1.
// This is so because Tact does not have a way to write negative literals, but indirectly trough
// the use of the unary - operator.
function unaryNegNodesToNumbers(ast: AstExpression): AstExpression {
    let newNode: AstExpression;
    switch (ast.kind) {
        case "null":
            return ast;
        case "boolean":
            return ast;
        case "number":
            return ast;
        case "string":
            return ast;
        case "id":
            return ast;
        case "method_call":
            newNode = cloneAstNode(ast);
            newNode.args = ast.args.map(unaryNegNodesToNumbers);
            newNode.self = unaryNegNodesToNumbers(ast.self);
            return newNode;
        case "init_of":
            newNode = cloneAstNode(ast);
            newNode.args = ast.args.map(unaryNegNodesToNumbers);
            return newNode;
        case "op_unary":
            if (ast.op === "-") {
                if (isValue(ast.operand)) {
                    return makeValueExpression(
                        evalUnaryOp(
                            ast.op,
                            extractValue(ast.operand as ValueExpression),
                        ),
                    );
                }
            }
            newNode = cloneAstNode(ast);
            newNode.operand = unaryNegNodesToNumbers(ast.operand);
            return newNode;
        case "op_binary":
            newNode = cloneAstNode(ast);
            newNode.left = unaryNegNodesToNumbers(ast.left);
            newNode.right = unaryNegNodesToNumbers(ast.right);
            return newNode;
        case "conditional":
            newNode = cloneAstNode(ast);
            newNode.thenBranch = unaryNegNodesToNumbers(ast.thenBranch);
            newNode.elseBranch = unaryNegNodesToNumbers(ast.elseBranch);
            return newNode;
        case "struct_instance":
            newNode = cloneAstNode(ast);
            newNode.args = ast.args.map((param) => {
                const newParam = cloneAstNode(param);
                newParam.initializer = unaryNegNodesToNumbers(
                    param.initializer,
                );
                return newParam;
            });
            return newNode;
        case "field_access":
            newNode = cloneAstNode(ast);
            newNode.aggregate = unaryNegNodesToNumbers(ast.aggregate);
            return newNode;
        case "static_call":
            newNode = cloneAstNode(ast);
            newNode.args = ast.args.map(unaryNegNodesToNumbers);
            return newNode;
    }
}

describe("partial-evaluator", () => {
    beforeEach(() => {
        __DANGER_resetNodeId();
    });
    it("should correctly simplify partial expressions involving + and -", () => {
        additiveExpressions.forEach((pair) => {
            testExpression(pair.original, pair.simplified);
        });
    });
    it("should correctly simplify partial expressions involving *", () => {
        multiplicativeExpressions.forEach((pair) => {
            testExpression(pair.original, pair.simplified);
        });
    });
});
