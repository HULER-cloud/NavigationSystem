// 6、开始添加各项功能，这个function不是指函数
// 过程中用到的函数并没有单独写在一个js文件里面独立出来，那样有点太散了


// 聚焦于坐标
const in1=document.querySelector('#in1');
const in2=document.querySelector('#in2');
in1.setAttribute("placeholder","横坐标：-20 ~ 20");
in2.setAttribute("placeholder","纵坐标：-10 ~ 10");
const locationFocus=document.querySelector('#locationFocus');
locationFocus.addEventListener('click',function(){
    
    let x=Number(in1.value);
    let y=Number(in2.value);

    if(x>20||x<-20||y>10||y<-10){
        // alert('您输入的数据不合法，请重新输入！');
        in1.value='坐标数据不合法！';
        in2.value='坐标数据不合法！';
    }else{
        // 你得给它变回来
        x=x-120;
        y=y+10;

        let testPoint=new BMapGL.Point(x,y);
        // 经测试，9.5的缩放等级在n=10000数据规模下大约刚好是显示出100个点多一点
        map.centerAndZoom(testPoint,9.5);
        let marker1=new BMapGL.Marker(testPoint);
        map.addOverlay(marker1);
        marker1.addEventListener('click',function(){
            let infoWindow=new BMapGL.InfoWindow("placeholder",infoWindowOpts_point);
            infoWindow.setTitle('我是选中的聚焦坐标：');
            infoWindow.setContent(
                `<div>坐标：`+`<br>`+`${x+120}, `+`${y-10}</div>`
            );
            map.openInfoWindow(infoWindow,testPoint);
        });
    }
});

// 清除标记覆盖物
const removeMarks=document.querySelectorAll('.removeMarks');
removeMarks[0].addEventListener('click',removeM);
removeMarks[1].addEventListener('click',removeM);

function removeM(){
    // 都给它清空咯
    in1.value='';
    in2.value='';
    in3.value='';
    map.clearOverlays();
}


// 聚焦于节点
const in3=document.querySelector('#in3');
in3.setAttribute("placeholder",`编号：0 ~ ${n-1}`);
const nodeFocus=document.querySelector('#nodeFocus');
nodeFocus.addEventListener('click',function(){
    let choose=Number(in3.value);

    if(choose>=n||choose<0){
        // alert('您输入的数据不合法，请重新输入！');
        in3.value='编号数据不合法！';
    }else{
        let testPoint=new BMapGL.Point(point[choose].x,point[choose].y);
        map.centerAndZoom(testPoint,9.5);
        let marker2=new BMapGL.Marker(testPoint);
        map.addOverlay(marker2);
        marker2.addEventListener('click',function(){
            let infoWindow=new BMapGL.InfoWindow("placeholder",infoWindowOpts_point);
            infoWindow.setTitle(`我是选中的聚焦节点：${choose}`);
            infoWindow.setContent(
                `<div>节点坐标：`+`<br>`+`${points[choose].geometry.coordinates[0]+120},`
                        +`<br>`+`${points[choose].geometry.coordinates[1]-10}</div>`
            );
            map.openInfoWindow(infoWindow,testPoint);
        });
    }
});


// 默认情况下寻找最短路径
const in4=document.querySelector('#in4');
const in5=document.querySelector('#in5');
in4.setAttribute("placeholder",`起点编号：0 ~ ${n-1}`);
in5.setAttribute("placeholder",`终点编号：0 ~ ${n-1}`);

