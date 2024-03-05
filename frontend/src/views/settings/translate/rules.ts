export const rules = {
  sourceDirName: [
    { required: true, message: "Please input Activity name", trigger: "blur" },
    // { min: 3, max: 5, message: "Length should be 3 to 5", trigger: "blur" },
  ],
  targetDirName: [
    { required: true, message: "Please input Activity name", trigger: "blur" },
    // { min: 3, max: 5, message: "Length should be 3 to 5", trigger: "blur" },
  ],
  appId: [
    { required: true, message: "Please input Activity name", trigger: "blur" },
    { min: 3, max: 5, message: "Length should be 3 to 5", trigger: "blur" },
  ],
  appKey: [
    { required: true, message: "Please input Activity name", trigger: "blur" },
    { min: 3, max: 5, message: "Length should be 3 to 5", trigger: "blur" },
  ],
  ignoreFiles: [
    {
      required: true,
      message: "请输入忽略文件夹，如 node_modules",
      trigger: "blur",
    },
  ],
};
