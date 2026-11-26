// Global word search, English academic dictionary & reliable bidirectional translator (TR ⇄ EN)
// ===== GLOBAL SEARCH & DICTIONARY STATE =====
let _gsTimer = null;
let _gsApiCache = JSON.parse(localStorage.getItem('ydt_gs_api_cache') || '{}');
let _gsActiveReq = 0;
let _dictMode = 'en'; // 'en' (İngilizce Sözlük) | 'general' (Çeviri Aracı TR ⇄ EN)
let _transDir = 'auto'; // 'auto' | 'en-tr' | 'tr-en'
let _dictSuggestTimer = null;
let _dictActiveReq = 0;
let _lastDictData = null;
let _transDirCache = JSON.parse(localStorage.getItem('ydt_trans_dir_cache') || '{}');
let _reverseMetaMap = null;

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const GS_PAGE = 30;
const DICT_CACHE_LIMIT = 150;

const POS_TR_MAP = {
  noun: 'İsim',
  verb: 'Fiil',
  adjective: 'Sıfat',
  adverb: 'Zarf',
  preposition: 'Edat',
  conjunction: 'Bağlaç',
  pronoun: 'Zamir',
  interjection: 'Ünlem',
  determiner: 'Belirteç',
  exclamation: 'Ünlem',
  abbreviation: 'Kısaltma',
  phrase: 'İfade',
  idiom: 'Deyim',
  'phrasal verb': 'Deyimsel Fiil',
  'auxiliary verb': 'Yardımcı Fiil',
  'modal verb': 'Kip Fiili',
  article: 'Tanımlık',
  numeral: 'Sayı',
  prefix: 'Ön Ek',
  suffix: 'Son Ek'
};

// Curated high-frequency English idioms & fixed expressions with Turkish translations and examples
const COMMON_IDIOMS = [
  { phrase: 'abandon ship', tr: 'gemiyi terk etmek; zor durumdan kaçmak', ex: 'Half the team wanted to abandon ship when the project stalled.' },
  { phrase: 'a blessing in disguise', tr: 'görünüşte kötü ama aslında hayırlı durum', ex: 'Losing that job turned out to be a blessing in disguise.' },
  { phrase: 'a drop in the ocean', tr: 'devede kulak, denizde damla', ex: 'That donation is just a drop in the ocean compared to what is needed.' },
  { phrase: 'a piece of cake', tr: 'çocuk oyuncağı, çok kolay', ex: 'With enough practice, the test will be a piece of cake.' },
  { phrase: 'actions speak louder than words', tr: 'ayinesi iştir kişinin lafa bakılmaz', ex: 'Don’t just promise to help — actions speak louder than words.' },
  { phrase: 'add fuel to the fire', tr: 'yangına körükle gitmek', ex: 'His rude remarks only added fuel to the fire.' },
  { phrase: 'against all odds', tr: 'her şeye rağmen, tüm zorluklara karşın', ex: 'She succeeded against all odds.' },
  { phrase: 'all ears', tr: 'can kulağıyla dinlemek', ex: 'Tell me your plan — I am all ears.' },
  { phrase: 'at the end of the day', tr: 'günün sonunda, işin özünde', ex: 'At the end of the day, effort matters most.' },
  { phrase: 'back to square one', tr: 'başa dönmek, sıfırdan başlamak', ex: 'The design failed, so we are back to square one.' },
  { phrase: 'barking up the wrong tree', tr: 'yanlış kapıyı çalmak, yanlış kişiden şüphelenmek', ex: 'If you blame me for the mistake, you are barking up the wrong tree.' },
  { phrase: 'beat around the bush', tr: 'lafı dolandırmak, sadede gelmemek', ex: 'Stop beating around the bush and tell me the truth.' },
  { phrase: 'better late than never', tr: 'geç olsun güç olmasın', ex: 'You finally finished the report — better late than never.' },
  { phrase: 'between a rock and a hard place', tr: 'iki arada bir derede kalmak, çıkmazda olmak', ex: 'I was caught between a rock and a hard place.' },
  { phrase: 'bite off more than you can chew', tr: 'boyundan büyük işe kalkışmak', ex: 'Taking five extra courses might be biting off more than you can chew.' },
  { phrase: 'bite the bullet', tr: 'dişini sıkmak, zorluğa katlanmak', ex: 'I decided to bite the bullet and face the exam.' },
  { phrase: 'blow off steam', tr: 'stres atmak, deşarj olmak', ex: 'She goes running to blow off steam after work.' },
  { phrase: 'break a leg', tr: 'bol şans (özellikle sahne öncesi)', ex: 'You will do great in the play — break a leg!' },
  { phrase: 'break even', tr: 'ne kâr ne zarar etmek, başa baş çıkmak', ex: 'The café needs two years just to break even.' },
  { phrase: 'break the ice', tr: 'buzları eritmek, ortamı yumuşatmak', ex: 'He told a joke to break the ice at the meeting.' },
  { phrase: 'break the news', tr: 'kötü/önemli haberi vermek', ex: 'Who is going to break the news to the team?' },
  { phrase: 'bring to light', tr: 'gün yüzüne çıkarmak, aydınlatmak', ex: 'New evidence brought the truth to light.' },
  { phrase: 'burn the midnight oil', tr: 'gece geç saatlere kadar çalışmak', ex: 'She burned the midnight oil before the final exam.' },
  { phrase: 'burn bridges', tr: 'gemileri yakmak, geri dönüşü imkansız kılmak', ex: 'Be polite when leaving a job so you don’t burn bridges.' },
  { phrase: 'by all means', tr: 'elbette, kesinlikle, hiç çekinmeden', ex: 'If you need help, by all means ask.' },
  { phrase: 'by and large', tr: 'genel olarak, büyük ölçüde', ex: 'By and large, the students enjoyed the seminar.' },
  { phrase: 'call it a day', tr: 'paydos etmek, günü bitirmek', ex: 'We have done enough work today — let’s call it a day.' },
  { phrase: 'catch someone red-handed', tr: 'suçüstü yakalamak', ex: 'The guard caught the thief red-handed.' },
  { phrase: 'change of heart', tr: 'fikir değişikliği, kararından dönme', ex: 'He had a change of heart and joined us.' },
  { phrase: 'come to terms with', tr: 'kabullenmek, razı olmak', ex: 'It took months to come to terms with the loss.' },
  { phrase: 'cost an arm and a leg', tr: 'ateş pahası olmak, çok pahalıya mal olmak', ex: 'Repairing that car will cost an arm and a leg.' },
  { phrase: 'cross that bridge when you come to it', tr: 'dereyi görmeden paçaları sıvamamak, zamanı gelince düşünmek', ex: 'Don’t worry yet; we’ll cross that bridge when we come to it.' },
  { phrase: 'cut corners', tr: 'işten çalmak, kaliteden ödün vererek kestirme yapmak', ex: 'Never cut corners on safety procedures.' },
  { phrase: 'cut someone some slack', tr: 'birine biraz tolerans göstermek', ex: 'Cut him some slack; it is his first day.' },
  { phrase: 'do someone a favour', tr: 'birine iyilik yapmak', ex: 'Could you do me a favour and hold this?' },
  { phrase: 'draw the line', tr: 'sınır koymak, bir yerde dur demek', ex: 'I’m patient, but I draw the line at dishonesty.' },
  { phrase: 'easier said than done', tr: 'söylemesi kolay yapması zor', ex: 'Staying calm under pressure is easier said than done.' },
  { phrase: 'eat one’s words', tr: 'söylediğini yutmak, yanıldığını kabul etmek', ex: 'When we won, our critics had to eat their words.' },
  { phrase: 'face the music', tr: 'yaptıklarının sonucuna katlanmak', ex: 'He had to go home and face the music.' },
  { phrase: 'fall short of', tr: 'beklentiyi karşılayamamak, yetersiz kalmak', ex: 'The results fell short of our expectations.' },
  { phrase: 'far cry from', tr: 'uzaktan yakından ilgisi olmamak, çok farklı olmak', ex: 'This quiet town is a far cry from Istanbul.' },
  { phrase: 'feel under the weather', tr: 'keyifsiz / hafif hasta hissetmek', ex: 'I’m feeling a bit under the weather today.' },
  { phrase: 'find common ground', tr: 'ortak nokta bulmak', ex: 'Both sides tried to find common ground.' },
  { phrase: 'follow in someone’s footsteps', tr: 'birinin izinden gitmek', ex: 'She followed in her mother’s footsteps and became a doctor.' },
  { phrase: 'food for thought', tr: 'üzerinde düşünülecek konu', ex: 'The lecture gave us plenty of food for thought.' },
  { phrase: 'for good', tr: 'temelli, sonsuza dek', ex: 'They moved to İzmir for good.' },
  { phrase: 'from scratch', tr: 'sıfırdan, en baştan', ex: 'We built the entire website from scratch.' },
  { phrase: 'gain the upper hand', tr: 'üstünlük sağlamak', ex: 'Our team gradually gained the upper hand.' },
  { phrase: 'get cold feet', tr: 'son anda korkup vazgeçmek, gözü kesmemek', ex: 'He got cold feet right before his speech.' },
  { phrase: 'get out of hand', tr: 'kontrolden çıkmak', ex: 'The situation quickly got out of hand.' },
  { phrase: 'get the hang of', tr: 'elini alıştırmak, işin püf noktasını kapmak', ex: 'Once you get the hang of it, driving is easy.' },
  { phrase: 'give someone the cold shoulder', tr: 'soğuk davranmak, yüz vermemek', ex: 'Why are you giving me the cold shoulder?' },
  { phrase: 'give the benefit of the doubt', tr: 'iyi niyetle yaklaşmak, aksini kanıtlayana kadar güvenmek', ex: 'Let’s give her the benefit of the doubt.' },
  { phrase: 'go the extra mile', tr: 'beklenenden fazlasını yapmak, ekstra çaba göstermek', ex: 'She always goes the extra mile for her students.' },
  { phrase: 'go with the flow', tr: 'akışına bırakmak', ex: 'Don’t overplan the trip — just go with the flow.' },
  { phrase: 'hand in hand', tr: 'el ele, birbirine bağlı olarak', ex: 'Practice and confidence go hand in hand.' },
  { phrase: 'hang in there', tr: 'dayanmak, pes etmemek', ex: 'Hang in there — exams will be over soon.' },
  { phrase: 'have a lot on one’s plate', tr: 'başı çok kalabalık olmak, çok işi bulunmak', ex: 'I can’t take on another task; I already have a lot on my plate.' },
  { phrase: 'have second thoughts', tr: 'sonradan şüpheye düşmek, yeniden düşünmek', ex: 'She is having second thoughts about moving abroad.' },
  { phrase: 'hit the books', tr: 'sıkı ders çalışmaya koyulmak', ex: 'I have to hit the books tonight.' },
  { phrase: 'hit the nail on the head', tr: 'tam isabet ettirmek, taşı gediğine koymak', ex: 'You hit the nail on the head with that diagnosis.' },
  { phrase: 'hit the road', tr: 'yola koyulmak', ex: 'We should hit the road early to avoid traffic.' },
  { phrase: 'hold your horses', tr: 'acele etmemek, biraz beklemek', ex: 'Hold your horses — let’s check the facts first.' },
  { phrase: 'in a nutshell', tr: 'özetle, kısacası', ex: 'In a nutshell, we need more time.' },
  { phrase: 'in the long run', tr: 'uzun vadede', ex: 'Studying daily pays off in the long run.' },
  { phrase: 'in the same boat', tr: 'aynı gemide, aynı durumda olmak', ex: 'Don’t worry, we are all in the same boat.' },
  { phrase: 'it goes without saying', tr: 'söylemeye gerek bile yok', ex: 'It goes without saying that health comes first.' },
  { phrase: 'jump to conclusions', tr: 'acele hükme varmak', ex: 'Don’t jump to conclusions before hearing both sides.' },
  { phrase: 'keep an eye on', tr: 'göz kulak olmak, takip etmek', ex: 'Could you keep an eye on my bag?' },
  { phrase: 'keep in mind', tr: 'akılda tutmak, unutmamak', ex: 'Keep in mind that the deadline is Friday.' },
  { phrase: 'keep one’s fingers crossed', tr: 'şans dilemek, iyi sonuç ummak', ex: 'Keep your fingers crossed for my interview!' },
  { phrase: 'kill two birds with one stone', tr: 'bir taşla iki kuş vurmak', ex: 'Cycling to work kills two birds with one stone.' },
  { phrase: 'learn by heart', tr: 'ezberlemek', ex: 'We had to learn the poem by heart.' },
  { phrase: 'leave no stone unturned', tr: 'bakmadık yer bırakmamak, her yolu denemek', ex: 'The researchers left no stone unturned.' },
  { phrase: 'let the cat out of the bag', tr: 'baklayı ağzından çıkarmak, sırrı açık etmek', ex: 'He accidentally let the cat out of the bag about the party.' },
  { phrase: 'lose heart', tr: 'cesaretini kaybetmek, umutsuzluğa kapılmak', ex: 'Don’t lose heart if you make mistakes.' },
  { phrase: 'make a long story short', tr: 'uzun lafın kısası', ex: 'To make a long story short, we missed the train.' },
  { phrase: 'make ends meet', tr: 'iki yakasını bir araya getirmek, geçinmek', ex: 'Rising prices make it hard to make ends meet.' },
  { phrase: 'make up one’s mind', tr: 'karar vermek', ex: 'Have you made up your mind yet?' },
  { phrase: 'miss the boat', tr: 'fırsatı kaçırmak, treni kaçırmak', ex: 'If you don’t apply today, you will miss the boat.' },
  { phrase: 'no pain, no gain', tr: 'zahmetsiz rahmet olmaz', ex: 'Training is tough, but no pain, no gain.' },
  { phrase: 'not my cup of tea', tr: 'ilgi alanıma girmiyor, bana göre değil', ex: 'Horror movies are really not my cup of tea.' },
  { phrase: 'off the record', tr: 'resmi olmayan şekilde, gizli kalmak şartıyla', ex: 'She shared the details off the record.' },
  { phrase: 'on cloud nine', tr: 'havalara uçmak, çok mutlu olmak', ex: 'He was on cloud nine after hearing the news.' },
  { phrase: 'on the contrary', tr: 'aksine, tam tersine', ex: 'I’m not tired; on the contrary, I feel energetic.' },
  { phrase: 'on the fence', tr: 'kararsız kalmak, arada kalmak', ex: 'I’m still on the fence about buying a new laptop.' },
  { phrase: 'on the same page', tr: 'aynı fikirde / aynı anlayışta olmak', ex: 'Let’s review the plan so everyone is on the same page.' },
  { phrase: 'once in a blue moon', tr: 'kırk yılda bir, çok nadiren', ex: 'We only see each other once in a blue moon.' },
  { phrase: 'out of the blue', tr: 'birdenbire, hiç beklenmedik anda', ex: 'An old friend called me out of the blue.' },
  { phrase: 'out of the question', tr: 'söz konusu bile değil, imkansız', ex: 'Leaving early is out of the question.' },
  { phrase: 'over the moon', tr: 'sevinçten havalara uçmak', ex: 'They were over the moon about the scholarship.' },
  { phrase: 'pay attention to', tr: 'dikkat etmek, özen göstermek', ex: 'Pay attention to the grammar rules.' },
  { phrase: 'pull someone’s leg', tr: 'birine takılmak, şaka yapmak', ex: 'Are you serious, or are you pulling my leg?' },
  { phrase: 'put all your eggs in one basket', tr: 'tüm şansını tek bir şeye bağlamak', ex: 'Apply to several universities; don’t put all your eggs in one basket.' },
  { phrase: 'put one’s foot down', tr: 'ağırlığını koymak, kesin tavır almak', ex: 'The manager finally put his foot down.' },
  { phrase: 'put on a brave face', tr: 'cesur görünmeye çalışmak, metanetli davranmak', ex: 'Despite her worry, she put on a brave face.' },
  { phrase: 'rain cats and dogs', tr: 'bardaktan boşanırcasına yağmur yağmak', ex: 'Take an umbrella; it’s raining cats and dogs.' },
  { phrase: 'read between the lines', tr: 'satır aralarını okumak, ima edileni anlamak', ex: 'You have to read between the lines of her email.' },
  { phrase: 'ring a bell', tr: 'tanıdık gelmek, çağrışım yapmak', ex: 'That name rings a bell, but I can’t place it.' },
  { phrase: 'rule of thumb', tr: 'genel kural, pratik kural', ex: 'As a rule of thumb, save 20% of your income.' },
  { phrase: 'save for a rainy day', tr: 'kara gün için biriktirmek', ex: 'It is wise to save money for a rainy day.' },
  { phrase: 'see eye to eye', tr: 'aynı fikirde olmak, anlaşmak', ex: 'We don’t always see eye to eye on politics.' },
  { phrase: 'sink or swim', tr: 'ya batmak ya çıkmak', ex: 'In a new startup, it is sink or swim.' },
  { phrase: 'sit on the fence', tr: 'tarafsız veya kararsız kalmak', ex: 'You can’t sit on the fence forever.' },
  { phrase: 'speak of the devil', tr: 'iyi insan lafının üstüne gelirmiş', ex: 'Speak of the devil — here comes Ali now!' },
  { phrase: 'spill the beans', tr: 'sırrı ağzından kaçırmak, itiraf etmek', ex: 'Come on, spill the beans about the surprise!' },
  { phrase: 'stand the test of time', tr: 'zamanın sınavından geçmek, kalıcılığını korumak', ex: 'Classic literature stands the test of time.' },
  { phrase: 'start from scratch', tr: 'en baştan başlamak', ex: 'The file wasn’t saved, so I had to start from scratch.' },
  { phrase: 'take a break', tr: 'mola vermek, ara vermek', ex: 'Let’s take a short break and grab some tea.' },
  { phrase: 'take for granted', tr: 'çantada keklik saymak, değerini bilmemek', ex: 'People often take clean water for granted.' },
  { phrase: 'take into account', tr: 'hesaba katmak, göz önünde bulundurmak', ex: 'Take all factors into account before deciding.' },
  { phrase: 'take it with a grain of salt', tr: 'şüpheyle yaklaşmak, hemen inanmamak', ex: 'Take rumors with a grain of salt.' },
  { phrase: 'take the bull by the horns', tr: 'sorunun üzerine cesurca gitmek', ex: 'She took the bull by the horns and solved the dispute.' },
  { phrase: 'the ball is in your court', tr: 'top artık sende, karar sırası sende', ex: 'I’ve made my offer; now the ball is in your court.' },
  { phrase: 'the best of both worlds', tr: 'iki dünyanın da en iyi yanı, çifte avantaj', ex: 'Working remotely gives you the best of both worlds.' },
  { phrase: 'the last straw', tr: 'bardağı taşıran son damla', ex: 'Being late again was the last straw.' },
  { phrase: 'the tip of the iceberg', tr: 'buzdağının görünen kısmı', ex: 'Those complaints are just the tip of the iceberg.' },
  { phrase: 'through thick and thin', tr: 'iyi günde kötü günde', ex: 'True friends stay together through thick and thin.' },
  { phrase: 'throw in the towel', tr: 'havlu atmak, pes etmek', ex: 'Even when things looked bleak, he refused to throw in the towel.' },
  { phrase: 'time flies', tr: 'zaman su gibi akıp geçiyor', ex: 'Time flies when you are learning something exciting.' },
  { phrase: 'to make matters worse', tr: 'işleri daha da kötüleştirmek için, üstüne üstlük', ex: 'To make matters worse, it started snowing.' },
  { phrase: 'turn a blind eye', tr: 'görmezden gelmek, göz yummak', ex: 'Management turned a blind eye to the warning signs.' },
  { phrase: 'under the weather', tr: 'keyifsiz, hafif rahatsız', ex: 'I stayed home because I felt under the weather.' },
  { phrase: 'up in the air', tr: 'havada kalmak, belirsiz olmak', ex: 'Our travel plans are still up in the air.' },
  { phrase: 'weather the storm', tr: 'fırtınayı atlatmak, zor dönemden sağ çıkmak', ex: 'The small business managed to weather the storm.' },
  { phrase: 'word of mouth', tr: 'kulaktan kulağa, ağızdan ağza', ex: 'The book became famous through word of mouth.' },
  { phrase: 'wrap one’s head around', tr: 'akıl erdirmek, kavramak', ex: 'I still can’t wrap my head around how fast it happened.' },
  { phrase: 'all in all', tr: 'her şey hesaba katıldığında, genel olarak', ex: 'All in all, the conference was very productive.' },
  { phrase: 'as a matter of fact', tr: 'aslında, işin doğrusu', ex: 'As a matter of fact, I lived there for three years.' },
  { phrase: 'at first glance', tr: 'ilk bakışta', ex: 'At first glance, the problem looks simple.' },
  { phrase: 'at the eleventh hour', tr: 'son dakikada, tam bitmek üzereyken', ex: 'They reached an agreement at the eleventh hour.' },
  { phrase: 'bear in mind', tr: 'akılda tutmak, hesaba katmak', ex: 'Bear in mind that traffic is heavy at five.' },
  { phrase: 'behind closed doors', tr: 'kapalı kapılar ardında, gizlice', ex: 'The committee made the decision behind closed doors.' },
  { phrase: 'beyond a shadow of a doubt', tr: 'hiç şüphe götürmeksizin, kesinlikle', ex: 'She proved her theory beyond a shadow of a doubt.' },
  { phrase: 'break the habit', tr: 'alışkanlığı bırakmak', ex: 'It takes patience to break an old habit.' },
  { phrase: 'break the record', tr: 'rekor kırmak', ex: 'She trained hard to break the national record.' },
  { phrase: 'bring to the table', tr: 'masaya katkı sunmak, fayda getirmek', ex: 'Each member brings unique skills to the table.' },
  { phrase: 'by mistake', tr: 'yanlışlıkla, kazara', ex: 'I deleted the file by mistake.' },
  { phrase: 'call the shots', tr: 'söz sahibi olmak, kararları yönetmek', ex: 'As the lead editor, she calls the shots.' },
  { phrase: 'catch one’s eye', tr: 'gözüne çarpmak, dikkatini çekmek', ex: 'A bright poster on the wall caught my eye.' },
  { phrase: 'clear the air', tr: 'ortamı yumuşatmak, yanlış anlamayı gidermek', ex: 'We had an honest talk to clear the air.' },
  { phrase: 'come true', tr: 'gerçekleşmek (hayal veya dilek)', ex: 'With steady work, your goals will come true.' },
  { phrase: 'cry over spilled milk', tr: 'olup bitene boşuna üzülmek', ex: 'The glass is broken; there is no use crying over spilled milk.' },
  { phrase: 'day in, day out', tr: 'her gün durmaksızın, günden güne', ex: 'He practiced the violin day in, day out.' },
  { phrase: 'down to earth', tr: 'ayakları yere basan, mütevazı', ex: 'Despite her fame, she remains very down to earth.' },
  { phrase: 'every cloud has a silver lining', tr: 'her şerde bir hayır vardır', ex: 'The delay helped us spot a flaw — every cloud has a silver lining.' },
  { phrase: 'face to face', tr: 'yüz yüze', ex: 'I prefer to discuss important matters face to face.' },
  { phrase: 'first and foremost', tr: 'her şeyden önce, en başta', ex: 'First and foremost, we must protect student safety.' },
  { phrase: 'for the time being', tr: 'şimdilik, geçici olarak', ex: 'We will stay in this office for the time being.' },
  { phrase: 'get the green light', tr: 'onay almak, yeşil ışık yakılmak', ex: 'The research project finally got the green light.' },
  { phrase: 'give a hand', tr: 'el atmak, yardım etmek', ex: 'Can you give me a hand with these boxes?' },
  { phrase: 'have a word with', tr: 'biriyle kısa bir konuşma yapmak', ex: 'Could I have a quick word with you after class?' },
  { phrase: 'heart and soul', tr: 'cangönülden, bütün kalbiyle', ex: 'She put her heart and soul into writing the novel.' },
  { phrase: 'high time', tr: 'tam zamanı, çoktan vakti geldi', ex: 'It is high time we upgraded our study schedule.' },
  { phrase: 'hold one’s tongue', tr: 'dilini tutmak, susmak', ex: 'I wanted to argue, but I held my tongue.' },
  { phrase: 'in hot water', tr: 'başı dertte, zor durumda', ex: 'He landed in hot water for missing the deadline.' },
  { phrase: 'in the blink of an eye', tr: 'göz açıp kapayıncaya kadar', ex: 'The summer break passed in the blink of an eye.' },
  { phrase: 'in the dark', tr: 'habersiz, bilgisiz', ex: 'Employees were kept in the dark about the merger.' },
  { phrase: 'in the nick of time', tr: 'tam zamanında, kıl payı yetişerek', ex: 'The ambulance arrived in the nick of time.' },
  { phrase: 'in vain', tr: 'boşuna, nafile', ex: 'All their efforts were not in vain.' },
  { phrase: 'keep one’s word', tr: 'sözünü tutmak', ex: 'You can trust him because he always keeps his word.' },
  { phrase: 'lend a hand', tr: 'yardım eli uzatmak', ex: 'Neighbors came over to lend a hand after the storm.' },
  { phrase: 'lion’s share', tr: 'aslan payı, en büyük pay', ex: 'Education takes the lion’s share of our budget.' },
  { phrase: 'live from hand to mouth', tr: 'kıt kanaat geçinmek', ex: 'Many seasonal workers live from hand to mouth.' },
  { phrase: 'lose one’s temper', tr: 'öfkelenmek, sinirlerine hakim olamamak', ex: 'Even under stress, try not to lose your temper.' },
  { phrase: 'make sense', tr: 'mantıklı gelmek, anlam ifade etmek', ex: 'Once she explained the steps, the formula made sense.' },
  { phrase: 'money talks', tr: 'parası olanın sözü geçer', ex: 'In commercial real estate, money talks.' },
  { phrase: 'now and then', tr: 'ara sıra, zaman zaman', ex: 'We still meet for coffee now and then.' },
  { phrase: 'off the top of one’s head', tr: 'doğaçlama, aklına ilk geldiği kadarıyla', ex: 'Off the top of my head, I know at least five synonyms.' },
  { phrase: 'on purpose', tr: 'kasten, bilerek', ex: 'He didn’t break the cup on purpose.' },
  { phrase: 'on the tip of one’s tongue', tr: 'dilinin ucunda olmak', ex: 'His name is right on the tip of my tongue!' },
  { phrase: 'once and for all', tr: 'kesin olarak, bir daha açılmamak üzere', ex: 'Let’s settle this question once and for all.' },
  { phrase: 'out of order', tr: 'bozuk, çalışmıyor', ex: 'The elevator is temporarily out of order.' },
  { phrase: 'out of sight, out of mind', tr: 'gözden ırak olan gönülden de ırak olur', ex: 'I keep my phone in another room: out of sight, out of mind.' },
  { phrase: 'play it by ear', tr: 'duruma göre hareket etmek, doğaçlama gitmek', ex: 'We have no fixed plan, so we’ll play it by ear.' },
  { phrase: 'put on the table', tr: 'masaya yatırmak, açıkça sunmak', ex: 'Both teams put their proposals on the table.' },
  { phrase: 'race against time', tr: 'zamana karşı yarışmak', ex: 'Doctors faced a race against time after the quake.' },
  { phrase: 'safe and sound', tr: 'sağ salim, kazasız belasız', ex: 'They arrived home safe and sound.' },
  { phrase: 'second to none', tr: 'rakipsiz, eşsiz, en iyisi', ex: 'Her dedication to research is second to none.' },
  { phrase: 'set foot in', tr: 'ayak basmak', ex: 'I felt excited the first time I set foot in Istanbul.' },
  { phrase: 'short and sweet', tr: 'kısa ve öz', ex: 'Keep your introduction short and sweet.' },
  { phrase: 'speak one’s mind', tr: 'düşüncesini açıkça söylemek', ex: 'He isn’t afraid to speak his mind in meetings.' },
  { phrase: 'stand one’s ground', tr: 'geri adım atmamak, direnmek', ex: 'She stood her ground despite heavy criticism.' },
  { phrase: 'step by step', tr: 'adım adım, kademeli olarak', ex: 'Follow the instructions step by step.' },
  { phrase: 'take heart', tr: 'cesaret bulmak, umutlanmak', ex: 'Take heart from the progress you have already made.' },
  { phrase: 'take sides', tr: 'taraf tutmak', ex: 'As the mediator, I cannot take sides.' },
  { phrase: 'test the waters', tr: 'nabız yoklamak, durumu denemek', ex: 'They launched a small pilot to test the waters.' },
  { phrase: 'the bottom line', tr: 'işin özü, son söz', ex: 'The bottom line is that consistent practice wins.' },
  { phrase: 'time and again', tr: 'tekrar tekrar, defalarca', ex: 'We have warned them time and again.' },
  { phrase: 'to say the least', tr: 'en hafif tabirle', ex: 'The weather was unpredictable, to say the least.' },
  { phrase: 'turn over a new leaf', tr: 'yeni bir sayfa açmak, hayata temiz başlamak', ex: 'This year he decided to turn over a new leaf.' },
  { phrase: 'under the table', tr: 'el altından, kayıt dışı / gizlice', ex: 'Paying workers under the table is illegal.' },
  { phrase: 'up to date', tr: 'güncel, son bilgilere uygun', ex: 'Keep your vocabulary list up to date.' },
  { phrase: 'when pigs fly', tr: 'asla, imkansız (çıkmaz ayın son çarşambası)', ex: 'He will wake up at five when pigs fly.' },
  { phrase: 'without a doubt', tr: 'şüphesiz, kesinlikle', ex: 'This is without a doubt our strongest essay.' },
  { phrase: 'word for word', tr: 'kelimesi kelimesine, birebir', ex: 'She translated the quote word for word.' }
];

