// 5-1. 准备好各种坐标数据，开始生成图

for(let i=0;i<n;i++){
    // 图的邻接表用三维数组实现
    // 先暂时push空数组形成二维，后续再补一个维度
    line.push([]); 
}

// 生成随机点图
let m=n;
while(m--){
    // 范围内随机生成点，存到point里面
    point.push({x:centerPoint.lng-19+Math.random()*38,
                y:centerPoint.lat-9.5+Math.random()*19});
    // points存标准化坐标数据，用于图层
    points.push({
        geometry:{
            type:'Point',
            coordinates:[point[point.length-1].x,point[point.length-1].y]
        }
    })
}

// edgeCount是个Set集合对象数组，用于确定是否有过连边，防止重复边多次统计

// 下面这样会有bug！！！老老实实改写法了……
// let edgeCount = new Array(point.length).fill(new Set());

let edgeCount = new Array(point.length);
for(let i=0;i<edgeCount.length;i++){
    edgeCount[i]=new Set();
}

for (let i = 0; i < point.length; i++) {

    // 寻找距离当前点最近的k个点的编号，k=3是测试效果满意的平衡值，原因在下面
    // 在交叉量压低的同时，使得对于n=10000的数据等级，主体部分一开始就可以找到9900+的点
    // 同时避免了在整张地图上的跨越式飞线

    // 飞线问题在k=2时就已经显著产生，而且在车流模拟的时候，由于飞线是太多边与其他小团体连接的集中共同道路
    // 其上面会堆积过多车辆导致极短时间内陷入万劫不复的堵死状况
    // 同时k=2会使得一开始的主体数量相当低，只有100+的数量，后续补连通的效率太低
    // 过于低的主体数量也是飞线产生的原因

    // 交叉量在k=4的时候也太多了，而且4会使得堆正好有3层，也不利于效率提升
    // 虽然k=4的时候有相当的概率能够一步生成完成连通图，而且即使补连通基本上也是补1个小团体就OK
    // 然后k=3的时候几乎不能一步连通，需要补20个左右的小团体才能连通
    // 但是经测试，交叉的情况比k=4好太多了……所以后面一点点的O(n)量级上的补连通的劣势可以忽略不计了

    let closestPoints = findClosestPoints(i, point, 3); 
    for (let j = 0; j < closestPoints.length; j++) {
        let p = closestPoints[j]; // p是编号
        // 如果两个点之间没有连边，则添加一条边
        if (i!==p&&!hasEdge(i,p)) { 
            let distance=dist_P(i,p);
            // 这里在line[][][1]和line[][][2]存两个一样的distance
            // 是因为如果添加车流的话distance可能会变化（距离-->时间）
            // 到时候修改一下后面那个属性，就按照它找最短路径了
            line[i].push([p,distance,distance]);
            edgeCount[i].add(p);
            line[p].push([i,distance,distance]);
            edgeCount[p].add(i);
        }
    }
}

// 寻找距离指定点最近的k个左右的点（不固定为k个，可能更多，因为可能有后面的点连上来的)
function findClosestPoints(i, pointArray, k) {

    // 因为这一部分的优化其实是最后才实现的，所以用pq2标记一下，和后面有个pq区分

    // 建最大堆，同时通过限制堆的size，可以把单次找距离最小的k个点的时间复杂度
    // 从O(nlogn)降到O(nlogk)，经过测试，就这一项优化
    // 使得原来创建规模为10000的图需要30s左右的时间，现在只需要4s
    let pq2 = new priorityQueue_max();
    let result = [];

    for(let j=0;j<pointArray.length;j++){
        if(i!==j){
            let distance=dist_P(i,j);
            pq2.enqueue([j,distance]);
            // 只保留过程中遇见的最小的k个距离对应的节点编号
            if(pq2.size()>k){
                pq2.dequeue();
            }
        }
    }
    while(!pq2.isEmpty()){
        // 遍历完成之后，依次把[0]也就是编号输出，注意这时候是反向的因为我们建的是最大堆
        result.push(pq2.dequeue()[0]);
    }
    // 反转一下返回就可以了
    return result.reverse();
}

