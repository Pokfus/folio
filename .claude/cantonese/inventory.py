#!/usr/bin/env python3
"""The hand-written inventory of each level's topics -- Folio's own list.

Cantonese has no published graded word list (see `cantonese_level.py`), so a level's CORE is written
here, a topic at a time, for the scope its CEFR descriptor sets; `select.py` resolves every word
against the dictionaries (a word found in neither is reported and dropped unless `hand.py` carries
it) and tops the level up with the commonest remaining words of spoken Cantonese.

SPOKEN HONG KONG CANTONESE, IN TRADITIONAL CHARACTERS.  The words are the ones people SAY -- 佢 not
他, 喺 not 在, 嘢 not 東西, 睇 not 看, 嚟 not 來 -- because written Chinese in Hong Kong is close to
Mandarin and a learner of Cantonese is learning to speak.  Where the spoken word has two common
spellings the dictionaries' headword is used (畀, 㗎, 喇).

A word may carry its Jyutping after a colon (`行:haang4`) where the characters have several readings
and the level wants one; syllables are joined by `_` (`銀行:ngan4_hong4`).  Without one, the
reading HKCanCor's speakers use most leads the card.

THE CLASSIFIERS ARE A TOPIC OF THEIR OWN at A1: a Cantonese noun cannot be counted or pointed at
without one (兩隻狗 "two CL dog", 呢本書 "this CL book"), and a classifier alone does the work of
"the" (隻狗 "the dog").
"""

A1 = [
    ('greetings and politeness',
     '你好 早晨 唔該 多謝 對唔住 唔緊要 拜拜 早唞 再見 請 歡迎 恭喜 冇問題 好耐冇見 唔使'),
    ('particles',
     '呀 啊 喇:laa3 啦 㗎 嘅:ge3 咩 嗎 呢:ne1 吖 囉 喎 啫 咋:zaa3 嘛 添'),
    ('pronouns',
     '我 你 佢 我哋 你哋 佢哋 自己 大家 人哋'),
    ('questions',
     '乜嘢 咩嘢 邊個 邊度 邊 幾時 點解 點樣 點 幾多 幾 未 定係'),
    ('yes, no and the verbs of being',
     '係 唔係 唔 冇 有 喺 唔好 好:hou2 都 仲 就 先 又 再 已經 一齊 淨係 真係 好似 可能 一定'),
    ('aspect and modals',
     '咗 緊 過:gwo3 晒 想 要 可以 會 識 應該 鍾意 得'),
    ('demonstratives and classifiers',
     '呢:ni1 嗰 呢度 嗰度 呢個 嗰個 呢啲 嗰啲 啲 個 隻 本 架 張 件 杯 碗 條 間 對 次 樣 枝 包 粒 位'),
    ('numbers',
     '零:ling4 一 二 三 四 五 六 七 八 九 十 百 千 萬 兩 第一 半 廿 卅'),
    ('money',
     '錢 蚊 毫 銀紙 貴 平 找錢 買 賣 用'),
    ('time',
     '時間 鐘 點鐘 分鐘 鐘頭 今日 聽日 尋日 而家 頭先 等陣 以前 之後 朝早 晏晝 下晝 夜晚 今晚 日頭 '
     '星期 禮拜 星期日 年 月 日 今年 舊年 出年 每日 成日 有時'),
    ('people and family',
     '人 男人 女人 細路 朋友 爸爸 媽媽 老豆 哥哥 家姐 細佬 妹妹 仔 女 老公 老婆 爺爺 嫲嫲 '
     '屋企人 同學 老師 學生 醫生 先生 小姐 太太'),
    ('introducing yourself',
     '名 叫 姓 歲 住 香港 中國 英國 美國 廣東話 普通話 英文 中文 國家 工作 返工 放工 讀書'),
    ('everyday verbs',
     '去 嚟:lai4 返 行 走 跑 坐 企 瞓覺 起身 做 睇 聽 講 話 知 知道 明白 記得 唔記得 覺得 諗 食 飲 '
     '畀 攞 搵 等 幫 叫 開 閂 洗 著 除 玩 傾偈 打電話 學 教 寫 讀 問 答 搭 揸 落 上 落車 '
     '上車 入 出 帶 鍾意 愛 驚 笑 喊 歇 開始 完 識'),
    ('food and drink',
     '嘢食 嘢飲 飯 麵 粥 茶 水 咖啡 奶茶 啤酒 酒 汽水 肉 雞 豬肉 牛肉 魚 蝦 蛋 菜 生果 蘋果 橙 '
     '香蕉 麵包 點心 早餐 午餐 晚飯 食飯 飲茶 好食 甜 鹹 辣 酸 苦 埋單 餐牌 筷子 匙羹 刀 叉'),
    ('places and the town',
     '屋企 學校 公司 醫院 銀行 餐廳 茶樓 舖頭 超級市場 街市 酒店 機場 車站 地鐵站 廁所 公園 '
     '戲院 街 路 地方 樓 大廈 香港島 九龍'),
    ('getting about',
     '車 巴士 小巴 地鐵 的士 電車 火車 飛機 船 單車 搭車 左 右 前面 後面 上面 下面 入面 '
     '出面 隔離 對面 中間 附近 遠 近 東 南 西 北'),
    ('the home',
     '屋 房 廳 廚房 門 窗 枱 櫈 床 電話 手機 電視 電腦 燈 冷氣 鎖匙 衫 褲 鞋 襪 帽 袋'),
    ('describing',
     '大 細 多 少 好 壞 新 舊 高 矮 長 短 肥 瘦 快 慢 熱 凍 暖 涼 靚 醜 乾淨 污糟 平 貴 容易 難 '
     '啱 錯 忙 得閒 開心 唔開心 攰 肚餓 頸渴 舒服 早 遲 一樣 唔同 好多 少少 太 幾 非常 最'),
    ('the body and feeling ill',
     '頭 手 腳 眼 耳仔 鼻 口 牙 肚 身體 病 痛 頭痛 肚痛 發燒 咳 感冒 藥 睇醫生'),
    ('the weather and colours',
     '天氣 落雨 太陽 風 雨 雲 天 熱 凍 顏色 紅色 黃色 藍色 綠色 白色 黑色 啡色'),
    ('connecting words',
     '同 和 但係 不過 所以 因為 如果 或者 然後 跟住 之前 為咗 由 到 向 喺度 比 連 啱啱'),
]

