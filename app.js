// --- CONFIGURACIÓN DE IDs CORTOS ---
function generateShortId() {
    return Math.random().toString(36).substring(2, 7).toUpperCase();
}

const myShortId = generateShortId();
const peer = new Peer(myShortId); // Forzamos el uso del ID corto generado

let conn = null;
let encryptedChunksBuffer = []; 
let metadata = null;

// 1. Al abrirse, mostrar ID corto
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
    const peerId = document.getElementById('peer-id').value.toUpperCase(); // Aseguramos mayúsculas
    if (!peerId) return alert("Introduce un ID");
    conn = peer.connect(peerId);
    confirmarConexion();
};

function confirmarConexion() {
    conn.on('open', () => {
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
            
            // UI: Preparar vista receptor
            document.getElementById('role-emitter').style.display = 'none';
            document.getElementById('role-receiver').style.display = 'block';
            document.getElementById('file-info').innerText = `${data.filename} (${(data.size/1024).toFixed(1)} KB)`;
            
            // Bloquear botón hasta que termine la transferencia
            const btn = document.getElementById('decrypt-btn');
            btn.disabled = true;
            btn.innerText = "Recibiendo datos...";
        } 
        else if (data.type === 'chunk') {
            encryptedChunksBuffer[data.index] = data.data;
            
            // Calculamos progreso real basado en trozos no vacíos
            const receivedCount = encryptedChunksBuffer.filter(x => x).length;
            const progress = (receivedCount / metadata.totalChunks) * 100;
            
            document.getElementById('progress-bar').style.width = progress + "%";
            document.getElementById('percentage').innerText = `Recibido: ${Math.round(progress)}%`;

            // SI LA DESCARGA ESTÁ COMPLETA (100%)
            if (receivedCount === metadata.totalChunks) {
                const btn = document.getElementById('decrypt-btn');
                btn.disabled = false;
                btn.innerText = "Descargar Archivo Seguro";
            }
        }
    });
}

// Lógica de Envío
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
    alert("¡Archivo enviado con éxito!");
};

// Lógica de Desencriptación y Descarga
document.getElementById('decrypt-btn').onclick = () => {
    const key = document.getElementById('receive-key').value;
    if (!key) return alert("Por favor, introduce la clave");

    try {
        const decryptedChunks = encryptedChunksBuffer.map(chunk => {
            const dec = CryptoJS.AES.decrypt(chunk, key);
            const uint8 = convertWordArrayToUint8Array(dec);
            
            // Verificación básica de clave correcta
            if (uint8.length === 0 && metadata.size > 0) throw new Error("Key fail");
            
            return uint8;
        });

        const blob = new Blob(decryptedChunks, { type: metadata.filetype });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = "SECURE_" + metadata.filename;
        a.click();
        
    } catch (e) { 
        alert("Error: La clave es incorrecta. No se puede desencriptar el archivo."); 
        console.error("Error de desencriptación:", e);
    }
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
