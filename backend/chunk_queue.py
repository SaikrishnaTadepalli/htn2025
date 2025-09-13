OUTPUT_DIR = "received_chunks"

class ChunkQueue:
    def read():
        files = sorted([os.path.join(OUTPUT_DIR, entry.name) for entry in os.scandir(OUTPUT_DIR) if entry.is_file()])

        if (len(files) == 0):
            print("No Files")
            return
        
        print(files)
        
        return files[0]
    

# TODO:
# Covert to mp3
# Delete after read

# NOTE:
# Videos are deleted when program restarts