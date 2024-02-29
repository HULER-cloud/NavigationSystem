// 1. javascript代码中有用到的3个类，先在这里声明了
// 总感觉放在head标签里面声明会比较舒服一点

// 最大堆，除了在依据heap[1]判断元素大小的时候
// 具体的大于小于号与最小堆相反之外，其他部分完全相同
class priorityQueue_max{

    constructor(){
        this.heap=[];
    }
    
    enqueue(value){
        this.heap.push(value);
        this.bubbleUp(this.heap.length-1);
    }

    dequeue(){
        let min=this.heap[0];
        let end=this.heap.pop();
        if(this.heap.length>0){
            this.heap[0]=end;
            this.bubbleDown(0);
        }
        return min;
    }
    
    isEmpty(){
        if(this.heap.length===0) return true;
        else return false;
    }
    
    size(){
        return this.heap.length;
    }
    
    bubbleUp(index){
        let element=this.heap[index];
        while(index>0){
            let parentIndex=Math.floor((index-1)/2);
            let parent=this.heap[parentIndex];
            if(element[1]<=parent[1]) break;
            this.heap[index]=parent;
            index=parentIndex;
        }
        this.heap[index]=element;
    }
    
    bubbleDown(index){
        let element=this.heap[index];
        let len=this.heap.length;
        for(;;){
            let lcIndex=index*2+1;
            let rcIndex=index*2+2;
            let lc,rc;
            let swap=null;
            if(lcIndex<len){
                lc=this.heap[lcIndex];
                if(lc[1]>element[1]){
                    swap=lcIndex;
                }
            }
            if(rcIndex<len){
                rc=this.heap[rcIndex];
                if((swap===null&&rc[1]>element[1])||(swap!==null&&rc[1]>lc[1])){
                    swap=rcIndex;
                }
            }
            if(swap===null) break;
            this.heap[index]=this.heap[swap];
            index=swap;
        }
        this.heap[index]=element;
    }
};

// 最小堆，不再赘述
class priorityQueue_min{

    constructor(){
        this.heap=[];
    }

    enqueue(value){
        this.heap.push(value);
        this.bubbleUp(this.heap.length-1);
    }

    dequeue(){
        let min=this.heap[0];
        let end=this.heap.pop();
        if(this.heap.length>0){
            this.heap[0]=end;
            this.bubbleDown(0);
        }
        return min;
    }

    isEmpty(){
        if(this.heap.length===0) return true;
        else return false;
    }

    size(){
        return this.heap.length;
    }

    bubbleUp(index){
        let element=this.heap[index];
        while(index>0){
            let parentIndex=Math.floor((index-1)/2);
            let parent=this.heap[parentIndex];
            if(element[1]>=parent[1]) break;
            this.heap[index]=parent;
            index=parentIndex;
        }
        this.heap[index]=element;
    }

    bubbleDown(index){
        let element=this.heap[index];
        let len=this.heap.length;
        for(;;){
            let lcIndex=index*2+1;
            let rcIndex=index*2+2;
            let lc,rc;
            let swap=null;
            if(lcIndex<len){
                lc=this.heap[lcIndex];
                if(lc[1]<element[1]){
                    swap=lcIndex;
                }
            }
            if(rcIndex<len){
                rc=this.heap[rcIndex];
                if((swap===null&&rc[1]<element[1])||(swap!==null&&rc[1]<lc[1])){
                    swap=rcIndex;
                }
            }
            if(swap===null) break;
            this.heap[index]=this.heap[swap];
            index=swap;
        }
        this.heap[index]=element;
    }
};

// 普通队列，用于图基本生成过程完成后，判断连通与否用的
class queue{

    constructor(){
        this.array=[];
    }

    enqueue(value){
        this.array.push(value);
        alreadySelected.add(value);
    }

    dequeue(){
        let temp=this.array[0];
        let shouldBeAdded=line[temp];
        for(let i=0;i<shouldBeAdded.length;i++){
            if(!alreadySelected.has(shouldBeAdded[i][0])){
                this.enqueue(shouldBeAdded[i][0]);
                alreadySelected.add(shouldBeAdded[i][0]);
            }
        }
        this.array.splice(0,1);
    }

    isEmpty(){
        if(this.array.length===0) return true;
        else return false;
    }
};