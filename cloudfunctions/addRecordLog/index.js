// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
     env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {


     const wxContext = cloud.getWXContext()
     let data = {
          openId: wxContext.OPENID,
          date: new Date().getTime()
     }

     return await db.collection('record_log').add({
          data: data
     })


}