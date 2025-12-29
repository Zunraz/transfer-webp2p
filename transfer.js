// Tamaño del trozo (64KB es un buen equilibrio para WebRTC)
const CHUNK_SIZE = 64 * 1024; 

async function sendFile(file, conn, secretKey) {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    
    // 1. Enviar metadatos
    conn.send({
        type: 'metadata',
        filename: file.name,
        filetype: file.type,
        totalChunks: totalChunks
    });

    for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        // Leer el trozo como ArrayBuffer
        const buffer = await chunk.arrayBuffer();
        
        // Convertir a WordArray para CryptoJS
        const wordArray = CryptoJS.lib.WordArray.create(buffer);
        
        // 2. Encriptar el trozo
        const encryptedChunk = CryptoJS.AES.encrypt(wordArray, secretKey).toString();

        // 3. Enviar trozo encriptado
        conn.send({
            type: 'chunk',
            index: i,
            data: encryptedChunk
        });

        // Actualizar UI
        updateProgress((i / totalChunks) * 100);
    }
}