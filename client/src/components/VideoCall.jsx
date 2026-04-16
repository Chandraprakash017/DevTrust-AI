import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";

const VideoCall = ({ socket, user, receiverId, onEndCall }) => {
  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      setStream(stream);
      if (myVideo.current) myVideo.current.srcObject = stream;
    });

    socket.on("call-made", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });

    socket.on("call-answered", (signal) => {
      setCallAccepted(true);
      connectionRef.current.signal(signal);
    });

    socket.on("call-ended", () => {
      setCallEnded(true);
      window.location.reload(); // Simple cleanup
    });

    return () => {
      socket.off("call-made");
      socket.off("call-answered");
      socket.off("call-ended");
    };
  }, []);

  const callUser = () => {
    const peer = new Peer({ initiator: true, trickle: false, stream: stream });

    peer.on("signal", (data) => {
      socket.emit("call-user", {
        userToCall: receiverId,
        signalData: data,
        from: user.id,
        name: user.name,
      });
    });

    peer.on("stream", (stream) => {
      if (userVideo.current) userVideo.current.srcObject = stream;
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({ initiator: false, trickle: false, stream: stream });

    peer.on("signal", (data) => {
      socket.emit("answer-call", { signal: data, to: caller });
    });

    peer.on("stream", (stream) => {
      if (userVideo.current) userVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    if (connectionRef.current) connectionRef.current.destroy();
    socket.emit("end-call", { to: receiverId });
    onEndCall();
  };

  const toggleMic = () => {
    setMicOn(!micOn);
    stream.getAudioTracks()[0].enabled = !micOn;
  };

  const toggleVideo = () => {
    setVideoOn(!videoOn);
    stream.getVideoTracks()[0].enabled = !videoOn;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-4xl aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
        {/* Remote Video */}
        {callAccepted && !callEnded ? (
          <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/50">
            {receivingCall && !callAccepted ? (
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">{name} is calling...</h2>
                <button
                  onClick={answerCall}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg"
                >
                  Answer Call
                </button>
              </div>
            ) : (
              <div className="text-center">
                <h2 className="text-xl">Waiting for connection...</h2>
                {!callAccepted && (
                  <button
                    onClick={callUser}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition-all"
                  >
                    Start Call
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Local Video Overlay */}
        <div className="absolute top-4 right-4 w-48 aspect-video bg-black rounded-lg overflow-hidden border-2 border-white/20 shadow-lg">
          <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
        </div>

        {/* Controls Bar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/40 backdrop-blur-md px-8 py-4 rounded-full border border-white/10">
          <button
            onClick={toggleMic}
            className={`p-3 rounded-full transition-all ${micOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-500 text-white'}`}
          >
            {micOn ? <Mic size={24} /> : <MicOff size={24} />}
          </button>
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-all ${videoOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-500 text-white'}`}
          >
            {videoOn ? <Video size={24} /> : <VideoOff size={24} />}
          </button>
          <button
            onClick={leaveCall}
            className="bg-red-600 hover:bg-red-700 p-4 rounded-full text-white transition-all shadow-lg shadow-red-500/20"
          >
            <PhoneOff size={28} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
