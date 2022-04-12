<template>
  <div>
    <div>
      <el-form :inline="true" :model="state.params" class="demo-form-inline">
        <el-form-item label="内容/姓名/手机/邮箱">
          <el-input v-model="state.params.search" placeholder="内容"/>
        </el-form-item>
        <el-form-item>
          <el-button :icon="searchIcon" :loading="state.loading" 
              type="primary" @click="handleSearch">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div>
      <el-table ref="messageTable" :data="state.messageList" :header-cell-style="{background:'#eef1f6',color:'#606266'}"
                stripe>
        <el-table-column type="selection" width="55"/>
        <el-table-column label="ID" prop="id" width="50"/>
        <el-table-column label="姓名" prop="name" width="100"/>
        <el-table-column label="邮箱" prop="email" width="150"/>
        <el-table-column label="手机" prop="phone" width="120"/>
        <el-table-column :formatter="datetimeFormatter" label="留言时间" prop="created_at" width="150" />
        <el-table-column :formatter="contentFormatter" label="内容" prop="content" width="150"/>

        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="small" type="text"
                       @click.prevent="showMsgDetail(scope.row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
 
      <el-dialog
        title="详情"
        width="40%"
        v-model="state.showDialog"
        @close="cancel"
        :show-close="true"
        destroy-on-close
        center
      >
        <div>
          {{ state.showContent }}
        </div>
        <template v-slot:footer>
            <div class="dialog-footer">
                <el-button type="primary" @click="cancel">确定</el-button>
            </div>
        </template>
      </el-dialog>
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
</template>

<script lang="ts">
import { defineComponent, reactive, shallowRef } from "vue";
import { MessageParam, MessageInfo } from "../../types";
import { ElMessage } from "element-plus";
import { timestampToTime } from "../../utils";
import { getMessageList, } from "../../api/service";
import { Search } from '@element-plus/icons-vue';

export default defineComponent({
  name: "MessageAdmin",
  components: { Search },
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

  setup: function () {
      const searchIcon = shallowRef(Search);
      const state = reactive({
          showDialog: false,
          showContent: "",
          messageList: [] as Array<MessageInfo>,
          params: {
              search: "",
              page: 1,
              page_size: 10
          } as unknown as MessageParam,
          page_sizes:[5,10,15,20,30,40,50,100],
          total: 0,
          loading: false,
      });

      const handleSearch = () => {
          state.params.page = 1;
          state.params.page_size = 10;
          doSearch();
      };

      const doSearch = async (): Promise<void> => {
          state.loading = true;
          try {
              const data: any = await getMessageList(state.params);
              state.loading = false;
              state.messageList = data.data.results;
              state.total = data.data.count
          } catch (e) {
              console.error(e);
              state.loading = false;
          }
      };

      const showMsgDetail = (row)=> {
          state.showDialog = true;
          state.showContent = row.content;
      };

      const datetimeFormatter = (row: MessageInfo, column: number, cellValue: string, index: number) => {
          return timestampToTime(cellValue, true);
      };

      const contentFormatter = (row: MessageInfo,colum: number, cellValue: string, index: number) => {
          return cellValue.substring(0, 15) + 
              (cellValue.length > 15 ? ".....":"");
      }

      const cancel = (): void=> {
          state.showDialog = false;
      };

      handleSearch();

      return {
          searchIcon,
          state,
          doSearch,
          handleSearch,
          showMsgDetail,
          datetimeFormatter,
          contentFormatter,
          cancel
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