<template>
  <div id="app-base-jobs">
    <div class="one-block-1">
      <span> 1. 任务 / 并发任务 </span>
    </div>
    <div class="one-block-2">
      <a-space>
        <a-button @click="runJob(111, 'create')">执行任务1</a-button>
        进度：{{ progress1 }} ， 进程pid：{{ progress1_pid }}
        <a-button @click="runJob(1111, 'close')">关闭</a-button>
      </a-space>
      <p></p>
      <a-space>
        <a-button @click="runJob(2, 'create')">执行任务2</a-button>
        进度：{{ progress2 }} ， 进程pid：{{ progress2_pid }}
        <a-button @click="runJob(2, 'close')">关闭</a-button>
      </a-space>
    </div>
    <div class="one-block-1">
      <span> 2. 任务池 / 并发任务 </span>
    </div>
    <div class="one-block-2">
      <a-space>
        <a-button @click="createPool()">创建进程池</a-button>
        进程pids：{{ processPids }}
      </a-space>
      <p></p>
      <a-space>
        <a-button @click="runJobByPool(3, 'run')">执行任务3</a-button>
        进度：{{ progress3 }} ，进程pid：{{ progress3_pid }}
      </a-space>
      <p></p>
      <a-space>
        <a-button @click="runJobByPool(4, 'run')">执行任务4</a-button>
        进度：{{ progress4 }} ，进程pid：{{ progress4_pid }}
      </a-space>
      <p></p>
      <a-space>
        <a-button @click="runJobByPool(5, 'run')">执行任务5</a-button>
        进度：{{ progress5 }} ，进程pid：{{ progress5_pid }}
      </a-space>
      <p></p>
      <a-space>
        <a-button @click="runJobByPool(6, 'run')">执行任务6</a-button>
        进度：{{ progress6 }} ，进程pid：{{ progress6_pid }}
      </a-space>
    </div>
  </div>
</template>
<script>
import { ipcApiRoute } from "@/api/main";
import { ipc } from "@/utils/ipcRenderer";

export default {
  data() {
    return {
      processPids: "",
      progress1: 0,
      progress2: 0,
      progress3: 0,
      progress4: 0,
      progress5: 0,
      progress6: 0,
      progress1_pid: 0,
      progress2_pid: 0,
      progress3_pid: 0,
      progress4_pid: 0,
      progress5_pid: 0,
      progress6_pid: 0,
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      // 避免重复监听，或者将 on 功能写到一个统一的地方，只加载一次
      ipc.removeAllListeners(ipcApiRoute.timerJobProgress);
      ipc.removeAllListeners(ipcApiRoute.createPoolNotice);

      // 监听任务进度
      ipc.on(ipcApiRoute.timerJobProgress, (event, result) => {
        switch (result.jobId) {
          case 1:
            this.progress1 = result.number;
            this.progress1_pid =
              result.pid == 0 ? result.pid : this.progress1_pid;
            break;
          case 2:
            this.progress2 = result.number;
            this.progress2_pid =
              result.pid == 0 ? result.pid : this.progress2_pid;
            break;
          case 3:
            this.progress3 = result.number;
            this.progress3_pid =
              result.pid == 0 ? result.pid : this.progress3_pid;
            break;
          case 4:
            this.progress4 = result.number;
            this.progress4_pid =
              result.pid == 0 ? result.pid : this.progress4_pid;
            break;
          case 5:
            this.progress5 = result.number;
            this.progress5_pid =
              result.pid == 0 ? result.pid : this.progress5_pid;
            break;
          case 6:
            this.progress6 = result.number;
            this.progress6_pid =
              result.pid == 0 ? result.pid : this.progress6_pid;
            break;
        }
      });

      ipc.on(ipcApiRoute.fileSearchJobProgress, (event, result) => {
        console.log(`搜集文件 jobresult`, result);
      });

      // 监听pool
      ipc.on(ipcApiRoute.createPoolNotice, (event, result) => {
        let pidsStr = JSON.stringify(result);
        this.processPids = pidsStr;
      });
    },
    runJob(jobId, operation) {
      let params = {
        id: jobId,
        type: "timer",
        action: operation,
      };
      console.log(`web run job`);
      ipc.invoke(ipcApiRoute.fileSearchJob, params).then((data) => {
        if (operation == "close") return;
        switch (data.jobId) {
          case 1:
            this.progress1_pid = data.result.pid;
            break;
          case 2:
            this.progress2_pid = data.result.pid;
            break;
        }
      });
    },
    createPool() {
      let params = {
        number: 3,
      };
      ipc.send(ipcApiRoute.createPool, params);
    },
    runJobByPool(jobId, operation) {
      let params = {
        id: jobId,
        type: "timer",
        action: operation,
      };
      ipc.invoke(ipcApiRoute.someJobByPool, params).then((data) => {
        switch (data.jobId) {
          case 3:
            this.progress3_pid = data.result.pid;
            break;
          case 4:
            this.progress4_pid = data.result.pid;
            break;
          case 5:
            this.progress5_pid = data.result.pid;
            break;
          case 6:
            this.progress6_pid = data.result.pid;
            break;
        }
      });
    },
  },
};
</script>
<style lang="less" scoped>
#app-base-jobs {
  padding: 0px 10px;
  text-align: left;
  width: 100%;
  .one-block-1 {
    font-size: 16px;
    padding-top: 10px;
  }
  .one-block-2 {
    padding-top: 10px;
  }
}
</style>
