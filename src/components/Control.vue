<template lang="pug">
    div#input
        button("v-on:click"='start' v-if="!started").start Start
        div(v-else)
            //- div(v-if="conversationType == 'text'")
            //-     input(v-model="message")
            //-     button("@click"="send") Отправить
            div(v-if="conversationType == 'options'")
                p {{optionType}}
                    img(:src="optionImage" height="100")
                button("v-for"="option in options" @click="choose(option)").card {{option}}
</template>
<script>
export default {
    props: [ "socket" ],
    data() {
        return {
            message: ""
        };
    },
    methods : {
        send : function() {
            this.socket.send(JSON.stringify({
                type: "message",
                message: this.message
            }));
            this.message = "";
        },
        start : function() {
            this.socket.send(JSON.stringify({
                type: "gamestart",
            }));
        },
        choose : function(option) {
            this.message = option;
            this.send();
            this.$store.dispatch("choose");
        }
    },

    computed : {
        started : function() {
            return this.$store.getters.started;
        },
        conversationType : function() {
            return this.$store.getters.conversationType;
        },
        options : function() {
            return this.$store.getters.options;
        },
        optionType : function() {
            let type = this.$store.getters.optionType;
            switch (type) {
            case "mafia" : return "В кого стреляем?";
            case "doctor" : return "Кого лечим?";
            case "police" : return "Кого подозреваем?";
            case "voting" : return "Против кого голосуем?";
            default : return "";
            }
        },
        optionImage : function() {
            let type = this.$store.getters.optionType;
            switch (type) {
            case "mafia" : return "https://vignette.wikia.nocookie.net/fallout/images/6/6e/MadeMan2.png/revision/latest?cb=20110814153411";
            case "doctor" : return "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Osgb-isyerihekimi.jpg/220px-Osgb-isyerihekimi.jpg";
            case "police" : return "http://www.lvivpost.net/application/_images/big/news/2016/04/28/890.jpg";
            case "voting" : return "http://infobusiness2.ru/files/image/Thumbnail.jpg";
            default : return "";
            }
        }
    }
};
</script>
<style lang="scss">
#input {
    .card {
        background: white;
        padding: 20px;
        margin: 20px;
        font-size: 20px;
    }

    .start {
        height: 100px;
        width: 100px;
        background: linear-gradient(to right, #4E90A4 0%, #3EC8AC 100%);
    }
}
</style>