const _FOREIGN_NOISE_TERMS = new Set([
  'etc', 'viz', 'cf', 'et al', 'de facto', 'per se', 'inter alia', 'ibid',
  'sic', 'ad hoc', 'bona fide', 'circa', 'ergo', 'ex officio', 'in vitro',
  'in vivo', 'ipso facto', 'pro bono', 'pro rata', 'quasi', 'status quo',
  'verbatim', 'vice versa', 'eg', 'ie'
]);

function _isCleanEnglishTerm(str) {
  const clean = String(str || '').trim();
  if (!clean || clean.length < 2 || clean.length > 48) return false;
  if (!/^[a-zA-Z]+(?:['’-]?[a-zA-Z]+)*(?:\s+[a-zA-Z]+(?:['’-]?[a-zA-Z]+)*)*$/.test(clean)) return false;
  const norm = clean.toLowerCase().replace(/[.’']/g, '').replace(/\s+/g, ' ');
  return !_FOREIGN_NOISE_TERMS.has(norm);
}

function _posLabelTr(pos) {
  const key = (pos || '').toLowerCase().trim();
  return POS_TR_MAP[key] || (pos ? pos.charAt(0).toUpperCase() + pos.slice(1) : 'Genel');
}

function _looksTurkish(text) {
  return /[çğıöşüÇĞİÖŞÜ]/.test(text || '');
}

function _escapeRegExp(str) {
  return String(str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function _escJsArg(s) {
  return esc(
    String(s || '')
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\r/g, '')
      .replace(/\n/g, '\\n')
  );
}

function _inlineCopyIcon(size = 15) {
  return `<svg class="ui-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 4000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function _saveDictCacheBounded() {
  const keys = Object.keys(dictCache);
  if (keys.length > DICT_CACHE_LIMIT) {
    const removeCount = keys.length - DICT_CACHE_LIMIT;
    for (let i = 0; i < removeCount; i++) {
      delete dictCache[keys[i]];
    }
  }
  _saveDictCache();
}

function _saveTransDirCacheBounded() {
  const keys = Object.keys(_transDirCache);
  if (keys.length > DICT_CACHE_LIMIT) {
    const removeCount = keys.length - DICT_CACHE_LIMIT;
    for (let i = 0; i < removeCount; i++) {
      delete _transDirCache[keys[i]];
    }
  }
  try {
    localStorage.setItem('ydt_trans_dir_cache', JSON.stringify(_transDirCache));
  } catch (e) { }
}

// ===== LOCAL METADATA & DATASET MATCHERS =====
function _getReverseMeta(enWord) {
  const w = (enWord || '').toLowerCase().trim();
  if (!w || typeof RAW_META === 'undefined') {
    return { synonyms: [], antonyms: [], family: [] };
  }
  if (!_reverseMetaMap) {
    _reverseMetaMap = new Map();
    const ensure = key => {
      if (!_reverseMetaMap.has(key)) {
        _reverseMetaMap.set(key, { s: new Set(), a: new Set(), f: new Set() });
      }
      return _reverseMetaMap.get(key);
    };
    Object.entries(RAW_META).forEach(([head, entry]) => {
      const h = head.toLowerCase().trim();
      const syns = (entry.s || []).map(x => String(x).toLowerCase().trim()).filter(Boolean);
      const ants = (entry.a || []).map(x => String(x).toLowerCase().trim()).filter(Boolean);
      const fams = (entry.f || []).map(x => String(x).toLowerCase().trim()).filter(Boolean);

      syns.forEach(s => {
        const bucket = ensure(s);
        bucket.s.add(h);
        syns.forEach(other => { if (other !== s) bucket.s.add(other); });
        ants.forEach(a => bucket.a.add(a));
      });
      ants.forEach(a => {
        const bucket = ensure(a);
        bucket.a.add(h);
        syns.forEach(s => bucket.a.add(s));
        ants.forEach(other => { if (other !== a) bucket.s.add(other); });
      });
      fams.forEach(f => {
        const bucket = ensure(f);
        bucket.f.add(h);
        fams.forEach(other => { if (other !== f) bucket.f.add(other); });
      });
    });
  }
  const hit = _reverseMetaMap.get(w);
  if (!hit) return { synonyms: [], antonyms: [], family: [] };
  return {
    synonyms: [...hit.s],
    antonyms: [...hit.a],
    family: [...hit.f]
  };
}

function _findLocalEnMatches(query) {
  const q = (query || '').toLowerCase().trim();
  if (!q) return [];
  const matches = [];
  if (typeof UNITS !== 'undefined') {
    Object.keys(UNITS).forEach(u => {
      (UNITS[u].words || []).forEach(w => {
        if ((w[0] || '').toLowerCase() === q) {
          matches.push({ word: w[0], tr: w[1], ex: w[2] || '', unit: Number(u), source: 'ydt' });
        }
      });
    });
  }
  if (typeof customVocab !== 'undefined') {
    customVocab.forEach(entry => {
      if ((entry.word || '').toLowerCase() === q) {
        matches.push({ word: entry.word, tr: (entry.meanings || []).join(', '), ex: entry.example || '', unit: 'custom', source: 'custom' });
      }
    });
  }
  if (typeof PHRASAL_VERBS !== 'undefined') {
    Object.keys(PHRASAL_VERBS).forEach(u => {
      (PHRASAL_VERBS[u] || []).forEach(pv => {
        if ((pv.pv || '').toLowerCase() === q) {
          matches.push({ word: pv.pv, tr: (pv.tr || '').replace(/\n/g, ' '), ex: pv.ex || '', unit: Number(u), source: 'phrasal' });
        }
      });
    });
  }
  return matches;
}

function _findLocalTrMatches(query) {
  const q = (query || '').toLowerCase().trim();
  if (!q) return [];
  const tokenRe = new RegExp(`(^|[,;/\\s(])${_escapeRegExp(q)}($|[,;/\\s)])`, 'i');
  const exactMatches = [];
  const partialMatches = [];

  const checkMeaning = (word, trRaw, ex, unit, source) => {
    const tr = (trRaw || '').replace(/\n/g, ', ').trim();
    if (!tr) return;
    const parts = tr.split(/[,;/]+/).map(p => p.replace(/\d+\./g, '').trim().toLowerCase()).filter(Boolean);
    if (parts.includes(q)) {
      exactMatches.push({ word, tr, ex, unit, source, exact: true });
    } else if (tokenRe.test(tr) || (q.length >= 4 && tr.toLowerCase().includes(q))) {
      partialMatches.push({ word, tr, ex, unit, source, exact: false });
    }
  };

  if (typeof UNITS !== 'undefined') {
    Object.keys(UNITS).forEach(u => {
      (UNITS[u].words || []).forEach(w => checkMeaning(w[0], w[1], w[2] || '', Number(u), 'ydt'));
    });
  }
  if (typeof customVocab !== 'undefined') {
    customVocab.forEach(entry => checkMeaning(entry.word, (entry.meanings || []).join(', '), entry.example || '', 'custom', 'custom'));
  }
  if (typeof PHRASAL_VERBS !== 'undefined') {
    Object.keys(PHRASAL_VERBS).forEach(u => {
      (PHRASAL_VERBS[u] || []).forEach(pv => checkMeaning(pv.pv, pv.tr, pv.ex || '', Number(u), 'phrasal'));
    });
  }

  return [...exactMatches, ...partialMatches].slice(0, 14);
}

function _findLocalIdiomsAndPhrasals(enTerms, trQuery, gtxBilingualGroups = [], sourceLang = 'en') {
  const results = [];
  const seen = new Set();

  const cleanTerms = (enTerms || [])
    .map(t => (t || '').toLowerCase().trim())
    .filter(t => t && t.length >= 2 && !t.includes(' ') && _isCleanEnglishTerm(t));
  const trLow = (trQuery || '').toLowerCase().trim();
  const trWordRe = trLow.length >= 2
    ? new RegExp(`(?:^|[,;/\\s.(])${_escapeRegExp(trLow)}(?:$|[,;/\\s.)])`, 'i')
    : null;

  const enRegexes = cleanTerms.slice(0, 3).map(term => {
    const suffix = term.length >= 3 ? '(?:s|es|ed|ing)?' : '';
    return new RegExp(`\\b${_escapeRegExp(term)}${suffix}\\b`, 'i');
  });

  const addItem = item => {
    const key = (item.phrase || '').toLowerCase().trim();
    if (!key || seen.has(key)) return;
    seen.add(key);
    results.push(item);
  };

  // Match Phrasal Verbs
  if (typeof PHRASAL_VERBS !== 'undefined') {
    Object.keys(PHRASAL_VERBS).forEach(u => {
      (PHRASAL_VERBS[u] || []).forEach(pv => {
        const pvPhrase = pv.pv || '';
        const pvTr = (pv.tr || '').replace(/\n/g, ' · ');
        const hitEn = enRegexes.some(re => re.test(pvPhrase));
        const hitTr = Boolean(trWordRe && trWordRe.test(pvTr));
        if (hitEn || hitTr) {
          addItem({
            phrase: pvPhrase,
            turkish: pvTr,
            definitionEn: '',
            definitionTr: '',
            example: pv.ex || '',
            type: 'Phrasal Verb'
          });
        }
      });
    });
  }

  // Match Curated Idioms
  COMMON_IDIOMS.forEach(item => {
    const hitEn = enRegexes.some(re => re.test(item.phrase));
    const hitTr = Boolean(trWordRe && trWordRe.test(item.tr));
    if (hitEn || hitTr) {
      addItem({
        phrase: item.phrase,
        turkish: item.tr,
        definitionEn: '',
        definitionTr: '',
        example: item.ex || '',
        type: 'Deyim'
      });
    }
  });

  // Extract verified phrase / idiom / phrasal verb entries from GTX bilingualGroups
  const phrasePosSet = new Set(['phrase', 'idiom', 'phrasal verb']);
  (gtxBilingualGroups || []).forEach(g => {
    const posLow = (g.partOfSpeech || '').toLowerCase().trim();
    const isPhraseGroup = phrasePosSet.has(posLow);
    (g.items || []).forEach(it => {
      if (sourceLang === 'tr') {
        const enPhrase = (it.term || '').trim();
        if (!enPhrase.includes(' ') || !_isCleanEnglishTerm(enPhrase)) return;
        if (!isPhraseGroup && !enRegexes.some(re => re.test(enPhrase))) return;
        addItem({
          phrase: enPhrase,
          turkish: (it.reverse || []).slice(0, 3).join(', ') || trQuery || '',
          definitionEn: '',
          definitionTr: '',
          example: '',
          type: posLow === 'phrasal verb' ? 'Phrasal Verb' : 'Kalıp İfade'
        });
      } else {
        const revEn = (it.reverse || []).find(r => r.includes(' ') && _isCleanEnglishTerm(r) && enRegexes.some(re => re.test(r)));
        if (isPhraseGroup && revEn) {
          addItem({
            phrase: revEn,
            turkish: it.term || '',
            definitionEn: '',
            definitionTr: '',
            example: '',
            type: posLow === 'phrasal verb' ? 'Phrasal Verb' : 'Kalıp İfade'
          });
        }
      }
    });
  });

  return results;
}

// ===== FAST BIDIRECTIONAL GOOGLE GTX + DATAMUSE + DICTIONARYAPI ENGINE =====
async function fetchGtxFull(query, sl = 'en', tl = 'tr') {
  const safeSl = (sl === 'en' || sl === 'tr') ? sl : 'en';
  const safeTl = (tl === 'en' || tl === 'tr') ? tl : (safeSl === 'en' ? 'tr' : 'en');
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${safeSl}&tl=${safeTl}&dt=t&dt=bd&dt=md&dt=ss&dt=ex&dt=rm&q=${encodeURIComponent(query)}`;
  try {
    const res = await fetchWithTimeout(url, {}, 2200);
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data)) return null;

    let translation = '';
    let phonetic = '';
    if (Array.isArray(data[0])) {
      data[0].forEach(seg => {
        if (Array.isArray(seg) && typeof seg[0] === 'string' && seg[0]) {
          translation += seg[0];
        } else if (Array.isArray(seg) && !seg[0] && typeof seg[3] === 'string' && seg[3]) {
          phonetic = seg[3];
        }
      });
    }
    translation = translation.trim();

    // Parse bilingual dictionary POS groups (data[1])
    const bilingualGroups = [];
    if (Array.isArray(data[1])) {
      data[1].forEach(group => {
        if (!Array.isArray(group) || !group[0]) return;
        const pos = String(group[0]);
        const items = [];
        if (Array.isArray(group[2])) {
          group[2].forEach(entry => {
            if (!Array.isArray(entry) || !entry[0]) return;
            items.push({
              term: String(entry[0]),
              reverse: Array.isArray(entry[1]) ? entry[1].slice(0, 6).map(String) : [],
              score: typeof entry[3] === 'number' ? entry[3] : 0
            });
          });
        } else if (Array.isArray(group[1])) {
          group[1].forEach(term => {
            items.push({ term: String(term), reverse: [], score: 0 });
          });
        }
        items.sort((a, b) => (b.score || 0) - (a.score || 0));
        if (items.length > 0) {
          bilingualGroups.push({
            partOfSpeech: pos,
            posTr: _posLabelTr(pos),
            items: items.slice(0, 10)
          });
        }
      });
    }

    // Parse monolingual definitions (data[12])
    const definitions = [];
    if (Array.isArray(data[12])) {
      data[12].forEach(group => {
        if (!Array.isArray(group) || !Array.isArray(group[1])) return;
        const pos = String(group[0] || '');
        const defs = group[1].slice(0, 3).map(d => ({
          text: Array.isArray(d) && d[0] ? String(d[0]) : '',
          example: Array.isArray(d) && d[2] ? String(d[2]) : ''
        })).filter(d => d.text);
        if (defs.length > 0) {
          definitions.push({ partOfSpeech: pos, defs });
        }
      });
    }

    // Parse synonyms (data[11])
    const synonyms = [];
    if (Array.isArray(data[11])) {
      data[11].forEach(group => {
        if (!Array.isArray(group) || !Array.isArray(group[1])) return;
        group[1].forEach(cluster => {
          if (Array.isArray(cluster) && Array.isArray(cluster[0])) {
            cluster[0].forEach(s => {
              const str = String(s).trim();
              if (str && !synonyms.includes(str)) synonyms.push(str);
            });
          }
        });
      });
    }

    // Parse examples (data[13])
    const examples = [];
    if (Array.isArray(data[13]) && Array.isArray(data[13][0])) {
      data[13][0].slice(0, 4).forEach(item => {
        if (Array.isArray(item) && item[0]) {
          const clean = String(item[0]).replace(/<\/?b>/gi, '');
          if (clean && !examples.includes(clean)) examples.push(clean);
        }
      });
    }

    return {
      translation,
      phonetic,
      detectedLang: safeSl,
      bilingualGroups,
      definitions,
      synonyms: synonyms.slice(0, 16),
      examples
    };
  } catch (e) {
    return null;
  }
}

