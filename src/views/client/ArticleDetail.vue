<template>
    <div style="width: 100%">
        <div class="article clearfix">
            <div v-show="!state.isLoading" :style="{'width':'75%'}" class="article-left fl">
                <div class="header">
                    <h1 class="title">{{ state.detail.title }}</h1>
                    <div class="author">
                        <div class="avatar">
                            <img alt="我的头像" class="auth-logo" src="../../assets/avatar.png">
                        </div>
                        <div class="info">
                            <span class="name">
                                <span>{{ state.detail.author }}</span>
                            </span>
                            <div data-author-follow-button="" props-data-classes="user-follow-button-header" />
                            <div class="meta">
                                <span class="publish-time">
                                    {{ state.detail.created_at? formatTime(state.detail.created_at) : '' }}
                                </span>
                                <span class="wordage">字数 {{ state.detail.words }}</span>
                                <span class="views-count">阅读 {{ state.detail.views }}</span>
                                <span class="comments-count">评论 {{state.detail.comments}}</span>
                                <span class="likes-count">喜欢 {{ state.detail.likes }}</span>
                            </div>
                        </div>
                        <div class="tags" title="标签">
                            <el-tag v-for="tag in state.detail.tags_info" :key="tag.id" class="tag" size="mini" type="success">
                                {{ tag.name }}
                            </el-tag>
                        </div>
                        <span class="clearfix" />
                    </div>
                </div>
                <div class="content">
                    <div id="content" class="article-detail" v-html="state.detail.html"></div>
                </div>
                <div class="heart">
                    <el-button :loading="state.isLoading" icon="heart" size="large" type="danger" @click="likeArticle">
                      点赞
                    </el-button>
                </div>
                <Comment     :article-id="state.articleId" :for-article="true" :show-dialog="false" @ok="handleOk" />
                <CommentList :article-id="state.articleId" :numbers="state.detail.comments"/>
            </div>
            <div class="article-right fr anchor" style="width: 23%"
                v-html="state.detail.toc"></div>
            <Loading v-if="state.isLoading" tips="拼命加载中---------------" />
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, reactive } from "vue";
import { ElMessage } from "element-plus";
import { useRoute } from "vue-router";
import { timestampToTime } from "../../utils";
import markdown from "../../utils/markdown";
import CommentList from "../../components/CommentList.vue";
import { Article, Catalog, Like, Tag, } from "../../types";
import { getArticleDetail, postLikeArticle } from "../../api/service";
import { StateKey } from "../../store";
import { useStore } from "vuex";
import Comment from "../../components/Comment.vue";
import Loading from "../../components/Loading.vue";

