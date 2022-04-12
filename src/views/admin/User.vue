<template>
    <div>
        <div>
            <el-form :inline="true" :model="state.params" class="demo-form-inline">
                <el-form-item label="名称">
                    <el-input v-model="state.params.username" placeholder="账号" />
                </el-form-item>
                <el-form-item label="状态">
                    <el-select v-model="state.params.is_active" placeholder="请选择">
                        <el-option value="true" label="生效"/>
                        <el-option value="false" label="禁用"/>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button :icon="searchIcon" :loading="state.isLoading" type="primary" @click="handleSearch">查询</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div>
            <el-table ref="userTable" :data="state.userList" :header-cell-style="{background:'#eef1f6', color:'#606266'}"
                      stripe>
                <el-table-column type="selection" width="55"/>
                <el-table-column label="ID" prop="id" width="80"/>
                <el-table-column label="账号" prop="username" width="200"/>
                <el-table-column label="角色" prop="is_superuser" width="200"/>
                <el-table-column label="昵称" prop="nickname" width="200"/>
                <el-table-column label="状态" prop="is_active"/>
                <el-table-column :formatter="datetimeFormatter" label="注册时间" prop="created_at"/>
                <el-table-column label="操作">
                    <template #default="scope">
                        <el-popconfirm v-if="scope.row.is_active" cancelButtonText='取消'  confirmButtonText='禁用' icon="el-icon-info"
                        iconColor="red" title="确定禁用该用户吗？" @confirm="disableUser(scope.$index,scope.row)">
                            <template #reference>
                                <el-button size="small" type="text">
                                    禁用
                                </el-button>
                            </template>
                        </el-popconfirm>
                        <el-button v-if="!scope.row.is_active" size="small" type="text" 
                                   @click.native.prevent="enableUser(scope.$index, scope.row)">
                            启用
                        </el-button>
                        <el-button size="small" type="text"
                                    @click.native.prevent="showUserDetail(scope.row)">
                            详情
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="pagination">
            <el-pagination 
                v-model:pageSize="state.params.page_size" 
                v-model:currentPage="state.params.page"
                :page-sizes="state.page_sizes"
                :total="state.total" 
                background
                layout="total, sizes, prev, pager, next, jumper"
            >             
            </el-pagination>
        </div>
    </div>
    <UserDetail
        :user-id="state.userId" 
        :visible="state.showDialog"
        @close="state.showDialog=false"
    />
</template>

<script lang="ts">
import { defineComponent, reactive, shallowRef } from "vue";
import { ResponseData, User } from "../../types";
import { ElMessage } from "element-plus";
import { timestampToTime } from "../../utils";
import { getUserList, saveUser } from "../../api/service";
import UserDetail from "../../components/UserDetail.vue";
import { Search } from '@element-plus/icons-vue';

export default defineComponent({
    name: "UserAdmin",
    components: { UserDetail, Search },

    watch: {
       'state.params.page_size': {
            handler(val: Boolean, oldVal: Boolean) {
                this.doSearch();
            }
        },
        'state.params.page': {
            handler(val: Boolean, oldVal: Boolean) {
                this.doSearch();
            }
       },
    },

    setup: function() {
        const searchIcon = shallowRef(Search);
        const state = reactive({
            userList: [] as Array<User>,
            params: {
                username: '',
                is_active: undefined,
                is_superuser: false,
                page: 1,
                page_size: 10,
            },
            page_sizes:[5,10,15,20,30,40,50,100],
            isLoading: false,
            total: 0,
            showDialog: false,
            userId: 0,
        });
        
        const handleSearch = () => {
            state.params.page = 1;
            state.params.page_size = 10;
            doSearch();
        };

        const doSearch = async():Promise<void> => {
            state.isLoading = true;
            try {
                const data: ResponseData = await getUserList(state.params);
                state.isLoading = false;
                state.userList = data.data.results;
                state.total = data.data.count
            } catch (e) {
                console.error(e)
                state.isLoading = false;
            }
        };

        const disableUser = async (index: number,row: User) => {
            await saveUser('patch', {id: row.id, is_active: false} as User);
            ElMessage({
                message: "禁用成功",
                type: "success",
            });
            await handleSearch();
        };

        const enableUser = async (index: number, row: User) => {
            await saveUser('patch', {id: row.id, is_active: true} as User);
            ElMessage({
                message: "启用成功！",
                type: "success",
            });
            await handleSearch();
        };
        
        const datetimeFormatter = (row: User, column: number, cellValue: string, index: number) => {
            return timestampToTime(cellValue, true);
        };

        handleSearch();
        
        return {
            searchIcon,
            state,
            doSearch,
            handleSearch,
            datetimeFormatter,
            disableUser,
            enableUser,
        }
    },

    methods:{
        showUserDetail(row: User) {
            this.state.userId = row.id
            this.state.showDialog = true;
        },
    }
})
</script>
<style scoped>
.pagination {
  text-align: right;
  margin-top: 12px;
}
</style>