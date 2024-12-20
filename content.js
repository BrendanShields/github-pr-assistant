class GitHubPRAssistant {
    constructor() {
        this.init();
        this.observeURLChanges();
    }

    observeURLChanges() {
        let lastUrl = location.href;
        new MutationObserver(() => {
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                if (this.isPRPage()) this.init();
            }
        }).observe(document, { subtree: true, childList: true });
    }

    isPRPage() {
        return window.location.pathname.includes('/pull/');
    }

    async init() {
        if (!this.isPRPage()) return;
        this.injectUI();
        this.setupDraggable();
        this.attachEventListeners();
    }

    injectUI() {
        if (document.querySelector('.pr-assistant-dock')) return;

        const dock = document.createElement('div');
        dock.className = 'pr-assistant-dock';
        dock.innerHTML = `
            <div class="dock-header">
                <span>PR Assistant</span>
                <div class="dock-controls">
                    <button class="minimize-btn">_</button>
                    <button class="close-btn">×</button>
                </div>
            </div>
            <div class="dock-content">
                <button class="action-btn" data-action="analyze">Analyze PR</button>
                <div class="result-content"></div>
            </div>
        `;
        
        document.body.appendChild(dock);
    }

    setupDraggable() {
        const dock = document.querySelector('.pr-assistant-dock');
        const header = dock.querySelector('.dock-header');
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        header.addEventListener('mousedown', e => {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            if (e.target === header) isDragging = true;
        });

        document.addEventListener('mousemove', e => {
            if (!isDragging) return;
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            xOffset = currentX;
            yOffset = currentY;
            dock.style.transform = `translate(${currentX}px, ${currentY}px)`;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    attachEventListeners() {
        const dock = document.querySelector('.pr-assistant-dock');
        
        dock.querySelector('.minimize-btn').addEventListener('click', () => {
            dock.classList.toggle('minimized');
        });

        dock.querySelector('.close-btn').addEventListener('click', () => {
            dock.remove();
        });

        dock.querySelector('.action-btn').addEventListener('click', async () => {
            const resultContent = dock.querySelector('.result-content');
            resultContent.innerHTML = '<div class="loading">Analyzing...</div>';
            
            try {
                const prData = await this.getPRData();
                const response = await chrome.runtime.sendMessage({
                    type: 'analyze',
                    data: { action: 'analyze', prData }
                });

                if (response.error) throw new Error(response.error);
                resultContent.innerHTML = `<div class="analysis-result">${response}</div>`;
            } catch (error) {
                resultContent.innerHTML = `<div class="error">${error.message}</div>`;
            }
        });
    }

    async getPRData() {
        const title = document.querySelector('.js-issue-title')?.textContent?.trim() || '';
        const description = document.querySelector('.comment-body')?.textContent?.trim() || '';
        const changes = Array.from(document.querySelectorAll('.file')).map(file => ({
            filename: file.querySelector('.file-info')?.getAttribute('data-path') || '',
            additions: parseInt(file.querySelector('.diffstat-add')?.textContent || '0'),
            deletions: parseInt(file.querySelector('.diffstat-delete')?.textContent || '0')
        }));

        return { title, description, changes };
    }
}

const style = document.createElement('style');
style.textContent = `
    .pr-assistant-dock {
        position: fixed;
        right: 20px;
        top: 20px;
        width: 300px;
        background: #fff;
        border: 1px solid #e1e4e8;
        border-radius: 6px;
        box-shadow: 0 8px 24px rgba(149,157,165,0.2);
        z-index: 100;
        transition: height 0.3s ease;
    }

    .pr-assistant-dock.minimized .dock-content {
        display: none;
    }

    .dock-header {
        padding: 8px 12px;
        background: #f6f8fa;
        border-bottom: 1px solid #e1e4e8;
        border-radius: 6px 6px 0 0;
        cursor: move;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .dock-controls button {
        background: none;
        border: none;
        padding: 4px 8px;
        cursor: pointer;
        opacity: 0.7;
    }

    .dock-controls button:hover {
        opacity: 1;
    }

    .dock-content {
        padding: 16px;
    }

    .action-btn {
        width: 100%;
        padding: 8px 16px;
        background: #2ea44f;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
    }

    .action-btn:hover {
        background: #2c974b;
    }

    .result-content {
        margin-top: 16px;
        max-height: 300px;
        overflow-y: auto;
    }

    .loading {
        text-align: center;
        color: #666;
    }

    .error {
        color: #cb2431;
        padding: 8px;
        background: #ffeef0;
        border-radius: 4px;
    }
`;

document.head.appendChild(style);
new GitHubPRAssistant();