function _gtxMaxScore(gtxObj) {
  let max = 0;
  (gtxObj?.bilingualGroups || []).forEach(g => {
    (g.items || []).forEach(it => {
      if ((it.score || 0) > max) max = it.score;
    });
  });
  return max;
}

function _resolveSourceLang({
  w,
  isSentence,
  hasTurkishChars,
  localEnMatches,
  localTrMatches,
  dictEntry,
  gtxEnToTr,
  gtxTrToEn
}) {
  if (hasTurkishChars) return 'tr';

  const enTr = (gtxEnToTr?.translation || '').toLowerCase().trim();
  const trEn = (gtxTrToEn?.translation || '').toLowerCase().trim();
  const enChanged = Boolean(enTr && enTr !== w);
  const trChanged = Boolean(trEn && trEn !== w);

  if (isSentence) {
    if (trChanged && !enChanged) return 'tr';
    if (enChanged && !trChanged) return 'en';
    const trHint = /\b(bir|ve|ile|ama|fakat|gibi|kadar|daha|cok|degil|icin|ben|sen|biz|siz|onlar|nasil|neden|ne|var|yok|mi|mu|da|de|olarak|olan|ancak|cok|guzel|evet|hayir)\b/i.test(w);
    const enHint = /\b(the|is|are|was|were|have|has|had|will|would|could|should|to|of|and|that|this|with|from|for|you|we|they)\b/i.test(w);
    if (trHint && !enHint) return 'tr';
    if (enHint && !trHint) return 'en';
    return 'en';
  }

  // Pure one-sided translation signal (handles 100% of pure TR ASCII words like masa, el, para, oda, karar, cesur, dil, var, ben)
  if (trChanged && !enChanged) return 'tr';
  if (enChanged && !trChanged) return 'en';

  const enBdCount = gtxEnToTr?.bilingualGroups?.length || 0;
  const trBdCount = gtxTrToEn?.bilingualGroups?.length || 0;
  if (trBdCount > 0 && enBdCount === 0 && trChanged) return 'tr';
  if (enBdCount > 0 && trBdCount === 0 && enChanged) return 'en';

  const enMax = _gtxMaxScore(gtxEnToTr) || (enChanged ? 0.02 : 0);
  const trMax = _gtxMaxScore(gtxTrToEn) || (trChanged ? 0.02 : 0);
  const enScore =
    enMax * 4 +
    (localEnMatches.length > 0 ? 1.5 : 0) +
    (enBdCount >= 2 ? 0.3 : 0) +
    (dictEntry ? 0.25 : 0);
  const trScore =
    trMax * 4 +
    (localTrMatches.some(m => m.exact) ? 1.5 : 0) +
    (trBdCount >= 2 ? 0.2 : 0);

  return trScore > enScore ? 'tr' : 'en';
}

