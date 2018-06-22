<template lang="pug">
    div#users(v-if="users.length > 0")
        h3 Жители города:
        transition-group(name="list-complete" tag="div").players
            div(v-for="user in users" :key="user").userCard.list-complete-item
                img(src="https://interior-stickers.ru/30554-thickbox_default/gangster-s-avtomatom-8.jpg")
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

        .userCard {
            border: 5px solid #eee;
            border-radius: 5px;
            width: 100px;
            background: linear-gradient(to right, #3EC8AC 0%, #4E90A4 100%);;
            display: flex;
            flex-direction: column;
            text-align: center;
            padding: 0;
            margin: 15px;

            p {
                margin: 0;
                color: #333;
            }

            img {
                width: 100%;
            }
        }
    }
</style>
