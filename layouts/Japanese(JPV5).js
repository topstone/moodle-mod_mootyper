// 日本語入力用のローマ字バッファと変換マップ
var jpRomaBuffer = "";
var jpRomaMap = {
    "a":"あ","i":"い","u":"う","e":"え","o":"お",
    "ka":"か","ki":"き","ku":"く","ke":"け","ko":"こ",
    "sa":"さ","si":"し","su":"す","se":"せ","so":"そ",
    "ta":"た","ti":"ち","tu":"つ","te":"て","to":"と",
    "na":"な","ni":"に","nu":"ぬ","ne":"ね","no":"の",
    "ha":"は","hi":"ひ","hu":"ふ","he":"へ","ho":"ほ",
    "ma":"ま","mi":"み","mu":"む","me":"め","mo":"も",
    "ya":"や","yu":"ゆ","yo":"よ",
    "ra":"ら","ri":"り","ru":"る","re":"れ","ro":"ろ",
    "wa":"わ","wo":"を","nn":"ん",
    "sha":"しゃ","sya":"しゃ","shu":"しゅ","syu":"しゅ","sho":"しょ","syo":"しょ",
    "cha":"ちゃ","tya":"ちゃ","chu":"ちゅ","tyu":"ちゅ","cho":"ちょ","tyo":"ちょ",
    "shi":"し"
};

/**
 * @fileOverview English(UKV5.0) keyboard driver.
 * @author <a href="mailto:drachels@drachels.com">AL Rachels</a>
 * @version 5.0
 * @since 03/12/2021
 */

/**
 * Check for combined character.
 * @param {string} chr The combined character.
 * @returns {string} The character.
 */
