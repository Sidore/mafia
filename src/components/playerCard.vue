<template lang="pug">

    div(@click="clickHandler").userCard
        img(src="https://interior-stickers.ru/30554-thickbox_default/gangster-s-avtomatom-8.jpg")
        p {{user.name}}
        p(v-if="user.player") Это вы
</template>
<script>
export default {
    props: [ "user" ],
    methods : {
        clickHandler : function($event) {
            this.$emit("click", $event);
        }
    }

};
</script>
<style lang="scss">
    .userCard {
            border: 5px solid #eee;
            border-radius: 5px;
            width: 100px;
            background: linear-gradient(to right, #3EC8AC 0%, #4E90A4 100%);
            display: flex;
            flex-direction: column;
            text-align: center;
            padding: 0;
            margin: 15px;
            transition: all .5s;
            cursor: pointer;

            p {
                margin: 0;
                color: #333;
            }

            img {
                width: 100%;
            }

            &:hover {
                background: linear-gradient(to left, #3EC8AC 0%, #4E90A4 100%);
                box-shadow: rgba(33, 33, 33, .4) 2px 2px 5px;
            }
        }

</style>
