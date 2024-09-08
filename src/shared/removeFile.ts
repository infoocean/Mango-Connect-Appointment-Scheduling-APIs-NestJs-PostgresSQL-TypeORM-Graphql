import * as fs from 'fs';

async function deleteFileAsync(relativeFilePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.unlink(relativeFilePath, (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          resolve();
        } else {
          reject(err);
        }
      } else {
        resolve();
      }
    });
  });
}

export { deleteFileAsync };
