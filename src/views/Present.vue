<template>
  <div class="app-present">
    <button v-if="!isPresenting" class="app-present__action app-primary" @click="initShare"><i class="iconify" data-icon="mdi:monitor-share"></i>화면 공유</button>
    <button v-else class="app-present__action app-accent" @click="stopShare"><i class="iconify" data-icon="mdi:monitor-off"></i>공유 중단</button>
    <video autoplay playsinline ref="video" controls preload="metadata"></video>
    <div class="app-present__viewers"><i class="iconify" data-icon="mdi:eye"></i>{{ peerConnections.size }}명 {{ isPresenting ? "시청중" : "대기중" }}</div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { io, Socket } from "socket.io-client";

@Options({
  components: {},
})
export default class Present extends Vue {
  socket: Socket = io(process.env.NODE_ENV === "production" ? "wss://webrtc.hyunwoo.dev/" : "ws://10.0.0.226:3000");
  isPresenting: boolean = false;
  stream: any;
  peerConnections: Map<string, RTCPeerConnection> = new Map();
  $refs!: {
    video: HTMLVideoElement;
  };

  async selectScreen() {
    try {
      const _navigator: any = navigator;
      if (_navigator.getDisplayMedia) this.stream = await _navigator.getDisplayMedia({ audio: true, video: true });
      else if (_navigator.mediaDevices.getDisplayMedia) this.stream = await _navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });
      else this.stream = await _navigator.mediaDevices.getUserMedia({ audio: true, video: { mediaSource: "screen" } });

      this.$refs.video.srcObject = this.stream;
      return true;
    } catch (err) {}
  }

  async initShare() {
    try {
      if (!(await this.selectScreen())) return;

      this.isPresenting = true;

      this.socket.emit("presenter");

      this.socket.on("watcher", async (id: string) => {
        this.peerConnections.set(id, new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] }));

        const peerConnection = this.peerConnections.get(id)!;

        this.stream.getTracks().map((track: any) => peerConnection.addTrack(track, this.stream));

        peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
          if (event.candidate) this.socket.emit("candidate", id, event.candidate);
        };

        peerConnection.onnegotiationneeded = async (event: Event) => {
          try {
            await peerConnection.setLocalDescription(await peerConnection.createOffer());
            this.socket.emit("offer", id, peerConnection.localDescription);
          } catch (err) {
            console.error(err);
          }
        };
      });

      this.socket.on("answer", async (id: string, description: RTCSessionDescriptionInit) => {
        try {
          const peerConnection = this.peerConnections.get(id)!;
          if (peerConnection.signalingState !== "stable") await peerConnection.setRemoteDescription(description);
        } catch (err) {
          console.error(err);
        }
      });

      this.socket.on("candidate", async (id: string, candidate: RTCIceCandidateInit) => {
        try {
          await this.peerConnections.get(id)!.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error(err);
        }
      });

      this.socket.on("disconnectPeer", (id: string) => {
        this.peerConnections.delete(id);
      });

      window.onunload = window.onbeforeunload = () => {
        this.socket.close();
      };
    } catch (err) {
      throw new Error(err);
    }
  }

  stopShare() {
    this.isPresenting = false;
    this.stream = {};
    (this.$refs.video.srcObject as any).getTracks().map((track: any) => track.stop());
    this.peerConnections.clear();
    this.socket.emit("stop");
  }
}
</script>

<style lang="scss" scoped>
.app-present {
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .app-present__action {
    position: fixed;
    top: 10px;
    bottom: auto;

    &.app-primary {
      background-color: #4284e4;
    }
    &.app-accent {
      background-color: #ec5f59;
    }
  }

  .app-present__viewers {
    display: flex;
    justify-content: center;
    align-items: center;

    position: fixed;
    top: auto;
    bottom: 10px;
    left: 10px;
    right: auto;

    background: #444;
    box-shadow: 2px 2px 10px rgba(#000, 0.4);
    border-radius: 20px;

    padding: 8px 16px;
  }
}
</style>
