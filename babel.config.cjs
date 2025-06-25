module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '22',
        },
        modules: 'auto', // Let babel handle module transformation
      },
    ],
  ],
};
