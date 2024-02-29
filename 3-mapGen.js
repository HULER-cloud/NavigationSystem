// 3. 创建地图实例

console.log('首次加载地图较慢，请耐心等待……');

// 设置最小和最大缩放等级
let map = new BMapGL.Map('map_container',{minZoom:6,maxZoom:12});
let centerPoint = new BMapGL.Point(-120, 10);
// 设置中心点和默认初始缩放等级
map.centerAndZoom(centerPoint, 8);
// 启用滚轮缩放
map.enableScrollWheelZoom(true);
// 禁用双击缩放，防止对查看节点信息干扰
map.disableDoubleClickZoom(); 

// 是在线引入的自定义的地图样式key，具体细节在custom_map_config.json中有
// 大致反正就是能清空的都清空了只留下空白地图这样子……
map.setMapStyleV2({     
    styleId: '5e7da8f15e01459e5d8f44652197211a'
});

// 添加地图中心标记，并禁止被清除聚焦操作清除，下面的地图边界框框也是一样
let centerMarker=new BMapGL.Marker(centerPoint,{
    title: '我是地图中心标记，单击我可以在控制台中查看地图边界坐标信息以及地图缩放等级',
    enableMassClear: false
});

map.addOverlay(centerMarker);
centerMarker.addEventListener('click',function(){
    console.log(map.getBounds());
    console.log('↑↑↑显示边界的东北角和西南角的坐标，注意横坐标自行加上120、纵坐标自行减去10以完成转换');
    console.log(`当前地图缩放等级为${map.getZoom()}`);
});

// 框出地图边界，其实是经度[-140,-100]、纬度[0,20]的一个范围
// 点击地图元素的infoWindow里面已经是经过转换的坐标了
let polylineBound = new BMapGL.Polyline([ 
    new BMapGL.Point(-140,20),    
    new BMapGL.Point(-100,20),
    new BMapGL.Point(-100,0),   
    new BMapGL.Point(-140,0), 
    new BMapGL.Point(-140,20) 
], {strokeColor:"red", strokeWeight:6, enableMassClear:false});
map.addOverlay(polylineBound);

// 地图拖拽出界时自动拉回视野
map.addEventListener("dragend", function() { 
    if(map.getBounds().ne.lng>-95||map.getBounds().ne.lat>25
    ||map.getBounds().sw.lng<-145||map.getBounds().sw.lat<-5){
        map.centerAndZoom(centerPoint,6);
    }
});