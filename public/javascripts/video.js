'use strict';

$(function() {
	console.log('Start local stream.');

	navigator.mediaDevices.getUserMedia({audio: true, video: true})
						  .then(gotStream)
						  .catch(function(e) {
						  	console.log('getUserMedia() error.');
						  });

	var socket = io('/channel');
	var video = document.querySelector('video#gum');
	
	$('#connect_btn').click(function() {
		socket.emit('streamer init');
	});

	$('#disconnect_btn').click(function() {
		// socket.disconnect(true);	
	});

	var pc;
	var offerOptions = {
		offerToReceiveAudio: 1,
		offerToReceiveVideo: 1
	};

	var socketId;

	socket.on('streamer init', function(data) {
		socketId = data.id;
		console.log('streamer socket id: ', socketId);
	});

	socket.on('streamer video', function() {
		var servers = null;
		pc = new RTCPeerConnection(servers);

		socket.emit('streamer video');
		pc.onicecandidate = iceCallbackLocal;
		console.log('local: created pc.');

		pc.addStream(window.localstream);
		console.log('adding local stream to pc.');
		pc.createOffer(gotDescriptionLocal, onCreateSessionDescriptionError, offerOptions);

	});

	function onCreateSessionDescriptionError(error) {
		console.log('Failed to create session description.');
	}

	function gotStream(stream) {
		console.log('Received local stream.');
		video.srcObject = stream;
		window.localstream = stream;
	}

	function gotDescriptionLocal(desc) {
		pc.setLocalDescription(desc);
		console.log('streamer desc: ', desc);
		socket.emit('streamer desc', {desc: desc});
	}

	socket.on('streamer desc', function(data) {
		var tmpDescription = new RTCSessionDescription({type: data.desc.type,
														sdp: data.desc.sdp});
		pc.setRemoteDescription(tmpDescription);
	});

	function iceCallbackLocal(event) {
		handleCandidate(event.candidate);
	}

	function handleCandidate(candidate) {
		if(candidate) {
			console.log('what is the candidate value of streamer? ', candidate);
			socket.emit('streamer candidate', {candidate: candidate});
		}
	}

	socket.on('streamer candidate', function(data) {
		var tmpCandidate = new RTCIceCandidate({candidate: data.candidate.candidate,
													sdpMid: data.candidate.sdpMid,
													sdpMLineIndex: data.candidate.sdpMLineIndex});
		pc.addIceCandidate(tmpCandidate,
			onAddIceCandidateSuccess, onAddIceCandidateError);
		console.log('streamer candidate: ', data.candidate);
	});

	function onAddIceCandidateSuccess() {
		console.log('addIceCandidate success.');
	}

	function onAddIceCandidateError() {
		console.log('addIceCandidate failed.');
	}
});

