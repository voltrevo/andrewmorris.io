'use strict';

const fs = require('mz/fs');

(async () => {
  const projects = await fs.readdir('./projects');

  console.log(projects);
})()
  .catch(err => console.error(err))
;
