package com.example.koshik;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.view.WindowCompat;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;

import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONTokener;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MainActivity extends AppCompatActivity {
    private WebView webView;
    private WebView fetcherView;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private WebView silpoFetcherView;
    private int silpoFetchGeneration = 0;

    private WebView varusFetcherView;
    private int varusFetchGeneration = 0;
    private volatile String varusLoadedUrl = "";
    private volatile int varusLoadedGeneration = -1;
    /*
     * Окремий прихований WebView для Google Картинок.
     *
     * Він не використовується для АТБ або Сільпо,
     * тому їхній пошук не може бути порушений.
     */
    private WebView googleImagesFetcherView;
    private int googleImagesFetchGeneration = 0;
    /*
     * Окремий прихований WebView для пошуку товарів Varus.
     */
    /*
     * FirebaseAuth зберігає анонімний технічний ID цього встановлення
     * застосунку. Користувач не бачить жодного входу чи реєстрації.
     */
    private FirebaseAuth firebaseAuth;
    /*
     * Посилання на Firebase Realtime Database:
     *
     * sharedLists/
     *   випадковий_ID_списку/
     *     товари та службові поля
     */
    private DatabaseReference sharedListsRef;
    private DatabaseReference activeSharedListRef = null;
    private ValueEventListener activeSharedListListener = null;
    // Кожен новий пошук скасовує попередній, якщо той ще виконується.
    private int fetchGeneration = 0;

    /*
     * Дані зі спільного посилання тимчасово зберігаються тут,
     * доки index.html повністю не завантажиться у WebView.
     */
    private String pendingSharedListPayload = null;
    private boolean mainPageLoaded = false;
    private static final String PREFS_NAME = "koshyk_preferences";
    private static final String APP_LINK_HELP_SHOWN_KEY = "app_link_help_shown";
    /*
     * Скрипт виконується безпосередньо на сторінці пошуку АТБ.
     *
     * Для кожної картки товару повертаємо:
     * - title: точну назву, яку показує АТБ;
     * - price: поточну ціну;
     * - image: URL головного зображення;
     * - url: URL картки товару;
     * - id: стабільний ідентифікатор. Якщо АТБ не дає окремий ID,
     *       використовуємо URL як стабільний ключ.
     *
     * Поле image перевіряє кілька атрибутів, тому працюватиме як зі
     * звичайними, так і з lazy-loaded зображеннями.
     */
    private static final String EXTRACT_JS =
            "(function(){" +
                    "var pageTitle=document.title||'';" +

                    "var challenge=" +
                    "/just a moment|attention required|cloudflare/i.test(pageTitle)" +
                    "||!!document.querySelector('#challenge-form,#challenge-running,.cf-browser-verification');" +

                    "function absoluteUrl(value){" +
                    "  if(!value)return '';" +
                    "  try{return new URL(value,location.href).href;}catch(e){return value;}" +
                    "}" +

                    "function getImage(card){" +
                    "  var img=card.querySelector('img');" +
                    "  if(!img)return '';" +
                    "  var value=" +
                    "    img.getAttribute('src')" +
                    "    ||img.getAttribute('data-src')" +
                    "    ||img.getAttribute('data-original')" +
                    "    ||img.getAttribute('data-lazy-src')" +
                    "    ||img.getAttribute('data-image')" +
                    "    ||'';" +
                    "  if(!value&&img.src)value=img.src;" +
                    "  return absoluteUrl(value);" +
                    "}" +

                    "var items=[];" +

                    "document.querySelectorAll('article.catalog-item').forEach(function(card){" +
                    "  var link=card.querySelector('.catalog-item__title a');" +
                    "  var priceNode=card.querySelector('data.product-price__top');" +
                    "  var price=priceNode?parseFloat(priceNode.getAttribute('value')):NaN;" +

                    "  if(!link||isNaN(price)||price<=0)return;" +

                    "  var href=absoluteUrl(link.getAttribute('href')||'');" +
                    "  var productId=" +
                    "    card.getAttribute('data-product-id')" +
                    "    ||card.getAttribute('data-id')" +
                    "    ||link.getAttribute('data-product-id')" +
                    "    ||href;" +

                    "  items.push({" +
                    "    id:String(productId||href||link.textContent.trim())," +
                    "    title:link.textContent.trim()," +
                    "    price:price," +
                    "    image:getImage(card)," +
                    "    url:href" +
                    "  });" +
                    "});" +

                    "return {" +
                    "  href:location.href," +
                    "  ready:document.readyState," +
                    "  challenge:challenge," +
                    "  title:pageTitle," +
                    "  items:items" +
                    "};" +
                    "})()";
    private static final String EXTRACT_ATB_PRODUCT_PAGE_JS =
            "(function(){" +
                    "var pageTitle=document.title||'';" +

                    "var challenge=" +
                    "/just a moment|attention required|cloudflare/i.test(pageTitle)" +
                    "||!!document.querySelector('#challenge-form,#challenge-running,.cf-browser-verification');" +

                    "function absoluteUrl(value){" +
                    "  if(!value)return '';" +
                    "  try{return new URL(value,location.href).href;}catch(e){return value;}" +
                    "}" +

                    "function parsePrice(value){" +
                    "  var text=String(value||'')" +
                    "    .replace(/\\s/g,'')" +
                    "    .replace(',','.')" +
                    "    .replace(/[^0-9.]/g,'');" +
                    "  var number=parseFloat(text);" +
                    "  return isNaN(number)?0:number;" +
                    "}" +

                    "var name='';" +
                    "var price=0;" +
                    "var image='';" +
                    "var productId='';" +

                    "document.querySelectorAll('script[type=\"application/ld+json\"]').forEach(function(script){" +
                    "  try{" +
                    "    var data=JSON.parse(script.textContent||'{}');" +
                    "    var list=Array.isArray(data)?data:[data];" +
                    "    list.forEach(function(entry){" +
                    "      if(!entry||typeof entry!=='object')return;" +
                    "      var type=entry['@type'];" +
                    "      var isProduct=type==='Product'||(Array.isArray(type)&&type.indexOf('Product')>=0);" +
                    "      if(!isProduct)return;" +
                    "      if(!name&&entry.name)name=String(entry.name).trim();" +
                    "      if(!productId&&(entry.sku||entry.productID||entry.mpn))productId=String(entry.sku||entry.productID||entry.mpn);" +
                    "      if(!image&&entry.image){" +
                    "        image=absoluteUrl(Array.isArray(entry.image)?entry.image[0]:entry.image);" +
                    "      }" +
                    "      var offer=Array.isArray(entry.offers)?entry.offers[0]:entry.offers;" +
                    "      if(!price&&offer&&offer.price!==undefined)price=parsePrice(offer.price);" +
                    "    });" +
                    "  }catch(e){}" +
                    "});" +

                    "if(!name){" +
                    "  var nameNode=document.querySelector('h1,.product__title,.product-card__title,[itemprop=\"name\"]');" +
                    "  if(nameNode)name=String(nameNode.textContent||'').trim();" +
                    "}" +

                    "if(!price){" +
                    "  var priceNode=document.querySelector(" +
                    "    '[itemprop=\"price\"],data.product-price__top,.product-price__top,.product__price,.product-card__price'" +
                    "  );" +
                    "  if(priceNode){" +
                    "    price=parsePrice(priceNode.getAttribute('content')||priceNode.getAttribute('value')||priceNode.textContent);" +
                    "  }" +
                    "}" +

                    "if(!image){" +
                    "  var imageNode=document.querySelector(" +
                    "    '[itemprop=\"image\"],.product__image img,.product-card__image img,main img'" +
                    "  );" +
                    "  if(imageNode)image=absoluteUrl(imageNode.getAttribute('src')||imageNode.getAttribute('data-src')||imageNode.src||'');" +
                    "}" +

                    "if(!productId){" +
                    "  var idNode=document.querySelector('[data-product-id],[data-id],[data-product]');" +
                    "  if(idNode)productId=String(idNode.getAttribute('data-product-id')||idNode.getAttribute('data-id')||idNode.getAttribute('data-product')||'');" +
                    "}" +

                    "return {" +
                    "  href:location.href," +
                    "  ready:document.readyState," +
                    "  challenge:challenge," +
                    "  title:pageTitle," +
                    "  id:productId," +
                    "  name:name," +
                    "  price:price," +
                    "  image:image" +
                    "};" +
                    "})()";
    /*
     * Тимчасовий діагностичний скрипт.
     *
     * Він не намагається одразу знайти готовий список магазинів.
     * Він шукає у HTML сторінки Сільпо Києва можливі ідентифікатори
     * філій та повертає невеликі фрагменти коду навколо них.
     *
     * Це дозволить визначити, де саме Сільпо зберігає filialId.
     */
    private static final String EXTRACT_SILPO_FILIAL_JS =
            "(function(){" +
                    "var sources=[" +
                    "document.documentElement.innerHTML," +
                    "document.body?document.body.innerHTML:''," +
                    "document.documentElement.outerHTML" +
                    "];" +
                    "var filialId='';" +
                    "for(var i=0;i<sources.length;i++){" +
                    "var match=String(sources[i]).match(/filial=[\\\"']?([0-9]{2,10})/i);" +
                    "if(match&&match[1]){filialId=match[1];break;}" +
                    "}" +
                    "return {filialId:filialId};" +
                    "})()";
    private static final String VARUS_SEARCH_URL =
            "https://varus.ua/search?q=";

    private static final String EXTRACT_VARUS_JS =
            "(function(){" +
                    "function absoluteUrl(value){" +
                    "if(!value)return '';" +
                    "try{return new URL(value,location.href).href;}catch(e){return value;}" +
                    "}" +

                    "function parsePrice(value){" +
                    "var text=String(value||'').replace(/\\s/g,'').replace(',','.').replace(/[^0-9.]/g,'');" +
                    "var number=parseFloat(text);" +
                    "return isNaN(number)?0:number;" +
                    "}" +

                    "var items=[];" +

                    "document.querySelectorAll('div.sf-product-card').forEach(function(card){" +
                    "var titleNode=card.querySelector('h2.sf-product-card__title');" +
                    "var linkNode=card.querySelector('a.sf-product-card__title-wrapper');" +
                    "var imageNode=card.querySelector('.sf-product-card__image-wrapper img');" +

                    "if(!titleNode||!linkNode)return;" +

                    "var title=String(titleNode.textContent||'').trim();" +
                    "var href=absoluteUrl(linkNode.getAttribute('href')||'');" +
                    "var urlParts=href.split('?')[0].split('#')[0].replace(/\\/+$/, '').split('/');" +
                    "var productId=card.getAttribute('data-product-id')||card.getAttribute('data-id')||urlParts[urlParts.length-1]||href;" +
                    "var image=imageNode?absoluteUrl(imageNode.getAttribute('src')||imageNode.src||''):'';" +

                    "var priceNode=card.querySelector('.sf-product-card__price');" +
                    "var priceText=priceNode?String(priceNode.textContent||''):'';" +

                    "priceText=priceText.replace(/-?\\d+(?:[.,]\\d+)?\\s*%/g,' ');" +
                    "priceText=priceText.replace(/(\\d)[\\u00a0 ](\\d{3})/g,'$1$2');" +

                    "var priceMatches=priceText.match(/\\d+(?:[.,]\\d{1,2})?/g)||[];" +
                    "var price=0;" +

                    "if(priceMatches.length>0){" +
                    "var rawPrice=priceMatches[priceMatches.length-1].replace(',','.');" +
                    "price=parseFloat(rawPrice);" +
                    "}" +

                    "if(!title||!href||!(price>0))return;" +

                    "items.push({" +
                    "id:productId," +
                    "title:title," +
                    "price:price," +
                    "image:image," +
                    "url:href" +
                    "});" +
                    "});" +

                    "return {" +
                    "href:location.href," +
                    "ready:document.readyState," +
                    "title:document.title||''," +
                    "items:items" +
                    "};" +
                    "})()";
    private static final String SILPO_KYIV_STORES_URL =
            "https://silpo.ua/stores/city/kiyiv";
    /*
     * Скрипт виконується на сторінці Google Картинок.
     *
     * Збираємо перші до 8 зображень, щоб після фільтрації
     * залишалося щонайменше 6 робочих фото.
     *
     * Google часто використовує data-URL як мініатюри.
     * Такі URL безпечні для показу в <img>, тому їх дозволяємо.
     */

    private static final String EXTRACT_GOOGLE_IMAGES_JS =
            "(function(){" +
                    "var images=[];" +
                    "var seen={};" +

                    "function addImage(value){" +
                    "  if(!value)return;" +
                    "  value=String(value).trim();" +
                    "  if(!value)return;" +
                    "  if(value.indexOf('data:')!==0 && value.indexOf('http')!==0)return;" +
                    "  if(seen[value])return;" +
                    "  seen[value]=true;" +
                    "  images.push(value);" +
                    "}" +

                    "var nodes=document.querySelectorAll('img');" +

                    "for(var i=0;i<nodes.length&&images.length<8;i++){" +
                    "  var img=nodes[i];" +
                    "  var width=img.naturalWidth||img.width||0;" +
                    "  var height=img.naturalHeight||img.height||0;" +

                    "  if(width>0&&height>0&&(width<60||height<60))continue;" +

                    "  var value=" +
                    "    img.currentSrc" +
                    "    ||img.getAttribute('src')" +
                    "    ||img.getAttribute('data-src')" +
                    "    ||img.getAttribute('data-lsrc')" +
                    "    ||'';" +

                    "  addImage(value);" +
                    "}" +

                    "var bodyText=String(document.body.innerText||'');" +

                    "var links=[];" +
                    "var allLinks=document.querySelectorAll('a');" +
                    "for(var i=0;i<allLinks.length&&links.length<10;i++){" +
                    "  links.push(allLinks[i].href);" +
                    "}" +

                    "var debug=" +
                    "'URL: '+location.href+'\\n'+ " +
                    "'Заголовок: '+(document.title||'')+'\\n'+ " +
                    "'ready: '+document.readyState+'\\n'+ " +
                    "'Усього img: '+nodes.length+'\\n'+ " +
                    "'Підходящих зображень: '+images.length+'\\n'+ " +
                    "'Є згода Google: '+" +
                    "(/before you continue|consent|unusual traffic/i.test(bodyText))+'\\n'+ " +
                    "'Перші зображення: '+images.slice(0,3).join(' | ')+'\\n'+ " +
                    "'Перші посилання: '+links.join(' | ')+'\\n'+ " +
                    "'Текст сторінки: '+bodyText.slice(0,1200);" +

                    "return {" +
                    "  href:location.href," +
                    "  ready:document.readyState," +
                    "  title:document.title||''," +
                    "  images:images," +
                    "  debug:debug" +
                    "};" +
                    "})()";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        firebaseAuth = FirebaseAuth.getInstance();
        sharedListsRef = FirebaseDatabase
                .getInstance()
                .getReference("sharedLists");

        ensureAnonymousFirebaseLogin();

        FrameLayout root = new FrameLayout(this);

        // Прихований WebView відкриває сайт АТБ та читає результати пошуку.
        fetcherView = new WebView(this);

        WebSettings fetcherSettings = fetcherView.getSettings();
        fetcherSettings.setJavaScriptEnabled(true);
        fetcherSettings.setDomStorageEnabled(true);

        /*
         * Зображення не блокуємо: у частини карток АТБ URL реального фото
         * може з'являтися лише після того, як сторінка обробила lazy-loading.
         */
        fetcherSettings.setBlockNetworkImage(false);

        fetcherView.setWebViewClient(new WebViewClient());
        root.addView(fetcherView, new FrameLayout.LayoutParams(1, 1));
        /*
         * Окремий прихований WebView для Сільпо.
         * Він не впливає на пошук АТБ.
         */
        silpoFetcherView = new WebView(this);

        WebSettings silpoFetcherSettings = silpoFetcherView.getSettings();
        silpoFetcherSettings.setJavaScriptEnabled(true);
        silpoFetcherSettings.setDomStorageEnabled(true);
        silpoFetcherSettings.setBlockNetworkImage(false);

        silpoFetcherView.setWebViewClient(new WebViewClient());
        root.addView(silpoFetcherView, new FrameLayout.LayoutParams(1, 1));
        /*
         * Окремий прихований WebView для Google Картинок.
         */
        googleImagesFetcherView = new WebView(this);

        WebSettings googleImagesSettings =
                googleImagesFetcherView.getSettings();

        googleImagesSettings.setJavaScriptEnabled(true);
        googleImagesSettings.setDomStorageEnabled(true);
        googleImagesSettings.setBlockNetworkImage(false);

        googleImagesFetcherView.setWebViewClient(new WebViewClient());

        root.addView(
                googleImagesFetcherView,
                new FrameLayout.LayoutParams(1, 1)
        );
        /*
         * Окремий прихований WebView для пошуку Varus.
         * Він не впливає на пошук АТБ, Сільпо чи Google Картинок.
         */
        varusFetcherView = new WebView(this);

        WebSettings varusFetcherSettings = varusFetcherView.getSettings();

        varusFetcherSettings.setJavaScriptEnabled(true);
        varusFetcherSettings.setDomStorageEnabled(true);
        varusFetcherSettings.setBlockNetworkImage(false);

        varusFetcherView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);

                varusLoadedUrl = url == null ? "" : url;
                varusLoadedGeneration = varusFetchGeneration;
            }
        });

        root.addView(
                varusFetcherView,
                new FrameLayout.LayoutParams(1, 1)
        );
        // Основний WebView з інтерфейсом застосунку.
        webView = new WebView(this);

        WebSettings mainSettings = webView.getSettings();
        mainSettings.setJavaScriptEnabled(true);
        mainSettings.setDomStorageEnabled(true);
        mainSettings.setAllowFileAccess(true);

        webView.addJavascriptInterface(new AppNetworkBridge(), "Android");
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(android.webkit.ConsoleMessage consoleMessage) {
                Log.d("KoshykWeb", consoleMessage.message() + " -- From line "
                        + consoleMessage.lineNumber() + " of "
                        + consoleMessage.sourceId());
                return true;
            }
        });
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return !request.getUrl().toString().startsWith("file:///android_asset/");
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);

                if (url.startsWith("file:///android_asset/index.html")) {
                    mainPageLoaded = true;
                    deliverPendingSharedList();
                    showAppLinkHelpIfNeeded();
                }
            }
        });

        /*
         * Спершу читаємо посилання, якщо застосунок відкритий через
         * koshyk://import?payload=..., а потім завантажуємо інтерфейс.
         */
        readSharedListIntent(getIntent());

        webView.loadUrl("file:///android_asset/index.html");

        root.addView(
                webView,
                new FrameLayout.LayoutParams(
                        FrameLayout.LayoutParams.MATCH_PARENT,
                        FrameLayout.LayoutParams.MATCH_PARENT
                )
        );

        setContentView(root);
    }

    /*
     * Викликається, якщо застосунок уже був відкритий, а користувач
     * натиснув нове посилання зі спільним списком.
     */
    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        readSharedListIntent(intent);
    }

    /*
     * Читаємо тільки наші посилання:
     *
     * koshyk://import?payload=...
     *
     * Тут не розшифровуємо список і не змінюємо localStorage.
     * Java лише передає payload у app.js, де буде виконано перевірку,
     * розпакування та заміна «Спільного списку».
     */
    private void readSharedListIntent(Intent intent) {
        if (intent == null || !Intent.ACTION_VIEW.equals(intent.getAction())) {
            return;
        }

        Uri uri = intent.getData();

        if (uri == null) {
            return;
        }

        String listId = null;

        /*
         * Старий формат:
         *
         * koshyk://import?id=FIREBASE_LIST_ID
         */
        if ("koshyk".equalsIgnoreCase(uri.getScheme())
                && "import".equalsIgnoreCase(uri.getHost())) {

            listId = uri.getQueryParameter("id");
            if (listId == null || listId.trim().isEmpty()) {
                listId = uri.getQueryParameter("payload");
            }
        }

        /*
         * Новий HTTPS Android App Link:
         *
         * https://koshyk-9d9c9.web.app/i/FIREBASE_LIST_ID
         *
         * Шлях ділиться на сегменти:
         * /i/-P2ZFV92FDIDR8aMst9x
         *
         * segment 0 = i
         * segment 1 = -P2ZFV92FDIDR8aMst9x
         */
        else if ("https".equalsIgnoreCase(uri.getScheme())
                && "koshyk-9d9c9.web.app".equalsIgnoreCase(uri.getHost())) {

            List<String> segments = uri.getPathSegments();

            if (segments.size() == 2 && "i".equals(segments.get(0))) {
                listId = segments.get(1);
            }
        }

        if (listId == null || listId.trim().isEmpty()) {
            return;
        }

        /*
         * Firebase push ID складається лише з літер, цифр, "-" та "_".
         * Така перевірка не дає обробити сторонній або пошкоджений URL.
         */
        String cleanId = listId.trim();

        if (!cleanId.matches("[A-Za-z0-9_-]{12,80}")) {
            Log.w("KoshykLink", "Некоректний ID у посиланні: " + cleanId);
            return;
        }

        pendingSharedListPayload = cleanId;
        deliverPendingSharedList();
    }

    /*
     * Передаємо payload у JavaScript тільки після завантаження index.html.
     * JSONObject.quote() безпечно екранує текст, щоб дані зі стороннього
     * посилання не могли зламати JavaScript-виклик.
     */
    private void deliverPendingSharedList() {
        if (!mainPageLoaded || webView == null || pendingSharedListPayload == null) {
            return;
        }

        String payload = pendingSharedListPayload;
        pendingSharedListPayload = null;

        String javascript =
                "window.receiveSharedListId("
                        + JSONObject.quote(payload)
                        + ");";

        webView.evaluateJavascript(javascript, null);
    }

    /*
     * Створює анонімний Firebase-акаунт лише один раз.
     *
     * Після першого входу Firebase зберігає стан локально, тому під час
     * наступних запусків user вже існуватиме й повторний вхід не потрібен.
     */
    private void ensureAnonymousFirebaseLogin() {
        if (firebaseAuth == null) {
            return;
        }

        FirebaseUser currentUser = firebaseAuth.getCurrentUser();

        if (currentUser != null) {
            Log.d("KoshykFirebase", "Анонімний Firebase-вхід уже активний: "
                    + currentUser.getUid());
            return;
        }

        firebaseAuth.signInAnonymously()
                .addOnSuccessListener(result -> {
                    FirebaseUser user = firebaseAuth.getCurrentUser();

                    if (user != null) {
                        Log.d(
                                "KoshykFirebase",
                                "Створено анонімний Firebase-вхід: " + user.getUid()
                        );
                    }
                })
                .addOnFailureListener(error -> {
                    Log.e(
                            "KoshykFirebase",
                            "Не вдалося виконати анонімний Firebase-вхід",
                            error
                    );
                });
    }

    /*
     * Внутрішній callback: виконується, коли FirebaseUser уже існує.
     */
    private interface FirebaseUserAction {
        void run(FirebaseUser user);
    }

    /*
     * Виконує дію лише після успішного анонімного Firebase-входу.
     *
     * Це важливо, бо користувач може натиснути «Поділитись» одразу
     * після запуску застосунку — ще до завершення першого входу.
     */
    private void withFirebaseUser(
            FirebaseUserAction onSuccess,
            Runnable onFailure
    ) {
        if (firebaseAuth == null) {
            if (onFailure != null) {
                onFailure.run();
            }
            return;
        }

        FirebaseUser currentUser = firebaseAuth.getCurrentUser();

        if (currentUser != null) {
            onSuccess.run(currentUser);
            return;
        }

        firebaseAuth.signInAnonymously()
                .addOnSuccessListener(result -> {
                    FirebaseUser user = firebaseAuth.getCurrentUser();

                    if (user != null) {
                        onSuccess.run(user);
                    } else if (onFailure != null) {
                        onFailure.run();
                    }
                })
                .addOnFailureListener(error -> {
                    Log.e(
                            "KoshykFirebase",
                            "Не вдалося виконати Firebase-вхід перед обміном списком",
                            error
                    );

                    if (onFailure != null) {
                        onFailure.run();
                    }
                });
    }

    /*
     * Перетворює JSONObject на Map, який Firebase може записати як дані.
     */
    private Map<String, Object> jsonObjectToMap(JSONObject object) {
        Map<String, Object> map = new HashMap<>();

        Iterator<String> keys = object.keys();

        while (keys.hasNext()) {
            String key = keys.next();

            try {
                map.put(key, jsonValueToFirebaseValue(object.get(key)));
            } catch (Exception ignored) {
                // Некоректне поле просто не передаємо в Firebase.
            }
        }

        return map;
    }

    /*
     * Рекурсивне перетворення JSON-значень у Map/List/primitive,
     * які розуміє Firebase Realtime Database.
     */
    private Object jsonValueToFirebaseValue(Object value) {
        if (value == null || value == JSONObject.NULL) {
            return null;
        }

        if (value instanceof JSONObject) {
            return jsonObjectToMap((JSONObject) value);
        }

        if (value instanceof JSONArray) {
            JSONArray array = (JSONArray) value;
            List<Object> list = new ArrayList<>();

            for (int index = 0; index < array.length(); index++) {
                try {
                    list.add(jsonValueToFirebaseValue(array.get(index)));
                } catch (Exception ignored) {
                    list.add(null);
                }
            }

            return list;
        }

        return value;
    }

    /*
     * Повертає відповідь із Java в app.js.
     *
     * app.js прийматиме відповідь через:
     *
     * window.__onJavaSharedList(callbackId, jsonText)
     */
    private void deliverSharedListCallback(String callbackId, String body) {
        if (webView == null) {
            return;
        }

        String javascript =
                "window.__onJavaSharedList("
                        + JSONObject.quote(callbackId)
                        + ","
                        + JSONObject.quote(body)
                        + ");";

        webView.evaluateJavascript(javascript, null);
    }

    /*
     * Публікує список у Firebase під випадковим ID.
     *
     * JSON від app.js має формат:
     *
     * {
     *   "sourceListName": "АТБ (Київ)",
     *   "items": [ ... ]
     * }
     *
     * Java додає службові поля:
     * - version;
     * - ownerUid;
     * - createdAt;
     * - expiresAt.
     */
    private void publishSharedList(
            String exportJson,
            String callbackId
    ) {
        if (sharedListsRef == null) {
            deliverSharedListCallback(
                    callbackId,
                    "{\"ok\":false,\"error\":\"Firebase Database не ініціалізовано\"}"
            );
            return;
        }

        final JSONObject exportData;

        try {
            exportData = new JSONObject(exportJson);
        } catch (Exception error) {
            deliverSharedListCallback(
                    callbackId,
                    "{\"ok\":false,\"error\":\"Некоректні дані списку\"}"
            );
            return;
        }

        String sourceListName = exportData
                .optString("sourceListName", "")
                .trim();

        JSONArray items = exportData.optJSONArray("items");

        if (sourceListName.isEmpty() || items == null || items.length() == 0) {
            deliverSharedListCallback(
                    callbackId,
                    "{\"ok\":false,\"error\":\"Список порожній або має неправильний формат\"}"
            );
            return;
        }

        if (items.length() > 300) {
            deliverSharedListCallback(
                    callbackId,
                    "{\"ok\":false,\"error\":\"У списку забагато товарів\"}"
            );
            return;
        }

        withFirebaseUser(user -> {
            /*
             * Віднімаємо хвилину, щоб правило Firebase
             * expiresAt <= now + 30 днів гарантовано не відхилило запис
             * через невелику різницю годинника телефона й сервера.
             */
            long createdAt = System.currentTimeMillis();
            long expiresAt = createdAt + 2592000000L - 60000L;

            String listId = sharedListsRef.push().getKey();

            if (listId == null || listId.trim().isEmpty()) {
                deliverSharedListCallback(
                        callbackId,
                        "{\"ok\":false,\"error\":\"Не вдалося створити ID спільного списку\"}"
                );
                return;
            }

            Map<String, Object> record = new HashMap<>();

            record.put("version", 1);
            record.put("ownerUid", user.getUid());
            record.put("createdAt", createdAt);
            record.put("expiresAt", expiresAt);
            record.put("sourceListName", sourceListName);
            record.put("items", jsonValueToFirebaseValue(items));

            sharedListsRef
                    .child(listId)
                    .setValue(record)
                    .addOnSuccessListener(unused -> {
                        try {
                            JSONObject response = new JSONObject();

                            response.put("ok", true);
                            response.put("id", listId);
                            response.put("expiresAt", expiresAt);

                            deliverSharedListCallback(
                                    callbackId,
                                    response.toString()
                            );
                        } catch (Exception error) {
                            deliverSharedListCallback(
                                    callbackId,
                                    "{\"ok\":false,\"error\":\"Не вдалося сформувати відповідь\"}"
                            );
                        }
                    })
                    .addOnFailureListener(error -> {
                        Log.e(
                                "KoshykFirebase",
                                "Не вдалося записати спільний список у Firebase",
                                error
                        );

                        JSONObject response = new JSONObject();

                        try {
                            response.put("ok", false);
                            response.put(
                                    "error",
                                    "Не вдалося надіслати список: "
                                            + String.valueOf(error.getMessage())
                            );
                        } catch (Exception ignored) {
                            // У відповідь нижче все одно надійде текст помилки.
                        }

                        deliverSharedListCallback(
                                callbackId,
                                response.toString()
                        );
                    });
        }, () -> deliverSharedListCallback(
                callbackId,
                "{\"ok\":false,\"error\":\"Не вдалося виконати Firebase-вхід\"}"
        ));
    }

    private void startSharedListSync(final String listId, final String callbackId) {
        stopSharedListSync();

        if (sharedListsRef == null) {
            return;
        }

        String cleanId = String.valueOf(listId).trim();
        if (!cleanId.matches("[A-Za-z0-9_-]{12,80}")) {
            return;
        }

        activeSharedListRef = sharedListsRef.child(cleanId);
        activeSharedListListener = new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                if (!snapshot.exists()) {
                    return;
                }
                try {
                    JSONObject response = new JSONObject();
                    response.put("ok", true);
                    response.put("record", JSONObject.wrap(snapshot.getValue()));

                    if (callbackId != null && !callbackId.isEmpty()) {
                        String javascript =
                                "window.__onSharedListSync("
                                        + JSONObject.quote(callbackId)
                                        + ","
                                        + JSONObject.quote(response.toString())
                                        + ");";
                        if (webView != null) {
                            webView.evaluateJavascript(javascript, null);
                        }
                    }
                } catch (Exception ignored) {
                }
            }

            @Override
            public void onCancelled(DatabaseError error) {
            }
        };

        activeSharedListRef.addValueEventListener(activeSharedListListener);
    }

    private void stopSharedListSync() {
        if (activeSharedListRef != null && activeSharedListListener != null) {
            activeSharedListRef.removeEventListener(activeSharedListListener);
        }
        activeSharedListRef = null;
        activeSharedListListener = null;
    }

    private void updateSharedList(final String listId, final String jsonText, final String callbackId) {
        if (sharedListsRef == null) {
            return;
        }
        String cleanId = String.valueOf(listId).trim();
        if (!cleanId.matches("[A-Za-z0-9_-]{12,80}")) {
            return;
        }

        try {
            JSONObject updateData = new JSONObject(jsonText);
            JSONArray items = updateData.optJSONArray("items");
            if (items == null) {
                return;
            }

            withFirebaseUser(user -> {
                Map<String, Object> updates = new HashMap<>();
                updates.put("items", jsonValueToFirebaseValue(items));
                updates.put("updatedAt", System.currentTimeMillis());

                sharedListsRef.child(cleanId).updateChildren(updates)
                        .addOnSuccessListener(unused -> {
                            if (callbackId != null && !callbackId.isEmpty()) {
                                deliverSharedListCallback(callbackId, "{\"ok\":true}");
                            }
                        })
                        .addOnFailureListener(e -> {
                            if (callbackId != null && !callbackId.isEmpty()) {
                                deliverSharedListCallback(callbackId, "{\"ok\":false}");
                            }
                        });
            }, () -> {
            });
        } catch (Exception e) {
            if (callbackId != null && !callbackId.isEmpty()) {
                deliverSharedListCallback(callbackId, "{\"ok\":false}");
            }
        }
    }

    /*
     * Завантажує спільний список за коротким Firebase ID.
     *
     * Викликається після натискання посилання:
     *
     * koshyk://import?id=ВИПАДКОВИЙ_ID
     */
    private void loadSharedList(
            String listId,
            String callbackId
    ) {
        if (sharedListsRef == null) {
            deliverSharedListCallback(
                    callbackId,
                    "{\"ok\":false,\"error\":\"Firebase Database не ініціалізовано\"}"
            );
            return;
        }

        String cleanId = String.valueOf(listId).trim();

        /*
         * Firebase push-ID містить літери, цифри, - та _.
         * Перевірка не дає передати некоректний шлях до бази.
         */
        if (!cleanId.matches("[A-Za-z0-9_-]{12,80}")) {
            deliverSharedListCallback(
                    callbackId,
                    "{\"ok\":false,\"error\":\"Некоректний ID спільного списку\"}"
            );
            return;
        }

        withFirebaseUser(user -> {
            sharedListsRef
                    .child(cleanId)
                    .addListenerForSingleValueEvent(new ValueEventListener() {
                        @Override
                        public void onDataChange(DataSnapshot snapshot) {
                            if (!snapshot.exists()) {
                                deliverSharedListCallback(
                                        callbackId,
                                        "{\"ok\":false,\"error\":\"Список не знайдено або його термін дії завершився\"}"
                                );
                                return;
                            }

                            try {
                                JSONObject response = new JSONObject();

                                response.put("ok", true);
                                response.put(
                                        "record",
                                        JSONObject.wrap(snapshot.getValue())
                                );

                                deliverSharedListCallback(
                                        callbackId,
                                        response.toString()
                                );
                            } catch (Exception error) {
                                deliverSharedListCallback(
                                        callbackId,
                                        "{\"ok\":false,\"error\":\"Не вдалося прочитати спільний список\"}"
                                );
                            }
                        }

                        @Override
                        public void onCancelled(DatabaseError error) {
                            Log.e(
                                    "KoshykFirebase",
                                    "Firebase не дозволив завантажити спільний список",
                                    error.toException()
                            );

                            JSONObject response = new JSONObject();

                            try {
                                response.put("ok", false);
                                response.put(
                                        "error",
                                        "Список недоступний, пошкоджений або його термін дії завершився"
                                );
                            } catch (Exception ignored) {
                                // Нижче передається коректний JSON навіть без деталей.
                            }

                            deliverSharedListCallback(
                                    callbackId,
                                    response.toString()
                            );
                        }
                    });
        }, () -> deliverSharedListCallback(
                callbackId,
                "{\"ok\":false,\"error\":\"Не вдалося виконати Firebase-вхід\"}"
        ));
    }

    private void showAppLinkHelpIfNeeded() {
        boolean wasShown = getSharedPreferences(
                PREFS_NAME,
                MODE_PRIVATE
        ).getBoolean(APP_LINK_HELP_SHOWN_KEY, false);

        if (wasShown || isFinishing()) {
            return;
        }

        getSharedPreferences(PREFS_NAME, MODE_PRIVATE)
                .edit()
                .putBoolean(APP_LINK_HELP_SHOWN_KEY, true)
                .apply();

        new AlertDialog.Builder(this)
                .setTitle("Відкриття посилань")
                .setMessage(
                        "Щоб посилання на спільні списки відкривалися прямо у " +
                                "застосунку «Кошик», увімкніть «Відкривати підтримувані " +
                                "посилання» у налаштуваннях Android."
                )
                .setNegativeButton("Пізніше", null)
                .setPositiveButton("Відкрити налаштування", (dialog, which) -> {
                    openAppLinkSettingsScreen();
                })
                .show();
    }

    private void openAppLinkSettingsScreen() {
        try {
            Intent intent = new Intent(
                    Settings.ACTION_APP_OPEN_BY_DEFAULT_SETTINGS
            );

            intent.setData(Uri.parse("package:" + getPackageName()));

            startActivity(intent);
        } catch (Exception error) {
            Intent fallbackIntent = new Intent(
                    Settings.ACTION_APPLICATION_DETAILS_SETTINGS
            );

            fallbackIntent.setData(
                    Uri.parse("package:" + getPackageName())
            );

            startActivity(fallbackIntent);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
        }
    }

    @Override
    protected void onPause() {
        if (webView != null) {
            webView.onPause();
        }
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        handler.removeCallbacksAndMessages(null);

        if (fetcherView != null) {
            fetcherView.destroy();
        }
        if (silpoFetcherView != null) {
            silpoFetcherView.destroy();
        }
        if (googleImagesFetcherView != null) {
            googleImagesFetcherView.destroy();
        }
        if (varusFetcherView != null) {
            varusFetcherView.destroy();
        }
        if (webView != null) {
            webView.destroy();
        }

        super.onDestroy();
    }

    public class AppNetworkBridge {
        /*
         * Виклик із app.js:
         *
         * Android.fetchAtbProducts("молоко", "r123");
         *
         * Відповідь повертається у:
         *
         * window.__onJavaFetch(callbackId, jsonText)
         */
        @JavascriptInterface
        public void fetchAtbProducts(
                final String query,
                final int page,
                final String callbackId
        ) {
            handler.post(() ->
                    startAtbFetch(query, page, callbackId)
            );
        }

        /*
         * Виклик із app.js:
         *
         * Android.fetchVarusProducts("молоко", 1, "varus_123");
         *
         * Відповідь повертається у:
         *
         * window.__onVarusProducts(callbackId, jsonText)
         */
        @JavascriptInterface
        public void fetchVarusProducts(
                final String query,
                final int page,
                final String callbackId
        ) {
            handler.post(() -> startVarusFetch(query, page, callbackId));
        }

        @JavascriptInterface
        public void setStatusBarIcons(boolean darkTheme) {
            runOnUiThread(() ->
                    WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView())
                            .setAppearanceLightStatusBars(!darkTheme)
            );
        }

        /*
         * Тимчасовий діагностичний виклик.
         *
         * app.js:
         * Android.fetchSilpoKyivStores(callbackId);
         */
        @JavascriptInterface
        public void fetchSilpoKyivStores(final String callbackId) {
            handler.post(() -> startSilpoStoresFetch(callbackId));
        }

        @JavascriptInterface
        public void fetchSilpoDiagnostic(
                final String query,
                final String filialId,
                final String callbackId
        ) {
            handler.post(() ->
                    runSilpoWebFetch(query, filialId, 1, callbackId)
            );
        }

        /*
         * Виклик із app.js:
         *
         * Android.fetchSilpoProducts(query, filialId, callbackId);
         */
        @JavascriptInterface
        public void fetchSilpoProducts(
                final String query,
                final String filialId,
                final String callbackId
        ) {
            handler.post(() ->
                    runSilpoWebFetch(query, filialId, 1, callbackId)
            );
        }
        /*
         * Виклик із app.js:
         *
         * Android.fetchVarusProducts(query, page, callbackId);
         */

        @JavascriptInterface
        public void fetchSilpoProductsPage(
                final String query,
                final String filialId,
                final int page,
                final String callbackId
        ) {
            handler.post(() ->
                    runSilpoWebFetch(query, filialId, page, callbackId)
            );
        }

        /*
         * Виклик із app.js:
         *
         * Android.fetchGoogleImages("АТБ", "images_123");
         *
         * Відповідь повертається у:
         *
         * window.__onJavaFetch(callbackId, jsonText)
         */
        @JavascriptInterface
        public void fetchGoogleImages(
                final String query,
                final String callbackId
        ) {
            handler.post(() ->
                    startGoogleImagesFetch(query, callbackId)
            );
        }

        @JavascriptInterface
        public void fetchAtbProductByUrl(
                final String productUrl,
                final String callbackId
        ) {
            handler.post(() -> startAtbProductPageFetch(productUrl, callbackId));
        }

        /*
         * Виклик із app.js:
         *
         * Android.shareText("текст або посилання");
         *
         * Відкриває стандартне системне меню Android:
         * Telegram, Viber, Signal, Gmail, Bluetooth тощо.
         */
        @JavascriptInterface
        public void shareText(final String text) {
            handler.post(() -> {
                Intent sendIntent = new Intent(Intent.ACTION_SEND);
                sendIntent.setType("text/plain");
                sendIntent.putExtra(Intent.EXTRA_TEXT, text);

                Intent chooser = Intent.createChooser(
                        sendIntent,
                        "Надіслати спільний список"
                );

                startActivity(chooser);
            });
        }

        @JavascriptInterface
        public void openAppLinkSettings() {
            handler.post(() -> {
                try {
                    Intent intent = new Intent(
                            Settings.ACTION_APP_OPEN_BY_DEFAULT_SETTINGS
                    );

                    intent.setData(Uri.parse("package:" + getPackageName()));

                    startActivity(intent);
                } catch (Exception error) {
                    Intent fallbackIntent = new Intent(
                            Settings.ACTION_APPLICATION_DETAILS_SETTINGS
                    );

                    fallbackIntent.setData(
                            Uri.parse("package:" + getPackageName())
                    );

                    startActivity(fallbackIntent);
                }
            });
        }

        /*
         * Виклик із app.js:
         *
         * Android.publishSharedList(jsonText, callbackId);
         */
        @JavascriptInterface
        public void publishSharedList(
                final String jsonText,
                final String callbackId
        ) {
            handler.post(() -> MainActivity.this.publishSharedList(
                    jsonText,
                    callbackId
            ));
        }

        /*
         * Виклик із app.js:
         *
         * Android.loadSharedList(listId, callbackId);
         */
        @JavascriptInterface
        public void loadSharedList(
                final String listId,
                final String callbackId
        ) {
            handler.post(() -> MainActivity.this.loadSharedList(
                    listId,
                    callbackId
            ));
        }

        @JavascriptInterface
        public void startSharedListSync(final String listId, final String callbackId) {
            handler.post(() -> MainActivity.this.startSharedListSync(listId, callbackId));
        }

        @JavascriptInterface
        public void stopSharedListSync() {
            handler.post(() -> MainActivity.this.stopSharedListSync());
        }

        @JavascriptInterface
        public void updateSharedList(final String listId, final String jsonText, final String callbackId) {
            handler.post(() -> MainActivity.this.updateSharedList(listId, jsonText, callbackId));
        }

        @JavascriptInterface
        public void cancelAllStoreSearches() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    fetchGeneration++;
                    if (fetcherView != null) {
                        fetcherView.stopLoading();
                    }

                    silpoFetchGeneration++;
                    if (silpoFetcherView != null) {
                        silpoFetcherView.stopLoading();
                    }

                    varusFetchGeneration++;
                    if (varusFetcherView != null) {
                        varusFetcherView.stopLoading();
                    }
                }
            });
        }
    }

    /*
     * Відкриває Google Картинки за назвою списку.
     *
     * Запит формується строго з назви списку:
     * нічого не додаємо — ні «фото», ні «логотип», ні «icon».
     */
    private void startGoogleImagesFetch(
            String query,
            String callbackId
    ) {
        final String cleanQuery = String.valueOf(query).trim();

        if (cleanQuery.isEmpty()) {
            deliver(callbackId, "[]");
            return;
        }

        final int generation = ++googleImagesFetchGeneration;
        final long startedAt = System.currentTimeMillis();

        String url;

        try {
            url = "https://www.google.com.ua/search?q="
                    + URLEncoder.encode(cleanQuery, "UTF-8")
                    + "&udm=2&hl=uk";
        } catch (Exception error) {
            deliver(
                    callbackId,
                    "JAVA_ERROR: не вдалося сформувати посилання Google Картинок"
            );
            return;
        }

        googleImagesFetcherView.loadUrl(url);

        handler.postDelayed(
                () -> pollGoogleImages(
                        generation,
                        startedAt,
                        callbackId
                ),
                1500
        );
    }


    private void pollGoogleImages(
            final int generation,
            final long startedAt,
            final String callbackId
    ) {
        if (generation != googleImagesFetchGeneration) {
            return;
        }

        googleImagesFetcherView.evaluateJavascript(
                EXTRACT_GOOGLE_IMAGES_JS,
                value -> {
                    if (generation != googleImagesFetchGeneration) {
                        return;
                    }

                    long elapsed =
                            System.currentTimeMillis() - startedAt;

                    try {
                        JSONObject result = new JSONObject(value);

                        boolean isComplete =
                                "complete".equals(
                                        result.optString("ready")
                                );

                        JSONArray images =
                                result.optJSONArray("images");

                        int imageCount =
                                images == null ? 0 : images.length();

                        if (isComplete && imageCount > 0) {
                            JSONArray limited = new JSONArray();

                            for (int index = 0;
                                 index < images.length() &&
                                         limited.length() < 6;
                                 index++) {

                                String imageUrl = images
                                        .optString(index, "")
                                        .trim();

                                if (!imageUrl.isEmpty()) {
                                    JSONObject item = new JSONObject();
                                    item.put("image", imageUrl);
                                    limited.put(item);
                                }
                            }

                            if (limited.length() > 0) {
                                deliver(
                                        callbackId,
                                        limited.toString()
                                );
                                return;
                            }
                        }
                    } catch (Exception ignored) {
                        // Сторінка Google ще не готова.
                    }

                    if (elapsed > 25000) {
                        String debugText = "";

                        try {
                            JSONObject result = new JSONObject(value);
                            debugText = result.optString("debug", "");
                        } catch (Exception ignored) {
                            debugText = "Не вдалося прочитати діагностику сторінки.\n\n"
                                    + String.valueOf(value);
                        }

                        deliver(
                                callbackId,
                                "JAVA_DEBUG: " + debugText
                        );

                        return;
                    }

                    handler.postDelayed(
                            () -> pollGoogleImages(
                                    generation,
                                    startedAt,
                                    callbackId
                            ),
                            1000
                    );
                }
        );
    }

    private void startAtbProductPageFetch(
            String productUrl,
            String callbackId
    ) {
        final String cleanUrl = String.valueOf(productUrl).trim();

        if (!cleanUrl.startsWith("https://www.atbmarket.com/")) {
            deliver(callbackId, "JAVA_ERROR: некоректна адреса товару АТБ");
            return;
        }

        final int generation = ++fetchGeneration;
        final long startedAt = System.currentTimeMillis();

        fetcherView.loadUrl(cleanUrl);

        handler.postDelayed(
                () -> pollAtbProductPage(
                        generation,
                        startedAt,
                        cleanUrl,
                        callbackId
                ),
                1000
        );
    }

    private void pollAtbProductPage(
            final int generation,
            final long startedAt,
            final String expectedUrl,
            final String callbackId
    ) {
        if (generation != fetchGeneration) {
            return;
        }

        fetcherView.evaluateJavascript(EXTRACT_ATB_PRODUCT_PAGE_JS, value -> {
            if (generation != fetchGeneration) {
                return;
            }

            long elapsed = System.currentTimeMillis() - startedAt;

            try {
                JSONObject result = new JSONObject(value);

                boolean isExpectedPage = result
                        .optString("href")
                        .startsWith(expectedUrl);

                boolean isComplete = "complete".equals(result.optString("ready"));
                boolean isChallenge = result.optBoolean("challenge");
                double price = result.optDouble("price", 0);

                if (isExpectedPage && price > 0) {
                    deliver(callbackId, result.toString());
                    return;
                }

                if (isExpectedPage && isComplete && !isChallenge && elapsed > 4000) {
                    deliver(callbackId, "[]");
                    return;
                }
            } catch (Exception ignored) {
                // WebView ще не отримав або не завершив обробку сторінки.
            }

            if (elapsed > 25000) {
                deliver(
                        callbackId,
                        "JAVA_TIMEOUT: сторінка товару АТБ не відповіла за 25 с"
                );
                return;
            }

            handler.postDelayed(
                    () -> pollAtbProductPage(
                            generation,
                            startedAt,
                            expectedUrl,
                            callbackId
                    ),
                    700
            );
        });
    }

    private void startAtbFetch(
            String query,
            int page,
            String callbackId
    ) {
        final int generation = ++fetchGeneration;
        final long startedAt = System.currentTimeMillis();
        final String marker = "_k=" + generation;
        final int currentPage = Math.max(1, page);

        String url;

        try {
            url = "https://www.atbmarket.com/sch?lang=uk&query="
                    + URLEncoder.encode(query, "UTF-8")
                    + "&"
                    + marker;
        } catch (Exception e) {
            deliver(callbackId, "JAVA_ERROR: " + e.getMessage());
            return;
        }

        if (currentPage > 1) {
            url += "&page=" + currentPage;
        }

        fetcherView.loadUrl(url);

        handler.postDelayed(
                () -> pollAtb(generation, startedAt, marker, callbackId),
                1000
        );
    }

    private void pollAtb(
            final int generation,
            final long startedAt,
            final String marker,
            final String callbackId
    ) {
        if (generation != fetchGeneration) {
            return;
        }

        fetcherView.evaluateJavascript(EXTRACT_JS, value -> {
            if (generation != fetchGeneration) {
                return;
            }

            long elapsed = System.currentTimeMillis() - startedAt;
            String pageTitle = "";

            try {
                JSONObject result = new JSONObject(value);

                pageTitle = result.optString("title");

                boolean isOurSearchPage = result.optString("href").contains(marker);
                boolean isComplete = "complete".equals(result.optString("ready"));
                boolean isChallenge = result.optBoolean("challenge");

                JSONArray products = result.optJSONArray("items");
                int productCount = products == null ? 0 : products.length();

                // Сторінка АТБ завантажилась і має товари.
                if (isOurSearchPage && productCount > 0) {
                    deliver(callbackId, products.toString());
                    return;
                }

                /*
                 * Сторінка вже завершила завантаження, Cloudflare не просить
                 * перевірку, але карток товарів немає. Це означає «не знайдено».
                 */
                if (isOurSearchPage && isComplete && !isChallenge && elapsed > 4000) {
                    deliver(callbackId, "[]");
                    return;
                }
            } catch (Exception ignored) {
                // Сторінка або JavaScript-результат ще не готові.
            }

            if (elapsed > 25000) {
                deliver(
                        callbackId,
                        "JAVA_TIMEOUT: сайт АТБ не відповів за 25 с (заголовок: \""
                                + pageTitle
                                + "\")"
                );
                return;
            }

            handler.postDelayed(
                    () -> pollAtb(generation, startedAt, marker, callbackId),
                    700
            );
        });
    }

    private void deliver(String callbackId, String body) {
        String javascript =
                "window.__onJavaFetch("
                        + JSONObject.quote(callbackId)
                        + ","
                        + JSONObject.quote(body)
                        + ");";

        webView.evaluateJavascript(javascript, null);
    }


    private void startVarusFetch(
            String query,
            int page,
            String callbackId
    ) {
        varusFetchGeneration++;

        final int generation = varusFetchGeneration;
        final long startedAt = System.currentTimeMillis();
        final int currentPage = Math.max(1, page);

        String encodedQuery;

        try {
            encodedQuery = URLEncoder.encode(
                    (query == null ? "" : query).trim(),
                    "UTF-8"
            );
        } catch (Exception error) {
            deliver(callbackId, "[]");
            return;
        }

        final String expectedUrl =
                VARUS_SEARCH_URL + encodedQuery;

        String url = expectedUrl;

        if (currentPage > 1) {
            url += "&page=" + currentPage;
        }

        varusFetcherView.stopLoading();
        varusFetcherView.loadUrl(url);

        pollVarusWebFetch(
                generation,
                startedAt,
                callbackId,
                currentPage,
                expectedUrl
        );
    }

    private void pollVarusWebFetch(
            final int generation,
            final long startedAt,
            final String callbackId,
            final int page,
            final String expectedUrl
    ) {
        if (generation != varusFetchGeneration) {
            return;
        }

        if (System.currentTimeMillis() - startedAt > 80000L) {
            deliver(callbackId, "JAVA_Таймаут 45 с");
            return;
        }

        boolean isNewPageLoaded =
                varusLoadedGeneration == generation &&
                        varusLoadedUrl.startsWith(expectedUrl);

        if (!isNewPageLoaded) {

            handler.postDelayed(
                    () -> pollVarusWebFetch(
                            generation,
                            startedAt,
                            callbackId,
                            page,
                            expectedUrl
                    ),
                    300
            );

            return;
        }

        varusFetcherView.evaluateJavascript(
                EXTRACT_VARUS_JS,
                result -> {
                    if (generation != varusFetchGeneration) {
                        return;
                    }

                    try {
                        JSONObject pageData = new JSONObject(
                                result == null || result.equals("null")
                                        ? "{}"
                                        : result
                        );

                        JSONArray rawItems = pageData.optJSONArray("items");
                        JSONArray products = new JSONArray();

                        if (rawItems != null) {
                            int limit = Math.min(rawItems.length(), 30);

                            for (int index = 0; index < limit; index++) {
                                JSONObject rawItem = rawItems.optJSONObject(index);

                                if (rawItem == null) {
                                    continue;
                                }

                                String title = rawItem.optString("title", "").trim();
                                String url = rawItem.optString("url", "").trim();
                                double price = rawItem.optDouble("price", 0);

                                if (title.isEmpty() || url.isEmpty() || price <= 0) {
                                    continue;
                                }

                                JSONObject product = new JSONObject();
                                product.put("id", rawItem.optString("id", url));
                                product.put("title", title);
                                product.put("price", price);
                                product.put("image", rawItem.optString("image", ""));
                                product.put("url", url);

                                products.put(product);
                            }
                        }

                        if (products.length() > 0) {
                            deliver(callbackId, products.toString());
                            return;
                        }

                        handler.postDelayed(
                                () -> pollVarusWebFetch(
                                        generation,
                                        startedAt,
                                        callbackId,
                                        page,
                                        expectedUrl
                                ),
                                300
                        );
                    } catch (Exception error) {
                        handler.postDelayed(
                                () -> pollVarusWebFetch(
                                        generation,
                                        startedAt,
                                        callbackId,
                                        page,
                                        expectedUrl
                                ),
                                300
                        );
                    }
                }
        );
    }

    private void runSilpoWebFetch(
            String query,
            String filialId,
            int page,
            String callbackId
    ) {
        silpoFetchGeneration++;

        final int generation = silpoFetchGeneration;
        final long startedAt = System.currentTimeMillis();
        final int currentPage = Math.max(1, page);

        silpoFetcherView.loadUrl(SILPO_KYIV_STORES_URL);

        handler.postDelayed(() ->
                        pollSilpoWebFetch(
                                generation,
                                startedAt,
                                callbackId,
                                query,
                                filialId,
                                currentPage
                        ),
                300
        );
    }

    private void pollSilpoWebFetch(
            final int generation,
            final long startedAt,
            final String callbackId,
            final String query,
            final String filialId,
            final int page
    ) {
        if (generation != silpoFetchGeneration) {
            return;
        }

        silpoFetcherView.evaluateJavascript(
                EXTRACT_SILPO_FILIAL_JS,
                value -> {
                    if (generation != silpoFetchGeneration) {
                        return;
                    }

                    String currentFilialId = filialId;

                    try {
                        JSONObject parsed = new JSONObject(value);
                        String extracted = parsed.optString("filialId", "");

                        if (!extracted.trim().isEmpty()) {
                            currentFilialId = extracted;
                        }
                    } catch (Exception ignored) {
                    }

                    if (currentFilialId == null ||
                            currentFilialId.trim().isEmpty()) {

                        long elapsed = System.currentTimeMillis() - startedAt;

                        if (elapsed > 20000) {
                            deliver(callbackId, "[]");
                            return;
                        }

                        handler.postDelayed(() ->
                                        pollSilpoWebFetch(
                                                generation,
                                                startedAt,
                                                callbackId,
                                                query,
                                                filialId,
                                                page
                                        ),
                                300
                        );
                        return;
                    }

                    String searchUrl = "https://silpo.ua/search?find=";

                    try {
                        searchUrl += URLEncoder.encode(
                                String.valueOf(query),
                                "UTF-8"
                        );
                    } catch (Exception ignored) {
                        searchUrl += String.valueOf(query);
                    }

                    if (page > 1) {
                        searchUrl += "&page=" + page;
                    }

                    silpoFetcherView.loadUrl(searchUrl);

                    handler.postDelayed(() ->
                                    pollSilpoSearchResults(
                                            generation,
                                            startedAt,
                                            callbackId,
                                            query,
                                            page
                                    ),
                            500
                    );
                }
        );
    }

    private void pollSilpoSearchResults(
            final int generation,
            final long startedAt,
            final String callbackId,
            final String query,
            final int page
    ) {
        if (generation != silpoFetchGeneration) {
            return;
        }

        silpoFetcherView.evaluateJavascript(
                buildSilpoScrapeScript(),
                value -> {
                    if (generation != silpoFetchGeneration) {
                        return;
                    }

                    String items = "[]";
                    String raw = value;

                    try {
                        Object unquoted = new JSONTokener(raw).nextValue();
                        if (unquoted instanceof String) {
                            raw = (String) unquoted;
                        }
                    } catch (Exception ignored) {
                    }

                    try {
                        JSONObject parsed = new JSONObject(raw);
                        items = parsed.optString("items", "[]");
                    } catch (Exception ignored) {
                    }
                    if (!items.equals("[]")) {
                        deliver(callbackId, items);
                        return;
                    }

                    long elapsed = System.currentTimeMillis() - startedAt;

                    if (elapsed > 75000) {
                        deliver(
                                callbackId,
                                "JAVA_DEBUG: " + String.valueOf(value)
                                        + "\\n\\nМинуло секунд: "
                                        + (elapsed / 1000)
                        );
                        return;
                    }

                    handler.postDelayed(() ->
                                    pollSilpoSearchResults(
                                            generation,
                                            startedAt,
                                            callbackId,
                                            query,
                                            page
                                    ),
                            500
                    );
                }
        );
    }

    private String buildSilpoScrapeScript() {
        return "(function(){" +
                "var buttons=document.querySelectorAll('button, a, div[role=\"button\"]');" +
                "for(var i=0;i<buttons.length;i++){" +
                "var b=buttons[i];" +
                "var t=(b.innerText||'').toUpperCase();" +
                "if(t.indexOf('ПРИЙНЯТИ')>=0||t.indexOf('ACCEPT')>=0||t.indexOf('ДОБРЕ')>=0){" +
                "b.click();break;" +
                "}" +
                "}" +

                "function getSilpoProductImage(card){" +
                "var urls=[];" +
                "var imgs=card.querySelectorAll('img');" +
                "for(var i=0;i<imgs.length;i++){" +
                "var img=imgs[i];" +
                "if(img.currentSrc)urls.push(img.currentSrc);" +
                "if(img.getAttribute('src'))urls.push(img.getAttribute('src'));" +
                "if(img.getAttribute('data-src'))urls.push(img.getAttribute('data-src'));" +
                "if(img.getAttribute('data-lazy-src'))urls.push(img.getAttribute('data-lazy-src'));" +
                "var set=img.getAttribute('srcset')||img.getAttribute('data-srcset')||'';" +
                "if(set){" +
                "var sp=set.split(',');" +
                "for(var s=0;s<sp.length;s++){" +
                "var su=sp[s].trim().split(' ')[0];" +
                "if(su)urls.push(su);" +
                "}" +
                "}" +
                "}" +
                "var all=card.querySelectorAll('*');" +
                "for(var i=0;i<all.length&&i<80;i++){" +
                "var st=window.getComputedStyle(all[i]);" +
                "var bg=st.backgroundImage||'';" +
                "if(bg&&bg.indexOf('url(')>=0){" +
                "var m=bg.match(/url\\([\"']?(.*?)[\"']?\\)/);" +
                "if(m&&m[1])urls.push(m[1]);" +
                "}" +
                "}" +
                "var best='';" +
                "for(var i=0;i<urls.length;i++){" +
                "var raw=urls[i];" +
                "if(!raw||raw.indexOf('data:')===0)continue;" +
                "if(raw.indexOf('//')===0)raw='https:'+raw;" +
                "if(raw.indexOf('/')===0)raw='https://silpo.ua'+raw;" +
                "try{" +
                "var host=new URL(raw).hostname;" +
                "if(host==='images.silpo.ua'&&(!best||raw.length>best.length))best=raw;" +
                "}catch(e){}" +
                "}" +
                "return best;" +
                "}" +

                "function cleanTitle(value){" +
                "var t=String(value||'');" +
                "t=t.replace(/\\d+([.,]\\d{1,2})?\\s*грн/gi,' ');" +
                "t=t.replace(/-\\s*\\d{1,2}\\s*%/gi,' ');" +
                "t=t.replace(/\\bРоздріб\\b/gi,' ');" +
                "t=t.replace(/\\bвід\\s+\\d+\\s*шт\\b/gi,' ');" +
                "t=t.replace(/\\s+/g,' ').trim();" +
                "t=t.replace(/\\s+\\d([.,]\\d)?$/,'').trim();" +
                "return t;" +
                "}" +

                "function isBadTitle(value){" +
                "var t=String(value||'').toLowerCase();" +
                "if(!t)return true;" +
                "var bad=['only_online','only online','cinotyzhyky','national-cashback','melkoopt','additional','znyzhkonyky','banner','банер','акція','промо'];" +
                "for(var i=0;i<bad.length;i++){" +
                "if(t===bad[i])return true;" +
                "}" +
                "return false;" +
                "}" +

                "var links=document.querySelectorAll('a[href*=\"/product/\"]');" +
                "var out=[];" +
                "var seen={};" +

                "for(var i=0;i<links.length&&out.length<30;i++){" +
                "var a=links[i];" +
                "var card=a;" +
                "for(var p=0;p<6&&card;p++,card=card.parentElement){" +
                "if((card.innerText||'').indexOf('грн')>=0)break;" +
                "}" +
                "if(!card)card=a;" +

                "var text=card.innerText||a.innerText||'';" +
                "var img=card.querySelector('img')||a.querySelector('img');" +
                "var imgSrc=getSilpoProductImage(card);" +

                "var title=cleanTitle(card.innerText||a.innerText||'');" +
                "if(isBadTitle(title)){" +
                "var altTitle=cleanTitle(img&&img.alt?img.alt:'');" +
                "if(!isBadTitle(altTitle))title=altTitle;" +
                "}" +

                "var prices=[];" +
                "var re=/([0-9]+[.,][0-9]{2})/g;" +
                "var m;" +
                "while((m=re.exec(text))!==null){" +
                "var val=parseFloat(m[1].replace(',','.'));" +
                "if(val>0&&prices.indexOf(val)<0)prices.push(val);" +
                "}" +

                "var price=prices.length>0?prices[0]:0;" +

                "if(!title||price<=0)continue;" +

                "var key=title.toLowerCase();" +

                "if(seen[key]){" +
                "for(var d=0;d<out.length;d++){" +
                "if(out[d].title.toLowerCase()===key){" +
                "if(!out[d].image&&imgSrc){" +
                "out[d].image=imgSrc;" +
                "}" +
                "break;" +
                "}" +
                "}" +
                "continue;" +
                "}" +

                "seen[key]=true;" +

                "var href=a.href||'';" +
                "var urlParts=href.split('?')[0].split('#')[0].replace(/\\/+$/, '').split('/');" +
                "var productId=card.getAttribute('data-product-id')||card.getAttribute('data-id')||urlParts[urlParts.length-1]||href;" +

                "out.push({id:productId,title:title,price:price,image:imgSrc,url:href});" +
                "}" +

                "return JSON.stringify({items:JSON.stringify(out)});" +
                "})()";
    }


    /*
     * Читає актуальний filialId зі сторінки магазинів Сільпо в Києві.
     */
    private String requestSilpoKyivFilialId() {
        HttpURLConnection connection = null;

        try {
            connection = openGetConnection(SILPO_KYIV_STORES_URL);

            int code = connection.getResponseCode();

            if (code < 200 || code >= 300) {
                return "";
            }

            String html = readConnectionBody(connection);

            Matcher matcher = Pattern
                    .compile("filial=\\\"([0-9]{2,10})\\\"", Pattern.CASE_INSENSITIVE)
                    .matcher(html);

            if (matcher.find()) {
                return matcher.group(1);
            }

            return "";
        } catch (Exception error) {
            Log.w("SilpoSearch", "Не вдалося зчитати filialId Сільпо", error);
            return "";
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    private HttpURLConnection openGetConnection(String url) throws Exception {
        HttpURLConnection connection =
                (HttpURLConnection) new URL(url).openConnection();

        connection.setRequestMethod("GET");
        connection.setConnectTimeout(15000);
        connection.setReadTimeout(20000);
        connection.setRequestProperty(
                "User-Agent",
                "Mozilla/5.0 (Linux; Android) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36"
        );

        return connection;
    }


    private String readConnectionBody(HttpURLConnection connection) throws Exception {
        InputStream stream =
                connection.getResponseCode() >= 200 &&
                        connection.getResponseCode() < 300
                        ? connection.getInputStream()
                        : connection.getErrorStream();

        if (stream == null) {
            return "";
        }

        BufferedReader reader = new BufferedReader(
                new InputStreamReader(stream, "UTF-8")
        );

        StringBuilder builder = new StringBuilder();
        String line;

        while ((line = reader.readLine()) != null) {
            builder.append(line);
        }

        reader.close();
        return builder.toString();
    }


    /*
     * Автоматично зчитує актуальний filialId Сільпо для Києва.
     */
    /*
     * Автоматично зчитує актуальний filialId Сільпо для Києва.
     *
     * Спочатку пробуємо звичайний HTTP-запит.
     * Якщо не вийшло — використовуємо WebView.
     */
    private void startSilpoStoresFetch(String callbackId) {
        new Thread(() -> {
            String filialId = requestSilpoKyivFilialId();

            if (filialId != null && !filialId.trim().isEmpty()) {
                JSONObject response = new JSONObject();

                try {
                    response.put("filialId", filialId);
                } catch (Exception ignored) {
                    // Не перериваємо виконання.
                }

                String body = response.toString();

                handler.post(() -> deliver(callbackId, body));
                return;
            }

            handler.post(() -> startSilpoFilialWebViewFetch(callbackId));
        }).start();
    }

    /*
     * Резервний спосіб: зчитування filialId через прихований WebView.
     */
    private void startSilpoFilialWebViewFetch(String callbackId) {
        silpoFetchGeneration++;

        final int generation = silpoFetchGeneration;
        final long startedAt = System.currentTimeMillis();

        silpoFetcherView.loadUrl(SILPO_KYIV_STORES_URL);

        handler.postDelayed(
                () -> pollSilpoFilialId(
                        generation,
                        startedAt,
                        callbackId
                ),
                1500
        );
    }

    private void pollSilpoFilialId(
            final int generation,
            final long startedAt,
            final String callbackId
    ) {
        if (generation != silpoFetchGeneration) {
            return;
        }

        silpoFetcherView.evaluateJavascript(
                EXTRACT_SILPO_FILIAL_JS,
                value -> {
                    if (generation != silpoFetchGeneration) {
                        return;
                    }

                    try {
                        JSONObject result = new JSONObject(value);
                        String filialId =
                                result.optString("filialId", "");

                        if (!filialId.trim().isEmpty()) {
                            JSONObject response = new JSONObject();
                            response.put("filialId", filialId);

                            deliver(callbackId, response.toString());
                            return;
                        }
                    } catch (Exception ignored) {
                        // Сторінка ще завантажується.
                    }

                    long elapsed =
                            System.currentTimeMillis() - startedAt;

                    if (elapsed > 15000) {
                        deliver(
                                callbackId,
                                "JAVA_Не вдалося зчитати filialId Сільпо."
                        );
                        return;
                    }

                    handler.postDelayed(
                            () -> pollSilpoFilialId(
                                    generation,
                                    startedAt,
                                    callbackId
                            ),
                            500
                    );
                }
        );
    }


}