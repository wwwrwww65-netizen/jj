document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const numberDisplay = document.getElementById('current-number');
    const messagesContainer = document.getElementById('messages-container');
    const emptyState = document.getElementById('empty-state');

    let availableNumbers = [];
    let activeNumber = "";

    async function refreshNumbersList() {
        try {
            // Fetch the homepage to get the latest active numbers
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent('https://receive-smss.com/')}&ts=${Date.now()}`;
            const response = await fetch(proxyUrl);
            const data = await response.json();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(data.contents, 'text/html');
            
            // Scrape numbers from the list
            const numberElements = doc.querySelectorAll('.number-boxes-item-m-number');
            const scraped = Array.from(numberElements).map(el => {
                const fullNum = el.innerText.trim().replace('+', '');
                return {
                    num: fullNum,
                    display: '+' + fullNum
                };
            });

            if (scraped.length > 0) {
                availableNumbers = scraped;
                if (!activeNumber) {
                    setNewNumber(availableNumbers[0]);
                }
            }
        } catch (error) {
            console.error("Error fetching numbers list:", error);
        }
    }

    function setNewNumber(numberObj) {
        activeNumber = numberObj.num;
        numberDisplay.textContent = numberObj.display;
        messagesContainer.innerHTML = '<div class="empty-state">جاري جلب الرسائل الحقيقية لهذا الرقم...</div>';
        fetchRealSMS();
    }

    async function fetchRealSMS() {
        if (!activeNumber) return;
        try {
            const targetUrl = `https://receive-smss.com/sms/${activeNumber}/`;
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}&ts=${Date.now()}`;
            
            const response = await fetch(proxyUrl);
            const data = await response.json();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(data.contents, 'text/html');
            
            const rows = doc.querySelectorAll('table tbody tr');
            
            if (rows.length > 0) {
                messagesContainer.innerHTML = '';
                rows.forEach((row, index) => {
                    if (index > 15) return;
                    const sender = row.cells[0]?.innerText.trim() || "Unknown";
                    const content = row.cells[2]?.innerText.trim() || "";
                    const time = row.cells[1]?.innerText.trim() || "Just now";
                    
                    if (content) {
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
            } else {
                messagesContainer.innerHTML = '<div class="empty-state">لا توجد رسائل حالية لهذا الرقم.</div>';
            }
        } catch (error) {
            console.error("Error fetching SMS:", error);
        }
    }

    generateBtn.addEventListener('click', async () => {
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري البحث...';
        
        // Refresh list to get fresh ones
        await refreshNumbersList();
        
        if (availableNumbers.length > 0) {
            const randomNum = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
            setNewNumber(randomNum);
        }
        
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-random"></i> توليد رقم عشوائي';
    });

    // Initial Load
    refreshNumbersList();

    // Auto-refresh messages every 20 seconds
    setInterval(fetchRealSMS, 20000);
});
