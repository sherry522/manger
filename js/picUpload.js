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
var Request=new UrlSearch();

var serverUrl = "http://192.168.1.18/canton/"; //后端接口地址

//拉取类目
var picUpload = new Vue({
    el:'body',
    data:{
        picCate:''
    },
    ready:function(){
        $.ajax({
            type:'POST',
            url:serverUrl+'get/imagegallery',
            datatype:'json',
            data:{
                id:Request.id
            },
            success:function(data){
                if(data.status==100){
                    picUpload.picCate = data.value[0];
                }
            },
            error:function(jqXHR){
                layer.msg('向服务器请求相册信息失败');
            }
        })
    },
    methods:{
        unbind:function(){
            $(window).unbind('beforeunload');
        }
    }
})



$(window).bind('beforeunload',function(){return "您修改的内容尚未保存，确定离开此页面吗？";});

//上传功能
var uploader = new plupload.Uploader({
    runtimes : 'html5,html4',
    browse_button : 'pickfiles', 
    container: document.getElementById('container'), 
    url : serverUrl+'Picture/upload/gallery_id/'+Request.id,
    
    filters : {
        max_file_size : '5mb',
        mime_types: [
            {title : "Image files", extensions : "jpg,jpeg,gif,png"},
            {title : "Zip files", extensions : "zip"}
        ]
    },

    init: {
        PostInit: function() {
            $('.panel-body .alert').hide();
            document.getElementById('uploadfiles').onclick = function() {
                if(!(Request.id)){
                    layer.msg('上传没有找到分类，请先选择分类');
                }else{
                    uploader.start();
                }
                
                return false;
            };
        },

        FilesAdded: function(up, files) {
            plupload.each(files, function(file) {
                document.getElementById('filelist').innerHTML += '<li class="list-group-item list-group-item-warning" id="' + file.id + '">' + file.name + '(' + plupload.formatSize(file.size) + ') <b></b></li>';
            });

            var Len = 100;// 最多上传50个文件
            if(uploader.files.length>Len){ 
                uploader.files.splice(Len,1999);//删除50后1999个文件
            }

            $('#filelist li').eq(Len-1).nextAll().remove();//移除dom

            //更新已经选择图片
            var countLen = Len - uploader.files.length;
            if(countLen>0){
                $('#pickfiles').show();
                document.getElementById('seletedLen').getElementsByTagName('b')[0].innerHTML = '还可以选择'+countLen+'张图片';
            }else{
                layer.msg('最多只能上传'+Len+'张图片，多余的已经自动移除');
                $('#pickfiles').hide();
                document.getElementById('seletedLen').getElementsByTagName('b')[0].innerHTML = '不能选择更多图片了';
            }
        },

        UploadProgress: function(up, file) {
            document.getElementById(file.id).getElementsByTagName('b')[0].innerHTML = '<span>' + file.percent + "%</span>";
        },
        Error: function(up, err) {
            document.getElementById('console').appendChild(document.createTextNode("\nError #" + err.code + ": " + err.message));
        },
        UploadComplete: function (uploader,files){
            if(files.length<=0){
                layer.msg('没有上传任何图片');
            }else{
                //解绑页面离开提示
                $(window).unbind('beforeunload');

                var str = "上传成功 "+files.length+" 张图片。";
                layer.confirm(str+'去编辑上传成功图片信息',{
                    btn:['确定','取消']
                },function(yes){
                    var url = 'picUpload-edit.html?id='+files.length+'&cate='+Request.id;
                    // window.open(url);
                    // location.reload(true);
                    window.location.href = url;
                },function(cancel){
                    location.reload(true);
                })
            }
        }
    }
});

uploader.init();