// 判断两个点之间是否已经有连边
function hasEdge(p1, p2) {
    return edgeCount[p1].has(p2); // 不知为何，Set.has()直接判断不行
}

// 以点（编号）的形式算距离
function dist_P(p1,p2){
    return Math.sqrt((point[p1].x - point[p2].x) ** 2 + (point[p1].y - point[p2].y) ** 2);
}

// 以边的形式算距离，下面才会用到，但是和上面函数的形式很像，所以先放过来了
function dist_L(i){
    return Math.sqrt((lines[i].geometry.coordinates[0][0]-lines[i].geometry.coordinates[1][0])**2+(lines[i].geometry.coordinates[0][1]-lines[i].geometry.coordinates[1][1])**2);
}



// 在主体部分连接完成之后，开始判断图的连通性并在不连通时补救

// 通过队列的形式，不断将节点出队并将后继进队，目的是找到最大连通分支
let alreadySelected = new Set();
let mainPart = new queue();

// 这里即使0号节点所在的连通子图不是主体部分（指0所在的连通子图实际上是较小的一部分）也不怕
// 将小团体连到主体上去和把主体连到小团体上去是等价的
// 毕竟主要的线都已经连好了
mainPart.enqueue(0);
alreadySelected.add(0);

// 循环通过出队入队，把主体部分编号全加到alreadSelected中去
while(!mainPart.isEmpty()){
    mainPart.dequeue();
}
console.log(`初次主体点数为${alreadySelected.size}`);
if(alreadySelected.size===point.length){
    console.log('图已经连通完毕');
}


// 开始将不连通的情况进行补救
// startPos作为全局变量提到外面，可以让每次for循环少遍历很多次，提高效率
let startPos=0;
while(alreadySelected.size!==point.length){
    for( ;startPos<point.length;startPos++){
        // 如果检测到有点不在主体中
        if(!alreadySelected.has(startPos)){
            // 为了防止主体小，孤立点集大的情况，将k放大到n的程度
            // 使得现在一定能找到主体，不管有多远
            // 因为主体选定了之后再变动是不现实的，所以只能不断扩大选中的主体
            let closestPoints = findClosestPoints(startPos, point, n); 
            for(let j=0;j<closestPoints.length;j++){
                let p=closestPoints[j];
                // 如果在最接近点集中遇到了在主体中的点
                if(alreadySelected.has(p)){
                    let distance=dist_P(startPos,p);
                    line[startPos].push([p,distance,distance]);
                    edgeCount[startPos].add(p);
                    line[p].push([startPos,distance,distance]);
                    edgeCount[p].add(startPos);
                    // 这里把孤立的部分也故技重施，加进去
                    console.log(`检测到孤立点，开始添加含${startPos}的连通子图`);
                    mainPart.enqueue(startPos);
                    alreadySelected.add(startPos);
                    while(!mainPart.isEmpty()){
                        mainPart.dequeue();
                    }
                    break;
                }
            }
            break;
        }
    }
    if(alreadySelected.size===point.length){
        console.log(`孤立点集添加完毕，现在主体点数为${alreadySelected.size}`);
        break;
    }
}


// 连通性已经有所保证，在图层上划线连边
for(let i=0;i<n;i++){
    for(let j=0;j<line[i].length;j++){
        // 只在小编号向大编号连边时操作，防止重复边
        if(i<line[i][j][0]){
            lines.push({
                geometry:{
                    type:'LineString',
                    coordinates:[[point[i].x,point[i].y],[point[line[i][j][0]].x,point[line[i][j][0]].y]]
                }
            });
            edge.push({
                first: i,
                second: line[i][j][0],
                third: [-1,-1], // 用于车流模拟的属性 [当前车辆数, 道路承载量]
                forth: dist_L(lines.length-1) // 距离而已
            });
        }
    }
}

// 5-2. 关联图层与数据，实现随机图数据信息在地图上的可视化

view.addLayer(pointsLayer);
view.addLayer(linesLayer);
pointsLayer.setData(points);
linesLayer.setData(lines);