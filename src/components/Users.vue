<template lang="pug">
    div#users
        div(v-if="users" , v-for="user in users" :key="user").userCard
            p {{user.name}}
            p {{user.role}}
            p(v-if="user.player") Это вы
</template>
<script>
export default {
    data() {
        return {

        };
    },
    computed: {
        users : function() {
            return this.$store.state.users;
        }
    }
};

</script>
<style lang="scss">
    #users {
        width: 100%;
        background: #333;
        .userCard {
            width: 300px;
            background: #ccc;
        }
    }
</style>
