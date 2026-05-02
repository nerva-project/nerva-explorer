<template>
    <v-layout row grow class="no-select">
        <v-flex xs12>
            <v-layout row align-center class="secondary--text">
                <a :href="config.websiteUrl" rel="nofollow" target="_blank">
                    <img
                        align="middle"
                        src="@/assets/nerva-explorer.png"
                        alt="Logo"
                        class="nav-logo"
                        v-bind:class="{ 'nav-logo-mobile': isMobile }">
                </a>
                <v-spacer></v-spacer>
                <v-layout
                    row
                    align-center
                    justify-end
                    v-bind:class="{ 'px-2': !isMobile }">
                    <router-link to="/" class="px-1 ml-2 py-2 nav-link" exact>
                        <span>Explorer</span>
                    </router-link>
                    <!--<router-link to="/tools" class="px-1 ml-2 py-2 nav-link" exact>
                        <span>Tools</span>
                    </router-link>
                    <router-link to="/api" class="px-1 ml-2 py-2 nav-link" exact>
                        <span>API</span>
                    </router-link>-->
                    <v-btn
                        icon
                        flat
                        small
                        class="ml-2"
                        :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
                        @click="toggleTheme">
                        <v-icon size="18" color="secondary">{{ isDark ? 'fas fa-sun' : 'fas fa-moon' }}</v-icon>
                    </v-btn>
                </v-layout>
            </v-layout>
        </v-flex>
    </v-layout>
</template>

<script>
import Config from '@/config';
import { mapActions, mapGetters } from 'vuex';
import store from '@/store';
import { darkTheme, lightTheme } from '@/theme';

export default {
    name: 'navTop',
    data () {
        return {
            config: Config,
            isDark: localStorage.getItem('nerva-explorer-theme') !== 'light'
        };
    },
    computed: {
        ...mapGetters({
            strings: 'i18n/strings'
        }),
        isMobile () {

            return this.$vuetify.breakpoint.smAndDown;
        },
        currentRoute () {
            return this.$route.meta.title;
        }
    },
    methods: {
        ...mapActions({
            closeWallet: 'wallet/closeWallet',
            getKeys: 'wallet/getKeys'
        }),
        showWalletKeys () {

            this.getKeys();
        },
        signOut () {

            this.closeWallet();
            this.$router.push({ name: 'dashboard' });
        },
        toggleTheme () {
            this.isDark = !this.isDark;
            this.$vuetify.dark = this.isDark;
            const newTheme = this.isDark ? darkTheme : lightTheme;
            Object.keys(newTheme).forEach(key => {
                this.$vuetify.theme[key] = newTheme[key];
            });
            document.documentElement.classList.toggle('dark-mode', this.isDark);
            localStorage.setItem('nerva-explorer-theme', this.isDark ? 'dark' : 'light');
        }
    }
};
</script>

<style scoped>
.nav-logo {
    height: 42px;
    width: auto;
}
.nav-logo-mobile {
    height: 36px !important;
    width: auto;
}
/* Base (light mode) */
.nav-link {
    color: #686868;
    font-size: 16px;
    text-decoration: none;
    text-transform: uppercase;
    font-weight: 500;
}
.nav-link:hover, .nav-link:hover i {
    color: #444444;
}
.router-link-active.nav-link,
.router-link-exact-active.nav-link {
    cursor: default;
    color: #222222;
}
/* Dark mode */
:root.dark-mode .nav-link {
    color: #AEAEAE;
}
:root.dark-mode .nav-link:hover,
:root.dark-mode .nav-link:hover i {
    color: #CECECE;
}
:root.dark-mode .router-link-active.nav-link,
:root.dark-mode .router-link-exact-active.nav-link {
    cursor: default;
    color: #EDF0F2;
}
</style>
