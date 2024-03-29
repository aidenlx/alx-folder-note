/**
 * Custom config base for projects using typescript / javascript.
 * @see https://github.com/belgattitude/nextjs-monorepo-example/tree/main/packages/eslint-config-bases
 */

module.exports = {
  env: {
    es6: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
      globalReturn: false,
    },
    ecmaVersion: "2022",
    project: ["tsconfig.json"],
    sourceType: "module",
  },
  settings: {
    "import/resolver": {
      typescript: {},
    },
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
  ],
  plugins: ["prefer-arrow", "simple-import-sort"],
  rules: {
    "spaced-comment": [
      "error",
      "always",
      {
        line: {
          markers: ["/"],
          exceptions: ["-", "+"],
        },
        block: {
          markers: ["!"],
          exceptions: ["*"],
          balanced: true,
        },
      },
    ],
    "linebreak-style": ["error", "unix"],
    "no-empty-function": "off",
    "import/default": "off",
    "import/no-duplicates": ["error", { considerQueryString: true }],
    "import/no-unresolved": "off",
    "import/no-named-as-default-member": "off",
    "import/no-named-as-default": "off",
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
          "object",
        ],
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],
    "@typescript-eslint/ban-tslint-comment": ["error"],
    "@typescript-eslint/ban-ts-comment": [
      "error",
      {
        "ts-expect-error": "allow-with-description",
        minimumDescriptionLength: 10,
        "ts-ignore": false,
        "ts-nocheck": true,
        "ts-check": false,
      },
    ],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-empty-function": [
      "error",
      { allow: ["private-constructors"] },
    ],
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        ignoreRestSiblings: true,
        destructuredArrayIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/consistent-type-exports": "error",
    "@typescript-eslint/consistent-type-imports": [
      "error",
      { prefer: "type-imports" },
    ],
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: "default",
        format: ["camelCase"],
        leadingUnderscore: "forbid",
        trailingUnderscore: "forbid",
      },
      {
        selector: "variable",
        format: ["camelCase", "UPPER_CASE", "snake_case"],
        leadingUnderscore: "allow",
      },
      {
        selector: ["function"],
        format: ["camelCase"],
      },
      {
        selector: "parameter",
        format: ["camelCase", "snake_case"],
        leadingUnderscore: "allow",
      },
      {
        selector: "class",
        format: ["PascalCase"],
      },
      {
        selector: "classProperty",
        format: ["camelCase"],
        leadingUnderscore: "allow",
      },
      {
        selector: "objectLiteralProperty",
        format: [
          "camelCase",
          // Some external libraries use snake_case for params
          "snake_case",
          // Env variables are generally uppercase
          "UPPER_CASE",
          // DB / Graphql might use PascalCase for relationships
          "PascalCase",
        ],
        leadingUnderscore: "allowSingleOrDouble",
        trailingUnderscore: "allowSingleOrDouble",
      },
      {
        selector: ["typeAlias", "interface"],
        format: ["PascalCase"],
      },
      {
        selector: ["typeProperty"],
        format: ["camelCase", "UPPER_CASE"],
        // For graphql __typename
        leadingUnderscore: "allowDouble",
      },
      {
        selector: ["typeParameter"],
        format: ["PascalCase"],
      },
      {
        selector: ["enum"],
        format: ["PascalCase"],
      },
    ],
  },
  overrides: [
    {
      // commonjs or assumed
      files: ["*.js", "*.cjs", "*.mjs"],
      parser: "espree",
      parserOptions: {
        ecmaVersion: 2020,
      },
      rules: {
        "@typescript-eslint/naming-convention": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/consistent-type-exports": "off",
        "@typescript-eslint/consistent-type-imports": "off",
        "import/order": "off",
      },
    },
  ],
};
