import{i as e}from"./main-ce25b28f.js";import{i as s}from"./ipcRenderer-5e19eaee.js";import{a}from"./index-91e21252.js";import{s as r}from"./store2-ef7c0aa3.js";import{_ as t,r as o,o as i,b as n,g as d,a as v,w as c,e as m,p as l,f}from"./index-97090024.js";const u={data:()=>({server:""}),methods:{startServer(){s.invoke(e.startJavaServer,{}).then((e=>{0!=e.code?this.$message.error(e.msg):(this.$message.info("异步启动"),r.set("javaService",e.server))}))},closeServer(){s.invoke(e.closeJavaServer,{}).then((e=>{0!=e.code&&this.$message.error(e.msg),this.$message.info("异步关闭"),r.remove("javaService")}))},sendRequest(){const e=r.get("javaService")||"";if(""==e)return void this.$message.error("服务未开启 或 正在启动中");a({method:"get",url:e+"/test1/get",params:{id:"1111111"},timeout:6e4}).then((e=>{const s=e.data||null;this.$message.info(`java服务返回: ${s}`)}))}}},p={id:"app-other"},g=(e=>(l("data-v-da7e5fd3"),e=e(),f(),e))((()=>d("div",{class:"one-block-1"},[d("span",null," 请求java服务接口 ")],-1))),h={class:"one-block-2"};const j=t(u,[["render",function(e,s,a,r,t,l){const f=o("a-button"),u=o("a-space");return i(),n("div",p,[g,d("div",h,[v(u,null,{default:c((()=>[v(f,{onClick:s[0]||(s[0]=e=>l.startServer())},{default:c((()=>[m(" 启动java项目 ")])),_:1}),v(f,{onClick:s[1]||(s[1]=e=>l.sendRequest())},{default:c((()=>[m(" 测试接口 ")])),_:1}),v(f,{onClick:s[2]||(s[2]=e=>l.closeServer())},{default:c((()=>[m(" 关闭java项目 ")])),_:1})])),_:1})])])}],["__scopeId","data-v-da7e5fd3"]]);export{j as default};
