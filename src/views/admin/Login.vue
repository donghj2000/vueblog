<template>
    <div class="login-container">
        <el-form 
            ref="loginForm" 
            :model="state.loginForm" 
            :rules="rules" 
            autocomplete="on" 
            class="login-form" 
            label-position="left"
        >
            <div class="title-container">
                <h3 class="title">博客管理后台</h3>
            </div>

            <el-form-item label="账号" prop="username">
                <el-input
                    ref="username"
                    v-model="state.loginForm.username"
                    autocomplete="on"
                    name="username"
                    placeholder="username"
                    tabindex="1"
                    type="text"
                />
            </el-form-item>

            <el-tooltip
                v-model="state.capsTooltip"
                content="Caps lock is On"
                manual
                placement="right"
            >
                <el-form-item label="密码" prop="password">
                  <el-input
                    :key="state.passwordType"
                    ref="password"
                    v-model="state.loginForm.password"
                    :type="state.passwordType"
                    autocomplete="on"
                    name="password"
                    placeholder="password"
                    tabindex="2"
                    @blur="state.capsTooltip = false"
                    @keyup="checkCapslock"
                    @keyup.enter="handleLogin"
                  />
                </el-form-item>
            </el-tooltip>
            <el-form-item>
                <el-checkbox v-model="state.remember" label="Remember" size="large">Remember me</el-checkbox>
            </el-form-item>

            <el-button 
                :loading="state.loading"
                style="width:100%;margin-bottom:30px"
                type="primary"
                @click.prevent="handleLogin"
            >
                Login
            </el-button>
        </el-form>
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { forgetPassword,login, jwtLogin, getUserDetail } from "../../api/service";
import { SET_USER } from "../../store";
import { User } from "../../types";
import { getCookie, setCookie, delCookie } from "./../../utils/index";

export default defineComponent({
        name: "Login",
        setup() {
            const validatePassword = (rule: any, value: string, callback: Function) => {
                if (value.length < 6) {
                    callback(new Error("The password can not be less than 6 digits"));
                } else {
                    callback();
                }
            };

            const state = reactive({
                loginForm: {
                    username: "",
                    password: "",
                },
                passwordType: "password",
                capsTooltip: false,
                loading: false,
                remember: false,

                loginRules:{
                    username: [{required: true, trigger:"blur"}],
                    password: [
                        {
                            required:true,
                            trigger:"blur",
                            validator: validatePassword,
                        },
                    ],
                },
                forgetRules: {
                    username:[{required: true, trigger:"blur"}],
                },
            });

            return {
                state,
                validatePassword,
            };
        },

        mounted() {
            if (this.state.loginForm.username==="") {
                this.$refs.username.focus();
            } else if (this.state.loginForm.password === "") {
                this.$refs.password.focus();
            } 

            if (this.$store.state.user.is_superuser) {
                this.$router.push({
                    path: "/admin",
                });
            } else {
                let username = "",            
                    password = "",   
                    remember = getCookie("blogRemember");    

                if (remember==="true") {
                    username = getCookie("blogUsername");            
                    password = getCookie("blogPassword"); 

                    this.state.loginForm.username = username;
                    this.state.loginForm.password = password;
                    this.state.remember = true;
                }
            }
        },

        computed: {
            rules() {
                return this.state.loginRules;
            },
        },
        
        methods: {
            checkCapslock(e: KeyboardEvent) {
                const { key } = e;
                this.state.capsTooltip =
                    (key && key.length === 1 && key >= "A" && key <= "Z");
            },
            handleLogin() {
                this.$refs.loginForm.validate(async (valid: boolean)=>{
                    if (valid) {
                        if (this.state.remember) {
                            setCookie("blogUsername", this.state.loginForm.username, 30, 0, 0);
                            setCookie("blogPassword", this.state.loginForm.password, 30, 0, 0);
                            setCookie("blogRemember", this.state.remember, 30, 0, 0);      
                        } else {
                            delCookie("blogUsername");
                            delCookie("blogPassword");
                            delCookie("blogRemember");
                        }

                        this.state.loading = true;
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
                            this.$message({
                                message: "登陆成功!",
                                type: "success",
                                duration: 3* 1000,
                            });                      
                            this.$store.commit(SET_USER, {
                                user,
                            });
                  			    let userInfo = JSON.stringify(user);
            		            setCookie("userInfo", userInfo, expire_days, 0, 0);
			                       if (user.is_superuser) {
	                               await this.$router.push({
	                               path: "/admin",
	                             });
			                       }
                            
                              this.state.loading = false;
                        } catch(e) {
			                       console.error(e);
                              this.state.loading = false;
                        }
                    }
                });
           } 
        },
    });
</script>

<style lang="less" scoped>
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
  height: 350px;
}

.tips {
  font-size: 14px;
  color: #fff;
  margin-bottom: 10px;
}

.tips span:first-of-type {
  margin-right: 16px;
}

.svg-container {
  padding: 6px 5px 6px 15px;
  color: #889aa4;
  vertical-align: middle;
  width: 30px;
  display: inline-block;
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

.show-pwd {
  position: absolute;
  right: 10px;
  top: 7px;
  font-size: 16px;
  color: #889aa4;
  cursor: pointer;
  user-select: none;
}

.thirdparty-button {
  position: absolute;
  right: 0;
  bottom: 6px;
}

.fp {
  font-size: 12px;
  text-align: right;
  margin-bottom: 10px;
  cursor: pointer;
}
</style>