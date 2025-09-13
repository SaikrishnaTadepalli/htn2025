// import { useEffect, useRef, useState } from "react";

// export default function Home() {
//   const videoRef = useRef(null);
//   const wsRef = useRef(null);
//   const mediaRecorderRef = useRef(null);

//   const [status, setStatus] = useState("Initializing...");
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // Request access to camera and mic
//     async function setup() {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: true,
//           audio: true,
//         });

//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;
//         }

//         // Connect to WebSocket backend
//         const ws = new WebSocket("ws://localhost:8765");
//         ws.binaryType = "arraybuffer";

//         ws.onopen = () => {
//           setStatus("WebSocket connected, starting recording...");

//           // Setup MediaRecorder
//           const options = { mimeType: "video/webm; codecs=vp8,opus" };
//           const mediaRecorder = new MediaRecorder(stream, options);

//           mediaRecorder.ondataavailable = (event) => {
//             if (event.data && event.data.size > 0) {
//               // Send chunk to server
//               ws.send(event.data);
//               setStatus((prev) => prev + " • Sent chunk");
//             }
//           };

//           mediaRecorder.start(1000); // chunk every 1000ms (1 second)

//           mediaRecorderRef.current = mediaRecorder;
//         };

//         ws.onerror = (err) => {
//           console.error("WebSocket error:", err);
//           setError("WebSocket error, see console");
//         };

//         ws.onclose = () => {
//           setStatus("WebSocket connection closed");
//         };

//         wsRef.current = ws;
//       } catch (err) {
//         console.error("Error accessing media devices:", err);
//         setError("Could not access camera/microphone");
//       }
//     }

//     setup();

//     // Cleanup on unmount
//     return () => {
//       if (
//         mediaRecorderRef.current &&
//         mediaRecorderRef.current.state !== "inactive"
//       ) {
//         mediaRecorderRef.current.stop();
//       }
//       if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//         wsRef.current.close();
//       }
//       if (videoRef.current && videoRef.current.srcObject) {
//         videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
//       }
//     };
//   }, []);

//   return (
//     <div style={{ padding: 20 }}>
//       <h1>Webcam Stream to WebSocket</h1>
//       <video
//         ref={videoRef}
//         autoPlay
//         playsInline
//         muted
//         style={{ width: "640px", height: "480px", backgroundColor: "#000" }}
//       />
//       <div style={{ marginTop: 20 }}>
//         <strong>Status:</strong> {status}
//       </div>
//       {error && (
//         <div style={{ marginTop: 10, color: "red" }}>
//           <strong>Error:</strong> {error}
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const [status, setStatus] = useState<string>("Initializing...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function setup() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        const ws = new WebSocket("ws://localhost:8765");
        ws.binaryType = "arraybuffer";

        ws.onopen = () => {
          setStatus("WebSocket connected, starting recording...");

          const options: MediaRecorderOptions = {
            mimeType: "video/webm; codecs=vp8,opus",
          };

          // Check if MediaRecorder is supported with these options
          if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
            setError("MediaRecorder mimeType not supported");
            return;
          }

          const mediaRecorder = new MediaRecorder(stream, options);

          mediaRecorder.ondataavailable = (event: BlobEvent) => {
            if (
              event.data &&
              event.data.size > 0 &&
              ws.readyState === WebSocket.OPEN
            ) {
              ws.send(event.data);
              setStatus((prev) => prev + " • Sent chunk");
            }
          };

          mediaRecorder.start(1000); // 1-second chunks

          mediaRecorderRef.current = mediaRecorder;
        };

        ws.onerror = (event) => {
          console.error("WebSocket error:", event);
          setError("WebSocket error, see console");
        };

        ws.onclose = () => {
          setStatus("WebSocket connection closed");
        };

        wsRef.current = ws;
      } catch (err) {
        console.error("Error accessing media devices:", err);
        setError("Could not access camera/microphone");
      }
    }

    setup();

    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Webcam Stream to WebSocket</h1>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: "640px", height: "480px", backgroundColor: "#000" }}
      />
      <div style={{ marginTop: 20 }}>
        <strong>Status:</strong> {status}
      </div>
      {error && (
        <div style={{ marginTop: 10, color: "red" }}>
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}
