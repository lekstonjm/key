let socket;
let peerConnection;
let iceServers;
let messageChannel;

function CreatePeerConnection(socket, iceServers) {
  console.log('CreatePeerConnection');
  const newPeerConnection = new RTCPeerConnection({
    iceServers: iceServers,
    iceCandidatePoolSize: 2,
    iceTransportPolicy: "relay"
  });

  newPeerConnection.onicecandidate = (event) => {
    console.log('handle onicecandidate');
    if (event.candidate) {
      socket.emit('ice_candidate', event.candidate);
    }
  };
  
  newPeerConnection.onconnectionstatechange = (event) =>{
    console.log('handle onconnectionstatechange');
  };
  newPeerConnection.oniceconnectionstatechange = (event) =>{
    console.log('handle oniceconnectionstatechange');
  };
  
  return newPeerConnection;
}

function RegisterMessageChannelEvent(messageChannel){
  messageChannel.onmessage = (event) => {
    console.log(`handle onmessage ${event.data}`);
    log(event.data);
  };
  messageChannel.onopen = () => {
    console.log('handle onopen');
    const sendElement = document.getElementById("send");
    sendElement.onclick = () => {
      const messageElement = document.getElementById("message");
      const message = messageElement.value;
      console.log(`send ${message}`);
      messageChannel.send(message);
    };
  };
  messageChannel.onclose = () => {
    console.log('handle onclose');
    const sendElement = document.getElementById("send");
    sendElement.onclick = () => {};
  };
}

function log(message) {
  const logElement = document.getElementById("log");
  logElement.append(message);   
}

function ConnectSocket() {
  socket = io();
  socket.on('ice_servers', (data) => {
    console.log(`handle ice_servers ${JSON.stringify(data)}`);
    iceServers = data;
  });

  socket.on('peer_joined', () => {
    console.log('handle peer_joined');
    peerConnection = CreatePeerConnection(socket, iceServers);
    messageChannel = peerConnection.createDataChannel('message_channel');
    RegisterMessageChannelEvent(messageChannel);
    (async function() {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      console.log(`send_offer ${JSON.stringify(offer)}`);
      socket.emit('send_offer', offer);    
    })();
  });

  socket.on('send_offer', (offer) => {
    console.log(`handle send_offer ${JSON.stringify(offer)}`);
    peerConnection = CreatePeerConnection(socket, iceServers);
    peerConnection.ondatachannel = (event) => {
      console.log(`handle ondatachannel`);
      messageChannel = event.channel;
      RegisterMessageChannelEvent(messageChannel);
    };
    (async function() {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      console.log(`send_answer ${JSON.stringify(answer)}`);
      socket.emit('send_answer', answer);
    })(); 
  });

  socket.on('send_answer',(answer) => {
    console.log(`handle send_answer ${JSON.stringify(answer)}`);
    (async function() {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    })();
  });

  socket.on('ice_candidate', (candidate) => {
    console.log(`handle ice_candidate ${JSON.stringify(candidate)}`);
    (async function() {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch(e) {
          console.log('Error adding candidate '+e);
      }
    })();
  });
}

window.onload = () => {
  'use strict';
  ConnectSocket();
}