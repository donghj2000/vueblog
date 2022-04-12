<template>
    <el-dialog
        :title="isModifyInfo ? '修改信息' : '修改密码'"
        width="40%"
        v-model="state.visible"
        @close="cancel"
        :show-close="true"
        destroy-on-close
        center
    >
        <el-form
            ref="loginForm" 
            :model="state.loginForm" 
            :rules="state.rules" 
            autocomplete="on"  
            label-position="left"
        >
            <el-formItem 
                v-if="isModifyInfo" label="昵称"
                :label-width="state.formLabelWidth"
            >
                <el-input
                    v-model="state.loginForm.nickname"
                    placeholder="昵称"
                    autocomplete="off"
                    tabindex="1"
                    type="text"
                />
            </el-formItem>
            <el-formItem 
                v-if="isModifyInfo" label="邮箱" 
                :label-width="state.formLabelWidth"
                prop="email"
            >
                <el-input
                    v-model="state.loginForm.email"
                    placeholder="邮箱"
                    autocomplete="off"
                    tabindex="2"
                    type="text"
                />
            </el-formItem>
            <el-formItem 
                v-if="isModifyInfo" label="简介"
                :label-width="state.formLabelWidth"
            >
                <el-input
                    v-model="state.loginForm.desc"
                    placeholder="个人简介"
                    autocomplete="off"
                    tabindex="3"
                    type="text"
                />
            </el-formItem>
            <el-formItem
                v-if="isModifyInfo" label="头像"
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
                    <Plus v-else class="avatar-uploader-icon" width="100" height="100"/>
                </el-upload>
            </el-formItem>

            <el-tooltip v-if="isModifyPasswd"
                v-model="state.capsTooltip"
                content="Caps lock is On"
                manual
                placement="right"
            >
                <el-formItem label="旧密码" 
                    :label-width="state.formLabelWidth"
                    prop="password"
                >
                    <el-input
                        ref="password"
                        type="password"
                        placeholder="旧密码"
                        v-model="state.loginForm.password"
                        autocomplete="on"
                        name="password"
                        tabindex="1"
                        @blur="state.capsTooltip = false"
                        @keyup="checkCapslock"
                    />
                </el-formItem>
            </el-tooltip>

            <el-tooltip
                v-if="isModifyPasswd"
                v-model="state.capsTooltip"
                content="Caps lock is On"
                manual
                placement="right"
            >
                <el-formItem 
                    label="新密码"
                    :label-width="state.formLabelWidth"
                    prop="new_password"
                    >
                    <el-input
                        type="password"
                        placeholder="新密码"
                        v-model="state.loginForm.new_password"
                        autocomplete="on"
                        name="new_password"
                        tabindex="2"
                        @blur="state.capsTooltip = false"
                        @keyup="checkCapslock"
                    />
                </el-formItem>
            </el-tooltip>

             <el-tooltip
                v-if="isModifyPasswd"
                v-model="state.capsTooltip"
                content="Caps lock is On"
                manual
                placement="right"
            >
                <el-formItem 
                    label="确认新密码"
                    :label-width="state.formLabelWidth"
                    prop="new_password2"
                    >
                    <el-input
                        type="password"
                        placeholder="确认新密码"
                        v-model="state.loginForm.new_password2"
                        autocomplete="on"
                        name="new_password2"
                        tabindex="3"
                        @blur="state.capsTooltip = false"
                        @keyup="checkCapslock"
                    />
                </el-formItem>
            </el-tooltip>


        </el-form>
        <template v-slot:footer>
            <div class="dialog-footer">
                <el-button
                    :loading="state.btnLoading"
                    type="primary"
                    @click="handleOk"
                >
                    确定
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, reactive, watch } from "vue";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import { Plus } from '@element-plus/icons-vue';
import { SET_USER, StateKey } from "../store";
import { changePassword, saveUser } from "../api/service";
import { User } from "../types";
import { getCookie, setCookie, delCookie } from "../utils";
/*
import type {
  UploadFile,
  ElFile,
} from 'element-plus/es/components/upload/src/upload.type';
*/
export default defineComponent({
    name: "ModifyInfoAndPasswd",
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
        isModifyInfo(): boolean {
            return this.handleFlag === "modifyInfo";
        },
        isModifyPasswd(): boolean {
            return this.handleFlag === "modifyPasswd";
        },
    },

    emits: ["close"],

    setup(props, context){
        const validatePassword = (rule: any, value: string, callback: Function) => {
            if (value.length < 6) {
                callback(new Error("密码长度不能小于6位"));
            } else {
                if (state.loginForm.new_password2 !== "" && value !== state.loginForm.new_password2) {
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
                if (state.loginForm.new_password !== "" && value !== state.loginForm.new_password) {
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
                password: "",
                new_password: "",
                new_password2:"",

                nickname: "",
                email: "",
                desc: "",
                avatar:""
            },

            capsTooltip: false,
            remember: false,
            rules:{
                new_password: [{ required:true, trigger: "blur",
                                 validator: validatePassword,
                              }],

                new_password2: [{ required:true, trigger: "blur",
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
            return false;
        };

        watch(props, (val, oldVal) => {
            state.visible = val.visible;
            state.handleFlag = val.handleFlag;

            if (state.visible == true) {
                if (state.handleFlag === "modifyInfo") {
                    state.loginForm.nickname = store.state.user.nickname;
                    state.loginForm.email    = store.state.user.email;
                    state.loginForm.desc     = store.state.user.desc;
                    state.loginForm.avatar   = store.state.user.avatar;
                } else {
                    state.loginForm.password = "";
                    state.loginForm.new_password = "";
                    state.loginForm.new_password2 = "";
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
            state,
            checkCapslock,
            cancel,
            handleAvatarSuccess,
            beforeAvatarUpload
        };
    },
    
    methods: {
        handleOk() {
            this.$refs.loginForm.validate(async (valid: boolean)=>{
                if (valid) {
                    try {
                        if (this.state.handleFlag === "modifyInfo") {
                            const req: any = {
                                id: this.$store.state.user.id,
                                nickname: this.state.loginForm.nickname,
                                email: this.state.loginForm.email,
                                desc: this.state.loginForm.desc,
                                avatar: this.state.loginForm.avatar
                            };

                            await saveUser("patch", req);
                            this.$message({
                                message: "修改个人信息成功. 请退出后重新登陆!",
                                type: "success",
                                duration: 3* 1000,
                            });   

                            let user = this.$store.state.user;
                            user.nickname = this.state.loginForm.nickname;
                            user.email =this.state.loginForm.email;
                            user.desc = this.state.loginForm.desc;
                            user.avatar = this.state.loginForm.avatar;
                            this.$store.commit(SET_USER, {
                                user,
                            });
                            delCookie("userInfo");
                        } else {
                            const req = {
                                password:     this.state.loginForm.password,
                                new_password: this.state.loginForm.new_password
                            };
                            await changePassword(req);

                            this.$message({
                                message: "修改密码成功!",
                                type: "success",
                                duration: 3* 1000,
                            });   
                        }
                        
                        this.cancel();
                    } catch(e) {
                        console.error(e);
                        this.$message({
                            message: "修改失败!",
                            type: "error",
                            duration: 3* 1000,
                        });
                    } 
                } 
            });     
        }
    }
});    
</script>

<style scoped>
.dialog-footer {
      text-align: right;
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
  width: 178px;
  height: 178px;
  display: block;
}
</style>