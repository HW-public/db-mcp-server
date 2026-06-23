import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function sendMessage(proc, msg) {
  const data = JSON.stringify(msg);
  proc.stdin.write(data + '\n');
}

function readMessage(proc) {
  return new Promise((resolve, reject) => {
    const handler = (data) => {
      const line = data.toString().trim();
      if (!line) return;
      proc.stdout.off('data', handler);
      try {
        resolve(JSON.parse(line));
      } catch (e) {
        reject(e);
      }
    };
    proc.stdout.on('data', handler);
  });
}

async function main() {
  const proc = spawn('node', ['dist/index.js'], {
    cwd: __dirname,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  proc.stderr.on('data', (data) => {
    console.error('stderr:', data.toString().trim());
  });

  try {
    sendMessage(proc, {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test-client', version: '1.0.0' },
      },
    });
    const initResp = await readMessage(proc);
    console.log('initialize response:', JSON.stringify(initResp, null, 2));

    sendMessage(proc, {
      jsonrpc: '2.0',
      method: 'notifications/initialized',
    });

    sendMessage(proc, {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
    });
    const toolsResp = await readMessage(proc);
    console.log('tools/list response:', JSON.stringify(toolsResp, null, 2));

    sendMessage(proc, {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'list_tables',
        arguments: { dataSource: 'oracle' },
      },
    });
    const callResp = await readMessage(proc);
    console.log('list_tables response:', JSON.stringify(callResp, null, 2));
  } finally {
    proc.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
