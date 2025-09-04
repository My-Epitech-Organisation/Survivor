// This file contains eslint overrides for specific cases where the default rules don't apply
module.exports = {
  overrides: [
    {
      files: ['components/pdf/**/*.tsx'],
      rules: {
        'jsx-a11y/alt-text': 'off'
      }
    }
  ]
};
