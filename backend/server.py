# print("Hello, world!")

import asyncio
import websockets
import os

OUTPUT_DIR = "received_chunks"
os.makedirs(OUTPUT_DIR, exist_ok=True)

async def handler(websocket):
    print("Client connected")
    chunk_count = 0

    try:
        async for message in websocket:
            # message is bytes (binary chunk)
            chunk_count += 1
            filename = os.path.join(OUTPUT_DIR, f"chunk_{chunk_count}.webm")
            with open(filename, "wb") as f:
                f.write(message)
            print(f"Received and saved chunk {chunk_count}")
            
    except websockets.exceptions.ConnectionClosed as e:
        print("Connection closed:", e)

async def main():
    async with websockets.serve(handler, "0.0.0.0", 8765):
        print("Server started on ws://0.0.0.0:8765")
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())
