//获取ID
function UrlSearch() {
    var name,value; 
    var str=location.href; 
    var num=str.indexOf("?");
    str=str.substr(num+1);
    
    var arr=str.split("&"); 
    for(var i=0;i < arr.length;i++){ 
        num=arr[i].indexOf("="); 
        if(num>0){ 
            name=arr[i].substring(0,num);
            value=arr[i].substr(num+1);
            this[name]=value;
        } 
    } 
}

var serverUrl = "http://192.168.1.18/canton/"; //后端接口地址

//刷新函数
function windowFresh(){
    location.reload(true);
}

var Request=new UrlSearch();
var tableID = Request.id;
var type_code = 'batch';
var template_id = Request.template_id;
console.log(tableID);
console.log(type_code);
console.log(template_id);

//未提交保存内容提示
$(window).bind('beforeunload',function(){return "您修改的内容尚未保存，确定离开此页面吗？";});


// register the grid component
Vue.component('demo-grid', {
  template: '#grid-template',
  props: {
    data: Array,
    columns: Array,
    filterKey: String
  },
  methods:{
    //删除数据
    remove:function(entry,$index){
        var entry = entry;
        var product_id = entry.product_id;
        var form_id = oTableIn.info.id;
        var parent_id = entry.parent_id;
        var BigData = oTableIn.gridData;
        var oIndex = $index; //当前数据索引
        if($index==0){
            layer.msg('模板数据不可以删除');
            console.log($index);
        }else if(parent_id==0){ //如果是主条目,进入循环删除变体
            //向服务器发起请求
            $.ajax({
                type:'POST',
                url:serverUrl+'delete/product',
                datatype:'json',
                data:{
                    type_code:type_code,
                    product_id:product_id
                },
                success:function(data){
                    if(data.status==100){
                        //删除---------->

                        var oDelete = new Array();
                        for(var i=0;i<oTableIn.gridData.length;i++){
                            if(BigData[i].parent_id==product_id) {
                                oDelete.unshift(i);//倒叙存
                            }
                        }
                        var deleteLen = oDelete.length+1;//加1是加上主体本身
                        //进行删除
                        oTableIn.gridData.splice(oIndex,deleteLen);
                        
                        // for(var h=0;h<oDelete.length;h++){
                        //     var i = oDelete[h];//获取oDelete数组中的下标，上面一个for循环存的
                        //     oTableIn.gridData.splice(i,1);
                        // }

                        // //删除主体
                        // oTableIn.gridData.splice(oIndex,1);

                        //删除---------->
                    }else{
                        layer.msg(data.msg);
                    }
                },
                error:function(jqXHR){
                    layer.msg('向服务器请求删除失败');
                }
            })

        }else if(parent_id!=0){ //如果是变体
            //向服务器发起请求
            $.ajax({
                type:'POST',
                url:serverUrl+'delete/product',
                datatype:'json',
                data:{
                    type_code:type_code,
                    product_id:product_id
                },
                success:function(data){
                    if(data.status==100){
                        oTableIn.gridData.splice(oIndex,1);//删除
                    }else{
                        layer.msg(data.msg);
                    }
                },
                error:function(jqXHR){
                    layer.msg('向服务器请求删除失败');
                }
            })
        }
    },
    //添加主体
    addline:function(entry,$index){
        var BigData = oTableIn.gridData; 
        var newData = BigData.slice();//复制整个数组
        //添加条目获取ID
        $.ajax({
            type:'POST',
            url:serverUrl+'get/sysId',
            datatype:'json',
            data:{
                app_code:'product_batch_information',
                num:1
            },
            success:function(data){
                if(data.status==100){
                    newObj = $.extend(true, {}, newData[$index]);//复制json对象,此方法只能复制json对象
                    newObj.product_id = data.value[0];//添加ID，好区别开来
                    newObj.types      = 'yes';   //标记是新增，后台需要
                    oTableIn.gridData.push(newObj);//把新的对象push进去
                }else if(data.status==101){
                    layer.msg('操作失败');
                }
            },
            error:function(jqXHR){
                layer.msg('向服务器请求增加失败');
            }
        })
    },
    //添加变体
    addchange:function(entry,$index){
        var BigData = oTableIn.gridData; 
        var newData = BigData.slice();//复制整个数组
        var parent_id = entry.product_id;
        //添加条目获取ID
        $.ajax({
            type:'POST',
            url:serverUrl+'get/sysId',
            datatype:'json',
            data:{
                app_code:'product_batch_information',
                num:1
            },
            success:function(data){
                if(data.status==100){
                    newObj = $.extend(true, {}, newData[$index]);//复制json对象,此方法只能复制json对象
                    newObj.product_id = data.value[0];//添加ID，好区别开来
                    newObj.parent_id = parent_id;
                    newObj.types = 'yes'; //标记是新增，后台需要
                    oTableIn.gridData.splice($index+1,0,newObj);//把新的对象添加进去
                }else if(data.status==101){
                    layer.msg('操作失败');
                }
            },
            error:function(jqXHR){
                layer.msg('向服务器请求增加失败');
            }
        })
    }
  }
})

