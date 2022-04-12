<template>
    <div class="body">
        <div class="menu">
            <el-menu :default-active="state.activePath" :router="true" active-text-color="#E04040">
                <el-menu-item index="AdminDashboard" route="/admin/dashboard">
                    <HomeFilled style="width: 1.5em; height: 1.5em; margin-right: 8px;" />
                    Dashboard
                </el-menu-item>
                
                <el-menu-item index="ArticleManagement" route="/admin/article">
                    <Document style="width: 1.5em; height: 1.5em; margin-right: 8px;" /> 
                    文章
                </el-menu-item>

                <el-menu-item index="TagManagement" route="/admin/tag">
                    <Flag style="width: 1.5em; height: 1.5em; margin-right: 8px;" /> 
                    标签
                </el-menu-item>

                <el-menu-item index="CommentManagement" route="/admin/comment">
                    <Comment style="width: 1.5em; height: 1.5em; margin-right: 8px;" /> 
                    评论
                </el-menu-item>

                <el-menu-item index="UserManagement" route="/admin/user">
                    <User style="width: 1.5em; height: 1.5em; margin-right: 8px;" /> 
                    用户
                </el-menu-item>

                <el-menu-item index="MessageManagement" route="/admin/message">
                    <ChatDotRound style="width: 1.5em; height: 1.5em; margin-right: 8px;" /> 
                    留言
                </el-menu-item>
            </el-menu>
        </div>
        <div class="view">
            <router-view />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue';
import { useRoute } from "vue-router";
import { HomeFilled, Document, Flag, Comment, User, ChatDotRound } from '@element-plus/icons-vue';
export default defineComponent({
    name: 'Admin',
    components: {
        HomeFilled, Document, Flag, Comment, User, ChatDotRound
    },

    data(){
        return {
            HomeFilled, Document, Flag, Comment, User
        }
    },
    
    setup() {
        const state = reactive({
            activePath: '' as string | null | undefined,
        });
        const route: any = useRoute();
        if (route.name == "Dashboard") {
            state.activePath = "AdminDashboard";
        } else {
            state.activePath = route.name as string;
        }

        return {
            state,
        }
    },
})
</script>

<style lang="less" scoped>
.body {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
}

.user {
  font-size: 20px;
}

.menu {
  width: 200px;
}

.view {
  width: calc(100% - 200px);
  padding: 24px;
}

.el-menu {
  height: 100%;
}

</style>