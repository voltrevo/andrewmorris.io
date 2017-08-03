'use strict';

const path = require('path');
const { promisify } = require('util');

const ejs = require('ejs');
const fs = require('mz/fs');

const ejsRenderFile = promisify(ejs.renderFile.bind(ejs));

module.exports = async ({
  addStaticDir,
  outputDir,
  projectRoot,
}) => {
  await addStaticDir(path.join(__dirname, 'static'), outputDir);

  const projects = await fs.readdir(path.join(__dirname, '..', 'projects'));

  const renderedIndex = await ejsRenderFile(
    path.join(__dirname, 'index.ejs'),
    { projects, projectRoot },
  );

  await fs.writeFile(path.join(outputDir, 'index.html'), renderedIndex);
};
