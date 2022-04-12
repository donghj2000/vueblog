<template>
  <div>
    <div class="title">今日博客访问情况</div>
    <el-row :gutter="24" class="numbers">
      <el-col :span="6" class="el-col-6">
        <el-card>
          <div class="number-card">
            <div>
              <i class="el-icon-user number-icon"></i>
            </div>
            <div class="number-right">
              <div class="number-num">{{ state.numbers.views }}</div>
              <div>用户访问量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6" class="el-col-6">
        <el-card>
          <div class="number-card">
            <div>
              <i class="el-icon-thumb number-icon" style="background: #64d572;"></i>
            </div>
            <div class="number-right">
              <div class="number-num">{{ state.numbers.likes }}</div>
              <div>点赞量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6" class="el-col-6">
        <el-card>
          <div class="number-card">
            <div>
              <i class="el-icon-chat-line-square number-icon" style="background: #f25e43;"></i>
            </div>
            <div class="number-right">
              <div class="number-num">{{ state.numbers.comments }}</div>
              <div>评论量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6" class="el-col-6">
        <el-card>
          <div class="number-card">
            <div>
              <i class="el-icon-message number-icon" style="background-color: #42B983"></i>
            </div>
            <div class="number-right">
              <div class="number-num">{{ state.numbers.messages }}</div>
              <div>留言量</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <div class="top-articles">
      <el-card>
        <template #header>
          文章访问量TOP10
        </template>
        <div class="article-list">
          <div v-for="( article,index) in state.articleList" class="article" @click="viewArticle(article.id)">
            <span style="font-size: 14px">{{ index + 1 + '. ' + article.title }}</span>
            <span style="color: #999999; font-size: 14px">{{ article.views }} / {{ article.likes }}</span>
          </div>

        </div>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { Article } from "../../types";
import { getNumbers, getTopArticleList } from "../../api/service";

export default defineComponent({
  name: "DashboardAdmin",
  setup() {
    const state = reactive({
      numbers: {
        views: 0,
        likes: 0,
        comments: 0,
        messages: 0
      },
      articleList: [{title: 'a', views: 1, likes: 1}] as Array<Article>,
    })
    return {
      state,
    }
  },

  async mounted() {
    const data: any = await getTopArticleList();
    this.state.articleList = data.data.results;
    const numbers:any = await getNumbers();
    this.state.numbers = numbers.data;
  },

  methods: {
    viewArticle(id: number) {
      const {href} = this.$router.resolve({
        path: '/article/',
        query: {
          id
        }
      });
      window.open(href, "_blank");
    }
  }

})
</script>

<style lang="less" scoped>
.numbers {
  width: 100%;
}

.title {
  color: #999;
  margin: 12px 0;
  padding-left: 8px;
  font-size: 14px;
}

:deep(.el-card__body){
  margin: 0;
  padding: 0;
}

.number-card {
  margin: 0;
  padding: 0;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  flex: 1;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  height: 80px;
  border: 1px solid #ebeef5;
  background-color: #fff;
  border-radius: 4px;
  overflow: hidden;
}

.number-right {
  -webkit-box-flex: 1;
  -ms-flex: 1;
  flex: 1;
  text-align: center;
  font-size: 14px;
  color: #999;
}

.number-num {
  font-size: 30px;
  font-weight: 700;
  color: #2d8cf0;
  text-align: center;
}


.number-icon {
  font-size: 50px;
  width: 80px;
  height: 80px;
  text-align: center;
  line-height: 80px;
  color: #fff;
  background: #2d8cf0;
}

.top-articles {
  margin: 24px 24px 24px 0;
}

.article-list {
  padding: 20px;
}

.article {
  cursor: pointer;
  display: flex;
  flex: 1;
  justify-content: space-between;
  padding: 12px 24px 12px 12px;
  border-top: #eeeeee 1px solid;
}

.article:first-child {
  border-top: none;
  padding-top: 0;
}

.article:last-child {
  padding-bottom: 0;
}

.dashboard-list {
  display: flex;
  flex: 1;
  justify-content: space-evenly;
  padding: 24px;
  margin-right: 24px;;
}

.percentage-value {
  display: block;
  margin-top: 10px;
  font-size: 28px;
}

.percentage-label {
  display: block;
  margin-top: 10px;
  font-size: 12px;
}
</style>