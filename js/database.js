/**
 * Created by Administrator on 2016/8/31.
 */

/*页面刚开始从后台调数据*/

var serverUrl = "http://192.168.1.18/canton/"; //后端接口地址

var base = new Vue({
    el: 'body',
    data: {
        list:'',
        selected11:'',
        twoid:'',
        selected12:'',
        list3:[{id:'',tbl_name:''}],
        selected3:'',
        subkey1:'',
        type1:'',
        selected21:'',
        selected22:'',
        list2:[{id:'',tbl_name:''}],
        twoid2:'',
        type2:'',
        subkey2:'',
        selected3:'',
        basenum1:'',
    },
    ready: function () {
        $.ajax({
            type: "POST",
            url: serverUrl+"get/table",
            datatype: "json",
            success: function (data) {
                if (data.status == 100) {
                    base.list = data.values;
                }
                else if (data.status == 101) {
                    layer.msg('获取信息失败');
                }
            },
            error: function (jqXHR) {
                layer.msg('向服务器请求失败');
            }
        })
    },
    methods:{
        /*选择选项后第二个下拉展示*/
        choice:function() {
            var selected = base.selected11;
            if( selected != ""){
                $.ajax({
                    type:'POST',
                    url:serverUrl+'get/fields',
                    datatype:'JSON',
                    data:{
                        tbl_name:selected
                    },
                    success:function(data){
                        if(data.status == 100){
                            base.twoid = data.values;
                        }
                        else if (data.status == 101) {
                            layer.msg('获取信息失败');
                        }
                    },
                    error:function(jqXHR){
                        layer.msg('向服务器请求失败');
                    }
                })
            }
        },
        /*第一部分检测是否可以提交按钮*/
        /*/!*ttt:function(){
            test1 = setInterval("testpar()",3000)
            alert("111")*!/
        },*/
        testpar:function(){
            var selected = base.selected11;
            if(selected == ""){
                layer.msg('请选择需要分区的表');
            }
            $.ajax({
                type:'POST',
                url:serverUrl+'check',
                datatype:'json',
                data:{
                    tbl_name:selected,
                    operation:'s'
                },
                success:function(data){
                    //alert(data)
                    if(data.status == 110){
                        layer.msg('可以提交');
                        $("#submit-partition").removeAttr("disabled")
                    }
                    if(data.status == 100){
                        alert('提交成功');
                        location.reload()
                    }
                    else if(data.status == 101){
                        layer.msg('现在还不能提交');
                    }
                },
                error:function(jqXHR){
                    layer.msg('向服务器请求失败');
                }
            })
        },
        /*第一部分提交按钮程序*/
        subpar:function(){
            var selected = base.selected11
            var types = $("#types").val()
            var type = this.type1
            var num = base.basenum1
            var interval = $("#base-interval").val()
            var subtype = $("#subtype").val()
            var key = base.selected12
            var subnum = $("#base-subnum").val()
            var subkey = this.subkey1
            console.log(types)
            $.ajax({
                type:'POST',
                url:serverUrl+'establish/partition',
                datatype:'json',
                data:{
                    tbl_name:selected,
                    types:types,
                    type:type,
                    num:num,
                    interval:interval,
                    subtype:subtype,
                    key:key,
                    subnum:subnum,
                    subkey:subkey,
                },
                success:function(data){
                    if(data.status == 100){
                        layer.msg('提交成功')
                        $("#submit-partition").attr("disabled",true)
                    }
                    if(data.status == 101){
                        layer.msg('提交失败');
                    }
                    if(data.status == 103){
                        layer.msg('操作正在进行中');
                    }
                    if(data.status == 102){
                        layer.msg('请选择表');
                    }
                    if(data.status == 104){
                        layer.msg('请选择表的分区类型');
                    }
                    if(data.status == 105){
                        layer.msg('请选择表的分区列值');
                    }
                    if(data.status == 106){
                        layer.msg('请输入表的分区数量');
                    }
                    if(data.status == 107){
                        layer.msg('请输入表的分区区间');
                    }
                    if(data.status == 109){
                        alert(data.va);
                        alert('此表已经分区了');
                        location.reload();
                    }
                },
                error:function(jqXHR){
                    layer.msg('向服务器请求失败');
                }
            })
        },
        /*第二部分获取信息按钮*/
        getdatatwo: function () {
            $.ajax({
                type: "POST",
                url: serverUrl+"get/zone",
                datatype: "json",
                success: function (data) {
                    if (data.status == 100) {
                        base.list2 = data.values;
                    }
                    else if (data.status == 101) {
                        layer.msg('获取信息失败');
                    }
                },
                error: function (jqXHR) {
                    layer.msg('向服务器请求失败');
                }
            })
        },
        /*第二部分重新获取第二个信息*/
        choice2:function() {
            var selected = this.selected21;
            if( selected != ""){
                $.ajax({
                    type:'POST',
                    url:serverUrl+'get/fields',
                    datatype:'JSON',
                    data:{
                        id:selected
                    },
                    success:function(data){
                        if(data.status == 100){
                            base.twoid2 = data.values;
                        }
                        else if (data.status == 101) {
                            layer.msg('获取信息失败');
                        }
                    },
                    error:function(jqXHR){
                        layer.msg('向服务器请求失败');
                    }
                })
            }


        },
        /*第二部分检测按钮*/
        testpar2:function(){
            var selected = base.selected21;
            if(selected == ""){
                layer.msg('请选择需要分区的表');
            }
            $.ajax({
                type:'POST',
                url:serverUrl+'check',
                datatype:'json',
                data:{
                    tbl_name:selected,
                    operation:'u'
                },
                success:function(data){

                    if(data.status == 110){
                        layer.msg('可以提交');
                        $("#submit-partition2").removeAttr("disabled")
                    }
                    if(data.status == 100){
                        alert('提交成功');
                        location.reload()
                    }
                    else if(data.status == 101){
                        layer.msg('现在还不能提交');
                    }
                },
                error:function(jqXHR){
                    layer.msg('向服务器请求失败');
                }
            })
        },
        /*第二部分提交按钮*/
        subpartwo:function(){
            var selected = base.selected21
            var types = $("#types2").val()
            var type = this.type2
            var num = $("#base-num2").val()
            var interval = $("#base-interval2").val()
            var subtype = $("#subtype2").val()
            var key = base.selected22
            var subnum = $("#base-subnum2").val()
            var subkey = this.subkey2
            console.log(types)
            $.ajax({
                type:'POST',
                url:serverUrl+'update/partition',
                datatype:'json',
                data:{
                    id:selected,
                    tbl_name:selected,
                    types:types,
                    type:type,
                    num:num,
                    interval:interval,
                    subtype:subtype,
                    key:key,
                    subnum:subnum,
                    subkey:subkey,
                },
                success:function(data){
                    if(data.status == 100){
                        layer.msg('提交成功')
                        $("#submit-partition2").attr("disabled",true)
                    }
                    if(data.status == 101){
                        layer.msg('提交失败');
                    }
                    if(data.status == 103){
                        layer.msg('操作正在进行中');
                    }
                    if(data.status == 102){
                        layer.msg('请选择表');
                    }
                    if(data.status == 106){
                        layer.msg('请输入表的分区数量');
                    }
                },
                error:function(jqXHR){
                    layer.msg('向服务器请求失败');
                }
            })
        },
        /*第三部分获取数据按钮*/
        getdata:function(){
            $.ajax({
                type:'POST',
                url:serverUrl+'get/zone',
                datatype:'json',
                success:function(data){
                    if(data.status == 100){
                        base.list3 = data.values
                    }
                    else if (data.status == 101) {
                        layer.msg('获取信息失败');
                    }
                },
                error:function(jqXHR){
                    layer.msg('向服务器请求失败');
                }
            })
        },
        /*第三部分检测按钮*/
        testpar3:function(){
            var selected = base.selected3;
            if(selected == ""){
                layer.msg('请选择需要分区的表');
            }
            $.ajax({
                type:'POST',
                url:serverUrl+'check',
                datatype:'json',
                data:{
                    tbl_name:selected,
                    operation:'d'
                },
                success:function(data){
                    if(data.status == 110){
                        layer.msg('可以提交');
                        $("#submit-partition3").removeAttr("disabled")
                    }
                    if(data.status == 100){
                        alert('提交成功');
                        location.reload()
                    }
                    else if(data.status == 101){
                        layer.msg('现在还不能提交');
                    }
                },
                error:function(jqXHR){
                    layer.msg('向服务器请求失败');
                }
            })
        },
        /*第三部分的提交按钮*/
        subpar3:function(){
            var id = this.selected3
            var num = $("#base-num3").val()
            var subnum = $("#base-subnum3").val()
            console.log(id)
            $.ajax({
                type:'POST',
                url:serverUrl+'dilatation/partition',
                datatype:'json',
                data:{
                    id:id,
                    num:num,
                    subnum:subnum,
                },
                success:function(data){
                    if(data.status == 100){
                        layer.msg('提交成功')
                        $("#submit-partition3").attr("disabled",true)
                    }
                    if(data.status == 101){
                        layer.msg('提交失败');
                    }
                    else if(data.status == 103){
                        layer.msg('操作正在进行中');
                        //layer.msg(data.status);
                    }
                    if(data.status == 102){
                        layer.msg('请选择表');
                    }
                    if(data.status == 104){
                        layer.msg('请选择表的分区类型');
                    }
                    if(data.status == 105){
                        layer.msg('请选择表的分区列值');
                    }
                    if(data.status == 106){
                        layer.msg('请输入表的分区数量');
                    }
                    if(data.status == 107){
                        layer.msg('请输入表的分区区间');
                    }
                },
                error:function(jqXHR){
                    layer.msg('向服务器请求失败');
                }
            })
        }
    }


})
















