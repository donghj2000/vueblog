<template>
    <div class="catalog left">
        <div :style="{'min-height': height + 'px'}" class="catalog-tree">
            <el-tree
                :current-node-key="state.currentNodeKey"
                :data="state.catalogs"
                :props="defaultProps"
                node-key="id"
                @node-click="handleNodeClick"
            ></el-tree>
        </div>
        <div class="article-list">
            <Home />
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, reactive } from "vue";
import { Article, ArticleParams, Catalog } from "../../types";
import { getCatalogTree } from "../../api/service";
import Home from "./Home.vue";
import { SET_ARTICLE_PARAMS, StateKey } from "../../store";
import { useStore } from "vuex";

export default defineComponent({
    name: "Catalog",
    components: { Home },
    
    setup() {
        const state = reactive({
            catalogs: [] as Array<Catalog>,
            articleParams: { catalog: 1 } as ArticleParams,
            articleList: [] as Array<Article>,
            currentNodeKey: 1,
        });

        const getCatalogs = async () => {
            const data: any = await getCatalogTree();
            state.catalogs = data.data;
        };

        const defaultProps = {
            children: "children",
            label: "name",
        };

        const store: any = useStore(StateKey);
        onMounted(()=> {
            getCatalogs();
            state.currentNodeKey = store.state.articleParams.catalog || 1;
        });

        let height = window.innerHeight || document.documentElement.clientHeight;
        height = height - 200;
        const handleNodeClick = (catalog: Catalog) => {
            store.commit(SET_ARTICLE_PARAMS, {catalog: catalog.id});
        };
        return {
            state,
            defaultProps,
            height,
            handleNodeClick,
        };
    },
});
</script>

<style lang="less" scoped>
.catalog {
  display: flex;
}

.catalog-tree {
  width: 200px;
  border-right: 1px solid #eeeeee;
  margin-right: 24px;
  padding-top: 24px;
  margin-top: -12px;
  color: #2c3e50;
}

.article-list {
  width: 80%;
}
</style>