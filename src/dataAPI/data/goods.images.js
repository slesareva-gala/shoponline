import { access, writeFile, mkdir, readdir, rm } from 'node:fs/promises';

const DIR_IMAGES = process.env.DIR_IMAGES || './images';

const readDirByIds = async (path, ids) => {
  try {
    const list = (await readdir(path)).filter(file =>
      ids.some(id => file.includes(id)),
    );
    return list;
  } catch {
    return null;
  }
};

const deleteListFiles = async (path, list) => {
  try {
    for (let file of list) {
      await rm(`${path}/${file}`);
    }
    return true;
  } catch {
    return null;
  }
};

const checkFile = async filepath => {
  try {
    await access(filepath);
    return true;
  } catch {
    return false;
  }
};

const createDir = async dir => {
  try {
    await mkdir(dir);
    return true;
  } catch {
    return false;
  }
};

const accessDir = async dir => {
  if (await checkFile(dir)) return true;
  return await createDir(dir);
};

export const uploadImage64 = async routing => {
  if (!(await accessDir(DIR_IMAGES))) {
    routing.logger.log(`uploadImage64: ${`нет доступа к папке ${DIR_IMAGES}`}`);
    return false;
  }

  try {
    const pathfile = `${DIR_IMAGES}/${routing.body.image.split('/')[1]}`;
    const value = routing.body.imageBase64.value;

    await writeFile(pathfile, value, {
      encoding: 'base64',
    });
    return true;
  } catch (e) {
    return false;
  }
};

export const deleteImages = async routing => {
  if (!(await accessDir(DIR_IMAGES))) {
    routing.logger.log(`deleteImages: ${`нет доступа к папке ${DIR_IMAGES}`}`);
    return false;
  }

  try {
    const list = await readDirByIds(DIR_IMAGES, routing.params.idGoods);
    if (list === null) {
      return false;
    }
    if (!(await deleteListFiles(DIR_IMAGES, list))) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
};
