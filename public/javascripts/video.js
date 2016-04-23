'use strict';

$(function() {
	console.log('Start local stream.');

	navigator.mediaDevices.getUserMedia({audio: true, video: true})
						  .then(gotStream)
						  .catch(function(e) {
						  	console.log('getUserMedia() error.');
						  });

	var socket = io('/video');
	var video = document.querySelector('video#gum');
	var intervalId;
	
	$('#connect_btn').click(function() {
		socket.emit('streamer init', {room: lastPath});
		// take a snapshot & send dataUrl to the server every 5 minutes.
		getSnapshot();
		intervalId = setInterval(getSnapshot, 5 * 60 * 1000);
	});

	function getSnapshot() {
		console.log('take a snap shot.');
		var canvas = document.createElement('canvas');
		canvas.width = 200;
		canvas.height = 125;
		canvas.getContext('2d')
			  .drawImage(video, 0, 0, canvas.width, canvas.height);
		var thumbnailURL = canvas.toDataURL();
		socket.emit('streamer thumbnail', {imgUrl: thumbnailURL});
	}

	$('#disconnect_btn').click(function() {
		//stop interval
		clearInterval(intervalId);

		// close peer connections
		for(var x in pcs) {
			pcs[x].close();
		}
		socket.disconnect();	
	});

	// peer connections
	var pcs = {};
	var remoteId;

	var offerOptions = {
		offerToReceiveAudio: 1,
		offerToReceiveVideo: 1
	};

	socket.on('streamer init', function(data) {
		console.log('streamer socket id: ', data.id);
	});

	socket.on('streamer video', function(data) {
		remoteId = data.remoteId;
		var servers = null;
		pcs[remoteId] = new RTCPeerConnection(servers);

		socket.emit('streamer video', {remoteId: remoteId});
		pcs[remoteId].onicecandidate = iceCallbackLocal;
		console.log('local: created pc.');

		pcs[remoteId].addStream(window.localstream);
		console.log('adding local stream to pc.');
		pcs[remoteId].createOffer(gotDescriptionLocal, onCreateSessionDescriptionError, offerOptions);

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
		pcs[remoteId].setLocalDescription(desc);
		console.log('streamer desc: ', desc);
		socket.emit('streamer desc', {desc: desc, remoteId: remoteId});
	}

	socket.on('streamer desc', function(data) {
		remoteId = data.remoteId;
		var tmpDescription = new RTCSessionDescription({type: data.desc.type,
														sdp: data.desc.sdp});
		pcs[remoteId].setRemoteDescription(tmpDescription);
	});

	function iceCallbackLocal(event) {
		handleCandidate(event.candidate);
	}

	function handleCandidate(candidate) {
		if(candidate) {
			console.log('what is the candidate value of streamer? ', candidate);
			socket.emit('streamer candidate', {candidate: candidate, remoteId: remoteId});
		}
	}

	socket.on('streamer candidate', function(data) {
		remoteId = data.remoteId;
		var tmpCandidate = new RTCIceCandidate({candidate: data.candidate.candidate,
													sdpMid: data.candidate.sdpMid,
													sdpMLineIndex: data.candidate.sdpMLineIndex});
		pcs[remoteId].addIceCandidate(tmpCandidate,
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