const SPath=document.querySelector('#SPath');
SPath.addEventListener('click',function(){
    let s=Number(in4.value);
    let t=Number(in5.value);

    if(s>=n||s<0||t>=n||t<0){
        // alert('您输入的数据不合法，请重新输入！');
        in4.value='编号数据不合法！';
        in5.value='编号数据不合法！';
    }else{
        let result=findSPath(s,t,line,1);
        console.log('最短通行距离为：');
        console.log(result.distance);
        console.log('最短路径：');
        console.log(result.path);
        showSPath(result);
    }
});
function findSPath(start,terminal,line,type){
    // 创建的图是稀疏图，Dijkstra算法较适用
    // 同时用堆优化方法提高效率
    // js没有优先队列还得手写……

    // 不用在所有点里面遍历寻找当前最小值而是可以直接从堆顶获取到
    // 把时间复杂度从O(n^2)压缩到O(nlogn)，具体时间上怎么样没怎么感觉出来
    // 因为最开始写的时候就是直接写了堆优化版本的Dijkstra算法
    // 至少这种方法现在是可以光速执行出结果的就对了！
    let pq=new priorityQueue_min();

    let distances=new Array(line.length).fill(Infinity);
    let visited=new Array(line.length).fill(false);
    let parents=new Array(line.length).fill(null);
    let path=[]; // 用来存路径信息的

    distances[start]=0;
    pq.enqueue([start,0]);
    while(!visited[terminal]){
        let current=pq.dequeue()[0];
        visited[current]=true;

        line[current].forEach((neighbor) => {
            let distance=distances[current]+neighbor[type];
            if(distance<distances[neighbor[0]]){
                distances[neighbor[0]]=distance;
                parents[neighbor[0]]=current;
                pq.enqueue([neighbor[0],distance]);
            }
        });
    }
    path.push(terminal);

    while(path[0]!==start){
        path.unshift(parents[path[0]]);
    }

    return {
        distance: distances[terminal],
        path: path
    };
}

function showSPath(res){
    // 从起点开始，每扫到一个路径上的点，就把这个点和它后继的路径边添加进去
    for(let i=0;i<res.path.length-1;i++){
        points_SPath.push({
            geometry:{
                type:'Point',
                coordinates:[point[res.path[i]].x,point[res.path[i]].y]
            }
        })
        lines_SPath.push({
            geometry:{
                type:'LineString',
                coordinates:[[point[res.path[i]].x,point[res.path[i]].y],
                    [point[res.path[i+1]].x,point[res.path[i+1]].y]]
            }
        })
    }
    // 最后再添加终点进去
    points_SPath.push({
        geometry:{
            type:'Point',
            coordinates:[point[res.path[res.path.length-1]].x,point[res.path[res.path.length-1]].y]
        }
    })
    
    // 路径图层最好在节点图层之前设置，因为后设置的会覆盖掉先设置的
    // 目的是，让点在线的上层的话，会比较好看一点
    view.addLayer(pathLayer);
    view.addLayer(nodeLayer);
    pathLayer.setData(lines_SPath);
    nodeLayer.setData(points_SPath);
}
const cleanPath=document.querySelectorAll('.cleanPath');
cleanPath[0].addEventListener('click',remove);
cleanPath[1].addEventListener('click',remove);
function remove() {
    // 全部清空！
    lines_SPath = [];
    points_SPath = [];
    view.removeLayer(pathLayer);
    view.removeLayer(nodeLayer);
    pathLayer.clear();
    nodeLayer.clear();

    // 文本框的内容也清空
    in4.value='';
    in5.value='';
    in6.value='';
    in7.value='';
}


// 这边开始车流模拟
let pos = new Array(edge.length); // 小编号-->大编号
let neg = new Array(edge.length); // 大编号-->小编号
let pos_map = new Array(edge.length);
let neg_map = new Array(edge.length);
const trafficSimulation=document.querySelector('#trafficSimulation');
trafficSimulation.addEventListener('click',function(){

    // 假设道路承载量为100，那么当前车辆数为：
    // 0~60 道路通畅 61~85 轻度拥堵 86~100 中度拥堵 101~110 重度拥堵
    
    for(let i=0;i<edge.length;i++){
        // 对每条连边，随机指定承载量（有界）
        edge[i].third[1]=getRandomV();
        // 根据承载量，随机指定车辆数
        edge[i].third[0]=getRandomN(i);
        
        // 就是最上面注释的不同等级判定
        let trafficCondition=edge[i].third[0]/edge[i].third[1];

        if(trafficCondition<=0.6){
            traffic_Clear.push({
                geometry:{
                    type:'LineString',
                    coordinates:[lines[i].geometry.coordinates[0],lines[i].geometry.coordinates[1]]
                }
            })
        }else if(trafficCondition<=0.85){
            traffic_MildCongestion.push({
                geometry:{
                    type:'LineString',
                    coordinates:[lines[i].geometry.coordinates[0],lines[i].geometry.coordinates[1]]
                }
            })
        }else if(trafficCondition<=1){
            traffic_ModerateCongestion.push({
                geometry:{
                    type:'LineString',
                    coordinates:[lines[i].geometry.coordinates[0],lines[i].geometry.coordinates[1]]
                }
            })
        }else{
            traffic_SevereCongestion.push({
                geometry:{
                    type:'LineString',
                    coordinates:[lines[i].geometry.coordinates[0],lines[i].geometry.coordinates[1]]
                }
            })
        }
    }
    
    view.addLayer(greenLayer);
    view.addLayer(yellowLayer);
    view.addLayer(orangeLayer);
    view.addLayer(redLayer);
    greenLayer.setData(traffic_Clear);
    yellowLayer.setData(traffic_MildCongestion);
    orangeLayer.setData(traffic_ModerateCongestion);
    redLayer.setData(traffic_SevereCongestion);

    // 一条路上面车不是单向的
    // 一部分从小编号节点到大编号节点（pos）行进，另一部分相反
    // 这里提前设置好这个属性，方便时间前进时使用
    for(let i=0;i<pos.length;i++){
        pos[i]={
            first: edge[i].first,
            second: edge[i].second,
            car: Math.floor(Math.random()*edge[i].third[0])
        }
        neg[i]={
            first: edge[i].second,
            second: edge[i].first,
            car: edge[i].third[0]-pos[i].car
        }
    }
});

