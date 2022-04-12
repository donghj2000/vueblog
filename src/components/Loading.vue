<template>
        <div class="loading">
        	{{ state.tips }}
        </div> 
</template>
<script lang="ts">
import { defineComponent, reactive } from "vue";

export default defineComponent({
	name: "Loading",
	props: {
		tips:{
		    type: String,
		    default: "",
		},
	},

	setup(props, context){
        const state = reactive({
            tips: props.tips,
        });

        return {
        	state
        };
    }
});
</script>
<style scoped>
.loading {
  width: 1200px;
  height: 600px;
  font-size: 30px;
  text-align: center;
  padding: 50px;
}
</style>