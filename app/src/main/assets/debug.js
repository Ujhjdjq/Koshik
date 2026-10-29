(function () {
    let varusDebugLogs = [];

    function addVarusDebugLog(log) {
        varusDebugLogs.push(log);

        if (varusDebugLogs.length > 20) {
            varusDebugLogs.shift();
        }

        showVarusDebugModal();
    }

    function buildDebugText() {
        return varusDebugLogs
            .map((log, index) => {
                const products = (log.products || [])
                    .slice(0, 10)
                    .map((product, productIndex) => {
                        return (
                            (productIndex + 1) + '. ' +
                            'Назва: ' + String(product.title || '') + '\n' +
                            'Ціна: ' + String(product.price || '') + '\n' +
                            'URL: ' + String(product.url || '') + '\n' +
                            'ID: ' + String(product.id || '')
                        );
                    })
                    .join('\n\n');

                return [
                    'ЗАПИТ №' + (index + 1),
                    'Час: ' + new Date(log.time).toLocaleString('uk-UA'),
                    'Сторінка: ' + log.page,
                    'ОФІЦІЙНИЙ ЗАПИТ VARUS:',
                    log.query,
                    '',
                    'ЗНАЙДЕНО ТОВАРІВ: ' + (log.products ? log.products.length : 0),
                    '',
                    'ПЕРШІ РЕЗУЛЬТАТИ:',
                    products || 'Товарів не знайдено.'
                ].join('\n');
            })
            .join('\n\n----------------------------------------\n\n');
    }

    function showVarusDebugModal() {
        let modal = document.getElementById('varusDebugModal');

        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'varusDebugModal';

            modal.style.cssText = [
                'position:fixed',
                'inset:0',
                'background:rgba(0,0,0,0.65)',
                'z-index:99999',
                'display:flex',
                'align-items:center',
                'justify-content:center',
                'padding:16px'
            ].join(';');

            const box = document.createElement('div');
            box.style.cssText = [
                'background:#ffffff',
                'color:#111111',
                'border-radius:14px',
                'padding:16px',
                'width:100%',
                'max-width:520px',
                'max-height:88vh',
                'overflow:auto',
                'font-family:sans-serif'
            ].join(';');

            const title = document.createElement('div');
            title.textContent = 'Діагностика пошуку Varus';
            title.style.cssText =
                'font-size:17px;font-weight:700;margin-bottom:10px;';

            const text = document.createElement('textarea');
            text.id = 'varusDebugTextArea';
            text.readOnly = true;
            text.style.cssText = [
                'width:100%',
                'height:300px',
                'font-size:12px',
                'padding:8px',
                'border:1px solid #cccccc',
                'border-radius:8px',
                'resize:vertical'
            ].join(';');

            const buttons = document.createElement('div');
            buttons.style.cssText =
                'display:flex;gap:8px;margin-top:12px;';

            const copyButton = document.createElement('button');
            copyButton.textContent = 'Копіювати текст';
            copyButton.style.cssText = [
                'flex:1',
                'padding:12px',
                'border:none',
                'border-radius:10px',
                'background:#0d9488',
                'color:#ffffff',
                'font-weight:700'
            ].join(';');

            const closeButton = document.createElement('button');
            closeButton.textContent = 'Закрити';
            closeButton.style.cssText = [
                'flex:1',
                'padding:12px',
                'border:none',
                'border-radius:10px',
                'background:#e5e7eb',
                'color:#111111',
                'font-weight:700'
            ].join(';');

            copyButton.addEventListener('click', async () => {
                const debugText = buildDebugText();

                try {
                    await navigator.clipboard.writeText(debugText);
                    copyButton.textContent = 'Скопійовано';
                } catch (error) {
                    text.select();
                    document.execCommand('copy');
                    copyButton.textContent = 'Скопійовано';
                }
            });

            closeButton.addEventListener('click', () => {
                modal.remove();
            });

            buttons.appendChild(copyButton);
            buttons.appendChild(closeButton);
            box.appendChild(title);
            box.appendChild(text);
            box.appendChild(buttons);
            modal.appendChild(box);
            document.body.appendChild(modal);
        }

        const textArea = document.getElementById('varusDebugTextArea');

        if (textArea) {
            textArea.value = buildDebugText();
        }
    }

    const originalSearchVarusOnline = window.searchVarusOnline;

    if (typeof originalSearchVarusOnline !== 'function') {
        console.warn(
            'Діагностика Varus: функція searchVarusOnline не знайдена.'
        );
        return;
    }

    window.searchVarusOnline = function (name, page = 1) {
        const searchQuery = String(name || '').trim();

        addVarusDebugLog({
            time: Date.now(),
            page: page,
            query: searchQuery,
            products: []
        });

        const promise = originalSearchVarusOnline(name, page);

        return promise.then(products => {
            const lastLog = varusDebugLogs[varusDebugLogs.length - 1];

            if (lastLog) {
                lastLog.products = Array.isArray(products) ? products : [];
            }

            showVarusDebugModal();

            return products;
        });
    };
})();