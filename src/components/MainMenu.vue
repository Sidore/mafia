<template lang="pug">
  div#mainMenu
    div.mainLink
      router-link(to="/") Mafia
    div.link
      router-link(to="/profile") Profile
    div.link
      router-link(to="/Info") Info


</template>
<script>
export default {
  
};
</script>
<style lang="scss">
#mainMenu {
  background: #eee;
  display: flex;
  flex-direction: row;

  .mainLink {
    font-size: 20px;
    padding: 15px;
    background: #fff;
  }

  .link {
    font-size: 16px;
    padding: 15px;
    background: #fff;

  }
}
</style>

