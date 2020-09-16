Page({
  data: {
    //小程序没有refs，所以只能用动态布尔值控制关闭
    toggle: false,
    actions: [{
        name: '删除',
        color: '#fff',
        fontsize: '22',
        width: 80,
        //icon: 'like.png',//此处为图片地址
        background: '#ed3f14'
      },
      {
        name: '拉黑',
        width: 80,
        color: '#80848f',
        fontsize: '22',
        //icon: 'undo'
      }
    ],
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
  //按钮点击
  handlerCloseButton(e) {
    let index = e.detail.index;
    let item = e.detail.item;
    console.log(item)
    if (index === 0) {
      this.handleDelete(item._id, item.cloud)
    } else if (index === 1) {
      this.setBlacklist({...item.userInfo,openId:item.openId})

    }

    //list中可以每一项都设置toggle
    setTimeout(() => {
      this.setData({
        toggle: this.data.toggle ? false : true
      });
    }, 200)
  },
  setBlacklist(params) {

    const addLlacklist = () => {
      console.log(params)
      wx.showLoading({
        title: '加载中',
      })
      wx.cloud.callFunction({
          name: 'addLlacklist',
          data: {
            params
          }
        })
        .then(res => {
          console.log(res)
          wx.hideLoading()
          wx.showToast({
            title: '添加成功',
          })
        })
        .catch((err) => {
          console.log(res)
          wx.showToast({
            title: '添加失败'+err,
          })
        })
    }
    wx.showModal({
      title: '提示',
      content: '是否将用户拉入黑名单？',
      success(res) {
        if (res.confirm) {
          addLlacklist()
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },

  //删除记录
  handleDelete(_id, cloud) {
    const deleteReleaseId = () => {
      wx.cloud.callFunction({
          name: 'deleteReleaseId',
          data: {
            _id
          }
        })
        .then(res => {
          console.log('res', res)
          if (res.result.stats.removed >= 1) {
            this.deleteFiles([cloud])
            wx.showToast({
              icon: 'none',
              title: '删除成功'
            });
            this.setData({
              downRefresh: true,
              skip: 0,
              shopData: [],
              searchVal: "",
              isLoad: true,
            });

            wx.showLoading({
              title: '加载中',
            })
            this.getShopList(0, this.data.limit, "");

          } else {
            wx.showToast({
              icon: 'none',
              title: '删除失败'
            });
          }
        })
        .catch(err => {
          wx.showToast({
            icon: 'none',
            title: '删除失败'
          });
        })

    }

    wx.showModal({
      title: '提示',
      content: '是否确定删除？',
      success(res) {
        if (res.confirm) {
          deleteReleaseId()
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  //删除文件
  deleteFiles(fileIDs) {
    console.log(fileIDs instanceof Array, fileIDs)
    wx.cloud.callFunction({
        name: 'deleteFile',
        data: {
          fileIDs
        }
      })
      .then(res => {
        console.log(res)
      })
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
          title: `小商店管理(${count.total})`
        })
        let list = res.data.map(item => {

          let obj = {
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
        wx.hideLoading()
        console.log('shopData', this.data.shopData)
      })
      .catch(res => {
        wx.hideLoading()

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