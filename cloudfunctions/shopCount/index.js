// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
     env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
     const _ = db.command
     try {
          return await db.collection('shops').doc(event._id).update({
               data: {
                    count: _.inc(1)
               }
          })
     } catch (e) {
          console.error(e)
     }
}