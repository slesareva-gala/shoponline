import {
  appendFile,
  readFile,
  writeFile,
  stat,
  copyFile,
  truncate,
} from 'node:fs/promises';
import { EventEmitter } from 'node:events';

export class Logger extends EventEmitter {
  constructor(filename, maxSize) {
    super();
    this.filename = filename || 'text.log';
    this.maxSize = maxSize || 1024;
    this.logQueue = [];
    this.writing = false;
  }

  log(message) {
    this.logQueue.push(message);
    if (!this.writing) {
      this.writing = true;
      this.writeLog();
    }
  }

  async writeLog() {
    try {
      const message = this.logQueue.shift();
      if (!message) {
        this.writing = false;
        return;
      }
      await appendFile(this.filename, '', 'utf-8');
      const linesText = (await readFile(this.filename)).toString().split('\n');
      const content = [
        `${new Date(Date.now()).toLocaleDateString()} ${message}`,
        ...linesText,
      ].join('\n');
      await writeFile(this.filename, content, 'utf-8');
      this.emit('messageLogged', message);
      await this.checkFileSize();

      this.writeLog();
    } catch (err) {
      return `Ошибка: ${err.message}`;
    }
  }

  async getFileSize() {
    try {
      return (await stat(this.filename)).size;
    } catch (e) {
      return 0;
    }
  }

  async checkFileSize() {
    try {
      const size = await this.getFileSize();
      if (size > this.maxSize) {
        await this.rotateLog();
      }
    } catch (e) {
      throw new Error(e);
    }
  }

  async rotateLog() {
    try {
      const fileBak = this.filename.replace(/\..*/, '') + Date.now() + '.bar';
      await copyFile(this.filename, fileBak);
      await truncate(this.filename, 0);
    } catch (e) {
      throw new Error(e);
    }
  }
}
