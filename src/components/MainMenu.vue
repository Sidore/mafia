<template lang="pug">
  div#mainMenu
    router-link(to="/").link Mafia
    router-link(to="/profile").link Profile
</template>
<script>
export default {

};
</script>
<style lang="scss">
#mainMenu {
  background: #444;
  display: flex;
  flex-direction: row;
  justify-content: space-around;

  .link {
    font-size: 20px;
    padding: 15px;
    margin: 10px;
    background: #555;

    border: 3px solid transparent;
    border-image: linear-gradient(to right, #3EC8AC 0%, #4E90A4 100%);
    border-image-slice: 1;

    display: flex;
    color: #eee;
    text-decoration: none;
    transition: all .5s;

    &.router-link-exact-active {
      background: #eee;
      color: #333;
    }
  }
}
</style>

