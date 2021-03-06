module.exports = {
  "parser": "babel-eslint",
  "parserOptions": {
    "ecmaVersion": 6,
    "sourceType": "module",
    "allowImportExportEverywhere": true
  },
  "plugins": [
    "import",
    "meteor"
  ],
  "extends": [
    "airbnb",
    "plugin:meteor/recommended"
  ],
  "env": {
    "browser": true,
    "es6": true,
    "mocha": true,
    "meteor": true,
    "node": true,
  },
  "rules": {
    'import/extensions': 0,
    'import/no-unresolved' : 0,
    'import/no-extraneous-dependencies': 0,
    "no-underscore-dangle": [2, { "allow": [ '_id'] }]
  },
  "settings": {
    "import/resolver": "meteor"
  }
};