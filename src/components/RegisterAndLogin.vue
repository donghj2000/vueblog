<template>
    <el-dialog
        :title="isLogin ? '登陆' : '注册'"
        width="40%"
        v-model="state.visible"
        @close="cancel"
        :show-close="true"
        center
    >
        <el-form 
            ref="loginForm" 
            :model="state.loginForm" 
            :rules="state.rules" 
            autocomplete="on" 
            label-position="left"
        >
            <el-formItem label="账号" 
                :label-width="state.formLabelWidth"
                prop="username"
            >
                <el-input
                    ref="username"
                    v-model="state.loginForm.username"
                    placeholder="用户名"
                    autocomplete="on"
                    name="username"
                    tabindex="1"
                    type="text"
                />
            </el-formItem>
            <el-tooltip
                v-model="state.capsTooltip"
                content="Caps lock is On"
                manual
                placement="right"
            >
                <el-formItem label="密码" 
                    :label-width="state.formLabelWidth"
                    prop="password"
                >
                    <el-input
                        ref="password"
                        type="password"
                        placeholder="密码"
                        v-model="state.loginForm.password"
                        autocomplete="on"
                        name="password"
                        tabindex="2"
                        @blur="state.capsTooltip = false"
                        @keyup="checkCapslock"
                    />
                </el-formItem>
            </el-tooltip>

            <el-space
                v-if="isLogin"
                alignment="start" :size="30">
                <el-form-item>
                    <el-checkbox v-model="state.remember" label="Remember" size="large">Remember me</el-checkbox>
                </el-form-item>
                <el-popconfirm title="新密码将发送到你注册的邮箱中，确定吗？" cancelButtonText='取消'   confirmButtonText='确定' 
                   @confirm="sendNewPasswd">
                    <template #reference>
                        <el-button type="text">
                            忘记密码
                        </el-button>
                    </template>
                </el-popconfirm>
            </el-space>

            <el-tooltip
                v-if="isRegister"
                v-model="state.capsTooltip"
                content="Caps lock is On"
                manual
                placement="right"
            >
                <el-formItem 
                    label="密码"
                    :label-width="state.formLabelWidth"
                    prop="password2"
                    >
                    <el-input
                        type="password"
                        placeholder="确认密码"
                        v-model="state.loginForm.password2"
                        autocomplete="on"
                        name="password2"
                        tabindex="3"
                        @blur="state.capsTooltip = false"
                        @keyup="checkCapslock"
                    />
                </el-formItem>
            </el-tooltip>

            <el-formItem 
                v-if="isRegister" label="昵称"
                :label-width="state.formLabelWidth"
            >
                <el-input
                    v-model="state.loginForm.nickname"
                    placeholder="昵称"
                    autocomplete="off"
                    tabindex="4"
                    type="text"
                />
            </el-formItem>

            <el-formItem 
                v-if="isRegister" label="邮箱" 
                :label-width="state.formLabelWidth"
                prop="email"
            >
                <el-input
                    v-model="state.loginForm.email"
                    placeholder="邮箱"
                    autocomplete="off"
                    tabindex="5"
                    type="text"
                />
            </el-formItem>

            <el-formItem 
                v-if="isRegister" label="简介"
                :label-width="state.formLabelWidth"
            >
                <el-input
                    v-model="state.loginForm.desc"
                    placeholder="个人简介"
                    autocomplete="off"
                    tabindex="6"
                    type="textarea"
                    :autosize="{ minRows: 2, maxRows: 4 }"
                />
            </el-formItem>

            <el-formItem
                v-if="isRegister" label="头像"
                :label-width="state.formLabelWidth"
            >
                <el-upload
                    class="avatar-uploader"
                    action="/api/upload/avatar"
                    :show-file-list="false"
                    :on-success="handleAvatarSuccess"
                    :before-upload="beforeAvatarUpload"
                >
                    <img v-if="state.loginForm.avatar" :src="state.loginForm.avatar" class="avatar" />
                    <Plus v-else class="avatar-uploader-icon" width="100" height="100" />
                </el-upload>
            </el-formItem>
        </el-form>

        <div v-if="isLogin" class="third-button">
            <h5>使用第三方帐号登录</h5>    
            <el-space size="medium">
                <a class="qq" href="http://127.0.0.1:8000/login/qq/">qq</a>
                <a class="sina" href="http://127.0.0.1:8000/login/weibo/">weibo</a>
                <a class="weixin" href="http://127.0.0.1:8000/login/weixin/">weixin</a>
            </el-space>
        </div>

        <template v-slot:footer >
            <el-button
                v-if="isLogin"
                :loading="state.btnLoading"
                type="primary"
                @click="handleOk"
            >
                登录
            </el-button>

            <el-button
                v-if="isRegister"
                :loading="state.btnLoading"
                type="primary"
                @click="handleOk"
            >
                注 册
            </el-button>
        </template>

    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, reactive, watch, ref, onMounted, getCurrentInstance} from "vue";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import { Plus } from '@element-plus/icons-vue';
