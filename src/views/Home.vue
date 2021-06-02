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
  socket: Socket = io("wss://live.sunrin.dev/");
  peerConnection!: RTCPeerConnection;
  $refs!: {
    video: HTMLVideoElement;
  };

  mounted() {
    this.peerConnection = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });

    this.peerConnection.ontrack = (event: RTCTrackEvent) => {
      this.$refs.video.srcObject = event.streams[0];
    };

    this.socket.on("offer", async (id: string, description: RTCSessionDescriptionInit) => {
      try {
        await this.peerConnection.setRemoteDescription(description);
      } catch (err) {
        router.go(0);
      }

      if (this.peerConnection.signalingState !== "stable") {
        const sdp: RTCSessionDescriptionInit = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(sdp);

        this.socket.emit("answer", id, this.peerConnection.localDescription);
      }

      this.peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
        if (event.candidate) this.socket.emit("candidate", id, event.candidate);
      };
    });
    this.socket.on("candidate", async (id: string, candidate: RTCIceCandidateInit) => {
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        throw new Error(err);
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
