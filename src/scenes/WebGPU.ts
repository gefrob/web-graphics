import { Scene } from "../common/Scene";

class WebGPUTriangle extends Scene {
  #canvas: HTMLCanvasElement;

  constructor() {
    super();
    const canvas = document.createElement("canvas") as HTMLCanvasElement;
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    document.body.appendChild(canvas);

    this.#canvas = canvas;
  }

  destroy(): void {
    document.body.removeChild(this.#canvas);
  }

  async start(time: number) {
    super.start(time);

    // Get the context
    const context = this.#canvas.getContext("webgpu");
    if (!context) {
      alert("No WebGPU context");
      throw new Error("No WebGPU context");
    }

    // Get the device, configure the context
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new Error("No adapter");
    }

    const device = await adapter.requestDevice();

    const format = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
      device,
      format,
      alphaMode: "opaque"
    });

    // Create the pipeline
    const POSITION_ATTRIB = 0;

    const shaderSource = `
        @vertex
        fn vertexMain(@location(0) position : vec3<f32>) -> @builtin(position) vec4<f32> {
            return vec4(position, 1.0);
        }

        @fragment
        fn fragmentMain() -> @location(0) vec4<f32> {
            return vec4(1.0, 0.0, 0.0, 1.0);
        }
        `;

    const shaderModule = device.createShaderModule({
      code: shaderSource
    });

    const pipeline = device.createRenderPipeline({
      layout: "auto",
      vertex: {
        module: shaderModule,
        entryPoint: "vertexMain",
        buffers: [
          {
            arrayStride: 12,
            attributes: [
              {
                shaderLocation: POSITION_ATTRIB,
                offset: 0,
                format: "float32x3"
              }
            ]
          }
        ]
      },
      fragment: {
        module: shaderModule,
        entryPoint: "fragmentMain",
        targets: [{ format }]
      }
    });

    // Create the vertex buffer
    const vertexData = new Float32Array([0, 1, 1, -1, -1, 1, 1, -1, 1]);
    const vertexBuffer = device.createBuffer({
      size: vertexData.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });
    device.queue.writeBuffer(vertexBuffer, 0, vertexData);

    // Draw
    const commandEncoder = device.createCommandEncoder();
    const passEncoder = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          loadOp: "clear",
          clearValue: [0.0, 0.0, 0.0, 1.0],
          storeOp: "store"
        }
      ]
    });

    passEncoder.setPipeline(pipeline);
    passEncoder.setVertexBuffer(0, vertexBuffer);
    passEncoder.draw(3);

    passEncoder.end();

    device.queue.submit([commandEncoder.finish()]);
  }
}

export { WebGPUTriangle };
