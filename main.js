// 这里是electron程序的入口js文件
// 基本内容都是electron文档入门部分中一样的
// 把不需要的内容注释掉了

const { app, BrowserWindow } = require('electron');

const createWindow = () => {
    const win=new BrowserWindow({
        width:1280,
        height:720
    });
    win.loadFile('index.html');
}

app.whenReady().then(()=>{
    createWindow();

    // 这也是为了适应macOS逻辑的代码
    // 如果程序还在活跃状态，窗口却全关了的话就自动新建窗口
    // 换言之总得有一个窗口，我们不需要，注释掉了

    // app.on('activate', () => {
    //     if (BrowserWindow.getAllWindows().length === 0) createWindow()
    // });
});

app.on('window-all-closed', () => {

    // platform === 'darwin' 代表是macOS
    // 在窗口全关闭的时候默认逻辑是不退出应用程序
    // 但是我们只需要在Windows上面运行就OK了，所以不需要额外判断

    // if (process.platform !== 'darwin')
    app.quit()
});