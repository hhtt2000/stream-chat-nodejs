# stream-chat-nodejs
Simple streaming demo with chat on web browser.

## prerequisites
* web browser (excluding internet explorer less than windows 8+ 11 )
* node.js
* any media devices (camera, mic, etc..)
 * You may need some applications like Xsplit to share your screen with others.
* facebook app id & secret 

## how to run
First, you need to type in your facebook app id & secret in the file app.js.
```
cd path/to/projectroot
npm start
```
You can see the main page on [http://localhost](http://localhost).

## how to use
If you want to braodcast your contents, you need to sign up first.
And then click broadcast link to get into your room to broadcast.   
On the page, choose a device to use, and click broadcast button.

## references
* [example for webrtc](https://github.com/webrtc/samples/tree/gh-pages/src/content/peerconnection/multiple)
* [chat example with socket.io](https://github.com/socketio/socket.io/tree/master/examples/chat)
