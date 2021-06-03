<template>
  <div class="app-home">
    <video autoplay playsinline ref="video" controls preload="metadata"></video>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import router from "@/router";
import { io, Socket } from "socket.io-client";

@Options({
  components: {},
})
export default class Home extends Vue {
  socket: Socket = io(process.env.NODE_ENV === "production" ? "wss://live.sunrin.dev/" : "ws://10.0.0.226:3000");
  peerConnection!: RTCPeerConnection;
  $refs!: {
    video: HTMLVideoElement;
  };

  mounted() {
    this.peerConnection = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });

    this.peerConnection.ontrack = (event: RTCTrackEvent) => {
      this.$refs.video.srcObject = event.streams[0];
    };

    this.peerConnection.onsignalingstatechange = (event: Event) => {
      if (this.peerConnection.signalingState === "closed") router.go(0);
    };

    this.socket.on("offer", async (id: string, description: RTCSessionDescriptionInit) => {
      try {
        if (this.peerConnection.signalingState === "closed") return router.go(0);
        await this.peerConnection.setRemoteDescription(description);
        if (["have-remote-offer", "have-local-pranswer"].includes(this.peerConnection.signalingState)) await this.peerConnection.setLocalDescription(await this.peerConnection.createAnswer());
        this.socket.emit("answer", id, this.peerConnection.localDescription);

        this.peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
          if (event.candidate) this.socket.emit("candidate", id, event.candidate);
        };
      } catch (err) {
        console.error(err);
      }
    });

    this.socket.on("candidate", async (id: string, candidate: RTCIceCandidateInit) => {
      if (this.peerConnection.signalingState === "closed") return router.go(0);
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error(err);
      }
    });

    this.socket.on("connect", () => {
      this.socket.emit("watcher");
    });

    this.socket.on("presenter", () => {
      this.socket.emit("watcher");
    });

    this.socket.on("stop", () => {
      this.peerConnection.close();
    });

    window.onunload = window.onbeforeunload = () => {
      this.socket.close();
      this.peerConnection.close();
    };
  }
}
</script>

<style lang="scss" scoped>
.app-home {
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
