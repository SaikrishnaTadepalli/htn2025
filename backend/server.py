# print("Hello, world!")

import asyncio
import websockets
import shutil
import os
import subprocess

OUTPUT_DIR = "received_chunks"

class ChunkQueue:
    def read():
        files = sorted([os.path.join(OUTPUT_DIR, entry.name) for entry in os.scandir(OUTPUT_DIR) if entry.is_file()])

        if (len(files) == 0):
            print("No Files")
            return
        
        print(files)
        
        return files[0]

async def handler(websocket):
    print("Client connected")
    chunk_count = 0

    try:
        async for message in websocket:
            # message is bytes (binary chunk)
            chunk_count += 1
            webm_filename = os.path.join(OUTPUT_DIR, f"chunk_{chunk_count}.mp4")

            with open(webm_filename, "wb") as f:
                f.write(message)
                f.flush()
                os.fsync(f.fileno())

            print(f"Received and saved chunk {chunk_count}")
            
            
    except websockets.exceptions.ConnectionClosed as e:
        print("Connection closed:", e)

async def main():

    # Clear the folder
    if os.path.isdir(OUTPUT_DIR): 
        shutil.rmtree(OUTPUT_DIR)

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Start the Queue
    async with websockets.serve(handler, "0.0.0.0", 8765):
        print("Server started on ws://0.0.0.0:8765")
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())
