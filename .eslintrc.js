const typescriptOptions = {
  tsconfigRootDir: __dirname,
  project: "tsconfig.json",
};

/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  extends: ["prettier", "./.eslintrc.typescript.js"],
  plugins: ["prettier"],
  root: true,
  parserOptions: {
    ...typescriptOptions,
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "prettier/prettier": "error",
    "arrow-body-style": "off",
    "prefer-arrow-callback": "off",
    "import/no-unresolved": [2, { ignore: [".less$"] }],
  },
  settings: {
    "import/resolver": {
      typescript: typescriptOptions,
    },
  },
};
