# 🛡️ Secure P2P Transfer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![WebRTC](https://img.shields.io/badge/Tech-WebRTC-blue)](https://webrtc.org/)
[![CryptoJS](https://img.shields.io/badge/Security-AES--256-green)](https://cryptojs.gitbook.io/docs/)

Una aplicación web de transferencia de archivos punto a punto (P2P) que prioriza la **privacidad extrema** y la **simplicidad**. Los archivos se envían directamente entre dispositivos mediante canales de datos en tiempo real, sin pasar por servidores de almacenamiento, y protegidos por cifrado AES-256.

🚀 **Demo en vivo:** [https://zunraz.github.io/transfer-webp2p/](https://zunraz.github.io/transfer-webp2p/)

---

## ✨ Características Principales

- **Conexión Directa (P2P):** Utiliza la tecnología **WebRTC** para establecer túneles de datos directos entre navegadores, reduciendo la latencia y eliminando intermediarios.
- **Cifrado End-to-End (E2EE):** Implementa cifrado **AES-256** en el lado del cliente. El emisor cifra los datos con una clave secreta; el receptor solo puede acceder al contenido si posee dicha clave.
- **Privacidad "Zero-Knowledge":** Ni el servidor de señalización ni terceros pueden interceptar el contenido. La seguridad reside en el navegador del usuario.
- **IDs Amigables:** Sistema de emparejamiento mediante identificadores cortos (5 caracteres) para facilitar la conexión rápida.
- **Control de Integridad:** Bloqueo inteligente de descarga que asegura que el archivo esté 100% recibido antes de permitir la desencriptación.

## 🛠️ Desafíos Técnicos Resueltos

Este proyecto demuestra competencias avanzadas en ingeniería de software web:

1. **Gestión de Memoria (Chunking):** Implementación de la API `File.slice()` para fragmentar archivos en trozos de **32KB**, permitiendo la transferencia de archivos de gran tamaño sin saturar la memoria RAM del navegador.
2. **Buffer de Recepción:** Lógica asíncrona para reconstruir el archivo a partir de fragmentos desordenados o encriptados, garantizando la integridad de los datos finales.
3. **Seguridad Activa:** Validación de la clave de cifrado mediante el análisis de los bloques de datos resultantes, evitando la generación de archivos corruptos ante claves incorrectas.

## 📦 Stack Tecnológico

* **PeerJS:** Orquestación de la conexión WebRTC y señalización P2P.
* **CryptoJS:** Implementación del estándar de cifrado AES (Advanced Encryption Standard).
* **JavaScript (ES6+):** Procesamiento de flujos de datos binarios y manejo de eventos.
* **CSS3:** Interfaz responsiva con feedback visual de estados.

## 🚀 Guía de Uso

1. **Establecer Conexión:** Abre la URL en dos navegadores. Copia el ID corto del receptor y pégalo en el emisor.
2. **Definir Clave:** Ambos usuarios deben usar la misma clave secreta (acordada previamente por un canal seguro).
3. **Enviar:** El emisor selecciona el archivo y pulsa "Encriptar y Enviar".
4. **Recibir:** Una vez el progreso llegue al 100%, el botón de descarga se habilitará. Introduce la clave y guarda tu archivo.

---

## 👨‍💻 Autor

**Zunraz** - [GitHub Profile](https://github.com/zunraz)

*Proyecto desarrollado para demostrar el uso de tecnologías en tiempo real y seguridad defensiva en entornos web.*
