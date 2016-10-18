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

var Request=new UrlSearch();
var tableID = Request.id;
var type_code = 'batch';
console.log(tableID);
console.log(type_code);

// 图片目录树形菜单的组件
Vue.component('tree', {
  template: '#pic-template',
  props:{
    pictree:Object
  },
  data: function () {
    return {
      open: false
    }
  },
  computed: {
    isFolderP: function () {
      return this.pictree.children &&
        this.pictree.children.length
    }
  },
  methods: {
    //点击图片目录
    toggle: function (pictree) {
      if (this.isFolderP) {
        this.open = !this.open
      }

      //点击目录
      selectPic.selectedPic = pictree.cn_name;
      selectPic.selectedPicId = pictree.id;
    }
  }
})


//Vue实例
var selectPic = new Vue({
    el:'body',
    data:{
        TableCreat:'',
        TableEdit:'',
        tableInfo:'',
        pictree:{},
        selectedPic:'',
        selectedPicId:'',
        pic_rate:'',
        pro_rate:'',
        re_date:'',
        file_type:'',
        getPic:'',   //控制筛选图片按钮的可用状态
        picData:'',  //筛选到的图片数据
        num_now:'',
        not_enough:0,
        count:'',
        rand_id:''
    },
    ready:function(){
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
                    selectPic.tableInfo = data.value[0];
                }else{
                    layer.msg(data.msg);
                }
            },
            error:function(jqXHR){
                layer.msg('向服务器获取表格信息失败');
            }
        })
    },
    computed:{
        TableCreat:function(){
            return 'TableWorkflow-creat.html'+'?tableID='+Request.tableID;
        },
        //控制筛选图片按钮
        getPic:function(){
            if(!this.selectedPicId){
                return true
            }else{
                return false
            }
        },
        //控制进入下一步骤按钮
        NextStepStatus:function(){
            var picDataLen = this.picData.length;
            if(picDataLen>0){
                return false
            }else{
                return true
            }
        }
    },
    methods:{
        //选择图片目录
        selectPicfolder:function(){
            var cateId = selectPic.tableInfo.category_id;
            if(!cateId){
                layer.msg('没有获取到产品类目');
            }else{
                $('.selectPic').modal('show');
                $('.selectPic').css('margin-top','200px');
                $.ajax({
                    type:'POST',
                    url:serverUrl+'get/treeGallery',
                    datatype:'json',
                    data:{
                        category_id:cateId
                    },
                    success:function(data){
                        if(data.status==100){
                            selectPic.pictree = data.value[0];
                        }else if(data.status==101){
                            selectPic.pictree = data.value;
                        }
                    },
                    error:function(jqXHR){
                        layer.msg('向服务器请求图片目录失败');
                    }
                })
            }
        },
        //重置条件
        resetData:function(){
            selectPic.selectedPic = '';
            selectPic.selectedPicId = '';
            selectPic.pic_rate = 5;
            selectPic.pro_rate = 1;
            selectPic.re_date = 3;
            selectPic.file_type = 'jpg';
        },
        //请求并获取筛选的图片
        searchPic:function(){
            var num = selectPic.tableInfo.productCount;//表格行数，即图片数量
            var category_id = selectPic.tableInfo.category_id;
            var gallery_id = selectPic.selectedPicId;
            var pic_rate = selectPic.pic_rate;
            var pro_rate = selectPic.pro_rate;
            var re_date = selectPic.re_date;
            var file_type = selectPic.file_type;
            if(!gallery_id){
                layer.msg('请先选择图片目录');
            }else{
                //获取图片信息
                $.ajax({
                    type:'POST',
                    url:serverUrl+'marry/image',
                    datatype:'json',
                    data:{
                        form_id:tableID,
                        num:num,
                        category_id:category_id,
                        gallery_id:gallery_id,
                        pic_rate:pic_rate,
                        pro_rate:pro_rate,
                        re_date:re_date,
                        file_type:file_type
                    },
                    success:function(data){
                        if(data.status==100){
                            layer.msg('筛选成功');
                            selectPic.picData = data.value;
                            selectPic.num_now = data.num_now;
                            selectPic.not_enough = data.not_enough;
                            selectPic.count = data.count;
                            selectPic.rand_id = data.rand_id;
                        }else{
                            layer.msg(data.msg);
                            selectPic.picData= '';
                            selectPic.num_now = '';
                            selectPic.not_enough = '';
                            selectPic.count = '';
                            selectPic.rand_id = '';
                        }
                    },
                    error:function(jqXHR){
                        layer.msg('向服务器获取请求图片失败');
                    }
                })
            }
        },
        //跳转上传步骤
        NextStep:function(){
            var not_enough = this.not_enough;
            if(not_enough!=0){
                layer.msg('图片不足');
            }else{
                var url = 'TableWorkflow-upload.html';
                var tableID = selectPic.tableInfo.id;
                var rand_id = selectPic.rand_id;
                var pic_rate = selectPic.pic_rate;
                var pro_rate = selectPic.pro_rate;

                //跳转函数
                function goNext() {
                    var url = 'batch-table-upload.html';
                    window.location.href = url+'?id='+tableID+'&rand_id='+rand_id+'&pic_rate='+pic_rate+'&pro_rate='+pro_rate;
                }

                setInterval(goNext,1000);
            }
        },
        //返回上一步
        takeBack:function(){
            var vm = selectPic;
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
                            layer.msg('请求成功');
                            //跳转函数
                            function goNext() {
                                var url = 'batch-table-edit.html';
                                var template_id = vm.tableInfo.template_id;
                                window.location.href = url+'?id='+tableID+'&template_id='+template_id;
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
        }
    }
})

Vue.filter('sizeCounter',function(value){
    var str = value;
    str = Math.round(str/1024) + 'kb';
    return str
})

//点击图片目录树形菜单
$(document).on('click','.tree .item .label',function(){
    $('.tree .item .label').removeClass('label-success').addClass('label-primary');
    $(this).removeClass('label-primary').addClass('label-success');
});