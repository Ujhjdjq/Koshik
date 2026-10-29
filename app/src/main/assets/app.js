// ==========================================
// 1. КОНСТАНТИ ТА КАТЕГОРІЇ АТБ
// ==========================================
const defaultShopIcon = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><text y='75' font-size='80'>🛒</text></svg>"
);

// Категорії верхнього рівня — так, як вони називаються на сайті АТБ
const CATEGORY_ICONS = {
    'Овочі та фрукти': '🥕',
    'Молочні продукти та яйця': '🥛',
    'Сири': '🧀',
    'Хлібобулочні вироби': '🍞',
    "М'ясо": '🥩',
    "Ковбаса і м'ясні делікатеси": '🌭',
    'Риба і морепродукти': '🐟',
    'Бакалія': '🌾',
    'Кондитерські вироби': '🍫',
    'Чипси, снеки': '🥨',
    'Напої безалкогольні': '🥤',
    'Кава, чай': '☕',
    'Алкоголь': '🍷',
    'Заморожені продукти': '🧊',
    'Побутова хімія та непродовольчі товари': '🧼',
    'Гігієна і косметика': '🧴',
    'Товари для тварин': '🐾',
    'Інше': '📦'
};

// Вгадування категорії за ключовими словами (порядок має значення)
const CATEGORY_RULES = [
    [/кава|кофе|чай|зернов[аи] кава|мелен[аи] кава|розчинн[аи] кава|трав[’']яний чай|зелений чай|чорний чай/, 'Кава, чай'],
    [/квас|вода|сік|моршин|лимонад|(^|[\s\-])кола|мінерал|компот|морс|узвар|какао|смузі|енергетик/, 'Напої безалкогольні'],
    [/пиво|вино|горілк|коньяк|віскі|шампан/, 'Алкоголь'],
    [/яйц|яйце|ряжанк|кисляк|айран|тан|сирн[аи] маса|згущен|маргарин|масло/, 'Молочні продукти та яйця'],
    [/молок|кефір|йогурт|сметан|вершк|сирок/, 'Молочні продукти та яйця'],
    [/(^|\s)сир(?!оп)|моцарел|фета|бринз|пармезан|гауда|чедер|камамбер|сирний продукт/, 'Сири'],
    [/томат|помідор|огір|картопл|морк|цибул|капуст|буряк|перец|перець|часник|кабач|баклажан|гарбуз|редис|редьк|спарж|брокол|цвітна капуста|авокадо|ківі|персик|нектарин|слив|абрикос|полуниц|малин|смородин|кавун|диня|банан|ябл|лимон|апельсин|мандарин|груш|виноград|овоч|фрукт|зелен|кріп|петруш|салат|шпинат/, 'Овочі та фрукти'],
    [/хліб|батон|булк|булочк|лаваш|багет|кекс|кіск|сушк|сухар|тіст|пита|чиабат|круасан/, 'Хлібобулочні вироби'],
    [/ковбас|сосиск|сардельк|шинк|бекон|карбонад|салямі|мортадел|буженин|сало/, "Ковбаса і м'ясні делікатеси"],
    [/м'яс|м’яс|фарш|курк|куряч|філе|свин|ялович|індич|качк|гуск|кролик|стейк|ребр|печінк|котлет/, "М'ясо"],
    [/риб|оселед|скумбр|лосос|хек|креветк|тунець|сардин|міді|кальмар|ікр|крабові паличк/, 'Риба і морепродукти'],
    [/чипс|снек|сухарик|горіш|кукурудзяні паличк|крендельк|попкорн|м'ясні снеки/, 'Чипси, снеки'],
    [/шоколад|печив|цукерк|торт|вафл|пряник|мармелад|зефір|халва|батончик|шоколадна паста|тістечк|рулет/, 'Кондитерські вироби'],
    [/морозив|пельмен|вареник|нагетс|овочев[аи] суміш|заморожен/, 'Заморожені продукти'],
    [/цукор|сіль|борошн|круп|греч|рис|макарон|олія|оцет|майонез|кетчуп|соус|спеці|консерв|тушонк|кукурудз|горошок|квасол|маслин|оливк|мед|джем|варенн|арахісова паста/, 'Бакалія'],
    [/шампун|зубн|дезодор|прокладк|бритв|крем|гель для душу|лосьйон|тонік|бальзам/, 'Гігієна і косметика'],
    [/мило|порошок|засіб|губк|сервет|пакет|фольг|папір|гель для прання|кондиціонер для білизни|засіб для миття посуду|засіб для підлоги|засіб для сантехніки/, 'Побутова хімія та непродовольчі товари'],
    [/корм|наповнювач|ласощі|корм для котів|корм для собак/, 'Товари для тварин']
];

// Старі категорії → категорії АТБ (для товарів, збережених раніше)
const OLD_CATEGORY_MAP = {
    'Молочні продукти': 'Молочні продукти та яйця',
    'Випічка': 'Хлібобулочні вироби',
    'Овочі': 'Овочі та фрукти',
    'Фрукти': 'Овочі та фрукти',
    'Напої': 'Напої безалкогольні',
    'Побутова хімія': 'Побутова хімія та непродовольчі товари'
};
// ==========================================
// ОДИНИЦІ ВИМІРУ ТА КІЛЬКІСТЬ ТОВАРУ
// ==========================================

// «egg-pack» означає одну упаковку з 10 яєць.
// Ціна товару в застосунку завжди означає ціну за одну одиницю:
// за 1 шт., 1 кг або 1 упаковку.
const UNIT_RULES = [
    [/яйц|яйце/, 'egg-pack'],
    [
        /картопл|моркв|морква|цибул|капуст|буряк|перець|перец|огір|томат|помідор|кабач|баклажан|часник|імбир|зелень|кріп|петруш|салат|банан|яблук|ябл|груш|виноград|лимон|апельсин|мандарин|грейпфрут|ківі|авокадо|персик|нектарин|слив|абрикос|полуниц|малина|лохин|смородин|кавун|диня|філе|фарш|м'яс|м’яс|свин|ялович|куряч|індич|риба|оселед|скумбр|лосос|хек|креветк|сир тверд|масло вершк/,
        'kg'
    ]
];

function guessUnitType(name) {
    const lowerName = String(name || '').toLowerCase();

    for (const [re, unitType] of UNIT_RULES) {
        if (re.test(lowerName)) return unitType;
    }

    return 'piece';
}

function normalizeUnitType(unitType, itemName) {
    if (unitType === 'piece' || unitType === 'kg' || unitType === 'egg-pack') {
        return unitType;
    }

    return guessUnitType(itemName);
}

function getUnitLabel(item) {
    const type = normalizeUnitType(item.unitType, item.name);

    if (type === 'egg-pack') return 'уп.';
    if (type === 'kg') return 'кг';

    return 'шт.';
}

function getQuantityDescription(item) {
    const qty = Number(item.qty) || 1;
    const type = normalizeUnitType(item.unitType, item.name);

    if (type === 'egg-pack') {
        const eggsCount = qty * 10;
        return `${qty} уп. (${eggsCount} шт.)`;
    }

    if (type === 'kg') {
        return `${qty} кг`;
    }

    return `${qty} шт.`;
}
function normalizeCat(cat) {
    cat = String(cat || '').trim().replace(/\.+$/, ''); // «Чипси, снеки.» → «Чипси, снеки»
    return OLD_CATEGORY_MAP[cat] || cat || 'Інше';
}

function guessCategory(lowerName) {
    for (const [re, cat, icon] of CATEGORY_RULES) {
        if (re.test(lowerName)) return { cat: cat, img: icon || CATEGORY_ICONS[cat] || '📦' };
    }
    return { cat: 'Інше', img: '📦' };
}

// ==========================================
// 2. ІНІЦІАЛІЗАЦІЯ БАЗИ ДАНИХ ТЕЛЕФОНУ
// ==========================================
function loadAppData() {
    const defaults = {
        currentList: 'atb',
        searchStore: 'atb',
        history: [],
        customListKeys: [],
        hiddenCategories: {
            atb: false,
            silpo: false,
            list3: false,
            list4: false,
            list5: false,
            list6: false,
            list7: false,
            list8: false,
            list9: false
        },
        hiddenPrices: {
            atb: false,
            silpo: false,
            list3: false,
            list4: false,
            list5: false,
            list6: false,
            list7: false,
            list8: false,
            list9: false
        },
        listNames: {
            atb: 'АТБ',
            silpo: 'Сільпо',
            list3: 'Список №3',
            list4: 'Список №4',
            list5: 'Список №5',
            list6: 'Список №6',
            list7: 'Список №7',
            list8: 'Список №8',
            list9: 'Спільний список'
        },
        logos: {
            atb: 'file:///android_asset/atb.png',
            silpo: 'file:///android_asset/silpo.png',
            list3: defaultShopIcon,
            list4: defaultShopIcon,
            list5: defaultShopIcon,
            list6: defaultShopIcon,
            list7: defaultShopIcon,
            list8: defaultShopIcon,
            list9: defaultShopIcon
        },
        lists: {
            atb: [],
            silpo: [],
            list3: [],
            list4: [],
            list5: [],
            list6: [],
            list7: [],
            list8: [],
            list9: []
        }
    };

    let saved = null;

    try {
        saved = JSON.parse(localStorage.getItem('koshyk_data'));
    } catch (e) {
        saved = null;
    }

    if (!saved) {
        return defaults;
    }

    const savedCustomListKeys = Array.isArray(saved.customListKeys)
        ? saved.customListKeys.filter(key =>
            /^list[3-8]$/.test(key)
        )
        : [];

    const migratedCustomListKeys = savedCustomListKeys.filter(key => {
        const list = Array.isArray(saved.lists && saved.lists[key])
            ? saved.lists[key]
            : [];

        const savedName = String(
            saved.listNames && saved.listNames[key] || ''
        ).trim();

        return (
            list.length > 0 ||
            (
                savedName &&
                !/^Список №[3-8]$/.test(savedName)
            )
        );
    });

    const data = {
        currentList:
            saved.currentList === 'atb' ||
            saved.currentList === 'silpo' ||
            saved.currentList === 'list9' ||
            migratedCustomListKeys.includes(saved.currentList)
                ? saved.currentList
                : 'atb',

        searchStore: saved.searchStore === 'silpo'
            ? 'silpo'
            : saved.searchStore === 'varus'
                ? 'varus'
                : 'atb',

        history: Array.isArray(saved.history)
            ? saved.history
                .filter(item => {
                    if (!item || !String(item.name || '').trim()) {
                        return false;
                    }

                    if (
                        item.varusSelected === true &&
                        String(item.varusProductId || '').trim()
                    ) {
                        return true;
                    }

                    if (
                        item.silpoSelected === true &&
                        String(item.silpoProductId || '').trim()
                    ) {
                        return true;
                    }

                    return (
                        item.atbSelected === true &&
                        String(item.atbProductId || '').trim()
                    );
                })
                .map(item => {
                    const store = item.varusSelected === true
                        ? 'varus'
                        : item.silpoSelected === true
                            ? 'silpo'
                            : 'atb';

                    const base = {
                        id: String(
                            item.id ||
                            item.varusProductId ||
                            item.atbProductId ||
                            item.silpoProductId ||
                            item.varusProductUrl ||
                            item.atbProductUrl ||
                            item.silpoProductUrl ||
                            item.name
                        ),
                        store: store,

                        name: String(item.name || '').trim(),
                        price: Math.max(0, Number(item.price) || 0),
                        cat: normalizeCat(item.cat),
                        img: String(item.img || '📦'),
                        unitType: normalizeUnitType(item.unitType, item.name),

                        purchasedQuantity: Math.max(
                            1,
                            Math.round(Number(item.purchasedQuantity) || 1)
                        ),
                        purchasedAt: Number(item.purchasedAt) || Date.now(),
                        purchaseCount: Math.max(
                            1,
                            Math.round(Number(item.purchaseCount) || 1)
                        ),
                        source: String(item.source || 'local')
                    };

                    if (store === 'varus') {
                        base.varusSelected = true;
                        base.varusProductId = String(item.varusProductId || '').trim();
                        base.varusProductUrl = String(item.varusProductUrl || '').trim();
                        base.varusProductName = String(
                            item.varusProductName || item.name || ''
                        ).trim();
                        base.varusImage = String(item.varusImage || '').trim();

                        if (base.varusImage) {
                            base.img = base.varusImage;
                        }
                    }

                    if (store === 'atb') {
                        base.atbSelected = true;
                        base.atbProductId = String(item.atbProductId || '').trim();
                        base.atbProductUrl = String(item.atbProductUrl || '').trim();
                        base.atbProductName = String(
                            item.atbProductName || item.name || ''
                        ).trim();
                        base.atbImage = String(item.atbImage || '').trim();
                    }

                    if (store === 'silpo') {
                        base.silpoSelected = true;
                        base.silpoProductId = String(item.silpoProductId || '').trim();
                        base.silpoProductUrl = String(item.silpoProductUrl || '').trim();
                        base.silpoProductName = String(
                            item.silpoProductName || item.name || ''
                        ).trim();
                        base.silpoImage = String(item.silpoImage || '').trim();
                    }

                    return base;
                })
            : [],

        customListKeys: migratedCustomListKeys,

        listNames: Object.assign(
            {},
            defaults.listNames,
            saved.listNames || {}
        ),

        hiddenCategories: Object.assign(
            {},
            defaults.hiddenCategories,
            saved.hiddenCategories || {}
        ),

        hiddenPrices: Object.assign(
            {},
            defaults.hiddenPrices,
            saved.hiddenPrices || {}
        ),

        logos: Object.assign({}, defaults.logos, saved.logos || {}),

        lists: Object.assign({}, defaults.lists, saved.lists || {})
    };

    Object.keys(data.logos).forEach(key => {
        const value = data.logos[key];

        if (
            !value ||
            typeof value !== 'string' ||
            value.includes('placeholder') ||
            value.startsWith('data:image/svg+xml;utf8')
        ) {
            data.logos[key] = defaults.logos[key];
        }
    });

    Object.keys(defaults.lists).forEach(key => {
        if (!Array.isArray(data.lists[key])) {
            data.lists[key] = [];
        }
    });

    Object.values(data.lists).forEach(list => {
        if (Array.isArray(list)) {
            list.forEach(item => {
                if (item && typeof item === 'object') {
                    item.price = Number(item.price) || 0;
                    item.qty = Math.max(1, Math.round(Number(item.qty) || 1));
                    item.cat = normalizeCat(item.cat);
                    item.unitType = normalizeUnitType(item.unitType, item.name);
                }
            });
        }
    });

    return data;
}

let appData = loadAppData();

let currentEditingItemId = null;
let selectedImageOption = '';
let itemToDeleteId = null;
let noticeTimer = null;
let pendingCustomListKey = null;
// Тимчасова зміна кількості: зберігається лише після натискання ✓.
let quantityEditingItemId = null;
let draftQuantity = null;
// Крок 3: стан автоматичного пошуку товарів АТБ.
let atbPickerProducts = [];
let currentPickerStore = 'atb';
let pickerRequestGeneration = 0;
// Крок 4: черга неприв'язаних товарів, які користувач вирішив прив'язати.
let atbBindingQueue = [];
let atbBindingQueueIndex = 0;
let atbBindingSessionActive = false;
let atbBindingCompleted = 0;
let atbBindingTotal = 0;
function setShopLogoImage(imageUrl) {
    const logo = document.getElementById('shopLogo');
    const image = document.getElementById('shopLogoImage');

    if (!logo || !image) {
        return;
    }

    const safeUrl = String(imageUrl || 'atb.png').trim();

    logo.style.setProperty(
        '--shop-logo-bg',
        `url("${safeUrl}")`
    );

    image.src = safeUrl;
}
let lastLocalListChangeAt = 0;

function saveToStorage() {
    localStorage.setItem('koshyk_data', JSON.stringify(appData));
    if (appData.currentList === 'list9') {
        lastLocalListChangeAt = Date.now();
    }
    pushSharedListUpdate();
}

let sharedListUpdateTimer = null;

function pushSharedListUpdate() {
    try {
        if (appData.currentList !== 'list9' || !appData.sharedListRemoteId) {
            return;
        }

        const items = appData.lists.list9 || [];
        const payload = {
            items: items.map(exportFirebaseSharedItem)
        };

        if (sharedListUpdateTimer) {
            clearTimeout(sharedListUpdateTimer);
        }

        sharedListUpdateTimer = setTimeout(() => {
            callFirebaseSharedBridge('updateSharedList', appData.sharedListRemoteId, JSON.stringify(payload)).catch(() => {});
        }, 1200);
    } catch (e) {
        console.warn('pushSharedListUpdate error:', e);
    }
}

function manageSharedListSync() {
    if (appData.currentList === 'list9' && appData.sharedListRemoteId) {
        callFirebaseSharedBridge('startSharedListSync', appData.sharedListRemoteId).catch(() => {});
    } else {
        if (window.Android && typeof window.Android.stopSharedListSync === 'function') {
            window.Android.stopSharedListSync();
        }
    }
}

window.__onSharedListSync = function (callbackId, jsonText) {
    if (appData.currentList !== 'list9') {
        return;
    }

    if (Date.now() - lastLocalListChangeAt < 1500) {
        return;
    }

    try {
        const response = JSON.parse(jsonText);
        if (!response || !response.ok || !response.record) {
            return;
        }

        const record = response.record;
        const expiresAt = Number(record.expiresAt) || 0;
        if (expiresAt <= Date.now()) {
            return;
        }

        const rawItems = getFirebaseSharedItems(record.items);
        if (rawItems.length === 0) {
            return;
        }

        const importedItems = [];
        rawItems.forEach((rawItem, index) => {
            const item = importFirebaseSharedItem(rawItem, index);
            if (item) {
                importedItems.push(item);
            }
        });

        if (importedItems.length > 0) {
            appData.lists.list9 = importedItems;
            appData.sharedListExpiresAt = expiresAt;
            localStorage.setItem('koshyk_data', JSON.stringify(appData));
            renderLists();
            updateListSwitcherLabel();
        }
    } catch (e) {
        console.warn('Shared list sync error:', e);
    }
};

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}
// ==========================================
// ІСТОРІЯ ПРИДБАНИХ ТОВАРІВ ТА ПІДКАЗКИ
// ==========================================

function normalizeHistoryText(value) {
    return String(value || '')
        .trim()
        .toLocaleLowerCase('uk-UA')
        .replace(/[ʼ`]/g, "'")
        .replace(/\s+/g, ' ');
}

function getHistoryItemKey(item) {
    if (!item) return '';

    if (
        item.varusSelected === true &&
        String(item.varusProductId || '').trim()
    ) {
        return (
            'varus|' +
            String(
                item.varusProductId ||
                item.varusProductUrl ||
                item.varusProductName ||
                ''
            ).trim()
        );
    }

    if (
        item.silpoSelected === true &&
        String(item.silpoProductId || '').trim()
    ) {
        return (
            'silpo|' +
            String(
                item.silpoProductId ||
                item.silpoProductUrl ||
                item.silpoProductName ||
                ''
            ).trim()
        );
    }

    return (
        'atb|' +
        String(
            item.atbProductId ||
            item.atbProductUrl ||
            item.atbProductName ||
            ''
        ).trim()
    );
}

/*
 * Додаємо до історії тільки товар, який:
 * - позначено «Придбано»;
 * - вручну прив’язано до конкретної картки АТБ.
 *
 * Для однакового товару не створюємо дублікати історії:
 * оновлюємо останню дату, лічильник покупок і реальну кількість
 * останньої покупки.
 */
function savePurchasedItemToHistory(item) {
    if (!item || !String(item.name || '').trim()) {
        return;
    }

    const isAtbBound =
        item.atbSelected === true &&
        String(item.atbProductId || '').trim();

    const isSilpoBound =
        item.silpoSelected === true &&
        String(item.silpoProductId || '').trim();

    const isVarusBound =
        item.varusSelected === true &&
        String(item.varusProductId || '').trim();

    if (!isAtbBound && !isSilpoBound && !isVarusBound) {
        return;
    }

    const store = isVarusBound
        ? 'varus'
        : isSilpoBound
            ? 'silpo'
            : 'atb';

    if (!Array.isArray(appData.history)) {
        appData.history = [];
    }

    const key = getHistoryItemKey(item);

    if (!key || key.endsWith('|')) {
        return;
    }

    const now = Date.now();

    const existing = appData.history.find(historyItem =>
        getHistoryItemKey(historyItem) === key
    );

    if (existing) {
        existing.name = String(item.name || '').trim();
        existing.price = Math.max(0, Number(item.price) || 0);
        existing.cat = normalizeCat(item.cat);
        existing.img = String(item.img || '📦');
        existing.unitType = normalizeUnitType(item.unitType, item.name);
        existing.purchasedQuantity = Math.max(
            1,
            Math.round(Number(item.qty) || 1)
        );
        existing.purchasedAt = now;
        existing.purchaseCount = Math.max(
            1,
            Math.round(Number(existing.purchaseCount) || 1)
        ) + 1;

        if (store === 'varus') {
            existing.varusSelected = true;
            existing.varusProductId = String(item.varusProductId || '').trim();
            existing.varusProductUrl = String(item.varusProductUrl || '').trim();
            existing.varusProductName = String(
                item.varusProductName || item.name || ''
            ).trim();
            existing.varusImage = String(item.varusImage || '').trim();
        } else if (store === 'silpo') {
            existing.silpoSelected = true;
            existing.silpoProductId = String(item.silpoProductId || '').trim();
            existing.silpoProductUrl = String(item.silpoProductUrl || '').trim();
            existing.silpoProductName = String(
                item.silpoProductName || item.name || ''
            ).trim();
            existing.silpoImage = String(item.silpoImage || '').trim();
        } else {
            existing.atbSelected = true;
            existing.atbProductId = String(item.atbProductId || '').trim();
            existing.atbProductUrl = String(item.atbProductUrl || '').trim();
            existing.atbProductName = String(
                item.atbProductName || item.name || ''
            ).trim();
            existing.atbImage = String(item.atbImage || '').trim();
        }

        if (appData.currentList === 'list9') {
            existing.source = 'shared';
        }

        saveToStorage();
        return;
    }

    const historyItem = {
        id: 'history_' + now + '_' + Math.random().toString(36).slice(2),
        store: store,

        name: String(item.name || '').trim(),
        price: Math.max(0, Number(item.price) || 0),
        cat: normalizeCat(item.cat),
        img: String(item.img || '📦'),
        unitType: normalizeUnitType(item.unitType, item.name),

        purchasedQuantity: Math.max(
            1,
            Math.round(Number(item.qty) || 1)
        ),
        purchasedAt: now,
        purchaseCount: 1,

        source: appData.currentList === 'list9' ? 'shared' : 'local'
    };

    if (store === 'varus') {
        historyItem.varusSelected = true;
        historyItem.varusProductId = String(item.varusProductId || '').trim();
        historyItem.varusProductUrl = String(item.varusProductUrl || '').trim();
        historyItem.varusProductName = String(
            item.varusProductName || item.name || ''
        ).trim();
        historyItem.varusImage = String(item.varusImage || '').trim();
    } else if (store === 'silpo') {
        historyItem.silpoSelected = true;
        historyItem.silpoProductId = String(item.silpoProductId || '').trim();
        historyItem.silpoProductUrl = String(item.silpoProductUrl || '').trim();
        historyItem.silpoProductName = String(
            item.silpoProductName || item.name || ''
        ).trim();
        historyItem.silpoImage = String(item.silpoImage || '').trim();
    } else {
        historyItem.atbSelected = true;
        historyItem.atbProductId = String(item.atbProductId || '').trim();
        historyItem.atbProductUrl = String(item.atbProductUrl || '').trim();
        historyItem.atbProductName = String(
            item.atbProductName || item.name || ''
        ).trim();
        historyItem.atbImage = String(item.atbImage || '').trim();
    }

    appData.history.push(historyItem);

    saveToStorage();
}

function getStoreLineClass(item) {
    if (!item) return '';
    if (item.lastBoundStore === 'atb' || item.atbSelected) return 'store-line-atb';
    if (item.lastBoundStore === 'silpo' || item.silpoSelected) return 'store-line-silpo';
    if (item.lastBoundStore === 'varus' || item.varusSelected) return 'store-line-varus';
    if (item.store === 'atb') return 'store-line-atb';
    if (item.store === 'silpo') return 'store-line-silpo';
    if (item.store === 'varus') return 'store-line-varus';
    return '';
}

/*
 * Формує до 5 підказок.
 *
 * Порядок:
 * 1. Точний збіг назви.
 * 2. Збіг з початку назви.
 * 3. Частіше купувані.
 * 4. Нещодавно купувані.
 *
 * Уже активні товари поточного списку не показуємо.
 */
function getHistorySuggestions(query, limit = 5) {
    const list = appData.lists[appData.currentList] || [];
    const normalizedQuery = normalizeHistoryText(query);

    const activeAtbIds = new Set(
        list
            .filter(item =>
                !item.bought &&
                String(item.atbProductId || '').trim()
            )
            .map(item => String(item.atbProductId).trim())
    );

    const activeSilpoIds = new Set(
        list
            .filter(item =>
                !item.bought &&
                String(item.silpoProductId || '').trim()
            )
            .map(item => String(item.silpoProductId).trim())
    );

    const activeVarusIds = new Set(
        list
            .filter(item =>
                !item.bought &&
                String(item.varusProductId || '').trim()
            )
            .map(item => String(item.varusProductId).trim())
    );

    return (appData.history || [])
        .filter(item => {
            if (!item) {
                return false;
            }

            const isVarus =
                item.varusSelected === true &&
                String(item.varusProductId || '').trim();

            const isSilpo =
                item.silpoSelected === true &&
                String(item.silpoProductId || '').trim();

            const isAtb =
                item.atbSelected === true &&
                String(item.atbProductId || '').trim();

            if (isVarus) {
                const varusProductId = String(
                    item.varusProductId || ''
                ).trim();

                return !activeVarusIds.has(varusProductId);
            }

            if (isSilpo) {
                const silpoProductId = String(
                    item.silpoProductId || ''
                ).trim();

                return !activeSilpoIds.has(silpoProductId);
            }

            if (isAtb) {
                const atbProductId = String(
                    item.atbProductId || ''
                ).trim();

                return !activeAtbIds.has(atbProductId);
            }

            return false;
        })
        .filter(item => {
            if (!normalizedQuery) {
                return true;
            }

            return normalizeHistoryText(item.name)
                .includes(normalizedQuery);
        })
        .sort((a, b) => {
            const currentSearchStore = appData.searchStore || 'atb';

            const getStoreRank = item => {
                const store = item.lastBoundStore || (item.atbSelected ? 'atb' : item.silpoSelected ? 'silpo' : item.varusSelected ? 'varus' : item.store || 'atb');
                if (store === currentSearchStore) return 0;
                if (store === 'atb') return 1;
                if (store === 'silpo') return 2;
                if (store === 'varus') return 3;
                return 4;
            };

            const rankA = getStoreRank(a);
            const rankB = getStoreRank(b);

            if (rankA !== rankB) {
                return rankA - rankB;
            }

            const aName = normalizeHistoryText(a.name);
            const bName = normalizeHistoryText(b.name);

            const aExact =
                normalizedQuery &&
                aName === normalizedQuery
                    ? 1
                    : 0;

            const bExact =
                normalizedQuery &&
                bName === normalizedQuery
                    ? 1
                    : 0;

            if (aExact !== bExact) {
                return bExact - aExact;
            }

            const aStarts =
                normalizedQuery &&
                aName.startsWith(normalizedQuery)
                    ? 1
                    : 0;

            const bStarts =
                normalizedQuery &&
                bName.startsWith(normalizedQuery)
                    ? 1
                    : 0;

            if (aStarts !== bStarts) {
                return bStarts - aStarts;
            }

            const countDifference =
                Number(b.purchaseCount || 0) -
                Number(a.purchaseCount || 0);

            if (countDifference !== 0) {
                return countDifference;
            }

            return (
                Number(b.purchasedAt || 0) -
                Number(a.purchasedAt || 0)
            );
        })
        .slice(0, limit);
}
function getSearchSuggestions(query, limit = 5) {
    const historyItems = getHistorySuggestions(query, limit);
    const result = historyItems.slice();

    const seen = new Set(
        result.map(item => normalizeHistoryText(item.name))
    );

    const normalizedQuery = normalizeHistoryText(query);
    if (!normalizedQuery) {
        return result;
    }

    const list = appData.lists[appData.currentList] || [];

    for (const baseItem of (window.BASE_SUGGESTIONS || [])) {
        if (result.length >= limit) {
            break;
        }

        const name = String(baseItem.name || '').trim();
        const normalizedBaseName = normalizeHistoryText(name);

        if (!normalizedBaseName) {
            continue;
        }

        if (!normalizedBaseName.includes(normalizedQuery)) {
            continue;
        }

        if (seen.has(normalizedBaseName)) {
            continue;
        }

        const alreadyInList = list.some(item =>
            !item.bought &&
            normalizeHistoryText(item.name) === normalizedBaseName
        );

        if (alreadyInList) {
            continue;
        }

        seen.add(normalizedBaseName);

        result.push({
            name: name,
            cat: String(baseItem.cat || '').trim(),
            img: String(baseItem.img || '📦').trim(),
            isBaseSuggestion: true
        });
    }

    return result;
}

/*
 * Додає товар із історії до активного списку.
 *
 * Головне правило:
 * qty завжди 1 — незалежно від purchasedQuantity в історії.
 */
function addItemFromHistory(historyItem) {
    if (!historyItem) {
        return;
    }

    const list = appData.lists[appData.currentList] || [];

    const historyIsVarus =
        historyItem.varusSelected === true &&
        String(historyItem.varusProductId || '').trim();

    const historyIsSilpo =
        historyItem.silpoSelected === true &&
        String(historyItem.silpoProductId || '').trim();

    const historyIsAtb =
        historyItem.atbSelected === true &&
        String(historyItem.atbProductId || '').trim();

    const alreadyExists = list.some(item => {
        if (item.bought) {
            return false;
        }

        if (historyIsVarus) {
            const historyVarusId = String(
                historyItem.varusProductId || ''
            ).trim();

            const itemVarusId = String(
                item.varusProductId || ''
            ).trim();

            return (
                item.varusSelected === true &&
                itemVarusId &&
                itemVarusId === historyVarusId
            );
        }

        if (historyIsSilpo) {
            const historySilpoId = String(
                historyItem.silpoProductId || ''
            ).trim();

            const itemSilpoId = String(
                item.silpoProductId || ''
            ).trim();

            return (
                item.silpoSelected === true &&
                itemSilpoId &&
                itemSilpoId === historySilpoId
            );
        }

        if (historyIsAtb) {
            const historyAtbId = String(
                historyItem.atbProductId || ''
            ).trim();

            const itemAtbId = String(
                item.atbProductId || ''
            ).trim();

            return (
                item.atbSelected === true &&
                itemAtbId &&
                itemAtbId === historyAtbId
            );
        }

        return false;
    });

    if (alreadyExists) {
        hideHistorySuggestions();
        return;
    }

    const varusImage = String(historyItem.varusImage || '').trim();

    const newItem = {
        id: Date.now() + Math.floor(Math.random() * 1000),

        name: String(historyItem.name || '').trim(),
        price: Math.max(0, Number(historyItem.price) || 0),
        qty: 1,
        cat: normalizeCat(historyItem.cat),
        img: String(
            historyIsVarus && varusImage
                ? varusImage
                : historyItem.img || '📦'
        ),
        unitType: normalizeUnitType(historyItem.unitType, historyItem.name),
        bought: false,
        priceNotFound: Number(historyItem.price) <= 0
    };

    const historyStore = String(historyItem.store || 'atb').trim();

    if (historyStore === 'varus') {
        newItem.store = 'varus';
        newItem.varusSelected = true;
        newItem.varusProductId = String(
            historyItem.varusProductId || ''
        ).trim();
        newItem.varusProductUrl = String(
            historyItem.varusProductUrl || ''
        ).trim();
        newItem.varusProductName = String(
            historyItem.varusProductName || historyItem.name || ''
        ).trim();
        newItem.varusImage = varusImage;
        newItem.varusSelectedPrice = Math.max(
            0,
            Number(historyItem.price) || 0
        );
    } else if (historyStore === 'atb') {
        newItem.store = 'atb';
        newItem.atbSelected = true;
        newItem.atbProductId = String(historyItem.atbProductId || '').trim();
        newItem.atbProductUrl = String(historyItem.atbProductUrl || '').trim();
        newItem.atbProductName = String(
            historyItem.atbProductName || historyItem.name || ''
        ).trim();
        newItem.atbImage = String(historyItem.atbImage || '').trim();
        newItem.atbSelectedPrice = Math.max(
            0,
            Number(historyItem.price) || 0
        );
    } else {
        newItem.silpoSelected = true;
        newItem.silpoProductId = String(historyItem.silpoProductId || '').trim();
        newItem.silpoProductUrl = String(historyItem.silpoProductUrl || '').trim();
        newItem.silpoProductName = String(
            historyItem.silpoProductName || historyItem.name || ''
        ).trim();
        newItem.silpoImage = String(historyItem.silpoImage || '').trim();

        newItem.img = '📦';
    }

    list.push(newItem);

    saveToStorage();
    renderLists();

    const input = document.getElementById('searchInput');

    if (input) {
        input.value = '';
    }

    hideHistorySuggestions();
}

/*
 * Створює або оновлює список-підказку під текстовим полем.
 * Контейнер додається JavaScript-ом, тому index.html поки змінювати не треба.
 */
function renderHistorySuggestions() {
    const input = document.getElementById('searchInput');
    const suggestions = document.getElementById('historySuggestions');

    if (!input || !suggestions) {
        return;
    }
    /*
     const items = getHistorySuggestions(input.value, 5);
     */
    const items = getSearchSuggestions(input.value, 5);
    suggestions.innerHTML = '';

    if (items.length === 0) {
        suggestions.style.display = 'none';
        return;
    }

    items.forEach(historyItem => {
        const button = document.createElement('button');

        button.type = 'button';
        const storeClass = getStoreLineClass(historyItem);
        button.className = `history-suggestion-item ${storeClass}`;

        const imageUrl = String(
            historyItem.varusImage ||
            historyItem.silpoImage ||
            historyItem.atbImage ||
            ''
        ).trim();

        const fallbackImageUrl = String(historyItem.img || '').trim();
        const hasFallbackImage =
            fallbackImageUrl.startsWith('http://') ||
            fallbackImageUrl.startsWith('https://');

        const imageHtml = imageUrl || hasFallbackImage
            ? `<img src="${escapeHtml(imageUrl || fallbackImageUrl)}" alt="" onerror="this.onerror=null; this.parentElement.textContent='📦'">`
            : escapeHtml(historyItem.img || '📦');

        button.innerHTML = `
            <span class="history-suggestion-image">
                ${imageHtml}
            </span>

            <span class="history-suggestion-main">
                <span class="history-suggestion-name">
                    ${escapeHtml(historyItem.name)}
                </span>

                <span class="history-suggestion-meta">
                    ${
                        Number(historyItem.price) > 0
                            ? `${Number(historyItem.price).toFixed(2)} ₴`
                            : 'Ціну не вказано'
                    }
                </span>
            </span>
        `;

        /*
         * preventDefault не дає input втратити фокус до click.
         * Завдяки цьому клавіатура не закриється на телефоні.
         */
        button.addEventListener('mousedown', event => {
            event.preventDefault();
        });

        button.addEventListener('click', () => {
            addItemFromHistory(historyItem);
        });

        suggestions.appendChild(button);
    });

    suggestions.style.display = 'block';
}

function hideHistorySuggestions() {
    const suggestions = document.getElementById('historySuggestions');

    if (!suggestions) {
        return;
    }

    suggestions.innerHTML = '';
    suggestions.style.display = 'none';
}
// ==========================================
// МОДАЛЬНЕ ВІКНО ІСТОРІЇ ТОВАРІВ
// ==========================================

function openHistoryModal() {
    closeListMenu();

    const modal = document.getElementById('historyModal');

    if (!modal) {
        return;
    }

    window.__sessionAddedHistoryIds = new Set();
    renderHistoryModal();
    modal.style.display = 'flex';
}

function closeHistoryModal() {
    const modal = document.getElementById('historyModal');

    if (modal) {
        modal.style.display = 'none';
    }
}

function isHistoryItemInActiveList(historyItem) {
    const list = appData.lists[appData.currentList] || [];

    const historyIsVarus =
        historyItem.varusSelected === true &&
        String(historyItem.varusProductId || '').trim();

    const historyIsSilpo =
        historyItem.silpoSelected === true &&
        String(historyItem.silpoProductId || '').trim();

    const historyIsAtb =
        historyItem.atbSelected === true &&
        String(historyItem.atbProductId || '').trim();

    return list.some(item => {
        if (item.bought) {
            return false;
        }

        if (historyIsVarus) {
            const historyVarusId = String(
                historyItem.varusProductId || ''
            ).trim();

            const itemVarusId = String(
                item.varusProductId || ''
            ).trim();

            return (
                item.varusSelected === true &&
                itemVarusId &&
                itemVarusId === historyVarusId
            );
        }

        if (historyIsSilpo) {
            const historySilpoId = String(
                historyItem.silpoProductId || ''
            ).trim();

            const itemSilpoId = String(
                item.silpoProductId || ''
            ).trim();

            return (
                item.silpoSelected === true &&
                itemSilpoId &&
                itemSilpoId === historySilpoId
            );
        }

        if (historyIsAtb) {
            const historyAtbId = String(
                historyItem.atbProductId || ''
            ).trim();

            const itemAtbId = String(
                item.atbProductId || ''
            ).trim();

            return (
                item.atbSelected === true &&
                itemAtbId &&
                itemAtbId === historyAtbId
            );
        }

        return (
            normalizeHistoryText(item.name) ===
            normalizeHistoryText(historyItem.name)
        );
    });
}

function renderHistoryModal() {
    const list = document.getElementById('historyModalList');
    const emptyText = document.getElementById('historyModalEmpty');
    const clearButton = document.getElementById('clearHistoryButton');

    if (!list || !emptyText) {
        return;
    }

    list.innerHTML = '';

    const history = Array.isArray(appData.history)
        ? [...appData.history].sort(
            (a, b) =>
                Number(b.purchasedAt || 0) -
                Number(a.purchasedAt || 0)
        )
        : [];

    if (history.length === 0) {
        emptyText.style.display = 'block';

        if (clearButton) {
            clearButton.style.display = 'none';
        }

        return;
    }

    emptyText.style.display = 'none';

    if (clearButton) {
        clearButton.style.display = 'block';
    }

    const sessionAddedIds = window.__sessionAddedHistoryIds || new Set();

    history.forEach(historyItem => {
        const row = document.createElement('div');
        const inList = isHistoryItemInActiveList(historyItem);
        const isSessionAdded = sessionAddedIds.has(historyItem.id);

        row.className = `history-modal-item ${getStoreLineColor(historyItem)}${(inList || isSessionAdded) ? ' added' : ''}`;

        const imageUrl = String(
            historyItem.silpoImage ||
            historyItem.atbImage ||
            ''
        ).trim();

        const fallbackImageUrl = String(historyItem.img || '').trim();
        const hasFallbackImage =
            fallbackImageUrl.startsWith('http://') ||
            fallbackImageUrl.startsWith('https://');

        const imageHtml = imageUrl || hasFallbackImage
            ? `
                <img
                    src="${escapeHtml(imageUrl || fallbackImageUrl)}"
                    alt=""
                    onerror="this.onerror=null; this.parentElement.textContent='📦'"
                >
            `
            : escapeHtml(historyItem.img || '📦');

        const priceText = Number(historyItem.price) > 0
            ? `${Number(historyItem.price).toFixed(2)} ₴`
            : 'Ціна не вказана';

        const countText = Number(historyItem.purchaseCount || 1) === 1
            ? '1 покупка'
            : `${Number(historyItem.purchaseCount || 1)} покупок`;

        row.innerHTML = `
            <div class="history-modal-item-image">
                ${imageHtml}
            </div>

            <div class="history-modal-item-info">
                <div class="history-modal-item-name">
                    ${escapeHtml(historyItem.name || 'Товар')}
                </div>

                <div class="history-modal-item-meta">
                    ${priceText} · ${countText}
                </div>
            </div>
            <button
                    type="button"
                    class="history-modal-item-edit"
                    aria-label="Редагувати запис історії"
                    title="Редагувати запис історії"
            >
                    ✏️
            </button>
            <button
                type="button"
                class="history-modal-item-delete"
                aria-label="Видалити з історії"
                title="Видалити з історії"
            >
                ×
            </button>
        `;
               const deleteButton = row.querySelector('.history-modal-item-delete');
               row.addEventListener('touchstart', () => {
                   row.classList.add('is-pressed');
               }, { passive: true });

               row.addEventListener('touchend', () => {
                   row.classList.remove('is-pressed');
               }, { passive: true });

               row.addEventListener('touchcancel', () => {
                   row.classList.remove('is-pressed');
               }, { passive: true });
                /*
                 * Коротке натискання по картці товару додає його
                 * в активний список із qty: 1.
                 */
                row.addEventListener('click', event => {
                    if (event.target.closest('.history-modal-item-delete') || event.target.closest('.history-modal-item-edit')) {
                        return;
                    }

                    addItemFromHistory(historyItem);
                    if (!window.__sessionAddedHistoryIds) {
                        window.__sessionAddedHistoryIds = new Set();
                    }
                    window.__sessionAddedHistoryIds.add(historyItem.id);
                    renderHistoryModal();
                });
                const editButton = row.querySelector('.history-modal-item-edit');

                editButton.addEventListener('click', event => {
                    event.preventDefault();
                    event.stopPropagation();

                    openEditHistoryModal(historyItem);
                });

                deleteButton.addEventListener('click', event => {
                    event.preventDefault();
                    event.stopPropagation();

                    deleteHistoryItem(historyItem);
                });

        list.appendChild(row);
    });
}

function deleteHistoryItem(historyItem) {
    if (!Array.isArray(appData.history)) {
        return;
    }

    const key = getHistoryItemKey(historyItem);

    appData.history = appData.history.filter(item => {
        return getHistoryItemKey(item) !== key;
    });

    saveToStorage();
    renderHistoryModal();
}

function confirmClearHistory() {
    const modal = document.getElementById('clearHistoryConfirmModal');

    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeClearHistoryConfirmModal() {
    const modal = document.getElementById('clearHistoryConfirmModal');

    if (modal) {
        modal.style.display = 'none';
    }
}

function clearHistory() {
    appData.history = [];

    saveToStorage();
    closeClearHistoryConfirmModal();
    renderHistoryModal();
}
function setupHistorySuggestions() {
    const input = document.getElementById('searchInput');
    const suggestions = document.getElementById('historySuggestions');

    if (!input || !suggestions) {
        return;
    }

    input.addEventListener('focus', function () {
        renderHistorySuggestions();
    });

    input.addEventListener('input', function () {
        renderHistorySuggestions();
    });

    input.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            hideHistorySuggestions();
        }
    });

    input.addEventListener('blur', function () {
        setTimeout(function () {
            hideHistorySuggestions();
        }, 180);
    });
    if (window.visualViewport) {
        let lastViewportHeight = window.visualViewport.height;

        window.visualViewport.addEventListener('resize', function () {
            const currentHeight = window.visualViewport.height;

            /*
             * Клавіатура згорнулася: видима висота екрана збільшилася.
             * У цьому випадку підказки ховаємо.
             */
            if (currentHeight > lastViewportHeight) {
                hideHistorySuggestions();
            }

            lastViewportHeight = currentHeight;
        });
    }
}
function renderListSelector() {
    const selector = document.getElementById('listSelector');

    if (!selector) {
        return;
    }

    const visibleListKeys = [
        'atb',
        'silpo',
        ...appData.customListKeys,
        'list9'
    ];

    selector.innerHTML = '';

    visibleListKeys.forEach(key => {
        const option = document.createElement('option');

        option.value = key;
        option.textContent =
            appData.listNames[key] || 'Новий список';

        selector.appendChild(option);
    });

    /*
     * Якщо збережений активний список більше не існує,
     * повертаємося до АТБ.
     */
    if (!visibleListKeys.includes(appData.currentList)) {
        appData.currentList = 'atb';
    }

        selector.value = appData.currentList;

        updateListSwitcherLabel();
}
function createCustomList() {
    const availableKeys = [
        'list3',
        'list4',
        'list5',
        'list6',
        'list7',
        'list8'
    ];

    const usedKeys = Array.isArray(appData.customListKeys)
        ? appData.customListKeys
        : [];

    const newKey = availableKeys.find(key =>
        !usedKeys.includes(key)
    );

    if (!newKey) {
        alert('Можна створити не більше шести додаткових списків.');
        return;
    }

    const modal = document.getElementById('renameListModal');
    const input = document.getElementById('renameListInput');

    if (!modal || !input) {
        alert('Не вдалося відкрити вікно для назви нового списку.');
        return;
    }

    pendingCustomListKey = newKey;

    input.value = `Список №${newKey.replace('list', '')}`;
    modal.style.display = 'flex';

    setTimeout(() => {
        input.focus();
        input.select();
    }, 100);
    updateListSwitcherLabel();
}
function deleteCurrentCustomList() {
    const listKey = appData.currentList;

    const canDelete = Array.isArray(appData.customListKeys) &&
        appData.customListKeys.includes(listKey);

    if (!canDelete) {
        alert('Можна видаляти лише додаткові списки.');
        return;
    }

    const listName = appData.listNames &&
        appData.listNames[listKey]
        ? appData.listNames[listKey]
        : 'цей список';
    /*
     * Прибираємо ключ із видимих додаткових списків.
     */
    appData.customListKeys = appData.customListKeys.filter(
        key => key !== listKey
    );

    /*
     * Видаляємо всі дані цього додаткового списку.
     */
    if (appData.lists) {
        delete appData.lists[listKey];
    }

    if (appData.listNames) {
        delete appData.listNames[listKey];
    }

    if (appData.logos) {
        delete appData.logos[listKey];
    }

    if (appData.hiddenCategories) {
        delete appData.hiddenCategories[listKey];
    }

    /*
     * Після видалення завжди переходимо до АТБ.
     */
    appData.currentList = 'atb';

    saveToStorage();
    renderListSelector();

    const logo = document.getElementById('shopLogo');

        setShopLogoImage(
            appData.logos.atb || defaultShopIcon
        );

    updateListMenuText();
    renderLists();

    alert(`Список «${listName}» видалено.`);
    updateListSwitcherLabel();
}
// ==========================================
// 3. КЕРУВАННЯ СПИСКАМИ ТА ВІДОБРАЖЕННЯМ
// ==========================================
function switchList() {
    const selector = document.getElementById('listSelector');

    if (!selector) {
        return;
    }

    appData.currentList = selector.value;

    const logo = document.getElementById('shopLogo');

        setShopLogoImage(
            appData.logos[appData.currentList] || 'atb.png'
        );

    updateListMenuText();
    updateListSwitcherLabel();

    saveToStorage();
    renderLists();
    manageSharedListSync();
}
function updateListSwitcherLabel() {
    const selector = document.getElementById('listSelector');
    const label = document.getElementById('listSwitcherLabel');
    const subtitle = document.getElementById('listSwitcherSubtitle');

    if (selector && label && selector.selectedIndex >= 0) {
        label.textContent = selector.options[selector.selectedIndex].text;
    }

    if (subtitle) {
        if (appData.currentList === 'list9' && appData.sharedListExpiresAt) {
            const remaining = Number(appData.sharedListExpiresAt) - Date.now();
            if (remaining > 0) {
                const days = Math.ceil(remaining / (1000 * 60 * 60 * 24));
                subtitle.textContent = `Дійсний ще ${days} дн.`;
                subtitle.style.display = 'block';
            } else {
                subtitle.textContent = 'Термін дії завершився';
                subtitle.style.display = 'block';
            }
        } else {
            subtitle.style.display = 'none';
        }
    }
}
function updateRenameListButton() {
    const button = document.getElementById('renameListButton');

    if (!button) {
        return;
    }

    button.style.display =
        appData.currentList === 'list9'
            ? 'none'
            : 'flex';
}
function toggleStatus(id) {
    const item = (appData.lists[appData.currentList] || [])
        .find(x => x.id === id);

    if (!item) {
        return;
    }

    /*
     * У момент переходу зі стану «активний» у «Придбано»
     * записуємо в історію тільки вручну прив’язаний товар АТБ.
     */
    const willBeBought = !item.bought;

    item.bought = willBeBought;

    if (willBeBought) {
        savePurchasedItemToHistory(item);
    }

    saveToStorage();
    renderLists();
    manageSharedListSync();
}

function renderLists() {
    const container = document.getElementById('listContent');
    if (!container) return;
    container.innerHTML = '';

    let items = appData.lists[appData.currentList] || [];

    // Сортуємо за категоріями АТБ, «Інше» — в кінці
    items.sort((a, b) => {
        let catA = a.cat || 'Інше', catB = b.cat || 'Інше';
        if (catA === 'Інше' && catB !== 'Інше') return 1;
        if (catB === 'Інше' && catA !== 'Інше') return -1;
        return catA.localeCompare(catB, 'uk');
    });

    let active = items.filter(i => !i.bought);
    let bought = items.filter(i => i.bought);
    let totalSum = items.reduce((sum, i) => sum + (i.price * i.qty), 0);

    document.getElementById('counterText').innerText = `Придбано: ${bought.length} із ${items.length}`;
    document.getElementById('totalPriceText').innerText = `Сума: ${totalSum.toFixed(2)} ₴`;

    let lastCategory = null;
    active.forEach(item => {
        let currentCategory = item.cat || 'Інше';
        if (currentCategory !== lastCategory) {
            const headerDiv = document.createElement('div');
            headerDiv.className = 'category-header';
            const icon = CATEGORY_ICONS[currentCategory] || '📦';
            headerDiv.innerHTML = `<span>${icon}</span> <span>${escapeHtml(currentCategory)}</span>`;
            if (!appData.hiddenCategories[appData.currentList]) {
                container.appendChild(headerDiv);
            }
            lastCategory = currentCategory;
        }
        container.appendChild(createDOM(item));
    });

    if (bought.length > 0) {
        const div = document.createElement('div');
        div.className = 'bought-divider';
        div.innerText = `Придбано (${bought.length})`;
        container.appendChild(div);
        bought.forEach(i => container.appendChild(createDOM(i)));
    }
}

function createDOM(item) {
    const div = document.createElement('div');
    div.className = `product-item ${item.bought ? 'bought' : ''} ${getStoreLineColor(item)}`;

    /*
     * Натискання на вільну частину картки:
     * якщо редагування кількості було відкрито — воно скасовується,
     * після чого товар перемикається між «Купити» і «Куплено».
     */
    div.onclick = () => {
        if (quantityEditingItemId !== null) {
            closeQuantityEditor();
        }

        toggleStatus(item.id);
    };

    const savedQty = Math.max(1, Math.round(Number(item.qty) || 1));

    const isEditingQuantity = quantityEditingItemId === item.id;

    const shownQty = isEditingQuantity
        ? Math.max(1, Math.round(Number(draftQuantity) || savedQty))
        : savedQty;

    /*
     * Важливо:
     * сума завжди розраховується за збереженою кількістю.
     * Тому + та − не змінюють суму до натискання ✓.
     */
    const itemTotal = (item.price * savedQty).toFixed(2);

    const priceUnavailableClass = item.priceNotFound
        ? 'price-unavailable'
        : '';

    const unitLabel = getUnitLabel(item);

    /*
     * У звичайному стані кількість є частиною рядка назви:
     * «Молоко · 5 шт.»
     *
     * У режимі редагування кнопки −, + та ✓ з’являються одразу.
     * Завдяки цьому після натискання + не з’являється нова кнопка,
     * яка могла б посунути суму або хрестик.
     */
    const quantityControl = isEditingQuantity
        ? `
            <div class="quantity-editor" onclick="event.stopPropagation()">
                <button
                    class="quantity-adjust-btn"
                    type="button"
                    onclick="changeDraftQuantity(event, ${item.id}, -1)"
                    aria-label="Зменшити кількість"
                >
                    −
                </button>

                <span class="quantity-draft-value">
                    ${shownQty} ${unitLabel}
                </span>

                <button
                    class="quantity-adjust-btn"
                    type="button"
                    onclick="changeDraftQuantity(event, ${item.id}, 1)"
                    aria-label="Збільшити кількість"
                >
                    +
                </button>

                <button
                    class="quantity-confirm-btn"
                    type="button"
                    onclick="confirmDraftQuantity(event, ${item.id})"
                    aria-label="Підтвердити кількість"
                >
                    ✓
                </button>
            </div>
        `
        : `
            <span class="quantity-inline-value">
                · ${savedQty} ${unitLabel}
            </span>
        `;

    div.innerHTML = `
        <div class="product-info">
            <div
                class="product-img"
                onclick="event.stopPropagation(); openPicker(event, ${item.id})"
                title="Обрати товар у магазині"
            >
                ${renderProductImage(item)}
            </div>

            <div class="product-details">
                <div class="product-title-line">
                    <span
                        class="name"
                        onmousedown="startItemPressTimer(event, ${item.id})"
                        onmouseup="clearItemPressTimer(event)"
                        onmouseleave="clearItemPressTimer(event)"
                        ontouchstart="startItemPressTimer(event, ${item.id})"
                        ontouchend="clearItemPressTimer(event)"
                        ontouchmove="clearItemPressTimer(event)"
                        ontouchcancel="clearItemPressTimer(event)"
                        oncontextmenu="event.preventDefault(); openRenameProductModal(${item.id}); return false;"
                        title="Довге натискання — перейменувати"
                    >${escapeHtml(item.name)}</span>
                </div>
            </div>
        </div>

        <div class="product-actions">
            <div class="price-quantity-col">
                ${
                    appData.hiddenPrices && appData.hiddenPrices[appData.currentList]
                        ? ''
                        : `
                            <button
                                    class="item-total quantity-open-btn ${priceUnavailableClass}"
                                    type="button"
                                    onclick="startQuantityEdit(event, ${item.id})"
                                    aria-label="Змінити кількість товару"
                            >
                                ${itemTotal} ₴
                            </button>
                        `
                }

                ${quantityControl}
            </div>

            <div
                class="delete-item-btn"
                onclick="event.stopPropagation(); deleteProductItem(event, ${item.id})"
                title="Видалити товар"
            >
                ×
            </div>
        </div>
    `;

    return div;
}
function getStoreLineColor(item) {
    if (!item) {
        return '';
    }

    const lastStore = String(item.lastBoundStore || '').trim();

    if (
        lastStore === 'atb' ||
        (item.atbSelected === true &&
            String(item.atbProductId || item.atbProductUrl || '').trim())
    ) {
        return 'store-line-atb';
    }

    if (
        lastStore === 'silpo' ||
        (item.silpoSelected === true &&
            String(item.silpoProductId || item.silpoProductUrl || '').trim())
    ) {
        return 'store-line-silpo';
    }

    if (
        lastStore === 'varus' ||
        (item.varusSelected === true &&
            String(item.varusProductId || item.varusProductUrl || '').trim())
    ) {
        return 'store-line-varus';
    }

    return '';
}
function renderProductImage(item) {
    const lastStore = String(item.lastBoundStore || '').trim();

    const images = {
        atb: String(item.atbImage || '').trim(),
        silpo: String(item.silpoImage || '').trim(),
        varus: String(item.varusImage || '').trim()
    };

    const imageUrl =
        images[lastStore] ||
        images.atb ||
        images.silpo ||
        images.varus ||
        (String(item.img || '').startsWith('http') ? String(item.img).trim() : '');

    if (imageUrl) {
        return `<img src="${escapeHtml(imageUrl)}"
                     alt=""
                     onerror="this.onerror=null; this.parentNode.textContent='📦';">`;
    }

    const fallbackImg = String(item.img || '📦').trim();
    if (fallbackImg.startsWith('http')) {
        return `<img src="${escapeHtml(fallbackImg)}"
                     alt=""
                     onerror="this.onerror=null; this.parentNode.textContent='📦';">`;
    }

    return escapeHtml(fallbackImg);
}
// ==========================================
// ЗМІНА КІЛЬКОСТІ ТОВАРУ
// ==========================================
// ==========================================
// РЕДАГУВАННЯ КІЛЬКОСТІ З ПІДТВЕРДЖЕННЯМ
// ==========================================

function startQuantityEdit(event, id) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const item = (appData.lists[appData.currentList] || []).find(x => x.id === id);
    if (!item) return;

    quantityEditingItemId = id;
    draftQuantity = Math.max(1, Math.round(Number(item.qty) || 1));

    renderLists();
}

function changeDraftQuantity(event, id, delta) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    if (quantityEditingItemId !== id) return;

    draftQuantity = Math.max(
        1,
        Math.round(Number(draftQuantity) || 1) + delta
    );

    renderLists();
}

function confirmDraftQuantity(event, id) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const item = (appData.lists[appData.currentList] || []).find(x => x.id === id);
    if (!item || quantityEditingItemId !== id) return;

    item.qty = Math.max(1, Math.round(Number(draftQuantity) || 1));
    item.unitType = normalizeUnitType(item.unitType, item.name);

    saveToStorage();

    quantityEditingItemId = null;
    draftQuantity = null;

    renderLists();
}

function closeQuantityEditor() {
    quantityEditingItemId = null;
    draftQuantity = null;
    renderLists();
}
let addButtonHandledAt = 0;

function keepSearchInputFocused(event) {
    if (event) {
        event.preventDefault();
    }

    const input = document.getElementById('searchInput');

    if (input) {
        input.focus();
    }
}
// ==========================================
// 4. ДОДАВАННЯ ТОВАРУ (поле + кнопка «+» + Enter)
// ==========================================
function addTypedText(keepKeyboard = false) {
    const now = Date.now();

    if (keepKeyboard && now - addButtonHandledAt < 500) {
        return;
    }

    if (keepKeyboard) {
        addButtonHandledAt = now;
    }

    const input = document.getElementById('searchInput');
    const name = input.value.trim().replace(/\s+/g, ' ');
    if (!name) { input.focus(); return; }

    const list = appData.lists[appData.currentList];
    const existing = list.find(x => x.name.toLowerCase() === name.toLowerCase());
    if (existing) {
        showAddNotice(existing.bought
            ? 'Цей товар уже додано (він у «Куплено»)'
            : 'Цей товар уже додано');
        input.select();
        return;
    }

    const guess = guessCategory(name.toLowerCase());
    list.push({
        id: Date.now(),
        name: name,
        qty: 1,
        unitType: guessUnitType(name),
        price: 0,
        cat: guess.cat,
        img: guess.img,
        bought: false,
        priceNotFound: true
    });
    saveToStorage();
    renderLists();
    manageSharedListSync();
    input.value = '';
    hideAddNotice();

    if (keepKeyboard) {
        setTimeout(() => {
            input.focus();
        }, 50);
    }
}

function showAddNotice(text) {
    const el = document.getElementById('addNotice');
    el.innerText = text;
    el.style.display = 'block';
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(hideAddNotice, 2500);
}

function hideAddNotice() {
    clearTimeout(noticeTimer);
    const el = document.getElementById('addNotice');
    if (el) el.style.display = 'none';
}
function isIrrelevantStoreResult(productTitle, searchQuery) {
    const title = String(productTitle || '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();

    const query = String(searchQuery || '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();

    if (!title || !query || query.includes(' ')) {
        return false;
    }

    const stem = query.slice(0, 3);

    if (stem.length < 3) {
        return false;
    }

    const hasQueryForm = new RegExp(
        '(^|[^а-яїієґ])' + stem + '[а-яїієґ]*'
    ).test(title);

    if (!hasQueryForm) {
        return false;
    }

    const withoutPattern = new RegExp(
        '(^|[^а-яїієґ])без\\s*' + stem + '[а-яїієґ]*'
    );

    const withPattern = new RegExp(
        '(^|[^а-яїієґ])зі?\\s+' + stem + '[а-яїієґ]*'
    );

    const filterResult = withoutPattern.test(title) || withPattern.test(title);
    return filterResult;
}
// ==========================================
// 5. ВИБІР КОНКРЕТНОГО ТОВАРУ АТБ
// ==========================================

function openPicker(event, id) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    if (
        window.Android &&
        typeof window.Android.cancelAllStoreSearches === 'function'
    ) {
        window.Android.cancelAllStoreSearches();
    }

    const item = appData.lists[appData.currentList].find(x => x.id === id);
    if (!item) return;

    currentEditingItemId = id;
    atbPickerProducts = [];

    const modal = document.getElementById('pickerModal');
    const title = document.getElementById('pickerTitle');
    const status = document.getElementById('atbPickerStatus');
    const results = document.getElementById('atbPickerResults');

    results.innerHTML = '';
    results.scrollTop = 0;

    title.innerText = `Обрати товар у магазині: ${item.name}`;
    status.innerText =
        appData.searchStore === 'silpo'
            ? 'Шукаємо товари в Сільпо…'
            : appData.searchStore === 'varus'
                ? 'Шукаємо товари в Varus…'
                : 'Шукаємо товари в АТБ…';
    results.innerHTML = '';
    modal.style.display = 'flex';

    const requestId = ++pickerRequestGeneration;

    currentPickerStore =
        appData.searchStore === 'silpo'
            ? 'silpo'
            : appData.searchStore === 'varus'
                ? 'varus'
                : 'atb';

                silpoPickerQuery = String(item.name || '').trim();
                silpoPickerPage = 1;
                silpoPickerLoading = false;
                silpoPickerHasMore = true;

                varusPickerQuery = String(item.name || '').trim();
                varusPickerPage = 1;
                varusPickerLoading = false;
                varusPickerHasMore = true;

                atbPickerQuery = String(item.name || '').trim();
                atbPickerPage = 1;
                atbPickerLoading = false;
                atbPickerHasMore = true;

                const searchPromise =
                    currentPickerStore === 'silpo'
                        ? searchSilpoOnline(item.name)
                        : currentPickerStore === 'varus'
                            ? searchVarusOnline(item.name, 1)
                            : searchAtbOnline(item.name, 1);

        searchPromise
            .then(products => {
            // Користувач вже закрив вікно або відкрив інший товар.
            if (requestId !== pickerRequestGeneration) return;

            atbPickerProducts = Array.isArray(products) ? products : [];

            atbPickerProducts = atbPickerProducts.filter(product =>
                !isIrrelevantStoreResult(product.title, item.name)
            );

            if (atbPickerProducts.length === 0) {
                markItemAsNotFound(item.id);
                    status.innerText =
                        currentPickerStore === 'silpo'
                            ? 'Товарів Сільпо за цим запитом не знайдено. Товар перенесено до «Інше», ціна встановлена на 0.'
                            : currentPickerStore === 'varus'
                                ? 'Товарів Varus за цим запитом не знайдено. Товар перенесено до «Інше», ціна встановлена на 0.'
                                : 'Товарів АТБ за цим запитом не знайдено. Товар перенесено до «Інше», ціна встановлена на 0.';
                return;
            }

            status.innerText = `Знайдено товарів: ${atbPickerProducts.length}. Оберіть потрібний варіант.`;
            renderAtbPickerResults();

            if (currentPickerStore === 'silpo') {
                setupSilpoPickerScroll();
            }
        })
        .catch(error => {
            if (requestId !== pickerRequestGeneration) return;

            const message = String(error.message || error);

            if (message.startsWith('JAVA_DEBUG')) {
                showSilpoDiagnosticReport(message);
                return;
            }

            status.innerText = `Не вдалося виконати пошук: ${message}. Перевірте інтернет і повторіть пізніше.`;
        });
}

function renderAtbPickerResults(
    appendOnly = false,
    startIndex = 0
) {
    const results = document.getElementById('atbPickerResults');
    const moreButton = document.getElementById('loadMoreAtbButton');

    if (!appendOnly) {
        results.innerHTML = '';
    }

    atbPickerProducts.forEach((product, index) => {
        if (appendOnly && index < startIndex) {
            return;
        }
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'atb-search-result';

        const image = product.image
            ? `<img class="atb-result-image"
                    src="${escapeHtml(product.image)}"
                    alt=""
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
            : '';

            card.innerHTML = `
                <div class="atb-result-photo">
                    ${image}
                    <div class="atb-result-fallback" style="${product.image ? 'display:none;' : 'display:flex;'}">📦</div>
                </div>
                <div class="atb-result-info">
                    <div class="atb-result-name">
                        <span class="atb-result-number">${index + 1}.</span>
                        ${escapeHtml(product.title || 'Товар АТБ')}
                    </div>
                    <div class="atb-result-price">${Number(product.price || 0).toFixed(2)} грн</div>
                </div>
            `;

                card.onclick = () => {
                    if (currentPickerStore === 'silpo') {
                        selectSilpoProduct(index);
                    } else if (currentPickerStore === 'varus') {
                        selectVarusProduct(index);
                    } else {
                        selectAtbProduct(index);
                    }
                };
        results.appendChild(card);
    });
}
function selectAtbProduct(index) {
    const product = atbPickerProducts[index];
    const item = (appData.lists[appData.currentList] || []).find(
        x => x.id === currentEditingItemId
    );

    if (!item || !product) {
        return;
    }

    const officialName = String(product.title || '')
        .trim()
        .replace(/\s+/g, ' ');

    const officialId = String(product.id || '').trim();
    const officialUrl = String(product.url || '').trim();
    const officialImage = String(product.image || '').trim();
    const selectedPrice = Math.max(0, Number(product.price) || 0);

    if (!officialName || selectedPrice <= 0) {
        alert('Не вдалося зберегти дані обраного товару АТБ.');
        return;
    }

    const categoryGuess = guessCategory(officialName.toLowerCase());

    item.atbSelected = true;
    item.silpoSelected = false;
    item.varusSelected = false;
    item.lastBoundStore = 'atb';
    item.atbProductId = officialId || officialUrl || officialName;
    item.atbProductName = officialName;
    item.atbProductUrl = officialUrl;
    item.atbImage = officialImage;
    item.atbSelectedPrice = selectedPrice;

    item.price = selectedPrice;
    item.priceNotFound = false;

    /*
     * Head&Shoulders і всі шампуні не можуть потрапляти
     * до «Овочів та фруктів» через загальне fallback-правило.
     */
    const categoryText = officialName.toLowerCase();

    const isShampooOrHairCare =
        categoryText.includes('шампун') ||
        categoryText.includes('sampun') ||
        categoryText.includes('shampoo') ||
        categoryText.includes('head&shoulders') ||
        categoryText.includes('head & shoulders') ||
        categoryText.includes('head and shoulders') ||
        categoryText.includes('хед енд шолдерс');

    if (isShampooOrHairCare) {
        item.cat = 'Гігієна і косметика';
        item.img = '🧴';
    } else {
        if (categoryGuess.cat && categoryGuess.cat !== 'Інше') {
            item.cat = categoryGuess.cat;
        }

        if (!item.img || item.img === '📦') {
            item.img = categoryGuess.img;
        }
    }

    saveToStorage();

    console.log('АТБ: щойно прив’язано товар', {
        localName: item.name,
        atbSelected: item.atbSelected,
        atbProductId: item.atbProductId,
        atbProductName: item.atbProductName,
        atbProductUrl: item.atbProductUrl,
        atbSelectedPrice: item.atbSelectedPrice,
        currentPrice: item.price,
        category: item.cat
    });

    renderLists();

    const wasBindingFromPriceButton = atbBindingSessionActive;
    closePickerModal(false);

    if (wasBindingFromPriceButton) {
        atbBindingCompleted++;
        atbBindingQueueIndex++;

        setTimeout(openNextBindingItem, 200);
    }
}
function selectSilpoProduct(index) {
    const product = atbPickerProducts[index];
    const item = (appData.lists[appData.currentList] || []).find(
        x => x.id === currentEditingItemId
    );

    if (!item || !product) {
        return;
    }

    const officialName = String(product.title || '')
        .trim()
        .replace(/\s+/g, ' ');

    const officialId = String(product.id || '').trim();
    const officialUrl = String(product.url || '').trim();
    const officialImage = String(product.image || '').trim();
    const selectedPrice = Math.max(0, Number(product.price) || 0);

    if (!officialName || selectedPrice <= 0) {
        alert('Не вдалося зберегти дані обраного товару Сільпо.');
        return;
    }

    const categoryGuess = guessCategory(officialName.toLowerCase());

    item.silpoSelected = true;
    item.atbSelected = false;
    item.varusSelected = false;
    item.lastBoundStore = 'silpo';
    item.silpoProductId = officialId || officialUrl || officialName;
    item.silpoProductName = officialName;
    item.silpoProductUrl = officialUrl;
    item.silpoImage = officialImage;
    item.silpoSelectedPrice = selectedPrice;

    item.price = selectedPrice;
    item.priceNotFound = false;

    if (!item.cat || item.cat === 'Інше') {
        item.cat = categoryGuess.cat;
    }

    if (officialImage) {
        item.img = officialImage;
    } else if (!item.img || item.img === '📦') {
        item.img = categoryGuess.img;
    }

    saveToStorage();
    renderLists();
    manageSharedListSync();

    const wasBindingFromPriceButton = atbBindingSessionActive;
    closePickerModal(false);

    if (wasBindingFromPriceButton) {
        atbBindingCompleted++;
        atbBindingQueueIndex++;

        setTimeout(openNextBindingItem, 200);
    }
}
function selectVarusProduct(index) {
    const product = atbPickerProducts[index];
    const item = (appData.lists[appData.currentList] || []).find(
        x => x.id === currentEditingItemId
    );

    if (!item || !product) {
        return;
    }

    const officialName = String(product.title || '')
        .trim()
        .replace(/\s+/g, ' ');

    const officialId = String(product.id || '').trim();
    const officialUrl = String(product.url || '').trim();
    const officialImage = String(product.image || '').trim();
    const selectedPrice = Math.max(0, Number(product.price) || 0);

    if (!officialName || selectedPrice <= 0) {
        alert('Не вдалося зберегти дані обраного товару Varus.');
        return;
    }

    const categoryGuess = guessCategory(officialName.toLowerCase());

    item.varusSelected = true;
    item.atbSelected = false;
    item.silpoSelected = false;
    item.lastBoundStore = 'varus';
    item.varusProductId = officialId || officialUrl || officialName;
    item.varusProductName = officialName;
    item.varusProductUrl = officialUrl;
    item.varusImage = officialImage;
    item.varusSelectedPrice = selectedPrice;

    item.price = selectedPrice;
    item.priceNotFound = false;

    if (!item.cat || item.cat === 'Інше') {
        item.cat = categoryGuess.cat;
    }

    if (officialImage) {
        item.img = officialImage;
    } else if (!item.img || item.img === '📦') {
        item.img = categoryGuess.img;
    }

    saveToStorage();
    renderLists();
    manageSharedListSync();

    const wasBindingFromPriceButton = atbBindingSessionActive;
    closePickerModal(false);

    if (wasBindingFromPriceButton) {
        atbBindingCompleted++;
        atbBindingQueueIndex++;

        setTimeout(openNextBindingItem, 200);
    }
}
function markItemAsNotFound(id) {
    const item = appData.lists[appData.currentList].find(x => x.id === id);
    if (!item) return;

    item.price = 0;
    item.priceNotFound = true;
    item.cat = 'Інше';

    item.atbSelected = false;
    item.atbProductId = '';
    item.atbProductName = '';
    item.atbProductUrl = '';
    item.atbImage = '';

    item.silpoSelected = false;
    item.silpoProductId = '';
    item.silpoProductName = '';
    item.silpoProductUrl = '';
    item.silpoImage = '';

    item.varusSelected = false;
    item.varusProductId = '';
    item.varusProductName = '';
    item.varusProductUrl = '';
    item.varusImage = '';

    saveToStorage();
    renderLists();
    manageSharedListSync();
}

function closePickerModal(stopBindingProcess = true) {
    pickerRequestGeneration++;

    /*
     * Зупиняємо пошук в усіх трьох магазинах:
     * АТБ, Сільпо та Varus.
     * Це не ламає кнопку «Ціна», бо після закриття вікна
     * openNextBindingItem() запускає новий пошук.
     */
    if (
        window.Android &&
        typeof window.Android.cancelAllStoreSearches === 'function'
    ) {
        window.Android.cancelAllStoreSearches();
    }

    currentEditingItemId = null;
    atbPickerProducts = [];
    document.getElementById('pickerModal').style.display = 'none';

    /*
     * Якщо пошук відкрито з послідовного процесу кнопки «Ціна»,
     * «Скасувати» припиняє прив'язування не лише цього товару,
     * а й усіх наступних неприв'язаних товарів.
     */
    if (stopBindingProcess && atbBindingSessionActive) {
        finishBindingSession(true);
    }
}
// ==========================================
// 6. ЗВ'ЯЗОК З САЙТОМ АТБ ЧЕРЕЗ ПРИХОВАНИЙ WEBVIEW
// ==========================================
const pendingJava = {};
window.__onJavaFetch = function (id, body) {
    const cb = pendingJava[id];
    if (cb) { delete pendingJava[id]; cb(body); }
};

function fetchViaJava(query) {
    return new Promise((resolve, reject) => {
        if (!window.Android || typeof window.Android.fetchAtbProducts !== 'function') {
            return reject(new Error('Системний міст Android не знайдено!'));
        }
        const id = 'r' + Date.now() + Math.random().toString(36).slice(2);
        const timer = setTimeout(() => { delete pendingJava[id]; reject(new Error('Таймаут 25 с')); }, 25000);
        pendingJava[id] = body => {
            clearTimeout(timer);
            if (body.startsWith('JAVA_')) reject(new Error(body)); else resolve(body);
        };
        window.Android.fetchAtbProducts(query, id);
    });
}
function fetchAtbProductByUrl(productUrl) {
    return new Promise((resolve, reject) => {
        if (
            !window.Android ||
            typeof window.Android.fetchAtbProductByUrl !== 'function'
        ) {
            reject(
                new Error(
                    'Оновіть застосунок: модуль прямого оновлення товару АТБ не знайдено.'
                )
            );
            return;
        }

        const callbackId =
            'product_' +
            Date.now() +
            Math.random().toString(36).slice(2);

        const timer = setTimeout(() => {
            delete pendingJava[callbackId];
            reject(new Error('Таймаут 25 с'));
        }, 25000);

        pendingJava[callbackId] = body => {
            clearTimeout(timer);

            if (String(body).startsWith('JAVA_')) {
                reject(new Error(body));
                return;
            }

            try {
                const result = JSON.parse(body);

                if (!result || Number(result.price) <= 0) {
                    reject(new Error('На сторінці товару не знайдено актуальну ціну.'));
                    return;
                }

                resolve(result);
            } catch (error) {
                reject(
                    new Error(
                        'Сторінка товару АТБ повернула некоректні дані.'
                    )
                );
            }
        };

        try {
            window.Android.fetchAtbProductByUrl(productUrl, callbackId);
        } catch (error) {
            delete pendingJava[callbackId];
            clearTimeout(timer);
            reject(new Error('Не вдалося відкрити сторінку товару АТБ.'));
        }
    });
}
function searchAtbOnline(name, page = 1) {
    return new Promise((resolve, reject) => {
        if (
            !window.Android ||
            typeof window.Android.fetchAtbProducts !== 'function'
        ) {
            reject(
                new Error(
                    'Оновіть застосунок: модуль пошуку АТБ не знайдено.'
                )
            );
            return;
        }

        const callbackId =
            'atb_' +
            Date.now() +
            '_' +
            Math.random().toString(36).slice(2);

        const timer = setTimeout(() => {
            delete pendingJava[callbackId];
            reject(new Error('Таймаут 45 с'));
        }, 80000);

        pendingJava[callbackId] = body => {
            clearTimeout(timer);

            if (String(body).startsWith('JAVA_')) {
                reject(new Error(body));
                return;
            }

            resolve(body);
        };

        window.Android.fetchAtbProducts(
            String(name || '').trim(),
            Math.max(1, Number(page) || 1),
            callbackId
        );
    }).then(json => {
        const arr = JSON.parse(json);
        return Array.isArray(arr) ? arr : [];
    });
}
function searchVarusOnline(name, page = 1) {
    return new Promise((resolve, reject) => {
        if (
            !window.Android ||
            typeof window.Android.fetchVarusProducts !== 'function'
        ) {
            reject(
                new Error(
                    'Оновіть застосунок: модуль пошуку Varus не знайдено.'
                )
            );
            return;
        }

        const callbackId =
            'varus_' +
            page +
            '_' +
            Date.now() +
            '_' +
            Math.random().toString(36).slice(2);

        const timer = setTimeout(() => {
            delete pendingJava[callbackId];
            reject(new Error('Таймаут 45 с'));
        }, 80000);

        pendingJava[callbackId] = body => {
            clearTimeout(timer);

            if (String(body).startsWith('JAVA_')) {
                reject(new Error(body));
                return;
            }

            resolve(body);
        };

        window.Android.fetchVarusProducts(
            String(name || '').trim(),
            Math.max(1, Number(page) || 1),
            callbackId
        );
    }).then(json => {
        const arr = JSON.parse(json);
        return Array.isArray(arr) ? arr : [];
    });
}
function searchSilpoOnline(name) {
    return new Promise((resolve, reject) => {
        if (
            !window.Android ||
            typeof window.Android.fetchSilpoProducts !== 'function'
        ) {
            reject(
                new Error(
                    'Оновіть застосунок: модуль пошуку Сільпо не знайдено.'
                )
            );
            return;
        }

        const callbackId =
            'silpo_' +
            Date.now() +
            '_' +
            Math.random().toString(36).slice(2);

        const timer = setTimeout(() => {
            delete pendingJava[callbackId];
            reject(new Error('Таймаут 45 с'));
        }, 80000);

        pendingJava[callbackId] = body => {
            clearTimeout(timer);

            if (String(body).startsWith('JAVA_')) {
                reject(new Error(body));
                return;
            }

            resolve(body);
        };

        window.Android.fetchSilpoProducts(
            name,
            appData.silpoFilialId || '',
            callbackId
        );
    }).then(json => {
        const arr = JSON.parse(json);
        return Array.isArray(arr) ? arr : [];
    });
}
function searchVarusOnline(name, page) {
    return new Promise((resolve, reject) => {
        if (
            !window.Android ||
            typeof window.Android.fetchVarusProducts !== 'function'
        ) {
            reject(
                new Error(
                    'Оновіть застосунок: модуль пошуку Varus не знайдено.'
                )
            );
            return;
        }

        const callbackId =
            'varus_' +
            Date.now() +
            '_' +
            Math.random().toString(36).slice(2);

        const timer = setTimeout(() => {
            delete pendingJava[callbackId];
            reject(new Error('Таймаут 45 с'));
        }, 80000);

        pendingJava[callbackId] = body => {
            clearTimeout(timer);

            if (String(body).startsWith('JAVA_')) {
                reject(new Error(body));
                return;
            }

            resolve(body);
        };

        window.Android.fetchVarusProducts(
            String(name || '').trim(),
            Math.max(1, Number(page) || 1),
            callbackId
        );
    }).then(json => {
        const arr = JSON.parse(json);
        return Array.isArray(arr) ? arr : [];
    });
}
let silpoPickerQuery = '';
let silpoPickerPage = 1;
let silpoPickerLoading = false;
let silpoPickerHasMore = true;

let varusPickerQuery = '';
let varusPickerPage = 1;
let varusPickerLoading = false;
let varusPickerHasMore = true;
let atbPickerPage = 1;
let atbPickerLoading = false;
let atbPickerHasMore = true;
let atbPickerQuery = '';
let atbScrollListenerAttached = false;

function maybeLoadMoreAtbResults() {
    if (currentPickerStore !== 'atb') return;
    if (!atbPickerHasMore) return;
    if (atbPickerLoading) return;
    if (!atbPickerQuery) return;

    const results = document.getElementById('atbPickerResults');

    if (!results) return;
    if (results.scrollHeight <= results.clientHeight) return;

    const nearBottom =
        results.scrollTop + results.clientHeight >=
        results.scrollHeight - 750;

    if (!nearBottom) return;

    loadMoreAtbPickerResults();
}

function attachAtbPickerScrollListener() {
    if (atbScrollListenerAttached) return;

    const results = document.getElementById('atbPickerResults');

    if (!results) return;

    results.addEventListener('scroll', maybeLoadMoreAtbResults);

    atbScrollListenerAttached = true;
}

async function loadMoreAtbPickerResults() {
    if (atbPickerLoading || !atbPickerHasMore) return;
    if (!atbPickerQuery) return;

    atbPickerLoading = true;

    const status = document.getElementById('atbPickerStatus');
    const results = document.getElementById('atbPickerResults');

    if (status) {
        status.innerText =
            'Завантажуємо ще товари АТБ…';
    }

    try {
        const nextPage = atbPickerPage + 1;
        const moreProducts = await searchAtbOnline(
            atbPickerQuery,
            nextPage
        );

        if (currentPickerStore !== 'atb') {
            atbPickerLoading = false;
            return;
        }

        const currentItemName = atbPickerQuery;

        const filtered = moreProducts.filter(product =>
            !isIrrelevantStoreResult(product.title, currentItemName)
        );

        if (!filtered.length) {
            atbPickerHasMore = false;

            if (status) {
                status.innerText =
                    'Більше товарів АТБ за цим запитом немає.';
            }

            atbPickerLoading = false;
            return;
        }

        const firstNewIndex = atbPickerProducts.length;

        atbPickerPage = nextPage;
        atbPickerProducts = atbPickerProducts.concat(filtered);

        filtered.forEach((product, offset) => {
            const index = firstNewIndex + offset;

            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'atb-search-result';

            const image = product.image
                ? `<img class="atb-result-image"
                        src="${escapeHtml(product.image)}"
                        alt=""
                        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
                : '';

            card.innerHTML = `
                <div class="atb-result-photo">
                    ${image}
                    <div class="atb-result-fallback" style="${product.image ? 'display:none;' : 'display:flex;'}">📦</div>
                </div>
                <div class="atb-result-info">
                    <div class="atb-result-name">
                        <span class="atb-result-number">${index + 1}.</span>
                        ${escapeHtml(product.title || 'Товар АТБ')}
                    </div>
                    <div class="atb-result-price">${Number(product.price || 0).toFixed(2)} грн</div>
                </div>
            `;

            card.onclick = () => {
                selectAtbProduct(index);
            };

            if (results) {
                results.appendChild(card);
            }
        });

        if (status) {
            status.innerText =
                'Знайдено товарів: ' +
                atbPickerProducts.length +
                '. Оберіть потрібний варіант.';
        }

        atbPickerLoading = false;
    } catch (error) {
        atbPickerLoading = false;

        if (status) {
            status.innerText =
                'Не вдалося довантажити ще товари АТБ: ' +
                String(error.message || error);
        }
    }
}

function searchSilpoOnlinePage(name, page) {
    return new Promise((resolve, reject) => {
        if (
            !window.Android ||
            typeof window.Android.fetchSilpoProductsPage !== 'function'
        ) {
            reject(
                new Error(
                    'Оновіть застосунок: довантаження Сільпо не знайдено.'
                )
            );
            return;
        }

        const callbackId =
            'silpo_page_' +
            page +
            '_' +
            Date.now() +
            '_' +
            Math.random().toString(36).slice(2);

        const timer = setTimeout(() => {
            delete pendingJava[callbackId];
            reject(new Error('Таймаут 45 с'));
        }, 80000);

        pendingJava[callbackId] = body => {
            clearTimeout(timer);

            if (String(body).startsWith('JAVA_')) {
                reject(new Error(body));
                return;
            }

            resolve(body);
        };

        window.Android.fetchSilpoProductsPage(
            name,
            appData.silpoFilialId || '',
            page,
            callbackId
        );
    }).then(json => {
        const arr = JSON.parse(json);
        return Array.isArray(arr) ? arr : [];
    });
}

function setupSilpoPickerScroll() {
    const results = document.getElementById('atbPickerResults');

    if (!results) return;

    results.onscroll = function () {
        if (currentPickerStore !== 'silpo') return;
        if (!silpoPickerHasMore) return;
        if (silpoPickerLoading) return;
        if (results.scrollHeight <= results.clientHeight) return;

        const nearBottom =
            results.scrollTop + results.clientHeight >=
            results.scrollHeight - 750;

        if (!nearBottom) return;

        loadMoreSilpoPickerResults();
    };
}

async function loadMoreSilpoPickerResults() {
    if (silpoPickerLoading || !silpoPickerHasMore) return;
    if (!silpoPickerQuery) return;

    silpoPickerLoading = true;
    showSilpoLoadingLine(true);

    const status = document.getElementById('atbPickerStatus');
    const results = document.getElementById('atbPickerResults');

    if (status) {
        status.innerText =
            'Завантажуємо ще товари Сільпо…';
    }

    try {
        const nextPage = silpoPickerPage + 1;
        const moreProducts = await searchSilpoOnlinePage(
            silpoPickerQuery,
            nextPage
        );

        if (currentPickerStore !== 'silpo') {
            silpoPickerLoading = false;
            return;
        }

        const currentItemName = silpoPickerQuery;

        const filtered = moreProducts.filter(product =>
            !isIrrelevantStoreResult(product.title, currentItemName)
        );

        if (!filtered.length) {
            silpoPickerHasMore = false;

            if (status) {
                status.innerText =
                    'Більше товарів Сільпо за цим запитом немає.';
            }

            silpoPickerLoading = false;
            return;
        }

        silpoPickerPage = nextPage;

        const previousCount = atbPickerProducts.length;

        atbPickerProducts = atbPickerProducts.concat(filtered);

        renderAtbPickerResults(true, previousCount);

        if (status) {
            status.innerText =
                'Знайдено товарів: ' +
                atbPickerProducts.length +
                '. Оберіть потрібний варіант.';
        }

            silpoPickerLoading = false;
            showSilpoLoadingLine(false);
        } catch (error) {
            silpoPickerLoading = false;
            showSilpoLoadingLine(false);

        if (status) {
            status.innerText =
                'Не вдалося довантажити ще товари Сільпо: ' +
                String(error.message || error);
        }
    }
}
async function loadMoreVarusPickerResults() {
    if (varusPickerLoading || !varusPickerHasMore) return;
    if (!varusPickerQuery) return;

    varusPickerLoading = true;
    showSilpoLoadingLine(true);

    const status = document.getElementById('atbPickerStatus');
    const results = document.getElementById('atbPickerResults');

    if (status) {
        status.innerText =
            'Завантажуємо ще товари Varus…';
    }

    try {
        const nextPage = varusPickerPage + 1;
        const moreProducts = await searchVarusOnline(
            varusPickerQuery,
            nextPage
        );

        if (currentPickerStore !== 'varus') {
            varusPickerLoading = false;
            showSilpoLoadingLine(false);
            return;
        }

        const currentItemName = varusPickerQuery;

        const filtered = moreProducts.filter(product =>
            !isIrrelevantStoreResult(product.title, currentItemName)
        );

        if (!filtered.length) {
            varusPickerHasMore = false;

            if (status) {
                status.innerText =
                    'Більше товарів Varus за цим запитом немає.';
            }

            varusPickerLoading = false;
            showSilpoLoadingLine(false);
            return;
        }

        const firstNewIndex = atbPickerProducts.length;

        varusPickerPage = nextPage;
        atbPickerProducts = atbPickerProducts.concat(filtered);

        filtered.forEach((product, offset) => {
            const index = firstNewIndex + offset;

            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'atb-search-result';

            const image = product.image
                ? `<img class="atb-result-image"
                        src="${escapeHtml(product.image)}"
                        alt=""
                        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
                : '';

            card.innerHTML = `
                <div class="atb-result-photo">
                    ${image}
                    <div class="atb-result-fallback" style="${product.image ? 'display:none;' : 'display:flex;'}">📦</div>
                </div>
                <div class="atb-result-info">
                    <div class="atb-result-name">
                        <span class="atb-result-number">${index + 1}.</span>
                        ${escapeHtml(product.title || 'Товар Varus')}
                    </div>
                    <div class="atb-result-price">${Number(product.price || 0).toFixed(2)} грн</div>
                </div>
            `;

            card.onclick = () => {
                selectVarusProduct(index);
            };

            if (results) {
                results.appendChild(card);
            }
        });

        if (status) {
            status.innerText =
                'Знайдено товарів: ' +
                atbPickerProducts.length +
                '. Оберіть потрібний варіант.';
        }

        varusPickerLoading = false;
        showSilpoLoadingLine(false);
    } catch (error) {
        varusPickerLoading = false;
        showSilpoLoadingLine(false);

        if (status) {
            status.innerText =
                'Не вдалося довантажити ще товари Varus: ' +
                String(error.message || error);
        }
    }
}
function showSilpoLoadingLine(visible) {
    const line = document.getElementById('silpoLoadingLine');

    if (!line) return;

    line.style.display = visible ? 'block' : 'none';
}
// ==========================================
// 7. КНОПКА «ЦІНА» — ТОЧНЕ ОНОВЛЕННЯ ЦІН АТБ
// ==========================================

function normalizeAtbText(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
}

function isAtbLinked(item) {
    return Boolean(
        item &&
        item.atbSelected === true &&
        String(item.atbProductId || item.atbProductUrl || '').trim()
    );
}
function isVarusLinked(item) {
    return Boolean(
        item &&
        item.varusSelected === true &&
        String(item.varusProductId || '').trim()
    );
}

function findExactAtbProduct(item, foundProducts) {
    if (!Array.isArray(foundProducts) || foundProducts.length === 0) {
        return null;
    }

    const savedId = String(item.atbProductId || '').trim();
    const savedUrl = String(item.atbProductUrl || '').trim();
    const savedName = normalizeAtbText(item.atbProductName);

    /*
     * atbSelectedPrice — ціна в момент, коли користувач вручну
     * обрав точний товар у списку АТБ.
     *
     * Для старих товарів, де цього поля ще немає, використовуємо
     * поточну ціну товару як запасний варіант.
     */
    const savedPrice = Number(
        item.atbSelectedPrice || item.price || 0
    );

    // 1. Найнадійніше: стабільний ID товару.
    if (savedId) {
        const byId = foundProducts.find(product =>
            String(product.id || '').trim() === savedId
        );

        if (byId) {
            return byId;
        }
    }

    // 2. Якщо ID не збігся — звіряємо повний URL картки.
    if (savedUrl) {
        const byUrl = foundProducts.find(product =>
            String(product.url || '').trim() === savedUrl
        );

        if (byUrl) {
            return byUrl;
        }
    }

    // 3. Повний нормалізований збіг назви.
    if (savedName) {
        const byName = foundProducts.find(product =>
            normalizeAtbText(product.title) === savedName
        );

        if (byName) {
            return byName;
        }
    }

    /*
     * 4. Обережний запасний варіант.
     *
     * Порівнюємо частини повної збереженої назви й ціну, за якою
     * товар обирався вручну. Не оновлюємо товар лише за схожою назвою:
     * це могло б підмінити, наприклад, Head&Shoulders іншим шампунем.
     *
     * Такий варіант працює лише для ціни, яка ще не змінилася.
     * Коли ціна зміниться, коректний ID або URL повинні спрацювати
     * в пунктах 1–2.
     */
    if (savedName && savedPrice > 0) {
        const bySimilarNameAndSavedPrice = foundProducts.find(product => {
            const foundName = normalizeAtbText(product.title);
            const foundPrice = Number(product.price || 0);

            const namesAreCompatible =
                foundName === savedName ||
                foundName.includes(savedName) ||
                savedName.includes(foundName);

            return (
                namesAreCompatible &&
                Math.abs(foundPrice - savedPrice) < 0.01
            );
        });

        if (bySimilarNameAndSavedPrice) {
            return bySimilarNameAndSavedPrice;
        }
    }

    console.warn('ATB: точний товар не знайдено', {
        localName: item.name,
        savedId: savedId,
        savedUrl: savedUrl,
        savedName: savedName,
        savedPrice: savedPrice,
        receivedProducts: foundProducts.map(product => ({
            id: product.id,
            title: product.title,
            price: product.price,
            url: product.url
        }))
    });

    return null;
}
function isSilpoLinked(item) {
    return Boolean(
        item &&
        item.silpoSelected === true &&
        String(item.silpoProductId || '').trim()
    );
}

function normalizeSilpoText(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
}

function findExactSilpoProduct(item, foundProducts) {
    if (!Array.isArray(foundProducts) || foundProducts.length === 0) {
        return null;
    }

    const savedId = String(item.silpoProductId || '').trim();
    const savedUrl = String(item.silpoProductUrl || '').trim();
    const savedName = normalizeSilpoText(item.silpoProductName);

    if (savedId) {
        const byId = foundProducts.find(product =>
            String(product.id || '').trim() === savedId
        );

        if (byId) {
            return byId;
        }
    }

    if (savedUrl) {
        const byUrl = foundProducts.find(product =>
            String(product.url || '').trim() === savedUrl
        );

        if (byUrl) {
            return byUrl;
        }
    }

    if (savedName) {
        const byName = foundProducts.find(product =>
            normalizeSilpoText(product.title) === savedName
        );

        if (byName) {
            return byName;
        }

        const bySimilarName = foundProducts.find(product => {
            const productName = normalizeSilpoText(product.title);

            if (!productName) {
                return false;
            }

            return (
                productName.includes(savedName) ||
                savedName.includes(productName)
            );
        });

        if (bySimilarName) {
            return bySimilarName;
        }
    }

    return null;
}
function findExactVarusProduct(item, foundProducts) {
    if (!Array.isArray(foundProducts) || foundProducts.length === 0) {
        return null;
    }

    const savedId = String(item.varusProductId || '').trim();
    const savedUrl = String(item.varusProductUrl || '').trim();
    const savedName = normalizeHistoryText(item.varusProductName);

    if (savedId) {
        const byId = foundProducts.find(product =>
            String(product.id || '').trim() === savedId
        );

        if (byId) {
            return byId;
        }
    }

    if (savedUrl) {
        const byUrl = foundProducts.find(product =>
            String(product.url || '').trim() === savedUrl
        );

        if (byUrl) {
            return byUrl;
        }
    }

    if (savedName) {
        const byExactName = foundProducts.find(product => {
            const productName = normalizeHistoryText(product.title);

            return productName === savedName;
        });

        if (byExactName) {
            return byExactName;
        }

        const bySimilarName = foundProducts.find(product => {
            const productName = normalizeHistoryText(product.title);

            if (!productName) {
                return false;
            }

            return (
                productName.includes(savedName) ||
                savedName.includes(productName)
            );
        });

        if (bySimilarName) {
            return bySimilarName;
        }
    }

    return null;
}
async function triggerGoogleAnalytics() {
    if (
        window.Android &&
        typeof window.Android.cancelAllStoreSearches === 'function'
    ) {
        window.Android.cancelAllStoreSearches();
    }

    const items = appData.lists[appData.currentList] || [];

    if (items.length === 0) {
        alert('Ваш список порожній. Додайте товари для оновлення цін.');
        return;
    }

    const linkedItems = items.filter(item =>
        isVarusLinked(item) || isSilpoLinked(item) || isAtbLinked(item)
    );

    const unlinkedItems = items.filter(item =>
        !isVarusLinked(item) && !isSilpoLinked(item) && !isAtbLinked(item)
    );

    let updatedCount = 0;
    let unavailableCount = 0;
    const unavailableNames = [];

    showPriceProgress(
        linkedItems.length > 0
            ? `Оновлюємо ціни: 0 із ${linkedItems.length}…`
            : 'У списку немає товарів, прив’язаних до АТБ, Сільпо або Varus.'
    );

    for (let index = 0; index < linkedItems.length; index++) {
        const item = linkedItems[index];

        const lastStore = String(item.lastBoundStore || '').trim();
        const isVarusItem = lastStore === 'varus' || (lastStore === '' && isVarusLinked(item));
        const isSilpoItem = lastStore === 'silpo' || (lastStore === '' && !isVarusLinked(item) && isSilpoLinked(item));

        showPriceProgress(
            `Оновлюємо ціни: ${index + 1} із ${linkedItems.length}…\n${item.name}`
        );

        try {
            const officialSearchName = String(
                isVarusItem
                    ? item.varusProductName || item.name || ''
                    : isSilpoItem
                        ? item.silpoProductName || item.name || ''
                        : item.atbProductName || item.name || ''
            ).trim();

            if (!officialSearchName) {
                throw new Error(
                    isVarusItem
                        ? 'Відсутня назва товару для пошуку в Varus.'
                        : isSilpoItem
                            ? 'Відсутня назва товару для пошуку в Сільпо.'
                            : 'Відсутня назва товару для пошуку в АТБ.'
                );
            }

            let foundProducts = isVarusItem
                ? await searchVarusOnline(item.name, 1)
                : isSilpoItem
                    ? await searchSilpoOnline(officialSearchName)
                    : await searchAtbOnline(officialSearchName);

            if (isVarusItem && (!Array.isArray(foundProducts) || foundProducts.length === 0) && officialSearchName && officialSearchName !== item.name) {
                foundProducts = await searchVarusOnline(officialSearchName, 1);
            }

            const exactProduct = isVarusItem
                ? findExactVarusProduct(item, foundProducts)
                : isSilpoItem
                    ? findExactSilpoProduct(item, foundProducts)
                    : findExactAtbProduct(item, foundProducts);

                
            if (exactProduct && Number(exactProduct.price) > 0) {
                item.price = Number(exactProduct.price);
                item.priceNotFound = false;

                if (isVarusItem) {
                    item.varusProductId = String(
                        exactProduct.id || item.varusProductId || ''
                    );

                    item.varusProductName = String(
                        exactProduct.title || item.varusProductName || ''
                    );

                    item.varusProductUrl = String(
                        exactProduct.url || item.varusProductUrl || ''
                    );

                    if (exactProduct.image) {
                        item.varusImage = String(exactProduct.image);
                        item.img = String(exactProduct.image);
                    }
                } else if (isSilpoItem) {
                    item.silpoProductId = String(
                        exactProduct.id || item.silpoProductId || ''
                    );

                    item.silpoProductName = String(
                        exactProduct.title || item.silpoProductName || ''
                    );

                    item.silpoProductUrl = String(
                        exactProduct.url || item.silpoProductUrl || ''
                    );

                    if (exactProduct.image) {
                        item.silpoImage = String(exactProduct.image);
                    }
                } else {
                    item.atbProductId = String(
                        exactProduct.id || item.atbProductId || ''
                    );

                    item.atbProductName = String(
                        exactProduct.title || item.atbProductName || ''
                    );

                    item.atbProductUrl = String(
                        exactProduct.url || item.atbProductUrl || ''
                    );

                    if (exactProduct.image) {
                        item.atbImage = String(exactProduct.image);
                    }
                }

                updatedCount++;
            } else if (
                !isVarusItem &&
                !isSilpoItem &&
                Number(item.atbSelectedPrice) > 0
            ) {
                item.price = Number(item.atbSelectedPrice);
                item.priceNotFound = false;
                updatedCount++;

                console.info(
                    'АТБ: використано ціну з щойно обраної картки',
                    {
                        item: item.name,
                        officialName: item.atbProductName,
                        price: item.atbSelectedPrice
                    }
                );
            } else {
                item.priceNotFound = true;
                unavailableCount++;
                unavailableNames.push(item.name);
            }
        } catch (error) {
            console.warn(
                isVarusItem
                    ? 'Varus: не вдалося оновити ціну товару'
                    : isSilpoItem
                        ? 'Сільпо: не вдалося оновити ціну товару'
                        : 'АТБ: не вдалося оновити ціну товару',
                item.name,
                error
            );

            item.priceNotFound = true;
            unavailableCount++;
            unavailableNames.push(item.name);
        }
    }

    saveToStorage();
    renderLists();
    manageSharedListSync();
    closePriceProgress();

    showPriceUpdateReport({
        linkedCount: linkedItems.length,
        updatedCount: updatedCount,
        unavailableCount: unavailableCount,
        unavailableNames: unavailableNames,
        unlinkedItems: unlinkedItems
    });
}
function showPriceProgress(text) {
    const modal = document.getElementById('priceProgressModal');
    const message = document.getElementById('priceProgressText');

    if (!modal || !message) return;

    message.innerText = text;
    modal.style.display = 'flex';
}

function closePriceProgress() {
    const modal = document.getElementById('priceProgressModal');
    if (modal) modal.style.display = 'none';
}

function showPriceUpdateReport(result) {
    const modal = document.getElementById('priceUpdateModal');
    const summary = document.getElementById('priceUpdateSummary');
    const unavailableBlock = document.getElementById('priceUnavailableBlock');
    const unavailableList = document.getElementById('priceUnavailableList');
    const unlinkedBlock = document.getElementById('priceUnlinkedBlock');
    const unlinkedList = document.getElementById('priceUnlinkedList');
    const bindYesButton = document.getElementById('bindUnlinkedYesButton');
    const bindNoButton = document.getElementById('bindUnlinkedNoButton');

    summary.innerText = result.linkedCount === 0
        ? 'Немає обраних товарів у магазині для оновлення ціни.'
        : `Ціни оновлено: ${result.updatedCount} із ${result.linkedCount}.`;

    unavailableList.innerHTML = '';

    if (result.unavailableCount > 0) {
        unavailableBlock.style.display = 'block';

        result.unavailableNames.forEach(name => {
            const line = document.createElement('div');
            line.className = 'price-report-item';
            line.innerText = `• ${name}`;
            unavailableList.appendChild(line);
        });
    } else {
        unavailableBlock.style.display = 'none';
    }

    unlinkedList.innerHTML = '';

    if (result.unlinkedItems.length > 0) {
        unlinkedBlock.style.display = 'block';

        result.unlinkedItems.forEach(item => {
            const line = document.createElement('div');
            line.className = 'price-report-item';
            line.innerText = `• ${item.name}`;
            unlinkedList.appendChild(line);
        });

        bindYesButton.style.display = 'block';
        bindNoButton.innerText = 'Ні';
    } else {
        unlinkedBlock.style.display = 'none';
        bindYesButton.style.display = 'none';
        bindNoButton.innerText = 'Закрити';
    }

    modal.style.display = 'flex';
}

function closePriceUpdateReport() {
    document.getElementById('priceUpdateModal').style.display = 'none';
}

function beginBindingUnlinkedItems() {
    const items = appData.lists[appData.currentList] || [];

    atbBindingQueue = items
        .filter(item => !isVarusLinked(item) && !isSilpoLinked(item) && !isAtbLinked(item))
        .map(item => item.id);

    closePriceUpdateReport();

    if (atbBindingQueue.length === 0) {
        return;
    }

    atbBindingQueueIndex = 0;
    atbBindingCompleted = 0;
    atbBindingTotal = atbBindingQueue.length;
    atbBindingSessionActive = true;

    openNextBindingItem();
}

function openNextBindingItem() {
    if (!atbBindingSessionActive) return;

    if (atbBindingQueueIndex >= atbBindingQueue.length) {
        finishBindingSession(false);
        return;
    }

    const itemId = atbBindingQueue[atbBindingQueueIndex];
    const item = appData.lists[appData.currentList].find(x => x.id === itemId);

    if (!item || isVarusLinked(item) || isSilpoLinked(item) || isAtbLinked(item)) {
        atbBindingQueueIndex++;
        openNextBindingItem();
        return;
    }

    openPicker(null, item.id);
}

function finishBindingSession(cancelled) {
    const remainingIds = atbBindingQueue.slice(atbBindingQueueIndex);
    const remainingItems = (appData.lists[appData.currentList] || [])
        .filter(item => remainingIds.includes(item.id) && !isVarusLinked(item) && !isSilpoLinked(item) && !isAtbLinked(item));

    const completed = atbBindingCompleted;
    const total = atbBindingTotal;

    atbBindingSessionActive = false;
    atbBindingQueue = [];
    atbBindingQueueIndex = 0;
    atbBindingCompleted = 0;
    atbBindingTotal = 0;

    showBindingResult(completed, total, remainingItems, cancelled);
}

function showBindingResult(completed, total, remainingItems, cancelled) {
    const modal = document.getElementById('bindingResultModal');
    const text = document.getElementById('bindingResultText');
    const list = document.getElementById('bindingResultList');

    text.innerText = cancelled
        ? `Вибір товарів у магазині зупинено. Обрано: ${completed} із ${total}.`
        : `Вибір товарів у магазині завершено. Обрано: ${completed} із ${total}.`;

    list.innerHTML = '';

    if (remainingItems.length > 0) {
        const title = document.createElement('div');
        title.className = 'binding-result-caption';
        title.innerText = 'Не обрано:';
        list.appendChild(title);

        remainingItems.forEach(item => {
            const line = document.createElement('div');
            line.className = 'price-report-item';
            line.innerText = `• ${item.name}`;
            list.appendChild(line);
        });
    }

    modal.style.display = 'flex';
}

function closeBindingResult() {
    document.getElementById('bindingResultModal').style.display = 'none';
}
// ==========================================
// 8. ВИДАЛЕННЯ ТОВАРУ
// ==========================================
function deleteProductItem(event, id) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    itemToDeleteId = id;
    let item = appData.lists[appData.currentList].find(x => x.id === id);
    if (item) {
        document.getElementById('deleteModalText').innerText = `Ви дійсно хочете видалити "${item.name}" зі списку?`;
    }
    document.getElementById('deleteConfirmModal').style.display = 'flex';
}

function confirmProductDeletion() {
    if (itemToDeleteId === null) return;
    let items = appData.lists[appData.currentList] || [];
    appData.lists[appData.currentList] = items.filter(x => x.id !== itemToDeleteId);
    saveToStorage();
    renderLists();
    manageSharedListSync();
    closeDeleteModal();
}

function closeDeleteModal() {
    document.getElementById('deleteConfirmModal').style.display = 'none';
    itemToDeleteId = null;
}

// ==========================================
// 9. ЛОГОТИПИ МАГАЗИНІВ
// ==========================================
let tempSelectedShopPhoto = '';
let shopPhotosLoading = false;

/*
 * Тимчасові локальні варіанти для кнопки «Мої іконки».
 *
 * Пізніше їх можна замінити на 6 справжніх локальних фото:
 * наприклад file:///android_asset/icon1.png ... icon6.png.
 */
const myShopIcons = [
    'file:///android_asset/atb.png',
    'file:///android_asset/silpo.png',
    'file:///android_asset/brij.jpeg',
    'file:///android_asset/Varus.jpeg',
    'file:///android_asset/Thresh.png',
    'file:///android_asset/Fora.png'
];

function getPhotoOptions() {
    if (!appData.photoOptions || typeof appData.photoOptions !== 'object') {
        appData.photoOptions = {};
    }

    return appData.photoOptions;
}

function getPhotoOptionsForList(listKey) {
    const options = getPhotoOptions();
    const value = options[listKey];

    return Array.isArray(value) ? value : [];
}

function savePhotoOptionsForList(listKey, photos) {
    const options = getPhotoOptions();

    options[listKey] = Array.isArray(photos)
        ? photos.slice(0, 6)
        : [];

    saveToStorage();
}

function fetchGoogleImagesViaJava(query) {
    return new Promise((resolve, reject) => {
        if (
            !window.Android ||
            typeof window.Android.fetchGoogleImages !== 'function'
        ) {
            reject(
                new Error(
                    'Оновіть застосунок: модуль пошуку Google Картинок не знайдено.'
                )
            );
            return;
        }

        const callbackId =
            'google_images_' +
            Date.now() +
            '_' +
            Math.random().toString(36).slice(2);

        const timer = setTimeout(() => {
            delete pendingJava[callbackId];
            reject(new Error('Таймаут пошуку фото 25 с'));
        }, 30000);

        pendingJava[callbackId] = body => {
            clearTimeout(timer);

            if (String(body).startsWith('JAVA_')) {
                reject(new Error(body));
                return;
            }

            resolve(body);
        };

        window.Android.fetchGoogleImages(query, callbackId);
    });
}

/*
 * Фоновий пошук після створення нового списку.
 *
 * Для АТБ і Сільпо пошук не запускаємо:
 * у них уже є власні локальні логотипи.
 */
function searchListPhotosInBackground(listKey) {
    if (listKey === 'atb' || listKey === 'silpo') {
        return;
    }

    const query = String(
        appData.listNames[listKey] || ''
    ).trim();

    if (!query) {
        return;
    }

    fetchGoogleImagesViaJava(query)
        .then(json => {
            const parsed = JSON.parse(json);
            const photos = Array.isArray(parsed)
                ? parsed
                      .map(item => String(item.image || '').trim())
                      .filter(image => image.length > 0)
                : [];

            if (photos.length > 0) {
                savePhotoOptionsForList(listKey, photos);
            }
        })
        .catch(error => {
            console.warn(
                'Не вдалося виконати фоновий пошук фото:',
                error
            );
        });
}

function setShopPhotosLoading(isLoading) {
    shopPhotosLoading = isLoading;

    const loader = document.getElementById('shopPhotoLoading');
    const grid = document.getElementById('shopPhotoGrid');

    if (loader) {
        loader.style.display = isLoading ? 'block' : 'none';
    }

    if (grid) {
        grid.style.display = isLoading ? 'none' : 'grid';
    }
}

function openShopLogoPicker() {
    const listKey = appData.currentList;

    tempSelectedShopPhoto =
        appData.logos[listKey] ||
        myShopIcons[0];

    document.getElementById('shopLogoModal').style.display = 'flex';

    const searchInput = document.getElementById('shopPhotoSearchInput');

    if (searchInput) {
        searchInput.value =
            appData.listNames[listKey] || '';
    }

    if (listKey === 'atb' || listKey === 'silpo') {
        setShopPhotosLoading(false);

        renderShopPhotoGrid([
            appData.logos[listKey] || myShopIcons[0],
            ...myShopIcons.slice(1)
        ]);

        return;
    }

    const savedPhotos = getPhotoOptionsForList(listKey);

    if (savedPhotos.length > 0) {
        setShopPhotosLoading(false);
        renderShopPhotoGrid(savedPhotos);
        return;
    }

    setShopPhotosLoading(true);
    renderShopPhotoGrid([]);

    fetchGoogleImagesViaJava(
        appData.listNames[listKey] || ''
    )
        .then(json => {
            const parsed = JSON.parse(json);

            const photos = Array.isArray(parsed)
                ? parsed
                      .map(item => String(item.image || '').trim())
                      .filter(image => image.length > 0)
                      .slice(0, 6)
                : [];

            if (photos.length > 0) {
                savePhotoOptionsForList(listKey, photos);
                tempSelectedShopPhoto = photos[0];
                setShopPhotosLoading(false);
                renderShopPhotoGrid(photos);
                return;
            }

            setShopPhotosLoading(false);
            renderShopPhotoGrid(myShopIcons);
        })
                .catch(error => {
                    const message = String(error.message || error);

                    setShopPhotosLoading(false);
                    renderShopPhotoGrid(myShopIcons);

                    if (message.startsWith('JAVA_DEBUG')) {
                        showSilpoDiagnosticReport(message);
                    } else {
                        console.warn('Помилка пошуку фото:', error);
                    }
                });
}

function renderShopPhotoGrid(photoUrls) {
    const grid = document.getElementById('shopPhotoGrid');

    if (!grid) {
        return;
    }

    grid.innerHTML = '';

    const photos = Array.isArray(photoUrls) && photoUrls.length > 0
        ? photoUrls
        : myShopIcons;

    photos.slice(0, 6).forEach(url => {
        const option = document.createElement('div');

        option.className = `photo-option ${
            url === tempSelectedShopPhoto ? 'selected' : ''
        }`;

        const image = document.createElement('img');

        image.src = url;
        image.alt = '';
        image.style.cssText =
            'width:100%; height:100%; object-fit:contain; background:#ffffff; border-radius:6px;';

        image.onerror = () => {
            image.onerror = null;
            image.src = defaultShopIcon;
        };

        option.appendChild(image);

        option.onclick = () => {
            document
                .querySelectorAll('#shopPhotoGrid .photo-option')
                .forEach(element => {
                    element.classList.remove('selected');
                });

            option.classList.add('selected');
            tempSelectedShopPhoto = url;
        };

        grid.appendChild(option);
    });
}

function searchNewShopPhotos() {
    const listKey = appData.currentList;
    const input = document.getElementById('shopPhotoSearchInput');

    if (!input) {
        return;
    }

    const query = input.value.trim();

    if (!query) {
        alert('Введіть запит для пошуку фото.');
        return;
    }

    setShopPhotosLoading(true);
    renderShopPhotoGrid([]);

    fetchGoogleImagesViaJava(query)
        .then(json => {
            const parsed = JSON.parse(json);

            const photos = Array.isArray(parsed)
                ? parsed
                      .map(item => String(item.image || '').trim())
                      .filter(image => image.length > 0)
                      .slice(0, 6)
                : [];

            if (photos.length > 0) {
                savePhotoOptionsForList(listKey, photos);
                tempSelectedShopPhoto = photos[0];
                setShopPhotosLoading(false);
                renderShopPhotoGrid(photos);
                return;
            }

            setShopPhotosLoading(false);
            renderShopPhotoGrid(myShopIcons);
        })
                .catch(error => {
                    const message = String(error.message || error);

                    setShopPhotosLoading(false);
                    renderShopPhotoGrid(myShopIcons);

                    if (message.startsWith('JAVA_DEBUG')) {
                        showSilpoDiagnosticReport(message);
                    } else {
                        console.warn('Помилка пошуку фото:', error);
                    }
                });
}

function showMyShopIcons() {
    setShopPhotosLoading(false);
    tempSelectedShopPhoto = myShopIcons[0];
    renderShopPhotoGrid(myShopIcons);
}
function saveShopLogoChanges() {
    appData.logos[appData.currentList] = tempSelectedShopPhoto;
    saveToStorage();
    const logoEl = document.getElementById('shopLogo');
    setShopLogoImage(tempSelectedShopPhoto);
    closeShopLogoModal();
}

function closeShopLogoModal() { document.getElementById('shopLogoModal').style.display = 'none'; }

// ==========================================
// 10. ІНШЕ
let itemPressTimer = null;

function startItemPressTimer(event, id) {
    if (itemPressTimer) {
        clearTimeout(itemPressTimer);
    }
    itemPressTimer = setTimeout(() => {
        itemPressTimer = null;
        openRenameProductModal(id);
    }, 550);
}

function clearItemPressTimer(event) {
    if (itemPressTimer) {
        clearTimeout(itemPressTimer);
        itemPressTimer = null;
    }
}

let currentRenamingItemId = null;

function openRenameProductModal(id) {
    const list = appData.lists[appData.currentList] || [];
    const item = list.find(x => x.id === id);
    if (!item) {
        return;
    }

    currentRenamingItemId = id;
    const modal = document.getElementById('renameProductModal');
    const input = document.getElementById('renameProductInput');

    if (!modal || !input) {
        return;
    }

    input.value = item.name || '';
    modal.style.display = 'flex';

    setTimeout(() => {
        input.focus();
        input.select();
    }, 100);
}

function closeRenameProductModal() {
    currentRenamingItemId = null;
    const modal = document.getElementById('renameProductModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function saveRenamedProduct() {
    const input = document.getElementById('renameProductInput');
    if (!input || currentRenamingItemId === null) {
        closeRenameProductModal();
        return;
    }

    const newName = input.value.trim().replace(/\s+/g, ' ');
    if (!newName) {
        input.focus();
        return;
    }

    const list = appData.lists[appData.currentList] || [];
    const item = list.find(x => x.id === currentRenamingItemId);
    if (item) {
        item.name = newName;
        item.unitType = normalizeUnitType(item.unitType, newName);
        saveToStorage();
        renderLists();
    }

    closeRenameProductModal();
}

// ==========================================
function openRenameListModal() {
    if (appData.currentList === 'list9') {
        return;
    }

    const modal = document.getElementById('renameListModal');
    const input = document.getElementById('renameListInput');

    if (!modal || !input) {
        return;
    }

    input.value = appData.listNames[appData.currentList] || '';

    modal.style.display = 'flex';

    setTimeout(() => {
        input.focus();
        input.select();
    }, 100);
}

function closeRenameListModal() {
    pendingCustomListKey = null;

    const modal = document.getElementById('renameListModal');

    if (modal) {
        modal.style.display = 'none';
    }
}

function saveRenamedList() {
    const input = document.getElementById('renameListInput');

    if (!input) {
        closeRenameListModal();
        return;
    }

    const newName = input.value.trim();

    /*
     * Порожня назва не створює новий список
     * і не перейменовує наявний.
     */
    if (!newName) {
        closeRenameListModal();
        return;
    }

    /*
     * Режим створення:
     * ключ був запам'ятований у createCustomList(),
     * але запис у appData робимо тільки після «Зберегти».
     */
    if (pendingCustomListKey) {
        const newKey = pendingCustomListKey;

        if (!Array.isArray(appData.customListKeys)) {
            appData.customListKeys = [];
        }

        if (!appData.lists) {
            appData.lists = {};
        }

        if (!appData.listNames) {
            appData.listNames = {};
        }

        if (!appData.logos) {
            appData.logos = {};
        }

        if (!appData.hiddenCategories) {
            appData.hiddenCategories = {};
        }

        if (!appData.hiddenPrices) {
            appData.hiddenPrices = {};
        }

        appData.lists[newKey] = [];
        appData.listNames[newKey] = newName;
        appData.logos[newKey] = defaultShopIcon;
        appData.hiddenCategories[newKey] = false;
        appData.hiddenPrices[newKey] = false;

        if (!appData.customListKeys.includes(newKey)) {
            appData.customListKeys.push(newKey);
        }

        appData.currentList = newKey;
        pendingCustomListKey = null;
        searchListPhotosInBackground(newKey);
        saveToStorage();
        renderListSelector();

        const logo = document.getElementById('shopLogo');

                setShopLogoImage(
                    appData.logos[newKey] || defaultShopIcon
                );

        updateListMenuText();
        renderLists();

        closeRenameListModal();
        return;
    }

    /*
     * Режим перейменування існуючого списку.
     */
    if (appData.currentList === 'list9') {
        closeRenameListModal();
        return;
    }

    if (!appData.listNames) {
        appData.listNames = {};
    }

    appData.listNames[appData.currentList] = newName;

    saveToStorage();
    renderListSelector();
    updateListMenuText();
    closeRenameListModal();
    updateListSwitcherLabel();
}
function openListMenu(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const menu = document.getElementById('listMenu');

    if (!menu) {
        return;
    }

    const submenu = document.getElementById('themeSubMenu');
    if (submenu) {
        submenu.classList.remove('visible');
    }

    updateListMenuText();

    menu.classList.toggle('visible');
}

function closeListMenu() {
    const menu = document.getElementById('listMenu');

    if (menu) {
        menu.classList.remove('visible');
    }

    const submenu = document.getElementById('themeSubMenu');

    if (submenu) {
        submenu.classList.remove('visible');
    }
}
function openSearchStoreModal() {
    const modal = document.getElementById('searchStoreModal');
    const list = document.getElementById('searchStoreList');

    if (!modal || !list) {
        return;
    }

    renderSearchStoreOptions();
    modal.style.display = 'flex';
}

function closeSearchStoreModal() {
    const modal = document.getElementById('searchStoreModal');

    if (modal) {
        modal.style.display = 'none';
    }
}

function renderSearchStoreOptions() {
    const list = document.getElementById('searchStoreList');

    if (!list) {
        return;
    }

    const stores = [
        {
            key: 'atb',
            name: 'АТБ'
        },
        {
            key: 'silpo',
            name: 'Сільпо'
        },
        {
            key: 'varus',
            name: 'Varus'
        }
    ];

    list.innerHTML = '';

    stores.forEach(store => {
        const button = document.createElement('button');

        button.type = 'button';
        button.className = `search-store-option store-line-${store.key}`;

        const isActive =
            appData.searchStore === store.key;

        button.innerHTML = `
            <span>${escapeHtml(store.name)}</span>
            <span class="search-store-check">
                ${isActive ? '✓' : ''}
            </span>
        `;

        button.onclick = () => {
            selectSearchStore(store.key);
        };

        list.appendChild(button);
    });
}

function selectSearchStore(store) {
    appData.searchStore = store === 'silpo'
        ? 'silpo'
        : store === 'varus'
            ? 'varus'
            : 'atb';

    saveToStorage();
    closeSearchStoreModal();
}
function showSilpoDiagnosticReport(text) {
    const modal = document.getElementById('atbDebugModal');
    const textarea = document.getElementById('atbDebugTextArea');

    if (!modal || !textarea) {
        alert('Вікно діагностики не знайдено.');
        return;
    }

    textarea.value = String(text || '');
    modal.style.display = 'flex';
}

function openRenameFromListMenu() {
    closeListMenu();
    openRenameListModal();
}

function toggleCategoriesFromListMenu() {
    closeListMenu();

    if (!appData.hiddenCategories) {
        appData.hiddenCategories = {};
    }

    const listKey = appData.currentList;

    appData.hiddenCategories[listKey] =
        !appData.hiddenCategories[listKey];

    saveToStorage();
    updateListMenuText();
    renderLists();
}

function togglePricesFromListMenu() {
    closeListMenu();

    if (!appData.hiddenPrices) {
        appData.hiddenPrices = {};
    }

    const listKey = appData.currentList;

    appData.hiddenPrices[listKey] =
        !appData.hiddenPrices[listKey];

    saveToStorage();
    updateListMenuText();
    renderLists();
}

function updateListMenuText() {
    const renameItem = document.getElementById('renameListMenuItem');
    const deleteItem = document.getElementById('deleteListMenuItem');
    const categoriesText = document.getElementById('categoriesMenuText');
    const pricesText = document.getElementById('pricesMenuText');

    if (renameItem) {
        renameItem.style.display =
            appData.currentList === 'list9'
                ? 'none'
                : 'flex';
    }
    if (deleteItem) {
        const canDelete = Array.isArray(appData.customListKeys) &&
            appData.customListKeys.includes(appData.currentList);

        deleteItem.style.display = canDelete
            ? 'flex'
            : 'none';
    }
    if (categoriesText) {
        categoriesText.innerText =
            appData.hiddenCategories &&
            appData.hiddenCategories[appData.currentList]
                ? 'Показати категорії'
                : 'Прибрати категорії';
    }
    if (pricesText) {
        pricesText.innerText =
            appData.hiddenPrices &&
            appData.hiddenPrices[appData.currentList]
                ? 'Показати ціни'
                : 'Прибрати ціни';
    }
}

document.addEventListener('click', function (event) {
    const menu = document.getElementById('listMenu');
    const button = document.getElementById('listMenuButton');

    if (
        menu &&
        button &&
        !menu.contains(event.target) &&
        !button.contains(event.target)
    ) {
        closeListMenu();
    }
});
function clearCurrentList() {
    const modal = document.getElementById('clearListConfirmModal');
    const text = document.getElementById('clearListModalText');
    const selector = document.getElementById('listSelector');

    if (!modal || !text) return;

    const listName = selector
        ? selector.options[selector.selectedIndex].text
        : 'поточний список';

    const itemsCount = (appData.lists[appData.currentList] || []).length;

    if (itemsCount === 0) {
        text.innerText = `Список «${listName}» уже порожній.`;
    } else {
        text.innerText =
            `Ви дійсно хочете видалити всі товари зі списку «${listName}»? ` +
            `Буде видалено позицій: ${itemsCount}. Цю дію неможливо скасувати.`;
    }

    modal.style.display = 'flex';
}

function confirmClearCurrentList() {
    appData.lists[appData.currentList] = [];

    saveToStorage();
    renderLists();
    manageSharedListSync();
    closeClearListModal();
}

function closeClearListModal() {
    const modal = document.getElementById('clearListConfirmModal');

    if (modal) {
        modal.style.display = 'none';
    }
}

// ==========================================
// 12. FIREBASE: КОРОТКЕ ПОСИЛАННЯ СПІЛЬНОГО СПИСКУ
// ==========================================

const FIREBASE_SHARED_LIST_VERSION = 1;

const pendingFirebaseSharedRequests = {};

/*
 * Відповідь від MainActivity.java.
 *
 * Java викликає:
 *
 * window.__onJavaSharedList(callbackId, jsonText)
 */
window.__onJavaSharedList = function (callbackId, jsonText) {
    const request = pendingFirebaseSharedRequests[callbackId];

    if (!request) {
        return;
    }

    delete pendingFirebaseSharedRequests[callbackId];
    clearTimeout(request.timer);

    let response;

    try {
        response = JSON.parse(jsonText);
    } catch (error) {
        request.reject(
            new Error('Firebase повернув некоректну відповідь.')
        );
        return;
    }

    if (!response || response.ok !== true) {
        request.reject(
            new Error(
                response && response.error
                    ? response.error
                    : 'Не вдалося виконати операцію зі спільним списком.'
            )
        );
        return;
    }

    request.resolve(response);
};

/*
 * Викликає Java-методи Firebase через Android JavaScript Interface.
 *
 * Підтримувані method:
 * - publishSharedList
 * - loadSharedList
 */
function callFirebaseSharedBridge(method, ...args) {
    return new Promise((resolve, reject) => {
        if (
            !window.Android ||
            typeof window.Android[method] !== 'function'
        ) {
            reject(
                new Error(
                    'Firebase-модуль не знайдено. Встановіть нову версію застосунку.'
                )
            );
            return;
        }

        const callbackId =
            'shared_' +
            Date.now() +
            '_' +
            Math.random().toString(36).slice(2);

        const timer = setTimeout(() => {
            delete pendingFirebaseSharedRequests[callbackId];

            reject(
                new Error(
                    'Firebase не відповів за 30 секунд. Перевірте інтернет.'
                )
            );
        }, 30000);

        pendingFirebaseSharedRequests[callbackId] = {
            resolve: resolve,
            reject: reject,
            timer: timer
        };

        try {
            window.Android[method](...args, callbackId);
        } catch (error) {
            delete pendingFirebaseSharedRequests[callbackId];
            clearTimeout(timer);

            reject(
                new Error(
                    'Не вдалося звернутися до Android-модуля Firebase.'
                )
            );
        }
    });
}

/*
 * Повертає всі важливі поля товару.
 *
 * Передаємо не тільки видиму назву, а і приховану точну прив'язку АТБ:
 * - atbProductId;
 * - atbProductName;
 * - atbProductUrl;
 * - atbImage.
 *
 * Завдяки цьому одержувач отримує той самий конкретний товар АТБ
 * і зможе надалі оновлювати його ціну кнопкою «Ціна».
 */
function exportFirebaseSharedItem(item) {
    return {
        name: String(item.name || ''),
        qty: Math.max(1, Math.round(Number(item.qty) || 1)),
        unitType: normalizeUnitType(item.unitType, item.name),
        price: Math.max(0, Number(item.price) || 0),
        cat: normalizeCat(item.cat),
        img: String(item.img || '📦'),
        bought: Boolean(item.bought),
        priceNotFound: Boolean(item.priceNotFound),

        atbSelected: item.atbSelected === true,
        atbProductId: String(item.atbProductId || ''),
        atbProductName: String(item.atbProductName || ''),
        atbProductUrl: String(item.atbProductUrl || ''),
        atbImage: String(item.atbImage || ''),

        silpoSelected: item.silpoSelected === true,
        silpoProductId: String(item.silpoProductId || ''),
        silpoProductName: String(item.silpoProductName || ''),
        silpoProductUrl: String(item.silpoProductUrl || ''),
        silpoImage: String(item.silpoImage || ''),

        varusSelected: item.varusSelected === true,
        varusProductId: String(item.varusProductId || ''),
        varusProductName: String(item.varusProductName || ''),
        varusProductUrl: String(item.varusProductUrl || ''),
        varusImage: String(item.varusImage || '')
        ,

        lastBoundStore: String(item.lastBoundStore || '')
    };
}
/*
 * Створює локальний товар після отримання зі спільного списку.
 *
 * item.id не передається між телефонами:
 * на телефоні одержувача генерується новий локальний ID.
 */
function importFirebaseSharedItem(rawItem, index) {
    if (!rawItem || typeof rawItem !== 'object') {
        return null;
    }

    const name = String(rawItem.name || '')
        .trim()
        .replace(/\s+/g, ' ');

    if (!name) {
        return null;
    }

    return {
        id: Date.now() + index,

        name: name,
        qty: Math.max(1, Math.round(Number(rawItem.qty) || 1)),
        unitType: normalizeUnitType(rawItem.unitType, name),
        price: Math.max(0, Number(rawItem.price) || 0),
        cat: normalizeCat(rawItem.cat),
        img: String(rawItem.img || '📦'),
        bought: Boolean(rawItem.bought),
        priceNotFound: Boolean(rawItem.priceNotFound),

        atbSelected: rawItem.atbSelected === true,
        atbProductId: String(rawItem.atbProductId || ''),
        atbProductName: String(rawItem.atbProductName || ''),
        atbProductUrl: String(rawItem.atbProductUrl || ''),
        atbImage: String(rawItem.atbImage || ''),

        silpoSelected: rawItem.silpoSelected === true,
        silpoProductId: String(rawItem.silpoProductId || ''),
        silpoProductName: String(rawItem.silpoProductName || ''),
        silpoProductUrl: String(rawItem.silpoProductUrl || ''),
        silpoImage: String(rawItem.silpoImage || ''),

        varusSelected: rawItem.varusSelected === true,
        varusProductId: String(rawItem.varusProductId || ''),
        varusProductName: String(rawItem.varusProductName || ''),
        varusProductUrl: String(rawItem.varusProductUrl || ''),
        varusImage: String(rawItem.varusImage || '')
        ,

        lastBoundStore: String(rawItem.lastBoundStore || '')
    };
}

/*
 * Firebase може повернути items як звичайний масив або як об'єкт
 * із ключами 0, 1, 2... Тому підтримуємо обидва варіанти.
 */
function getFirebaseSharedItems(rawItems) {
    if (Array.isArray(rawItems)) {
        return rawItems;
    }

    if (!rawItems || typeof rawItems !== 'object') {
        return [];
    }

    return Object.keys(rawItems)
        .sort((a, b) => Number(a) - Number(b))
        .map(key => rawItems[key]);
}

/*
 * НОВА кнопка «Поділитись».
 *
 * Надсилає поточний активний список у Firebase, отримує короткий ID
 * та відкриває стандартне Android-меню Telegram / Viber / Signal /
 * Gmail / Bluetooth та інших доступних програм.
 */
function shareList() {
    const selector = document.getElementById('listSelector');

    const sourceListName = selector
        ? selector.options[selector.selectedIndex].text
        : 'Список покупок';

    const sourceItems = appData.lists[appData.currentList] || [];

    if (sourceItems.length === 0) {
        alert(
            'Поточний список порожній. Додайте хоча б один товар перед надсиланням.'
        );
        return;
    }

    if (sourceItems.length > 300) {
        alert(
            'У списку забагато товарів. Максимальна кількість для надсилання — 300.'
        );
        return;
    }

    const exportData = {
        sourceListName: sourceListName,
        items: sourceItems.map(exportFirebaseSharedItem)
    };

    const exportJson = JSON.stringify(exportData);

    callFirebaseSharedBridge('publishSharedList', exportJson)
        .then(result => {
            if (appData.currentList === 'list9') {
                appData.sharedListRemoteId = result.id;
                appData.sharedListExpiresAt = result.expiresAt;
                saveToStorage();
                manageSharedListSync();
            }

            const expiresAt = new Date(Number(result.expiresAt));

            const expiresText = isNaN(expiresAt.getTime())
                ? '3 доби'
                : expiresAt.toLocaleString('uk-UA');

            const shareText =
                'Список покупок\n\n' +
                shareLink;

            if (
                window.Android &&
                typeof window.Android.shareText === 'function'
            ) {
                window.Android.shareText(shareText);
                return;
            }

            alert(
                'Посилання створено, але системне меню надсилання недоступне:\n\n' +
                shareLink
            );
        })
        .catch(error => {
            alert(
                'Не вдалося надіслати спільний список.\n\n' +
                String(error.message || error)
            );
        });
}
function toggleListDropdown(event) {
    event.stopPropagation();

    const dropdown = document.getElementById('listDropdown');
    dropdown.classList.toggle('open');

    if (dropdown.classList.contains('open')) {
        renderListDropdown();
    }
}

function renderListDropdown() {
    const selector = document.getElementById('listSelector');
    const dropdown = document.getElementById('listDropdown');

    dropdown.innerHTML = '';

    Array.from(selector.options).forEach(option => {
        const item = document.createElement('div');
        item.className = 'list-dropdown-item';

        if (option.value === selector.value) {
            item.classList.add('active');
        }

        item.innerHTML = `
            <span class="list-switcher-label">${option.text}</span>
            <span class="list-dropdown-check">${option.value === selector.value ? '✓' : ''}</span>
        `;

        item.onclick = () => selectListFromDropdown(option.value);
        dropdown.appendChild(item);
    });
}

function selectListFromDropdown(listId) {
    const selector = document.getElementById('listSelector');
    const dropdown = document.getElementById('listDropdown');

    if (selector && selector.value !== listId) {
        selector.value = listId;
        switchList();
    } else {
        updateListSwitcherLabel();
    }

    if (dropdown) {
        dropdown.classList.remove('open');
    }
}

document.addEventListener('click', () => {
    const dropdown = document.getElementById('listDropdown');
    if (dropdown) {
        dropdown.classList.remove('open');
    }
});
/*
 * Викликається з MainActivity.java після натискання посилання:
 *
 * https://koshyk-9d9c9.web.app/i/...
 *
 * Без додаткових запитань:
 * 1. Завантажує запис із Firebase.
 * 2. Перевіряє його формат і строк дії.
 * 3. Повністю замінює list9.
 * 4. Робить list9 активним.
 */
window.receiveSharedListId = function (listId) {
    const cleanId = String(listId || '').trim();

    if (!cleanId) {
        alert('Не вдалося відкрити спільний список: у посиланні немає ID.');
        return;
    }

    callFirebaseSharedBridge('loadSharedList', cleanId)
        .then(result => {
            const record = result.record;

            if (
                !record ||
                Number(record.version) !== FIREBASE_SHARED_LIST_VERSION
            ) {
                throw new Error(
                    'Формат спільного списку не підтримується.'
                );
            }

            const expiresAt = Number(record.expiresAt) || 0;

            /*
             * Firebase Rules уже не повинні видати прострочений список,
             * але дублюємо перевірку в інтерфейсі для надійності.
             */
            if (expiresAt <= Date.now()) {
                throw new Error(
                    'Термін дії цього спільного списку завершився.'
                );
            }

            const rawItems = getFirebaseSharedItems(record.items);

            if (rawItems.length === 0) {
                throw new Error(
                    'У спільному списку немає товарів.'
                );
            }

            if (rawItems.length > 300) {
                throw new Error(
                    'У спільному списку забагато товарів.'
                );
            }

            const importedItems = [];

            rawItems.forEach((rawItem, index) => {
                const item = importFirebaseSharedItem(rawItem, index);

                if (item) {
                    importedItems.push(item);
                }
            });

            if (importedItems.length === 0) {
                throw new Error(
                    'Не вдалося прочитати товари у спільному списку.'
                );
            }

            /*
             * Ваше правило:
             * без запитань замінити «Спільний список».
             */
            appData.lists.list9 = importedItems;
            appData.listNames.list9 = 'Спільний список';
            appData.sharedListExpiresAt = expiresAt;
            appData.sharedListRemoteId = cleanId;

            /*
             * Одразу зробити «Спільний список» активним.
             */
            appData.currentList = 'list9';

            saveToStorage();

            const selector = document.getElementById('listSelector');

            if (selector) {
                selector.value = 'list9';
            }

            setShopLogoImage(
                appData.logos.list9 || defaultShopIcon
            );
            appData.currentList = 'list9';

            const listSelector = document.getElementById('listSelector');
            if (listSelector) {
                listSelector.value = 'list9';
            }

            renderListSelector();
            updateListSwitcherLabel();
            renderLists();
            manageSharedListSync();

            alert(
                `Спільний список отримано.\n` +
                `Джерело: ${String(record.sourceListName || 'Інший список')}\n` +
                `Товарів: ${importedItems.length}`
            );
        })
        .catch(error => {
            alert(
                'Не вдалося відкрити спільний список.\n\n' +
                String(error.message || error)
            );
        });
};
// ==========================================
// ТЕМИ ЗАСТОСУНКУ
// ==========================================

const THEME_STORAGE_KEY = 'koshik_theme';

function applyTheme(theme) {
    const body = document.body;
    const normalizedTheme = ['standard', 'light', 'dark'].includes(theme)
        ? theme
        : 'standard';

    body.classList.remove('theme-standard', 'theme-light', 'theme-dark');
    body.classList.add(`theme-${normalizedTheme}`);

    document.querySelectorAll('.theme-check').forEach(check => {
        check.classList.toggle(
            'active',
            check.dataset.theme === normalizedTheme
        );
    });

    localStorage.setItem(THEME_STORAGE_KEY, normalizedTheme);
    const systemDark =
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;

    const darkTheme =
        normalizedTheme === 'dark' ||
        (normalizedTheme === 'standard' && systemDark);

    if (window.Android && typeof window.Android.setStatusBarIcons === 'function') {
        window.Android.setStatusBarIcons(darkTheme);
    }
}

function setTheme(theme) {
    applyTheme(theme);
    closeListMenu();
}

window.setTheme = setTheme;

function toggleThemeMenu(event) {
    if (event) {
        event.stopPropagation();
    }

    const submenu = document.getElementById('themeSubMenu');

    if (!submenu) {
        return;
    }

    submenu.classList.toggle('visible');
}

window.toggleThemeMenu = toggleThemeMenu;

function initTheme() {
    let savedTheme = null;

    try {
        savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    } catch (error) {
        savedTheme = null;
    }

    applyTheme(savedTheme || 'standard');
}

document.addEventListener('click', () => {
    const submenu = document.getElementById('themeSubMenu');

    if (submenu) {
        submenu.classList.remove('visible');
    }
});

initTheme();
// ==========================================
// РЕДАГУВАННЯ ІСТОРІЇ
// ==========================================

let editingHistoryItemKey = null;

function openEditHistoryModal(historyItem) {
    const modal = document.getElementById('editHistoryModal');
    const nameInput = document.getElementById('editHistoryNameInput');
    const countInput = document.getElementById('editHistoryCountInput');
    const suggestion = document.getElementById('editHistoryStoreSuggestion');

    if (!modal || !nameInput || !countInput || !suggestion) {
        return;
    }

    editingHistoryItemKey = getHistoryItemKey(historyItem);

    nameInput.value = String(historyItem.name || '').trim();
    countInput.value = Math.max(
        1,
        Math.round(Number(historyItem.purchaseCount) || 1)
    );

    const storeName = historyItem.store === 'silpo'
        ? String(historyItem.silpoProductName || '').trim()
        : String(historyItem.atbProductName || '').trim();

    if (storeName && storeName !== nameInput.value) {
        suggestion.textContent = storeName;
        suggestion.className = `edit-history-store-suggestion store-${historyItem.store}`;
        suggestion.style.display = 'block';
    } else {
        suggestion.textContent = '';
        suggestion.className = 'edit-history-store-suggestion';
        suggestion.style.display = 'none';
    }

    modal.style.display = 'flex';
}

function applyStoreNameSuggestion() {
    const suggestion = document.getElementById('editHistoryStoreSuggestion');
    const nameInput = document.getElementById('editHistoryNameInput');

    if (suggestion && nameInput && suggestion.textContent) {
        nameInput.value = suggestion.textContent;
    }
}

function closeEditHistoryModal() {
    const modal = document.getElementById('editHistoryModal');

    if (modal) {
        modal.style.display = 'none';
    }

    editingHistoryItemKey = null;
}

function saveEditedHistoryItem() {
    const nameInput = document.getElementById('editHistoryNameInput');
    const countInput = document.getElementById('editHistoryCountInput');

    if (!nameInput || !countInput || !editingHistoryItemKey) {
        return;
    }

    const newName = String(nameInput.value || '').trim();
    const newCount = Math.max(
        1,
        Math.round(Number(countInput.value) || 1)
    );

    if (!newName) {
        alert('Введіть назву товару.');
        return;
    }

    const historyItem = appData.history.find(item =>
        getHistoryItemKey(item) === editingHistoryItemKey
    );

    if (!historyItem) {
        closeEditHistoryModal();
        return;
    }

    historyItem.name = newName;
    historyItem.purchaseCount = newCount;

    saveToStorage();
    closeEditHistoryModal();
    renderHistoryModal();
}
// ==========================================
// ПОДВАНТАЖЕННЯ ТОВАРІВ VARUS НА 15-МУ ТОВАРУ
// ==========================================

let varusScrollListenerAttached = false;

function maybeLoadMoreVarusResults() {
    if (currentPickerStore !== 'varus') return;
    if (!varusPickerHasMore) return;
    if (varusPickerLoading) return;
    if (!varusPickerQuery) return;

    const results = document.getElementById('atbPickerResults');

    if (!results) return;
    if (results.scrollHeight <= results.clientHeight) return;

    const nearBottom =
        results.scrollTop + results.clientHeight >=
        results.scrollHeight - 750;

    if (!nearBottom) return;

    loadMoreVarusPickerResults();
}

function attachVarusPickerScrollListener() {
    if (varusScrollListenerAttached) return;

    const results = document.getElementById('atbPickerResults');

    if (!results) return;

    results.addEventListener('scroll', maybeLoadMoreVarusResults);

    varusScrollListenerAttached = true;
}

let appInitialized = false;

function initApp() {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');

    const selector = document.getElementById('listSelector');

    if (!selector) {
        return;
    }

    if (appInitialized) {
        renderListSelector();
        switchList();
        return;
    }

    appInitialized = true;

    renderListSelector();
    setupHistorySuggestions();
    switchList();

    attachVarusPickerScrollListener();
    attachAtbPickerScrollListener();
    manageSharedListSync();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

window.addEventListener('pageshow', function (event) {
    initApp();
});