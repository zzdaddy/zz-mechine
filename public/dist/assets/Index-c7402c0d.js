import{i as e}from"./main-ce25b28f.js";import{i as s}from"./ipcRenderer-5e19eaee.js";import{s as a}from"./store2-ef7c0aa3.js";import{_ as o,r as t,o as l,b as i,g as n,a as d,w as c,e as r,p as u,f as p}from"./index-97090024.js";const f=[{content:"【下载】目录",id:"downloads"},{content:"【图片】目录",id:"pictures"},{content:"【文档】目录",id:"documents"},{content:"【音乐】目录",id:"music"}],h={data:()=>({file_list:f,action_url:"",image_info:[],num:0,servicAddress:"",dir_path:"D:\\www\\ee"}),mounted(){this.getHost()},methods:{getHost(){s.invoke(e.checkHttpServer,{}).then((s=>{if(s.enable){this.servicAddress=s.server,a.set("httpServiceConfig",s);const o=s.server||"http://localhost:7071";let t=e.uploadFile.split(".").join("/");this.action_url=o+"/"+t}}))},openDirectry(a){s.invoke(e.openDirectory,{id:a}).then((e=>{}))},selectDir(){s.invoke(e.selectFolder,"").then((e=>{this.dir_path=e,this.$message.info(e)}))},messageShow(){s.invoke(e.messageShow,"").then((e=>{this.$message.info(e)}))},messageShowConfirm(){s.invoke(e.messageShowConfirm,"").then((e=>{this.$message.info(e)}))},handleFileChange(e){if(console.log("handleFileChange-----"),""==this.action_url)return void this.$message.error("http服务未开启");const s=e.file.status;if("uploading"!==s&&console.log(e.file),"done"===s){const s=e.file.response;if(console.log("uploadRes:",s),"success"!==s.code)return this.$message.error(`file upload failed ${s.code} .`),!1;this.num++;const a=s.data;a.id=this.num,a.imageUrlText="image url",this.image_info.push(a),this.$message.success(`${e.file.name} file uploaded successfully.`)}else"error"===s&&this.$message.error(`${e.file.name} file upload failed.`)}}},m=e=>(u("data-v-d30dccef"),e=e(),p(),e),g={id:"app-base-file"},_=m((()=>n("div",{class:"one-block-1"},[n("span",null," 1. 系统原生对话框 ")],-1))),v={class:"one-block-2"},k=m((()=>n("div",{class:"one-block-1"},[n("span",null," 2. 选择保存目录 ")],-1))),C={class:"one-block-2"},b=m((()=>n("div",{class:"one-block-1"},[n("span",null," 3. 打开文件夹 ")],-1))),w={class:"one-block-2"},$=m((()=>n("div",{class:"one-block-1"},[n("span",null," 4. 上传文件到图床 ")],-1))),S={class:"one-block-2"},D=m((()=>n("p",{class:"ant-upload-drag-icon"},null,-1))),j=m((()=>n("p",{class:"ant-upload-text"}," 点击 或 拖拽文件到这里 ",-1))),y=m((()=>n("p",{class:"ant-upload-hint"}," 注意：请使用您自己的图床token ",-1))),F=m((()=>n("div",{class:"footer"},null,-1)));const x=o(h,[["render",function(e,s,a,o,u,p){const f=t("a-button"),h=t("a-space"),m=t("a-input"),x=t("a-col"),H=t("a-row"),V=t("a-card"),A=t("a-list-item"),I=t("a-list"),R=t("a-upload-dragger");return l(),i("div",g,[_,n("div",v,[d(h,null,{default:c((()=>[d(f,{onClick:s[0]||(s[0]=e=>p.messageShow())},{default:c((()=>[r("消息提示(ipc)")])),_:1}),d(f,{onClick:s[1]||(s[1]=e=>p.messageShowConfirm())},{default:c((()=>[r("消息提示与确认(ipc)")])),_:1})])),_:1})]),k,n("div",C,[d(H,null,{default:c((()=>[d(x,{span:12},{default:c((()=>[d(m,{modelValue:u.dir_path,"onUpdate:modelValue":s[2]||(s[2]=e=>u.dir_path=e),value:u.dir_path,"addon-before":"保存目录"},null,8,["modelValue","value"])])),_:1}),d(x,{span:12},{default:c((()=>[d(f,{onClick:p.selectDir},{default:c((()=>[r(" 修改目录 ")])),_:1},8,["onClick"])])),_:1})])),_:1})]),b,n("div",w,[d(I,{grid:{gutter:16,column:4},"data-source":u.file_list},{renderItem:c((({item:e})=>[d(A,{onClick:s=>p.openDirectry(e.id)},{default:c((()=>[d(V,{title:e.content},{default:c((()=>[d(f,{type:"link"},{default:c((()=>[r(" 打开 ")])),_:1})])),_:2},1032,["title"])])),_:2},1032,["onClick"])])),_:1},8,["data-source"])]),$,n("div",S,[d(R,{name:"file",multiple:!0,action:u.action_url,onChange:p.handleFileChange},{default:c((()=>[D,j,y])),_:1},8,["action","onChange"])]),F])}],["__scopeId","data-v-d30dccef"]]);export{x as default};
