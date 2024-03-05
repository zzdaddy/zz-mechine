<template>
  <div class="w-full h-full bg-white overflow-y-auto">
    <!-- <div>
      <a-button @click="selectDir">选择目录</a-button>
    </div> -->
    <a-table :columns="columns" :data-source="tableData" bordered>
      <template #result="{ record }">
        <span v-if="record.okCount === 0 && record.errCount === 0">翻译中</span>
        <span v-else-if="!record.result">队列中</span>
        <span v-else>{{ record.result }}</span>
      </template>
      <template #title>
        <div class="flex justify-between">
          <div>
            当前共<span class="text-red font-bold text-lg">{{
              tableData.length
            }}</span
            >个待翻译文件
          </div>
          <div class="buttons">
            <a-button
              type="link"
              @click="selectDir"
              class="mr-1"
              :loading="loading"
              >选择目录</a-button
            ><a-button type="link" @click="execTranslateJob" :loading="loading"
              >开始翻译</a-button
            >
          </div>
        </div>
      </template>
      <!-- <template #footer>Footer</template> -->
    </a-table>
  </div>
</template>
<script lang="ts" setup>
import {
  defineComponent,
  onMounted,
  reactive,
  ref,
  toRaw,
  UnwrapRef,
  onActivated,
  computed,
} from "vue";
import { ipcApiRoute } from "@/api/main";
import { ipc } from "@/utils/ipcRenderer";
const loading = ref(false);

const columns = [
  {
    title: "目录",
    dataIndex: "dirPath",
  },
  {
    title: "文件路径",
    dataIndex: "sourcePath",
  },
  {
    title: "翻译结果",
    dataIndex: "result",
    slots: { customRender: "result" },
  },
];
// 选择文件或文件夹后，每次操作是一次 job
const jobs = ref<any>([]);
const data = ref<any>([]);
const tableData = computed(() => {
  const uniqueFiles: any[] = [];
  return jobs.value
    .filter((item, index) => {
      if (!uniqueFiles.includes(item.sourcePath)) {
        uniqueFiles.push(item.sourcePath);
        return true;
      }
      return false;
    })
    .map((item) => {
      return {
        ...item,
        sourcePath: item.sourcePath.split(item.dirPath)[1],
      };
    });
});
const initEmitter = () => {
  ipc.on(ipcApiRoute.fileSearchJobProgress, (event, result) => {
    console.log(`搜集文件 jobresult`, result);
    if (result.end) {
      let filePaths = result.filePaths.map((item) => ({
        ...item,
        dirPath: result.dirPath,
      }));
      jobs.value = jobs.value.concat(filePaths);
    }
  });

  ipc.on(ipcApiRoute.fileTranslateJobProgress, (event, result) => {
    console.log(`翻译任务`, result);
    const { fileIndex } = result;
    if (fileIndex >= 0) {
      jobs.value[fileIndex].okCount = result.stat[fileIndex].okCount;
      jobs.value[fileIndex].errCount = result.stat[fileIndex].errCount;
      jobs.value[result.fileIndex].result =
        `成功${jobs.value[fileIndex].okCount},失败${jobs.value[fileIndex].errCount}`;
    }
    if (result.end) {
      loading.value = false;
    }
  });
};
const getTranslateConfig = () => {
  const params = {
    action: "all",
    configName: "translate",
  };
  ipc.invoke(ipcApiRoute.jsondbOperation, params).then((res) => {
    console.log("res:", res);
    if (!res.config) {
      ipc
        .invoke(ipcApiRoute.messageShow, {
          type: "warning", // "none", "info", "error", "question" 或者 "warning"
          title: "注意",
          message: "未获取到配置文件，请前往设置-翻译-重置-保存进行初始化",
          detail: "",
        })
        .then((r) => {
          // this.$message.info(r);
        });
    } else {
    }
    // this.all_list = res.all_list;
  });
};

// 选择目录，搜刮目标文件
const selectDir = () => {
  closeJobs();
  jobs.value = [];
  ipc.invoke(ipcApiRoute.selectFolder, "").then((r) => {
    // 返回目录地址
    console.log(`r`, r);
    // 获取该目录下所有目标文件
    execfileSearchJob(r, "create");
  });
};

const closeJobs = () => {
  let params = {
    id: "all",
    type: "timer",
    dirPath: "",
    action: "close",
  };
  console.log(`清除任务,并开始选择`);
  ipc
    .invoke(ipcApiRoute.fileSearchJob, JSON.parse(JSON.stringify(params)))
    .then((data) => {});
  ipc
    .invoke(ipcApiRoute.translateJob, JSON.parse(JSON.stringify(params)))
    .then((data) => {});
};
const execfileSearchJob = (dirPath, operation = "create") => {
  closeJobs();
  let params = {
    id: jobs.value.length + 1,
    type: "timer",
    dirPath,
    action: operation,
  };
  console.log(`执行搜集文件任务`);
  ipc
    .invoke(ipcApiRoute.fileSearchJob, JSON.parse(JSON.stringify(params)))
    .then((data) => {});
};

const execTranslateJob = () => {
  loading.value = true;
  let params = {
    id: 31231,
    type: "timer",
    data: jobs.value,
    action: "create",
  };
  console.log(`执行翻译任务`);
  ipc
    .invoke(ipcApiRoute.translateJob, JSON.parse(JSON.stringify(params)))
    .then((data) => {});
};
onMounted(() => {
  getTranslateConfig();
  initEmitter();
});

// onActivated(() => {
//   getTranslateConfig();
// });
</script>
<style lang="less" scoped></style>
