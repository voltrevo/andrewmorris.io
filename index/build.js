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
    const projectJson = await fs.readFile(
      path.join(projectsDir, projectName, 'web', 'project.json'),
    ).catch((err) => {
      if (err.code === 'ENOENT') {
        return '{}';
      }

      throw err;
    });

    projects[projectName] = JSON.parse(projectJson);
  }));

  const highlightedProjects = ['vortex', 'mandelbrot', 'battleblender'].reverse();

  const projectEntries = (Object
    .entries(projects)
    .sort(([leftName], [rightName]) => {
      const hl = highlightedProjects.indexOf(leftName);
      const hr = highlightedProjects.indexOf(rightName);

      if (hl !== hr) {
        return hr - hl;
      }

      return leftName < rightName ? -1 : 1;
    })
  );

  console.log(projectEntries);

  const renderedIndex = await ejsRenderFile(
    path.join(__dirname, 'index.ejs'),
    { projectEntries, projectRoot, require },
  );

  await fs.writeFile(path.join(outputDir, 'index.html'), renderedIndex);
};
