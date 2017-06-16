// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import Vuex from 'vuex';
import App from './App';
import VueRouter from 'vue-router';
import VueResource from 'vue-resource';
import goods from 'components/goods/goods';
import ratings from 'components/ratings/ratings';
import seller from 'components/seller/seller';
import 'common/scss/index.scss';

Vue.config.productionTip = false;
Vue.use(VueRouter);
Vue.use(Vuex);
Vue.use(VueResource);
// router.go('/goods');
/* eslint-disable no-new */
//  const POSITIVE = 0;
//  const NEGATIVE = 1;
// const ALL = 2;
// const User = {
//   template: '#user',
//   watch: {
//     '$route'(to, from){
//       console.log('从' + from.params.id + '到' + to.params.id);
//     }
//   }
// };
const routes = [
  {path: '/', redirect: '/goods'},
  {path: '/goods', component: goods},
  {path: '/ratings/', component: ratings},
  {path: '/seller', component: seller}
];
const router = new VueRouter({
  linkActiveClass: 'active',
  routes // （缩写）相当于 routes: routes
});
const store = new Vuex.Store({
  state: {
    ballTarget: {},
    selectType: 2,
    onlyContent: {
      type: Boolean,
      default: false
    },
    balls: [
      {show: false},
      {show: false},
      {show: false},
      {show: false},
      {show: false}
    ],
    dropBalls: []
  },
  mutations: {
    tabSelect (state, num) {
      state.selectType = num;
    },
    toggleContent (state) {
      state.onlyContent = !state.onlyContent;
    },
    ballElChange (state, el) {
      state.ballTarget = el;
    }
  },
  getters: {
    doneTodos: state => {
      return state.todos.filter(todo => todo.done);
    }
  }
});
new Vue({
  store,
  router,
  template: '<App/>',
  components: {App}
}).$mount('#app');

