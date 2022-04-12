<template>
    <div class="comment-list">
        <div class="top-title">
            <span>{{ numbers }}条评论</span>
        </div>
        <div v-for="(item, i) in state.comments" :key="item.id" class="item">
            <div class="item-header">
                <div class="author">
                    <div class="avatar">
                        <img 
                            v-if="!item.user_info.avatar"
                            alt="默认图片" 
                            src="../assets/avatar.png" 
                        />
                        <img v-else :src="item.user_info.avatar" alt="" />
                    </div>
                </div>
                <div class="info">
                    <div class="name">
                        {{item.user_info.name}}
                        {{item.user_info.role==="Admin"?"(作者)":""}}
                    </div>
                    <div class="time">{{formatTime(item.created_at)}}</div>
                </div>
            </div>
            <div class="comment-detail">{{item.content}}</div>
            <div class="item-comment">
                <div
                    class="message"
                    @click="showCommentModal(item.id, item.user_info.id)"
                >
                    <el-button size="small">回复</el-button>    
                </div>
            </div>
            <div v-for="e in item.comment_replies" :key="e.id" class="item-other">
                <div class="item-header">
                    <div class="author">
                        <div class="avatar">
                            <img 
                                v-if="!e.user_info.avatar"
                                alt="默认图片" 
                                src="../assets/avatar.png" 
                            />
                            <img v-else :src="e.user_info.avatar" alt="" />
                        </div>
                    </div>
                    <div class="info">
                        <div class="name">
                            {{e.user_info.name}}
                            {{e.user_info.role==="Admin"?"(作者)":""}}
                        </div>
                        <div class="time">
                            {{formatTime(e.created_at)}}
                        </div>
                    </div>
                </div>
                <div class="comment-detail">
                    {{e.content}}
                </div>
            </div>
        </div>
        <Comment 
            :article-id="state.articleId"
            :forArticle="false"
            :reply="state.comment_id"
            :show-dialog="state.visible"
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
import { StateKey } from "../store";

export default defineComponent ({
    name: "CommentList",
    components: {
        Comment: defineAsyncComponent(()=>import("./Comment.vue")),
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
            state.visible = false;
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
            state.visible = false;
            await getArticleCommentList();
        };

        //添加评论
        const showCommentModal = (
                commentId: number,
                user: number,
                secondUser?:number
            ): boolean | void => {
                let user_id: number;
                if (store.state.user.id > 0) {
                    user_id = store.state.user.id;
                } else {
                    ElMessage({
                        message: "登录才能评论，请先登录！",
                        type: "warning",
                    });
                    return;
                }
                // 添加三级评论
                if (secondUser) {
                    state.comment_id = commentId;
                } else {
                    //添加二级评论
                    state.comment_id = commentId;
                }
                state.visible = true;
        };

        watch(props, (val, oldVal) => {
            getArticleCommentList();
        });

        onMounted(()=>{
            getArticleCommentList();
        });

        return {
            state,
            showCommentModal,
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

.item-other {
  margin: 20px;
  padding: 10px;
  border-left: 2px solid #f0f0f0;

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