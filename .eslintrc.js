/* eslint-disable indent */
module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es2021: true,
        jest: true,
    },
    extends: 'airbnb-base',
    parserOptions: {
        ecmaVersion: 12,
    },
    rules: {
        'linebreak-style': 'off',
        'no-console': 'off',
        'no-underscore-dangle': 'off',
        'class-methods-use-this': 'off',
        indent: ['error', 2],
    },
};
