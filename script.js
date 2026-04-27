document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const numberDisplay = document.getElementById('current-number');
    const messagesContainer = document.getElementById('messages-container');
    const emptyState = document.getElementById('empty-state');

    // List of active public numbers from receive-smss.com (Example numbers)
    const realNumbers = [
        { num: "12132143245", display: "+1 (213) 214-3245" },
        { num: "19142654852", display: "+1 (914) 265-4852" },
        { num: "17162495684", display: "+1 (716) 249-5684" },
        { num: "12018556622", display: "+1 (201) 855-6622" }
    ];

    let activeNumberObj = realNumbers[0];

    function addMessage(sender, content, time) {
        emptyState.classList.add('hidden');
        const highlightedContent = content.replace(/(\d{4,6})/g, '<span class="verification-code">$1</span>');
        
        const msgHtml = `
            <div class="message-card">
                <div class="message-meta">
                    <span class="sender"><i class="fas fa-paper-plane"></i> ${sender}</span>
                    <span class="time">${time}</span>
                </div>
                <div class="message-content">
                    ${highlightedContent}
                </div>
            </div>
        `;
        messagesContainer.insertAdjacentHTML('beforeend', msgHtml);
    }

    async function fetchRealSMS() {
        try {
            const targetUrl = `https://receive-smss.com/sms/${activeNumberObj.num}/`;
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}&timestamp=${Date.now()}`;
            
            const response = await fetch(proxyUrl);
            const data = await response.json();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(data.contents, 'text/html');
            
            const rows = doc.querySelectorAll('table tbody tr');
            
            if (rows.length > 0) {
                messagesContainer.innerHTML = '';
                rows.forEach((row, index) => {
                    if (index > 15) return; // Limit to latest 15 messages
                    const sender = row.cells[0]?.innerText.trim() || "Unknown";
                    const content = row.cells[2]?.innerText.trim() || "";
                    const time = row.cells[1]?.innerText.trim() || "Just now";
                    
                    if (content) addMessage(sender, content, time);
                });
            } else {
                messagesContainer.innerHTML = '<div class="empty-state">لا توجد رسائل حالية لهذا الرقم.</div>';
            }
        } catch (error) {
            console.error("Error fetching SMS:", error);
            // Fallback to simulation or error message
        }
    }

    // Initial Load
    numberDisplay.textContent = activeNumberObj.display;
    fetchRealSMS();

    generateBtn.addEventListener('click', () => {
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحويل...';
        
        activeNumberObj = realNumbers[Math.floor(Math.random() * realNumbers.length)];
        numberDisplay.textContent = activeNumberObj.display;
        
        messagesContainer.innerHTML = '<div class="empty-state">جاري جلب الرسائل الحقيقية...</div>';
        
        setTimeout(() => {
            fetchRealSMS();
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i class="fas fa-random"></i> توليد رقم عشوائي';
        }, 1000);
    });

    // Auto refresh every 20 seconds
    setInterval(fetchRealSMS, 20000);
});
