<template>
    <el-drawer
        v-model="state.visible"
        :before-close="handleClose"
        direction="rtl"
        size="500px"
        title="用户详情"
        @opened="handleSearch"
    >
        <el-descriptions :column="1" border class="detail">
            <el-descriptions-item label="用户名">{{state.user.username}}</el-descriptions-item>
            <el-descriptions-item label="是否是管理員">{{state.user.is_superuser?'是':'否'}}</el-descriptions-item>
            <el-descriptions-item label="状态">{{state.user.is_active?'启用中':'禁用' }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{state.user.email}}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{state.user.created_at}}</el-descriptions-item>
            <el-descriptions-item label="最后登录时间">{{state.user.last_login}}</el-descriptions-item>
        </el-descriptions>
    </el-drawer>
</template>
<script lang="ts">
import { defineComponent, reactive } from "vue";
import { User } from "../types";
import { getUserDetail } from "../api/service";

export default defineComponent ({
    name: "UserDetail",
    props: {
        visible: {
            type: Boolean,
            require: true,
        }, 
        userId: {
            type: Number,
            require: true,
        },
        loading: {
            type: Boolean,
            require: true,
        }
    },

    emits: ["close", ],
    watch: {
        '$props.visible': {
            async handler(val: Boolean, oldVal: Boolean) {
                if (val !== oldVal) {
                    this.state.visible = val
                }
            }
        }
    },

    setup(props) {
        const state = reactive({
            visible: props.visible as Boolean,
            user: {} as User,
        });

        return {
            state,
        }
    },
    methods: {
        handleClose(isOk: Boolean) {
            this.$emit("close", {
                user:this.state.user,
                isOk,
            })
        },
        async handleSearch() {
            const data: any = await getUserDetail(this.$props.userId);
            this.state.user = data.data;
        }
    }
})
</script>

<style scoped>
.detail {
  padding: 24px;
  margin-top: -12px;
  border-top: #eeeeee 1px solid;
}
</style>