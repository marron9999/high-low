# high-low

![](highlow.png)

### server.js

警官、泥棒からの送信データを集計するmicrobit-集計.hexと
シリアル通信するWebsocketサーバーです。<br>

起動方法： node server.js  [COMポート名]

- 接続用のポート番号は「80」固定です。
- 他のポート番号を使うときは、server.jsを修正してください。
- また、シリアル通信するポートは「COM1」です。<br>
異なるポートを使うときは引数で指定するか、<br>
server.jsを修正してください。
- COMポートのスピードは「115200」です。
- 停止は、「CTRL+C」で終了させてください。

### index.html

警官、泥棒からの送信データを表示するためのHTMLです。<br>
server.jsを動作させたあと、ブラウザで「`http://localhost:80`」を開いてください。
