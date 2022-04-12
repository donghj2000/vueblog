<template>
    <div class="left clearfix">  
        <ArticleList :article-list="state.articleList" />
        <Loading v-if="state.isLoading" tips="拼命加载中---------------" />            
        <div v-if="state.isLoadEnd">
                ---------------我也是有底线的啦---------------
        </div>
    </div>
</template>

<script lang="ts">
import {defineComponent, nextTick, onMounted, reactive } from "vue";
import {
    getDocumentHeight,
    getQueryStringByName,
    getScrollTop,
    getWindowHeight,
    throttle,
} from "../../utils";
import Loading from "../../components/Loading.vue";
import { Article, ArticleArray, ArticleParams } from "../../types";
import { getArticleList } from "../../api/service";
import ArticleList from "../../components/ArticleList.vue";
const viewHeight = window.innerHeight || document.documentElement.clientHeight;
const lazyload = throttle(()=>{
    const imgs = document.querySelectorAll("#list .item img");
    let num = 0;
    for (let i = num; i < imgs.length;i++) {
        let distance = viewHeight - imgs[i].getBoundingClientRect().top;
        let imgItem: any = imgs[i];
        if (distance >= 100) {
            let hasLaySrc = imgItem.getAttribute("data-has-lazy-src");
            if (hasLaySrc === "false") {
                imgItem.src = imgItem.getAttribute("data-src");
                imgItem.setAttribute("data-has-lazy-src", "true");
            }
            num = i + 1;
        }
    }
}, 1000);

export default defineComponent({
    name: "Home",
    components: {
        ArticleList,
        Loading,
    },

    watch: {
        "$store.state.articleParams": {
            handler(val: any, oldVal: any) {
                this.state.params.tags = val.tags;
                this.state.params.catalog = val.catalog;
                this.state.articleList = [];
                this.state.params.page = 1;
                this.handleSearch();
            },
        },
    },

    setup() {
        const state = reactive ({
            isLoadEnd: false,
            isLoading: false,
            articleList: [] as Array<Article>,
            total: 0,
            params: {
                status: "Published",
                page: 1,
                page_size:10,
            } as ArticleParams,
        });

        const handleSearch = async(): Promise<void> => {
            state.isLoading = true;
            try {
                const data: any = await getArticleList(state.params);
                state.isLoading = false;
                state.articleList = [...state.articleList, ...data.data.results];
                state.total = data.data.count;
                state.params.page++;
                await nextTick(()=>{
                    lazyload();
                });
                
                if (data.data.results.length === 0 ||
                    state.total === state.articleList.length) {
                        state.isLoadEnd = true;
                        window.onscroll = null;
                }
            } catch (e) {
                console.error(e);
                state.isLoading = false;
            }
        };
        
        onMounted(() => {
            window.onscroll = function() {
                if (getScrollTop() + getWindowHeight() > getDocumentHeight() - 100) {
                    if (state.isLoadEnd === false && state.isLoading === false) {
                        handleSearch();
                    }
                }
            };

            document.addEventListener("scroll", lazyload);
            handleSearch();
        });

        return {
            state,
            handleSearch,
        };
    },
});
</script>
<style lang="less">
a {
  text-decoration: none;
}
</style>