<template>
  <div>
    <div class="shopcart">
      <div class="content" @click="toggleList">
        <div class="content-left">
          <div class="logo-wrapper">
            <div class="logo" :class="{'highlight':totalCount>0}">
              <span class="icon-shopping_cart" :class="{'highlight':totalCount>0}"></span>
            </div>
            <div class="num" v-show="totalCount>0">{{totalCount}}</div>
          </div>
          <div class="price" :class="{'highlight':totalPrice>0}">¥{{totalPrice}}元</div>
          <div class="desc">另需配送费¥{{deliveryPrice}}元</div>
          <div class="ball-container">
            <transition
              name="drop"
              v-for="ball in balls"
              key="ball"
              @before-enter="dropBeforeEnter"
              @enter="dropEnter"
              @after-enter="dropAfterEnter">
              <div class="ball" v-show="ball.show">
                <div class="ball-inner"></div>
              </div>
            </transition>
          </div>
        </div>
        <div class="content-right" @click.stop.prevent="pay">
          <div class="pay" :class="payClass">{{payDesc}}</div>
        </div>

      </div>
      <transition name="fold">
        <div class="shopcart-list" v-show="listShow">
          <div class="list-header">
            <h1 class="title">购物车</h1>
            <span class="empty" @click="empty">清空</span>
          </div>
          <div class="list-content" ref="listContent">
            <ul>
              <li class="food" v-for="food in selectFoods">
                <span class="name">{{food.name}}</span>
                <div class="price">
                  <span>¥{{food.price * food.count}}</span>
                </div>
                <div class="cartcontrol-wrapper">
                  <cartcontrol :food="food"  @cartAdd="drop"></cartcontrol>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </transition>
    </div>
    <transition name="fade">
      <div class="list-mask" v-show="listShow" @click="hideList"></div>
    </transition>


  </div>
</template>

<script type="text/ecmascript-6">
  import cartcontrol from 'components/cartcontrol/cartcontrol';
  import BScroll from 'better-scroll';
  export default {
    props: {
      selectFoods: {
        type: Array,
        default() {
          return [
            {
              price: 30,
              count: 1
            }
          ];
        }
      },
      deliveryPrice: {
        type: Number,
        default: 0
      },
      minPrice: {
        type: Number,
        default: 0
      }
    },
    data() {
      return {
        // 加入购物车的小球动画
        balls: [
          {show: false},
          {show: false},
          {show: false},
          {show: false},
          {show: false}
        ],
        // 执行完动画的小球，临时存储在这
        dropBalls: [],
        fold: true
      };
    },
    computed: {
      totalPrice() {
        let total = 0;
        this.selectFoods.forEach((food) => {
          total += food.price * food.count;
        });
        return total;
      },
      totalCount() {
        let count = 0;
        this.selectFoods.forEach((food) => {
          count += food.count;
        });
        return count;
      },
      payDesc() {
        if (this.totalPrice === 0) {
          return `¥${this.minPrice}元起送`;
        } else if (this.totalPrice < this.minPrice) {
          let diff = this.minPrice - this.totalPrice;
          return `还差¥${diff}元起送`;
        } else {
          return '去结算';
        }
      },
      payClass() {
        if (this.totalPrice < this.minPrice) {
          return 'not-enough';
        } else {
          return 'enough';
        }
      },
      listShow() {
        if (!this.totalCount) {
          this.fold = true;
          return false;
        }
        let show = !this.fold;
        if (show) {
          this.$nextTick(function () {
            if (!this.scroll) {
              this.scroll = new BScroll(this.$refs.listContent, {
                click: true
              });
            } else {
              this.scroll.refresh();
            }
          });
        }
        return show;
      }

    },
    methods: {
      toggleList() {
        if (!this.totalCount) {
          return;
        }
        this.fold = !this.fold;
      },
      empty() {
        this.selectFoods.forEach((food) => {
          food.count = 0;
        });
      },
      hideList() {
        this.fold = true;
      },
      pay() {
        if (this.totalPrice < this.minPrice) {
          return;
        }
        window.alert(`支付${this.totalPrice}元`);
      },
      drop(el) {
        for (let i = 0, length = this.balls.length; i < length; i++) {
          let ball = this.balls[i];
          if (!ball.show) {
            ball.show = true;
            // 把当前点击的元素，设置成ball的属性，这样在dropBeforeEnter钩子函数里，
            // 就能通过ball.el来确定小球的起始位置了
            ball.el = el;
            // 把开始运动的小球，放在dropBalls里，以便在运动结束之后隐藏该小球
            // 是为了能确定哪个小球，防止点击过快的话不能确定哪个小球是执行动画的
            this.dropBalls.push(ball);
            return;
          }
        }
      },
      // 小球动画开始之前
      dropBeforeEnter(el) {
        // 小球运动之前，先确定开始的位置
        for (let i = 0, len = this.balls.length; i < len; i++) {
          let ball = this.balls[i];
          if (ball.show) {
            let rect = ball.el.getBoundingClientRect();
            let x = (rect.left - 26) + 'px';
            let y = -(window.innerHeight - rect.top - 25) + 'px';
            let inner = el.querySelector('.ball-inner');
            el.style.transform = `translate3d(0, ${y}, 0)`;
            el.style.webkitTransform = `translate3d(0, ${y}, 0)`;
            inner.style.transform = `translate3d(${x}, 0, 0)`;
            inner.style.webkitTransform = `translate3d(${x}, 0, 0)`;
          }
        }
      },
      // 小球动画开始
      dropEnter(el) {
        // 用el.offsetHeight来触发浏览器重绘，这样就能正确的计算出位置了
        /* eslint-disable no-unused-vars */
        let rf = el.offsetHeight;
        // 开始运动的时候，就设置相应的transition和transfrom
        this.$nextTick(() => {
          el.style.transform = 'translate3d(0,0,0)';
          el.style.webkitTransform = 'translate3d(0,0,0)';
          el.style.transition = 'all .4s cubic-bezier(.32,-0.59,.85,.57)';
          el.style.webkitTransition = 'all .4s cubic-bezier(.32,-0.59,.85,.57)';
          let inner = el.querySelector('.ball-inner');
          inner.style.transform = 'translate3d(0, 0, 0)';
          inner.style.webkitTransform = 'translate3d(0, 0, 0)';
          inner.style.transition = 'all .4s linear';
          inner.style.webkitTransition = 'all .4s linear';
        });
      },
      // 小球动画结束后
      dropAfterEnter(el) {
        // 在dropBalls里，要以队列的形式来使运动完成的小球隐藏
        // 因为开始运动之前，是把小球push到dropBalls的最后一个
        // 以这种队列的形式，才不至于因为点击过快而露掉哪个小球
        let ball = this.dropBalls.shift();
        if (ball) {
          ball.show = false;
        }
        // 运动结束后，要把transition设置为空，否则会影响该小球下次出现时候的动画
        el.style.transition = '';
        el.style.webkitTransition = '';
        let inner = el.querySelector('.ball-inner');
        inner.style.transition = '';
        inner.style.webkitTransition = '';
      }
    },
    components: {
      cartcontrol
    }
  };
