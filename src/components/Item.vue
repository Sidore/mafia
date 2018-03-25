<template lang="pug">
  div 
    span {{counter}}
    button("v-on:click"='inc') +
    p item component {{counter}}
</template>
<script>
export default {
   asyncData ({ store, route }) {
    // возвращаем Promise из действия
  },
  computed: {
      counter : function () {
          return this.$store.state.count
      }
  },
  methods : {
      inc : function() {
          this.$store.dispatch("inc")
      }
  }
}
</script>
