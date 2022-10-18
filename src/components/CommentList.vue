<template>
    <div class="comment-list">
        <div class="top-title">
            <span>{{ numbers }}条评论</span>
        </div>

        <ReplyTree v-if="state.comments.length!=0" :replies="state.comments" level=0 class="item-other"/>
        <Comment 
            :article-id="state.articleId"
            :forArticle="false"
            :reply="commentId"
            :show-dialog="commentVisible"
            @cancel="handleCancel"
            @ok="handleOk"
        />
    </div>
</template>
<script lang="ts">
import { ElMessage } from "element-plus";
import {
    defineAsyncComponent,
    defineComponent,
    onMounted,
    watch,
    reactive,
} from "vue";
import { timestampToTime } from "../utils";
import { CommentInfo } from "../types";
import { getArticleComments } from "../api/service";
import { useStore } from "vuex";
import { SET_COMMENT_VISIBLE, StateKey } from "../store";
import ReplyTree from "./ReplyTree.vue";

export default defineComponent ({
    name: "CommentList",
    components: {
        Comment: defineAsyncComponent(()=>import("./Comment.vue")),
        ReplyTree
    },
    computed: {
        commentVisible(): boolean {
            return this.store.state.commentVisible;
        },
        commentId(): boolean {
            return this.store.state.commentId;
        },
    },
    props: {
        numbers: {
            type: Number,
            default: 0,
        },
        articleId: {
            type: Number,
            default: 0,
        },
    },

    setup(props, context) {
        const store = useStore(StateKey);
        const state = reactive({
            visible: false,
            comment_id: 0,
            comments: [] as Array<CommentInfo>,
            reply: 0,
            articleId: props.articleId
        });
        const formatTime = (value: string | Date): string => {
            return timestampToTime(value, true);
        };
        const handleCancel = (): void => {
            store.commit(SET_COMMENT_VISIBLE, {commentId: 0, commentVisible: false});
        };

        const getArticleCommentList = async () => {
            try {
                const response: any = await getArticleComments(props.articleId);
                state.comments = response.data.results;
                state.comments = state.comments.filter(comment=>{
                  return comment.reply == null;
                });
            } catch (e) {
                console.error(e);
            }
        };

        const handleOk = async () : Promise<void> => {
            store.commit(SET_COMMENT_VISIBLE, {commentId:0, commentVisible: false});
            await getArticleCommentList();
        };

        watch(props, (val, oldVal) => {
            getArticleCommentList();
        });


        return {
            store,
            state,
            handleOk, 
            handleCancel,
            formatTime,
        };
    },
});
</script>
<style lang="less" scoped>
.comment-list {
  text-align: center;
}

.comment-list {
  position: relative;
  text-align: left;
  padding-top: 30px;
  margin-top: 30px;
  border-top: 1px solid #eee;

  .avatar {
    position: absolute;
    left: 0px;
  }

  .el-icon-circle-plus {
    font-size: 40px;
  }
}

.clearfix {
  clear: both;
}

.comment-list {
  margin-top: 30px;

  .top-title {
    padding-bottom: 20px;
    font-size: 17px;
    font-weight: 700;
    border-bottom: 1px solid #f0f0f0;
  }

  .item {
    padding: 20px 0 30px;
    border-bottom: 1px solid #f0f0f0;

    .item-header {
      position: relative;
      padding-left: 45px;
      padding-bottom: 10px;

      .author {
        position: absolute;
        left: 0;
        display: inline-block;

        .avatar {
          display: inline-block;
          margin-right: 5px;
          width: 40px;
          height: 40px;
          vertical-align: middle;

          img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
          }
        }
      }

      .info {
        display: inline-block;

        .name {
          font-size: 15px;
          color: #333;
        }

        .time {
          font-size: 12px;
          color: #969696;
        }
      }
    }

    .comment-detail {
      min-height: 40px;
    }

    .item-comment {
      .like {
        margin-right: 20px;
      }
    }
  }
}
.item-recurse {
  position: relative;
  left: 10px;
  border-left: 2px solid #f0f0f0;
}
.item-other {
  margin: 20px;
  padding: 10px;
  //border-left: 2px solid #f0f0f0;

  .item-header {
    position: relative;
    padding-left: 45px;
    padding-bottom: 10px;

    .author {
      position: absolute;
      left: 0;
      display: inline-block;

      .avatar {
        display: inline-block;
        margin-right: 5px;
        width: 38px;
        height: 38px;
        vertical-align: middle;

        img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
        }
      }
    }

    .info {
      display: inline-block;

      .name {
        font-size: 15px;
        color: #333;
      }

      .time {
        font-size: 12px;
        color: #969696;
      }
    }
  }

  .comment-detail {
    min-height: 40px;
    border-bottom: 1px dashed #f0f0f0;
  }

  .message {
    padding: 10px;
  }
}
</style>
