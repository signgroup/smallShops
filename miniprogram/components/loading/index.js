// component/HomeLoading/index.js
Component({
     /**
      * 组件的属性列表
      */
     properties: {
          hidden: {
               type: Boolean,
               value: true
          },
          loadingIndex: {
               type: Number,
               value: -1
          }
     },

     /**
      * 组件的初始数据
      */
     data: {
          randomNum: {
               leftNum: 0,
               rightNum: 0
          }
     },

     /**
      * 组件的方法列表
      */
     methods: {

     },
     ready: function () {
          console.log(this.properties)
          console.log(typeof this.properties.hidden, this.properties.hidden)

          const _random = (num = 0) => {
               return Math.ceil(Math.random() * num)
          }
          let randomNum = {
               leftNum: _random(255),
               rightNum: _random(255)
          }

          this.setData({
               randomNum
          })
          if (this.properties.loadingIndex < 0 || this.properties.loadingIndex > 29) {
               console.log(parseInt(Math.random() * 28))
               this.setData({
                    loadingIndex: parseInt(Math.random() * 28)
               })
          }
          // console.clear()

     },
})

/**
 * 调用方法
 * loadingIndex小于0或大于27使用随机
 * <home-loading hidden="{{hiddenLoading}}" loadingIndex="27"></home-loading>
 */