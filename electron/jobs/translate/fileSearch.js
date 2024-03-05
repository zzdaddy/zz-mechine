// 翻译文件
const Job = require("ee-core/jobs/baseJobClass");
const Loader = require("ee-core/loader");
const Log = require("ee-core/log");
const Ps = require("ee-core/ps");
const { childMessage } = require("ee-core/message");
const Hello = Loader.requireJobsModule("./example/hello");
const fs = require("fs");
const path = require("path");
const Services = require("ee-core/services");

/**
 * example - TimerJob
 * @class
 */
class FileSearchJob extends Job {
  constructor(params) {
    super();
    this.params = params;
  }

  // 获取需要翻译的文件
  getAllFilePaths(translateConfig, dirPath, filePaths) {
    let eventName = "job-timer-progress-" + this.params.jobId;

    let files = fs.readdirSync(dirPath);
    files.forEach((file) => {
      let filePath = path.join(dirPath, file);
      let stats = fs.statSync(filePath);
      // 是否是文件夹
      let isDir = stats.isDirectory();
      if (isDir) {
        if (file === translateConfig.sourceDirName) {
          // 找到目标文件夹, 获取所有文件
          let files = fs.readdirSync(filePath);
          files.forEach((file) => {
            let jsPath = path.join(filePath, file);
            let targetPath = path.join(dirPath, translateConfig.targetDirName);
            filePaths.push({
              sourcePath: jsPath,
              targetPath,
            });
          });
        } else if (!translateConfig.ignoreFiles.includes(file)) {
          childMessage.send(eventName, {
            jobId: this.params.jobId,
            end: false,
            msg: "递归查找中",
          });
          this.getAllFilePaths(translateConfig, filePath, filePaths);
        }
      }
    });
  }

  /**
   * handle()方法是必要的，且会被自动调用
   */
  async handle() {
    Log.info("[child-process] FileSearchJob start...");
    Log.info("[child-process] FileSearchJob params: ", this.params);

    // 计时器任务
    let jobId = this.params.jobId;
    // 从那个目录开始查找
    let dirPath = this.params.dirPath;
    let translateConfig = this.params.translateConfig;
    let eventName = "job-file-search-progress-" + jobId;
    // 收集全部要翻译的文件地址
    let filePaths = [];
    childMessage.send(eventName, {
      jobId,
      end: false,
      msg: "正在收集文件地址...",
    });
    await this.getAllFilePaths(translateConfig, dirPath, filePaths);
    // 任务结束，重置前端显示
    childMessage.send(eventName, {
      jobId,
      total: filePaths.length,
      dirPath,
      filePaths,
      pid: 0,
      end: true,
    });

    // 如果是childJob任务，必须调用 Ps.exit() 方法，让进程退出，否则会常驻内存
    // 如果是childPoolJob任务，常驻内存，等待下一个业务
    console.log(`是否为 childJob 任务`, Ps.isChildJob());
    Ps.exit();
  }
}

FileSearchJob.toString = () => "[class FileSearchJob]";
module.exports = FileSearchJob;
