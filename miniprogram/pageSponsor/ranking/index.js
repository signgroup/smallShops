//index.js
//获取应用实例
const app = getApp()
const db = wx.cloud.database()
import util from './../../utils/index'


Page({
     data: {
          navData: [{
                    text: '最新赞赏'
               },
               {
                    text: '排行榜'
               },
          ],
          currentTab: 0,
          navScrollLeft: 0,
          sponsorData: [],
          hiddenLoading: false, //loading是否隐藏
          skip: 0, //数据从0开始
          limit: 20, //每页显示的条数
          num: 20,
          count: 0, //总条数
          isLoad: true, //加载状态
          triggered: false, //自定义下拉状态
     },
     //事件处理函数
     onLoad() {
          this.getSponsor()
     },

     /**
      * 页面上拉触底事件的处理函数
      */
     onReachBottom: function () {
          console.log(this.data.skip);
          console.log(!this.data.isLoad);
          //判断是否有数据
          if (!this.data.isLoad) {
               this.getSponsor(this.data.skip, this.data.limit);
          }
     },
     switchNav(event) {
          var cur = event.currentTarget.dataset.current;
          //每个tab选项宽度占1/5
          var singleNavWidth = this.data.windowWidth / 2;
          //tab选项居中                            
          this.setData({
               navScrollLeft: (cur - 2) * singleNavWidth
          })
          if (this.data.currentTab == cur) {
               return false;
          } else {
               this.setData({
                    currentTab: cur
               })
          }
     },
     //切换容器
     switchTab(e) {
          var cur = e.detail.current;
          var singleNavWidth = this.data.windowWidth / 2;
          this.setData({
               currentTab: cur,
               navScrollLeft: (cur - 2) * singleNavWidth
          });
     },
     //获取赞赏数据
     getSponsor() {
          let {
               num,
               skip,
               limit,
               sponsorData
          } = this.data
          let _this = this
          console.log('skip', skip)
          db.collection('sponsor')
               .skip(skip)
               .limit(limit)
               .orderBy('timeStamp', 'desc')
               .get().then(res => {
                    // console.log(res.data)
                    let {
                         data
                    } = res
                    const list = data.map(item => {
                         item.datatime = util.formatTime(item.timeStamp)
                         item.color = util.formatColor(item.money)
                         return item
                    })
                    //还有数据，继续
                    if (data.length == num) {
                         this.setData({
                              skip: skip + num,
                              isLoad: false,
                         })
                    } else {
                         //无数据了
                         this.setData({
                              isLoad: true,
                         })
                    }
                    //这样写免去for循环push
                    if (sponsorData.length) {
                         sponsorData = sponsorData.concat(list)
                    } else {
                         sponsorData = list
                    }

                    console.log(sponsorData)

                    _this.setData({
                         sponsorData,
                         triggered: false,
                         hiddenLoading: true
                    })

               })
     },
     //自定义下拉刷新
     onAllRefresh() {
          this.setData({
               skip: 0,
               sponsorData: [],
               isLoad: true
          });
          this.getSponsor();
     },
     //自定义上拉加载
     allLoadMore(e) {
          if (!this.data.isLoad) {
               this.getSponsor();
          }
     },

})