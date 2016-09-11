import {TranslationUnit, FunctionDefinition, Object, PrimitiveType, Declaration, PrimaryExpression,
    AdditionExpression, ReturnStatement} from '../c/dom';
import {Codegen} from "../codegen";


// void main() {
//     int a = 100;
//     int b = 200;
//     int c = 300;
//     return a + (b + c);
// }


var unit = new TranslationUnit();
var main = new FunctionDefinition('main');
unit.add(main);


var a = new Object(PrimitiveType.int(), 100);
main.body.push(new Declaration(a));

var b = new Object(PrimitiveType.int(), 200);
main.body.push(new Declaration(b));

var c = new Object(PrimitiveType.int(), 300);
main.body.push(new Declaration(c));


var expr1 = new AdditionExpression(PrimaryExpression.create(b), PrimaryExpression.create(c));
var expr2 = new AdditionExpression(PrimaryExpression.create(a), expr1);
main.body.push(new ReturnStatement(expr2));


console.dir(unit, {depth: 20, colors: true});

var codegen = new Codegen;
var bin = codegen.translate(unit);
