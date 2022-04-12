<template>
  <div class="container">
    <Nav/>
    <div class="layout">
      <router-view class="view-content"/>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Nav from "./components/Nav.vue";

export default defineComponent({
  name: "App",
  components: {
    Nav
  },  
});
</script>

<style lang="less">
@import url("./less/index.less");
body {
  background-color: #f9f9f9;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  padding-top: 50px;
}

.container {
  width: 1200px;
  margin: 0 auto;
}


img {
  vertical-align: bottom;
}

.layout {
  height: auto;
}

.button-container {
  display: flex;
  justify-content: space-between;
  flex: 1;
  margin-bottom: 24px;
}

.view-content {
  margin-top: 12px;
  background-color: #ffffff;
  padding: 12px 24px 24px 24px;
  border-radius: 8px;
}
</style>
