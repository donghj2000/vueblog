<template>
    <div>
        <div>
            <el-form :inline="true" class="demo-form-inline">
                <el-form-item label="标题">
                    <el-input ref="title" v-model="state.params.search" placeholder="文章标题"/>
                </el-form-item>
                <el-form-item label="状态">
                    <el-select v-model="state.params.status" placeholder="状态">
                        <el-option label="已发布" value="Published" />
                        <el-option label="草稿" value="Draft" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button :icon="searchIcon" :loading="state.isLoading" type="primary" @click="handleSearch">查询</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="button-container">
            <el-button :icon="plus" :loading="state.isLoading" type="primary" @click="showAddDrawer">
        新增
            </el-button>
            <el-button circle :icon="expand" @click="state.showCatalogTree=true">
                分类管理
            </el-button>
        </div>
        <div>
            <el-table ref="articleTable" :data="state.articleList" :header-cell-style="{background:'#eef1f6', color:'#606266'}" stripe
                style="width:100%">
                <el-table-column type="selection" width="55" />
                <el-table-column label="ID" prop="id" width="80" />
                <el-table-column label="标题" prop="title" width="200"/>
                <el-table-column :formatter="(row, column, value)=>statusDict[value]" label="状态" prop="status" width="80" />
                <el-table-column label="分类" prop="catalog_info.name" />
                <el-table-column :formatter="datetimeFormatter" label="修改时间" prop="modified_at" width="160" />
                <el-table-column fixed="right" label="操作" width="200">
                    <template #default="scope">
                        <el-popconfirm cancelButtonText='取消' confirmButtonText='删除' icon="el-icon-info" iconColor="red"
                        title="确定删除该文章吗？" @confirm="deleteArticle(scope.$index,scope.row)">
                            <template #reference>
                                <el-button :icon="deleteIcon" size="small" type="text">
                                    删除
                                </el-button>
                            </template>
                        </el-popconfirm>

                        <el-button :icon="edit" size="small" type="text" @click.prevent="showEditDrawer(scope.$index, scope.row)">
                            编辑
                        </el-button>
                        <el-button :icon="successFilled" v-if="scope.row.status==='Draft'" size="small" type="text"
                                    @click.prevent="publishArticle(scope.$index,scope.row)">
                            发布
                        </el-button>
                        <el-button :icon="removeFilled" v-else size="small" type="text"
                                       @click.prevent="offlineArticle(scope.$index, scope.row)">
                            下线
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
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            >             
            </el-pagination>
        </div>
    </div>
  <EditArticle
      :article-id="state.articleId"
      :visible="state.showDrawer"
      @close="handleCloseDrawer"
  />
  <CatalogTree
      :visible="state.showCatalogTree"
      @close="state.showCatalogTree=false"
  />
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed, shallowRef } from "vue";
import { Article, ArticleArray, ArticleParams } from "../../types";
import { remoteSaveArticle, getArticleList } from "../../api/service";
import { timestampToTime } from "../../utils";
import { ElMessage } from "element-plus";
import EditArticle from "../../components/EditArticle.vue";
import CatalogTree from "../../components/CatalogTree.vue";
import { Plus, Expand, Edit, SuccessFilled, RemoveFilled, Delete, Search } from '@element-plus/icons-vue';

export default defineComponent({
    name: "ArticleAdmin",
    components: { CatalogTree, EditArticle,
        Plus, Expand, Edit, SuccessFilled, RemoveFilled, Delete, Search
    },

    setup:function() {
        const plus = shallowRef(Plus);
        const expand = shallowRef(Expand);
        const edit = shallowRef(Edit);
        const successFilled = shallowRef(SuccessFilled);
        const removeFilled = shallowRef(RemoveFilled);
        const deleteIcon = shallowRef(Delete);
        const searchIcon = shallowRef(Search);
      	const statusDict = {
      	    Draft: '草稿',
      	    Published: '已发布',
      	    Deleted:'已删除',
      	}
    
        const state = reactive({
            articleList: [] as Array<Article>,
            params: {
                search: undefined,
                status: undefined,
                page: 1,
                page_size: 10,
            } as unknown as ArticleParams,
            page_sizes:[5,10,15,20,30,40,50,100],
            isLoading: false,
            total: 0,
            showDrawer: false,
            articleId: 0,
            showCatalogTree: false,
        });

        const handleSearch = () => {
            state.params.page = 1;
            state.params.page_size = 10;
            doSearch();
        }
        
        const doSearch = async (): Promise<void> => {
          state.isLoading = true;
          try {
            const data: any = await getArticleList(state.params);
            state.isLoading = false;
            state.articleList = data.data.results;
            state.total = data.data.count;
          } catch (e) {
            console.error(e);
            state.isLoading = false;
          }
        };

        const publishArticle = async (index: number, row: Article) => {
          try {
            await remoteSaveArticle('patch', {id: row.id, status: "Published"} as Article);
            ElMessage({
              message: "发布成功！",
              type: "success",
            });
            handleSearch();
          } catch (e) {
            console.error(e);
          }
        }

        const offlineArticle = async (index: number, row: Article) => {
          try {
            await remoteSaveArticle('patch', {id: row.id, status: "Draft"}  as Article);
            ElMessage({
              message: "下线成功！",
              type: "success",
            });
            handleSearch();
          } catch (e) {
            console.error(e);
          }
        }

        const deleteArticle = async (index: number, row: Article) => {
          await remoteSaveArticle('patch', {id: row.id, status: "Deleted"} as Article);
          ElMessage({
            message: "删除成功！",
            type: "success",
          });
          handleSearch();
        }

        const datetimeFormatter = (row: Article, column: number, cellValue: string, index: number) => {
          return timestampToTime(cellValue, true);
        }

        handleSearch();

        const handleCloseDrawer = (isOk: boolean) => {
          state.showDrawer = false;
          if (isOk) {
            handleSearch();
          }
        }

        const handleSizeChange = (val: number) => {
          state.params.page_size = val;
          doSearch();
        }

        const handleCurrentChange = (val: number) => {
          state.params.page = val;
          doSearch();
        }

      return {
          plus, expand, edit, successFilled, removeFilled, deleteIcon, searchIcon,
          statusDict,
          state,
          doSearch,
          handleSearch,
          datetimeFormatter,
          deleteArticle,
          handleCloseDrawer,
          publishArticle,
          offlineArticle,
          handleSizeChange,
          handleCurrentChange,
      }
  },

  mounted() {
    this.$refs.title.focus();
  },

  methods: {
    showEditDrawer(index: number, row: Article) {
      this.$refs.articleTable.setCurrentRow(row);
      this.state.showDrawer = true;
      this.state.articleId = row.id;
    },
    showAddDrawer() {
      this.state.showDrawer = true;
      this.state.articleId = 0;
    }
  }
})
</script>

<style scoped>
.pagination {
  text-align: right;
  margin-top: 12px;
}
</style>