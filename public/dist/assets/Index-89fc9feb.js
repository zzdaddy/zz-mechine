import{i as e}from"./main-ce25b28f.js";import{i as t}from"./ipcRenderer-5e19eaee.js";import{_ as a,r as s,o,b as n,g as l,a as r,w as d,t as u,e as m,p as h,f as i}from"./index-97090024.js";const c={data:()=>({currentThemeMode:"",themeList:["system","light","dark"]}),mounted(){},methods:{setTheme(a){this.currentThemeMode=a.target.value,console.log("setTheme currentThemeMode:",this.currentThemeMode),t.invoke(e.setTheme,this.currentThemeMode).then((e=>{console.log("result:",e),this.currentThemeMode=e}))},getTheme(){t.invoke(e.getTheme).then((e=>{console.log("result:",e),this.currentThemeMode=e}))}}},T=e=>(h("data-v-5a0f8a17"),e=e(),i(),e),v={id:"app-base-screen"},f=T((()=>l("div",{class:"one-block-1"},[l("span",null," 1. 系统主题模式 ")],-1))),p={class:"one-block-2"},g=T((()=>l("div",{class:"one-block-1"}," 2. 设置主题模式（请自行实现前端UI效果） ",-1))),M={class:"one-block-2"};const _=a(c,[["render",function(e,t,a,h,i,c){const T=s("a-button"),_=s("a-space"),k=s("a-radio"),b=s("a-radio-group");return o(),n("div",v,[f,l("div",p,[r(_,null,{default:d((()=>[r(T,{onClick:t[0]||(t[0]=e=>c.getTheme())},{default:d((()=>[m("获取模式")])),_:1})])),_:1}),l("span",null," 结果："+u(i.currentThemeMode),1)]),g,l("div",M,[r(b,{modelValue:i.currentThemeMode,"onUpdate:modelValue":t[1]||(t[1]=e=>i.currentThemeMode=e),onChange:c.setTheme},{default:d((()=>[r(k,{value:i.themeList[0]},{default:d((()=>[m(u(i.themeList[0]),1)])),_:1},8,["value"]),r(k,{value:i.themeList[1]},{default:d((()=>[m(u(i.themeList[1]),1)])),_:1},8,["value"]),r(k,{value:i.themeList[2]},{default:d((()=>[m(u(i.themeList[2]),1)])),_:1},8,["value"])])),_:1},8,["modelValue","onChange"])])])}],["__scopeId","data-v-5a0f8a17"]]);export{_ as default};
