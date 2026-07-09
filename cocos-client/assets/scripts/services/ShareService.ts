import type { RuntimePort, ShareMessageOptions } from "../adapters/RuntimePort";

export class ShareService {
  constructor(private readonly runtime: RuntimePort) {}

  shareRoom(roomCode: string, modeLabel: string): void {
    const options: ShareMessageOptions = {
      title: `邀请你加入${modeLabel} · 房间${roomCode}`,
      query: `roomCode=${encodeURIComponent(roomCode)}`
    };
    this.runtime.shareAppMessage(options);
  }
}

