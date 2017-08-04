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
    const buildScriptPath = path.join(projectPath, 'build.js');
    const projectOutputDir = path.join(outputDir, projectRelDest);

    await mkdirp(projectOutputDir);

    const projectBuild = await (async () => {
      const exists = await fs.stat(buildScriptPath)
        .then(() => true)
        .catch((err) => {
          if (err.code === 'ENOENT') {
            return false;
          }

          throw err;
        })
      ;

      if (!exists) {
        return null;
      }

      return require(path.join(projectPath, 'build.js'));
    })();

    if (!projectBuild) {
      await addStaticDir(path.join(projectPath, 'static'), projectOutputDir);
      return;
    }

    await projectBuild({
      addStaticDir,
      outputDir: projectOutputDir,
      projectRoot: (() => {
        const candidate = path.join(projectRoot, projectRelDest).replace(/^.\//, '/');
        return candidate === '.' ? '/' : candidate;
      })(),
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
