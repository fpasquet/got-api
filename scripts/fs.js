const fs = require("fs");
const path = require("path");

/**
 * make directory recursively. Sync version
 *
 * @function mkdirSyncRecursive
 * @param {String} root - absolute root where append chunks
 * @param {Array} chunks - directories chunks
 * @param {Number} mode - directories mode, see Node documentation
 * @return [{Object}]
 */
const mkdirSyncRecursive = (root, chunks, mode) => {
  const chunk = chunks.shift();
  if (!chunk) {
    return;
  }

  root = path.join(root, chunk);

  if (fs.existsSync(root) === true) {
    return mkdirSyncRecursive(root, chunks, mode);
  }
  const err = fs.mkdirSync(root, mode);
  return err ? err : mkdirSyncRecursive(root, chunks, mode);
};

/**
 * makeSync main. Check README.md
 *
 * @exports mkdirSync
 * @function mkdirSync
 * @param {String} root - pathname
 * @param {Number} mode - directories mode, see Node documentation
 * @return [{Object}]
 */
const mkdirSync = (root, mode) => {
  if (typeof root !== "string") {
    throw new Error("missing root");
  }

  const chunks = root.split(path.sep); // split in chunks
  let chunk;
  if (path.isAbsolute(root) === true) {
    // build from absolute path
    chunk = chunks.shift(); // remove "/" or C:/
    if (!chunk) {
      // add "/"
      chunk = path.sep;
    }
  } else {
    chunk = path.resolve(); // build with relative path
  }

  return mkdirSyncRecursive(chunk, chunks, mode);
};
module.exports.mkdirSync = mkdirSync;