async function fetchMyMemoryData(text, sl = 'en', tl = 'tr') {
  const out = { primary: '', alternatives: [] };
  const cleanSrc = (text || '').trim();
  if (!cleanSrc) return out;

  try {
    const res = await fetchWithTimeout(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanSrc)}&langpair=${encodeURIComponent(sl)}|${encodeURIComponent(tl)}`,
      {},
      2400
    );
    if (!res.ok) return out;
    const data = await res.json();
    const seen = new Set([cleanSrc.toLowerCase()]);

    const isValid = str => {
      if (!str) return false;
      const up = str.toUpperCase();
      if (up.includes('MYMEMORY WARNING') || up.includes('INVALID LANGUAGE') || up.includes('PLEASE SELECT')) return false;
      return !seen.has(str.toLowerCase());
    };

    const mainTr = data?.responseData?.translatedText?.trim() || '';
    if (isValid(mainTr)) {
      out.primary = mainTr;
      seen.add(mainTr.toLowerCase());
      out.alternatives.push(mainTr);
    }

    if (Array.isArray(data?.matches)) {
      const sorted = [...data.matches]
        .filter(m => m && m.translation && Number(m.quality || 0) >= 35 && Number(m.match || 0) >= 0.45)
        .sort((a, b) => (Number(b.match || 0) * 100 + Number(b.quality || 0)) - (Number(a.match || 0) * 100 + Number(a.quality || 0)));

      sorted.forEach(m => {
        const tr = String(m.translation).trim();
        if (isValid(tr) && out.alternatives.length < 4) {
          seen.add(tr.toLowerCase());
          out.alternatives.push(tr);
        }
      });
    }
  } catch (e) { }
  return out;
}

async function fetchMyMemoryTranslation(text, sl = 'en', tl = 'tr') {
  const data = await fetchMyMemoryData(text, sl, tl);
  return data.primary || '';
}

async function _gtxTranslateBatchOnce(texts, safeSl, safeTl) {
  try {
    const res = await fetchWithTimeout(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${safeSl}&tl=${safeTl}&dt=t&q=${encodeURIComponent(texts.join('\n'))}`,
      {},
      2200
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data?.[0])) return null;
    const full = data[0].map(seg => (Array.isArray(seg) && seg[0] ? seg[0] : '')).join('');
    return full.split('\n').map(p => p.trim());
  } catch (e) {
    return null;
  }
}

async function batchTranslateLines(lines, sl = 'en', tl = 'tr') {
  const safeSl = (sl === 'en' || sl === 'tr') ? sl : 'en';
  const safeTl = (tl === 'en' || tl === 'tr') ? tl : (safeSl === 'en' ? 'tr' : 'en');
  const clean = (lines || []).map(l => (l || '').replace(/\s+/g, ' ').trim());
  const uniqueTexts = [];
  const indexMap = new Map();

  clean.forEach(txt => {
    if (!txt) return;
    if (!indexMap.has(txt)) {
      indexMap.set(txt, uniqueTexts.length);
      uniqueTexts.push(txt);
    }
  });

  if (uniqueTexts.length === 0) return clean.map(() => '');

  // Keep chunks compact (<= 6 lines / <= 700 chars) and run in parallel
  const chunks = [];
  let curChunk = [];
  let curLen = 0;
  uniqueTexts.forEach((txt, idx) => {
    if (curChunk.length >= 6 || (curLen + txt.length > 700 && curChunk.length > 0)) {
      chunks.push(curChunk);
      curChunk = [];
      curLen = 0;
    }
    curChunk.push({ txt, idx });
    curLen += txt.length + 2;
  });
  if (curChunk.length > 0) chunks.push(curChunk);

  const translatedUnique = new Array(uniqueTexts.length).fill('');
  await Promise.all(chunks.map(async chunk => {
    const parts = await _gtxTranslateBatchOnce(chunk.map(c => c.txt), safeSl, safeTl);
    if (parts && parts.length === chunk.length) {
      chunk.forEach((c, i) => {
        translatedUnique[c.idx] = parts[i] || '';
      });
    } else {
      // Alignment mismatch guard: translate lines individually in parallel
      await Promise.all(chunk.map(async c => {
        const single = await _gtxTranslateBatchOnce([c.txt], safeSl, safeTl);
        translatedUnique[c.idx] = single?.[0] || '';
      }));
    }
  }));

  return clean.map(txt => {
    if (!txt) return '';
    const uIdx = indexMap.get(txt);
    return translatedUnique[uIdx] || '';
  });
}

async function fetchTurkishMeaning(word) {
  const clean = (word || '').trim();
  if (!clean) return '';
  const cacheKey = `ydt_tr_${clean.toLowerCase()}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return cached;

  const gtx = await fetchGtxFull(clean, 'en', 'tr');
  if (gtx?.translation && gtx.translation.toLowerCase() !== clean.toLowerCase()) {
    localStorage.setItem(cacheKey, gtx.translation);
    return gtx.translation;
  }

  const mm = await fetchMyMemoryTranslation(clean, 'en', 'tr');
  if (mm) {
    localStorage.setItem(cacheKey, mm);
    return mm;
  }

  return '';
}

async function _fetchDictApiRaw(w) {
  try {
    const res = await fetchWithTimeout(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(w)}`, {}, 2200);
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || !data[0]) return null;
    const allPhonetics = data.flatMap(e => e.phonetics || []);
    const phoneticText = data.map(e => e.phonetic).find(Boolean) || allPhonetics.find(p => p.text)?.text || '';
    return {
      word: data[0].word || w,
      phonetic: phoneticText,
      phonetics: allPhonetics,
      meanings: data.slice(0, 3).flatMap(e => e.meanings || [])
    };
  } catch (e) {
    return null;
  }
}

async function _fetchDatamuseList(param, w, max = 10) {
  try {
    const res = await fetchWithTimeout(`https://api.datamuse.com/words?${param}=${encodeURIComponent(w)}&max=${max}`, {}, 1800);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data.map(d => d.word).filter(Boolean) : [];
  } catch (e) {
    return [];
  }
}

async function _fetchDatamuseDefs(w) {
  try {
    const res = await fetchWithTimeout(`https://api.datamuse.com/words?sp=${encodeURIComponent(w)}&md=dp&max=3`, {}, 1800);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return [];
    const defs = [];
    data.forEach(item => {
      if (Array.isArray(item.defs)) {
        item.defs.slice(0, 4).forEach(d => {
          const tabIdx = d.indexOf('\t');
          if (tabIdx > -1) {
            defs.push({ pos: d.slice(0, tabIdx), text: d.slice(tabIdx + 1) });
          } else {
            defs.push({ pos: '', text: d });
          }
        });
      }
    });
    return defs.slice(0, 4);
  } catch (e) {
    return [];
  }
}

function _uniqueCleanWords(list, excludeWord, limit = 14, englishOnly = true) {
  const ex = (excludeWord || '').toLowerCase().trim();
  const out = [];
  const seen = new Set();
  for (const item of list || []) {
    const s = String(item || '').trim();
    const low = s.toLowerCase();
    if (!s || low === ex || seen.has(low)) continue;
    if (englishOnly && !_isCleanEnglishTerm(s)) continue;
    seen.add(low);
    out.push(s);
    if (out.length >= limit) break;
  }
  return out;
}

function _gatherSortedBilingualItems(bilingualGroups) {
  const all = [];
  (bilingualGroups || []).forEach(g => {
    (g.items || []).forEach(it => {
      all.push({ ...it, posTr: g.posTr, partOfSpeech: g.partOfSpeech });
    });
  });
  all.sort((a, b) => (b.score || 0) - (a.score || 0));
  return all;
}

function _buildCandidateWordsList({
  sourceLang,
  query,
  bilingualGroups,
  verifiedSyns,
  localMatches,
  primaryTranslation
}) {
  const qLow = (query || '').toLowerCase().trim();
  const candidates = [];
  const seen = new Set([qLow]);

  const addCandidate = (word, pos, meaningTr, nuances, score, lang) => {
    const clean = String(word || '').trim();
    const low = clean.toLowerCase();
    if (!clean || seen.has(low)) return;
    if (lang === 'en' && !_isCleanEnglishTerm(clean)) return;
    seen.add(low);
    candidates.push({
      rank: candidates.length + 1,
      word: clean,
      pos: pos || '',
      meaningTr: meaningTr || '',
      nuances: Array.isArray(nuances) ? nuances.slice(0, 4) : [],
      score: typeof score === 'number' ? score : 0,
      lang: lang || (sourceLang === 'tr' ? 'en' : 'tr')
    });
  };

  const sortedBiItems = _gatherSortedBilingualItems(bilingualGroups);

  if (sourceLang === 'tr') {
    if (primaryTranslation) {
      addCandidate(primaryTranslation, '', query, [], 1, 'en');
    }
    (localMatches || []).forEach(m => {
      if (m.exact) addCandidate(m.word, 'YDT', m.tr, [], 0.9, 'en');
    });
    sortedBiItems.forEach(it => {
      addCandidate(it.term, it.posTr, (it.reverse || []).slice(0, 3).join(', '), it.reverse, it.score || 0.2, 'en');
    });
    if (candidates.length < 4) {
      (localMatches || []).forEach(m => {
        if (!m.exact) addCandidate(m.word, 'YDT', m.tr, [], 0.15, 'en');
      });
    }
    (verifiedSyns || []).forEach(enW => {
      const localEn = _findLocalEnMatches(enW);
      const trHint = localEn[0]?.tr || '';
      addCandidate(enW, 'Eş Anlamlı (EN)', trHint, [], 0.05, 'en');
    });
  } else {
    if (primaryTranslation) {
      addCandidate(primaryTranslation, '', '', [], 1, 'tr');
    }
    (localMatches || []).forEach(m => {
      addCandidate(m.tr, 'YDT', '', [m.word], 0.9, 'tr');
    });
    sortedBiItems.forEach(it => {
      addCandidate(it.term, it.posTr, '', it.reverse, it.score || 0.2, 'tr');
    });
    (verifiedSyns || []).slice(0, 5).forEach(enW => {
      const localEn = _findLocalEnMatches(enW);
      const trHint = localEn[0]?.tr || '';
      addCandidate(enW, 'Eş Anlamlı (EN)', trHint, [], 0.05, 'en');
    });
  }

  return candidates.slice(0, 14).map((c, idx) => ({ ...c, rank: idx + 1 }));
}

function _deriveEnglishLookup(targetWord, bilingualGroups) {
  const clean = (targetWord || '').trim();
  if (!clean) return '';
  const low = clean.toLowerCase();
  if (!low.includes(' ') && _isCleanEnglishTerm(low)) return low;

  // Strip infinitive "to " (e.g., "to abandon" -> "abandon")
  if (low.startsWith('to ')) {
    const rest = low.slice(3).trim();
    if (rest && !rest.includes(' ') && _isCleanEnglishTerm(rest)) return rest;
  }

  // Prefer single-word top bilingual item if available
  const sorted = _gatherSortedBilingualItems(bilingualGroups);
  for (const it of sorted) {
    const term = (it.term || '').toLowerCase().trim();
    if (term && !term.includes(' ') && _isCleanEnglishTerm(term)) {
      return term;
    }
  }
  return '';
}

