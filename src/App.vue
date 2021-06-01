<template>
  <router-view />
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  components: {},
})
export default class App extends Vue {}
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
}

body {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  background-color: #292b2f;
  color: white;

  user-select: none;
}

#app {
  width: 100%;
  height: 100%;
}

button {
  outline: none;
  border: none;
  padding: 10px 20px;

  display: flex;
  justify-content: center;
  align-items: center;

  background-color: #36393f;
  color: white;
  box-shadow: 2px 2px 10px rgba(#000, 0.4);

  cursor: pointer;
  transition: 0.1s;

  &:hover {
    filter: brightness(0.9);
    border-radius: 0;
  }
}

.iconify {
  margin-right: 7px;
}

video {
  width: 100%;
}
</style>
