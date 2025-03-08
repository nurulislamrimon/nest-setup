import { uploadDir } from 'src/constants';
import { createFolderIfNotExist } from './file.utils';

export const seedData = () => {
  createFolderIfNotExist(uploadDir);
};
