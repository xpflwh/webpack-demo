!function(){
	// 引入公共css模块
	require('../../css/vendor/reset.css');
    require('../../css/sprite-base.css');
	require('../../css/page/index.css');
	require('../../css/module/footer.css');
	// 加载 header模块
	require('../module/header.js');
	// 创建并加载slideMoudle模块，
	var slideModule = require('../module/slide.js');
	new slideModule({dom:$('[node-type="iccAdvisorPicture"]')});
    new slideModule({
        dom:$('[node-type="iccAdvisorPicture2"]'),
        delay:4000,
        duration:800
    });
    //添加图片预览框事件.
     var pageDialog=false;
     $('.pictureShow a').click(function(){
         var _this=$(this);//解决 dialogConfig.js中 图片路径问题 1
         var _id=$(this).attr('dialog-for');
         require.ensure(["../module/dialog.js","../module/dialogConfig.js"], function(require) {
             var dialogModule=require("../module/dialog.js");
             var dialogConfig=require("../module/dialogConfig.js");
             dialogConfig[_id]["src"]=_this.find('img').attr("src");//解决 dialogConfig.js中 图片路径问题 2
             if(!pageDialog){    //判断对话框组件是否存在，避免重复创建
                 pageDialog=new dialogModule();
             }
             pageDialog.openDialogWith(dialogConfig[_id]);
         });
     });
}()
