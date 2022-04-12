<template>
    <el-drawer 
        v-model="state.visible" 
        :before-close="handleClose" 
        direction="rtl" 
        size="500px" 
        title="分类管理" 
        @opened="handleSearch"
    >
        <div class="drawer-content">
            <el-button v-if="state.catalogs.length == 0" :icon="plus" type="text" @click.prevent="showAddDialog(0)">
                新增根类型
            </el-button>
            <el-tree v-else
                :data="state.catalogs" 
                :expand-on-click-node="false" 
                :props="defaultProps" 
                default-expand-all 
                node-key="id">
                <template #default="{ node, data }">
                    <span class="custom-tree-node">
                        <span>{{ node.label }}</span>
                        <span>
                            <el-dropdown trigger="click">
                                <p class="el-dropdown-link">
                                  <el-icon class="el-icon--right">
                                    <Expand />              
                                  </el-icon>
                                  操作
                                </p>

                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item >
                                            <el-button :icon="edit" type="text" @click.prevent="showEditDialog(data)">
                                                修改
                                            </el-button>
                                        </el-dropdown-item>
                                        <el-dropdown-item >
                                            <el-button :icon="plus" type="text" @click.prevent="showAddDialog(data.id)">
                                                新增
                                            </el-button>
                                        </el-dropdown-item>
                                        <el-dropdown-item>
                                            <el-popconfirm :title="'确定删除【'+data.name+'】？'" cancelButtonText='取消' confirmButtonText='删除' 
                                            icon="el-icon-info" iconColor="red" @confirm="remove(data)">
                                                <template #reference>
                                                    <el-button :icon="deleteIcon" size="medium" type="text">
                                                        删除
                                                    </el-button>
                                                </template>
                                            </el-popconfirm>
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </span>
                    </span>
                </template>
            </el-tree>
        </div>
    </el-drawer>
    <el-dialog v-model="state.showDialog" :title="state.dialogTitle">
        <el-form class="form" label-suffix="：" label-width="120px" size="medium">
            <el-form-item label="目录名称">
                <el-input v-model="state.catalog.name" autocomplete="off"></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="state.showDialog=false">取消</el-button>
                <el-button :loading="state.loading" type="primary" @click="saveCatalog">保存</el-button>
            </span>
        </template>
    </el-dialog>
</template>
<script lang="ts">
import { defineComponent, reactive, ref, computed, shallowRef } from "vue";
import { Catalog } from "../types";
import { deleteCatalog, getCatalogTree, saveCatalog } from "../api/service";
import { ElMessage } from "element-plus";
import { Plus, Expand, Edit, Delete } from '@element-plus/icons-vue';

export default defineComponent({
    name: "CatalogTree",

    components: {
        Plus, Expand, Edit, Delete
    },

    props: {
        visible: {
            type: Boolean,
            require: true,
        }
    },

    watch: {
        '$props.visible': {
            handler(val, oldVal) {
                if (val != oldVal) {
                    this.state.visible = val;
                }
            }
        }
    },

    emits: ['close', ],

    setup(props) {
        const plus = shallowRef(Plus);
        const expand = shallowRef(Expand);
        const edit = shallowRef(Edit);
        const deleteIcon = shallowRef(Delete);

        const state = reactive({
            catalogs: [] as Array < Catalog > ,
            visible: props.visible,
            showDialog: false,
            catalog: {} as Catalog,
            dialogTitle: '',
            loading: false,
        });

        const handleSearch = async () => {
            const data:any = await getCatalogTree();
            state.catalogs = data.data;
        };

        const defaultProps = {
            children: 'children',
            label: 'name',
        };

        return {
            plus, expand, edit,  deleteIcon, 
            state,
            handleSearch,
            defaultProps
        }
    },

    methods: {
        handleClose() {
            this.$emit('close');
        },

        showAddDialog(id: number) {
            this.state.showDialog = true;
            //@ts-ignore
            this.state.catalog.id = undefined;
            //@ts-ignore
            this.state.catalog.name = undefined;
            this.state.catalog.parent = (id == 0 ? null : id);
            this.state.dialogTitle = '新增类型';
        },

        showEditDialog(data: Catalog) {
            this.state.showDialog = true;
            this.state.catalog = data;
            this.state.dialogTitle = '修改类型';
        },

        async saveCatalog() {
            try {
                this.state.loading = true;
                const method = this.state.catalog.id ? 'patch' : 'post';
                await saveCatalog(method, this.state.catalog);
                this.state.loading = false;
                this.state.showDialog = false;
                ElMessage({
                    message: '保存成功',
                    type: 'success'
                });
                await this.handleSearch();
            } catch (e) {
                console.error(e);
                ElMessage({
                    message: '保存失败',
                    type: 'error'
                });
                this.state.loading = false;
            }
        },

        async remove(data: Catalog) {
            await deleteCatalog(data.id);
            ElMessage({
                message: '删除成功',
                type: 'success'
            });
            await this.handleSearch();
        }
    }
})
</script>
<style lang="less" scoped>
.drawer-content {
    padding: 12px 0 0 24px;
    border-top: #eeeeee 1px solid;
    overflow: auto;
}

.custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 32px;
}

.add-button {
    margin-bottom: 12px;
}
</style>