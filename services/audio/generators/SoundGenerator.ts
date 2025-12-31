
export abstract class SoundGenerator {
  protected nodes: AudioNode[] = [];
  protected timeouts: number[] = [];
  protected isRunning: boolean = false;

  constructor(protected ctx: AudioContext, protected destination: AudioNode) {}

  abstract start(): void;

  public stop(): void {
    this.isRunning = false;
    this.timeouts.forEach(t => clearTimeout(t));
    this.timeouts = [];
    
    this.nodes.forEach(node => {
      try {
        if (node instanceof AudioBufferSourceNode || node instanceof OscillatorNode) {
          node.stop();
        }
        node.disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }
    });
    this.nodes = [];
  }

  protected registerNode(node: AudioNode) {
    this.nodes.push(node);
  }

  protected registerTimeout(id: number) {
    this.timeouts.push(id);
  }
}
