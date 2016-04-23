'use strict';

$(function() {
	console.log('Start remote stream.');

	var socket = io('/video');
	var video = document.querySelector('video#gum');

	socket.emit('remote init', {room: lastPath});
	socket.on('remote init', function(data) {
		console.log('remote socket id: ', data.id);
	});

	var pc;
	var servers = null;

	socket.emit('remote video');
	
	socket.on('remote video', function() {
		pc = new RTCPeerConnection(servers);
		console.log('client pc: ', pc);
		
		pc.onaddstream = gotRemoteStream;
		pc.onicecandidate = iceCallbackRemote;
		console.log('remote: created pc.');
	});

	socket.on('remote desc', function(data) {
		var tmpDescription = new RTCSessionDescription({type: data.desc.type,
														sdp: data.desc.sdp});
		console.log('Received from streamer desc: ', tmpDescription);
		pc.setRemoteDescription(tmpDescription);
		pc.createAnswer(gotDescriptionRemote, onCreateSessionDescriptionError);
	});

	function onCreateSessionDescriptionError(error) {
		console.log('Failed to create session description.');
	}

	function gotDescriptionRemote(desc) {
		console.log('remote desc: ', desc);
		pc.setLocalDescription(desc);
		console.log('remote sdp: ', desc.sdp);
		socket.emit('remote desc', {desc: desc});
	}

	function gotRemoteStream(e) {
		video.srcObject = e.stream;
		console.log('received remote stream.');
	}

	function iceCallbackRemote(event) {
		handleCandidate(event.candidate);
	}

	function handleCandidate(candidate) {
		if(candidate) {
			socket.emit('remote candidate', {candidate: candidate});
		}
	}

	socket.on('remote candidate', function(data) {
		var tmpCandidate = new RTCIceCandidate({candidate: data.candidate.candidate,
													sdpMid: data.candidate.sdpMid,
													sdpMLineIndex: data.candidate.sdpMLineIndex});
		pc.addIceCandidate(tmpCandidate,
			onAddIceCandidateSuccess, onAddIceCandidateError);
		console.log('remote candidate: ', data.candidate);
	});

	function onAddIceCandidateSuccess() {
		console.log('addIceCandidate success.');
	}

	function onAddIceCandidateError() {
		console.log('addIceCandidate failed.');
	}
});

