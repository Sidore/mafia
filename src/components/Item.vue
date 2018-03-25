<template lang="pug">
  div
    span {{counter}}
    button("v-on:click"='inc') +
    p item component {{counter}}
    div {{users}}
</template>
<script>
export default {
    asyncData({ store, route }) {
        return store.dispatch("users");
    },
    computed: {
        counter : function() {
            return this.$store.state.count;
        },
        users : function() {
            return this.$store.state.users;
        }
    },
    methods : {
        inc : function() {
            this.$store.dispatch("inc");
        }
    }
};
</script>
