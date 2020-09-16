// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
     const _ = db.command;
     const wxContext = cloud.getWXContext();

     //对象key动态赋值
     /**
      *db 数据库表名
      *skip 分页从第几条开始
      *limit 限度返回个数
      *不能与doc一起使用
      */

     var sql = db.collection("shops");
     if (event.skip) {
          sql = sql.skip(event.skip);
     }
     if (event.limit) {
          sql = sql.limit(event.limit);
     }
     if (event.search) {
          sql = sql.where(_.or([{
                    title: db.RegExp({
                         regexp: '.*' + event.search,
                         options: 'i',
                    })
               },
               {
                    introduce: db.RegExp({
                         regexp: '.*' + event.search,
                         options: 'i',
                    })
               },



          ]))
     }

     let res = await sql.orderBy('refresh_date', 'desc').get();

     let count = await sql.count()
     return {
          context,
          event,
          count,
          res
     }
}

//调用方法
// wx.cloud.callFunction({
//    name: 'getCloud',
//    data: {
//       db: "background",
//       skip: 0,//条件限制，根据需要传参
//       limit: 100
//    }
// })
// .then(res => {
//    console.log(res.result.res.data)
// })