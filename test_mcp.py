import json
import subprocess
import sys

def send_message(proc, msg):
    data = json.dumps(msg)
    proc.stdin.write(data + "\n")
    proc.stdin.flush()

def read_message(proc):
    line = proc.stdout.readline()
    if not line:
        return None
    return json.loads(line)

def main():
    proc = subprocess.Popen(
        ["node", "dist/index.js"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        cwd="C:\\Users\\ASUS\\db-mcp-server"
    )

    try:
        # 1. initialize
        send_message(proc, {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "test-client", "version": "1.0.0"}
            }
        })
        resp = read_message(proc)
        print("initialize response:", json.dumps(resp, indent=2, ensure_ascii=False))

        # 2. initialized notification
        send_message(proc, {
            "jsonrpc": "2.0",
            "method": "notifications/initialized"
        })

        # 3. tools/list
        send_message(proc, {
            "jsonrpc": "2.0",
            "id": 2,
            "method": "tools/list"
        })
        resp = read_message(proc)
        print("tools/list response:", json.dumps(resp, indent=2, ensure_ascii=False))

        # 4. tools/call list_tables
        send_message(proc, {
            "jsonrpc": "2.0",
            "id": 3,
            "method": "tools/call",
            "params": {
                "name": "list_tables",
                "arguments": {"dataSource": "oracle"}
            }
        })
        resp = read_message(proc)
        print("list_tables response:", json.dumps(resp, indent=2, ensure_ascii=False))

    finally:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()

if __name__ == "__main__":
    main()
