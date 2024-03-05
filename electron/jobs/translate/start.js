// 翻译文件
const Job = require("ee-core/jobs/baseJobClass");
const Loader = require("ee-core/loader");
const Log = require("ee-core/log");
const Ps = require("ee-core/ps");
const { childMessage } = require("ee-core/message");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

/**
 * example - TranslateJob
 * @class
 */
class TranslateJob extends Job {
  constructor(params) {
    super();
    this.params = params;
    this.okCount = 0;
    this.errCount = 0;
    this.fileIndex = 0;
    this.fileTotal = 0;
    this.stat = {}; // 多文件个数统计
  }

  /**
   * handle()方法是必要的，且会被自动调用
   */
  async handle() {
    Log.info("[child-process] TranslateJob params: ", this.params);

    // 计时器任务

    let number = 0;
    let jobId = this.params.jobId;
    let translateConfig = this.params.translateConfig;
    this.translateConfig = translateConfig;
    let data = this.params.data;
    console.log(`job start data`, data);
    let eventName = "job-translate-progress-" + jobId;
    this.eventName = eventName;
    childMessage.send(eventName, {
      jobId,
      number,
      end: false,
      data,
      errCount: this.errCount,
      okCount: this.okCount,
    });
    this.fileTotal = data.length;
    for (let index = 0; index < this.fileTotal; index++) {
      this.stat[index] = {
        okCount: 0,
        errCount: 0,
      };
    }
    await this.execWorkerSync(data, 0);
    // childMessage.send(eventName, {
    //   jobId,
    //   number,
    //   end: true,
    //   data,
    //   errCount: this.errCount,
    //   okCount: this.okCount,
    // });
    // Ps.exit();
  }

  // 执行翻译操作
  async execWorkerSync(files, index = 0) {
    let fileItem = files[index];
    this.fileIndex = index;
    childMessage.send(this.eventName, {
      end: false,
      fileIndex: this.fileIndex, // 当前文件
      fileTotal: this.fileTotal, // 文件总数
      errCount: this.errCount,
      okCount: this.okCount,
      stat: this.stat,
    });
    let file_content = await this.readAndTranslateFileContent(
      fileItem.sourcePath
    ).catch((err) => {
      Log.error("翻译失败readAndTranslateFileContent");
    });
    Log.info("文件内容", file_content);

    let fileName = path.basename(fileItem.sourcePath);
    let newFilePath = fileItem.targetPath + "/" + fileName;
    let exist = fs.existsSync(fileItem.targetPath);
    // 自动创建不存在的目录
    if (!exist) {
      try {
        //   log.on(`创建文件夹${chalk.yellow(fileItem.targetPath)}`);
        fs.mkdirSync(fileItem.targetPath);
      } catch (error) {
        //   log.error(`创建文件夹${chalk.red(fileItem.targetPath)}失败`);
        // process.exit(1);
      }
    }
    fs.writeFile(newFilePath, file_content, "utf-8", async (error) => {
      if (!error) {
        Log.info(`已写入${newFilePath}`);
        childMessage.send(this.eventName, {
          end: false,
          fileIndex: this.fileIndex, // 当前文件
          fileTotal: this.fileTotal, // 文件总数
          errCount: this.errCount,
          okCount: this.okCount,
          stat: this.stat,
        });
        //   onFinally && onFinally(spinner, true);
      } else {
        //   console.log(error);
        Log.info(`写入${newFilePath}文件失败, 请重试`);
        //   onFinally && onFinally(spinner, false);
      }

      index++;
      if (index < files.length) {
        // spinner.start();
        await this.execWorkerSync(files, index);
        // spinner.stop();
      } else {
        // spinner.stop();
        // spinner.succeed("翻译完毕");
        childMessage.send(this.eventName, {
          end: true,
          write: true,
          errCount: this.errCount,
          okCount: this.okCount,
          stat: this.stat,
        });
        Ps.exit();
      }
    });
    // writeFileContent(newFilePath, file_content, async (spinner, isOk) => {
    //   if (isOk) {
    //     // spinner.succeed(`${newFilePath}已翻译`);
    //   } else {
    //     // spinner.fail(`${newFilePath}翻译失败`);
    //   }
    // });
  }

