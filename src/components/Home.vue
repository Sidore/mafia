<template lang="pug">
  div
    p Home component
    p(v-for='m in messages') {{m}}
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
