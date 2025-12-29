const peer = new Peer(); 
let conn = null;
let encryptedChunksBuffer = []; 
let metadata = null;

// 1. Al abrirse, mostrar ID
peer.on('open', (id) => {
    document.getElementById('my-id').innerText = id;
});

// 2. Escuchar cuando alguien nos conecta (Receptor)
peer.on('connection', (connection) => {
    conn = connection;
    confirmarConexion();
});

// 3. Cuando nosotros conectamos a alguien (Emisor)
document.getElementById('connect-btn').onclick = () => {
    const peerId = document.getElementById('peer-id').value;
    if (!peerId) return alert("Introduce un ID");
    conn = peer.connect(peerId);
    confirmarConexion();
};

function confirmarConexion() {
    conn.on('open', () => {
        // Actualizar UI en ambos lados
        document.getElementById('status-text').innerText = "¡CONECTADO!";
        document.getElementById('connection-status').classList.add('connected');
        document.getElementById('conn-section').style.display = 'none';
        document.getElementById('transfer-zone').style.display = 'block';
        
        escucharDatos();
    });
}

function escucharDatos() {
    conn.on('data', (data) => {
        if (data.type === 'metadata') {
            metadata = data;
            encryptedChunksBuffer = new Array(data.totalChunks);
            document.getElementById('role-emitter').style.display = 'none';
            document.getElementById('role-receiver').style.display = 'block';
            document.getElementById('file-info').innerText = `${data.filename} (${(data.size/1024).toFixed(1)} KB)`;
        } 
        else if (data.type === 'chunk') {
            encryptedChunksBuffer[data.index] = data.data;
            const received = encryptedChunksBuffer.filter(x => x).length;
            const progress = (received / metadata.totalChunks) * 100;
            document.getElementById('progress-bar').style.width = progress + "%";
            document.getElementById('percentage').innerText = `Recibido: ${Math.round(progress)}%`;
        }
    });
}

// Envío
document.getElementById('send-btn').onclick = async () => {
    const file = document.getElementById('file-input').files[0];
    const key = document.getElementById('send-key').value;
    if (!file || !key) return alert("Falta archivo o clave");

    const CHUNK_SIZE = 16384 * 2;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    conn.send({ type: 'metadata', filename: file.name, size: file.size, totalChunks });

    for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const buffer = await file.slice(start, start + CHUNK_SIZE).arrayBuffer();
        const encrypted = CryptoJS.AES.encrypt(CryptoJS.lib.WordArray.create(buffer), key).toString();

        conn.send({ type: 'chunk', index: i, data: encrypted });
        
        if (i % 5 === 0 || i === totalChunks - 1) {
            const prog = ((i + 1) / totalChunks) * 100;
            document.getElementById('progress-bar').style.width = prog + "%";
            document.getElementById('percentage').innerText = `Enviando: ${Math.round(prog)}%`;
        }
    }
    alert("¡Archivo enviado!");
};

// Desencriptación
document.getElementById('decrypt-btn').onclick = () => {
    const key = document.getElementById('receive-key').value;
    try {
        const decryptedChunks = encryptedChunksBuffer.map(chunk => {
            const dec = CryptoJS.AES.decrypt(chunk, key);
            return convertWordArrayToUint8Array(dec);
        });
        const blob = new Blob(decryptedChunks, { type: metadata.filetype });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = "SECURE_" + metadata.filename;
        a.click();
    } catch (e) { alert("Clave incorrecta"); }
};

function convertWordArrayToUint8Array(wordArray) {
    const l = wordArray.sigBytes;
    const words = wordArray.words;
    const result = new Uint8Array(l);
    for (let i = 0; i < l; i++) {
        result[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    }
    return result;
}