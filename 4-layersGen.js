// 4-1. 创建MapVGL图层管理器

let view = new mapvgl.View({
    map: map
});

// 4-2. 创建可视化图层，并添加到图层管理器中

/* 普通节点图层 */
let pointsLayer = new mapvgl.PointLayer({
    color: 'rgba(50, 50, 200)',
    blend: 'lighter',
    size: 15,
    // 其实是先改的下面 80 行的最短路径图层才改的这里
    // 我甚至这个时候才注意到一开始加载的时候是线把点盖住了，怪不得显得这么灰暗
    // 于是把点设置成第二个加载
    // 理论上点在线图层之上是正常的，但是实际上，车流模拟的时候
    // 主要就是看边的变动，点在线之上会掩盖这种主要的展示内容
    // 所以还是算了吧……
    renderOrder: -98,
    enablePicked: true,
    onDblClick:(e)=>{
        if(e.dataIndex!==-1){
            let infoWindow=new BMapGL.InfoWindow("placeholder",infoWindowOpts_point);
            infoWindow.setTitle(`节点编号：${e.dataIndex}`)
            infoWindow.setContent(
                `<div>节点坐标：`+`<br>`+`${e.dataItem.geometry.coordinates[0]+120},`
                    +`<br>`+`${e.dataItem.geometry.coordinates[1]-10}</div>`
            );
            // infoWindow要在点的位置打开
            let infoPlace=new BMapGL.Point(e.dataItem.geometry.coordinates[0],e.dataItem.geometry.coordinates[1]);
            map.openInfoWindow(infoWindow,infoPlace);
        }
            
    }
});

/* 普通连线图层 */
let linesLayer=new mapvgl.LineLayer({
    color: 'rgb(100,100,100)',
    blend: 'lighter',
    width: 2,
    // 把线设置成第一个加载，这就舒服多了、鲜亮多了嘛
    renderOrder: -99,
    enablePicked: true,
    onDblClick:(e)=>{
        if(e.dataIndex!=-1){
            let infoWindow=new BMapGL.InfoWindow("placeholder",infoWindowOpts_line);
            infoWindow.setTitle(`连边编号：${e.dataIndex}`);
            infoWindow.setContent(
                `起点编号：${edge[e.dataIndex].first}   终点编号：${edge[e.dataIndex].second}`
            );
            // 在有设置过道路交通状况的情况下
            if(edge[e.dataIndex].third[1]!==-1){
                let trafficCondition=edge[e.dataIndex].third[0]/edge[e.dataIndex].third[1];
                if(trafficCondition<=0.7){
                    infoWindow.setTitle(`道路编号${e.dataIndex}：道路畅通`);
                }else if(trafficCondition<=0.9){
                    infoWindow.setTitle(`道路编号${e.dataIndex}：轻度拥堵`);
                }else if(trafficCondition<=1){
                    infoWindow.setTitle(`道路编号${e.dataIndex}：中度拥堵`);
                }else{
                    infoWindow.setTitle(`道路编号${e.dataIndex}：重度拥堵`);
                }
                
                infoWindow.setContent(
                    `<div>起点编号：${edge[e.dataIndex].first} 终点编号：${edge[e.dataIndex].second}`+`<br>`
                    +`当前车流量：${edge[e.dataIndex].third[0]} 道路车容量：${edge[e.dataIndex].third[1]}</div>`
                );
            }
            // infoWindow要在线的中点位置打开
            let infoPlace=new BMapGL.Point(
                (e.dataItem.geometry.coordinates[0][0]+e.dataItem.geometry.coordinates[1][0])/2,
                (e.dataItem.geometry.coordinates[0][1]+e.dataItem.geometry.coordinates[1][1])/2);
            map.openInfoWindow(infoWindow,infoPlace);
        }
    }
})


/* 最短路径节点图层 */
let nodeLayer=new mapvgl.PointLayer({
    color: 'rgb(242,72,27)', // 柿红，最短路径节点
    blend: 'lighter',
    size: 25,
    // renderOrder控制渲染次序，后渲染的会挡住先渲染的
    // 设置成99直接最后渲染防止被车流图层挡住
    renderOrder: 99
});

/* 最短路径连线图层 */
let pathLayer=new mapvgl.LineLayer({
    color: 'rgb(81,196,211)', // 瀑布蓝，最短路径连线
    blend: 'lighter',
    width: 8,
    // 设置成98，倒数第二个渲染，因为点在上线在下会比较好看一点
    // 虽然具体加载这两个图层的时候设置了次序了，但是还是这里设置一下比较保险
    // 万一以后有人不按次序加载呢
    renderOrder: 98
});

// 下面4个图层是车流模拟时候用到的，用于显示不同拥堵等级
// 对拥堵等级的评价标准在 6-function.js 中
let greenLayer=new mapvgl.LineLayer({
    color: 'rgb(65,179,73)', // 玉髓绿，道路通畅
    blend: 'lighter',
    width: 5
});

let yellowLayer=new mapvgl.LineLayer({
    color: 'rgb(254,215,26)', // 佛手黄，轻度拥堵
    blend: 'lighter',
    width: 5
});

let orangeLayer=new mapvgl.LineLayer({
    color: 'rgb(252,140,35)', // 北瓜黄，中度拥堵
    blend: 'lighter',
    width: 5
});

let redLayer=new mapvgl.LineLayer({
    color: 'rgb(244,62,6)', // 银朱，重度拥堵
    blend: 'lighter',
    width: 5
});


let infoWindowOpts_point={
    width: 250,
    height: 150
}

let infoWindowOpts_line={
    width: 250,
    height: 150
}