function getRandomV() {
    // 在[100,200]之间，没有指定太离谱的数值
    return Math.floor(100+Math.random()*100);
}
function getRandomN(i){
    return Math.floor(Math.random()*edge[i].third[1]*1.1);
}

const timeAhead=document.querySelector('#timeAhead');
timeAhead.addEventListener('click',function(){
    console.log('时间前进了一小下！');
    timeGo();
});

// 标志时间前进了多少下
let times=0;

function timeGo(){
    // 下面是车流状况随时间如何变动，思考的过程：
    // 个位数的通行时间，两位数的车辆数，按5--50算
    // 时间前进一次，路口要出去个位数的车，前进量暂定为0.5
    // 假如路上有55辆车，通行时间是6.231
    // 则时间前进一次，从路口出去55/6.231*0.5，取整为4辆车
    // 这些车会随机分布到路口的后继边上去
    // 如果取整后为0也不用怕，因为出不去，车只会越来越多
    // 最终总能达到一个时间点，使得这个时候取整结果为1，可以出车了
    // 因为生成时没有悬挂边，所以不用担心出不去或者进不来这样的情况……
    console.log(`时间前进第${++times}个单位`);
    
    let t=0.5;

    // 标记堵死边的，待会儿方便处理，注意红色边并不都是堵死边，堵死情况更加极限
    // 经过多次测试，我们取阈值为1.3
    let disasterMark=new Set();
    for(let i=0;i<point.length;i++){
        if(edge[i].third[0]/edge[i].third[1]>1.3){
            disasterMark.add(i);
        }
    }

    // 每条边的两个方向各自出去多少辆车的数组
    let pos_out = new Array(edge.length);
    let neg_out = new Array(edge.length);
    
    for(let i=0;i<pos_out.length;i++){
        // 红色边的通行时间要延长
        let tempPassTime=edge[i].forth;
        if(disasterMark.has(i)){
            tempPassTime=edge[i].forth*(1+Math.E*(edge[i].third[0]/edge[i].third[1]));
        }

        // 出去之后存量就要减去相应数值
        pos_out[i]=Math.min(Math.floor(pos[i].car/tempPassTime*t),pos[i].car);
        pos[i].car-=pos_out[i];
    
        neg_out[i]=Math.min(Math.floor(neg[i].car/tempPassTime*t),neg[i].car);
        neg[i].car-=neg_out[i];

        // 映射数组，在不改变原pos与neg的情况下拷贝一份，排序后再二分处理可以提高效率
        // mark属性就是到原下标的映射
        pos_map[i]={
            first: pos[i].first,
            second: pos[i].second,
            mark: i
        };
        neg_map[i]={
            first: neg[i].first,
            second: neg[i].second,
            mark: i
        };

    }

    // 这里只根据起点排序就够了，同一起点下终点数是一个个位数，不用太麻烦
    // 相对于两个属性排序后再二分的话，这样的逻辑相对简单一点
    pos_map.sort(function(a,b){
        if(a.first<b.first) return -1;
        if(a.first>b.first) return 1;
        return 0;
    });

    neg_map.sort(function(a,b){
        if(a.first<b.first) return -1;
        if(a.first>b.first) return 1;
        return 0;
    });

    // 将出量传递到后继边上去
    for(let i=0;i<pos_out.length;i++){
        if(pos_out[i]!==0) pass(pos[i].second,pos_out[i]);
        if(neg_out[i]!==0) pass(neg[i].second,neg_out[i]);
    }
    
    // 整理，重新记录当前道路上总车辆数，把两个方向的一加就完事了
    for(let i=0;i<edge.length;i++){
        edge[i].third[0]=pos[i].car+neg[i].car;
    }
    // 重新绘制车流状态
    redraw();
}