declare let document: Document | any;
export default defineComponent({
    name: "ArticleDetail",
    components: {
        Comment,
        Loading,
        CommentList,
    },

    setup() {
        const store = useStore(StateKey);
        const state = reactive({
            btnLoading: false,
            isLoadEnd: false,
            isLoading: false,
            articleId: 0,
            content: "",
            detail: {
                id: 0,
                title: "",
                excerpt: "",
                keyword: "",
                cover: "",
                markdown: "",
                created_at: "",
                modified_at: "",
                tags_info: [] as Array<Tag>,
                catalog_info: {} as Catalog,
                views: 0,
                comments: 0,
                words: 100,
                likes: 0,
                author: '',
            } as Article,
            cacheTime: 0, //缓存时间
            times: 0, //评论次数
            likeTimes: 0, //点赞次数
        });
        const formatTime = (value: string | Date): string => {
            return timestampToTime(value, true);
        };

        const handleSearch = async (): Promise<void> => {
            state.isLoading = true;
            try {
                const data: any = await getArticleDetail(state.articleId);
                state.isLoading = false;
                state.detail = data.data;
                const article = markdown.marked(state.detail.markdown);
                article.then((res: any)=>{
                    state.detail.html = res.content;
                    state.detail.toc = res.toc;
                });
                document.title = state.detail.title;
                document.querySelector("#keywords").setAttribute("content", state.detail.keyword);
                document.querySelector("#description")
                    .setAttribute("content", state.detail.excerpt);
            } catch (e) {
                state.isLoading = false;
            }
        };

        const likeArticle = async(): Promise<void> => {
            if (!state.detail.id) {
                ElMessage({
                    message: "该文章不存在!",
                    type: "warning",
                });
                return;
            }

            if (state.likeTimes > 0) {
                ElMessage({
                    message: "您已经点过赞了！悠着点吧!",
                    type: "warning",
                });
                return;
            }

            const user_id: number = store.state.user.id;
            if (user_id === 0) {
                ElMessage({
                    message: "登录才能点赞，请先登录!",
                    type: "warning",
                });
                return;
            }

            let params: Like = {
                article: state.detail.id,
                user: user_id,
            };
            try {
                await postLikeArticle(params);
                state.isLoading = false;
                state.likeTimes++;
                ++state.detail.likes;
                ElMessage({
                    message: "操作成功!",
                    type: "success",
                });
            } catch (e) {
                state.isLoading = false;
            }
        };

        const route = useRoute();
        if (route.path === '/about') {
            state.articleId = 1;
        } else {
            state.articleId = Number(route.query.id);
        }

        const handleOk = () => {
            handleSearch();
        };
        
        onMounted(()=> {
            handleSearch();
        });

        return {
            state,
            formatTime,
            handleSearch,
            likeArticle,
            handleOk
        };
    },
    beforeUnmount(): void {
        document.title = "我的博客网站";
        document
            .getElementById("keywords")
            .setAttribute("content", "我的博客网站");
        document
            .getElementById("description")
            .setAttribute(
                "content",
                "我的博客网站"
            );
    },
});
</script>
<style lang="less" scoped>
.anchor {
  display: block;
  position: sticky;
  top: 213px;
  margin-top: 213px;
  border-left: 1px solid #eee;
  min-height: 48px;

  .anchor-ul {
    position: relative;
    top: 0;
    max-width: 250px;
    border: none;
    -moz-box-shadow: 0 0 0 #fff;
    -webkit-box-shadow: 0 0 0 #fff;
    box-shadow: 0 0 0 #fff;

    li.active {
      color: #009a61;
    }
  }

  a {
    color: #333;
    font-size: 20px;
  }
}

.article {
  width: 100%;

  .header {
    border-bottom: #eeeeee 1px solid;

    .title {
      margin: 0;
      text-align: center;
      font-size: 34px;
      font-weight: bold;
    }

    .author {
      position: relative;
      margin: 30px 0 40px;
      padding-left: 50px;

      .avatar {
        position: absolute;
        left: 0;
        top: 0;
        width: 48px;
        height: 48px;
        vertical-align: middle;
        display: inline-block;

        img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
        }
      }

      .info {
        float: left;
        vertical-align: middle;
        // display: inline-block;
        margin-left: 8px;

        a {
          color: #333;
        }
      }

      .name {
        margin-right: 3px;
        font-size: 16px;
        vertical-align: middle;
      }

      .meta {
        margin-top: 5px;
        font-size: 12px;
        color: #969696;

        span {
          padding-right: 5px;
        }
      }

      .tags {
        float: right;
        padding-top: 15px;
        // padding-right: 20px;
        .tag {
          // padding: 0 10px;
          margin-left: 5px;
          border-right: 2px solid #eee;
        }
      }
    }
  }

  .content {
    min-height: 300px;
  }
}

.heart {
  height: 60px;
  text-align: center;
  margin: 50px;
}

.loader {
  color: rgb(226, 44, 44);
  text-align: center;
  padding: 50px;
  font-size: 16px;
}

.clearfix {
  clear: both;
}

.anchor-fix1 {
  display: block;
  height: 60px; /*same height as header*/
  margin-top: -60px; /*same height as header*/
  visibility: hidden;
}

</style>