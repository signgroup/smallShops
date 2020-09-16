// miniprogram/pages/home/index.js
Page({

     /**
      * 页面的初始数据
      */
     data: {
          hiddenLoading: false, //loading是否隐藏
          searchVal: '', //搜索框值
          skip: 0, //数据从0开始
          limit: 20, //每页显示的条数
          num: 20,
          count: 0, //总条数
          isLoad: true, //加载状态
          downRefresh: false, //下拉状态
          shopData: [], //列表数据
     },

     /**
      * 生命周期函数--监听页面加载
      */
     onLoad() {
          this.getShopList(0, this.data.num, "")
     },


     // 监听滚动条当前位置
     onPageScroll: function (e) {
          // console.log(e)
          if (e.scrollTop > 400) {
               this.setData({
                    topStatus: true
               });
          } else {
               this.setData({
                    topStatus: false
               });
          }
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

     /**
      * 页面相关事件处理函数--监听用户下拉动作
      */
     onPullDownRefresh: function () {
          console.log(!this.data.downRefresh)
          if (!this.data.downRefresh) {
               wx.stopPullDownRefresh();
               this.setData({
                    downRefresh: true,
                    skip: 0,
                    shopData: [],
                    searchVal: "",
                    isLoad: true,
                    hiddenLoading: false
               });
               this.getShopList(this.data.skip, this.data.limit, "");
          }

     },

     /**
      * 页面上拉触底事件的处理函数
      */
     onReachBottom: function () {
          console.log(this.data.skip);
          //判断是否有数据
          if (!this.data.isLoad) {
               this.getShopList(this.data.skip, this.data.limit, this.data.searchVal);
          }
     },

     /**
      * 用户点击右上角分享
      */
     onShareAppMessage: function () {

     },
     //获取人员列表
     getShopList(skip, limit, search) {
          wx.cloud.callFunction({
                    name: 'getSearch',
                    data: {
                         skip: skip, //条件限制，根据需要传参
                         limit: limit,
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
                         this.setData({
                              skip: this.data.skip + this.data.num,
                              isLoad: false,
                         })
                    } else {
                         this.setData({
                              isLoad: true,
                         })
                    }

                    /*
                         搜索按钮赋可点击
                         下拉赋可下拉
                    */
                    this.setData({
                         btnDisabled: false,
                         downRefresh: false
                    })
                    wx.setNavigationBarTitle({
                         title: `小商店大全(${count.total})`
                    })
                    let list = res.data.map(item => {
                        
                         let obj={
                              ...item,
                         }

                         let searchStr = search.trim()
                         if (searchStr) {
                              let str = `<span style="color:#f00">${searchStr}</span>`
                              obj.title = item.title.replace(searchStr, str)
                         }
                         return {
                              ...obj,
                              cycleTime: this.getDateDiff(item.refresh_date)
                         }

                        
                    })
                    //这样写免去for循环push
                    if (this.data.shopData.length) {
                         this.data.shopData = this.data.shopData.concat(list)
                    } else {
                         this.data.shopData = list
                    }
                    // console.log(_this.data.insuredList)
                    this.setData({
                         shopData: this.data.shopData,
                         hiddenLoading: true
                    })

                    console.log('shopData', this.data.shopData)
               })
               .catch(res => {

                    console.log(res)

               })
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
          this.setData({
               skip: 0,
               isLoad: false,
               shopData: []
          })
          this.getShopList(0, this.data.num, this.data.searchVal)
     },

     // 时间转换
     getDateDiff(e) {
          //将字符串转换成时间格式
          var timePublish = new Date(e);
          var getMonth = timePublish.getMonth() + 1
          var getDate = timePublish.getDate()
          var timeNow = new Date();
          var minute = 1000 * 60;
          var hour = minute * 60;
          var day = hour * 24;
          var month = day * 30;
          var diffValue = timeNow - timePublish;
          var diffMonth = diffValue / month;
          var diffWeek = diffValue / (7 * day);
          var diffDay = diffValue / day;
          var diffHour = diffValue / hour;
          var diffMinute = diffValue / minute;
          // console.log(diffMonth);
          var result = ""
          if (diffValue < 0) {
               //      alert("错误时间");
          }
          //  else if (diffMonth > 3) {
          //      result = timePublish.getFullYear() + "-";
          //      result += timePublish.getMonth() + "-";
          //      result += timePublish.getDate();
          ////      alert(result);
          //  }//超过三天显示具体时间
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
               result = "刚发布";
          }
          return result;
     },
})