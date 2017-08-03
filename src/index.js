'use strict';

/* eslint-disable global-require, import/no-dynamic-require */

const path = require('path');
const { promisify } = require('util');

const fs = require('mz/fs');
const mkdirp = promisify(require('mkdirp'));
const rimraf = promisify(require('rimraf'));

const build = async ({
  outputDir,
  projectRoot,
  addStaticDir = require('./addStaticDir.js'),
}) => {
  await rimraf(outputDir);
  await fs.mkdir(outputDir);

  const buildProject = async ({ projectPath, projectRelDest }) => {
    const projectBuild = require(path.join(projectPath, 'build.js'));
    const projectOutputDir = path.join(outputDir, projectRelDest);

    await mkdirp(projectOutputDir);

    return projectBuild({
      addStaticDir,
      outputDir: projectOutputDir,
      projectRoot: path.join(projectRoot, projectRelDest),
    });
  };

  await buildProject({
    projectPath: path.join(__dirname, '..', 'index'),
    projectRelDest: '',
  });

  const projectsDir = path.join(__dirname, '..', 'projects');
  const projects = await fs.readdir(projectsDir);

  return Promise.all(projects.map(
    project => buildProject({
      projectPath: path.join(projectsDir, project, 'web'),
      projectRelDest: project,
    }),
  ));
};

build({
  outputDir: path.join(__dirname, '..', 'build'),
  projectRoot: '',
})
  .then(() => console.log('build finished'))
  .catch(err => console.error(err))
;
