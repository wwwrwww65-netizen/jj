document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const numberDisplay = document.getElementById('current-number');
    const messagesContainer = document.getElementById('messages-container');
    const emptyState = document.getElementById('empty-state');

    // قائمة بأرقام حقيقية موجودة مسبقاً
    const realNumbers = [
        "12132143245", "19142654852", "17162495684", "12018556622",
        "447700900077", "447451277972", "33644637771", "46731234567" 
    ];

    let activeNumber = realNumbers[0];

    // رسائل محاكاة لإبقاء الواجهة حية وجميلة
    const simulatedMessages = [
        { sender: "Google", content: "G-482912 is your Google verification code." },
        { sender: "WhatsApp", content: "Your WhatsApp code is: 182-991" },
        { sender: "Telegram", content: "Telegram code: 48192" },
        { sender: "Microsoft", content: "Use 582191 to verify your Microsoft account." },
        { sender: "Facebook", content: "88219 is your Facebook confirmation code." },
        { sender: "Snapchat", content: "Snapchat Code: 119283. Happy Snapping!" },
        { sender: "Apple", content: "Your Apple ID verification code is: 482910." }
    ];

    function setNewNumber(numStr) {
        activeNumber = numStr;
        numberDisplay.textContent = '+' + numStr;
        
        // مسح الرسائل السابقة
        messagesContainer.innerHTML = '';
        
        // رسالة ترحيبية
        messagesContainer.innerHTML = `
            <div class="empty-state" style="color: var(--primary);">
                <i class="fas fa-robot"></i>
                <p>الرقم جاهز الآن! (وضع المحاكاة نشط)</p>
                <a href="https://receive-smss.com/sms/${activeNumber}/" target="_blank" class="btn btn-primary" style="margin-top: 15px; text-decoration: none; display: inline-block;">
                    <i class="fas fa-external-link-alt"></i> عرض الرسائل الحقيقية لهذا الرقم
                </a>
            </div>
        `;
    }

    function simulateNewMessage() {
        const msg = simulatedMessages[Math.floor(Math.random() * simulatedMessages.length)];
        const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric" });
        
        const highlightedContent = msg.content.replace(/(\d{4,6})/g, '<span class="verification-code">$1</span>');
        
        const msgHtml = `
            <div class="message-card" style="animation: slideIn 0.5s ease-out;">
                <div class="message-meta">
                    <span class="sender"><i class="fas fa-paper-plane"></i> ${msg.sender} (محاكاة)</span>
                    <span class="time">${time}</span>
                </div>
                <div class="message-content">${highlightedContent}</div>
            </div>
        `;
        
        messagesContainer.insertAdjacentHTML('afterbegin', msgHtml);
        
        // إزالة الحالات الفارغة
        const emptyEl = messagesContainer.querySelector('.empty-state');
        if (emptyEl) {
            // احتفظ بالزر فقط في الأسفل إن شئت، لكن دعنا نزيلها للتبسيط
        }
    }

    generateBtn.addEventListener('click', () => {
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري توليد رقم...';
        
        setTimeout(() => {
            const randomNum = realNumbers[Math.floor(Math.random() * realNumbers.length)];
            setNewNumber(randomNum);
            
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i class="fas fa-random"></i> توليد رقم عشوائي';
        }, 1000);
    });

    // البداية
    setNewNumber(activeNumber);

    // إضافة رسالة وهمية كل 15 ثانية لجعل الواجهة تبدو حية
    setInterval(() => {
        if (Math.random() > 0.4) {
            simulateNewMessage();
        }
    }, 15000);
});