function pass(i,cnt){
    // i是终点出口的标号，cnt是总共要出去多少辆车

    // query用来标记往哪几个后继节点出车
    let query = new Array(line[i].length).fill(-1);
    for(let u=0;u<query.length;u++){
        query[u]=line[i][u][0];
    }

    let temp = new Array(query.length).fill(0);

    // temp用来标记往每个后继节点分别出多少辆车
    for(let u=0;u<cnt;u++){
        temp[Math.floor(Math.random()*query.length)]++;
    }

    // 有了先前pos与neg映射后再排序，现在二分查找应该去的点快多了
    // 在n=10000的数据规模下，我设置的0.5s的时间持续前进的定时函数能卡成5s一前进
    // 还是把O(n^2)优化成了O(nlogn)，现在体感上已经完全是精准的0.5s一更新了
    // 当然没有试过极限更新时间能有多快，意义不太大
    for(let u=0;u<query.length;u++){
        // 如果query[u]<i，说明车要送的去向是逆向的neg边，反之同理
        if(query[u]<i){
            // 上二分！
            let x=0,y=neg_map.length-1;
            let mid;
            while(x!==y){
                mid=Math.floor((x+y)/2);
                // 找到起点为i的就不再二分了，因为点i的后继节点数据量很小
                if(neg_map[mid].first===i){
                    let up=mid,down=mid;

                    // 找到范围上下界
                    while(up>=0&&neg_map[up].first===i) up--;
                    up++;
                    while(down<neg_map.length&&neg_map[down].first===i) down++;
                    down--;
                    let breakFlag=0;
                    for(let k=up;k<=down;k++){
                        if(neg_map[k].second===query[u]){
                            // 查找并把出车量传递过去之后就break走
                            neg[neg_map[k].mark].car+=temp[u];
                            breakFlag=1;
                            break;
                        }
                    }
                    if(breakFlag===1) break;
                }
                if(neg_map[mid].first<i||neg_map[mid].first===mid&&neg_map[mid].second<query[u]){
                    x=mid+1;
                }else{
                    y=mid;
                }
            }
        }else{
            // 接着二分！
            let x=0,y=pos_map.length-1;
            let mid;
            while(x!==y){
                mid=Math.floor((x+y)/2);
                if(pos_map[mid].first===i){
                    let up=mid,down=mid;

                    while(up>=0&&pos_map[up].first===i) up--;
                    up++;
                    while(down<=pos_map.length&&pos_map[down].first===i) down++;
                    down--;
                    let breakFlag=0;
                    for(let k=up;k<=down;k++){
                        if(pos_map[k].second===query[u]){
                            pos[pos_map[k].mark].car+=temp[u];
                            breakFlag=1;
                            break;
                        }
                    }
                    if(breakFlag===1) break;
                }
                if(pos_map[mid].first<i){
                    x=mid+1;
                }else{
                    y=mid;
                }
            }
        }
    }
}

