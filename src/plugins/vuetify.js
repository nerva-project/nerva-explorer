import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import { darkTheme, lightTheme } from '@/theme';

const isDark = localStorage.getItem('nerva-explorer-theme') === 'dark';

Vue.use(Vuetify, {
    theme: isDark ? darkTheme : lightTheme,
    options: {
        customProperties: true
    },
    iconfont: 'fa',
});