  /**
   * 读取并翻译文本内容
   * @param filePath 文件地址
   * @param cb 翻译后的回调
   * @return 翻译后的文本
   */
  readAndTranslateFileContent(filePath, cb = () => {}) {
    const _this = this;
    return new Promise(async (resolve, reject) => {
      let data = null;
      try {
        data = fs.readFileSync(filePath, { encoding: "utf8" });
      } catch (err) {
        reject();
      }
      let jsonObj;
      let fileData = data.toString();
      let startIndex = fileData.indexOf("{");
      let endIndex = fileData.lastIndexOf("}");
      let jsonStr = fileData.slice(
        startIndex,
        endIndex === fileData.length ? endIndex : endIndex + 1
      );
      try {
        // 当成js执行
        eval("jsonObj = " + jsonStr);
      } catch (err) {
        jsonObj = null;
        //   log.error("文件解析失败");
        reject();
      }

      if (jsonObj) {
        let obj = {};
        let words = _this.parseConfigs(jsonObj);
        // let limitedWords = _this.limitWords(words, 6);
        Log.info(`词汇(总计${words.length}) =》`, words);
        let word_result = await _this.startTranslate(words);
        Log.info("调用翻译 done", word_result);
        _this.setTranslatedObj(word_result, obj);
        let file_result =
          `export default ` + _this.unquoteKeys(JSON.stringify(obj, null, 2));
        Log.info("文件内容", file_result);

        resolve(file_result);
      }
    });
  }