function redraw(){
    // 清空所有的东西，然后……
    greenLayer.clear();
    yellowLayer.clear();
    orangeLayer.clear();
    redLayer.clear();
    traffic_Clear = [];
    traffic_MildCongestion = [];
    traffic_ModerateCongestion = [];
    traffic_SevereCongestion = [];

    // 重新设置！
    // 好在不用额外算东西，是O(n)的所以很快
    for(let i=0;i<edge.length;i++){
        
        let trafficCondition=edge[i].third[0]/edge[i].third[1];

        if(trafficCondition<=0.7){
            traffic_Clear.push({
                geometry:{
                    type:'LineString',
                    coordinates:[lines[i].geometry.coordinates[0],lines[i].geometry.coordinates[1]]
                }
            })
        }else if(trafficCondition<=0.9){
            traffic_MildCongestion.push({
                geometry:{
                    type:'LineString',
                    coordinates:[lines[i].geometry.coordinates[0],lines[i].geometry.coordinates[1]]
                }
            })
        }else if(trafficCondition<=1){
            traffic_ModerateCongestion.push({
                geometry:{
                    type:'LineString',
                    coordinates:[lines[i].geometry.coordinates[0],lines[i].geometry.coordinates[1]]
                }
            })
        }else{
            traffic_SevereCongestion.push({
                geometry:{
                    type:'LineString',
                    coordinates:[lines[i].geometry.coordinates[0],lines[i].geometry.coordinates[1]]
                }
            })
        }
    }
    greenLayer.setData(traffic_Clear);
    yellowLayer.setData(traffic_MildCongestion);
    orangeLayer.setData(traffic_ModerateCongestion);
    redLayer.setData(traffic_SevereCongestion);
}
const trafficClean=document.querySelector('#trafficClean');
trafficClean.addEventListener('click',function() {
    for(let i=0;i<edge.length;i++){
        edge[i].third=[-1,-1];
    }

    traffic_Clear = [];
    traffic_MildCongestion = [];
    traffic_ModerateCongestion = [];
    traffic_SevereCongestion = [];
    view.removeLayer(greenLayer);
    view.removeLayer(yellowLayer);
    view.removeLayer(orangeLayer);
    view.removeLayer(redLayer);
    greenLayer.clear();
    yellowLayer.clear();
    orangeLayer.clear();
    redLayer.clear();

    // 前进时间数也清空
    times=0;
});

const timeAheadContinously=document.querySelector('#timeAheadContinously');
let intervalID;
timeAheadContinously.addEventListener('click',function(){
    console.log('时间开始流动了！');
    // 定时函数500ms执行一次，事实证明优化后n=10000下绰绰有余
    if(!intervalID){
        intervalID = setInterval(timeGo,500);
    }
    
});
const timeStop=document.querySelector('#timeStop');
timeStop.addEventListener('click',function(){
    console.log('The World! 时间停止了！');
    clearInterval(intervalID);
    intervalID=null;
});

const in6=document.querySelector('#in6');
const in7=document.querySelector('#in7');
in6.setAttribute("placeholder",`起点编号：0 ~ ${n-1}`);
in7.setAttribute("placeholder",`终点编号：0 ~ ${n-1}`);
const generalSPath=document.querySelector('#generalSPath');
generalSPath.addEventListener('click',function(){
    
    let s=Number(in6.value);
    let t=Number(in7.value);

    if(s>=n||s<0||t>=n||t<0){
        // alert('您输入的数据不合法，请重新输入！');
        in6.value='编号数据不合法！';
        in7.value='编号数据不合法！';
    }else{
        // 全局唯一填充severe的地方！标准则和上面一样取1.3的阈值
        for(let i=0;i<edge.length;i++){
            if(edge[i].third[0]/edge[i].third[1]>1.3){
                let final=edge[i].forth*(1+Math.E*(edge[i].third[0]/edge[i].third[1]));
                // 因为只有重度拥堵中的极限情况才会使通行时间不同
                // 所以只把这时候的边号和时间push进severe就可以
                severe.push([i,final]);
            }
        }

        // 算最短路径需要用到更新的line数组，把line里面的通行时间短暂更新成现在的真实值
        // 其他任何时候，line[][][2]都是和line[][][1]相等的值！
        for(let i=0;i<severe.length;i++){
            let last=severe[i][0];
            let fir=edge[last].first;
            let sec=edge[last].second;

            for(let j=0;j<line[fir].length;j++){
                if(line[fir][j][0]===sec){
                    line[fir][j][2]=severe[i][1];
                }
            }
            for(let j=0;j<line[sec].length;j++){
                if(line[sec][j][0]===fir){
                    line[sec][j][2]=severe[i][1];
                }
            }
        }
        
        let result=findSPath(s,t,line,2);
        console.log('最短通行时间为：');
        console.log(result.distance);
        console.log('最短路径：');
        console.log(result.path);
        showSPath(result);

        // 最短路径找完之后直接把line变回去，提升效率
        for(let i=0;i<severe.length;i++){
            let last=severe[i][0];
            let fir=edge[last].first;
            let sec=edge[last].second;

            for(let j=0;j<line[fir].length;j++){
                if(line[fir][j][0]===sec){
                    line[fir][j][2]=line[fir][j][1];
                }
            }
            for(let j=0;j<line[sec].length;j++){
                if(line[sec][j][0]===fir){
                    line[sec][j][2]=line[sec][j][1];
                }
            }
        }

        // severe也清空，下次使用
        severe = [];
    }
});