import * as fs from 'fs';
import * as path from 'path';
import { diskStorage } from 'multer';

export const createFolderIfNotExist = (path: string) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
};

export const storage = (destination: string) =>
  diskStorage({
    destination: (req, file, cb) => {
      const folderPath = path.join(process.cwd(), 'public', destination);
      createFolderIfNotExist(folderPath);
      cb(null, folderPath);
    },
    filename: (req, file, callback) => {
      const fileExt = path.extname(file.originalname);
      const fileName =
        file.originalname
          .replace(fileExt, '')
          .toLowerCase()
          .split(' ')
          .join('-') +
        Date.now() +
        fileExt;
      callback(null, fileName);
    },
  });
