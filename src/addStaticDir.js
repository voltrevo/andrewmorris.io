'use strict';

const { promisify } = require('util');

const fs = require('mz/fs');
const ncp = promisify(require('ncp'));

module.exports = async (srcDir, dstDir) => {
  const [srcList, dstList] = await Promise.all(
    [srcDir, dstDir].map(dir => fs.readdir(dir)),
  );

  const combinedList = [...srcList, ...dstList].sort();

  for (let i = 0; i < combinedList.length - 1; i++) {
    if (combinedList[i] === combinedList[i + 1]) {
      throw new Error(
        `static content clash, dirs: ${srcList}, ${dstList}, ` +
        `file: ${combinedList[i]}`,
      );
    }
  }

  await ncp(srcDir, dstDir);
};