</script>

<style lang="scss" rel="stylesheet/scss">
  @import "../../common/scss/mixin";

  .shopcart {
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 50;
    width: 100%;
    height: 48px;
    .content {
      display: flex;
      background: #141d27;
      font-size: 0;
      color: rgba(255, 255, 255, 0.4);
      .content-left {
        flex: 1;
        .logo-wrapper {
          display: inline-block;
          position: relative;
          top: -10px;
          margin: 0 12px;
          padding: 6px;
          width: 56px;
          height: 56px;
          box-sizing: border-box;
          vertical-align: top;
          border-radius: 50%;
          background: #141d27;
          .logo {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            text-align: center;
            background: #2b343c;
            &.highlight {
              background: rgb(0, 160, 220);
            }
            .icon-shopping_cart {
              line-height: 44px;
              font-size: 24px;
              color: #80858a;
              &.highlight {
                color: #ffffff;
              }
            }
          }
          .num {
            position: absolute;
            top: 0;
            right: 0;
            width: 24px;
            height: 16px;
            line-height: 16px;
            text-align: center;
            border-radius: 16px;
            font-size: 9px;
            font-weight: 700;
            color: #ffffff;
            background: rgb(240, 20, 20);
            box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.4);
          }
        }
        .price {
          display: inline-block;
          vertical-align: top;
          margin-top: 12px;
          line-height: 24px;
          padding-right: 12px;
          box-sizing: border-box;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 16px;
          font-weight: 700;
          &.highlight {
            color: #ffffff;
          }
        }
        .desc {
          display: inline-block;
          vertical-align: top;
          margin: 12px 0 0 12px;
          line-height: 24px;
          font-size: 10px;
        }
        .ball-container {
          background: red;
          .ball {
            position: fixed;
            left: 32px;
            bottom: 22px;
            z-index: 200;
            &.drop-transition {
              transition: all 0.4s;

            }
            .ball-inner {
              width: 16px;
              height: 16px;
              border-radius: 50%;
              background: rgb(0, 160, 220);
              transition: all 0.4s;
            }
          }
        }
      }
      .content-right {
        flex: 0 0 105px;
        wdith: 105px;
        .pay {
          height: 48px;
          line-height: 48px;
          text-align: center;
          font-size: 12px;
          font-weight: 700;
          background: #2b333b;
          &.not-enough {
            background: #2b333b;
          }
          &.enough {
            background: #00b43c;
            color: #ffffff;
          }

        }
      }


    }


    .shopcart-list {
      position: absolute;
      left: 0;
      bottom: 48px;
      z-index: -1;
      width: 100%;
      transition: all .3s;
      &.fold-leave, &.fold-enter-active {
        transform: translate3d(0, 0, 0);
      }
      &.fold-enter, &.fold-leave-active {
        transform: translate3d(0, 100%, 0);
      }
      .list-header {
        height: 40px;
        line-height: 40px;
        padding: 0 18px;
        background: #f3f5f7;
        border-bottom: 1px solid rgba(7, 17, 27, 0.1);
        .title {
          float: left;
          font-size: 14px;
          color: rgb(7, 17, 27);
        }
        .empty {
          float: right;
          font-size: 12px;
          color: rgb(0, 160, 220);
        }
      }
      .list-content {
        padding: 0 18px;
        max-height: 217px;
        overflow: hidden;
        background: #ffffff;
        .food {
          position: relative;
          padding: 12px 0;
          box-sizing: border-box;
          @include border-1px(rgba(7, 17, 27, 0.1));
          .name {
            line-height: 24px;
            font-size: 14px;
            color: rgb(7, 17, 27);
          }
          .price {
            position: absolute;
            right: 90px;
            bottom: 12px;
            line-height: 24px;
            font-size: 14px;
            font-weight: 700;
            color: rgb(240, 20, 20);
          }
          .cartcontrol-wrapper {
            position: absolute;
            right: 0;
            bottom: 6px;
          }
        }
      }
    }
  }

  .list-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 40;
    opacity: 1;
    background: rgba(7, 17, 27, 0.6);
    backdrop-filter: blur(10px);
    transition: all 0.5s;
    &.fade-enter, &.fade-leave {
      opacity: 0;
      background: rgba(7, 17, 27, 0);
    }
  }
</style>
