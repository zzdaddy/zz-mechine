<template>
  <div class="w-full h-full bg-white">
    <a-form
      ref="formRef"
      :model="formState"
      :rules="rules"
      layout="horizontal"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
    >
      <a-form-item ref="sourceDirName" label="源文件夹" name="sourceDirName">
        <a-input v-model:value="formState.sourceDirName" />
      </a-form-item>
      <a-form-item ref="targetDirName" label="输出文件夹" name="targetDirName">
        <a-input v-model:value="formState.targetDirName" />
      </a-form-item>
      <a-form-item ref="appId" label="appId" name="appId">
        <a-input v-model:value="formState.appId" />
      </a-form-item>
      <a-form-item ref="appKey" label="appKey" name="appKey">
        <a-input v-model:value="formState.appKey" />
      </a-form-item>
      <a-alert
        message="忽略名单内的文件夹，不会被扫描，如 node_modules(必填)，多个文件夹以英文逗号分割"
        type="warning"
        style="width: 100%; text-align: left"
        banner
      />
      <a-form-item label="忽略名单" name="ignoreFiles">
        <a-textarea v-model:value="formState.ignoreFiles" />
      </a-form-item>

      <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
        <a-button type="primary" @click="onSubmit">保存</a-button>
        <a-button style="margin-left: 10px" @click="resetForm">重置</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
import { ValidateErrorEntity } from "ant-design-vue/es/form/interface";
import { Moment } from "moment";
import {
  defineComponent,
  onMounted,
  reactive,
  ref,
  toRaw,
  UnwrapRef,
} from "vue";
import { ipcApiRoute } from "@/api/main";
import { ipc } from "@/utils/ipcRenderer";
interface FormState {
  sourceDirName: string;
  targetDirName: string;
  appId: string;
  appKey: string;
  ignoreFiles: string;
}
const labelCol = ref({ span: 4 });
const wrapperCol = ref({ span: 8, align: "left" });
const isNoConfig = ref(false);
const formRef = ref();
const formState: UnwrapRef<FormState> = reactive({
  sourceDirName: "",
  targetDirName: "",
  appId: "",
  appKey: "",
  ignoreFiles: "",
});
const defaultFormState = {
  sourceDirName: "zh-CN",
  targetDirName: "en-US",
  appId: "",
  appKey: "",
  ignoreFiles: "node_modules",
};
const rules = {
  sourceDirName: [
    {
      required: true,
      message: "请输入源文件夹，即要翻译的国际化文件所处的文件夹，如 zh-cn",
      trigger: "blur",
    },
    // { min: 3, max: 5, message: "Length should be 3 to 5", trigger: "blur" },
  ],
  targetDirName: [
    {
      required: true,
      message: "请输入输出文件夹，即要翻译后的文件要保存的文件夹名称，如 en-US",
      trigger: "blur",
    },
    // { min: 3, max: 5, message: "Length should be 3 to 5", trigger: "blur" },
  ],
  appId: [
    { required: true, message: "请输入百度翻译的 appId", trigger: "blur" },
    // { min: 3, max: 5, message: "Length should be 3 to 5", trigger: "blur" },
  ],
  appKey: [
    { required: true, message: "请输入百度翻译的 appKey", trigger: "blur" },
    // { min: 3, max: 5, message: "Length should be 3 to 5", trigger: "blur" },
  ],
  ignoreFiles: [
    {
      required: true,
      message: "请输入忽略文件夹，如 node_modules",
      trigger: "blur",
    },
  ],
};
const onSubmit = () => {
  formRef.value
    .validate()
    .then(() => {
      console.log(`${isNoConfig.value ? "初始化配置" : "修改配置"} `);
      console.log("values", formState, toRaw(formState));
      const params = {
        action: "add",
        configName: "translate",
        configData: {
          ...toRaw(formState),
        },
      };
      console.log(`params`, params);
      ipc.invoke(ipcApiRoute.jsondbOperation, params).then((res) => {
        console.log("res:", res);
        console.log(`操作完成`);
        // this.$message.success(`success`);
      });
    })
    .catch((error: ValidateErrorEntity<FormState>) => {
      console.log("error", error);
    });
};
const resetForm = () => {
  formRef.value.resetFields();
  const { sourceDirName, targetDirName, appId, appKey, ignoreFiles } =
    defaultFormState;
  formState.appId = appId;
  formState.appKey = appKey;
  formState.ignoreFiles = ignoreFiles;
  formState.sourceDirName = sourceDirName;
  formState.targetDirName = targetDirName;
};

const getTranslateConfig = () => {
  const params = {
    action: "all",
    configName: "translate",
  };
  ipc.invoke(ipcApiRoute.jsondbOperation, params).then((res) => {
    console.log("res:", res);
    if (!res.config) {
      isNoConfig.value = true;
    } else {
      isNoConfig.value = false;
      formState.appId = res.config.appId;
      formState.appKey = res.config.appKey;
      formState.ignoreFiles = res.config.ignoreFiles;
      formState.sourceDirName = res.config.sourceDirName;
      formState.targetDirName = res.config.targetDirName;
    }
    // this.all_list = res.all_list;
  });
};

onMounted(async () => {
  getTranslateConfig();
});
</script>
<style lang="less" scoped></style>