var pageSize = 20;//默认每页展示多少数据，加载时用
var oPageNow; //当前页全局变量，暂存异步刷新用

var oTableIn = new Vue({
    el:'body',
    data:{
        TableCreat:'',
        info:'',
        gridColumns: [],//表头数据
        gridData: [],//表格数据
        pageData:[],
        countPage:'',
        countNum:'',
        pageNow:'',
        pageSize:20,
        newData:'',
        jump:'',
        selectCheck:'',//选中检查项
        checkDataBtn:''//重复检查按钮
    },
    computed:{
        //控制上一页按钮
        preBtn:function(){
            if(this.pageNow==1){
                return true
            }else{
                return false
            }
        },
        //控制下一页按钮
        nextBtn:function(){
            if(this.pageNow==this.countPage){
                return true
            }else{
                return false
            }
        },
        //跳转按钮
        jumpBtn:function(){
            if(!this.jump){
                return true
            }else{
                return false
            }
        },
        //重复检查按钮
        checkDataBtn:function(){
            if(this.selectCheck){
                return false
            }else{
                return true
            }
        }
    },
    ready:function(){
        var LoadIndex = layer.load(3, {shade:[0.3, '#000']}); //开启遮罩层
        //获取表格信息
        $.ajax({
            type:'POST',
            url:serverUrl+'get/oneform',
            datatype:'json',
            data:{
                id:tableID,
                type_code:type_code
            },
            success:function(data){
                if(data.status==100){
                    oTableIn.info = data.value[0];
                }else if(data.status==101){
                    layer.msg('操作失败');
                }else if(data.status==102){
                    layer.msg('表格的id为空');
                }
            },
            error:function(jqXHR){
                layer.msg('向服务器获取表格信息失败');
            }
        })

        //获取表头
        $.ajax({
            type:'POST',
            url:serverUrl+'get/bootstrap',
            datatype:'json',
            data:{
                template_id:template_id,
                type_code:type_code
            },
            success:function(data){
                if(data.status==100){
                    oTableIn.gridColumns = data.value;
                }
            },
            error:function(jqXHR){
                layer.msg('向服务器请求表头信息失败');
            }
        })

        //获取缓存数据
        $.ajax({
            type:'POST',
            url:serverUrl+'get/info',
            datatype:'json',
            data:{
                form_id:tableID,
                template_id:template_id,
                type_code:type_code,
                pageSize:pageSize //每页展示多少数据
            },
            success:function(data){
                layer.close(LoadIndex); //关闭遮罩层
                if(data.status==100){
                    oTableIn.gridData = data.value;
                    oTableIn.countPage = data.countPage;
                    oTableIn.countNum = data.countNum;
                    oTableIn.pageNow = data.pageNow;
                }else if(data.status==101){
                    // layer.msg('数据为空');
                }else if(data.status==102){
                    layer.msg('获取表格的ID为空');
                }else if(data.status==111){
                    layer.msg('表格没有数据');
                }
            },
            error:function(jqXHR){
                layer.close(LoadIndex); //关闭遮罩层
                layer.msg('向服务器请求表格信息失败');
            }
        })   
    },
    methods:{
        //提交
        sendMsg:function(){
            var max = oTableIn.gridData.length;
            var LoadIndex = layer.load(3, {shade:[0.3, '#000']}); //开启遮罩层
            var vm = oTableIn;

            $.ajax({
                type:'POST',
                url:serverUrl+'post/info',
                datatype:'json',
                data:{
                    type_code:type_code,
                    save_type:'submit',
                    category_id:oTableIn.info.category_id,
                    template_id:oTableIn.info.template_id,
                    form_id:oTableIn.info.id,
                    gridColumns:oTableIn.gridColumns,
                    max:max,
                    gridData:oTableIn.gridData
                },
                success:function(data){
                    layer.close(LoadIndex); //关闭遮罩层
                    if (data.status==100) {
                        // --------调试用
                        oTableIn.newData = data.t;
                        // --------调试用
                        
                        layer.msg('提交成功');
                        //解除未提交内容提示
                        $(window).unbind('beforeunload');
                        var Id = vm.info.id;

                        //跳转函数
                        function goNext() {
                            var url = 'batch-table-selectPic.html';
                            window.location.href = url+'?id='+Id;
                        }

                        setInterval(goNext,1000);

                    }else{
                        layer.msg(data.msg);
                    }
                },
                error:function(jqXHR){
                    layer.close(LoadIndex); //关闭遮罩层
                    layer.msg('向服务器请求提交数据失败');
                }
            })
        },
        //暂存
        saveMsg:function(){
            var max = oTableIn.gridData.length;
            var LoadIndex = layer.load(3, {shade:[0.3, '#000']}); //开启遮罩层 
            $.ajax({
                type:'POST',
                url:serverUrl+'post/info',
                datatype:'json',
                data:{
                    type_code:type_code,
                    category_id:oTableIn.info.category_id,
                    template_id:oTableIn.info.template_id,
                    form_id:oTableIn.info.id,
                    gridColumns:oTableIn.gridColumns,
                    max:max,
                    pageSize:oTableIn.pageSize,
                    pageNow:oTableIn.pageNow,
                    gridData:oTableIn.gridData
                },
                success:function(data){
                    layer.close(LoadIndex); //关闭遮罩层
                    if (data.status==100) {
                        // --------调试用
                        // oTableIn.newData = data.t;
                        // --------调试用
                        
                        layer.msg('暂存成功');
                        oPageNow = oTableIn.pageNow;//当前页

                        // 异步刷新
                        update(tableID,template_id,type_code,oPageNow,pageSize)

                        
                        //解除未提交内容提示
                        $(window).unbind('beforeunload');
                        // oTableIn.newData = data.value;
                    }else{
                        layer.msg(data.msg);
                    }
                },
                error:function(jqXHR){
                    layer.close(LoadIndex); //关闭遮罩层
                    layer.msg('向服务器请求暂存失败');
                }
            })
        },
        //返回上一步
        takeBack:function(){
            var vm = oTableIn;
            layer.confirm('返回上一步，此步骤的数据将不保存,上一步骤的数据也将被删除',{
                btn:['确定','取消']
            },function(index){
                layer.close(index);

                $.ajax({
                    type:'POST',
                    url:serverUrl+'back',
                    datatype:'json',
                    data:{
                        form_id:tableID,
                        type_code:type_code
                    },
                    success:function(data){
                        if(data.status==100){
                            //跳转函数
                            function goNext() {
                                $.ajax({
                                    type:'POST',
                                    url:serverUrl+'get/formNumber',
                                    datatype:'json',
                                    data:{
                                        type_code:type_code
                                    },
                                    success:function(data){
                                        if(data.status==100){
                                            //解除未提交内容提示
                                            $(window).unbind('beforeunload');

                                            var id = data.value;
                                            var url = 'batch-table-creat.html?tableID='+id;
                                            if(id){
                                                window.location.href = url;
                                            }
                                        }else{
                                            layer.msg('返回失败，请重试');
                                        }
                                    },
                                    error:function(jqXHR){
                                        layer.msg('返回失败，请重试');
                                    }
                                })
                            }

                            setInterval(goNext,1000);

                        }else{
                            layer.msg(data.msg);
                        }
                    },
                    error:function(jqXHR){
                        layer.msg('向服务器请求撤销返回失败');
                    }
                })
            })
        },
        //上一页
        goPre:function(){
            var next = this.pageNow;
            if(this.pageNow>1){
                var LoadIndex = layer.load(3, {shade:[0.3, '#000']}); //开启遮罩层
                //解除未提交内容提示
                $(window).unbind('beforeunload');
                next--;
                //获取缓存数据
                $.ajax({
                    type:'POST',
                    url:serverUrl+'get/info',
                    datatype:'json',
                    data:{
                        form_id:tableID,
                        template_id:template_id,
                        type_code:type_code,
                        next:next,
                        pageSize:oTableIn.pageSize //每页展示多少数据
                    },
                    success:function(data){
                        layer.close(LoadIndex); //关闭遮罩层
                        if(data.status==100){
                            oTableIn.gridData = data.value;
                            oTableIn.countPage = data.countPage;
                            oTableIn.countNum = data.countNum;
                            oTableIn.pageNow = data.pageNow;
                            //未提交保存内容提示
                            $(window).bind('beforeunload',function(){return "您修改的内容尚未保存，确定离开此页面吗？";});
                        }else if(data.status==101){
                            // layer.msg('数据为空');
                        }else if(data.status==102){
                            layer.msg('获取表格的ID为空');
                        }else if(data.status==111){
                            layer.msg('表格没有数据');
                        }
                    },
                    error:function(jqXHR){
                        layer.close(LoadIndex); //关闭遮罩层
                        layer.msg('向服务器请求表格信息失败');
                    }
                })
            }
        },
        //下一页
        goNext:function(){
            var next = this.pageNow;
            if(this.pageNow<this.countPage){
                var LoadIndex = layer.load(3, {shade:[0.3, '#000']}); //开启遮罩层
                //解除未提交内容提示
                $(window).unbind('beforeunload');
                next++;
                //获取缓存数据
                $.ajax({
                    type:'POST',
                    url:serverUrl+'get/info',
                    datatype:'json',
                    data:{
                        form_id:tableID,
                        template_id:template_id,
                        type_code:type_code,
                        next:next,
                        pageSize:oTableIn.pageSize //每页展示多少数据
                    },
                    success:function(data){
                        layer.close(LoadIndex); //关闭遮罩层
                        if(data.status==100){
                            oTableIn.gridData = data.value;
                            oTableIn.countPage = data.countPage;
                            oTableIn.countNum = data.countNum;
                            oTableIn.pageNow = data.pageNow;
                            //未提交保存内容提示
                            $(window).bind('beforeunload',function(){return "您修改的内容尚未保存，确定离开此页面吗？";});
                        }else if(data.status==101){
                            // layer.msg('数据为空');
                        }else if(data.status==102){
                            layer.msg('获取表格的ID为空');
                        }else if(data.status==111){
                            layer.msg('表格没有数据');
                        }
                    },
                    error:function(jqXHR){
                        layer.close(LoadIndex); //关闭遮罩层
                        layer.msg('向服务器请求表格信息失败');
                    }
                })
            }
        },
        //跳转
        goJump:function(){
            var next = this.jump;
            if(next>this.countPage){
                layer.msg('输入页码大于总页数');
                this.jump = '';
            }else{
                var LoadIndex = layer.load(3, {shade:[0.3, '#000']}); //开启遮罩层
                //解除未提交内容提示
                $(window).unbind('beforeunload');
                next++;
                //获取缓存数据
                $.ajax({
                    type:'POST',
                    url:serverUrl+'get/info',
                    datatype:'json',
                    data:{
                        form_id:tableID,
                        template_id:template_id,
                        type_code:type_code,
                        next:next,
                        pageSize:oTableIn.pageSize //每页展示多少数据
                    },
                    success:function(data){
                        layer.close(LoadIndex); //关闭遮罩层
                        if(data.status==100){
                            oTableIn.gridData = data.value;
                            oTableIn.countPage = data.countPage;
                            oTableIn.countNum = data.countNum;
                            oTableIn.pageNow = data.pageNow;
                            //未提交保存内容提示
                            $(window).bind('beforeunload',function(){return "您修改的内容尚未保存，确定离开此页面吗？";});
                        }else if(data.status==101){
                            // layer.msg('数据为空');
                        }else if(data.status==102){
                            layer.msg('获取表格的ID为空');
                        }else if(data.status==111){
                            layer.msg('表格没有数据');
                        }
                    },
                    error:function(jqXHR){
                        layer.close(LoadIndex); //关闭遮罩层
                        layer.msg('向服务器请求表格信息失败');
                    }
                })
            }
        },
        //选择展示个数
        selectNum1:function(){
            oTableIn.pageSize = 10;
            pageSize = 10;
            var LoadIndex = layer.load(3, {shade:[0.3, '#000']}); //开启遮罩层
            //获取缓存数据
            $.ajax({
                type:'POST',
                url:serverUrl+'get/info',
                datatype:'json',
                data:{
                    form_id:tableID,
                    template_id:template_id,
                    type_code:type_code,
                    pageSize:oTableIn.pageSize //每页展示多少数据
                },
                success:function(data){
                    layer.close(LoadIndex); //关闭遮罩层
                    if(data.status==100){
                        oTableIn.gridData = data.value;
                        oTableIn.countPage = data.countPage;
                        oTableIn.countNum = data.countNum;
                        oTableIn.pageNow = data.pageNow;
                    }else if(data.status==101){
                        // layer.msg('数据为空');
                    }else if(data.status==102){
                        layer.msg('获取表格的ID为空');
                    }else if(data.status==111){
                        layer.msg('表格没有数据');
                    }
                },
                error:function(jqXHR){
                    layer.close(LoadIndex); //关闭遮罩层
                    layer.msg('向服务器请求表格信息失败');
                }
            }) 
        },
        selectNum2:function(){
            oTableIn.pageSize = 15;
            pageSize = 15;
            var LoadIndex = layer.load(3, {shade:[0.3, '#000']}); //开启遮罩层
            //获取缓存数据
            $.ajax({
                type:'POST',
                url:serverUrl+'get/info',
                datatype:'json',
                data:{
                    form_id:tableID,
                    template_id:template_id,
                    type_code:type_code,
                    pageSize:oTableIn.pageSize //每页展示多少数据
                },
                success:function(data){
                    layer.close(LoadIndex); //关闭遮罩层
                    if(data.status==100){
                        oTableIn.gridData = data.value;
                        oTableIn.countPage = data.countPage;
                        oTableIn.countNum = data.countNum;
                        oTableIn.pageNow = data.pageNow;
                    }else if(data.status==101){
                        // layer.msg('数据为空');
                    }else if(data.status==102){
                        layer.msg('获取表格的ID为空');
                    }else if(data.status==111){
                        layer.msg('表格没有数据');
                    }
                },
                error:function(jqXHR){
                    layer.close(LoadIndex); //关闭遮罩层
                    layer.msg('向服务器请求表格信息失败');
                }
            }) 
        },
        selectNum3:function(){
            oTableIn.pageSize = 20;
            pageSize = 20;
            var LoadIndex = layer.load(3, {shade:[0.3, '#000']}); //开启遮罩层
            //获取缓存数据
            $.ajax({
                type:'POST',
                url:serverUrl+'get/info',
                datatype:'json',
                data:{
                    form_id:tableID,
                    template_id:template_id,
                    type_code:type_code,
                    pageSize:oTableIn.pageSize //每页展示多少数据
                },
                success:function(data){
                    layer.close(LoadIndex); //关闭遮罩层
                    if(data.status==100){
                        oTableIn.gridData = data.value;
                        oTableIn.countPage = data.countPage;
                        oTableIn.countNum = data.countNum;
                        oTableIn.pageNow = data.pageNow;
                    }else if(data.status==101){
                        // layer.msg('数据为空');
                    }else if(data.status==102){
                        layer.msg('获取表格的ID为空');
                    }else if(data.status==111){
                        layer.msg('表格没有数据');
                    }
                },
                error:function(jqXHR){
                    layer.close(LoadIndex); //关闭遮罩层
                    layer.msg('向服务器请求表格信息失败');
                }
            }) 
        },
        //重复检查
        checkData:function(){
            var vm = oTableIn;
            var selectCheck = this.selectCheck;
            var arr = new Array();
            var allData = this.gridData;
            var Len = allData.length;
            //遍历数组内所有对象，放到数组里
            for (var i = 0;i<Len;i++) {
                if (allData[i][selectCheck] != null&&allData[i][selectCheck]) {
                    arr.push(allData[i][selectCheck]);
                }
            }

            //检查重复
            var n = isRepeat(arr);
            if (n) {
                layer.msg('有重复值');
            }else{
                layer.msg('没有重复值');
            }

            // 验证重复元素，有重复返回true；否则返回false
            function isRepeat(arr) {
                var hash = {};
                for(var i in arr) {
                    if(hash[arr[i]]) {
                        return true;
                    }
                    // 不存在该元素，则赋值为true，可以赋任意值，相应的修改if判断条件即可
                    hash[arr[i]] = true;
                }
                return false;
            }
        }
    }
})