function isCombined(chr) {
    if (!chr) return false;
    return !chr.match(/^[a-zA-Z0-9 \n\r\t.,;:?!'"()\[\]{}_\-+=\\*&^%$#@~`<>]/);
}


/**
 * Process keyup for combined character.
 * @param {string} e The combined character.
 * @returns {bolean} The result.
 */
function keyupCombined(e) {
    return false;
}

/**
 * Process keyupFirst.
 * @param {string} event Type of event.
 * @returns {bolean} The event.
 */
function keyupFirst(event) {
    if (!event) return false;
    var key = event.key.toLowerCase();
    
    // アルファベットキーが押されたらバッファに溜める
    if (key.match(/^[a-z]$/)) {
        jpRomaBuffer += key;
    } else {
        return false;
    }
    
    // 教材の「現在の文字」を取得
    var targetChar = fullText[currentPos];
    
    // もし現在のバッファがマップにあれば変換する
    if (jpRomaMap[jpRomaBuffer]) {
        var converted = jpRomaMap[jpRomaBuffer];
        
        // 変換後のひらがなが教材の文字と一致したか判定
        if (targetChar === converted) {
            // 正解なのでバッファをクリアしてMooTyperのカーソルを進める
            jpRomaBuffer = "";
            moveCursor(currentPos + 1);
            currentPos = currentPos + 1;
            currentChar = fullText[currentPos];
            
            // 次の文字も日本語なら入力をフックし続ける
            if (isCombined(currentChar)) {
                $("#form1").off("keypress", "#tb1", keyPressed);
                $("#form1").on("keyup", "#tb1", keyupFirst);
            } else {
                // 通常の英数字に戻る場合はイベントを標準に戻す
                $("#form1").off("keyup", "#tb1", keyupFirst);
                $("#form1").on("keypress", "#tb1", keyPressed);
            }
        }
    } else {
        // マップにない組み合わせで、かつ3文字以上になっていたらタイプミスの可能性が高いのでリセット
        if (jpRomaBuffer.length >= 3) {
            jpRomaBuffer = "";
        }
    }
    return false;
}


/**
 * Check for character typed so flags can be set.
 * @param {string} ltr The current letter.
 */
function keyboardElement(ltr) {
    this.chr = ltr.toLowerCase();
    this.alt = false;
    if (isLetter(ltr)) { // Set specified shift key for right or left.
        if (ltr.match(/[QWERTASDFGZXCVB]/)) {
            this.shiftright = true;
        } else if (ltr.match(/[YUIOPHJKLNM]/)) {
            this.shiftleft = true;
        }
    } else {
        // @codingStandardsIgnoreLine
        if (ltr.match(/[¬!"£$%|]/i)) {
            this.shiftright = true;
        } else if (ltr.match(/[\^&*()_+{}:@~<>?]/)) {
            this.shiftleft = true;
        }
    }
    // Set flags for characters needing Alt Gr key.
    // @codingStandardsIgnoreLine
    if (ltr.match(/[¦€áéúíó]/)) {
        this.alt = true;
    } else if (ltr.match(/[ÉÁ]/)) {
        this.shiftright = true;
        this.alt = true;
    } else if (ltr.match(/[ÚÍÓ]/)) {
        this.shiftleft = true;
        this.alt = true;
    }
    this.turnOn = function() {
        if (isLetter(this.chr)) {
            document.getElementById(getKeyID(this.chr)).className = "next" + thenFinger(this.chr.toLowerCase());
        } else if (this.chr === ' ') {
            document.getElementById(getKeyID(this.chr)).className = "nextSpace";
        } else {
            document.getElementById(getKeyID(this.chr)).className = "next" + thenFinger(this.chr.toLowerCase());
        }
        if (this.chr === '\n' || this.chr === '\r\n' || this.chr === '\n\r' || this.chr === '\r') {
            document.getElementById('jkeyenter').className = "next4";
        }
        if (this.shiftleft) {
            document.getElementById('jkeyshiftl').className = "next4";
        }
        if (this.shiftright) {
            document.getElementById('jkeyshiftr').className = "next4";
        }
        if (this.alt) {
            document.getElementById('jkeyaltgr').className = "nextSpace";
        }
    };
    this.turnOff = function() {
        if (isLetter(this.chr)) {
        // @codingStandardsIgnoreLine
            if (this.chr.match(/[asdfjkl;]/i)) {
                document.getElementById(getKeyID(this.chr)).className = "finger" + thenFinger(this.chr.toLowerCase());
            } else {
                document.getElementById(getKeyID(this.chr)).className = "normal";
            }
        } else {
            document.getElementById(getKeyID(this.chr)).className = "normal";
        }
        if (this.chr === '\n' || this.chr === '\r\n' || this.chr === '\n\r' || this.chr === '\r') {
            document.getElementById('jkeyenter').classname = "normal";
        }
        if (this.shiftleft) {
            document.getElementById('jkeyshiftl').className = "normal";
        }
        if (this.shiftright) {
            document.getElementById('jkeyshiftr').className = "normal";
        }
        if (this.alt) {
            document.getElementById('jkeyaltgr').className = "normal";
        }
    };
}

/**
 * Set color flag based on current character.
 * @param {string} tCrka The current character.
 * @returns {number}.
 */
function thenFinger(tCrka) {
    if (tCrka === ' ') {
        return 5; // Highlight the spacebar.
    // @codingStandardsIgnoreLine
    } else if (tCrka.match(/[`¬¦1!qaáz0)p;:/?\-_[@{'=+\]}\\|~#]/i)) {
        return 4; // Highlight the correct key above in red.
    // @codingStandardsIgnoreLine
    } else if (tCrka.match(/[2"wsx9(oól.>]/i)) {
        return 3; // Highlight the correct key above in green.
    // @codingStandardsIgnoreLine
    } else if (tCrka.match(/[3£eédc8*iík,<]/i)) {
        return 2; // Highlight the correct key above in yellow.
    // @codingStandardsIgnoreLine
    } else if (tCrka.match(/[4$€rfv5%tgb6^yhn7&uújm]/i)) {
        return 1; // Highlight the correct key above in blue.
    } else {
        return 6; // Do not change any highlight.
    }
}

/**
 * Get ID of key to highlight based on current character.
 * @param {string} tCrka The current character.
 * @returns {string}.
 */
function getKeyID(tCrka) {
    if (tCrka === ' ') {
        return "jkeyspace";
    } else if (tCrka === ',') {
        return "jkeycomma";
    } else if (tCrka === '\n') {
        return "jkeyenter";
    } else if (tCrka === '.') {
        return "jkeyperiod";
    } else if (tCrka === '-' || tCrka === '_') {
        return "jkeyminus";
    } else if (tCrka === '`' || tCrka === '¬' || tCrka === '¦') {
        return "jkeybackquote";
    } else if (tCrka === '!') {
        return "jkey1";
    } else if (tCrka === '"') {
        return "jkey2";
    } else if (tCrka === '£') {
        return "jkey3";
    } else if (tCrka === '$' || tCrka === '€') {
        return "jkey4";
    } else if (tCrka === '%') {
        return "jkey5";
    } else if (tCrka === '^') {
        return "jkey6";
    } else if (tCrka === '&') {
        return "jkey7";
    } else if (tCrka === '*') {
        return "jkey8";
    } else if (tCrka === '(') {
        return "jkey9";
    } else if (tCrka === ')') {
        return "jkey0";
    } else if (tCrka === '-' || tCrka === '_') {
        return "jkeyminus";
    } else if (tCrka === '[' || tCrka === '{') {
        return "jkeybracketl";
    } else if (tCrka === ']' || tCrka === '}') {
        return "jkeybracketr";
    } else if (tCrka === ';' || tCrka === ':') {
        return "jkeysemicolon";
    } else if (tCrka === "'" || tCrka === '@') {
        return "jkeycrtica";
    } else if (tCrka === "\\" || tCrka === '|') {
        return "jkeybackslash";
    } else if (tCrka === ',' || tCrka === '<') {
        return "jkeycomma";
    } else if (tCrka === '.' || tCrka === '>') {
        return "jkeyperiod";
    } else if (tCrka === '=' || tCrka === '+') {
        return "jkeyequals";
    } else if (tCrka === '?' || tCrka === '/') {
        return "jkeyslash";
    } else if (tCrka === 'é') {
        return "jkeye";
    } else if (tCrka === 'ú') {
        return "jkeyu";
    } else if (tCrka === 'í') {
        return "jkeyi";
    } else if (tCrka === 'ó') {
        return "jkeyo";
    } else if (tCrka === 'á') {
        return "jkeya";
    } else if (tCrka === '#' || tCrka === '~') {
        return "jkey#";
    } else {
        return "jkey" + tCrka;
    }
}

/**
 * Is the typed letter part of the current alphabet.
 * @param {string} str The current letter.
 * @returns {(number|Array)}.
 */
function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
}



