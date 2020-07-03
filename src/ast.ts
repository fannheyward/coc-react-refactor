import { parse, ParserOptions } from '@babel/parser';
import { transformFromAst } from '@babel/core';
import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import template from '@babel/template';

export const parsingOptions = {
  plugins: ['objectRestSpread', 'classProperties', 'typescript', 'jsx'],
  sourceType: 'module',
};

export const codeToAst = (code: string) =>
  parse(code, <ParserOptions>{
    startLine: 0,
    ...parsingOptions,
  });

export const jsxToAst = (code: string) => {
  try {
    return templateToAst(code);
  } catch (e) {
    return false;
  }
};

export const templateToAst = (code: string) => template.ast(code, parsingOptions);

export const isJSX = (code: string) => {
  const ast = jsxToAst(code);
  return ast && ast.expression && t.isJSX(ast.expression);
};

export const astToCode = (ast) => transformFromAst(ast).code;

export const codeFromNode = (node) => {
  const body = [t.expressionStatement(node)];
  const ast = t.file(t.program(body), null, null);
  return astToCode(ast).slice(0, -1);
};

export const isOuterMemberExpression = (path) =>
  path.isMemberExpression() &&
  !isArrayFunctionCall(path) &&
  (!path.parentPath.isMemberExpression() || isArrayFunctionCall(path.parentPath));

export const findOuterMemberExpression = (path) => path.findParent(isOuterMemberExpression) || path;

export const isArrayFunctionCall = (path) =>
  path.key === 'callee' && ['map', 'filter', 'reduce'].indexOf(path.node.property.name) > -1;

export const isFunctionBinding = (path) => path.key === 'callee' && path.node.property.name === 'bind';

export const isPathInRange = (start: number, end: number) => (path: NodePath) =>
  path.node.start >= start && path.node.end <= end;

export const isClassMemberExpression = ({ node }) =>
  t.isMemberExpression(node) && (t.isThisExpression(node.object) || isClassMemberExpression({ node: node.object }));

export const isPathRemoved = (path) => (path.findParent((path) => path.removed) ? true : false);

export const getReferencePaths = (scope, node) => {
  const bindings = scope.bindings[node.name];
  if (bindings && bindings.referencePaths) {
    return bindings.referencePaths;
  }
  return [];
};

export const getVariableReferences = (scope, declaration) => {
  const refs: any[] = [];
  if (t.isIdentifier(declaration)) {
    getReferencePaths(scope, declaration).forEach((path) => {
      if (path.node !== declaration) {
        refs.push(findOuterMemberExpression(path));
      }
    });
  } else {
    let nodes;

    if (t.isObjectPattern(declaration)) {
      nodes = declaration.properties.map((property: any) =>
        t.isRestElement(property) ? property.argument : property.value
      );
    } else if (t.isArrayPattern(declaration)) {
      nodes = declaration.elements.map((id: any) => (t.isRestElement(id) ? id.argument : id));
    }
    if (nodes) {
      nodes.forEach((node) => {
        getReferencePaths(scope, node).forEach((path) => {
          if (path.node !== node) {
            refs.push(findOuterMemberExpression(path));
          }
        });
      });
    }
  }
  return refs;
};

/**
 * Find block scoped references for component members
 * @param componentPath
 * @param targetPath
 */
export const findComponentMemberReferences = (componentPath, targetPath) => {
  let paths: any[] = [];

  const path = targetPath || componentPath;

  if (componentPath.isClassDeclaration()) {
    path.traverse({
      MemberExpression(path) {
        if (isClassMemberExpression(path) && isOuterMemberExpression(path)) {
          paths.push(path);
        }
      },
    });
  } else if (t.isArrowFunctionExpression(componentPath.node.init) && componentPath.node.init.params[0]) {
    paths = paths.concat(getVariableReferences(componentPath.scope, componentPath.node.init.params[0]));
  } else if (t.isFunctionDeclaration(componentPath.node) && componentPath.node.params[0]) {
    paths = paths.concat(getVariableReferences(componentPath.scope, componentPath.node.params[0]));
  }

  walkParents(
    path,
    (parentPath: NodePath) => parentPath.isBlockStatement(),
    (parentPath: NodePath) => {
      parentPath.traverse({
        VariableDeclaration(path) {
          path.node.declarations.forEach((declaration) => {
            paths = paths.concat(getVariableReferences(parentPath.scope, declaration.id));
          });
        },
      });
    }
  );
  walkParents(
    path,
    (parentPath: NodePath) => parentPath.isArrowFunctionExpression(),
    (parentPath: NodePath) => {
      parentPath.node.params.forEach((param) => {
        paths = paths.concat(getVariableReferences(parentPath.scope, param));
      });
    }
  );

  return paths;
};

export const walkParents = (path: NodePath, condition, callback) => {
  const parentPath = path.findParent(condition);
  if (parentPath) {
    callback(parentPath);
    walkParents(parentPath, condition, callback);
  }
};
