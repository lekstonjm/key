# WebRTC based peer-to-peer key exchange

Mastering key vault is a nightmare.

## Install 
1. clone the git  `git clone ....`

## Launch server
2. go into key folder
3. Create an `ICE_SERVERS` env variable containing stun/turn servers
4. Start server `node app.js`

it will listen on your local ip / localhost at 3000 port
## How to use
5. Open two instances of your favorite webbrowser and browse to your_ip:3000.

Normally data peer to peer connection should be establish. 

## Notes
- To facilitate the environement  variable management consider to use some dedicated framework similar to dotenv https://www.npmjs.com/package/dotenv
- Free limited Ice servers can be purchased  here https://www.metered.ca/stun-turn