async function fetchDictData(word, dir = 'auto') {
  const qRaw = (word || '').replace(/\s+/g, ' ').trim();
  const w = qRaw.toLowerCase();
  if (!w) return null;

  const activeDir = (dir === 'en-tr' || dir === 'tr-en') ? dir : 'auto';
  const dirCacheKey = `${activeDir}:${w}`;

  if (activeDir === 'auto' && dictCache[w] && dictCache[w].v === 4 && (dictCache[w].turkish || dictCache[w].targetWord)) {
    updateDictHistory(qRaw);
    return dictCache[w];
  }
  if (activeDir !== 'auto' && _transDirCache[dirCacheKey]?.v === 4) {
    updateDictHistory(qRaw);
    return _transDirCache[dirCacheKey];
  }

  const wordCount = w.split(/\s+/).length;
  const isSentence = wordCount > 3 || /[.!?]/.test(w);
  const hasTurkishChars = _looksTurkish(w);
  const isSingleAscii = !isSentence && !hasTurkishChars && !w.includes(' ') && /^[a-zA-Z-]+$/.test(w);
  const localEnMatches = !isSentence ? _findLocalEnMatches(w) : [];
  const localTrMatches = !isSentence ? _findLocalTrMatches(w) : [];

  let sourceLang = 'en';
  let gtxEnToTr = null;
  let gtxTrToEn = null;
  let dictEntry = null;
  let dmSyns = [];
  let dmAnts = [];
  let usedMyMemory = false;

  if (activeDir === 'en-tr') {
    sourceLang = 'en';
    const [gtxRes, dictRes, synRes, antRes] = await Promise.allSettled([
      fetchGtxFull(qRaw, 'en', 'tr'),
      isSingleAscii ? _fetchDictApiRaw(w) : Promise.resolve(null),
      !isSentence && !hasTurkishChars ? _fetchDatamuseList('rel_syn', w, 10) : Promise.resolve([]),
      !isSentence && !hasTurkishChars ? _fetchDatamuseList('rel_ant', w, 10) : Promise.resolve([])
    ]);
    gtxEnToTr = gtxRes.status === 'fulfilled' ? gtxRes.value : null;
    dictEntry = dictRes.status === 'fulfilled' ? dictRes.value : null;
    dmSyns = synRes.status === 'fulfilled' ? synRes.value : [];
    dmAnts = antRes.status === 'fulfilled' ? antRes.value : [];
  } else if (activeDir === 'tr-en' || (activeDir === 'auto' && hasTurkishChars)) {
    sourceLang = 'tr';
    gtxTrToEn = await fetchGtxFull(qRaw, 'tr', 'en');
  } else {
    // Auto mode for ASCII word/phrase/sentence: run EN->TR, TR->EN and EN word enrichment in 1 parallel round-trip
    const [gtxEnRes, gtxTrRes, dictRes, synRes, antRes] = await Promise.allSettled([
      fetchGtxFull(qRaw, 'en', 'tr'),
      fetchGtxFull(qRaw, 'tr', 'en'),
      isSingleAscii ? _fetchDictApiRaw(w) : Promise.resolve(null),
      !isSentence ? _fetchDatamuseList('rel_syn', w, 10) : Promise.resolve([]),
      !isSentence ? _fetchDatamuseList('rel_ant', w, 10) : Promise.resolve([])
    ]);
    gtxEnToTr = gtxEnRes.status === 'fulfilled' ? gtxEnRes.value : null;
    gtxTrToEn = gtxTrRes.status === 'fulfilled' ? gtxTrRes.value : null;
    dictEntry = dictRes.status === 'fulfilled' ? dictRes.value : null;
    dmSyns = synRes.status === 'fulfilled' ? synRes.value : [];
    dmAnts = antRes.status === 'fulfilled' ? antRes.value : [];

    sourceLang = _resolveSourceLang({
      w,
      isSentence,
      hasTurkishChars,
      localEnMatches,
      localTrMatches,
      dictEntry,
      gtxEnToTr,
      gtxTrToEn
    });

    // Clear English-assumed Round-1 enrichment if source is actually Turkish
    if (sourceLang === 'tr') {
      gtxEnToTr = null;
      dictEntry = null;
      dmSyns = [];
      dmAnts = [];
    }
  }

  let activeGtx = sourceLang === 'tr' ? gtxTrToEn : gtxEnToTr;
  const activeLocal = sourceLang === 'tr' ? localTrMatches : localEnMatches;

  // Emergency MyMemory fallback only if GTX returned nothing and no local match exists
  let mmFallbackPrimary = '';
  if ((!activeGtx || !activeGtx.translation) && activeLocal.length === 0) {
    const mmRes = await fetchMyMemoryData(qRaw, sourceLang, sourceLang === 'tr' ? 'en' : 'tr');
    if (mmRes.primary) {
      mmFallbackPrimary = mmRes.primary;
      usedMyMemory = true;
    }
  }

  const sortedActiveBi = _gatherSortedBilingualItems(activeGtx?.bilingualGroups);
  let primaryTranslation = activeGtx?.translation || '';
  if (!primaryTranslation || primaryTranslation.toLowerCase() === w) {
    primaryTranslation =
      sortedActiveBi.find(it => it.term && it.term.toLowerCase() !== w)?.term ||
      mmFallbackPrimary ||
      (sourceLang === 'tr' ? activeLocal[0]?.word : activeLocal[0]?.tr) ||
      sortedActiveBi[0]?.term ||
      activeGtx?.translation ||
      '';
  }

  // Gather distinct reliable alternative translations from GTX bilingual items + local YDT
  const altSet = new Set([w, primaryTranslation.toLowerCase()]);
  const altTranslations = [];
  const pushAlt = str => {
    const clean = (str || '').trim();
    const low = clean.toLowerCase();
    if (!clean || altSet.has(low)) return;
    if (sourceLang === 'tr' && !_isCleanEnglishTerm(clean)) return;
    altSet.add(low);
    altTranslations.push(clean);
  };

  if (sourceLang === 'tr') {
    activeLocal.filter(m => m.exact).slice(0, 2).forEach(m => pushAlt(m.word));
    sortedActiveBi.slice(0, 6).forEach(it => pushAlt(it.term));
  } else {
    activeLocal.slice(0, 2).forEach(m => pushAlt(m.tr));
    sortedActiveBi.slice(0, 6).forEach(it => pushAlt(it.term));
  }

  const targetWord = sourceLang === 'tr' ? primaryTranslation : '';
  const turkishMain = sourceLang === 'en' ? primaryTranslation : qRaw;
  const englishSubject = sourceLang === 'tr' ? (targetWord || '') : qRaw;
  const enLookup = sourceLang === 'tr'
    ? _deriveEnglishLookup(targetWord, gtxTrToEn?.bilingualGroups)
    : (dictEntry?.word || (!isSentence ? w : ''));

  // Enrich the resolved English word for TR -> EN (single parallel batch)
  if (sourceLang === 'tr' && !isSentence && enLookup && _isCleanEnglishTerm(enLookup) && enLookup.split(/\s+/).length <= 2) {
    const canFetchSingle = !enLookup.includes(' ');
    const [enDictRes, synRes, antRes, gtxEnInfoRes] = await Promise.allSettled([
      canFetchSingle ? _fetchDictApiRaw(enLookup) : Promise.resolve(null),
      _fetchDatamuseList('rel_syn', enLookup, 10),
      _fetchDatamuseList('rel_ant', enLookup, 10),
      fetchGtxFull(enLookup, 'en', 'tr')
    ]);
    if (enDictRes.status === 'fulfilled' && enDictRes.value) dictEntry = enDictRes.value;
    if (synRes.status === 'fulfilled') dmSyns = synRes.value;
    if (antRes.status === 'fulfilled') dmAnts = antRes.value;
    if (gtxEnInfoRes.status === 'fulfilled' && gtxEnInfoRes.value) gtxEnToTr = gtxEnInfoRes.value;
  }

  // Merge local RAW_META + reverse RAW_META (filtered to clean English terms)
  const metaSubject = (dictEntry?.word || enLookup || englishSubject || '').toLowerCase().trim();
  const forwardMeta = (metaSubject && typeof getWordMetaFull === 'function')
    ? getWordMetaFull(metaSubject)
    : { synonyms: [], antonyms: [], family: [] };
  const reverseMeta = _getReverseMeta(metaSubject);
  const localMeta = {
    synonyms: _uniqueCleanWords([...(forwardMeta.synonyms || []), ...(reverseMeta.synonyms || [])], metaSubject, 12),
    antonyms: _uniqueCleanWords([...(forwardMeta.antonyms || []), ...(reverseMeta.antonyms || [])], metaSubject, 10),
    family: _uniqueCleanWords([...(forwardMeta.family || []), ...(reverseMeta.family || [])], metaSubject, 10)
  };

  // Verified clean English synonyms & antonyms across sources
  const verifiedGtxSyns = _uniqueCleanWords(gtxEnToTr?.synonyms || [], metaSubject, 12);
  const verifiedDmSyns = _uniqueCleanWords(dmSyns, metaSubject, 10);
  const verifiedDmAnts = _uniqueCleanWords(dmAnts, metaSubject, 10);

  // Build concise meanings list (max 3 POS groups, 2-3 defs + 1-2 examples) & translate only defs/examples
  const meanings = [];
  const textsToTranslate = [];
  const translationRefs = [];
  const queueTr = (target, field, text) => {
    if (!text) return;
    textsToTranslate.push(text);
    translationRefs.push({ target, field });
  };

  if (dictEntry && Array.isArray(dictEntry.meanings) && dictEntry.meanings.length > 0) {
    // Prioritize POS groups matching GTX's primary grammatical categories (prevents noun/archaic senses overriding adjective/verb)
    const posWeight = new Map();
    const recordPosGroups = (groups, base) => {
      (groups || []).forEach((g, idx) => {
        const key = (g.partOfSpeech || '').toLowerCase().trim();
        if (!key) return;
        const topItemScore = Math.max(0.01, ...(g.items || []).map(it => it.score || 0));
        const val = base + topItemScore + (groups.length - idx) * 0.001;
        if (!posWeight.has(key) || val > posWeight.get(key)) posWeight.set(key, val);
      });
    };
    recordPosGroups(activeGtx?.bilingualGroups, 10);
    if (gtxEnToTr && gtxEnToTr !== activeGtx) recordPosGroups(gtxEnToTr.bilingualGroups, 1);

    const orderedMeanings = [...dictEntry.meanings].sort((a, b) => {
      const wa = posWeight.get((a.partOfSpeech || '').toLowerCase().trim()) || 0;
      const wb = posWeight.get((b.partOfSpeech || '').toLowerCase().trim()) || 0;
      return wb - wa;
    });

    const posSlice = orderedMeanings.slice(0, 3);
    const defCap = posSlice.length === 1 ? 3 : 2;
    const exCap = posSlice.length === 1 ? 2 : 1;

    posSlice.forEach((m, mIdx) => {
      const defObjs = (m.definitions || []).slice(0, defCap);
      const defs = defObjs.map(d => {
        const obj = { text: d.definition || '', turkish: '' };
        if (obj.text) queueTr(obj, 'turkish', obj.text);
        return obj;
      }).filter(d => d.text);

      const exList = [];
      (m.definitions || []).slice(0, 4).forEach(d => {
        if (d.example && exList.length < exCap) {
          const exObj = { original: d.example, turkish: '' };
          exList.push(exObj);
          queueTr(exObj, 'turkish', exObj.original);
        }
      });

      const defSyns = defObjs.flatMap(d => d.synonyms || []);
      const defAnts = defObjs.flatMap(d => d.antonyms || []);

      const syns = _uniqueCleanWords([
        ...(m.synonyms || []),
        ...defSyns,
        ...(mIdx === 0 ? verifiedDmSyns : []),
        ...(mIdx === 0 ? verifiedGtxSyns : []),
        ...(mIdx === 0 ? localMeta.synonyms : [])
      ], metaSubject, 12);

      const ants = _uniqueCleanWords([
        ...(m.antonyms || []),
        ...defAnts,
        ...(mIdx === 0 ? verifiedDmAnts : []),
        ...(mIdx === 0 ? localMeta.antonyms : [])
      ], metaSubject, 10);

      if (defs.length > 0 || syns.length > 0 || ants.length > 0) {
        meanings.push({
          partOfSpeech: m.partOfSpeech || '',
          definitions: defs,
          synonyms: syns,
          antonyms: ants,
          examples: exList
        });
      }
    });
  } else if (gtxEnToTr?.definitions?.length > 0) {
    const posSlice = gtxEnToTr.definitions.slice(0, 3);
    const defCap = posSlice.length === 1 ? 3 : 2;
    const exCap = posSlice.length === 1 ? 2 : 1;

    posSlice.forEach((g, mIdx) => {
      const defs = g.defs.slice(0, defCap).map(d => {
        const obj = { text: d.text, turkish: '' };
        queueTr(obj, 'turkish', obj.text);
        return obj;
      });
      const exList = [];
      g.defs.forEach(d => {
        if (d.example && exList.length < exCap) {
          const exObj = { original: d.example, turkish: '' };
          exList.push(exObj);
          queueTr(exObj, 'turkish', exObj.original);
        }
      });
      meanings.push({
        partOfSpeech: g.partOfSpeech || '',
        definitions: defs,
        synonyms: mIdx === 0 ? _uniqueCleanWords([...verifiedDmSyns, ...verifiedGtxSyns, ...localMeta.synonyms], metaSubject, 12) : [],
        antonyms: mIdx === 0 ? _uniqueCleanWords([...verifiedDmAnts, ...localMeta.antonyms], metaSubject, 10) : [],
        examples: exList
      });
    });
  } else if (!isSentence && enLookup && !enLookup.includes(' ') && _isCleanEnglishTerm(enLookup)) {
    const dmDefs = await _fetchDatamuseDefs(enLookup);
    if (dmDefs.length > 0) {
      const defs = dmDefs.slice(0, 3).map(d => {
        const obj = { text: d.text, turkish: '' };
        queueTr(obj, 'turkish', obj.text);
        return obj;
      });
      meanings.push({
        partOfSpeech: dmDefs[0].pos === 'v' ? 'verb' : dmDefs[0].pos === 'adj' ? 'adjective' : dmDefs[0].pos === 'adv' ? 'adverb' : 'noun',
        definitions: defs,
        synonyms: _uniqueCleanWords([...verifiedDmSyns, ...verifiedGtxSyns, ...localMeta.synonyms], metaSubject, 12),
        antonyms: _uniqueCleanWords([...verifiedDmAnts, ...localMeta.antonyms], metaSubject, 10),
        examples: []
      });
    }
  }

  // Extra examples (max 2)
  const extraExamples = [];
  const hasAnyExample = meanings.some(m => m.examples && m.examples.length > 0);
  if (!hasAnyExample && gtxEnToTr?.examples?.length > 0) {
    gtxEnToTr.examples.slice(0, 2).forEach(exText => {
      const exObj = { original: exText, turkish: '' };
      extraExamples.push(exObj);
      queueTr(exObj, 'turkish', exText);
    });
  }

  // Translate collected definitions & examples in parallel (zero candidateWords or idioms queued!)
  if (textsToTranslate.length > 0) {
    const trList = await batchTranslateLines(textsToTranslate, 'en', 'tr');
    translationRefs.forEach((ref, i) => {
      if (trList[i]) ref.target[ref.field] = trList[i];
    });
  }

  // Bilingual POS groups
  const bilingualGroups = sourceLang === 'tr'
    ? (gtxTrToEn?.bilingualGroups || [])
    : (gtxEnToTr?.bilingualGroups || []);

  // Verified allSynonyms & allAntonyms
  const allSynonyms = _uniqueCleanWords([
    ...meanings.flatMap(m => m.synonyms || []),
    ...verifiedDmSyns,
    ...verifiedGtxSyns,
    ...localMeta.synonyms
  ], metaSubject || w, 14);

  const allAntonyms = _uniqueCleanWords([
    ...meanings.flatMap(m => m.antonyms || []),
    ...verifiedDmAnts,
    ...localMeta.antonyms
  ], metaSubject || w, 12);

  // Idioms, Phrasal Verbs & Collocations (instant curated local + GTX phrase items, 0ms latency)
  const idiomEnTerms = isSentence
    ? (sourceLang === 'en' ? w : primaryTranslation.toLowerCase()).split(/[^a-zA-Z-]+/).filter(t => t.length >= 3).slice(0, 4)
    : _uniqueCleanWords([enLookup, dictEntry?.word, ...altTranslations.filter(a => !a.includes(' '))], '', 4);

  const finalIdioms = _findLocalIdiomsAndPhrasals(
    idiomEnTerms,
    sourceLang === 'tr' ? w : '',
    bilingualGroups,
    sourceLang
  ).slice(0, 12);

  // Ranked candidate words strictly from verified bilingual entries & verified synonyms
  const candidateWords = !isSentence
    ? _buildCandidateWordsList({
      sourceLang,
      query: qRaw,
      bilingualGroups,
      verifiedSyns: allSynonyms,
      localMatches: activeLocal,
      primaryTranslation
    })
    : [];

  const hasContent = Boolean(
    (sourceLang === 'en' && turkishMain && turkishMain.toLowerCase() !== w) ||
    (sourceLang === 'tr' && targetWord && targetWord.toLowerCase() !== w) ||
    meanings.length > 0 ||
    bilingualGroups.length > 0 ||
    altTranslations.length > 0
  );

  if (!hasContent) {
    return (dictCache[w]?.v === 4 ? dictCache[w] : null) ||
      (_transDirCache[dirCacheKey]?.v === 4 ? _transDirCache[dirCacheKey] : null);
  }

  const audioUrl = dictEntry?.phonetics?.find(p => p.audio && p.audio.startsWith('http'))?.audio ||
    dictEntry?.phonetics?.find(p => p.audio)?.audio || '';
  const cleanAudio = audioUrl.startsWith('//') ? 'https:' + audioUrl : audioUrl;

  const sourcesUsed = [];
  if (activeGtx?.translation) sourcesUsed.push('GTX');
  if (usedMyMemory) sourcesUsed.push('MyMemory');
  if (dictEntry) sourcesUsed.push('DictionaryAPI');
  if (activeLocal.length > 0) sourcesUsed.push('YDT');

  const result = {
    v: 4,
    word: sourceLang === 'tr' ? qRaw : (dictEntry?.word || qRaw),
    query: qRaw,
    sourceLang,
    isSentence,
    dir: activeDir,
    targetWord: sourceLang === 'tr' ? (targetWord || dictEntry?.word || '') : '',
    enLookup: enLookup || '',
    phonetic: dictEntry?.phonetic || dictEntry?.phonetics?.find(p => p.text)?.text || activeGtx?.phonetic || '',
    audio: cleanAudio,
    turkish: turkishMain,
    altTranslations: altTranslations.slice(0, 6),
    sourcesUsed,
    localMatches: activeLocal.slice(0, 4),
    bilingualGroups,
    candidateWords,
    meanings,
    extraExamples,
    idioms: finalIdioms,
    family: localMeta.family || [],
    allSynonyms,
    allAntonyms
  };

  if (activeDir === 'auto' && !isSentence) {
    dictCache[w] = result;
    _saveDictCacheBounded();
  }
  if (activeDir !== 'auto') {
    _transDirCache[dirCacheKey] = result;
    _saveTransDirCacheBounded();
  }
  updateDictHistory(qRaw);
  return result;
}

function speakTextWithLang(text, lang = 'en-US') {
  const clean = (text || '').trim();
  if (!clean) return;
  if (!('speechSynthesis' in window)) {
    showToast('Tarayıcı seslendirmeyi desteklemiyor');
    return;
  }
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = lang;
  utterance.rate = 0.92;
  utterance.pitch = 1;
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

function playDictAudio(audioUrl, word, lang = 'en-US') {
  if (audioUrl && String(lang).startsWith('en')) {
    try {
      const audio = new Audio(audioUrl);
      audio.play().catch(() => speakTextWithLang(word, lang));
      return;
    } catch (e) { }
  }
  speakTextWithLang(word, lang);
}

function copyDictText(text) {
  const val = (text || '').trim();
  if (!val) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(val)
      .then(() => showToast('Çeviri kopyalandı!'))
      .catch(() => _fallbackCopyText(val));
  } else {
    _fallbackCopyText(val);
  }
}

function _fallbackCopyText(val) {
  try {
    const ta = document.createElement('textarea');
    ta.value = val;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('Çeviri kopyalandı!');
  } catch (e) {
    showToast('Kopyalanamadı');
  }
}

function copyLastTranslation() {
  if (!_lastDictData) return;
  const isTr = _lastDictData.sourceLang === 'tr';
  const txt = isTr ? (_lastDictData.targetWord || '') : (_lastDictData.turkish || '');
  copyDictText(txt);
}

function speakLastTranslation() {
  if (!_lastDictData) return;
  const isTr = _lastDictData.sourceLang === 'tr';
  if (isTr) {
    playDictAudio(_lastDictData.audio || '', _lastDictData.targetWord || _lastDictData.enLookup || '', 'en-US');
  } else {
    speakTextWithLang(_lastDictData.turkish || '', 'tr-TR');
  }
}

