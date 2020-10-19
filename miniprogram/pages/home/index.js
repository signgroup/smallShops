// miniprogram/pages/home/index.js
const db = wx.cloud.database()
let skip = 0 //偏移量

Page({

     /**
      * 页面的初始数据
      */
     data: {
          hiddenLoading: false, //loading是否隐藏
          searchVal: '', //搜索框值
          limit: 20, //每页显示的条数
          num: 20,
          count: 0, //总条数
          isLoad: true, //加载状态
          shopData: [], //列表数据
          triggered: false, //自定义下拉状态
     },

     /**
      * 
      * 生命周期函数--监听页面加载
      */
     onLoad() {
          skip = 0 //偏移量
          this.getShopList("")


          this.getCopy()


     },


     /**
      * 生命周期函数--监听页面初次渲染完成
      */
     onReady: function () {

     },

     /**
      * 生命周期函数--监听页面显示
      */
     onShow: function () {

     },

     /**
      * 生命周期函数--监听页面隐藏
      */
     onHide: function () {

     },

     /**
      * 生命周期函数--监听页面卸载
      */
     onUnload: function () {

     },
     goTop: function (e) { // 一键回到顶部
          this.setData({
               topNum: 0
          });
     },
     //自定义下拉刷新
     onAllRefresh() {
          wx.stopPullDownRefresh();
          skip = 0
          this.setData({
               shopData: [],
               searchVal: "",
               isLoad: true
          })
          this.getShopList("")
     },
     //自定义上拉加载
     allLoadMore(e) {
          console.log('this.data.isLoad', !this.data.isLoad)
          if (!this.data.isLoad) {
               this.getShopList(this.data.searchVal);
          }
     },
     //滚动时触发
     scrolltoupper(e) {
          // console.log(e)
          /*
          //此方法不推荐用，1秒内执行20次setData
          this.setData({
               topStatus: e.detail.scrollTop > 400
          });
          */
          if (e.detail.scrollTop > 400) {
               if (!this.data.topStatus) {
                    this.setData({
                         topStatus: true
                    });
               }
          } else {
               this.setData({
                    topStatus: false
               });
          }
     },

     /**
      * 用户点击右上角分享
      */
     onShareAppMessage: function () {

     },
     //复制
     getCopy() {
          db.collection('copy')
               .get()
               .then(res => {
                    let {
                         data
                    } = res
                    console.log(data)
                    wx.setClipboardData({
                         data: data[0].content,
                         success: () => {
                              wx.hideToast({
                                   success: (res) => {},
                              })
                         }
                    })
               })
               .catch(() => {
                    this.setData({
                         hiddenLoading: true
                    })
               })
     },

     //获取人员列表
     getShopList(search) {
          wx.showNavigationBarLoading()
          wx.cloud.callFunction({
                    name: 'getSearch',
                    data: {
                         skip: skip, //条件限制，根据需要传参
                         limit: this.data.limit,
                         search: search
                    }
               })
               .then(r => {
                    console.log(r)
                    const {
                         res,
                         count
                    } = r.result

                    if (res.data.length == this.data.num) {
                         skip = skip + this.data.num
                    }
                    this.setData({
                         isLoad: res.data.length != this.data.num
                    })
                    wx.setNavigationBarTitle({
                         title: `众商小店(${count.total})`
                    })
                    let list = res.data.map(item => {
                         let searchStr = search.trim()
                         if (searchStr) {
                              let str = `<span style="color:#f00">${searchStr}</span>`
                              item.title = item.title.replace(searchStr, str)
                         }
                         item.cycleTime = this.getDateDiff(item.refresh_date)
                         return item
                    })
                    //这样写免去for循环push
                    if (this.data.shopData.length) {
                         this.data.shopData = this.data.shopData.concat(list)
                    } else {
                         this.data.shopData = list
                    }
                    // console.log(_this.data.insuredList)
                    /*
                     * triggered
                     * rue 表示下拉刷新已经被触发
                     * false 表示下拉刷新未被触发
                     */
                    this.setData({
                         triggered: false,
                         shopData: this.data.shopData,
                         hiddenLoading: true
                    })
                    wx.hideNavigationBarLoading()
                    console.log('shopData', this.data.shopData)
               })
               .catch(res => {
                    wx.hideNavigationBarLoading()
                    this.setData({
                         triggered: false,
                         hiddenLoading: true
                    })
                    console.error(res)

               })
     },
     //图片懒加载
     onLazyLoad(e) {
          // console.log(e)
          const {
               index
          } = e.currentTarget.dataset
          let {
               shopData
          } = this.data
          if (e.detail.width) {
               shopData[index].load = true
               setTimeout(() => {
                    this.setData({
                         shopData
                    })
               }, 300);
          }
     },
     //获取搜索input内容
     searchInput(e) {
          let val = e.detail.value.trim();
          this.setData({
               searchVal: val
          })
     },
     // 搜索
     btnSearch() {
          skip = 0

          this.setData({
               isLoad: false,
               shopData: []
          })
          this.getShopList(this.data.searchVal)
     },
     //跳转小程序
     ToMiniProgram(e) {
          const {
               item,
               index
          } = e.currentTarget.dataset
          let _this = this
          wx.navigateToMiniProgram({
               appId: item.appId,
               envVersion: 'release',
               success(res) {
                    // 打开成功
                    _this.addCount(item._id, index)
               },
               complete(res) {
                    console.log('complete', res)
               }
          })
     },
     //增加pv流量
     addCount(_id, index) {
          wx.cloud.callFunction({
                    name: 'shopCount',
                    data: {
                         _id
                    }
               })
               .then(r => {
                    console.log('r', r)
                    // 本地增加1 少请求云函数
                    this.data.shopData[index].count += 1;

                    this.setData({
                         shopData: this.data.shopData
                    })
               })
     },
     // 时间转换
     getDateDiff(e) {
          //将字符串转换成时间格式
          let timePublish = new Date(e);
          let getMonth = timePublish.getMonth() + 1
          let getDate = timePublish.getDate()
          let timeNow = new Date();
          let minute = 1000 * 60;
          let hour = minute * 60;
          let day = hour * 24;
          let month = day * 30;
          let diffValue = timeNow - timePublish;
          let diffMonth = diffValue / month;
          let diffWeek = diffValue / (7 * day);
          let diffDay = diffValue / day;
          let diffHour = diffValue / hour;
          let diffMinute = diffValue / minute;
          // console.log(diffMonth);
          let result = ""
          if (diffMonth > 11) {
               result = timePublish.getFullYear() + "-";
               result += timePublish.getMonth() + "-";
               result += timePublish.getDate();
               //      alert(result);
          } //超过三天显示具体时间
          else if (diffMonth > 1) {
               result = getMonth + "月" + getDate;
          } else if (diffWeek > 1) {
               result = parseInt(diffWeek) + "周前";
          } else if (diffDay > 1) {
               result = parseInt(diffDay) + "天前";
          } else if (diffHour > 1) {
               result = parseInt(diffHour) + "时前";
          } else if (diffMinute > 1) {
               result = parseInt(diffMinute) + "分前";
          } else {
               result = "刚更新";
          }
          return result;
     },
})