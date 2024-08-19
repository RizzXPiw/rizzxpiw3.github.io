document.addEventListener("DOMContentLoaded", function () {
    const sendButton = document.getElementById('send-button');
    const inputText = document.getElementById('inputText');
    const menuButton = document.getElementById('menu-button');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const themeToggle = document.getElementById('theme-toggle');
    const responseContainer = document.getElementById('response');
    const inputContainer = document.getElementById('input-container');
    const uploadButton = document.getElementById('upload-button');
    const photoUpload = document.getElementById('photoUpload');
    const photoPreviewContainer = document.createElement('div');
    photoPreviewContainer.id = 'photoPreviewContainer';
    inputContainer.appendChild(photoPreviewContainer);

    let photoDataURL = '';
    let messageHistory = [];

    const maxTextareaHeight = 200; // Maximum height in pixels
    const initialTextareaHeight = 40; // Initial height in pixels

    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const hari = today.toLocaleDateString('id-ID', { weekday: 'long' });
    const tanggal2 = today.toLocaleDateString('id-ID', options);
    const jam2 = today.toLocaleTimeString('id-ID');

    const assistantPrompt = {
        role: "assistant",
        content: `Halo, Nama saya *ZheeRexx*, asisten virtual yang dibuat oleh *RizzPiw*. Saya siap membantu Anda ... Hari ini adalah ${hari}, tanggal ${tanggal2}, dan saat ini jam ${jam2}. Mari kita mulai petualangan pengetahuan kita!`
    };

    inputText.addEventListener('input', function () {
        inputText.style.height = 'auto';
        const newHeight = Math.min(inputText.scrollHeight, maxTextareaHeight);
        inputText.style.height = `${newHeight}px`;
        inputText.style.overflowY = newHeight >= maxTextareaHeight ? 'auto' : 'hidden';
        sendButton.disabled = inputText.value.trim() === '' && !photoDataURL;
    });

    sendButton.disabled = true;

    sendButton.addEventListener('click', function () {
        const text = inputText.value.trim();
        if (text !== '' || photoDataURL) {
            submitText();
        }
    });

    menuButton.addEventListener('click', function () {
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });

    themeToggle.addEventListener('click', function () {
        document.body.classList.toggle('dark-mode');
        const icon = themeToggle.querySelector('i');
        const text = themeToggle.querySelector('span');

        if (document.body.classList.contains('dark-mode')) {
            icon.classList.replace('fa-sun', 'fa-moon');
            text.innerText = 'Bright Mode';
        } else {
            icon.classList.replace('fa-moon', 'fa-sun');
            text.innerText = 'Dark Mode';
        }

        const messages = document.querySelectorAll('.message, .answer, .code-answer, .label, .time-label');
        messages.forEach(msg => msg.classList.toggle('dark-mode'));
    });

    uploadButton.addEventListener('click', function () {
        photoUpload.click();
    });

    photoUpload.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                photoDataURL = e.target.result;
                const photoPreview = document.createElement('img');
                photoPreview.src = photoDataURL;
                photoPreview.alt = 'Foto yang diunggah';
                photoPreview.style.width = '50px';
                photoPreview.style.height = '50px';
                photoPreview.style.margin = '5px';
                photoPreviewContainer.innerHTML = '';
                photoPreviewContainer.appendChild(photoPreview);
                sendButton.disabled = inputText.value.trim() === '' && !photoDataURL;
            };
            reader.readAsDataURL(file);
        }
    });

    async function submitText() {
        var inputTextValue = inputText.value;
        if (inputTextValue.trim() !== '' || photoDataURL) {
            const timeLabel = new Date().toLocaleTimeString('id-ID');
            const userMessageContainer = document.createElement('div');
            userMessageContainer.className = 'message-container';
            
            const userLabel = document.createElement('div');
            userLabel.className = 'label';
            userLabel.innerText = 'Anda';
            userMessageContainer.appendChild(userLabel);

            const messageDiv = document.createElement('div');
            messageDiv.className = 'message user-message';
            messageDiv.innerText = inputTextValue;
            userMessageContainer.appendChild(messageDiv);

            if (photoDataURL) {
                const photoImg = document.createElement('img');
                photoImg.src = photoDataURL;
                photoImg.alt = 'Foto yang diunggah';
                photoImg.style.width = '50px';
                photoImg.style.height = '50px';
                userMessageContainer.appendChild(photoImg);
                photoDataURL = ''; 
                photoPreviewContainer.innerHTML = ''; 
            }

            const timeDiv = document.createElement('div');
            timeDiv.className = 'time-label';
            timeDiv.innerText = timeLabel;
            userMessageContainer.appendChild(timeDiv);
            responseContainer.appendChild(userMessageContainer);
            inputText.value = '';
            inputText.style.height = initialTextareaHeight + 'px';
            sendButton.disabled = true;

            messageHistory.push({ role: "user", content: inputTextValue });
            displayLoader();
            await sendMessage(inputTextValue, timeLabel);
        }
    }

    function displayLoader() {
        const loader = document.createElement('div');
        loader.className = 'searching';
        loader.id = 'loader';
        loader.innerHTML = '•';
        responseContainer.appendChild(loader);
        loader.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

    async function sendMessage(question, userTime) {
        try {
            if (messageHistory.length === 0 || messageHistory[0].role !== "assistant") {
                messageHistory.unshift(assistantPrompt);
            }

            const headers = {
                "Accept": "*/*",
                "Accept-Language": "id-ID,en;q=0.5",
                "Content-Type": "application/json",
                "Origin": "https://www.blackbox.ai",
            };

            const data = {
                messages: [{ role: 'user', content: question }],
                userId: "97944128-08d4-4d43-884b-7ea4e5d52b40",
                maxTokens: 1024,
                webSearchMode: false,
            };

            const blackboxResponse = await fetch('https://www.blackbox.ai/api/chat', {
                method: "POST",
                headers,
                body: JSON.stringify(data)
            });

            if (!blackboxResponse.ok) {
                throw new Error('Response was not ok');
            }

            let blackboxData = await blackboxResponse.text();
            blackboxData = blackboxData.replace(/\$\@.*?\$\@|\*\*|\$/g, '');
            displayAnswer(blackboxData, userTime);
            messageHistory.push({ role: "assistant", content: blackboxData });

        } catch (error) {
            console.error('Error:', error);
            displayAnswer(`Maaf, terjadi kesalahan dalam mengambil jawaban. ${error.message}`, userTime);
        }
    }

    function displayAnswer(answer, answerTime) {
        const loader = document.getElementById('loader');
        if (loader) loader.remove();

        const answerContainer = document.createElement('div');
        answerContainer.className = 'answer-container';

        const zheerexxLabel = document.createElement('div');
        zheerexxLabel.className = 'label';
        zheerexxLabel.innerText = 'ZheeRexx';
        answerContainer.appendChild(zheerexxLabel);

        const answerBox = document.createElement('div');
        answerBox.className = 'answer visible';
        answerBox.style.marginBottom = '5px';

        // Pattern matching for code and bold text
        const codePattern = /```(\w+)?\n([\s\S]*?)```/g;
        const boldPattern = /\*\*(.*?)\*\*/g;

        let lastIndex = 0;
        let match;

        while ((match = codePattern.exec(answer)) !== null) {
            if (match.index > lastIndex) {
                let textBeforeCode = answer.substring(lastIndex, match.index);
                textBeforeCode = textBeforeCode.replace(boldPattern, '<strong>$1</strong>');
                answerBox.innerHTML += textBeforeCode.replace(/\n/g, '<br>');
            }

            const lang = match[1] || '';
            const codeContent = match[2];
            const codeContainer = createCodeBlock(lang, codeContent);

            answerBox.appendChild(codeContainer);
            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < answer.length) {
            let textAfterCode = answer.substring(lastIndex);
            textAfterCode = textAfterCode.replace(boldPattern, '<strong>$1</strong>');
            answerBox.innerHTML += textAfterCode.replace(/\n/g, '<br>');
        }

        answerContainer.appendChild(answerBox);

        const timeDiv = document.createElement('div');
        timeDiv.className = 'time-label';
        timeDiv.innerText = answerTime;
        answerContainer.appendChild(timeDiv);

        responseContainer.appendChild(answerContainer);
        answerContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

    function createCodeBlock(lang, codeContent) {
        const codeContainer = document.createElement('div');
        codeContainer.className = 'code-answer';

        const codeHeader = document.createElement('div');
        codeHeader.className = 'code-header';

        const codeType = document.createElement('span');
        codeType.className = 'code-type';
        codeType.innerHTML = `<strong>${lang.toUpperCase()}</strong>`;

        const copyButton = document.createElement('button');
        copyButton.innerHTML = '<strong><i class="far fa-copy"></i> Salin Kode</strong>';
        copyButton.className = 'copy-button';
        copyButton.title = 'Salin Kode';

        copyButton.addEventListener('click', async function () {
            try {
                await navigator.clipboard.writeText(codeContent);
                copyButton.innerHTML = '<strong><i class="fas fa-check"></i> Tersalin</strong>';
                setTimeout(() => {
                    copyButton.innerHTML = '<strong><i class="far fa-copy"></i> Salin Kode</strong>';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
        });

        codeHeader.appendChild(codeType);
        codeHeader.appendChild(copyButton);
        codeContainer.appendChild(codeHeader);

        const codeBlock = document.createElement('pre');
        const code = document.createElement('code');
        code.className = lang ? `language-${lang}` : '';
        code.textContent = codeContent;
        codeBlock.appendChild(code);
        codeContainer.appendChild(codeBlock);

        return codeContainer;
    }

    const scrollButton = document.createElement('button');
    scrollButton.innerHTML = '<i class="fas fa-arrow-down"></i>';
    scrollButton.style.position = 'fixed';
    scrollButton.style.bottom = '10px';
    scrollButton.style.right = '10px';
    scrollButton.style.display = 'none';
    scrollButton.className = 'scroll-button';
    scrollButton.title = 'Scroll ke bawah';
    document.body.appendChild(scrollButton);

    scrollButton.addEventListener('click', function () {
        responseContainer.scrollTo({
            top: responseContainer.scrollHeight,
            behavior: 'smooth'
        });
    });

    function updateScrollButtonVisibility() {
        scrollButton.style.display = responseContainer.scrollTop < responseContainer.scrollHeight - responseContainer.clientHeight ? 'block' : 'none';
    }

    responseContainer.addEventListener('scroll', updateScrollButtonVisibility);
});