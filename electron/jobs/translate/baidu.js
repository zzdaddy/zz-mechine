// import { MD5 } from "./md5.js";
const { MD5 } = require("./md5.js");
// import path from "path";
const path = require("path");
// import axios from "axios";
const axios = require("axios");

function genSign(options) {
  let str1 = appid + options.query + salt + key;
  let sign = MD5(str1);
  return sign;
}

async function translate(options) {
  let salt = new Date().getTime();

  let appid = options.translateConfig.account.appId; // appid
  let key = options.translateConfig.account.key; // 密钥
  return new Promise((resolve, reject) => {
    axios({
      url: "http://api.fanyi.baidu.com/api/trans/vip/translate",
      method: "get",
      params: {
        q: options.query,
        appid: appid,
        salt: salt,
        from: options.from,
        to: options.to,
        sign: genSign({
          ...options,
          appid,
          key,
          sign,
        }),
      },
    })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject("翻译失败");
      })
      .finally(() => {});
  });
}

exports = {
  translate: translate,
};
