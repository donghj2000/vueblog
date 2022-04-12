<template>
    <el-drawer
        v-model="state.visible"
        :before-close="handleClose"
        :title="articleId?'修改文章':'新增文章'"
        direction="rtl"
        size="800px"
        @opened="handleSearch"
    >
        <div class="article-form" style="overflow-y:auto">
            <el-form label-suffix="：" label-width="120px">
                <el-form-item label="标题">
                    <el-input ref="articleTitle" v-model="state.article.title"></el-input>
                </el-form-item>
                <el-form-item label="所属分类">
                    <el-cascader 
                        v-model="state.catalogs" 
                        :options="state.catalogTree"
                        :props="{ checkStrictly: true, value: 'id', label: 'name', expandTrigger: 'hover' }"
                        clearable
                        size="medium"
                        style="width: 100%"/>
                </el-form-item>
                <el-form-item label="标签">
                    <el-select v-model="state.article.tags" clearable multiple placeholder="请选择文章标签" size="medium" 
                        style="width: 100%">
                        <el-option v-for="s in state.tags" :label="s.name" :value="s.id" :key="s.id"/>
                    </el-select>
                </el-form-item>
                <el-form-item label="摘要">
                    <el-input v-model="state.article.excerpt" :rows="5" type="textarea"></el-input>
                </el-form-item>
                <el-form-item label="关键词">
                    <el-input v-model="state.article.keyword" :rows="2" type="textarea"></el-input>
                </el-form-item>
                <el-form-item label="正文">
                    <v-md-editor height="550px"
                        :disabled-menus="[]"
                        v-model="state.article.markdown"
                        @upload-image="handleImageUpload"
                    />
                </el-form-item>
                <el-form-item label="封面">
                    <el-upload
                        :before-upload="beforeAvatarUpload"
                        :headers="csrfToken"
                        :on-success="handleAvatarSuccess"
                        :show-file-list="false"
                        action="/api/upload/cover"
                        class="avatar-uploader"
                    >
                        <img v-if="state.article.cover" :src="state.article.cover" class="avatar">
                        <el-icon v-else class="avatar-uploader-icon"><Plus width="100" height="100" /></el-icon>
                    </el-upload>
                </el-form-item>
            </el-form>
        </div>
        <div class="demo-drawer__footer">
            <el-button @click="handleClose">取消</el-button>
              <el-button :loading="state.loading" type="primary" @click="saveArticle">保存</el-button>
        </div>        
    </el-drawer>
</template>
<script lang="ts">
import { defineComponent, reactive } from "vue";
import { Plus } from '@element-plus/icons-vue';
import { getArticleDetail, getCatalogTree, getTagList,remoteSaveArticle } from "../api/service";
import { Article, Catalog, Tag, TagList } from "../types";
import axios from "axios";
import { getCookie } from "./../utils/index";

export default defineComponent({
    name: "EditArticle",
    conponents: { Plus },

    data(){
        return { Plus }
    },

    props: {
        articleId: {
            type: Number,
            require: true,
            default: undefined,
        },
        visible: {
            type: Boolean,
            require: true,
        }
    },

    watch: {
        '$props.visible': {
            handler(val: Boolean, oldVal: Boolean) {
                if (val !== oldVal) {
                    this.state.visible = val;
                }
            }
        }
    },

    emits:["close",],

    setup(props,context) {
        const state = reactive({
            article: {} as Article,
            loading: false,
            visible: false as Boolean,
            catalogTree: [] as Array<Catalog>,
            tags: [] as Array<Tag>,
            catalogs: [] as Array<number>
        });

        const saveArticle = async () => {
            try {
                state.loading = true
                if (state.catalogs.length) {
                    state.article.catalog = state.catalogs[state.catalogs.length - 1]
                }
                if (props.articleId) {
                    await remoteSaveArticle('put', state.article)
                } else {
                    await remoteSaveArticle('post', state.article)
                }
                state.loading = false
                context.emit('close', true)
            } catch (e) {
                state.loading = false
            }
        };

        const csrfToken = {'X-CSRFToken': getCookie('csrftoken')};
        return {
            state,saveArticle,csrfToken
        }
    },

    methods: {
        async handleSearch() {
            this.$refs.articleTitle.focus();
            if (this.$props.articleId) {
                const data: any = await getArticleDetail(this.$props.articleId);
                this.state.article = data.data;
                this.state.article.tags = this.state.article.tags_info.map((tag: Tag)=>tag.id);
                this.state.catalogs = this.state.article.catalog_info.parents;
            } else {
                this.state.article = {} as Article;
            }
            const data:any = await getCatalogTree();
            this.state.catalogTree = data.data;

            if (!this.state.tags.length) {
                const tags: any = await getTagList({});
                this.state.tags = tags.data.results;
            }
        },

        handleClose(done: any) {
            this.$confirm('确认关闭抽屉?', '提示', {
                confirmButtonText: '关闭',
                cancelButtonText: '取消',
                type: 'warning'
            }).then((_: any): void => {
                this.$emit("close", false);
                this.state.article = {} as Article;
                done();
            }).catch((_: any): void => {
                console.error(_);
            });
        },

        handleAvatarSuccess(res: any, file: File) {
            this.state.article.cover = res.url;
        },

        beforeAvatarUpload(file: File) {
            const isImage = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'].includes(file.type);
            const isLt2M = file.size / 1024 / 1024 < 2;

            if (!isImage) {
                this.$message.error('上传图片只能是 JPG 格式!');
            }
            if (!isLt2M) {
              this.$message.error('上传图片大小不能超过 2MB!');
            }
            return isImage && isLt2M;
        },

        handleImageUpload(event, insertImage, files) {
            const reader = new FileReader();
            reader.onload = () => {    
                //转为blob
                const blob = this.convertBase64UrlToBlob(reader.result);
                //上传,并改文件名
                let formData = new FormData();  // 创建form对象
                let config = {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'X-CSRFToken': getCookie("csrftoken")
                    }
                };
                formData.append('file', blob, files[0].name);  //预留接口改文件名
                axios.post('/api/upload/cover', formData, config)
                .then((data: any)=>{
                    insertImage({
                        url: data.data.url,
                        desc: '七龙珠',
                        // width: 'auto',
                        // height: 'auto',
                    });
                });
            };
            reader.readAsDataURL(files[0]);   
        },

        convertBase64UrlToBlob(urlData) {  
            let arr = urlData.split(','), mime = arr[0].match(/:(.*?);/)[1];
            let bstr = atob(arr[1]);
            let n = bstr.length;
            let u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], {type:mime});
        }
    }
})
</script>


<style lang="less">
.article-form {
  padding: 24px;
  overflow-y: auto;
  border-top: 1px solid #e8e8e8;
  height: calc(100% - 100px);
}


.el-drawer .el-drawer__body{
  margin-bottom: 50px ;
  height: 100% !important;
}

.el-drawer__header{
  margin-bottom: 16px;
}
.demo-drawer__footer {
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  border-top: 1px solid #e8e8e8;
  padding: 10px 16px;
  text-align: right;
  background-color: white;
}

:deep(:focus){
  outline: 0;

}

.avatar-uploader {
  background-color: #fbfdff;
  border: 1px dashed #c0ccda;
  border-radius: 6px;
  box-sizing: border-box;
  width: 125px;
  height: 100px;
  cursor: pointer;
  line-height: 100px;
  text-align: center;
  font-size: 20px;
}
.el-icon .avatar-uploader-icon {
  font-size: 20px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>