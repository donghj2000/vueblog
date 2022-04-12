<template>
    <div>
        <div>
            <el-form :inline="true" :model="state.params" class="demo-form-inline">
                <el-form-item label="名称">
                    <el-input v-model="state.params.name" placeholder="名称"/>
                </el-form-item>
                <el-form-item>
                    <el-button
                        :icon="searchIcon"
                        :loading="state.isLoading"
                        type="primary"
                        @click="handleSearch"
                    >
                      查询
                    </el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="button-container"> 
            <el-button
                :icon="plus"
                :loading="state.isLoading"
                type="primary"
                @click="showAddDialog"
            >
                新增
            </el-button>
        </div>
        <div>
            <el-table
                ref="tagTable"
                :data="state.tagList"
                :header-cell-style="{background: '#eef1f6', color: '#606266'}"
                stripe
            >
                <el-table-column type="selection" width="55" />
                <el-table-column label="ID" prop="id" width="80" />
                <el-table-column label="名称" prop="name" width="200" />
                <el-table-column 
                    :formatter="datetimeFormatter" 
                    label="修改时间" 
                    prop="modified_at" 
                />
                <el-table-column fixed="right" label="操作" width="120" >
                    <template #default="scope">
                        <el-popconfirm
                            cancelButtonText="取消"
                            confirmButtonText ="删除"
                            icon="el-icon-info"
                            iconColor="red"
                            title="确定删除系列吗？"
                            @confirm="deleteObject(scope.$index, scope.row)"
                        >
                            <template #reference>
                                <el-button :icon="deleteIcon" size="small" type="text">删除</el-button>
                            </template>
                        </el-popconfirm>
                        <el-button
                            :icon="edit"
                            size="small"
                            type="text"
                            @click.prevent="showEditDialog(scope.$index, scope.row)"
                        >
                            编辑
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
    <TagEditDialog 
        :loading="state.saveLoading"
        :tag="state.tag"
        :visible="state.showDialog"
        @close="handleCloseDialog"
    />
</template>

<script lang="ts">
import { defineComponent, reactive, shallowRef } from "vue";
import { ResponseData, Tag } from "../../types";
import { addTag, deleteTag, getTagList, saveTag } from "../../api/service"
import { timestampToTime } from "../../utils";
import { ElMessage } from "element-plus";
import TagEditDialog from "../../components/TagEditDialog.vue";
import { useRoute } from "vue-router";
import { Plus, Edit, Delete, Search } from '@element-plus/icons-vue';

export default defineComponent({
    name: "TagAdmin",
    components: { TagEditDialog, Plus, Edit, Delete, Search},

    watch: {
        "$route.path": {
            handler(val, oldVal) {
                if (val != oldVal && ["/admin/tag"].includes(val))
                    this.doSearch();
            },
            deep:true,
        },
        
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
        const plus = shallowRef(Plus);
        const edit = shallowRef(Edit);
        const deleteIcon = shallowRef(Delete);
        const searchIcon = shallowRef(Search);

        const route = useRoute();
        const state = reactive({
            tagList: [] as Array<Tag>,
            params: {
                name: undefined,
                page: 1,
                page_size: 10,
            },
            page_sizes:[5,10,15,20,30,40,50,100],
            isLoading: false,
            total: 0,
            showDialog: false,
            tag: {
                id: 0,
                name: "",
            } as Tag,
            saveLoading: false,
        });

        const handleSearch = () => {
            state.params.page = 1;
            state.params.page_size = 10;
            doSearch();
        }

        const doSearch = async () : Promise<void> => {
            state.isLoading = true;
            try {
                const data: any = await getTagList(state.params);
                state.isLoading = false;
                state.tagList = data.data.results;
                state.total = data.data.count;
            } catch (e) {
                console.error(e);
                state.isLoading = false;
            }
        };

        const deleteObject = async (index: number, row: Tag) => {
            await deleteTag (row.id);
            ElMessage({
                message: "删除成功",
                type: "success",
            });
            await handleSearch();
        };

        const datetimeFormatter = (
            row: Tag, 
            column: number,
            cellValue: string,
            index: number
            ) => {
            return timestampToTime(cellValue,true);
        };

        handleSearch();

        const handleSizeChange = (val: number) => {
            state.params.page_size = val;
            handleSearch();
        }

        const handleCurrentChange = (val: number) => {
            state.params.page = val;
            handleSearch();
        }

        return {
            plus, edit, deleteIcon, searchIcon,
            state,
            doSearch,
            handleSearch,
            datetimeFormatter,
            deleteObject,
            handleSizeChange,
            handleCurrentChange
        };
    },
    methods: {
        showEditDialog (index: number, row: Tag) {
            this.state.tag = row;
            this.state.showDialog = true;
        },

        showAddDialog() {
            this.state.tag = {} as Tag;
            this.state.showDialog = true;
        },

        async handleCloseDialog(params: any) {
            if (!params.isOk) {
                this.state.showDialog = false;
                return;
            }
            this.state.saveLoading = true;
            const method = this.state.tag.id ? "put" : "post";
            try {
                await saveTag(method, params.obj);
                this.state.showDialog = false;
                this.state.saveLoading = false;
                await this.handleSearch();
            } catch (e) {
                console.error(e);
                this.state.saveLoading = false;
            }
        }
    },
});

</script>

<style scoped>
.pagination {
  text-align: right;
  margin-top: 12px;
}
</style>