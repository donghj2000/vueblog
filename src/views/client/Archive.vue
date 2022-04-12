<template>
  <div class="archive left">
    <el-timeline>
      <el-timeline-item v-for="(article, i) in state.articleList" :key="article.year" hide-timestamp placement="top">
        <h3 class="year">{{ article.year }}</h3>
        <el-timeline-item
            v-for="(item, index) in article.list"
            :key="item.id"
            hide-timestamp
            placement="top"
        >
          <router-link :to="`/article/?id=${item.id}`" target="_blank">
            <h3 class="title">{{ item.title }}</h3>
          </router-link>
          <p>{{ formatTime(item.created_at) }}</p>
        </el-timeline-item>
      </el-timeline-item>
    </el-timeline>

    <Loading v-if="state.isLoading" tips="拼命加载中---------------" />            
    <div v-if="state.isLoadEnd">
         ---------------我也是有底线的啦---------------
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, reactive } from "vue";
import {
    getDocumentHeight,
    getQueryStringByName,
    getScrollTop,
    getWindowHeight,
    throttle,
} from "../../utils";
import Loading from "../../components/Loading.vue";
import { timestampToTime } from "../../utils";
import { ArticleArchiveList, PageInfo } from "../../types";
import { getArchiveList } from "../../api/service";
import { useStore } from "vuex";
import { SET_NAV_INDEX_BY_ROUTE, StateKey } from "../../store";
const viewHeight = window.innerHeight || document.documentElement.clientHeight;

export default defineComponent({
  name: "Archive",
  components: {
      Loading
  },

  setup() {
    const state = reactive({
      isLoadEnd: false,
      isLoading: false,
      articleList: [] as Array<ArticleArchiveList>,
      total: 0,
      params: {
        page: 1,
        page_size: 10,
      } as PageInfo
    });

    const formatTime = (value: string | Date): string => {
      return timestampToTime(value, true);
    }

    const handleSearch = async (): Promise<void> => {
      state.isLoading = true;
      const params: PageInfo = state.params;
      try {
        const data: any = await getArchiveList(params)
        state.isLoading = false;

        if (state.articleList.length > 0 &&
            state.articleList[state.articleList.length - 1].year ==
            data.data.results[0].year ) {
            state.articleList[state.articleList.length - 1].list = 
            [...state.articleList[state.articleList.length - 1].list, 
             ...data.data.results[0].list];
            data.data.results.shift();
        }

        state.articleList = [...state.articleList, ...data.data.results];
        state.total = data.data.count;
        state.params.page++;
        
	let received = 0;
        state.articleList.forEach(item => {
            received += item.list.length;
        });
        if (data.data.results.length === 0 ||
            state.total <= received) {
                state.isLoadEnd = true;
                window.onscroll = null;
                console.log("onscroll end");
        }
      } catch (e) {
        state.isLoading = false;
      }
    }

    onMounted(() => {
      const store: any = useStore(StateKey);
      store.dispatch(SET_NAV_INDEX_BY_ROUTE, '/archive');

      window.onscroll = function(){
          if (getScrollTop() + getWindowHeight() > getDocumentHeight() - 100) {
              if (state.isLoadEnd === false && state.isLoading === false) {
                  handleSearch();
              }
          }
      };

      handleSearch();
    })

    return {
      state,
      formatTime,
      handleSearch
    };
  },
})
;
</script>

<style lang="less" scoped>
.archive {
  padding: 40px 0;

  .year {
    font-size: 30px;
    font-weight: bold;
    color: #000;
    margin-top: 0;
  }

  a {
    text-decoration: none;
  }

  .title {
    color: #333;

    &:hover {
      color: #1890ff;
    }
  }
}
</style>