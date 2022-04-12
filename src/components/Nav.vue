<template>
    <div class="nav">
        <div class="nav-content">
            <el-row :gutter="20">
                <el-col :span="2">
                    <router-link to="/">
                        <img class="logo" src="../assets/logo.png" alt="我的头像" />
                    </router-link>
                </el-col>

                <el-col :span="10">
                    <el-menu
                        :default-active="navIndex"
                        :router="true"
                        active-text-color="#409EFF"
                        class="el-menu-demo"
                        mode="horizontal"
                    >
                        <el-menuItem
                            v-for="r in navs"
                            :key="r.index"
                            :index="r.index"
                            :route="r.path" 
                        >
                            {{r.name}}
                        </el-menuItem>
                    </el-menu>    
                </el-col>

                <el-col :span="5">
                    <el-space alignment="start" :size="30"
                        style="padding-top: 10px;"
                    >
                        <el-input
                          type="text"
                          placeholder="搜索"
                          v-model="state.text"
                          autocomplete="on"
                          @keyup.enter="handleSearch"
                        />

                        <el-button
                            size="large"
                            type="primary"
                            @click="handleSearch"
                        >
                            搜索
                        </el-button>
                    </el-space>
                </el-col>

                <el-col v-if="isLogin" :span="5">
                    <div class="nav-right">
                        <el-dropdown>
                            <span class="el-dropdown-link">
                                {{ userInfo.username ? userInfo.username : userInfo.nickname
                                }}<i class="el-icon-arrow-down el-icon--right"></i>
                            </span>
                            <img 
                                v-if="!userInfo.avatar"
                                alt="我的头像"
                                class="user-img"
                                src="../assets/avatar.png" 
                            />
                            <img
                                v-if="userInfo.avatar"
                                alt="我的头像"
                                class="user-img"
                                :src="userInfo.avatar"                                
                            />
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item @click="handleClick">
                                      登 出
                                    </el-dropdown-item>
                                    <el-dropdown-item @click="handleClick('modifyInfo', true)">
                                      修改信息
                                    </el-dropdown-item>
                                    <el-dropdown-item @click="handleClick('modifyPasswd', true)">
                                      修改密码
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>

                        <ModifyInfoAndPasswd
                          :handle-flag="state.modifyFlag"
                          :visible="state.modifyVisible"
                          @close="handleClick('modifyInfo', false)"
                        />
                    </div>                    
                </el-col>
                <el-col v-else :span="4">
                    <div class="nav-right" style="padding-top: 10px;">
                        <el-button
                           size="large"
                           type="primary"
                           @click="handleClick('login', true)"
                        >
                           登 录
                        </el-button>
                        <el-button
                           size="large"
                            type="danger"
                            @click="handleClick('register', true)"
                        >
                           注 册
                        </el-button>
                    </div>

                    <RegisterAndLogin
                      :handle-flag="state.loginFlag"
                      :visible="state.loginVisible"
                      @close="handleClick('login', false)"
                    />
                </el-col>
            </el-row>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, reactive } from "vue";
import { User } from "../types";
import { useStore } from "vuex";
import { CLEAR_USER, SET_NAV_INDEX, StateKey } from "../store";
import RegisterAndLogin from "./RegisterAndLogin.vue";
import ModifyInfoAndPasswd from "./ModifyInfoAndPasswd.vue";
import { logout } from "../api/service";
import { useRouter } from "vue-router";
import { getCookie, setCookie, delCookie } from "./../utils/index";

export default defineComponent({
    name: "Nav",
    components: { RegisterAndLogin, ModifyInfoAndPasswd },
    computed: {
        userInfo(): User {
            return this.store.state.user;
        },
        isLogin(): boolean {
            return this.userInfo.id > 0;
        },
        navs() {
            return this.store.state.navs;
        },
        navIndex() {
            return this.store.state.navIndex;
        },
    },

    watch: {
        $route: {
            handler(val: any, oldVal: any) {
                this.routeChange(val, oldVal);
            },
            immediate: true,
        },
    },

    setup() {
        const store: any = useStore(StateKey); 
        const router: any = useRouter();
        const state = reactive({
            text: "",
            count: 0,
            loginFlag: "",
            loginVisible: false,
            modifyFlag: "",
            modifyVisible: false, 
        });

        const routeChange = (newRoute: any, oldRoute: any): void => {           
            for (let i = 0; i < store.state.navs.length; i++) {
                const l = store.state.navs[i];
                if (l.path === newRoute.path) {
                    store.commit(SET_NAV_INDEX, l.index);
                    return;
                }
            }

            store.commit(SET_NAV_INDEX, "-1");
        };

        const handleClick = async (route: string, visible: boolean) => {   
            if (["login", "register"].includes(route)) {
                state.loginVisible = visible;
                if (visible == true) {
                    state.loginFlag = route;
                } else {
                    state.loginFlag = "";
                }
            } else if (["modifyInfo", "modifyPasswd"].includes(route))  {
                state.modifyVisible = visible;
                if (visible == true) {
                    state.modifyFlag = route;
                } else {
                    state.modifyFlag = "";
                }
            } else {
                //一，传统方式退出
                //await logout();

                //二，jwt退出
                let is_superuser = store.state.user.is_superuser;
                delCookie("userInfo");
                store.commit(CLEAR_USER);
                state.loginVisible = false;
                if (is_superuser) {
                    await router.push({
                        path: "/login",
                    });
                }
            }
        };
        
        const handleSearch = () => {
            if (state.text != "") {            
                router.push({
                    name: "Search",
                    params: {text: state.text, count: state.count}
                });
                state.count += 1;
            }
        };

        return {
            store,
            router,
            state,
            handleClick,
            routeChange,
            handleSearch
        };
    },
});
</script>
<style lang="less">
.nav {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    width: 100%;
    border-bottom: 1px solid #eee;
    background-color: #fff;

    .nav-content {
        width: 1200px;
        margin: 0 auto;
    }

    .logo {
        height: 50px;
        margin: 0;
        border-radius: 50%;
        margin-top: 5px;
    }

    .el-menu.el-menu--horizontal {
        border-bottom: none;
    }

    .el-menu--horizontal>.el-menu-item {
        cursor: pointer;
        color: #333;
    }

    .nav-right {
        position: relative;
        padding-top: 15px;
        text-align: right;

        .el-dropdown {
            cursor: pointer;
            padding-right: 60px;
        }

        .user-img {
            position: absolute;
            top: -15px;
            right: 0;
            width: 50px;
            border-radius: 50%;
        }
    }
}
</style>