import { SET_USER, StateKey } from "../store";
import { login, register, jwtLogin, getUserDetail, forgetPassword } from "../api/service";
import { User } from "../types";
import { getCookie, setCookie, delCookie } from "../utils";

/*
import type {
  UploadFile,
  ElFile,
} from 'element-plus/es/components/upload/src/upload.type';
*/
export default defineComponent({
    name: "RegisterAndLogin",
    components: {  Plus },

    data(){
        return { Plus }
    },

    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        handleFlag:{
            type: String,
            default: "",
        },
    },

    computed: {
        isLogin(): boolean {
            return this.handleFlag === "login";
        },
        isRegister(): boolean {
            return this.handleFlag === "register";
        }
    },

    emits: ["close"],

    setup(props, context){
        const validatePassword = (rule: any, value: string, callback: Function) => {
            if (value.length < 6) {
                callback(new Error("密码长度不能小于6位"));
            } else {
                if (state.loginForm.password2 !== "" && value !== state.loginForm.password2) {
                    callback(new Error("两个密码不一致"));
                } else {
                    callback();
                }
            }
        };     
           
        const validatePassword2 = (rule: any, value: string, callback: Function) => {
            if (value.length < 6) {
                callback(new Error("密码长度不能小于6位"));
            } else {
                if (state.loginForm.password !== "" && value !== state.loginForm.password) {
                    callback(new Error("两个密码不一致"));
                } else {
                    callback();
                }
            }
        };

        const validateEmail = (rule: any, value: string, callback: Function) => {
            const reg = new RegExp(
                "^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$"
            );
            if (!reg.test(value)) {
                callback(new Error("邮箱格式不对"));
            } else {
                callback();
            }
        };

        const store: any = useStore(StateKey); 
        const state = reactive({
            visible: props.visible,
            handleFlag: props.handleFlag,
            btnLoading: false,
            loading: false,
            formLabelWidth: "60px",
            loginForm: {
                username: "",
                password: "",
                password2: "",
                nickname: "",
                avatar:"",
                email: "",
                desc: ""
            },
            capsTooltip: false,
            remember: false,
            rules:{
                username: [{required: true, trigger: "blur"}],
                password: [{ required:true, trigger: "blur",
                             validator: validatePassword,
                           }],
                password2: [{ required:true, trigger: "blur",
                              validator: validatePassword2,
                           }],
                email:    [{ required:true, trigger:"blur",
                             validator: validateEmail,
                           }],
            },
        });

        const checkCapslock = (e: KeyboardEvent) => {
            const { key } = e;
            state.capsTooltip =
                (key && key.length === 1 && key >= "A" && key <= "Z");
        };

        const cancel = (): boolean=> {
            context.emit("close");
            state.visible = false;
            state.handleFlag = "";
            return false;
        };

        watch(props, (val, oldVal) => {
            state.visible = val.visible;
            state.handleFlag = val.handleFlag;

            if (state.visible == true) {
                if (state.handleFlag === "login") {
                    let username = "",            
                        password = "",   
                        remember = getCookie("blogRemember");    

                    if (remember==="true") {
                        username = getCookie("blogUsername");            
                        password = getCookie("blogPassword"); 

                        state.loginForm.username = username;
                        state.loginForm.password = password;
                        state.remember = true;
                    }
                }
            }
        });

        const handleAvatarSuccess = (res: any, file: any) => {
            if (file.status === "success") {
                let res: any = file.response;
                state.loginForm.avatar = res.url;
            }
        };

        const beforeAvatarUpload = (file: any) => {
            const isJPG = (file.type === 'image/jpeg' || file.type === 'image/png');
            const isLt2M = file.size / 1024 / 1024 < 2;

            if (!isJPG) {
                ElMessage.error('Avatar picture must be JPG or PNG format!')
            }
            if (!isLt2M) {
                ElMessage.error('Avatar picture size can not exceed 2MB!')
            }
            return isJPG && isLt2M;
        };

        return {
            store,
            state,
            checkCapslock,
            cancel,
            handleAvatarSuccess,
            beforeAvatarUpload
        };
    },

    methods:{
        sendNewPasswd() {
            this.$refs.loginForm.validateField("username", async (isValid: boolean)=>{
                if (isValid) {
                    try {
                        let data: any = await forgetPassword({username: this.state.loginForm.username});
                        this.$message({
                            message: data.data.detail,
                            type: "success",
                            duration: 3* 1000,
                        }); 

                        this.$refs.loginForm.resetFields();
                    } catch (e) {
                        console.error(e);
                        this.$message({
                            message: "发送邮件失败",
                            type: "error",
                            duration: 3* 1000,
                        }); 
                    }
                }
            });
        },
        handleOk() {
            this.$refs.loginForm.validate(async (isValid: boolean)=>{
                if (isValid) {
                    if (this.state.handleFlag === "login") {
                        if (this.state.remember) {
                            setCookie("blogUsername", this.state.loginForm.username, 30, 0, 0);
                            setCookie("blogPassword", this.state.loginForm.password, 30, 0, 0);
                            setCookie("blogRemember", this.state.remember, 30, 0, 0);      
                        } else {
                            delCookie("blogUsername");
                            delCookie("blogPassword");
                            delCookie("blogRemember");
                        }
                    }

                    this.state.loading = true;
                    if (this.state.handleFlag === "login") {
                        const req = {
                            username: this.state.loginForm.username,
                            password: this.state.loginForm.password,
                        };
                        try {
                            let data = null;
                            let user = null;
                            let expire_days = 0;

                            // 一，传统验证方式
                            //data = await login(req));
                            //user = data.data;

                            // 二，jwt验证方式
                            data = await jwtLogin(req);
                            //三-1 jwt。服务器端生成cookie,键为jwt_cookie,js读不到，不需要客户端处理，浏览器会自己带上。
                            //并且登陆后会返回用户信息(自己添加的)
                            user = data.data.user;
                            expire_days = data.data.expire_days;
                            ////////////////////////////
                            
                            //三-2 simple-jwt。 浏览器自己保存,并在http请求header里自己手动带上。登陆后没有返回用户信息
                            // setCookie("SimpleJwt", data.data.access, data.data.expire_days, 0, 0);
                            // const id = data.data.id;
                            // expire_days = data.data.expire_days;
                            // data = await getUserDetail(id); 
                            // user = data.data;
                            ////////////////////////////
                            this.$refs.loginForm.resetFields();
                            this.$message({
                                message: "登陆成功!",
                                type: "success",
                                duration: 3* 1000,
                            });                     

                            this.store.commit(SET_USER, {
                                user,
                            });

                            this.cancel();
                                                        
                            let userInfo = JSON.stringify(user);
                            setCookie("userInfo", userInfo, expire_days, 0, 0);
                            if (user.is_superuser) {
                                await this.$router.push({
                                   path: "/admin",
                                });
                            } 
                        } catch(e) {
                            this.$message({
                                message: "登陆失败!",
                                type: "error",
                                duration: 3* 1000,
                            }); 
                            console.error(e);
                        }
                    } else {
                        try {
                            const req = {
                                username: this.state.loginForm.username,
                                password: this.state.loginForm.password,
                                nickname: this.state.loginForm.nickname,
                                avatar:   this.state.loginForm.avatar,
                                email:    this.state.loginForm.email,
                                desc:     this.state.loginForm.desc
                            };

                            await register(req);
                            this.$refs.loginForm.resetFields();
                            this.$message({
                                message: "注册成功!",
                                type: "success",
                                duration: 3* 1000,
                            });  
                            this.cancel();  
                        } catch (e) {
                            this.$message({
                                message: "注册失败!",
                                type: "error",
                                duration: 3* 1000,
                            }); 
                            console.error(e); 
                        }
                    }
                    this.state.loading = false;
                }
            });
        }
    }
});    
</script>

<style scoped>
.dialog-footer {
      text-align: center;
}
.avatar-uploader .el-upload {
  border: 3px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.el-icon .avatar-uploader-icon {
  font-size: 20px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
.avatar {
  width: 120px;
  height: 140px;
  display: block;
}

.third-button {
    float: right;
}
</style>
