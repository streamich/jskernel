import {
    TranslationUnit, FunctionDefinition, Object, PrimitiveType, Declaration, PrimaryExpression,
    AdditionExpression, ReturnStatement, Variable, IfStatement, PrimaryExpressionVariable, SimpleAssignmentExpression,
    PrimaryExpressionConstant, ExpressionStatement
} from '../c/dom';
import {TranslatorDomToTacUnit} from '../translator';
import * as codegen from '../x64/codegen-basic';


// void main() {
//     int a = 100;
//     int b = 200;
//     int c = 300;
//     return a + (b + c);
// }


var unit = new TranslationUnit();
var main = new FunctionDefinition('main');
unit.add(main);


var a = new Variable(PrimitiveType.int(), 100, 'a');
main.body.push(new Declaration(a));

// var b = new Variable(PrimitiveType.int(), 200, 'b');
// main.body.addStatement(new Declaration(b));

// var c = new Variable(PrimitiveType.int(), 300, 'c');
// main.body.addStatement(new Declaration(c));

var ifExpr = new PrimaryExpressionVariable(a);
var ifSt = new IfStatement(ifExpr);
var bExpr = new SimpleAssignmentExpression(new PrimaryExpressionVariable(a), new PrimaryExpressionConstant(25));
ifSt.trueBlock.push(new ExpressionStatement(bExpr));
main.body.push(ifSt);


// var expr1 = new AdditionExpression(PrimaryExpression.create(b), PrimaryExpression.create(c));
// var expr2 = new AdditionExpression(PrimaryExpression.create(a), expr1);
// main.body.addStatement(new ReturnStatement(expr2));


console.log(unit.toString());
// console.dir(unit, {depth: 20, colors: true});
var domToTac = new TranslatorDomToTacUnit();
var tac = domToTac.translate(unit);
// console.dir(domToTac.tac, {depth: 20, colors: true});
console.log(tac.toString());

var generator = new codegen.BasicUnitCodegen(tac);
generator.translate();
generator.mc.compile();
console.log(generator.mc.toString());
