// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

// Issue #158: migración de tslint a ESLint (@angular-eslint 19).
// Baseline pragmático para un código legado: se desactivan las reglas que chocan con
// decisiones deliberadas del proyecto (tipos `any` por diseño, NgModule con
// `standalone: false`, constructores/handlers vacíos, selectores heredados sin prefijo)
// y se dejan en `warn` las potencialmente útiles (variables sin usar, ciclos de vida).
// Se pueden ir endureciendo de forma incremental en el futuro.
module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      // Estilo deliberado del proyecto: desactivadas.
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/consistent-type-assertions": "off",
      "@typescript-eslint/consistent-generic-constructors": "off",
      "@typescript-eslint/consistent-indexed-object-style": "off",
      "@typescript-eslint/class-literal-property-style": "off",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/prefer-for-of": "off",
      "@typescript-eslint/no-this-alias": "off",
      // El proyecto usa NgModule clásico (standalone: false) a propósito.
      "@angular-eslint/prefer-standalone": "off",
      // Selectores heredados sin prefijo uniforme (selector-*, app-*): no renombrar ahora.
      "@angular-eslint/component-selector": "off",
      "@angular-eslint/directive-selector": "off",
      // Patrón usado en todo el código (new Promise(async ...)): no bloquear.
      "no-async-promise-executor": "off",
      // Útiles pero no bloqueantes: quedan como avisos.
      "no-empty": "warn",
      "@angular-eslint/contextual-lifecycle": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
      "@angular-eslint/use-lifecycle-interface": "warn",
      "@angular-eslint/no-empty-lifecycle-method": "warn",
      "@angular-eslint/component-class-suffix": "warn",
      "@angular-eslint/no-outputs-metadata-property": "warn",
      "@angular-eslint/no-inputs-metadata-property": "warn",
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
    ],
    rules: {
      // El código usa `==` en plantillas de forma generalizada: aviso, no error.
      "@angular-eslint/template/eqeqeq": "warn",
    },
  }
);