// ===== GLOBAL SEARCH =====
function onGlobalSearch(val) {
  const clearBtn = document.getElementById('global-search-clear');
  if (clearBtn) clearBtn.style.display = val ? 'flex' : 'none';
  clearTimeout(_gsTimer);
  _gsTimer = setTimeout(() => gsDoSearch(val.trim()), 220);
}

function clearGlobalSearch() {
  const inp = document.getElementById('global-search');
  if (inp) { inp.value = ''; }
  const clearBtn = document.getElementById('global-search-clear');
  if (clearBtn) clearBtn.style.display = 'none';
  const normalContent = document.getElementById('home-normal-content');
  const searchContent = document.getElementById('home-search-content');
  if (normalContent) normalContent.style.display = '';
  if (searchContent) searchContent.style.display = 'none';
}

function onLetterClick(letter) {
  const inp = document.getElementById('global-search');
  if (inp) inp.value = letter;
  gsDoSearch(letter);
}

function gsDoSearch(query) {
  const normalContent = document.getElementById('home-normal-content');
  const searchContent = document.getElementById('home-search-content');
  const resultsEl = document.getElementById('search-results');

  if (!resultsEl) return;

  if (!query) {
    if (normalContent) normalContent.style.display = '';
    if (searchContent) searchContent.style.display = 'none';
    return;
  }

  if (normalContent) normalContent.style.display = 'none';
  if (searchContent) searchContent.style.display = 'flex';

  const letterNav = LETTERS.map(l => {
    const isActive = query.toUpperCase() === l;
    return `<button class="letter-nav-btn${isActive ? ' active' : ''}" onclick="onLetterClick('${l}')">${l}</button>`;
  }).join('');

  const headerHtml = `<div class="search-letter-header">
    <div class="search-letter-row">${letterNav}</div>
  </div>`;

  const q = query.toLowerCase();
  const isSingleLetter = query.length === 1;
  const results = [];

  // YDT units
  for (let u = 1; u <= 10; u++) {
    if (!UNITS[u]) continue;
    UNITS[u].words.forEach(w => {
      if (isSingleLetter) {
        if (w[0].toLowerCase().startsWith(q)) results.push({ word: w, unit: u, type: 'ydt' });
      } else if (w[0].toLowerCase().includes(q) || w[1].toLowerCase().includes(q)) {
        results.push({ word: w, unit: u, type: 'ydt' });
      }
    });
  }

  // Custom vocab
  customVocab.forEach((entry, idx) => {
    const matchWord = isSingleLetter ? entry.word.toLowerCase().startsWith(q) : entry.word.toLowerCase().includes(q);
    const matchMeaning = !isSingleLetter && entry.meanings.some(m => m.toLowerCase().includes(q));
    if (matchWord || matchMeaning) {
      results.push({ word: [entry.word, entry.meanings.join(' / '), entry.example || ''], unit: 'custom', type: 'custom', idx });
    }
  });

  // Cached dictionary entries (skip exact query if we'll show live dict card)
  Object.keys(dictCache).forEach(w => {
    if (w === q || w.includes(':')) return;
    const entry = dictCache[w];
    const firstDef = entry?.sourceLang === 'tr'
      ? (entry?.targetWord || '')
      : (entry?.turkish || entry?.meanings?.[0]?.definitions?.[0]?.text || '');
    const matchWord = isSingleLetter ? w.toLowerCase().startsWith(q) : w.toLowerCase().includes(q);
    const matchDef = !isSingleLetter && firstDef.toLowerCase().includes(q);
    if (matchWord || matchDef) {
      results.push({ word: [w, firstDef, ''], unit: 'dict', type: 'general' });
    }
  });

  const hl = (text, qq) => {
    if (!text) return '';
    const idx = text.toLowerCase().indexOf(qq.toLowerCase());
    if (idx === -1) return esc(text);
    return esc(text.slice(0, idx)) + '<mark>' + esc(text.slice(idx, idx + qq.length)) + '</mark>' + esc(text.slice(idx + qq.length));
  };

  let html = headerHtml;

  // Live online dictionary/translator card slot for queries >= 2 chars
  if (!isSingleLetter) {
    html += `<div id="gs-live-dict-slot" style="padding:8px 16px 2px">
      <div class="search-result-item" style="border:1.5px dashed var(--border2);opacity:0.8">
        <div>
          <div class="search-result-word" style="font-size:14px;color:var(--text3)">Çevrimiçi çeviri &amp; sözlükte aranıyor: "${esc(query)}"...</div>
        </div>
        <span class="search-result-badge">${icon('globe', 14)}</span>
      </div>
    </div>`;
  }

  if (results.length > 0) {
    html += `<div style="font-size:11px;color:var(--text3);font-weight:600;padding:8px 16px 4px">${results.length} yerel sonuç</div>`;
    html += `<div style="padding:0 16px 16px;display:flex;flex-direction:column;gap:8px">`;

    results.slice(0, GS_PAGE).forEach(r => {
      if (r.type === 'custom') {
        html += `<div class="search-result-item" onclick="showAddWord(${r.idx})">
          <div><div class="search-result-word">${hl(r.word[0], query)}</div>
          <div class="search-result-meaning">${hl(r.word[1], query)}</div></div>
          <span class="search-result-badge" style="background:rgba(52,152,219,0.15);color:#3498db">${icon('edit', 14)}</span>
        </div>`;
      } else if (r.type === 'general') {
        html += `<div class="search-result-item" onclick="openDictWord('${_escJsArg(r.word[0])}')">
          <div><div class="search-result-word">${hl(r.word[0], query)}</div>
          <div class="search-result-meaning">${hl(r.word[1], query)}</div></div>
          <span class="search-result-badge" style="background:var(--tone-teal-bg);color:var(--tone-teal-fg)">${icon('globe', 14)}</span>
        </div>`;
      } else {
        html += `<div class="search-result-item" onclick="openWordModal('${_escJsArg(r.word[0])}')">
          <div><div class="search-result-word">${hl(r.word[0], query)}</div>
          <div class="search-result-meaning">${hl(r.word[1], query)}</div></div>
          <span class="search-result-badge">Ünite ${r.unit}</span>
        </div>`;
      }
    });
    html += `</div>`;

    if (results.length > GS_PAGE) {
      html += `<div style="text-align:center;padding:10px;color:var(--text3);font-size:12px">+${results.length - GS_PAGE} sonuç daha — hepsini görmek için yazmaya devam et</div>`;
    }
  } else if (isSingleLetter) {
    html += `<div class="search-empty"><div class="search-empty-icon">${icon('search', 36)}</div><div style="font-size:15px;font-weight:700">Bu harfle başlayan kayıtlı kelime yok</div></div>`;
  }

  resultsEl.innerHTML = html;
  resultsEl.scrollTop = 0;

  if (!isSingleLetter) {
    const reqId = ++_gsActiveReq;
    const similarWords = gsFindSimilar(q);
    fetchDictData(q, 'auto').then(apiData => {
      if (reqId !== _gsActiveReq) return;
      const slot = document.getElementById('gs-live-dict-slot');
      if (!slot) return;
      if (apiData) {
        _gsApiCache[q] = apiData;
        try { localStorage.setItem('ydt_gs_api_cache', JSON.stringify(_gsApiCache)); } catch (e) { }
        slot.innerHTML = gsBuildApiHtml(apiData, query) + (results.length === 0 ? gsBuildSimilarHtml(similarWords, q) : '');
      } else if (results.length === 0) {
        slot.innerHTML = gsBuildSimilarHtml(similarWords, q) + `<div class="search-empty"><div class="search-empty-icon">${icon('search', 36)}</div><div style="font-size:15px;font-weight:700">Sonuç bulunamadı</div><div style="font-size:12px;color:var(--text3);margin-top:4px">"${esc(query)}" için internet sözlüğünde eşleşme yok</div></div>`;
      } else {
        slot.innerHTML = '';
      }
    });
  }
}

function gsBuildApiHtml(apiData, query) {
  const isTr = apiData.sourceLang === 'tr';
  const mainMeaning = isTr
    ? (apiData.targetWord || apiData.bilingualGroups?.[0]?.items?.map(i => i.term).slice(0, 3).join(', ') || '')
    : (apiData.turkish || apiData.meanings?.[0]?.definitions?.[0]?.text || '');

  const syns = (apiData.allSynonyms || []).slice(0, 4);
  const relatedHtml = syns.length > 0
    ? `<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:4px">${syns.map(r => `<span onclick="event.stopPropagation();openDictWord('${_escJsArg(r)}')" style="background:rgba(46,204,113,0.12);color:#27ae60;padding:3px 8px;border-radius:12px;font-size:11px;cursor:pointer;border:1px solid rgba(46,204,113,0.25)">${esc(r)}</span>`).join('')}</div>`
    : '';

  const modeToOpen = isTr ? 'general' : 'en';
  return `<div style="margin-bottom:6px">
    <div style="font-size:11px;color:var(--text3);font-weight:700;margin-bottom:6px;display:flex;align-items:center;gap:5px">${icon('globe', 13)} ÇEVİRİ &amp; SÖZLÜK (${isTr ? 'TR ➔ EN' : 'EN ➔ TR'})</div>
    <div class="search-result-item" onclick="openDictWord('${_escJsArg(apiData.query || apiData.word)}', '${modeToOpen}')" style="border:2px solid var(--accent)">
      <div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <div class="search-result-word" style="font-size:18px;color:var(--accent)">${esc(apiData.word)}</div>
          ${apiData.phonetic ? `<span style="font-size:12px;color:var(--text3);font-style:italic">${esc(apiData.phonetic)}</span>` : ''}
        </div>
        <div class="search-result-meaning" style="font-size:14px;font-weight:600;color:var(--text)">${esc(mainMeaning)}</div>
        ${relatedHtml}
      </div>
      <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
        <button onclick="event.stopPropagation();playDictAudio('${_escJsArg(apiData.audio || '')}','${_escJsArg(isTr ? (apiData.targetWord || apiData.word) : apiData.word)}','en-US')" style="width:32px;height:32px;border-radius:50%;border:none;background:rgba(98,129,65,0.14);color:var(--accent);display:flex;align-items:center;justify-content:center" aria-label="Dinle">${icon('volume', 15)}</button>
        <span class="search-result-badge" style="background:rgba(46,204,113,0.15);color:#27ae60">Detay</span>
      </div>
    </div>
  </div>`;
}

function gsFindSimilar(q) {
  const similar = [];
  const seen = new Set();

  if (_gsApiCache[q] && _gsApiCache[q].allSynonyms) {
    _gsApiCache[q].allSynonyms.slice(0, 6).forEach(s => {
      const sLower = s.toLowerCase();
      if (!seen.has(sLower) && sLower !== q) {
        seen.add(sLower);
        similar.push({ word: s, source: 'synonym' });
      }
    });
  }

  customVocab.forEach(entry => {
    const w = entry.word.toLowerCase();
    if (w !== q && !seen.has(w)) {
      if (w.includes(q) || q.includes(w) || levenshtein(w, q) <= 2) {
        seen.add(w);
        similar.push({ word: entry.word, source: 'custom' });
      }
    }
  });

  Object.keys(dictCache).forEach(w => {
    if (w !== q && !w.includes(':') && !seen.has(w)) {
      if (w.includes(q) || q.includes(w) || levenshtein(w, q) <= 2) {
        seen.add(w);
        similar.push({ word: w, source: 'general' });
      }
    }
  });

  if (typeof UNITS !== 'undefined') {
    for (const u of Object.keys(UNITS)) {
      const unitWords = UNITS[u].words || [];
      for (let i = 0; i < unitWords.length; i++) {
        const w = (unitWords[i][0] || '').toLowerCase();
        if (w && w !== q && !seen.has(w)) {
          if (w.includes(q) || q.includes(w) || levenshtein(w, q) <= 2) {
            seen.add(w);
            similar.push({ word: unitWords[i][0], source: 'ydt' });
          }
        }
      }
      if (similar.length >= 15) break;
    }
  }

  return similar.slice(0, 15);
}

