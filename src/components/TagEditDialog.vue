<template>
    <el-dialog v-model="state.visible" :title="state.title" @close="handleClose(false)" width="440px">
        <el-form size="medium" label-suffix=": " class="form">
            <el-form-item label="名称" label-width="80px">
                <el-input v-model="state.name" autocomplete="off" size=""></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="handleClose(false)">取消</el-button>
                <el-button :loading="loading" type="primary" @click="handleClose(true)">确定</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive } from "vue";
import { Tag } from "../types";

export default defineComponent({
    name: "TagEditDialog",
    props: {
        visible: {
            type: Boolean,
            require: true,
        },
        tag: {
            type: Object as PropType<Tag>,
            require: true,
        },
        loading: {
            type: Boolean,
            require: true,
        }
    },

    emits: ["close",],

    watch: {
        '$props.visible': {
            handler(val: Boolean, oldVal: Boolean) {
                if (val !== oldVal) {
                    this.state.visible = val
                }
                if (val) {
                    this.state.name = this.$props.tag.name
                    this.state.title = this.$props.tag.id ? '修改标签':'新增标签'
                }
            }
        }
    },
    
    setup(props) {
        const state = reactive({
            visible: props.visible as Boolean,
            name: '' as string,
            title:'' as string
        });
        return {
            state,
        }
    },

    methods: {
        handleClose(isOk: Boolean) {
            this.$emit("close", {
                obj: {
                    id: this.$props.tag.id,
                    name: this.state.name
                },
                isOk,
            })
        }
    }
})
</script>
<style scoped>
.form {
    padding-right: 24px;
}
</style>