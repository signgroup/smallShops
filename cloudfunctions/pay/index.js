//云开发实现支付
const cloud = require('wx-server-sdk')
// 初始化 cloud
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

//1，引入支付的三方依赖
const tenpay = require('tenpay');
//2，配置支付信息
const config = {
  appid: 'wx958910aa567900ea', 
  mchid: '1602627254',
  partnerKey: 'YC67Jhaok7Tt7TnMAOzULQSVQyOtTRA9', 
  notify_url: 'http://uni.13s.top', 
  spbill_create_ip: '127.0.0.1' //这里填这个就可以
};

exports.main = async(event, context) =>{
    const wxContext = cloud.getWXContext()
    let {
        money
    } = event;
    //3，初始化支付
    const api = tenpay.init(config);

    let result = await
    api.getPayParams({
        out_trade_no: Date.now(),
        body: '商品简单描述',
        total_fee: money*100, //订单金额(分),
        openid: wxContext.OPENID //付款用户的openid
    });
    return result;
}