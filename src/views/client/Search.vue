<template>
    <div class="left clearfix">  
        <div v-if="!state.isLoading">
            <h2 v-if="state.total>0"> 
                搜索：<span style="color: red">{{ state.params.text }}</span>
                . 共有 {{ state.total }} 篇文章:
            </h2>
            <h2 v-else>
                哎呀，关键字：<span style="color: red">{{ state.params.text }}</span> 没有找到结果，要不换个词再试试？
            </h2>
        </div>
        <ArticleList :article-list="state.articleList" />
        <div v-if="state.total>0" class="pagination">
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

        <Loading v-if="state.isLoading" tips="拼命搜索中---------------" />            
    </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, onMounted, reactive } from "vue";
import Loading from "../../components/Loading.vue";
import { Article, ArticleArray, ArticleParams } from "../../types";
import { getSearchArticleList } from "../../api/service";
import ArticleList from "../../components/ArticleList.vue";
import { useRouter } from "vue-router";

export default defineComponent({
    name: "Searh",
    components: {
        ArticleList,
        Loading,
    },
    
    watch: {
        "$router.currentRoute.value.params": {
            handler(val: any, oldVal: any) {
                this.doSearch();
            }, deep:true
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
       }
    },

    setup() {
        const router: any = useRouter();
        const state = reactive ({
            isLoading: false,
            articleList: [] as Array<Article>,
            total: 0,
            params: {
                text: "",
                page: 1,
                page_size: 10,
            } as ArticleParams,
            page_sizes:[5,10,15,20,30,40,50,100],
        });

        const handleSearch = () => {
            state.params.page = 1;
            state.params.page_size = 10;
            doSearch();
        };

        const doSearch = async(): Promise<void> => {
            state.isLoading = true;
            try {
                state.params.text = router.currentRoute.value.params.text;
                let data: any = await getSearchArticleList(state.params);
                let articleList = data.data.results.map(obj => obj.object);
                articleList = articleList.filter(article=>{
                  return article != null;
                });
                state.articleList = articleList;
                state.total = data.data.count;
            } catch (e) {
                console.error(e);
            }
            state.isLoading = false;
        };

        onMounted(() => {
            handleSearch();
        });

        return {
            router,
            state,
            doSearch,
            handleSearch
        };
    },
});
</script>
<style lang="less">
.pagination {
  text-align: right;
  margin-top: 12px;
}
</style>