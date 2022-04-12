<template>
    <ul id="list" class="articles-list">
        <transition-group name="el-fade-in">
            <li v-for="article in articleList" :key="article.id" class="item">
                <a :href="href+article.id" target="_blank">
                    <img :data-src="article.cover" alt="文章封面" class="wrap-img img-blur-done" 
                            data-has-lazy-src="false" src="" />
                </a>
                <div class="content">
                    <a :href="href+article.id" target="_blank">
                        <h4 class="title">{{article.title}}</h4>
                        <p class="abstract">{{article.excerpt}}</p>
                    </a>
                    <div class="meta">
                        <span>查看 {{article.views}}</span>
                        <span>评论 {{article.comments}}</span>
                        <span>赞 {{article.likes}}</span>
                        <router-link v-for="tag in article.tags_info" :key="tag.id"
                                                    :to="`/articles?tags=${tag.id}&catalog=`">
                                <el-tag size="mini">{{tag.name}}</el-tag>
                        </router-link>
                        <span v-if="article.created_at" class="time">{{formatTime(article.created_at)}}</span>
                    </div>
                </div>
            </li>
        </transition-group>
    </ul>
</template>
<script lang="ts">
import { timestampToTime } from "../utils";
import { defineComponent, PropType } from "vue";
import { Article } from "../types";

export default defineComponent({
    name: 'ArticleList',
    props: {
        articleList: {
            type: Array as PropType<Array<Article>>,
            default: []
        }
    },

    setup() {
        const formatTime = (value: string | Date):string => {
            return timestampToTime(value, true);
        };
        const href: string = '/article/?id='
        return {
            formatTime,
            href,
        }
    }
})
</script>
<style lang="less" scoped>
.articles-list {
  margin: 0;
  padding: 0;
  list-style: none;

  .title {
    color: #333;
    margin: 7px 0 4px;
    display: inherit;
    font-size: 18px;
    font-weight: 700;
    line-height: 1.5;
  }

  .item > div {
    padding-right: 140px;
  }

  .item .wrap-img {
    position: absolute;
    top: 50%;
    margin-top: -50px;
    right: 0;
    width: 125px;
    height: 100px;
    border-radius: 4px;
    img {
      width: 100%;
      height: 100%;
      border: 1px solid #f0f0f0;
    }
  }

  li {
    line-height: 20px;
    position: relative;
    // width: 100%;
    padding: 15px 0px;
    padding-right: 150px;
    border-bottom: 1px solid #f0f0f0;
    word-wrap: break-word;
    cursor: pointer;

    &:hover {
      .title {
        color: #000;
      }
    }

    .abstract {
      min-height: 30px;
      margin: 0 0 8px;
      font-size: 13px;
      line-height: 24px;
      color: #555;
    }

    .meta {
      padding-right: 0 !important;
      font-size: 12px;
      font-weight: 400;
      line-height: 20px;

      a {
        margin-right: 10px;
        color: #b4b4b4;

        &::hover {
          transition: 0.1s ease-in;
          -webkit-transition: 0.1s ease-in;
          -moz-transition: 0.1s ease-in;
          -o-transition: 0.1s ease-in;
          -ms-transition: 0.1s ease-in;
        }
      }

      span {
        margin-right: 10px;
        color: #666;
      }
    }
  }
}
</style>