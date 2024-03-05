<template>
  <a-layout id="app-menu">
    <a-layout-header
      theme="light"
      style="padding: 0; height: 40px; line-height: 40px"
    >
      <a-menu
        theme="light"
        mode="horizontal"
        :selectedKeys="[current]"
        @click="changeMenu"
      >
        <a-menu-item v-for="(menuInfo, subIndex) in menu" :key="subIndex">
          <router-link
            :to="{ name: menuInfo.pageName, params: menuInfo.params }"
          >
            <span>{{ menuInfo.title }}</span>
          </router-link>
        </a-menu-item>
      </a-menu>
    </a-layout-header>
    <a-layout>
      <a-layout-content class="overflow-hidden">
        <router-view v-slot="{ Component }">
          <transition>
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script>
// import { reactive } from 'vue';
import subMenu from "@/router/subMenu";

export default {
  // setup() {
  //   const state = reactive({
  //     selectedKeys: ['menu_100'],
  //   });

  //   const handleClick = e => {
  //     state.selectedKeys = [e.key];
  //   };

  //   return {
  //     state,
  //     handleClick,
  //   };
  // },
  props: {
    id: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      menu: {},
      //selectedKeys: ['menu_100'],
      current: "menu_100",
      keys: [],
    };
  },
  watch: {
    id: function () {
      console.log("watch id ----- ", this.id);
      this.current = "menu_100";
      this.menuHandle();
    },
  },
  created() {},
  mounted() {
    this.menuHandle();
  },
  methods: {
    menuHandle() {
      // 该组件优先被加载了，所以没拿到参数
      //console.log('params:', this.$route);

      console.log("menu ------ id:", this.id);
      this.menu = subMenu[this.id];
      console.log(`submene`, this.menu);
      const linkInfo = this.menu[this.current];
      this.$router.push({ name: linkInfo.pageName, params: linkInfo.params });
    },
    changeMenu(e) {
      console.log("changeMenu e:", e);
      this.current = e.key;
    },
  },
};
</script>
<style lang="less" scoped>
#app-menu {
  height: 100%;
  .layout-sider {
    border-top: 1px solid #e8e8e8;
    border-right: 1px solid #e8e8e8;
    background-color: #fafafa;
    overflow: auto;
  }
}
</style>
