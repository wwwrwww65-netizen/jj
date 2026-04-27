document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const numberDisplay = document.getElementById('current-number');
    const messagesContainer = document.getElementById('messages-container');
    const emptyState = document.getElementById('empty-state');

    // قائمة احتياطية ضخمة في حال فشل جلب الأرقام (لتجنب تعليق البوت)
    const fallbackNumbers = [
        "12132143245", "19142654852", "17162495684", "12018556622",
        "447700900077", "447451277972", "33644637771", "46731234567" // Includes UK, FR, SE numbers
    ];

    let availableNumbers = [];
    let activeNumber = "";

    // دالة مساعدة لعمل fetch مع مهلة زمنية (Timeout) لتجنب التعليق
    async function fetchWithTimeout(resource, options = {}) {
        const { timeout = 8000 } = options; // 8 ثواني كحد أقصى
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        const response = await fetch(resource, {
            ...options,
            signal: controller.signal  
        });
        clearTimeout(id);
        return response;
    }

    async function refreshNumbersList() {
        try {
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent('https://receive-smss.com/')}&ts=${Date.now()}`;
            const response = await fetchWithTimeout(proxyUrl, { timeout: 10000 });
            const data = await response.json();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(data.contents, 'text/html');
            
            const numberElements = doc.querySelectorAll('.number-boxes-item-m-number');
            const scraped = Array.from(numberElements).map(el => {
                const fullNum = el.innerText.trim().replace('+', '');
                return fullNum;
            });

            if (scraped.length > 0) {
                availableNumbers = scraped;
            } else {
                throw new Error("No numbers found in HTML");
            }
        } catch (error) {
            console.warn("فشل جلب أرقام جديدة، جاري استخدام القائمة الاحتياطية:", error);
            availableNumbers = fallbackNumbers; // استخدام القائمة الاحتياطية
        }

        if (!activeNumber) {
            setNewNumber(availableNumbers[0]);
        }
    }

    function setNewNumber(numStr) {
        activeNumber = numStr;
        numberDisplay.textContent = '+' + numStr;
        messagesContainer.innerHTML = '<div class="empty-state"><i class="fas fa-spinner fa-spin"></i> جاري الاتصال بالرقم...</div>';
        fetchRealSMS();
    }

    async function fetchRealSMS() {
        if (!activeNumber) return;
        try {
            const targetUrl = `https://receive-smss.com/sms/${activeNumber}/`;
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}&ts=${Date.now()}`;
            
            const response = await fetchWithTimeout(proxyUrl, { timeout: 10000 });
            const data = await response.json();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(data.contents, 'text/html');
            const rows = doc.querySelectorAll('table tbody tr');
            
            if (rows.length > 0) {
                messagesContainer.innerHTML = '';
                let hasValidMessages = false;

                rows.forEach((row, index) => {
                    if (index > 15) return;
                    const sender = row.cells[0]?.innerText.trim() || "Unknown";
                    const content = row.cells[2]?.innerText.trim() || "";
                    const time = row.cells[1]?.innerText.trim() || "Just now";
                    
                    if (content) {
                        hasValidMessages = true;
                        const highlightedContent = content.replace(/(\d{4,6})/g, '<span class="verification-code">$1</span>');
                        const msgHtml = `
                            <div class="message-card">
                                <div class="message-meta">
                                    <span class="sender"><i class="fas fa-paper-plane"></i> ${sender}</span>
                                    <span class="time">${time}</span>
                                </div>
                                <div class="message-content">${highlightedContent}</div>
                            </div>
                        `;
                        messagesContainer.insertAdjacentHTML('beforeend', msgHtml);
                    }
                });

                if (!hasValidMessages) {
                    messagesContainer.innerHTML = '<div class="empty-state"><i class="fas fa-envelope-open"></i> لا توجد رسائل حالية لهذا الرقم.</div>';
                }
            } else {
                messagesContainer.innerHTML = '<div class="empty-state"><i class="fas fa-envelope-open"></i> لا توجد رسائل حالية لهذا الرقم.</div>';
            }
        } catch (error) {
            console.error("خطأ في جلب الرسائل:", error);
            messagesContainer.innerHTML = `
                <div class="empty-state" style="color: #ffaa00;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>تعذر الاتصال بالخادم حالياً. قد يكون الرقم محظوراً أو الموقع المضيف يعاني من ضغط.</p>
                </div>`;
        }
    }

    generateBtn.addEventListener('click', async () => {
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري البحث...';
        
        // المحاولة لجلب أرقام حديثة، وإن فشلت سيستخدم الاحتياطية بسرعة
        if (availableNumbers.length === 0 || Math.random() > 0.5) {
            await refreshNumbersList();
        }
        
        const randomNum = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
        setNewNumber(randomNum);
        
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-random"></i> توليد رقم عشوائي';
    });

    // البداية
    refreshNumbersList();
    setInterval(fetchRealSMS, 20000);
});
