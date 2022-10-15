const fs = require('fs');
const path = require('path');

class Database {
  constructor(baseUrl) {
    this._baseUrl = baseUrl;

    fs.mkdir(baseUrl, err => {
      if (err) {
        return
      }
    })
  }

  #getFilePath(name) {
    return path.join(this._baseUrl, name.includes('.json') ? name : `${name}.json`)
  }

  async #getAllFileInDir(fileNames = []) {
    return await new Promise(res => {
      let fileMerge = fileNames.map(fileName => new Promise(res => fs.readFile(path.join(this.#getFilePath(fileName)), 'utf-8', (err, data) => {
        if (err) console.error(err.message)

        if (data) {
          res(JSON.parse(data))
        }

      })));

      if (!fileMerge[0]) {
        res([])
      }

      res(Promise.all(fileMerge))
    })
  }

  async readDir() {
    const files = await new Promise(res => fs.readdir(this._baseUrl, (err, files) => {
      if (err) console.error(err.message);
      res(files)
    }))

    const data = this.#getAllFileInDir(files);

    return data;
  }

  async _searchData(name = '') {
    // Search data about name
    return await new Promise(res => fs.readdir(this._baseUrl, (err, files) => err ? console.error(err) : res(files)))
    .then(files => files.map(file => file.slice(0, file.length - 5)))
    .then(files => files.filter(file => file === name));
  }

  async saveData(name = '', data = {}) {
    const searchData = await this._searchData(name);

    if (!searchData.length) {

      // Append file in database
      fs.appendFile(path.join(this.#getFilePath(name)), JSON.stringify(data), err => {
        if (err) console.log(err.message);
      })
    }
  }

  async changeFile(name = '', data = {}) {
    return await new Promise(res => fs.writeFile(this.#getFilePath(name), JSON.stringify(data), err => {
      if (err) return console.error(err.message);
      res()
    }))
  }

  async deleteFile(name = '') {
    return await new Promise(res => fs.rm(this.#getFilePath(name), err => {
      if (err) console.error(err);
      res()
    }))
  }
}

module.exports = Database;
