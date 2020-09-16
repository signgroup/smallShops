// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
     env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
     const wxContext = cloud.getWXContext()
     let params = {}
     if (event._id) {
          params = {
               _id: event._id
          }
     } else {
          params = {
               openId: wxContext.OPENID
          }
     }
     return await db.collection('shops').where(params).remove()
}