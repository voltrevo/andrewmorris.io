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

  const projectsDir = path.join(__dirname, '..', 'projects');
  const projectList = await fs.readdir(projectsDir);

  const projects = {};

  await Promise.all(projectList.map(async (projectName) => {
    let projectJson = '{}';

    projectJson = (await fs.readFile(
      path.join(projectsDir, projectName, 'web', 'project.json'),
    )).catch((err) => {
      if (err.code === 'ENOENT') {
        // this is ok
      } else {
        throw err;
      }
    });

    projects[projectName] = JSON.parse(projectJson);
  }));

  const renderedIndex = await ejsRenderFile(
    path.join(__dirname, 'index.ejs'),
    { projects, projectRoot, require },
  );

  await fs.writeFile(path.join(outputDir, 'index.html'), renderedIndex);
};