A2 = [
    ('relatives and the people around you',
     '公公 婆婆 叔叔 姑媽 舅父 阿姨 表哥 表姐 堂兄弟 兄弟 姊妹 孫 仔女 囡囡 BB 親戚 鄰居 男朋友 女朋友 '
     '老闆 同事 客人 經理 職員 司機 警察 侍應 廚師 護士 律師 工程師 秘書 記者 售貨員 '),
    ('work and study',
     '工 份工 返學 放學 上堂 落堂 功課 考試 測驗 成績 大學 中學 小學 幼稚園 課室 黑板 書包 '
     '科目 數學 歷史 地理 科學 音樂 體育 畢業 請假 加班 人工 薪水 辦公室 會議 開會 搵工 '
     '面試 經驗 退休 生意 做嘢 '),
    ('clothes and shopping',
     '衫褲 裙 外套 恤衫 T恤 牛仔褲 短褲 西裝 領呔 頸巾 手套 眼鏡 手錶 銀包 手袋 雨遮 '
     '大碼 細碼 試身室 減價 折頭 收據 信用卡 八達通 現金 散紙 商場 試 換 退 合身 '),
    ('food, cooking and eating out',
     '煮飯 煮 炒 蒸 煎 炸 焗 切 洗碗 雪櫃 煲 鑊 碟:dip6 杯 樽 罐 鹽 糖 豉油 油 醋 胡椒 '
     '叉燒 燒鵝 燒賣 蝦餃 腸粉 雲吞麵 魚蛋 菠蘿包 蛋撻 檸檬茶 豆漿 外賣 落單 叫嘢食 自助餐 '
     '飽 餓 味道 新鮮 熟 生 凍飲 熱飲 走冰 少甜 例湯 湯 '),
    ('the home and its chores',
     '梳化 衣櫃 書枱 椅:ji2 地氈 窗簾 枕頭 被 毛巾 牙刷 牙膏 番梘 洗頭水 浴室 沖涼 洗衫 晾衫 '
     '執屋 打掃 掃把 垃圾 倒垃圾 搬屋 租 業主 鄰舍 露台 電梯 樓梯 門鐘 插蘇 '),
    ('the town and its buildings',
     '郵局 圖書館 博物館 教堂 廟 警署 消防局 診所 藥房 便利店 麵包舖 書局 髮型屋 '
     '戲院 球場 泳池 停車場 十字路口 紅綠燈 天橋 隧道 碼頭 海傍 市中心 屋邨 '),
    ('travel and directions',
     '旅行 出國 護照 簽證 機票 行李 酒店房 訂 入住 退房 導遊 地圖 方向 一直行 轉左 轉右 '
     '過馬路 迷路 塞車 轉車 月台 車費 站 落 上落 渡海小輪 纜車 港鐵 '),
    ('the countryside, nature and animals',
     '山 海 河 湖 海灘 島 樹 花 草 石頭 沙 天空 星 月光 郊外 行山 '
     '狗 貓 雀 牛 豬 羊 馬 老鼠 蛇 魚缸 雞蛋 昆蟲 蚊 曱甴 動物 寵物 動物園 '),
    ('the seasons and the weather',
     '春天 夏天 秋天 冬天 季節 氣溫 度 打風 颱風 行雷 閃電 落雪 霧 濕 乾 天文台 雨褸 '),
    ('health and the body',
     '頭髮 面 嘴 喉嚨 頸 背脊 心 胃 手指 腳趾 皮膚 血 骨 '
     '受傷 跌親 流血 傷風 喉嚨痛 牙痛 嘔 敏感 打針 食藥 掛號 休息 健康 '),
    ('feelings and character',
     '開心 傷心 嬲 驚 擔心 緊張 興奮 失望 悶 好笑 寂寞 放心 '
     '好人 衰人 叻 蠢 乖 曳:jai5 懶 勤力 有禮貌 好脾氣 細心 大方 孤寒 害羞 '),
    ('free time, sport and festivals',
     '興趣 睇戲 唱K 打機 影相 畫畫 跳舞 唱歌 彈琴 游水 踢波 打波 籃球 足球 跑步 健身 '
     '比賽 贏 輸 假期 放假 新年 農曆新年 利是 中秋節 月餅 端午節 聖誕節 生日 派對 禮物 '),
    ('more classifiers',
     '份 部 套 雙 啖 餐 啲啲 間 座 棵 隻 盒 樽 支 架 '),
    ('telling what happened, and when',
     '上個月 下個月 上個禮拜 下個禮拜 前日 後日 琴日 尋晚 聽朝 之後 後來 最後 首先 '
     '嗰陣 嗰陣時 突然 終於 已經 一路 一陣 好耐 正話 頭先 未試過 試過 '),
    ('comparing and giving an opinion',
     '覺得 認為 鍾意 唔鍾意 同意 反對 比較 更加 最好 差唔多 一樣 唔同 差過 '
     '應該 一定 可能 或者 其實 當然 梗係 真係 好似 好睇 難睇 好聽 有趣 無聊 重要 方便 麻煩 '),
    ('the everyday verbs of moving, dressing and doing',
     '行街 散步 跳 爬 推 拉 抬 拎 揸車 泊車 送 接 等候 遲到 準時 '
     '著衫 除衫 換衫 戴 化妝 梳頭 剪頭髮 洗面 刷牙 起床 醒 '
     '借 交 收 寄 打開 熄 整 修理 壞咗 跌 揀 決定 準備 計劃 '
     '幫手 介紹 邀請 約 見面 嗌交 道歉 原諒 相信 希望 夢 '),
]

