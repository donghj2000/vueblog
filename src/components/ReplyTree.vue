<template>
  <div>    
    <div v-for="e in replies" :key="e.id" class="item-recurse" :style="{left:state.left+'px'}">
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
        <div class="comment-detail">{{e.content}}</div>
        
        <div class="item-comment">

                <el-button size="small" @click="showCommentModal(e.id, e.user_info.id)">回复</el-button>    
           
        </div>
        
        <ReplyTree v-if="e.comment_replies.length!=0" :replies="e.comment_replies" :level="state.level"></ReplyTree>
    </div>
  </div>
</template>

<script lang="ts">
import { ElMessage } from "element-plus";
import {
    defineComponent,
    reactive,
    PropType
} from "vue";
import { useStore } from "vuex";
import { SET_COMMENT_VISIBLE,StateKey } from "../store";
import { timestampToTime } from "../utils";
import { CommentInfo } from "../types";

export default defineComponent ({
    name: "ReplyTree",
    props: {
        replies: {
            type: Array as PropType<Array<CommentInfo>>,
            default: []
        },
        level: {
            type: Number,
            default: 0
        }
    },

    setup(props, context) {
        const store = useStore(StateKey);
        const formatTime = (value: string | Date): string => {
            return timestampToTime(value, true);
        };
        //console.log(props.level)
        const state = reactive({
            left: props.level==0?0:40,
            level: props.level+1
        });
        //console.log(state.left)
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
                //state.visible = true;
                store.commit(SET_COMMENT_VISIBLE, {commentId:commentId, commentVisible: true});
        };

        return {
            formatTime,
            state,
            showCommentModal
        };
    },
});
</script>

<style lang="less" scoped>

.item-recurse {
  position: relative;
  //border-left: 2px solid #f0f0f0;
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
        width: 28px;
        height: 28px;
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
    min-height: 30px;
    border-bottom: 1px dashed #f0f0f0;
  }

  .message {
    padding: 10px;
  }
}
</style>