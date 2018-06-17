<template lang="pug">
    div#users
        h3 Сейчас играют:
        div.players
            transition-group(name="list-complete" tag="div")
                div(v-if="users" , v-for="user in users" :key="user").userCard.list-complete-item
                    img(src="https://cdn2.iconfinder.com/data/icons/business-persons-flat-1/512/person_3-256.png")
                    p {{user.name}}
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
        background: #efefef;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content:space-around;

        .players {
            display: flex;
            flex-direction: row;
        }

        .userCard {
            border: 1px solid #ccc;
            border-radius: 5px;
            width: 100px;
            background: #efefef;
            display: flex;
            flex-direction: column;
            text-align: center;

            img {
                width: 100%;
            }
        }
    }
</style>
