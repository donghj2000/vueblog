<template>
    <div class="login-container">
        <el-form 
            ref="loginForm"
            class="login-form"
            :model="state.loginForm" 
            :rules="state.rules" 
            autocomplete="on" 
            label-position="left"
        >
            <div class="title-container">
                <h3 class="title">留言</h3>
            </div>

            <el-formItem 
                label="邮箱" 
                :label-width="state.formLabelWidth"
                prop="email"
            >
                <el-input
                    v-model="state.loginForm.email"
                    placeholder="邮箱"
                    autocomplete="off"
                    tabindex="1"
                    type="text"
                />
            </el-formItem>

            <el-formItem label="&nbsp;&nbsp;&nbsp;手机" 
                :label-width="state.formLabelWidth"
                prop="phone"
            >
                <el-input
                    ref="phone"
                    v-model="state.loginForm.phone"
                    placeholder="手机"
                    autocomplete="on"
                    name="phone"
                    tabindex="2"
                    type="text"
                />
            </el-formItem>

           <el-formItem label="&nbsp;&nbsp;&nbsp;姓名" 
                :label-width="state.formLabelWidth"
                prop="name"
            >
                <el-input
                    ref="name"
                    v-model="state.loginForm.name"
                    placeholder="姓名"
                    autocomplete="on"
                    name="name"
                    tabindex="3"
                />
            </el-formItem>

            <el-formItem label="&nbsp;&nbsp;&nbsp;内容" 
                :label-width="state.formLabelWidth"
                prop="content"
            >
                <el-input
                    ref="username"
                    v-model="state.loginForm.content"
                    placeholder="内容"
                    autocomplete="on"
                    name="content"
                    tabindex="4"
                    type="textarea"
                    :autosize="{ minRows: 2, maxRows: 4 }"
                />
            </el-formItem>

            <el-button
                :loading="state.loading"
                type="primary"
                @click="handleOk"
            >
                确定
            </el-button>
        </el-form>
    </div>
</template>
<script lang="ts">
import { defineComponent, reactive } from "vue";
import { addMessage } from "../../api/service";

export default defineComponent({
    name: "Message",
    setup() {
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

        const state = reactive({
            rules:{
                email: [{ required:true, trigger:"blur",
                          validator: validateEmail,
                       }],
            },
            formLabelWidth: "60px",
            loginForm: {
                email: "",
                content: "",
                phone: "",
                name: ""
            },
            loading: false
        });

        return {
            state
        };
    },
    methods: {
        handleOk() {
            this.$refs.loginForm.validate(async (valid: boolean)=>{
                if (valid) {
                    this.state.loading = true;
                    try {
                        await addMessage(this.state.loginForm);
                        this.$message({
                            message: "留言成功",
                            type: "success",
                            duration: 3* 1000,
                        }); 
                    } catch(e) {
                        console.error(e);
                        this.$message({
                            message: "留言失败",
                            type: "success",
                            duration: 3* 1000,
                        });
                    }
                    
                    this.state.loading = false;
                }
            });
        }
    }
});
</script>
<style lang="less">
.login-container {
  min-height: 100%;
  width: 100%;
  overflow: hidden;
  background-repeat: no-repeat;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: hue-rotate(200deg);
}

.login-form {
  //position: absolute;
  width: 300px;
  max-width: 100%;
  overflow: hidden;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  height: 450px;
}

.title-container {
  position: relative;
  color: #333;
}

.title-container .title {
  font-size: 40px;
  margin: 0px auto 40px auto;
  text-align: center;
  font-weight: bold;
}
</style>