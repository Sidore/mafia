<template lang="pug">
    div#users
        div(v-for="user in users" :key="user")
            div.userCard
                p {{user.name}}
                p {{user.role}}
                p(v-if="user.player") Это вы
            hr
</template>
<script>
export default {
    data() {
        return {
            users : [
                {
                    name: "Vlad",
                    role: null,
                    player: true
                },
                {
                    name: "Vlad1",
                    role: null
                },
                {
                    name: "Vlad2",
                    role: null
                },
                {
                    name: "Vlad3",
                    role: null
                }
            ]
        };
    }
};
</script>
<style>

</style>