B1 = [
    ('work and careers',
     '職業 事業 公司 部門 上司 下屬 員工 老細 合約 全職 兼職 實習 升職 辭職 炒魷魚 失業 搵食 '
     '請人 申請 履歷 經驗 能力 責任 壓力 效率 目標 計劃書 報告 客戶 項目 簽 傾生意 出糧 花紅 '
     '加人工 放大假 返夜班 輪班 工廠 寫字樓 行業 專業 技術 電郵 打字 影印 '),
    ('money, banking and the economy',
     '銀行戶口 存錢 攞錢 櫃員機 提款卡 利息 貸款 按揭 借錢 還錢 欠 交租 交稅 稅 保險 投資 '
     '股票 樓價 物價 通脹 經濟 市場 價錢 收入 支出 慳錢 使錢 洗錢 有錢人 窮 貧窮 富有 '
     '賬單 收費 免費 分期 找數 '),
    ('education',
     '教育 學位 學費 獎學金 課程 講師 教授 校長 同學會 補習 溫書 默書 測驗 考試 合格 肥佬 '
     '分數 第一名 研究 論文 圖書證 宿舍 留學 語言 文法 生字 讀音 發音 意思 翻譯 '),
    ('the news, media and technology',
     '新聞 報紙 雜誌 電台 電視台 節目 廣告 記者 消息 報道 網上 上網 網站 網絡 Wi-Fi '
     '電腦 手提電腦 軟件 程式 密碼 下載 上載 電郵 短訊 打電話 視像 相機 社交媒體 '
     '睇新聞 頻道 直播 '),
    ('government, law and society',
     '政府 政策 法律 法例 法庭 法官 犯法 違法 罰款 坐監 監獄 警察局 報警 小偷 賊 偷嘢 '
     '搶劫 罪 犯人 證據 選舉 投票 議員 市民 公民 權利 自由 民主 社會 社區 人口 '
     '移民 外傭 新移民 示威 抗議 規矩 安全 危險 '),
    ('the environment',
     '環境 污染 空氣 環保 回收 垃圾桶 膠袋 能源 電力 浪費 節省 天然 自然 氣候 '
     '全球暖化 樹林 郊野公園 海洋 動物 植物 保護 '),
    ('health and medicine',
     '醫療 病人 急症室 救護車 手術 檢查 診症 中醫 西醫 藥丸 藥水 副作用 過敏 '
     '傳染 細菌 病毒 疫苗 口罩 戒煙 食煙 飲酒 運動 減肥 營養 睡眠 失眠 壓力 '
     '血壓 心臟 肺 肝 腎 骨折 扭親 包紮 康復 '),
    ('travel, transport and accommodation',
     '旅遊 旅客 行程 景點 名勝 觀光 自由行 旅行團 訂房 酒店 民宿 青年旅舍 '
     '海關 入境 出境 過關 兌換 匯率 航班 延誤 取消 登機 機場快線 巴士站 的士站 '
     '單程 來回 八達通 增值 '),
    ('the household',
     '家務 傢俬 裝修 搬屋 水費 電費 煤氣 冷氣機 洗衣機 微波爐 吸塵機 熨衫 '
     '抹枱 拖地 煮餸 買餸 餸 雪 漏水 壞 維修 管理處 '),
    ('relationships and the stages of life',
     '戀愛 拍拖 結婚 離婚 分手 婚禮 新郎 新娘 老婆仔 家庭 父母 子女 細蚊仔 青少年 '
     '後生 中年 老人家 長者 出世 成長 退休 過身 葬禮 關係 感情 朋友仔 識朋友 '),
    ('feelings and character',
     '感覺 心情 情緒 開朗 樂觀 悲觀 自信 驕傲 妒忌 羨慕 後悔 內疚 慚愧 尷尬 '
     '感動 感激 同情 耐性 脾氣 性格 誠實 老實 好心 衰格 小器 斯文 粗魯 '),
    ('Hong Kong customs and beliefs',
     '習俗 傳統 文化 節日 拜神 上香 廟宇 佛教 道教 天主教 基督教 信仰 風水 '
     '利是 舞獅 盆菜 掃墓 清明節 重陽節 年廿八 團年飯 拜年 恭喜發財 '),
    ('ideas, reasons and plans',
     '原因 結果 目的 方法 辦法 問題 情況 機會 經歷 意見 建議 決定 選擇 條件 標準 '
     '好處 壞處 優點 缺點 重點 例子 事實 道理 可能性 影響 作用 分別 關係 '),
    ('the words that join sentences',
     '不過 雖然 即使 只要 只係 除非 否則 於是 因此 所以 總之 例如 譬如 甚至 '
     '而且 此外 首先 其次 最後 同時 一方面 另一方面 根據 關於 至於 '),
    ('thinking, deciding, arguing and changing',
     '諗法 考慮 估計 懷疑 相信 明白 理解 記住 忘記 發覺 知道 認識 '
     '討論 爭論 解釋 說明 證明 反對 支持 贊成 同意 拒絕 接受 答應 承認 否認 '
     '比較 選 改變 變成 增加 減少 發展 進步 影響 提高 降低 解決 處理 '
     '安排 組織 參加 參與 負責 完成 成功 失敗 堅持 放棄 '),
]

INVENTORY = {'a1': A1, 'a2': A2, 'b1': B1}