  /**
   * 调用翻译功能
   * @param limitedWords 分组后的word数据 不分组了！
   * @param cb 全部翻译结束后的回调函数
   */
  startTranslate(limitedWords, cb) {
    // let curIndex = 0; // 词汇索引
    const _this = this;
    let curIndex = 0; // 词汇索引
    let timer = null;

    return new Promise(async (resolve, reject) => {
      try {
        function start() {
          return new Promise(async (resolve, reject) => {
            Log.info(`正在翻译${curIndex} =>`, limitedWords[curIndex]);
            let word = limitedWords[curIndex];
            let res = await _this
              .translate({
                query: word.value,
                from: "zh",
                to: "en",
              })
              .catch((err) => {
                Log.error("翻译错误", err);
                Log.info("翻译错误", err);
                _this.errCount++;
                _this.stat[_this.fileIndex].errCount++;
                reject();
              });

            if (res.error_code) {
              _this.errCount++;
              _this.stat[_this.fileIndex].errCount++;

              Log.error(`翻译错误: ${res.error_msg}`);
              Log.info(`翻译错误, ${res.error_msg}`);
              reject();
            } else {
              let translate_result = res.trans_result
                ? res.trans_result[0].dst
                : word.value;
              word.value = translate_result;
              Log.info(`翻译成功`, res);
              _this.okCount++;
              _this.stat[_this.fileIndex].okCount++;
            }
            curIndex++;
            // 如果已经全部翻译完成了
            if (curIndex >= limitedWords.length) {
              Log.info("翻译结束, 调用 cb");
              //   clearTimeout(timer);
              resolve(limitedWords);
            } else {
              // 还没完, 100ms后继续翻译下一个
              timer = setTimeout(async () => {
                Log.info(`再次执行start(${curIndex})`);
                await start();
                resolve(limitedWords);
              }, 100);
            }
          });
        }
        const words = await start().catch((err) => {
          reject(err);
        });
        console.log(`执行翻译结束 =====`);
        resolve(words);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * 组装翻译后的数据结构
   * @param words
   * @param obj
   */
  setTranslatedObj(words, obj) {
    words.forEach((item) => {
      item.keys.forEach((key, index) => {
        if (index === 0 && item.keys.length > 1) {
          if (!obj[key]) obj[key] = {};
        } else if (index < item.keys.length - 1) {
          // a.b.c
          let _key = item.keys.slice(0, index + 1).join(".");
          let flag = false;
          eval(`flag = !!!obj.${_key}`);
          if (flag) eval(`obj.${_key} = {}`);
        } else {
          let _key = item.keys.slice(0, index + 1).join(".");
          eval(`obj.${_key} = "${item.value}"`);
        }
      });
    });
  }

  unquoteKeys(json) {
    return json.replace(/"(\\[^]|[^\\"])*"\s*:?/g, function (match) {
      if (/:$/.test(match)) {
        return match.replace(/^"|"(?=\s*:$)/g, "");
      } else {
        return match;
      }
    });
  }

  /**
   * 递归处理i18n配置对象
   * @param config i18n配置js 一般为langs文件下的js文件
   * @description 把js对象处理成 [ { keys: ['common', 'title'], value: '要翻译的值'} ]  每个要翻译的中文为一个item keys表示他在对象里的位置
   */
  parseConfigs(config) {
    let words = [];

    parseConfig(config, null);
    function parseConfig(config, curItem) {
      let keys = Object.keys(config);
      keys.forEach((key) => {
        let item = {
          keys: curItem ? curItem.keys.concat([key]) : [key],
          value: config[key],
        };
        // 对象的value为string时则为要翻译的值
        if (typeof item.value === "string") {
          words.push(item);
        } else {
          parseConfig(item.value, item);
        }
      });
    }
    return words;
  }

  /**
   * 把所有要翻译的词分组 每秒有查询次数限制
   * @param words 处理好的数据
   * @param limitLength 每秒查几个词
   * @returns {*[]} 处理后的二维数组
   */
  limitWords(words, limitLength = 7) {
    let wordsLimit = [];
    if (words.length < limitLength) {
      return [words];
    } else {
      for (let i = 0; i < words.length; i += limitLength) {
        wordsLimit.push(words.slice(i, i + limitLength));
      }
      return wordsLimit;
    }
  }

  genSign(options) {
    let str1 = options.appid + options.query + options.salt + options.key;
    let sign = this.MD5(str1);
    return sign;
  }

  async translate(options) {
    let salt = new Date().getTime();
    const _this = this;
    let appid = this.translateConfig.appId; // appid
    let key = this.translateConfig.appKey; // 密钥
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
          sign: _this.genSign({
            ...options,
            appid,
            key,
            salt,
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
  MD5(string) {
    function RotateLeft(lValue, iShiftBits) {
      return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    }

    function AddUnsigned(lX, lY) {
      var lX4, lY4, lX8, lY8, lResult;
      lX8 = lX & 0x80000000;
      lY8 = lY & 0x80000000;
      lX4 = lX & 0x40000000;
      lY4 = lY & 0x40000000;
      lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
      if (lX4 & lY4) {
        return lResult ^ 0x80000000 ^ lX8 ^ lY8;
      }
      if (lX4 | lY4) {
        if (lResult & 0x40000000) {
          return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
        } else {
          return lResult ^ 0x40000000 ^ lX8 ^ lY8;
        }
      } else {
        return lResult ^ lX8 ^ lY8;
      }
    }

    function F(x, y, z) {
      return (x & y) | (~x & z);
    }
    function G(x, y, z) {
      return (x & z) | (y & ~z);
    }
    function H(x, y, z) {
      return x ^ y ^ z;
    }
    function I(x, y, z) {
      return y ^ (x | ~z);
    }

    function FF(a, b, c, d, x, s, ac) {
      a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
      return AddUnsigned(RotateLeft(a, s), b);
    }

    function GG(a, b, c, d, x, s, ac) {
      a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
      return AddUnsigned(RotateLeft(a, s), b);
    }

    function HH(a, b, c, d, x, s, ac) {
      a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
      return AddUnsigned(RotateLeft(a, s), b);
    }

    function II(a, b, c, d, x, s, ac) {
      a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
      return AddUnsigned(RotateLeft(a, s), b);
    }

    function ConvertToWordArray(string) {
      var lWordCount;
      var lMessageLength = string.length;
      var lNumberOfWords_temp1 = lMessageLength + 8;
      var lNumberOfWords_temp2 =
        (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
      var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
      var lWordArray = Array(lNumberOfWords - 1);
      var lBytePosition = 0;
      var lByteCount = 0;
      while (lByteCount < lMessageLength) {
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] =
          lWordArray[lWordCount] |
          (string.charCodeAt(lByteCount) << lBytePosition);
        lByteCount++;
      }
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
      lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
      lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
      return lWordArray;
    }

    function WordToHex(lValue) {
      var WordToHexValue = "",
        WordToHexValue_temp = "",
        lByte,
        lCount;
      for (lCount = 0; lCount <= 3; lCount++) {
        lByte = (lValue >>> (lCount * 8)) & 255;
        WordToHexValue_temp = "0" + lByte.toString(16);
        WordToHexValue =
          WordToHexValue +
          WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
      }
      return WordToHexValue;
    }

    function Utf8Encode(string) {
      string = string.replace(/\r\n/g, "\n");
      var utftext = "";

      for (var n = 0; n < string.length; n++) {
        var c = string.charCodeAt(n);

        if (c < 128) {
          utftext += String.fromCharCode(c);
        } else if (c > 127 && c < 2048) {
          utftext += String.fromCharCode((c >> 6) | 192);
          utftext += String.fromCharCode((c & 63) | 128);
        } else {
          utftext += String.fromCharCode((c >> 12) | 224);
          utftext += String.fromCharCode(((c >> 6) & 63) | 128);
          utftext += String.fromCharCode((c & 63) | 128);
        }
      }

      return utftext;
    }

    var x = Array();
    var k, AA, BB, CC, DD, a, b, c, d;
    var S11 = 7,
      S12 = 12,
      S13 = 17,
      S14 = 22;
    var S21 = 5,
      S22 = 9,
      S23 = 14,
      S24 = 20;
    var S31 = 4,
      S32 = 11,
      S33 = 16,
      S34 = 23;
    var S41 = 6,
      S42 = 10,
      S43 = 15,
      S44 = 21;

    string = Utf8Encode(string);

    x = ConvertToWordArray(string);

    a = 0x67452301;
    b = 0xefcdab89;
    c = 0x98badcfe;
    d = 0x10325476;

    for (k = 0; k < x.length; k += 16) {
      AA = a;
      BB = b;
      CC = c;
      DD = d;
      a = FF(a, b, c, d, x[k + 0], S11, 0xd76aa478);
      d = FF(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
      c = FF(c, d, a, b, x[k + 2], S13, 0x242070db);
      b = FF(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
      a = FF(a, b, c, d, x[k + 4], S11, 0xf57c0faf);
      d = FF(d, a, b, c, x[k + 5], S12, 0x4787c62a);
      c = FF(c, d, a, b, x[k + 6], S13, 0xa8304613);
      b = FF(b, c, d, a, x[k + 7], S14, 0xfd469501);
      a = FF(a, b, c, d, x[k + 8], S11, 0x698098d8);
      d = FF(d, a, b, c, x[k + 9], S12, 0x8b44f7af);
      c = FF(c, d, a, b, x[k + 10], S13, 0xffff5bb1);
      b = FF(b, c, d, a, x[k + 11], S14, 0x895cd7be);
      a = FF(a, b, c, d, x[k + 12], S11, 0x6b901122);
      d = FF(d, a, b, c, x[k + 13], S12, 0xfd987193);
      c = FF(c, d, a, b, x[k + 14], S13, 0xa679438e);
      b = FF(b, c, d, a, x[k + 15], S14, 0x49b40821);
      a = GG(a, b, c, d, x[k + 1], S21, 0xf61e2562);
      d = GG(d, a, b, c, x[k + 6], S22, 0xc040b340);
      c = GG(c, d, a, b, x[k + 11], S23, 0x265e5a51);
      b = GG(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa);
      a = GG(a, b, c, d, x[k + 5], S21, 0xd62f105d);
      d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
      c = GG(c, d, a, b, x[k + 15], S23, 0xd8a1e681);
      b = GG(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8);
      a = GG(a, b, c, d, x[k + 9], S21, 0x21e1cde6);
      d = GG(d, a, b, c, x[k + 14], S22, 0xc33707d6);
      c = GG(c, d, a, b, x[k + 3], S23, 0xf4d50d87);
      b = GG(b, c, d, a, x[k + 8], S24, 0x455a14ed);
      a = GG(a, b, c, d, x[k + 13], S21, 0xa9e3e905);
      d = GG(d, a, b, c, x[k + 2], S22, 0xfcefa3f8);
      c = GG(c, d, a, b, x[k + 7], S23, 0x676f02d9);
      b = GG(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a);
      a = HH(a, b, c, d, x[k + 5], S31, 0xfffa3942);
      d = HH(d, a, b, c, x[k + 8], S32, 0x8771f681);
      c = HH(c, d, a, b, x[k + 11], S33, 0x6d9d6122);
      b = HH(b, c, d, a, x[k + 14], S34, 0xfde5380c);
      a = HH(a, b, c, d, x[k + 1], S31, 0xa4beea44);
      d = HH(d, a, b, c, x[k + 4], S32, 0x4bdecfa9);
      c = HH(c, d, a, b, x[k + 7], S33, 0xf6bb4b60);
      b = HH(b, c, d, a, x[k + 10], S34, 0xbebfbc70);
      a = HH(a, b, c, d, x[k + 13], S31, 0x289b7ec6);
      d = HH(d, a, b, c, x[k + 0], S32, 0xeaa127fa);
      c = HH(c, d, a, b, x[k + 3], S33, 0xd4ef3085);
      b = HH(b, c, d, a, x[k + 6], S34, 0x4881d05);
      a = HH(a, b, c, d, x[k + 9], S31, 0xd9d4d039);
      d = HH(d, a, b, c, x[k + 12], S32, 0xe6db99e5);
      c = HH(c, d, a, b, x[k + 15], S33, 0x1fa27cf8);
      b = HH(b, c, d, a, x[k + 2], S34, 0xc4ac5665);
      a = II(a, b, c, d, x[k + 0], S41, 0xf4292244);
      d = II(d, a, b, c, x[k + 7], S42, 0x432aff97);
      c = II(c, d, a, b, x[k + 14], S43, 0xab9423a7);
      b = II(b, c, d, a, x[k + 5], S44, 0xfc93a039);
      a = II(a, b, c, d, x[k + 12], S41, 0x655b59c3);
      d = II(d, a, b, c, x[k + 3], S42, 0x8f0ccc92);
      c = II(c, d, a, b, x[k + 10], S43, 0xffeff47d);
      b = II(b, c, d, a, x[k + 1], S44, 0x85845dd1);
      a = II(a, b, c, d, x[k + 8], S41, 0x6fa87e4f);
      d = II(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0);
      c = II(c, d, a, b, x[k + 6], S43, 0xa3014314);
      b = II(b, c, d, a, x[k + 13], S44, 0x4e0811a1);
      a = II(a, b, c, d, x[k + 4], S41, 0xf7537e82);
      d = II(d, a, b, c, x[k + 11], S42, 0xbd3af235);
      c = II(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb);
      b = II(b, c, d, a, x[k + 9], S44, 0xeb86d391);
      a = AddUnsigned(a, AA);
      b = AddUnsigned(b, BB);
      c = AddUnsigned(c, CC);
      d = AddUnsigned(d, DD);
    }

    var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);

    return temp.toLowerCase();
  }
}

TranslateJob.toString = () => "[class TranslateJob]";
module.exports = TranslateJob;
