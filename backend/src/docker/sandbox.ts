import Docker from 'dockerode';
import { randomBytes } from 'crypto';

export interface ContainerConfig {
  agentId: string;
  scriptPath: string;
  memoryLimit: number;
  cpuLimit: number;
  timeout: number;
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  exitCode: number;
  executionTime: number;
  memoryUsed: number;
}

const DEFAULT_CONFIG: Partial<ContainerConfig> = {
  memoryLimit: 256 * 1024 * 1024, // 256MB
  cpuLimit: 0.5, // 50% of one CPU
  timeout: 60000 // 60 seconds
};

export class ArenaSandbox {
  private docker: Docker;
  private activeContainers: Map<string, Docker.Container> = new Map();

  constructor() {
    this.docker = new Docker();
  }

  async initialize(): Promise<void> {
    try {
      await this.docker.ping();
      console.log('[SANDBOX] Docker connection established');
    } catch (error) {
      console.error('[SANDBOX] Docker not available, running in simulation mode');
    }
  }

  private generateContainerName(agentId: string): string {
    const suffix = randomBytes(4).toString('hex');
    return `claw-arena-${agentId.slice(0, 8)}-${suffix}`;
  }

  async createArenaContainer(config: ContainerConfig): Promise<string> {
    const containerName = this.generateContainerName(config.agentId);
    const fullConfig = { ...DEFAULT_CONFIG, ...config };

    try {
      const container = await this.docker.createContainer({
        Image: 'claw-agent-runtime:latest',
        name: containerName,
        Cmd: ['node', '/agent/script.js'],
        HostConfig: {
          Memory: fullConfig.memoryLimit,
          CpuPeriod: 100000,
          CpuQuota: Math.floor(fullConfig.cpuLimit! * 100000),
          NetworkMode: 'none', // Network isolation
          ReadonlyRootfs: true,
          SecurityOpt: ['no-new-privileges'],
          AutoRemove: true
        },
        Env: [
          `AGENT_ID=${config.agentId}`,
          `TIMEOUT=${fullConfig.timeout}`
        ],
        WorkingDir: '/agent',
        Volumes: {
          '/agent/script.js': {}
        }
      });

      this.activeContainers.set(containerName, container);
      return containerName;
    } catch (error) {
      console.error('[SANDBOX] Failed to create container:', error);
      throw error;
    }
  }

  async executeAgent(containerName: string, input: string): Promise<ExecutionResult> {
    const container = this.activeContainers.get(containerName);
    if (!container) {
      throw new Error(`Container ${containerName} not found`);
    }

    const startTime = Date.now();

    try {
      await container.start();

      // Attach to container and send input
      const exec = await container.exec({
        Cmd: ['node', '-e', input],
        AttachStdout: true,
        AttachStderr: true
      });

      const stream = await exec.start({ hijack: true, stdin: false });
      let output = '';

      return new Promise((resolve) => {
        stream.on('data', (chunk: Buffer) => {
          output += chunk.toString();
        });

        stream.on('end', async () => {
          const executionTime = Date.now() - startTime;
          const stats = await container.stats({ stream: false });

          resolve({
            success: true,
            output: output.trim(),
            exitCode: 0,
            executionTime,
            memoryUsed: stats.memory_stats?.usage || 0
          });
        });

        stream.on('error', (err: Error) => {
          resolve({
            success: false,
            output: err.message,
            exitCode: 1,
            executionTime: Date.now() - startTime,
            memoryUsed: 0
          });
        });
      });
    } catch (error) {
      return {
        success: false,
        output: (error as Error).message,
        exitCode: 1,
        executionTime: Date.now() - startTime,
        memoryUsed: 0
      };
    }
  }

  async destroyContainer(containerName: string): Promise<void> {
    const container = this.activeContainers.get(containerName);
    if (container) {
      try {
        await container.stop({ t: 5 });
        await container.remove({ force: true });
      } catch {
        // Container might already be removed
      }
      this.activeContainers.delete(containerName);
    }
  }

  async destroyAll(): Promise<void> {
    const promises = Array.from(this.activeContainers.keys()).map((name) =>
      this.destroyContainer(name)
    );
    await Promise.all(promises);
  }

  // Simulation mode for when Docker is not available
  async simulateExecution(
    agentId: string,
    attackPower: number,
    defenseStrength: number
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    const simulatedDelay = Math.random() * 500 + 100;

    await new Promise((resolve) => setTimeout(resolve, simulatedDelay));

    const effectiveness = (attackPower / (defenseStrength + 1)) * Math.random();
    const success = effectiveness > 0.5;

    return {
      success,
      output: JSON.stringify({
        action: success ? 'ATTACK_SUCCESS' : 'ATTACK_BLOCKED',
        effectiveness: Math.round(effectiveness * 100),
        agentId
      }),
      exitCode: success ? 0 : 1,
      executionTime: Date.now() - startTime,
      memoryUsed: Math.floor(Math.random() * 50 * 1024 * 1024)
    };
  }
}

export const arenaSandbox = new ArenaSandbox();
