module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es2021: true,
        node: true,
    },
    extends: ["eslint:recommended", "prettier"],
    overrides: [],
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
    },
    rules: {},
};
