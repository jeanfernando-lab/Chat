document.addEventListener("DOMContentLoaded", () => {
    
    // 1. ELEMAN POU PAJ YO
    const authScreen = document.getElementById('authScreen');
    const mainApp = document.getElementById('mainApp');
    
    // Eleman Koneksyon
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const idInput = document.getElementById('idInput');
    
    // Eleman Chat
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const messagesArea = document.getElementById('messagesArea');
    const toggleStickers = document.getElementById('toggleStickers');
    const stickersPanel = document.getElementById('stickersPanel');
    const imageUpload = document.getElementById('imageUpload');
    const recordVoiceBtn = document.getElementById('recordVoiceBtn');

    // Son
    const soundMsgSent = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');

    // 2. LOJIK KONEKSYON / DEKONEKSYON
    loginBtn.addEventListener('click', () => {
        if (idInput.value.trim() !== "") {
            // Kache paj login
            authScreen.classList.remove('active');
            
            // Afiche paj chat la
            mainApp.classList.add('active');
        } else {
            alert("Tanpri antre yon ID pou konekte.");
        }
    });

    logoutBtn.addEventListener('click', () => {
        // Kache chat la
        mainApp.classList.remove('active');
        
        // Retounen nan login
        authScreen.classList.add('active');
        idInput.value = ""; // Netwaye input la
    });

    // 3. FONKSYON POU AFECHE MESAJ
    function appendMessage(content, type) {
        let div = document.createElement('div');
        div.className = `message-bubble msg-${type}`;
        div.innerHTML = content;
        messagesArea.appendChild(div);
        messagesArea.scrollTop = messagesArea.scrollHeight;
        
        soundMsgSent.currentTime = 0;
        soundMsgSent.play().catch(e => console.log("Otomatik son bloke"));
    }

    // 4. VOYE MESAJ TÈKS
    sendBtn.addEventListener('click', () => {
        let text = messageInput.value.trim();
        if (text !== "") {
            appendMessage(text, 'sent');
            messageInput.value = "";
        }
    });

    // Pèmèt ekri ak bouton "Enter" sou klavye
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendBtn.click();
        }
    });

    // 5. LOJIK STICKERS
    toggleStickers.addEventListener('click', () => {
        stickersPanel.classList.toggle('active');
    });

    document.querySelectorAll('.sticker-item').forEach(img => {
        img.addEventListener('click', (e) => {
            let stickerUrl = e.target.src;
            appendMessage(`<img src="${stickerUrl}" style="width:100px; border-radius:10px;">`, 'sent');
            stickersPanel.classList.remove('active');
        });
    });

    // 6. VOYE IMAJ (Simulation Lokal)
    imageUpload.addEventListener('change', (e) => {
        let file = e.target.files[0];
        if (file) {
            let localUrl = URL.createObjectURL(file);
            appendMessage(`<img src="${localUrl}" style="max-width:200px; border-radius:12px;">`, 'sent');
        }
    });

    // 7. LOJIK VWA (Enregistrement Audio Lokal)
    let isRecording = false;
    let mediaRecorder;
    let audioChunks = [];

    recordVoiceBtn.addEventListener('click', async () => {
        if (!isRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                
                mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    audioChunks = [];
                    const audioUrl = URL.createObjectURL(audioBlob);
                    
                    appendMessage(`<audio controls src="${audioUrl}" style="max-width:200px; height:40px;"></audio>`, 'sent');
                };

                mediaRecorder.start();
                isRecording = true;
                recordVoiceBtn.style.color = "#ff4d4d"; // Wouj pou anrejistreman
                recordVoiceBtn.innerHTML = '<i class="fa-solid fa-stop"></i>';
            } catch (err) {
                alert("Ou dwe bay aplikasyon an pèmisyon pou itilize mikwofòn ou.");
            }
        } else {
            mediaRecorder.stop();
            isRecording = false;
            recordVoiceBtn.style.color = "#a0a5b5"; // Retounen nòmal
            recordVoiceBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
        }
    });
});
