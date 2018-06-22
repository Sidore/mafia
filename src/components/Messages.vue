<template lang="pug">
  transition-group(name="list-complete" tag="div").messages
    p(v-for='m in messages' :key="m").list-complete-item {{m}}
</template>
<script>
export default {
    asyncData({ store, route }) {
    // возвращаем Promise из действия
    // return store.dispatch('fetchItem', route.params.id)
    },
    computed: {
        messages : function() {
            return this.$store.state.messages;
        }
    },
    methods: {

    }
};
</script>
<style lang="scss">

.messages {
  background: #666;
  color: #eee;
}

.list-complete-item {
  transition: all 1s;
//   display: inline-block;
//   margin-right: 10px;
}
.list-complete-enter, .list-complete-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.list-complete-leave-active {
  position: absolute;
}
</style>