function gsBuildSimilarHtml(similar, q) {
  if (!similar || similar.length === 0) return '';
  const colors = { synonym: '#27ae60', custom: '#3498db', general: '#0f766e', ydt: '#e67e22' };
  let html = `<div style="padding:12px 0 8px"><div style="font-size:11px;color:var(--text3);font-weight:600;margin-bottom:8px">Benzer Kelimeler</div><div style="display:flex;flex-wrap:wrap;gap:6px">`;
  similar.slice(0, 12).forEach(s => {
    html += `<span onclick="event.stopPropagation();openDictWord('${_escJsArg(s.word)}')" style="background:rgba(${hexToRgb(colors[s.source])},0.1);color:${colors[s.source]};padding:6px 12px;border-radius:16px;font-size:13px;font-weight:600;cursor:pointer;border:1px solid rgba(${hexToRgb(colors[s.source])},0.2)">${esc(s.word)}</span>`;
  });
  html += `</div></div>`;
  return html;
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}` : '0,0,0';
}

function levenshtein(a, b) {
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1], matrix[i][j - 1], matrix[i - 1][j]) + 1;
      }
    }
  }
  return matrix[b.length][a.length];
}

// ===== DICTIONARY & TRANSLATOR SCREEN (İNGİLİZCE SÖZLÜK & ÇEVİRİ ARACI) =====
function updateDictHistory(w) {
  if (!w) return;
  const idx = dictHistory.indexOf(w);
  if (idx > -1) dictHistory.splice(idx, 1);
  dictHistory.unshift(w);
  if (dictHistory.length > 50) dictHistory.pop();
  _saveDictHistory();
}

function showDictionary(mode) {
  if (mode === 'en' || mode === 'general') {
    _dictMode = mode;
  }
  showScreen('screen-dict');
  renderDict();
}

async function openDictWord(word, mode) {
  if (mode === 'en' || mode === 'general') _dictMode = mode;
  showScreen('screen-dict');
  if (!document.getElementById('dict-result')) renderDict();
  await dictSearchWord(word);
}

function showDictWordInSearch(word) {
  openDictWord(word);
}

function setTransDirection(dir) {
  if (dir !== 'auto' && dir !== 'en-tr' && dir !== 'tr-en') return;
  _transDir = dir;
  document.querySelectorAll('.trans-lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.dir === dir);
  });
  const inp = document.getElementById('dict-input');
  const current = inp?.value?.trim();
  if (current) {
    dictSearchWord(current);
  }
}

function swapTransDirection() {
  let nextDir = 'tr-en';
  if (_transDir === 'en-tr') {
    nextDir = 'tr-en';
  } else if (_transDir === 'tr-en') {
    nextDir = 'en-tr';
  } else if (_lastDictData?.sourceLang === 'tr') {
    nextDir = 'en-tr';
  } else {
    nextDir = 'tr-en';
  }

  _transDir = nextDir;
  document.querySelectorAll('.trans-lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.dir === nextDir);
  });

  const inp = document.getElementById('dict-input');
  const current = inp?.value?.trim() || '';
  if (_lastDictData && current.toLowerCase() === (_lastDictData.query || '').toLowerCase()) {
    const translated = _lastDictData.sourceLang === 'tr' ? _lastDictData.targetWord : _lastDictData.turkish;
    const expectedOldSrc = nextDir === 'en-tr' ? 'tr' : 'en';
    if (_lastDictData.sourceLang === expectedOldSrc && translated && translated.toLowerCase() !== current.toLowerCase()) {
      const cleanNext = translated.split(',')[0].trim();
      if (inp && cleanNext) inp.value = cleanNext;
    }
  }

  const nextVal = inp?.value?.trim();
  if (nextVal) {
    dictSearchWord(nextVal);
  }
}

function switchDictMode(mode) {
  if (_dictMode === mode) return;
  _dictMode = mode;
  document.querySelectorAll('.dict-mode-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
  const isGen = mode === 'general';
  const langBar = document.getElementById('trans-lang-bar');
  if (langBar) langBar.style.display = isGen ? 'flex' : 'none';

  const inp = document.getElementById('dict-input');
  if (inp) {
    inp.placeholder = isGen
      ? 'Türkçe veya İngilizce kelime, deyim ya da cümle yazın...'
      : 'İngilizce kelime yazın (eş/zıt anlam, tanım)...';
  }
  const searchBtn = document.getElementById('dict-search-btn');
  if (searchBtn) {
    searchBtn.innerHTML = `${icon('search', 15)} <span>${isGen ? 'Çevir' : 'Ara'}</span>`;
  }
  const titleEl = document.getElementById('dict-header-title');
  const subEl = document.getElementById('dict-header-sub');
  if (titleEl) titleEl.innerHTML = isGen ? `${icon('globe', 18)} Çeviri Aracı` : `${icon('bookOpen', 18)} İngilizce Sözlük`;
  if (subEl) subEl.textContent = isGen
    ? 'Güvenilir TR ⇄ EN çeviri, anlamlar, eş/zıt anlam & deyimler'
    : 'Akademik tanım, telaffuz, eş ve zıt anlamlılar';

  if (_lastDictData) {
    renderDictResult(_lastDictData);
  } else {
    const resEl = document.getElementById('dict-result');
    if (resEl) resEl.innerHTML = _renderDictWelcomeHtml();
  }
}

function renderDict() {
  const s = document.getElementById('screen-dict');
  const isGen = _dictMode === 'general';
  s.innerHTML = `
    <div class="unit-header">
      <button class="back-btn" onclick="goHome()" aria-label="Geri">${icon('arrowLeft', 18)}</button>
      <div>
        <div class="unit-title-h" id="dict-header-title">${isGen ? icon('globe', 18) + ' Çeviri Aracı' : icon('bookOpen', 18) + ' İngilizce Sözlük'}</div>
        <div class="unit-sub" id="dict-header-sub">${isGen ? 'Güvenilir TR ⇄ EN çeviri, anlamlar, eş/zıt anlam & deyimler' : 'Akademik tanım, telaffuz, eş ve zıt anlamlılar'}</div>
      </div>
    </div>
    <div class="dict-toolbar">
      <div class="dict-mode-tabs">
        <button type="button" class="dict-mode-tab ${!isGen ? 'active' : ''}" data-mode="en" onclick="switchDictMode('en')">
          ${icon('bookOpen', 14)} <span>İngilizce Sözlük</span>
        </button>
        <button type="button" class="dict-mode-tab ${isGen ? 'active' : ''}" data-mode="general" onclick="switchDictMode('general')">
          ${icon('globe', 14)} <span>Çeviri Aracı (TR ⇄ EN)</span>
        </button>
      </div>
      <div id="trans-lang-bar" class="trans-lang-bar" style="display:${isGen ? 'flex' : 'none'}">
        <button type="button" class="trans-lang-btn ${_transDir === 'auto' ? 'active' : ''}" data-dir="auto" onclick="setTransDirection('auto')">Otomatik</button>
        <button type="button" class="trans-lang-btn ${_transDir === 'en-tr' ? 'active' : ''}" data-dir="en-tr" onclick="setTransDirection('en-tr')">İngilizce ➔ Türkçe</button>
        <button type="button" class="trans-swap-btn" onclick="swapTransDirection()" title="Dilleri değiştir" aria-label="Dilleri değiştir">${icon('repeat', 14)}</button>
        <button type="button" class="trans-lang-btn ${_transDir === 'tr-en' ? 'active' : ''}" data-dir="tr-en" onclick="setTransDirection('tr-en')">Türkçe ➔ İngilizce</button>
      </div>
      <div class="dict-search-row">
        <div class="dict-search-input-wrap">
          <input id="dict-input" class="dict-search-input"
            placeholder="${isGen ? 'Türkçe veya İngilizce kelime, deyim ya da cümle yazın...' : 'İngilizce kelime yazın (eş/zıt anlam, tanım)...'}"
            oninput="onDictInput(this.value)"
            onkeydown="if(event.key==='Enter')dictSearch()"
            autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="search">
          <button type="button" id="dict-clear-btn" class="dict-clear-btn" onclick="clearDictInput()" aria-label="Temizle">
            ${icon('x', 13)}
          </button>
        </div>
        <button type="button" id="dict-search-btn" class="dict-search-btn" onclick="dictSearch()">
          ${icon('search', 15)} <span>${isGen ? 'Çevir' : 'Ara'}</span>
        </button>
      </div>
      <div id="dict-suggestions" class="dict-suggest-row" style="display:none"></div>
    </div>
    <div id="dict-content" class="dict-scroll-area">
      <div id="dict-history-wrap">${_renderDictHistoryHtml()}</div>
      <div id="dict-result">${_renderDictWelcomeHtml()}</div>
    </div>
  `;
  const input = document.getElementById('dict-input');
  if (input) input.focus();
}

function _renderDictHistoryHtml() {
  if (!dictHistory || dictHistory.length === 0) return '';
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
      <span style="font-size:12px;color:var(--text3);font-weight:700">Son Aramalar</span>
      <button onclick="clearDictHistory()" style="background:none;border:none;color:var(--text3);font-size:11.5px;cursor:pointer;text-decoration:underline">Temizle</button>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px">
      ${dictHistory.slice(0, 16).map(w => `<span onclick="dictSearchWord('${_escJsArg(w)}')" class="dict-suggest-chip">${esc(w)}</span>`).join('')}
    </div>
  `;
}

function _renderDictWelcomeHtml() {
  const isGen = _dictMode === 'general';
  const quickWords = isGen
    ? ['özgürlük', 'break', 'cesur', 'inevitable', 'karar', 'give up', 'Persistence leads to success.']
    : ['resilient', 'abandon', 'inevitable', 'perseverance', 'consequence', 'ambitious'];
  return `
    <div style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:18px;text-align:center">
      <div style="color:var(--accent);margin-bottom:8px">${icon(isGen ? 'globe' : 'bookOpen', 32)}</div>
      <div style="font-size:15px;font-weight:700;color:var(--text)">${isGen ? 'Çift Yönlü Çeviri Aracı (TR ⇄ EN)' : 'İngilizce Akademik Sözlük'}</div>
      <div style="font-size:12.5px;color:var(--text3);margin-top:4px;line-height:1.5">
        ${isGen
          ? 'Kelime, deyim veya cümle yaz; çoklu kaynak doğrulamalı çeviriyi, sözlükteki olası anlamları, bu anlama gelebilecek sıralı kelimeleri, eş/zıt anlamlıları ve deyimleri tek ekranda gör.'
          : 'Kelimenin IPA okunuşunu, sesli telaffuzunu, İngilizce-Türkçe tanımlarını, eş/zıt anlamlılarını ve örnek cümlelerini incele.'}
      </div>
      <div style="margin-top:14px;display:flex;flex-wrap:wrap;gap:6px;justify-content:center">
        ${quickWords.map(w => `<button type="button" class="dict-suggest-chip" onclick="dictSearchWord('${_escJsArg(w)}')">${esc(w)}</button>`).join('')}
      </div>
    </div>
  `;
}

function clearDictInput() {
  const inp = document.getElementById('dict-input');
  const clr = document.getElementById('dict-clear-btn');
  const sug = document.getElementById('dict-suggestions');
  if (inp) { inp.value = ''; inp.focus(); }
  if (clr) clr.style.display = 'none';
  if (sug) { sug.style.display = 'none'; sug.innerHTML = ''; }
}

function onDictInput(val) {
  const clr = document.getElementById('dict-clear-btn');
  if (clr) clr.style.display = val ? 'flex' : 'none';
  clearTimeout(_dictSuggestTimer);

  const q = val.trim();
  const sugEl = document.getElementById('dict-suggestions');
  if (!sugEl) return;
  if (q.length < 2 || q.split(/\s+/).length > 3) {
    sugEl.style.display = 'none';
    sugEl.innerHTML = '';
    return;
  }

  _dictSuggestTimer = setTimeout(async () => {
    const suggestions = [];
    const seen = new Set();
    const ql = q.toLowerCase();
    const pushSug = s => {
      const clean = String(s || '').trim();
      const low = clean.toLowerCase();
      if (!clean || seen.has(low)) return;
      seen.add(low);
      suggestions.push(clean);
    };

    // Fast local matches across UNITS (EN words & TR meanings), PHRASAL_VERBS & COMMON_IDIOMS
    if (typeof UNITS !== 'undefined') {
      for (const u of Object.keys(UNITS)) {
        for (const w of UNITS[u].words || []) {
          const enW = String(w[0] || '').trim();
          const trW = String(w[1] || '').trim();
          if (enW.toLowerCase().startsWith(ql)) pushSug(enW);
          if (_transDir !== 'en-tr') {
            trW.split(/[,;/]+/).forEach(part => {
              const p = part.replace(/\d+\./g, '').trim();
              if (p.toLowerCase().startsWith(ql) && p.length >= 2) pushSug(p);
            });
          }
          if (suggestions.length >= 6) break;
        }
        if (suggestions.length >= 6) break;
      }
    }

    if (suggestions.length < 6 && typeof PHRASAL_VERBS !== 'undefined') {
      for (const u of Object.keys(PHRASAL_VERBS)) {
        for (const pv of PHRASAL_VERBS[u] || []) {
          if ((pv.pv || '').toLowerCase().startsWith(ql)) pushSug(pv.pv);
          if (suggestions.length >= 6) break;
        }
        if (suggestions.length >= 6) break;
      }
    }

    if (suggestions.length < 6) {
      for (const item of COMMON_IDIOMS) {
        if (item.phrase.toLowerCase().startsWith(ql)) {
          pushSug(item.phrase);
          if (suggestions.length >= 6) break;
        }
      }
    }

    // Fast Datamuse autocomplete API (only for English ASCII prefixes when local pool < 6)
    const allowEnSug = !(_dictMode === 'general' && _transDir === 'tr-en') && !_looksTurkish(q) && !/[^a-zA-Z\s-]/.test(q);
    if (allowEnSug && suggestions.length < 6) {
      try {
        const res = await fetchWithTimeout(`https://api.datamuse.com/sug?s=${encodeURIComponent(ql)}&max=6`, {}, 1500);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            data.forEach(item => {
              const s = item?.word;
              if (_isCleanEnglishTerm(s)) pushSug(s);
            });
          }
        }
      } catch (e) { }
    }

    const currentVal = document.getElementById('dict-input')?.value?.trim().toLowerCase();
    if (!currentVal || currentVal !== ql) return;

    if (suggestions.length > 0) {
      sugEl.innerHTML = suggestions.slice(0, 7).map(s =>
        `<button type="button" class="dict-suggest-chip" onclick="dictSearchWord('${_escJsArg(s)}')">${esc(s)}</button>`
      ).join('');
      sugEl.style.display = 'flex';
    } else {
      sugEl.style.display = 'none';
    }
  }, 150);
}

function dictSearch() {
  const val = document.getElementById('dict-input')?.value.trim();
  if (!val) return;
  dictSearchWord(val);
}

async function dictSearchWord(word) {
  if (!document.getElementById('dict-result')) renderDict();
  const resultEl = document.getElementById('dict-result');
  const sugEl = document.getElementById('dict-suggestions');
  const inp = document.getElementById('dict-input');
  const clr = document.getElementById('dict-clear-btn');

  if (inp) inp.value = word;
  if (clr) clr.style.display = word ? 'flex' : 'none';
  if (sugEl) sugEl.style.display = 'none';
  if (!resultEl) return;

  const reqId = ++_dictActiveReq;
  resultEl.innerHTML = `<div style="text-align:center;padding:40px"><div class="spinner" style="margin:0 auto"></div><div style="margin-top:12px;color:var(--text3);font-size:13px;font-weight:600">"${esc(word)}" çevriliyor &amp; sözlük taranıyor...</div></div>`;

  const searchDir = _dictMode === 'general' ? _transDir : 'auto';
  const data = await fetchDictData(word, searchDir);
  if (reqId !== _dictActiveReq) return;

  if (!data) {
    resultEl.innerHTML = `<div style="text-align:center;padding:40px;color:var(--error)">${icon('x', 22)} <div style="margin-top:8px;font-weight:700">"${esc(word)}" için sonuç bulunamadı</div></div>`;
    return;
  }

  _lastDictData = data;
  const histWrap = document.getElementById('dict-history-wrap');
  if (histWrap) histWrap.innerHTML = _renderDictHistoryHtml();
  renderDictResult(data);
  if (typeof _trackQuestStat === 'function') _trackQuestStat('wordsViewed');
}

