"use strict";

const { Service } = require("ee-core");
const Storage = require("ee-core/storage");
const _ = require("lodash");
const path = require("path");

/**
 * json数据存储
 * @class
 */
class JsondbService extends Service {
  constructor(ctx) {
    super(ctx);

    // jsondb数据库
    this.jsonFile = "zzstudio";
    this.demoDB = Storage.connection(this.jsonFile);
    this.demoDBKey = {
      translate: "translate",
      translate2: "translate2",
    };
  }

  /*
   * 新增配置（指初始化）
   */
  async updateTestData(configData, configName = "translate") {
    const key = this.demoDBKey[configName];

    if (!this.demoDB.db.has(key).value()) {
      this.demoDB.db.set(key, {}).write();
    }
    const data = this.demoDB.db.set(configName, configData).write();
    return data;
  }

  /*
   * 删 Test data
   */
  async delTestData(name = "", configName = "translate") {
    // const key = this.demoDBKey.translate;
    const key = this.demoDBKey[configName];
    const data = this.demoDB.db.get(key).remove({ name: name }).write();

    return data;
  }

  /*
   * 修改配置文件
   */
  //   async updateTestData(updateData, configName = "translate") {
  //     // const key = this.demoDBKey.translate;
  //     const key = this.demoDBKey[configName];
  //     const data = this.demoDB.db
  //       .get(key)
  //       .assign({ ...updateData })
  //       .write();

  //     return data;
  //   }

  /*
   * 查 Test data
   */
  async getTestData(age = 0, configName = "translate") {
    // const key = this.demoDBKey.translate;
    const key = this.demoDBKey[configName];
    let data = this.demoDB.db
      .get(key)
      //.find({age: age}) 查找单个
      .filter(function (o) {
        let isHas = true;
        isHas = age === o.age ? true : false;
        return isHas;
      })
      //.orderBy(['age'], ['name']) 排序
      //.slice(0, 10) 分页
      .value();

    if (_.isEmpty(data)) {
      data = [];
    }

    return data;
  }

  /*
   * 获取全部配置信息
   */
  async getAllConfig(configName = "translate") {
    const key = this.demoDBKey[configName];
    if (!this.demoDB.db.has(key).value()) {
      this.demoDB.db.set(key, {}).write();
    }
    let data = this.demoDB.db.get(key).value();

    if (_.isEmpty(data)) {
      data = {};
    }

    return data;
  }

  /*
   * get data dir (sqlite)
   */
  async getDataDir() {
    const dir = this.demoDB.getStorageDir();

    return dir;
  }

  /*
   * set custom data dir (sqlite)
   */
  async setCustomDataDir(dir) {
    if (_.isEmpty(dir)) {
      return;
    }

    // the absolute path of the db file
    const dbFile = path.join(dir, this.jsonFile);
    this.demoDB = Storage.connection(dbFile);

    return;
  }
}

JsondbService.toString = () => "[class JsondbService]";
module.exports = JsondbService;