//获取数据函数
function update(tableID,template_id,type_code,oPageNow,pageSize) {
    var LoadIndex = layer.load(3, {shade:[0.3, '#000']}); //开启遮罩层

    //获取缓存数据
    $.ajax({
        type:'POST',
        url:serverUrl+'get/info',
        datatype:'json',
        data:{
            form_id:tableID,
            template_id:template_id,
            type_code:type_code,
            next:oPageNow,
            pageSize:pageSize //每页展示多少数据
        },
        success:function(data){
            layer.close(LoadIndex); //关闭遮罩层
            if(data.status==100){
                oTableIn.gridData = data.value;
                oTableIn.countPage = data.countPage;
                oTableIn.countNum = data.countNum;
                oTableIn.pageNow = data.pageNow;
            }else if(data.status==101){
                // layer.msg('数据为空');
            }else if(data.status==102){
                layer.msg('获取表格的ID为空');
            }else if(data.status==111){
                layer.msg('表格没有数据');
            }
        },
        error:function(jqXHR){
            layer.close(LoadIndex); //关闭遮罩层
            layer.msg('向服务器请求表格信息失败');
        }
    })
}



//序号过滤器
Vue.filter('ListNum',function(value){
    var str = value;
    var pageNow = oTableIn.pageNow;
    var pageCount = oTableIn.pageSize;
    if(pageNow==1){
        str = str + 1;
    }else if(pageNow>1){
        str = (pageNow-1)*10+str+1;
    }
    return str
})

$(document).ready(function(){
    //检测滚动条位置，显示隐藏页面头部
    $(window).scroll(function(){
       if($(window).scrollTop() > 50){
           $('.topContent').slideUp(300);
           $('#table').css('padding-top','200px');
           $('#table').css('padding-top','50px');
       }
    })

    //页面顶部隐藏显示
    $('.pullUP').on('click',function(){
        $('.topContent').slideUp(300);
        $('#table').css('padding-top','50px');
    });

    $('.pullDown').on('click',function(){
        $('.topContent').slideDown(300);
        $('#table').css('padding-top','720px');
    });

    //回到顶部
    $('.scrollToTop').click(function(){
        $("html,body").animate({scrollTop:0},300);
    });
});