function renderDictResult(data) {
  const resultEl = document.getElementById('dict-result');
  if (!resultEl || !data) return;

  const isTrQuery = data.sourceLang === 'tr';
  const sourceLangCode = isTrQuery ? 'tr-TR' : 'en-US';
  const targetLangCode = isTrQuery ? 'en-US' : 'tr-TR';
  const primaryText = isTrQuery ? (data.targetWord || '') : (data.turkish || '');
  const langLabel = isTrQuery ? 'Türkçe ➔ İngilizce' : 'İngilizce ➔ Türkçe';

  const sourceBadgeLabel = (data.sourcesUsed || []).length >= 2
    ? `Çoklu Kaynak Doğrulamalı (${data.sourcesUsed.join(' + ')})`
    : (data.sourcesUsed?.[0] || 'Çevrimiçi Sözlük');

  const altHtml = (data.altTranslations && data.altTranslations.length > 0)
    ? `<div class="trans-alt-row">
         <span class="trans-alt-label">Diğer çeviriler:</span>
         ${data.altTranslations.map(alt => `<button type="button" class="dict-nuance-chip" onclick="dictSearchWord('${_escJsArg(alt)}')">${esc(alt)}</button>`).join('')}
       </div>`
    : '';

  const ydtMatch = data.localMatches?.find(m => m.source === 'ydt');
  const ydtBadgeHtml = ydtMatch
    ? `<div class="trans-ydt-pill" onclick="openWordModal('${_escJsArg(ydtMatch.word)}')">${icon('graduationCap', 13)} <span>YDT Ünite ${ydtMatch.unit}: <b>${esc(ydtMatch.word)}</b> — ${esc(ydtMatch.tr)}</span></div>`
    : '';

  let html = `
    <div class="dict-hero-card">
      <div class="dict-hero-badges">
        <span class="dict-lang-pill">${icon('globe', 11)} ${langLabel}</span>
        <span class="dict-trust-pill">${icon('checkCircle', 11)} ${esc(sourceBadgeLabel)}</span>
      </div>
      <div class="dict-hero-top">
        <div style="min-width:0;flex:1">
          <div class="dict-hero-word${data.isSentence ? ' is-sentence' : ''}">${esc(data.word)}</div>
          ${!isTrQuery && data.phonetic ? `<div class="dict-hero-phonetic">${esc(data.phonetic)}</div>` : ''}
        </div>
        <button type="button" class="dict-audio-btn" onclick="playDictAudio('${_escJsArg(!isTrQuery ? (data.audio || '') : '')}','${_escJsArg(data.word)}','${sourceLangCode}')" aria-label="Kaynak metni dinle" title="Dinle">
          ${icon('volume', 19)}
        </button>
      </div>
      ${primaryText ? `
        <div class="dict-primary-translation-box">
          <div class="dict-primary-translation">
            <span>${esc(primaryText)}</span>
            ${isTrQuery && data.phonetic ? `<span class="dict-hero-phonetic" style="margin-left:6px;font-weight:500">${esc(data.phonetic)}</span>` : ''}
          </div>
          <div class="trans-target-actions">
            <button type="button" class="trans-mini-btn" onclick="speakLastTranslation()" title="Çeviriyi seslendir" aria-label="Çeviriyi seslendir">
              ${icon('volume', 15)}
            </button>
            <button type="button" class="trans-mini-btn" onclick="copyLastTranslation()" title="Çeviriyi kopyala" aria-label="Çeviriyi kopyala">
              ${_inlineCopyIcon(15)}
            </button>
          </div>
        </div>
      ` : ''}
      ${altHtml}
      ${ydtBadgeHtml}
    </div>
  `;

  // Clickable sentence word breakdown when translating sentences
  if (data.isSentence) {
    const enSentence = isTrQuery ? primaryText : data.word;
    const tokens = _uniqueCleanWords(
      (enSentence || '').split(/[^a-zA-Z-]+/).filter(t => t.length >= 3),
      '',
      16
    );
    if (tokens.length > 0) {
      html += `
        <div class="dict-section-card">
          <div class="dict-sec-title">${icon('search', 13)} CÜMLEDEKİ KELİMELERİ İNCELE</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px">
            ${tokens.map(tok => `<button type="button" class="dict-suggest-chip" onclick="dictSearchWord('${_escJsArg(tok)}')">${esc(tok)}</button>`).join('')}
          </div>
        </div>
      `;
    }
  }

  // 1. Ranked Candidate Words ("Bu Anlama Gelebilecek Kelimeler")
  const buildRankedCandidatesSection = () => {
    if (!data.candidateWords || data.candidateWords.length === 0) return '';
    const maxScore = Math.max(...data.candidateWords.map(c => c.score || 0), 1);
    return `
      <div class="dict-section-card">
        <div class="dict-sec-title">${icon('listChecks', 13)} BU ANLAMA GELEBİLECEK KELİMELER (SIRALI)</div>
        <div class="dict-ranked-list">
          ${data.candidateWords.map(item => {
            const pct = item.score > 0 ? Math.max(18, Math.min(100, Math.round((item.score / maxScore) * 100))) : 0;
            return `
              <div class="dict-ranked-item" onclick="dictSearchWord('${_escJsArg(item.word)}')">
                <span class="dict-rank-num">${item.rank}</span>
                <div class="dict-ranked-body">
                  <div class="dict-ranked-top">
                    <span class="dict-ranked-word">${esc(item.word)}</span>
                    ${item.pos ? `<span class="dict-ranked-pos">${esc(item.pos)}</span>` : ''}
                  </div>
                  ${item.meaningTr ? `<div class="dict-ranked-sub">${esc(item.meaningTr)}</div>` : ''}
                  ${item.nuances && item.nuances.length > 0 ? `
                    <div class="dict-nuance-chips" style="margin-top:4px">
                      ${item.nuances.map(n => `<span class="dict-nuance-chip" onclick="event.stopPropagation();dictSearchWord('${_escJsArg(n)}')">${esc(n)}</span>`).join('')}
                    </div>
                  ` : ''}
                </div>
                ${pct > 0 ? `<div class="dict-freq-track" title="Yaygınlık"><div class="dict-freq-fill" style="width:${pct}%"></div></div>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  };

  // 2. Bilingual POS Meanings
  const buildBilingualSection = () => {
    if (!data.bilingualGroups || data.bilingualGroups.length === 0) return '';
    let out = `<div class="dict-section-card">
      <div class="dict-sec-title">${icon('globe', 13)} ${isTrQuery ? 'İNGİLİZCE KARŞILIKLAR (TÜRLERE GÖRE)' : 'KELİMENİN SÖZLÜKTEKİ OLASI ANLAMLARI'}</div>`;
    data.bilingualGroups.forEach(group => {
      const topScore = Math.max(...group.items.map(i => i.score || 0), 0.01);
      out += `<div style="margin-bottom:12px">
        <div class="dict-pos-header">
          <span class="dict-pos-badge is-teal">${esc(group.posTr)}</span>
          <span style="font-size:11.5px;color:var(--text3);font-weight:600">${esc(group.partOfSpeech)}</span>
        </div>`;
      group.items.slice(0, 7).forEach(item => {
        const barPct = item.score > 0 ? Math.max(15, Math.min(100, Math.round((item.score / topScore) * 100))) : 0;
        out += `<div class="dict-tr-row">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
            <div class="dict-tr-main" onclick="dictSearchWord('${_escJsArg(item.term)}')">${esc(item.term)}</div>
            ${barPct > 0 ? `<div class="dict-freq-track" title="Kullanım sıklığı"><div class="dict-freq-fill" style="width:${barPct}%"></div></div>` : ''}
          </div>
          ${item.reverse && item.reverse.length > 0 ? `
            <div class="dict-nuance-chips">
              ${item.reverse.map(rev => `<span class="dict-nuance-chip" onclick="dictSearchWord('${_escJsArg(rev)}')">${esc(rev)}</span>`).join('')}
            </div>` : ''}
        </div>`;
      });
      out += `</div>`;
    });
    out += `</div>`;
    return out;
  };

  // 3. Monolingual + Translated Dictionary Definitions
  const buildEnglishMeaningsSection = () => {
    if (!data.meanings || data.meanings.length === 0) return '';
    let out = '';
    data.meanings.forEach((m, i) => {
      out += `<div class="dict-section-card">
        <div class="dict-pos-header">
          <span class="dict-pos-badge">${esc(_posLabelTr(m.partOfSpeech))}</span>
          <span style="font-size:12px;color:var(--text3);font-weight:600">${esc(m.partOfSpeech || '')} · Sözlük Anlamı ${i + 1}</span>
        </div>`;

      if (m.definitions && m.definitions.length > 0) {
        out += `<div style="margin-bottom:12px">
          <div class="dict-sec-title" style="margin-bottom:6px">${icon('bookOpen', 13)} SÖZLÜK TANIMLARI</div>`;
        m.definitions.forEach((def, idx) => {
          out += `<div style="margin-bottom:8px;padding:11px;background:var(--bg);border-radius:10px">
            <div style="display:flex;gap:8px">
              <span style="background:var(--accent);color:var(--on-accent);width:21px;height:21px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;margin-top:2px">${idx + 1}</span>
              <span style="font-size:14px;color:var(--text);line-height:1.5">${esc(def.text)}</span>
            </div>
            ${def.turkish ? `<div style="font-size:13px;color:var(--text2);line-height:1.4;padding-left:29px;margin-top:4px" class="icon-inline">${icon('arrowRight', 12)} <span>${esc(def.turkish)}</span></div>` : ''}
          </div>`;
        });
        out += `</div>`;
      }

      if (m.examples && m.examples.length > 0) {
        out += `<div style="margin-bottom:12px">
          <div class="dict-sec-title" style="margin-bottom:6px">${icon('messageSquare', 13)} ÖRNEK CÜMLELER</div>`;
        m.examples.forEach(ex => {
          out += `<div style="margin-bottom:8px;padding:10px 12px;background:var(--tone-green-bg);border-radius:8px;border:1px solid var(--tone-green-border)">
            <div style="font-size:13.5px;color:var(--text);font-style:italic;margin-bottom:3px">"${esc(ex.original)}"</div>
            ${ex.turkish ? `<div style="font-size:12.5px;color:var(--text2);line-height:1.4" class="icon-inline">${icon('arrowRight', 12)} <span>${esc(ex.turkish)}</span></div>` : ''}
          </div>`;
        });
        out += `</div>`;
      }

      if (_dictMode === 'en' && !isTrQuery) {
        if (m.synonyms && m.synonyms.length > 0) {
          out += `<div style="margin-bottom:10px">
            <div class="dict-sec-title" style="margin-bottom:6px">${icon('link', 13)} EŞ ANLAMLILAR</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px">${m.synonyms.map(s => `<span onclick="dictSearchWord('${_escJsArg(s)}')" class="dict-chip-syn">${esc(s)}</span>`).join('')}</div>
          </div>`;
        }
        if (m.antonyms && m.antonyms.length > 0) {
          out += `<div>
            <div class="dict-sec-title" style="margin-bottom:6px">${icon('repeat', 13)} ZIT ANLAMLILAR</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px">${m.antonyms.map(s => `<span onclick="dictSearchWord('${_escJsArg(s)}')" class="dict-chip-ant">${esc(s)}</span>`).join('')}</div>
          </div>`;
        }
      }
      out += `</div>`;
    });
    return out;
  };

  // 4. Unified Synonyms, Antonyms & Word Family Card
  const buildSynAntFamilySection = () => {
    const hasSyns = data.allSynonyms && data.allSynonyms.length > 0;
    const hasAnts = data.allAntonyms && data.allAntonyms.length > 0;
    const hasFam = data.family && data.family.length > 0;
    if (!hasSyns && !hasAnts && !hasFam) return '';
    return `
      <div class="dict-section-card">
        <div class="dict-sec-title">${icon('link', 13)} EŞ ANLAMLI, ZIT ANLAMLI &amp; KELİME AİLESİ</div>
        ${hasSyns ? `
          <div style="margin-bottom:${hasAnts || hasFam ? '12px' : '0'}">
            <div class="dict-sub-label is-syn">Eş Anlamlılar</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px">${data.allSynonyms.map(s => `<span onclick="dictSearchWord('${_escJsArg(s)}')" class="dict-chip-syn">${esc(s)}</span>`).join('')}</div>
          </div>
        ` : ''}
        ${hasAnts ? `
          <div style="margin-bottom:${hasFam ? '12px' : '0'}">
            <div class="dict-sub-label is-ant">Zıt Anlamlılar</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px">${data.allAntonyms.map(s => `<span onclick="dictSearchWord('${_escJsArg(s)}')" class="dict-chip-ant">${esc(s)}</span>`).join('')}</div>
          </div>
        ` : ''}
        ${hasFam ? `
          <div>
            <div class="dict-sub-label is-fam">Kelime Ailesi</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px">${data.family.map(s => `<span onclick="dictSearchWord('${_escJsArg(s)}')" class="dict-chip-fam">${esc(s)}</span>`).join('')}</div>
          </div>
        ` : ''}
      </div>
    `;
  };

  // 5. Idioms, Phrasal Verbs & Collocations
  const buildIdiomsSection = () => {
    if (!data.idioms || data.idioms.length === 0) return '';
    return `
      <div class="dict-section-card">
        <div class="dict-sec-title">${icon('sparkles', 13)} BU KELİMEYİ İÇEREN DEYİMLER &amp; KALIP İFADELER</div>
        <div class="dict-idiom-list">
          ${data.idioms.map(item => `
            <div class="dict-idiom-card">
              <div class="dict-idiom-head">
                <div class="dict-idiom-title-wrap" onclick="dictSearchWord('${_escJsArg(item.phrase)}')">
                  <span class="dict-idiom-badge ${item.type === 'Phrasal Verb' ? 'is-pv' : ''}">${esc(item.type || 'Deyim')}</span>
                  <span class="dict-idiom-phrase">${esc(item.phrase)}</span>
                </div>
                <button type="button" class="trans-mini-btn" onclick="speakTextWithLang('${_escJsArg(item.phrase)}','en-US')" aria-label="Deyimi dinle">${icon('volume', 14)}</button>
              </div>
              ${item.turkish ? `<div class="dict-idiom-tr">${esc(item.turkish)}</div>` : ''}
              ${item.definitionTr || item.definitionEn ? `<div class="dict-idiom-def">${esc(item.definitionTr || item.definitionEn)}</div>` : ''}
              ${item.example ? `<div class="dict-idiom-ex">"${esc(item.example)}"</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  };

  // Assemble sections based on active mode
  if (_dictMode === 'general' || isTrQuery) {
    html += buildRankedCandidatesSection();
    html += buildBilingualSection();
    html += buildEnglishMeaningsSection();
    html += buildSynAntFamilySection();
    html += buildIdiomsSection();
  } else {
    html += buildEnglishMeaningsSection();
    html += buildBilingualSection();
    html += buildRankedCandidatesSection();
    html += buildSynAntFamilySection();
    html += buildIdiomsSection();
  }

  // Extra examples if meanings had none
  if (data.extraExamples && data.extraExamples.length > 0) {
    html += `<div class="dict-section-card">
      <div class="dict-sec-title">${icon('messageSquare', 13)} KULLANIM ÖRNEKLERİ</div>
      ${data.extraExamples.map(ex => `
        <div style="margin-bottom:8px;padding:10px 12px;background:var(--tone-green-bg);border-radius:8px;border:1px solid var(--tone-green-border)">
          <div style="font-size:13.5px;color:var(--text);font-style:italic;margin-bottom:3px">"${esc(ex.original)}"</div>
          ${ex.turkish ? `<div style="font-size:12.5px;color:var(--text2);line-height:1.4" class="icon-inline">${icon('arrowRight', 12)} <span>${esc(ex.turkish)}</span></div>` : ''}
        </div>
      `).join('')}
    </div>`;
  }

  const saveWordEn = isTrQuery ? (data.targetWord || data.word) : data.word;
  const saveMeaningTr = isTrQuery ? data.word : (data.turkish || '');
  const firstExample = data.meanings?.[0]?.examples?.[0]?.original || data.extraExamples?.[0]?.original || '';

  html += `
    <div class="dict-action-bar">
      <button type="button" class="dict-action-btn add-word" onclick="dictAddToMyWords('${_escJsArg(saveWordEn)}','${_escJsArg(saveMeaningTr)}','${_escJsArg(firstExample)}')">
        ${icon('plus', 15)} <span>Kelimelerime Ekle</span>
      </button>
      <button type="button" class="dict-action-btn add-error" onclick="dictAddToErrorBox('${_escJsArg(saveWordEn)}','${_escJsArg(saveMeaningTr)}')">
        ${icon('alertTriangle', 15)} <span>Hatalara Ekle</span>
      </button>
      <button type="button" class="dict-action-btn mark-ok" onclick="dictMarkLearned('${_escJsArg(saveWordEn)}')">
        ${icon('check', 15)} <span>Öğrendim</span>
      </button>
    </div>
    <div style="margin-top:12px;display:flex;align-items:center;justify-content:space-between">
      <span style="font-size:12px;color:var(--text3)">${dictHistory.length} arama kaydedildi</span>
      <button onclick="clearDictHistory()" style="background:none;border:none;color:var(--text3);font-size:12px;cursor:pointer;text-decoration:underline">Geçmişi temizle</button>
    </div>
  `;

  resultEl.innerHTML = html;
}

function dictAddToMyWords(word, turkish, example) {
  const w = (word || '').trim();
  const tr = (turkish || '').trim();
  if (!w) return;
  const exists = customVocab.find(item => item.word.toLowerCase() === w.toLowerCase());
  if (exists) {
    showToast(`"${w}" zaten Kişisel Kelimelerim'de!`);
    return;
  }

  // Collect extra short meanings if available
  const meanings = [];
  if (tr) meanings.push(tr);
  if (_lastDictData && _lastDictData.bilingualGroups && _lastDictData.sourceLang === 'en') {
    _lastDictData.bilingualGroups.forEach(g => {
      g.items.slice(0, 2).forEach(it => {
        if (it.term && !meanings.includes(it.term) && meanings.length < 3) {
          meanings.push(it.term);
        }
      });
    });
  }
  if (meanings.length === 0) meanings.push('Çeviri');

  customVocab.push({ word: w, meanings, example: example || '' });
  saveVocab();
  if (typeof _trackQuestStat === 'function') _trackQuestStat('customAdded', true);
  showToast(`"${w}" Kişisel Kelimelerime eklendi!`);
}

function dictAddToErrorBox(word, turkish) {
  errorBox['dict_' + word] = { word, meaning: turkish, unit: 0 };
  saveErrors();
  showToast('Hata kumbarasına eklendi!');
}

function dictMarkLearned(word) {
  const clean = (word || '').toLowerCase().trim();
  if (typeof UNITS !== 'undefined') {
    for (const u of Object.keys(UNITS)) {
      const hit = (UNITS[u].words || []).find(item => (item[0] || '').toLowerCase() === clean);
      if (hit) {
        markLearned(Number(u), hit[0]);
        showToast(`"${hit[0]}" Ünite ${u} için öğrenildi olarak işaretlendi!`);
        return;
      }
    }
  }
  showToast('"' + word + '" öğrenildi olarak işaretlendi!');
}

function clearDictHistory() {
  dictHistory = [];
  _saveDictHistory();
  renderDict();
}
