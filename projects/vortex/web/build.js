'use strict';

const path = require('path');

module.exports = ({
  addStaticDir,
  outputDir,
}) => addStaticDir(
  path.join(__dirname, 'static'),
  outputDir,
);
