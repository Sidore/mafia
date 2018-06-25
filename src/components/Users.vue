<template lang="pug">
    div#users(v-if="users.length > 0")
        h3 Жители города:
        transition-group(name="list-complete" tag="div").players
            user-card(v-for="user in users" :key="user" :user="user").list-complete-item
</template>
<script>
import userCard from "@components/playerCard";
export default {
    data() {
        return {

        };
    },
    components : {
        "user-card" : userCard
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
        background: #555;
        color: #eee;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content:space-around;

        .players {
            display: flex;
            flex-direction: row;
        }


    }
</style>
