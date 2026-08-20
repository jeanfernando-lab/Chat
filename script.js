// === 1. Jesyon Son Pwofesyonèl yo ===
// Mwen mete lyen son notifikasyon estanda, ou ka chanje URL yo si w genyen pa w.
const soundMsgSent = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
const soundMsgReceived = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');

function playSendSound() {
    soundMsgSent.currentTime = 0;
    soundMsgSent.play().catch(e => console.log("Audio play blocked by browser"));
}

// === 2. Jesyon UI (Stickers ak Bouton) ===
const stickersPanel = document.getElementById('stickersPanel');
const toggleStickersBtn = document.getElementById('toggleStickers');
const messagesArea = document.getElementById('messagesArea');
const sendBtn = document.getElementById('sendBtn');
const messageInput = document.getElementById('messageInput');

toggleStickersBtn.addEventListener('click', () => {
    stickersPanel.classList.toggle('active');
});

// Lè itilizatè a chwazi yon sticker
document.querySelectorAll('.sticker-item').forEach(img => {
    img.addEventListener('click', (e) => {
        let stickerUrl = e.target.src;
        // Voye sticker a tankou yon imaj
        appendMessage(`<img src="${stickerUrl}" style="width:100px; border-radius:10px;">`, 'sent');
        stickersPanel.classList.remove('active');
        playSendSound();
        // ISIT LA: Rele fonksyon Firebase ou a pou voye URL la nan baz done a
    });
});

// Voye mesaj Tèks
sendBtn.addEventListener('click', () => {
    let txt = messageInput.value.trim();
    if (txt !== '') {
        appendMessage(txt, 'sent');
        messageInput.value = '';
        playSendSound();
        // ISIT LA: Sove mesaj la nan Firebase Firestore/Realtime DB
    }
});

function appendMessage(content, type) {
    let div = document.createElement('div');
    div.className = `message-bubble msg-${type}`;
    div.innerHTML = content;
    messagesArea.appendChild(div);
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

// === 3. Firebase Storage: Voye Imaj ===
const imageUpload = document.getElementById('imageUpload');
imageUpload.addEventListener('change', async (e) => {
    let file = e.target.files[0];
    if(!file) return;

    // Afiche loading...
    appendMessage("<em>Ap voye foto a...</em>", 'sent');

    /* KÒD FIREBASE POU VOYE IMAJ LA (Dekòmante epi mete konfigirasyon w lan):
    try {
        const storageRef = firebase.storage().ref();
        const fileRef = storageRef.child('images/' + Date.now() + '_' + file.name);
        await fileRef.put(file);
        const downloadUrl = await fileRef.getDownloadURL();
        
        // Afiche foto a nan chat la
        appendMessage(`<img src="${downloadUrl}" style="max-width:200px; border-radius:12px;">`, 'sent');
        playSendSound();
    } catch(error) {
        console.error("Erè sou Firebase:", error);
    }
    */
   
   // Tès lokal (anvan Firebase):
   let localUrl = URL.createObjectURL(file);
   appendMessage(`<img src="${localUrl}" style="max-width:200px; border-radius:12px;">`, 'sent');
   playSendSound();
});

// === 4. Firebase Storage: Voye Vwa (Audio) ===
let mediaRecorder;
let audioChunks = [];
const recordVoiceBtn = document.getElementById('recordVoiceBtn');
let isRecording = false;

recordVoiceBtn.addEventListener('click', async () => {
    if (!isRecording) {
        // Kòmanse Anrejistreman
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            
            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                audioChunks = [];
                
                /* KÒD FIREBASE POU VOYE VWA A:
                const storageRef = firebase.storage().ref();
                const audioRef = storageRef.child('audios/' + Date.now() + '.webm');
                await audioRef.put(audioBlob);
                const audioUrl = await audioRef.getDownloadURL();
                
                appendMessage(`<audio controls src="${audioUrl}" style="max-width:200px; height:40px;"></audio>`, 'sent');
                playSendSound();
                */

                // Tès Lokal:
                const audioUrl = URL.createObjectURL(audioBlob);
                appendMessage(`<audio controls src="${audioUrl}" style="max-width:200px; height:40px;"></audio>`, 'sent');
                playSendSound();
            };

            mediaRecorder.start();
            isRecording = true;
            recordVoiceBtn.style.color = "#ff4d4d"; // Vin wouj pou montre l ap anrejistre
            recordVoiceBtn.innerHTML = '<i class="fa-solid fa-stop"></i>';
        } catch (err) {
            console.error("Ou pa bay aksè ak mikwo a", err);
        }
    } else {
        // Kanpe Anrejistreman
        mediaRecorder.stop();
        isRecording = false;
        recordVoiceBtn.style.color = "#a0a5b5"; // Retounen nan koulè nòmal la
        recordVoiceBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
    }
});
