// YDT (YKS-Dil), YDS & YOKDIL Exam Anatomy, Strategy Coach, Score Roadmap & Branch Vocabulary Packs

const EXAM_SPECS = {
  YDS: {
    id: 'YDS',
    name: 'YDS (Yabancı Dil Bilgisi Seviye Tespit Sınavı)',
    shortName: 'YDS',
    organizer: 'ÖSYM',
    totalQuestions: 80,
    durationMin: 180,
    pointsPerQuestion: 1.25,
    wrongPenalty: false,
    difficultyNote: 'Genel akademik terminoloji, çıkarım soruları, Diyalog ve Yakın Anlam (Restatement) bölümleriyle daha geniş kapsamlı ve yorum odaklıdır.',
    sections: [
      { name: 'Kelime Bilgisi', count: 6, timeMin: 7, keyTip: 'Fiil, zarf, sıfat ve phrasal verb ayrımına odaklan.' },
      { name: 'Dilbilgisi (Tense / Prep / Bağlaç)', count: 10, timeMin: 12, keyTip: 'Zaman uyumu, edilgen yapı, bağlaç ve edat kalıplarını yakala.' },
      { name: 'Cloze Test (2 Parça)', count: 10, timeMin: 14, keyTip: 'Boşluktan hem önceki hem sonraki cümlenin bağlamını oku.' },
      { name: 'Cümle Tamamlama', count: 10, timeMin: 16, keyTip: 'Bağlaç anlamı + zamir referansı + zaman uyumunu eşle.' },
      { name: 'İngilizce → Türkçe Çeviri', count: 3, timeMin: 4, keyTip: 'Özne ve ana yüklem eşleşmesi ile şıkları 10 saniyede ele.' },
      { name: 'Türkçe → İngilizce Çeviri', count: 3, timeMin: 4, keyTip: 'Bağlaç türünü ve fiil kipini kontrol et.' },
      { name: 'Okuma Parçaları (5 Paragraf)', count: 20, timeMin: 60, keyTip: 'Önce soru kökünü oku, çıkarım ve ana fikir sorularını ayır.' },
      { name: 'Diyalog Tamamlama', count: 5, timeMin: 10, keyTip: 'Konuşmacının tonu, tepkisi ve sonraki cümlenin ipucunu bul.' },
      { name: 'Yakın Anlam (Restatement)', count: 4, timeMin: 13, keyTip: 'Zıtlık, koşul, nicelik (only, few, almost) ifadelerini birebir koru.' },
      { name: 'Paragraf Tamamlama', count: 4, timeMin: 13, keyTip: 'Boşluk öncesi son cümle ile boşluk sonrası ilk cümle köprüsünü kur.' },
      { name: 'Anlam Bütünlüğünü Bozan', count: 5, timeMin: 12, keyTip: 'Konu sapması ve kopuk zamir (it/they/this) kullanımını yakala.' }
    ]
  },
  YOKDIL: {
    id: 'YOKDIL',
    name: 'YÖKDİL (Yükseköğretim Kurumları Yabancı Dil Sınavı)',
    shortName: 'YÖKDİL',
    organizer: 'ÖSYM (Fen · Sağlık · Sosyal)',
    totalQuestions: 80,
    durationMin: 180,
    pointsPerQuestion: 1.25,
    wrongPenalty: false,
    difficultyNote: 'Seçtiğin alana (Sağlık, Fen veya Sosyal Bilimler) özgü kelime havuzuna sahiptir. Diyalog ve Restatement yoktur; bunun yerine 12 Çeviri ve 14 Dilbilgisi sorusu içerir.',
    sections: [
      { name: 'Kelime Bilgisi', count: 6, timeMin: 7, keyTip: 'Alanına özgü sık çıkan fiil, isim, sıfat, zarf ve phrasal verbleri bil.' },
      { name: 'Dilbilgisi & Bağlaçlar', count: 14, timeMin: 16, keyTip: 'Özellikle prepositions, bağlaçlar (although/whereas/due to) ve kısaltmalar.' },
      { name: 'Cloze Test (2 Parça)', count: 10, timeMin: 14, keyTip: 'Alan metni akışını bozmadan edat ve bağlaç boşluklarını doldur.' },
      { name: 'Cümle Tamamlama', count: 11, timeMin: 18, keyTip: 'Paralellik ve zıtlık bağlaçlarıyla hızlıca iki şıkka indir.' },
      { name: 'İngilizce → Türkçe Çeviri', count: 6, timeMin: 9, keyTip: 'YÖKDİL’de 6 soru = 7.5 puan! Ana fiil + özne kuralıyla tam net hedefle.' },
      { name: 'Türkçe → İngilizce Çeviri', count: 6, timeMin: 9, keyTip: 'Çeviri toplam 12 soru (15 puan) ile en yüksek verimli bölümdür.' },
      { name: 'Paragraf Tamamlama', count: 6, timeMin: 16, keyTip: 'Referans zamirler (such, these, however) en güçlü kılavuzdur.' },
      { name: 'Anlam Bütünlüğünü Bozan', count: 6, timeMin: 14, keyTip: 'Paragrafın odak noktası (ör. tedavi vs tarihçe) değiştiğinde yakala.' },
      { name: 'Okuma Parçaları (5 Paragraf)', count: 15, timeMin: 55, keyTip: 'YDS’ye göre daha doğrudan bilgi soruları gelir; anahtar kelime taraması çok etkilidir.' }
    ]
  },
  YDT: {
    id: 'YDT',
    name: 'YDT (YKS-Dil — Yabancı Dil Testi)',
    shortName: 'YDT',
    organizer: 'ÖSYM',
    totalQuestions: 80,
    durationMin: 120,
    pointsPerQuestion: 1.25,
    wrongPenalty: true,
    difficultyNote: '120 dakikada 80 soru çözdürdüğü için hız kritiktir! 4 yanlış 1 doğruyu götürür. Situation (Verilen Durum), Diyalog ve 12 Çeviri sorusu belirleyicidir.',
    sections: [
      { name: 'Kelime Bilgisi', count: 5, timeMin: 5, keyTip: 'Fiil, sıfat, zarf ve phrasal verb soruları; anlam bütünlüğü belirleyicidir.' },
      { name: 'Dilbilgisi (Tense / Modal / Prep / Bağlaç)', count: 10, timeMin: 10, keyTip: 'Tense-zaman zarfı, aktif/pasif, reduction ve prepositions kalıplarını kaçırma.' },
      { name: 'Cloze Test (1 Parça)', count: 5, timeMin: 6, keyTip: 'Boşluğun öncesi ve sonrasındaki zamir ile bağlaç geçişini birlikte oku.' },
      { name: 'Cümle Tamamlama', count: 8, timeMin: 10, keyTip: 'Zıtlık ve sebep-sonuç bağlaçları ile zaman uyumunu hızla eşle.' },
      { name: 'Okuma Parçaları (5 Paragraf × 3 Soru)', count: 15, timeMin: 36, keyTip: 'Bilim, kültür ve hikâye parçaları gelir; ana fikir ve çıkarım sorularına odaklan.' },
      { name: 'Diyalog Tamamlama', count: 5, timeMin: 8, keyTip: 'Karşılıklı üslubu, şaka/şaşırma/itiraz tonunu sonraki cümleden yakala.' },
      { name: 'Verilen Durum (Situation)', count: 5, timeMin: 7, keyTip: 'YDT’ye özgüdür! Rolü, kibar/uyarı/özür tonunu ve amacı çizip aşırı şıkları ele.' },
      { name: 'Yakın Anlam (Restatement)', count: 5, timeMin: 10, keyTip: 'Nicelik (only, hard, few), koşul ve zıtlık derecesini birebir koru.' },
      { name: 'Paragraf Tamamlama', count: 5, timeMin: 8, keyTip: 'Boşluk sonrası "However / This / As a result" referanslarını takip et.' },
      { name: 'İngilizce → Türkçe Çeviri', count: 6, timeMin: 6, keyTip: 'Özne + yan cümle + ana yüklem sırasıyla ele; 15 saniyede net çıkar.' },
      { name: 'Türkçe → İngilizce Çeviri', count: 6, timeMin: 6, keyTip: 'Bağlaç türünü (-e rağmen / -dığı için) ve zaman kipini karşılaştır.' },
      { name: 'Anlam Bütünlüğünü Bozan', count: 5, timeMin: 8, keyTip: 'Konu dışına çıkan veya önceki cümledeki zamirle çelişen cümleyi bul.' }
    ]
  }
};

const EXAM_COMPARISON_POINTS = [
  { label: 'Soru & Süre', ydt: '80 soru · 120 dk (4 yanlış 1 doğruyu götürür!)', yds: '80 soru · 180 dk (Yanlış doğruyu götürmez)', yokdil: '80 soru · 180 dk (Yanlış doğruyu götürmez)' },
  { label: 'Alan & Hedef', ydt: 'YKS-Dil (Üniversite Dil Bölümleri — Ortak)', yds: 'Tek ortak sınav (Kamu + Akademik)', yokdil: '3 ayrı alan: Sağlık, Fen, Sosyal Bilimler' },
  { label: 'Çeviri Ağırlığı', ydt: '12 soru (6 İ→T, 6 T→İ) — hızlı net kaynağı', yds: '6 soru (7.5 puan) — kısa ve net avantajı', yokdil: '12 soru (15 puan) — yüksek puan kaynağı' },
  { label: 'Dilbilgisi & Özgün', ydt: '10 Gramer + Situation (5) + Diyalog (5) + Restatement (5)', yds: '10 Gramer + Diyalog (5) + Restatement (4) — Situation YOK', yokdil: '14 Gramer (Situation, Diyalog ve Restatement YOK)' },
  { label: 'Reading (Okuma)', ydt: '15 soru (5 parça × 3) — hızlı tempolu okuma', yds: '20 soru (5 parça × 4) — yoğun akademik çıkarım', yokdil: '15 soru (5 parça × 3) — alana özgü doğrudan bilgi' },
  { label: 'Geçerlilik', ydt: 'Üniversite yerleştirme (TYT %40 + YDT %60)', yds: 'Akademik + Dil tazminatı + Kamu (KPDS eşdeğer)', yokdil: 'Yüksek lisans, Doktora, Doçentlik (Akademik)' },
];

const COACH_PLAYBOOK = [
  {
    id: 'translation',
    badge: 'GARANTİ NET',
    title: 'Çeviri Sorularında Tam Net Taktiği (YÖKDİL: 12 Soru / YDS: 6 Soru)',
    summary: 'Çeviri sorularını baştan sona okumak yerine "Özne + Ana Yüklem + Bağlaç" üçlüsüyle 25 saniyede çöz.',
    steps: [
      '1. Önce cümledeki ana bağlacı bul (Although = -e rağmen, Because = için, Whereas = oysa). Bağlacı uymayan şıkları anında ele.',
      '2. Ana cümlenin yüklemini (fiil zamanı ve etken/edilgenlik) kontrol et. "has been shown" → "gösterilmiştir", "can lead to" → "yol açabilir".',
      '3. Özne öbeğini (which/that ile nitelenen isim) birebir kontrol et; sıfat tamlamasının yerini değiştiren çeldiricilere dikkat et.'
    ]
  },
  {
    id: 'conjunctions',
    badge: 'ALTIN KURAL',
    title: 'Bağlaç & Edat Ayrımı: Cümle Alanlar vs. İsim Alanlar',
    summary: 'YDS ve YÖKDİL’in neredeyse %25’i doğrudan veya dolaylı olarak bağlaç mantığına dayanır.',
    steps: [
      'Tam Cümle (S + V) alanlar: although, even though, whereas, while, since, provided that, unless, so that.',
      'İsim / V-ing (Noun Phrase) alanlar: despite, in spite of, due to, owing to, because of, regardless of, in terms of.',
      'İki cümle arası noktalı virgül/nokta ile gelen zarf bağlaçlar: however, nevertheless, nonetheless, therefore, consequently, moreover.'
    ]
  },
  {
    id: 'reading',
    badge: 'HIZ & DOĞRULUK',
    title: 'Reading (Okuma Parçaları) 3 Adımlı Çözüm Protokolü',
    summary: 'YDS’de 20 soru, YÖKDİL’de 15 soru ile sınavın kaderini belirleyen bölüm.',
    steps: [
      '1. Önce soru köklerini hızlıca tara (anahtar isim, tarih, sebep, "according to the passage", "it can be inferred" ayrımını yap).',
      '2. Paragrafı okurken zıtlık kelimelerinin (but, however, yet, paradoxically) hemen ardından gelen cümlelerin altını çiz — soruların %60’ı buradan gelir.',
      '3. "always, never, solely, completely, all" gibi aşırı genelleme içeren şıklara şüpheyle yaklaş; paragrafta açıkça yazmıyorsa ele.'
    ]
  },
  {
    id: 'cloze',
    badge: 'İNCE AYAR',
    title: 'Cloze Test & Paragraf Tamamlama Köprü Tekniği',
    summary: 'Boşluk sorularında sadece boşluğun olduğu satıra değil, önceki ve sonraki cümle köprüsüne bak.',
    steps: [
      'Cloze Testte 5 sorunun dağılımı genelde şöyledir: 1 Kelime, 1 Tense/Passive/Modal, 1 Preposition, 1 Bağlaç, 1 Relative/Noun Clause.',
      'Paragraf tamamlamada boşluktan hemen sonraki cümlede "This problem", "However", "For instance" varsa doğru şık o referansı tanımlamak zorundadır.',
      'Anlam bozan cümlede 1. cümle ile 2. cümleyi kıyasla; ikisi uyumluysa konunun yönünü değiştiren cümleyi bul.'
    ]
  },
  {
    id: 'ydt_speed',
    badge: 'YDT (YKS-DİL) ÖZEL',
    title: '120 Dakika Hız, Situation & Net Koruma Taktiği',
    summary: 'YDT’de YDS/YÖKDİL’e göre 60 dakika daha az süren var (soru başı 1.5 dk) ve 4 yanlış 1 doğruyu götürür.',
    steps: [
      'İlk 25 dakikada Kelime (5) + Dilbilgisi (10) + Çeviri (12) bloklarını hızlıca tamamla; Reading ve Yakın Anlam için vakit biriktir.',
      'YDT’ye özgü "Verilen Durum (Situation)" sorularında "you / your friend" rolünü, üslubu (özür, rica, uyarı, sitem) ve niyeti çiz; aşırı kaba ya da konu dışı şıkları ele.',
      'Hiç fikrin olmayan soruyu ASLA sallama (4 yanlış = -1 net); sadece güçlü şekilde 2 şıkka indirebildiğin sorularda mantıklı tercih yap.'
    ]
  }
];

// High-yield exam-specific word packs (compatible with UNITS fallback unit index 1..10)
const EXAM_WORD_PACKS = {
  yokdil_saglik: {
    id: 'yokdil_saglik',
    title: 'YÖKDİL Sağlık Bilimleri',
    shortTitle: 'YÖKDİL Sağlık',
    badge: 'TIP & SAĞLIK',
    accent: '#2A9D8F',
    desc: 'Hastalık, tedavi, klinik araştırma, semptom ve anatomi odaklı yüksek frekanslı kelimeler.',
    words: [
      ['symptom', 'belirti, semptom', 'Fever is a common symptom of infection.', 7],
      ['prevalence', 'yaygınlık, görülme sıklığı', 'The prevalence of obesity has risen globally.', 3],
      ['diagnose', 'teşhis etmek, tanı koymak', 'Doctors diagnosed the condition at an early stage.', 5],
      ['chronic', 'kronik, süreğen', 'Chronic illnesses require long-term management.', 7],
      ['alleviate', 'hafifletmek, dindirmek', 'The medication helps alleviate severe pain.', 4],
      ['contagious', 'bulaşıcı', 'Measles is a highly contagious viral disease.', 7],
      ['susceptible', 'duyarlı, yatkın, hassas', 'Elderly patients are more susceptible to complications.', 9],
      ['hereditary', 'kalıtsal, genetik', 'Colour blindness is often a hereditary trait.', 6],
      ['deficiency', 'eksiklik, yetersizlik', 'Iron deficiency can cause severe fatigue.', 1],
      ['administer', 'uygulamak, vermek (ilaç)', 'Nurses administer the vaccine twice a year.', 6],
      ['complication', 'komplikasyon, yan etki', 'Early surgery prevents serious complications.', 7],
      ['immune', 'bağışık, bağışıklıkla ilgili', 'Vitamin C supports the immune system.', 9],
      ['prognosis', 'hastalığın seyri, öngörü', 'With early therapy, the prognosis is favourable.', 7],
      ['dosage', 'doz, ilaç miktarı', 'Do not exceed the recommended daily dosage.', 5],
      ['malnutrition', 'yetersiz beslenme', 'Malnutrition weakens childhood immunity.', 9],
      ['outbreak', 'salgın, patlak verme', 'Health officials contained the viral outbreak.', 7],
      ['preventive', 'önleyici, koruyucu', 'Preventive medicine reduces hospital admissions.', 9],
      ['recovery', 'iyileşme, nekahat', 'Post-operative recovery took three weeks.', 7],
      ['transplantation', 'organ nakli', 'Advances in transplantation have saved millions.', 4],
      ['adverse', 'olumsuz, zararlı (yan etki)', 'Check the leaflet for adverse drug reactions.', 6],
      ['lethal', 'ölümcül', 'Without treatment, the toxin can be lethal.', 5],
      ['rehabilitation', 'rehabilitasyon, iyileştirme', 'Physical rehabilitation restored joint mobility.', 7],
      ['artery', 'atardamar', 'Cholesterol buildup can narrow the coronary artery.', 6],
      ['digestion', 'sindirim', 'Dietary fibre improves healthy digestion.', 5],
      ['insomnia', 'uykusuzluk', 'Chronic insomnia impairs daytime concentration.', 5]
    ]
  },
  yokdil_fen: {
    id: 'yokdil_fen',
    title: 'YÖKDİL Fen Bilimleri',
    shortTitle: 'YÖKDİL Fen',
    badge: 'FEN & MÜHENDİSLİK',
    accent: '#3B82A6',
    desc: 'Fizik, kimya, biyoloji, çevre, astronomi ve mühendislik metinlerinin temel söz varlığı.',
    words: [
      ['particle', 'parçacık, tanecik', 'Subatomic particles move at extreme speeds.', 7],
      ['dissolve', 'çözünmek, erimek', 'Salt dissolves rapidly in warm water.', 7],
      ['emission', 'salınım, emisyon', 'Cities aim to cut carbon emissions by half.', 3],
      ['altitude', 'irtifa, yükseklik', 'Oxygen density decreases at high altitude.', 5],
      ['eruption', 'patlama (yanardağ)', 'The volcanic eruption disrupted air travel.', 7],
      ['gravity', 'yerçekimi', 'Gravity keeps planets in stable orbits.', 3],
      ['accelerate', 'hızlandırmak, ivmelenmek', 'Warming oceans accelerate glacier melting.', 2],
      ['density', 'yoğunluk, özkütle', 'Ice floats because its density is lower than water.', 5],
      ['friction', 'sürtünme', 'Lubricants reduce friction between metal parts.', 8],
      ['habitat', 'doğal yaşam alanı', 'Wetlands provide a vital habitat for birds.', 9],
      ['extinct', 'nesli tükenmiş', 'Dinosaurs became extinct millions of years ago.', 8],
      ['diameter', 'çap', 'Mars has roughly half the diameter of Earth.', 10],
      ['solar', 'güneş ile ilgili', 'Solar panels convert sunlight into electricity.', 10],
      ['ecological', 'ekolojik, çevresel', 'Deforestation threatens the ecological balance.', 3],
      ['contamination', 'kirlenme, kontaminasyon', 'Industrial waste caused groundwater contamination.', 8],
      ['conduct', 'iletmek (ısı/elektrik)', 'Copper conducts electricity efficiently.', 6],
      ['synthetic', 'yapay, sentetik', 'Synthetic polymers replaced natural rubber.', 9],
      ['velocity', 'hız, sürat (vektörel)', 'The spacecraft reached escape velocity.', 6],
      ['conservation', 'koruma (doğa/enerji)', 'Energy conservation lowers utility costs.', 9],
      ['accurate', 'doğru, hassas, isabetli', 'The sensor provides accurate measurements.', 4],
      ['modification', 'değişiklik, modifikasyon', 'Genetic modification increased crop yield.', 5],
      ['decay', 'çürümek, bozunmak (radyoaktif)', 'Radioactive isotopes decay at fixed rates.', 5],
      ['species', 'tür (biyolojik)', 'Researchers discovered a new marine species.', 3],
      ['infrastructure', 'altyapı', 'Modern rail infrastructure reduces emissions.', 5],
      ['hazardous', 'tehlikeli, zararlı', 'Hazardous chemicals require sealed storage.', 10]
    ]
  },
  yokdil_sosyal: {
    id: 'yokdil_sosyal',
    title: 'YÖKDİL Sosyal Bilimler',
    shortTitle: 'YÖKDİL Sosyal',
    badge: 'SOSYAL & TARİH',
    accent: '#B97745',
    desc: 'Tarih, sosyoloji, psikoloji, ekonomi, hukuk ve felsefe parçalarında en sık çıkan kavramlar.',
    words: [
      ['civilisation', 'uygarlık, medeniyet', 'Mesopotamia gave rise to early urban civilisation.', 5],
      ['heritage', 'miras, kültürel miras', 'Protecting cultural heritage is a global duty.', 7],
      ['discrimination', 'ayrımcılık', 'Laws prohibit workplace discrimination.', 3],
      ['solidarity', 'dayanışma', 'Communities showed remarkable solidarity.', 2],
      ['prejudice', 'önyargı', 'Education helps overcome social prejudice.', 7],
      ['legislation', 'yasama, kanun', 'New legislation strengthened consumer rights.', 4],
      ['prosperity', 'refah, zenginlik', 'Trade routes brought economic prosperity.', 4],
      ['sovereignty', 'egemenlik, bağımsızlık', 'The treaty recognized national sovereignty.', 4],
      ['migration', 'göç, göç hareketi', 'Economic shifts triggered mass migration.', 5],
      ['expenditure', 'harcama, gider', 'Public expenditure on education rose steadily.', 6],
      ['ethics', 'etik, ahlak ilkeleri', 'Journalism relies on strict professional ethics.', 3],
      ['conformity', 'uyum, kurallara uyma', 'Peer pressure often encourages social conformity.', 8],
      ['republic', 'cumhuriyet', 'The republic was founded in 1923.', 4],
      ['verdict', 'karar, hüküm (mahkeme)', 'The jury reached a unanimous verdict.', 7],
      ['inequality', 'eşitsizlik', 'Income inequality remains a key debate.', 7],
      ['ideology', 'ideoloji, fikir sistemi', 'Political ideology shaped nineteenth-century art.', 9],
      ['constitution', 'anayasa, yapı', 'The constitution guarantees freedom of speech.', 9],
      ['bureaucracy', 'bürokrasi', 'Reforms aimed to simplify state bureaucracy.', 7],
      ['rebellion', 'isyan, ayaklanma', 'Heavy taxation sparked a regional rebellion.', 7],
      ['ancestor', 'ata, cet', 'Archaeologists studied tools made by our ancestors.', 10],
      ['unemployment', 'işsizlik', 'Automation affected regional unemployment rates.', 7],
      ['privilege', 'ayrıcalık, imtiyaz', 'Education should be a right, not a privilege.', 8],
      ['persuasion', 'ikna, inandırma', 'Rhetoric is the art of effective persuasion.', 4],
      ['custom', 'gelenek, görenek', 'Local customs vary across the region.', 8],
      ['welfare', 'refah, sosyal yardım', 'Social welfare programs support vulnerable groups.', 8]
    ]
  },
  yds_akademik: {
    id: 'yds_akademik',
    title: 'YDS Yüksek Frekanslı Akademik',
    shortTitle: 'YDS Akademik',
    badge: 'YDS ÇEKİRDEK',
    accent: '#628141',
    desc: 'YDS’de seçeneklerde ve okuma parçalarında sürekli karşına çıkan akademik fiil, sıfat ve zarflar.',
    words: [
      ['inevitable', 'kaçınılmaz', 'Technological transformation is inevitable.', 2],
      ['coherent', 'tutarlı, mantıklı', 'She presented a coherent economic argument.', 2],
      ['contradict', 'çelişmek, aksini söylemek', 'The new findings contradict earlier studies.', 1],
      ['reluctant', 'isteksiz, gönülsüz', 'Investors were reluctant to fund risky startups.', 8],
      ['mitigate', 'hafifletmek, azaltmak', 'Trees help mitigate urban heat islands.', 4],
      ['ubiquitous', 'her yerde bulunan, yaygın', 'Smartphones have become ubiquitous in modern life.', 3],
      ['ambiguous', 'belirsiz, muğlak', 'The contract contained several ambiguous clauses.', 8],
      ['empirical', 'deneysel, gözleme dayalı', 'The claim lacks empirical evidence.', 6],
      ['undermine', 'baltalamak, zayıflatmak', 'Rumours can undermine public trust.', 2],
      ['plausible', 'makul, akla yatkın', 'That is the most plausible explanation so far.', 6],
      ['profound', 'derin, köklü, kapsamlı', 'The printing press had a profound impact.', 4],
      ['fluctuate', 'dalgalanmak, inip çıkmak', 'Currency rates fluctuate daily.', 8],
      ['discrepancy', 'tutarsızlık, uyuşmazlık', 'There was a discrepancy between the two reports.', 1],
      ['scrutinize', 'titizlikle incelemek', 'Auditors scrutinize every financial statement.', 1],
      ['obsolete', 'modası geçmiş, kullanılmayan', 'Floppy disks are now completely obsolete.', 3],
      ['simultaneously', 'eş zamanlı olarak', 'Both experiments ran simultaneously.', 3],
      ['detrimental', 'zararlı, yıkıcı', 'Sleep deprivation has detrimental effects.', 2],
      ['indispensable', 'vazgeçilmez, zorunlu', 'Clean water is indispensable for public health.', 3],
      ['comprehensive', 'kapsamlı, ayrıntılı', 'The report offers a comprehensive overview.', 6],
      ['arbitrary', 'keyfi, rastgele', 'Decisions should be data-driven, not arbitrary.', 5],
      ['deteriorate', 'kötüleşmek, bozulmak', 'Air quality deteriorated during winter.', 5],
      ['subtle', 'ince, gizli, zor fark edilen', 'There is a subtle difference between the two terms.', 1],
      ['hypothesis', 'hipotez, varsayım', 'The experiment tested the initial hypothesis.', 7],
      ['implication', 'çıkarım, ima, olası sonuç', 'Consider the long-term implications of this policy.', 8],
      ['ultimately', 'nihayetinde, eninde sonunda', 'Ultimately, consistency determines exam success.', 3]
    ]
  },
  baglac_ustasi: {
    id: 'baglac_ustasi',
    title: 'Altın Bağlaçlar & Prepositions',
    shortTitle: 'Bağlaç & Edat',
    badge: '+20 NET ANAHTARI',
    accent: '#0F766E',
    desc: 'Dilbilgisi, Cloze Test ve Cümle Tamamlamada en çok kazandıran bağlaçlar ve edat öbekleri.',
    words: [
      ['nevertheless', 'buna rağmen, yine de (zıtlık)', 'It was raining; nevertheless, they continued.', 2],
      ['whereas', 'oysa, -e karşılık (karşılaştırma)', 'Cities grow rapidly, whereas rural areas shrink.', 4],
      ['inasmuch as', '-dığı için, madem ki (sebep)', 'Inasmuch as funds were limited, plans changed.', 5],
      ['notwithstanding', '-e rağmen (isimle kullanılır)', 'Notwithstanding the delay, the project succeeded.', 1],
      ['provided that', '-mesi şartıyla, koşuluyla', 'You can borrow it provided that you return it.', 10],
      ['consequently', 'sonuç olarak, bu nedenle', 'Demand fell; consequently, prices dropped.', 8],
      ['by means of', 'aracılığıyla, vasıtasıyla', 'Data is transmitted by means of optical fibres.', 4],
      ['in terms of', 'bakımından, açısından', 'The plan is efficient in terms of cost.', 6],
      ['with respect to', 'ile ilgili olarak, açısından', 'Rules differ with respect to age groups.', 6],
      ['prior to', '-den önce (isim/V-ing)', 'Sign the form prior to your departure.', 4],
      ['stem from', '-den kaynaklanmak', 'Many errors stem from hasty reading.', 3],
      ['account for', 'açıklamak; oranını oluşturmak', 'Renewables account for 30% of output.', 6],
      ['adhere to', 'bağlı kalmak, uymak', 'Researchers must adhere to ethical guidelines.', 1],
      ['attribute to', '-e bağlamak, atfetmek', 'They attributed the rise to better nutrition.', 10],
      ['result in', 'ile sonuçlanmak, yol açmak', 'Neglect can result in costly repairs.', 4],
      ['on the contrary', 'tam aksine', 'It wasn’t boring; on the contrary, it was thrilling.', 2],
      ['regardless of', '-e bakılmaksızın', 'Everyone is welcome regardless of background.', 6],
      ['in contrast to', '-nın aksine, zıddına', 'In contrast to last year, rainfall was abundant.', 4],
      ['owing to', '-den dolayı (isimle)', 'The flight was cancelled owing to thick fog.', 8],
      ['lest', '-mesin diye, korkusuyla', 'Speak quietly lest you wake the patient.', 1]
    ]
  },
  ydt_yks: {
    id: 'ydt_yks',
    title: 'YDT (YKS-Dil) Yüksek Frekans',
    shortTitle: 'YDT (YKS-Dil)',
    badge: 'YDT · 80 Soru / 120 Dk',
    accent: '#9C27B0',
    desc: 'ÖSYM YDT sınavlarında sık çıkan fiil, sıfat, zarf, durum kalıpları ve phrasal verbleri içeren hızlandırılmış paket.',
    words: [
      ['accomplish', 'başarmak, üstesinden gelmek', 'Students need regular practice to accomplish fluency in English.', 1],
      ['acquire', 'edinmek, kazanmak', 'Children acquire their native language naturally through exposure.', 1],
      ['ambiguous', 'belirsiz, muğlak, iki anlamlı', 'His ambiguous reply left everyone confused about the plan.', 4],
      ['anticipate', 'ummak, önceden görmek', 'Organizers anticipate a large turnout for the language fair.', 2],
      ['cease', 'durmak, sona ermek, kesmek', 'The loud construction work finally ceased around midnight.', 5],
      ['comprehend', 'kavramak, anlamak', 'Reading slowly helps you comprehend complex passages.', 1],
      ['controversial', 'tartışmalı', 'Artificial intelligence in schools remains a controversial issue.', 6],
      ['crucial', 'çok önemli, kritik', 'Time management is crucial in a 120-minute exam like YDT.', 2],
      ['dedicate', 'adamak, tahsis etmek', 'She dedicated her summer holiday to solving past papers.', 3],
      ['deprive of', 'mahrum bırakmak', 'Lack of sleep can deprive students of sharp focus.', 7],
      ['deteriorate', 'kötüleşmek, bozulmak', 'Road conditions deteriorated rapidly after the heavy snow.', 5],
      ['emerge', 'ortaya çıkmak, belirmek', 'New learning apps continue to emerge every year.', 4],
      ['emphasize', 'vurgulamak, altını çizmek', 'Teachers emphasize the value of guessing from context.', 1],
      ['exhausted', 'bitkin, tükenmiş', 'After two mock exams in a row, the candidates felt exhausted.', 6],
      ['fluctuate', 'dalgalanmak, inip çıkmak', 'Exam cut-off ranks may fluctuate slightly each year.', 5],
      ['hesitate', 'tereddüt etmek', 'Do not hesitate to skip a hard question and save your net.', 8],
      ['indifferent', 'kayıtsız, ilgisiz', 'He remained indifferent to the noise outside the library.', 7],
      ['inevitable', 'kaçınılmaz', 'Making mistakes at the beginning is an inevitable part of learning.', 2],
      ['peculiar', 'tuhaf, kendine özgü', 'Each region has its own peculiar traditions and idioms.', 4],
      ['reluctant', 'isteksiz, gönülsüz', 'Many learners are reluctant to speak aloud in class.', 7],
      ['scarce', 'kıt, az bulunan', 'Fresh water resources are becoming scarce in dry regions.', 9],
      ['subtle', 'ince, hemen fark edilmeyen', 'There is a subtle difference between "say" and "tell".', 4],
      ['put off', 'ertelemek (postpone)', 'Never put off reviewing your error notebook until the last week.', 10],
      ['come across', 'tesadüfen karşılaşmak / rastlamak', 'You will come across many phrasal verbs in YDT dialogues.', 10]
    ]
  },
  ydt_diyalog_phrasal: {
    id: 'ydt_diyalog_phrasal',
    title: 'YDT Diyalog, Situation & Phrasal Verbs',
    shortTitle: 'YDT Diyalog & Situation',
    badge: 'YDT · +10 NET',
    accent: '#E91E63',
    desc: 'YKS-Dil Diyalog Tamamlama, Verilen Durum (Situation) ve günlük deyim/phrasal verb soruları için özel hazırlanmış 24 kalıp.',
    words: [
      ['make up for', 'telafi etmek', 'I will work extra hours to make up for the missed lesson.', 10],
      ['figure out', 'çözmek, anlamak', 'Did you figure out why the passage contradicts paragraph 1?', 10],
      ['turn down', 'reddetmek; sesini kısmak', 'She had to turn down the scholarship offer due to health issues.', 10],
      ['call off', 'iptal etmek', 'They called off the outdoor picnic because of heavy rain.', 10],
      ['get along with', 'iyi geçinmek', 'Fortunately, all roommates get along with each other.', 10],
      ['look up to', 'saygı duymak, örnek almak', 'Many young translators look up to experienced interpreters.', 10],
      ['put up with', 'katlanmak, tahammül etmek', 'How do you put up with that constant street noise?', 10],
      ['run out of', 'tüketmek, bitmek', 'If we run out of time on reading, focus on main-idea items first.', 10],
      ['carry out', 'yürütmek, gerçekleştirmek', 'Linguists carried out a survey among bilingual teenagers.', 3],
      ['bring about', 'sebep olmak, yol açmak', 'Regular mock tests bring about a noticeable jump in net scores.', 4],
      ['take into account', 'göz önünde bulundurmak', 'You should take your TYT score into account while planning targets.', 2],
      ['out of the question', 'kesinlikle imkânsız', 'Skipping half the reading section is out of the question.', 6],
      ['beats me', 'hiçbir fikrim yok (konuşma dili)', '"Why was the test postponed?" — "Beats me, nobody emailed us."', 8],
      ['count on', 'güvenmek, bel bağlamak', 'You can count on my notes if you missed yesterday’s grammar class.', 10],
      ['for the time being', 'şimdilik, geçici olarak', 'For the time being, keep a separate notebook for wrong choices.', 5],
      ['in no time', 'anında, hemen', 'With daily repetition, you will recognize signal words in no time.', 4],
      ['keep an eye on', 'göz kulak olmak', 'Could you keep an eye on the clock during our timed mock exam?', 7],
      ['make sense', 'mantıklı gelmek', 'After checking the conjunction, Option B suddenly makes sense.', 1],
      ['no wonder', 'şaşmamalı, belli ki', 'He studied 40 words daily; no wonder he reached 74 YDT net.', 2],
      ['on the tip of one’s tongue', 'dilinin ucunda olmak', 'I know that synonym—it is right on the tip of my tongue!', 6],
      ['see eye to eye', 'aynı fikirde olmak', 'Both teachers see eye to eye on prioritizing translation drills.', 7],
      ['sooner or later', 'er ya da geç', 'Sooner or later, disciplined reading pays off in net gains.', 3],
      ['under the weather', 'keyifsiz / biraz hasta hissetmek', 'I feel a bit under the weather, so let us postpone the study session.', 8],
      ['you should have known better', 'daha dikkatli olmalıydın (sitem)', 'You should have known better than guessing blindly without eliminating.', 9]
    ]
  }
};

const EXAM_CHEATSHEETS = [
  {
    title: 'YDT Situation & Diyalog Altın Kalıpları',
    items: [
      'Sitem / Pişmanlık: "You shouldn’t have...", "If only I had...", "You could have told me earlier"',
      'Nazik Reddetme: "I’d love to, but...", "Unfortunately I can’t make it", "That won’t be possible"',
      'Tahmin / Bilgisizlik: "Beats me!", "Your guess is as good as mine", "I have no clue"',
      'Tavsiye / Uyarı: "You’d better...", "Watch out for...", "Make sure you..."'
    ]
  },
  {
    title: 'Zıtlık, Koşul & Sebep Bağlaç Özeti',
    items: [
      'Cümle (+S+V): although, even though, though, whereas, while, unless, provided that, since',
      'İsim / V-ing (+NP): despite, in spite of, due to, owing to, because of, regardless of',
      'Zarf (. / ; ... ,): however, nevertheless, nonetheless, therefore, consequently, moreover',
      'Dikkat Tuzağı: "unless" = if ... not; içinde ikinci bir olumsuzluk varsa anlamı bozar!'
    ]
  },
  {
    title: 'En Sık Çıkan Preposition Eşleşmeleri',
    items: [
      'from: stem from, suffer from, prevent/protect from, refrain from, emerge from',
      'to: attribute to, lead to, contribute to, vulnerable to, prone to, adhere to, prior to',
      'of / with / in: be composed of, deprive of, cope with, comply with, result in (≠ result from)',
      'Sıfat + Edat: indifferent to, keen on, obsessed with, capable of, responsible for'
    ]
  },
  {
    title: 'YDT Net Koruma & Çeviri Kısayolları',
    items: [
      '4 yanlış = 1 doğru siler! Hiç fikrin olmayan 4 soruyu boş bırakmak +1.0 net kazandırır.',
      'Çeviride önce ÖZNE + ANA YÜKLEM (aktif/pasif + kip) + BAĞLAÇ eşle; şıkların %80’i ilk adımda elenir.',
      'Restatement (Yakın Anlam) sorularında "only, hardly, few, almost" derecesi mutlaka korunmalıdır.',
      'Paragraf tamamlamada boşluk sonrası "This issue / Such measures" zamirlerini önceki cümleye bağla.'
    ]
  }
];

const MOCK_TRIALS_KEY = 'fdil_mock_trials_v1';

let _coachActiveTab = 'overview';
let _coachCalcScore = 70;
let _coachYdtNet = 65;
let _coachTytNet = 70;
let _coachObp = 85;
let _coachSimCorrect = 68;
let _coachSimWrong = 12;
let _coachSelectedExam = null;

function getMockTrials() {
  try {
    const arr = JSON.parse(localStorage.getItem(MOCK_TRIALS_KEY) || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

function saveMockTrials(list) {
  localStorage.setItem(MOCK_TRIALS_KEY, JSON.stringify(list));
  if (typeof syncActiveUserStats === 'function') syncActiveUserStats();
}

function calcYdtNet(correct, wrong) {
  const c = Math.max(0, Math.min(80, Number(correct) || 0));
  const w = Math.max(0, Math.min(80 - c, Number(wrong) || 0));
  return Math.round((c - w / 4) * 100) / 100;
}

function estimateYksDilStats(ydtNet, tytNet, obp) {
  const yNet = Math.max(0, Math.min(80, Number(ydtNet) || 0));
  const tNet = Math.max(0, Math.min(120, Number(tytNet) || 0));
  const obpVal = Math.max(50, Math.min(100, Number(obp) || 85));
  // Yaklaşık YKS-Dil Yerleştirme Tahmini (bilgilendirme amaçlı rehber bant)
  const rawScore = 100 + (yNet / 80) * 240 + (tNet / 120) * 160;
  const placement = Math.min(560, Math.round(rawScore + obpVal * 0.6));
  let rankBand = '45.000+ · Temel Yükseliş Bandı';
  let tierDesc = 'Kelime + Gramer + Çeviri temelini güçlendirerek hızla İlk 25 bine çıkabilirsin.';
  if (placement >= 475 || (yNet >= 73 && tNet >= 82)) {
    rankBand = 'İlk 1.500 – 4.000 · Elit Band';
    tierDesc = 'Boğaziçi, ODTÜ, İTÜ/Bilkent burslu Dilbilim, Çeviribilim ve Öğretmenlik bandı.';
  } else if (placement >= 435 || (yNet >= 66 && tNet >= 68)) {
    rankBand = '4.000 – 12.000 · Yüksek Derece';
    tierDesc = 'Hacettepe, Gazi, İstanbul, Ege, Marmara Mütercim ve İngilizce Öğretmenliği bandı.';
  } else if (placement >= 390 || yNet >= 56) {
    rankBand = '12.000 – 28.000 · Güçlü Yerleştirme';
    tierDesc = 'Devlet üniversiteleri İngiliz Dili ve Edebiyatı / Öğretmenlik bölümleri için güçlü bant.';
  } else if (placement >= 340 || yNet >= 44) {
    rankBand = '28.000 – 50.000 · Gelişim Bandı';
    tierDesc = 'Yanlış sayısını azaltıp Çeviri + Diyalog + Situation netlerini toplayarak sıçrama yapabilirsin.';
  }
  return { placement, rankBand, tierDesc };
}

function _getCoachExamKey() {
  if (_coachSelectedExam && EXAM_SPECS[_coachSelectedExam]) return _coachSelectedExam;
  const p = typeof getActiveProfile === 'function' ? getActiveProfile() : null;
  if (p && p.examType === 'YDT') return 'YDT';
  if (p && p.examType === 'YDS') return 'YDS';
  return 'YOKDIL';
}

function getExamCountdownInfo() {
  const p = typeof getActiveProfile === 'function' ? getActiveProfile() : null;
  const dateStr = p && p.examDate ? p.examDate : '';
  if (!dateStr) return { daysLeft: null, label: 'Tarih seçilmedi' };
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diff = Math.ceil((target - now) / 86400000);
  if (isNaN(diff)) return { daysLeft: null, label: 'Tarih seçilmedi' };
  if (diff < 0) return { daysLeft: 0, label: 'Sınav günü geçti' };
  if (diff === 0) return { daysLeft: 0, label: 'Bugün Sınav!' };
  return { daysLeft: diff, label: `${diff} gün kaldı` };
}

function _getRecommendedPackId() {
  const p = typeof getActiveProfile === 'function' ? getActiveProfile() : null;
  if (!p) return 'yokdil_saglik';
  if (p.examType === 'YDT' || p.examBranch === 'ydt_dil') return 'ydt_yks';
  if (p.examType === 'YDS') return 'yds_akademik';
  if (p.examBranch === 'fen') return 'yokdil_fen';
  if (p.examBranch === 'sosyal') return 'yokdil_sosyal';
  if (p.examBranch === 'saglik') return 'yokdil_saglik';
  return 'yds_akademik';
}

function showExamCoach(tab) {
  if (tab) _coachActiveTab = tab;
  const p = typeof getActiveProfile === 'function' ? getActiveProfile() : null;
  if (p && !tab) {
    if (p.targetScore) _coachCalcScore = p.targetScore;
    if (p.targetYdtNet) _coachYdtNet = p.targetYdtNet;
    if (p.targetTytNet) _coachTytNet = p.targetTytNet;
    if (p.obpScore) _coachObp = p.obpScore;
  }
  renderExamCoach();
  showScreen('screen-coach');
}

function setCoachTab(tab) {
  _coachActiveTab = tab;
  renderExamCoach();
}

function setCoachExamView(examKey) {
  _coachSelectedExam = examKey;
  renderExamCoach();
}

function updateCoachScoreCalc(val) {
  _coachCalcScore = parseInt(val, 10) || 70;
  const box = document.getElementById('coach-roadmap-result');
  if (box) box.innerHTML = _renderRoadmapResultHTML(_coachCalcScore);
  const label = document.getElementById('coach-score-slider-val');
  if (label) label.textContent = `${_coachCalcScore} Puan`;
}

function updateCoachYdtSim() {
  const ydtInp = document.getElementById('coach-ydt-net-slider');
  const tytInp = document.getElementById('coach-tyt-net-slider');
  const obpInp = document.getElementById('coach-obp-inp');
  if (ydtInp) _coachYdtNet = Math.max(30, Math.min(80, parseFloat(ydtInp.value) || 65));
  if (tytInp) _coachTytNet = Math.max(20, Math.min(120, parseFloat(tytInp.value) || 70));
  if (obpInp) _coachObp = Math.max(50, Math.min(100, parseFloat(obpInp.value) || 85));

  const ydtLbl = document.getElementById('coach-ydt-slider-val');
  const tytLbl = document.getElementById('coach-tyt-slider-val');
  if (ydtLbl) ydtLbl.textContent = `${_coachYdtNet} / 80 Net`;
  if (tytLbl) tytLbl.textContent = `${_coachTytNet} / 120 Net`;

  const box = document.getElementById('coach-roadmap-result');
  if (box) box.innerHTML = _renderRoadmapResultHTML(_coachCalcScore);
}

function updateCoachDyCalc() {
  const dInp = document.getElementById('coach-sim-d');
  const wInp = document.getElementById('coach-sim-w');
  let d = dInp ? Math.max(0, Math.min(80, parseInt(dInp.value, 10) || 0)) : _coachSimCorrect;
  let w = wInp ? Math.max(0, Math.min(80 - d, parseInt(wInp.value, 10) || 0)) : _coachSimWrong;
  _coachSimCorrect = d;
  _coachSimWrong = w;
  if (wInp && Number(wInp.value) !== w) wInp.value = w;
  const net = calcYdtNet(d, w);
  const loss = Math.round((w / 4) * 100) / 100;
  const netEl = document.getElementById('coach-dy-net-out');
  const lossEl = document.getElementById('coach-dy-loss-out');
  if (netEl) netEl.textContent = `${net} Net`;
  if (lossEl) lossEl.textContent = loss > 0 ? `-${loss} net kaybı (${80 - d - w} boş)` : `${80 - d - w} boş · 0 kayıp`;
}

function addMockTrialFromForm() {
  const examEl = document.getElementById('trial-exam');
  const nameEl = document.getElementById('trial-name');
  const dEl = document.getElementById('trial-correct');
  const wEl = document.getElementById('trial-wrong');
  const tytEl = document.getElementById('trial-tyt');
  const minsEl = document.getElementById('trial-mins');
  const weakEl = document.getElementById('trial-weak');

  const exam = examEl ? examEl.value : _getCoachExamKey();
  const title = (nameEl && nameEl.value.trim()) || `${exam} Deneme #${getMockTrials().length + 1}`;
  const correct = Math.max(0, Math.min(80, parseInt(dEl?.value, 10) || 0));
  const wrong = Math.max(0, Math.min(80 - correct, parseInt(wEl?.value, 10) || 0));
  const blank = Math.max(0, 80 - correct - wrong);
  const tytNet = exam === 'YDT' ? Math.max(0, Math.min(120, parseFloat(tytEl?.value) || 0)) : null;
  const duration = Math.max(10, Math.min(240, parseInt(minsEl?.value, 10) || (exam === 'YDT' ? 120 : 180)));
  const weakSection = weakEl ? weakEl.value : 'Reading / Okuma';

  const isYdt = exam === 'YDT';
  const net = isYdt ? calcYdtNet(correct, wrong) : correct;
  const score = Math.round(net * 1.25 * 100) / 100;
  const lostNet = isYdt ? Math.round((wrong / 4) * 100) / 100 : 0;

  const list = getMockTrials();
  list.unshift({
    id: 'tr_' + Date.now().toString(36),
    date: new Date().toISOString().slice(0, 10),
    exam,
    title,
    correct,
    wrong,
    blank,
    net,
    score,
    lostNet,
    tytNet,
    duration,
    weakSection
  });
  saveMockTrials(list.slice(0, 40));
  renderExamCoach();
  if (typeof showToast === 'function') showToast(`Deneme kaydedildi: ${net} Net!`);
}

function deleteMockTrial(id) {
  const list = getMockTrials().filter(t => t.id !== id);
  saveMockTrials(list);
  renderExamCoach();
  if (typeof showToast === 'function') showToast('Deneme kaydı silindi.');
}

function _getWeeklyStudyPlan(examKey, p) {
  if (examKey === 'YDT') {
    const netGoal = p && p.targetYdtNet ? p.targetYdtNet : _coachYdtNet;
    return [
      { day: 'Pazartesi', focus: `30 YDT Kelime + 15 Dilbilgisi (Tense/Modal) + 20 TYT Paragraf` },
      { day: 'Salı', focus: `2 Cloze Test (10 soru) + 16 Cümle Tamamlama (18 dk kronometre ile)` },
      { day: 'Çarşamba', focus: `3 Okuma Parçası (9 soru) + 12 Çeviri Sorusu (Hedef: ≥10 Net)` },
      { day: 'Perşembe', focus: `Situation (5) + Diyalog (5) + Yakın Anlam (10 soru) + Hata Kumbarası` },
      { day: 'Cuma', focus: `YDT Diyalog & Phrasal Verbs Paketi + Anlam Bozan / Paragraf Tamamlama` },
      { day: 'Cumartesi', focus: `TAM SÜRELİ 120 DK YDT DENEMESİ (Hedef ${netGoal} Net) + Yanlış Analizi` },
      { day: 'Pazar', focus: `Denemede boş/yanlış bırakılan kelimeleri Flash Kartla tekrar + Hafif TYT` }
    ];
  }
  const scoreGoal = p && p.targetScore ? p.targetScore : _coachCalcScore;
  return [
    { day: 'Pazartesi', focus: `Alan Kelime Paketi + 20 Bağlaç / Preposition Sorusu` },
    { day: 'Salı', focus: `2 Cloze Test + 15 Cümle Tamamlama + Hata Kumbarası` },
    { day: 'Çarşamba', focus: `3 Akademik Reading Parçası (Zıtlık & Çıkarım vurgulu okuma)` },
    { day: 'Perşembe', focus: `${examKey === 'YDS' ? 'Diyalog & Restatement' : '12 Çeviri Hız Kampı'} + Paragraf Tamamlama` },
    { day: 'Cuma', focus: `Altın Bağlaçlar Paketi + Zaman Kısıtlı Karma Mini Test` },
    { day: 'Cumartesi', focus: `TAM SÜRELİ 180 DK ${examKey} DENEMESİ (Hedef ${scoreGoal} Puan)` },
    { day: 'Pazar', focus: `Deneme yanlışları incelemesi + Hata Defteri & Tekrar Zamanı` }
  ];
}

function _buildTrialDiagnostic(trials, examKey, p) {
  if (!trials.length) {
    return examKey === 'YDT'
      ? 'Henüz kayıtlı YDT denemen yok. İlk denemeni ekle; Badem 4 yanlış / 1 doğru net kaybını ve bölüm teşhisini çıkarsın.'
      : 'Henüz kayıtlı denemen yok. İlk denemeni ekle; Badem puan gelişimini ve zayıf bölümünü analiz etsin.';
  }
  const latest = trials[0];
  const targetVal = examKey === 'YDT' ? (p.targetYdtNet || 65) : Math.ceil((p.targetScore || 70) / 1.25);
  const diff = Math.round((targetVal - latest.net) * 100) / 100;
  const gapMsg = diff <= 0
    ? `Tebrikler! Son denemende (${latest.net} Net) hedefinin <b>+${Math.abs(diff)} Net</b> üzerine çıktın.`
    : `Hedefine (<b>${targetVal} Net</b>) ulaşmak için <b>+${diff} Net</b> daha eklemen gerekiyor.`;
  const penaltyWarn = latest.exam === 'YDT' && latest.wrong >= 10
    ? ` Dikkat: Son denemende <b>${latest.wrong} yanlış</b> sana <b>-${latest.lostNet} Net</b> kaybettirdi — emin olmadan işaretlemeyi yarıya düşürürsen anında <b>+${(latest.lostNet / 2).toFixed(1)} Net</b> kazanırsın!`
    : '';
  return `${gapMsg}${penaltyWarn} Öncelikli çalışma alanı: <b>${esc(latest.weakSection)}</b>.`;
}

function _renderRoadmapResultHTML(targetScore) {
  const examKey = _getCoachExamKey();
  const p = typeof getActiveProfile === 'function' ? getActiveProfile() : {};

  if (examKey === 'YDT') {
    const ydtNet = _coachYdtNet || p.targetYdtNet || 65;
    const tytNet = _coachTytNet || p.targetTytNet || 70;
    const obp = _coachObp || p.obpScore || 85;
    const est = estimateYksDilStats(ydtNet, tytNet, obp);
    const sampleRight = Math.min(80, Math.round(ydtNet + 2));
    const sampleWrong = 8;
    const sampleNet = Math.max(0, sampleRight - 2);

    const b1 = Math.min(15, Math.max(5, Math.round(ydtNet * 0.20)));
    const b2 = Math.min(12, Math.max(6, Math.round(ydtNet * 0.17)));
    const b3 = Math.min(13, Math.max(4, Math.round(ydtNet * 0.17)));
    const b4 = Math.min(15, Math.max(5, Math.round(ydtNet * 0.19)));
    const b5 = Math.min(25, Math.max(1, Math.round(ydtNet) - (b1 + b2 + b3 + b4)));

    const ydtSplit = [
      { sec: 'Kelime + Dilbilgisi (15 Soru · ~15 dk)', target: b1 },
      { sec: 'Çeviri İ→T & T→İ (12 Soru · ~12 dk)', target: b2 },
      { sec: 'Cloze Test + Cümle Tamamlama (13 Soru · ~16 dk)', target: b3 },
      { sec: 'Diyalog + Situation + Yakın Anlam (15 Soru · ~25 dk)', target: b4 },
      { sec: 'Reading + Paragraf + Anlam Bozan (25 Soru · ~52 dk)', target: b5 }
    ];

    const dailyRec = ydtNet >= 72 ? '45 YDT kelimesi + 2 Reading + 12 Çeviri'
      : ydtNet >= 60 ? '30 YDT kelimesi + 1 Reading + Situation/Diyalog'
        : '20 YDT kelimesi + 15 Dilbilgisi/Bağlaç sorusu';

    return `
      <div class="coach-dept-banner">
        ${icon('graduationCap', 14)} Hedef Bölüm: <b>${esc(p.targetDepartment || 'İngilizce Öğretmenliği')}</b> · ${esc(est.tierDesc)}
      </div>
      <div class="coach-calc-summary">
        <div class="coach-calc-stat">
          <span class="coach-calc-lbl">Hedef YDT Neti</span>
          <strong class="coach-calc-val" style="color:var(--accent)">${ydtNet} / 80 Net</strong>
        </div>
        <div class="coach-calc-stat">
          <span class="coach-calc-lbl">Tahmini YKS-Dil</span>
          <strong class="coach-calc-val">~${est.placement} Puan</strong>
        </div>
        <div class="coach-calc-stat">
          <span class="coach-calc-lbl">Tahmini Sıralama</span>
          <strong class="coach-calc-val" style="font-size:12.5px">${est.rankBand}</strong>
        </div>
      </div>
      <div class="coach-calc-note">
        ${icon('sparkles', 14)} Günlük Tempo: <b>${dailyRec}</b> · Örn: <b>${sampleRight}D ${sampleWrong}Y = ${sampleNet} Net</b>. (Tahmini YKS-Dil puanı bilgilendirme amaçlıdır; <b>120 dk</b> ve <b>4 yanlış 1 doğruyu götürür</b> kuralı aktiftir!)
      </div>
      <div class="coach-split-list">
        ${ydtSplit.map(s => `
          <div class="coach-split-item">
            <span>${s.sec}</span>
            <strong>${s.target} Net Hedef</strong>
          </div>
        `).join('')}
      </div>
    `;
  }

  const reqNets = Math.ceil(targetScore / 1.25);
  const safeNets = Math.min(80, reqNets + 3);
  const tier = targetScore >= 85 ? 'Elit / Derece Stratejisi'
    : targetScore >= 70 ? 'Doktora & Doçentlik Bandı'
      : targetScore >= 55 ? 'Yüksek Lisans & Mezuniyet Bandı' : 'Temel Baraj Bandı';

  const split = examKey === 'YDS'
    ? [
        { sec: 'Kelime + Dilbilgisi (16 Soru · ~19 dk)', target: Math.min(16, Math.round(safeNets * 0.21)) },
        { sec: 'Cloze + Cümle Tam. (20 Soru · ~30 dk)', target: Math.min(20, Math.round(safeNets * 0.26)) },
        { sec: 'Çeviri (6 Soru · ~8 dk)', target: Math.min(6, Math.max(4, Math.round(safeNets * 0.09))) },
        { sec: 'Reading (20 Soru · ~60 dk)', target: Math.min(20, Math.round(safeNets * 0.25)) },
        { sec: 'Diyalog + Yakın + Paragraf + Bozan (18 Soru · ~48 dk)', target: Math.min(18, Math.max(1, safeNets - Math.round(safeNets * 0.81))) },
      ]
    : [
        { sec: 'Kelime + Dilbilgisi (20 Soru · ~23 dk)', target: Math.min(20, Math.round(safeNets * 0.26)) },
        { sec: 'Cloze + Cümle Tam. (21 Soru · ~32 dk)', target: Math.min(21, Math.round(safeNets * 0.27)) },
        { sec: 'Çeviri (12 Soru · ~18 dk)', target: Math.min(12, Math.max(8, Math.round(safeNets * 0.17))) },
        { sec: 'Paragraf + Anlam Bozan (12 Soru · ~32 dk)', target: Math.min(12, Math.round(safeNets * 0.14)) },
        { sec: 'Reading (15 Soru · ~55 dk)', target: Math.min(15, Math.round(safeNets * 0.18)) },
      ];

  const dailyRec = targetScore >= 85 ? '50 kelime + 2 okuma parçası'
    : targetScore >= 70 ? '30 kelime + 1 okuma parçası'
      : '20 kelime + 15 test sorusu';

  const barajList = [
    { val: 55, lbl: '55 YL' },
    { val: 65, lbl: '65 Doktora / TUS' },
    { val: 70, lbl: '70 Doçentlik' },
    { val: 80, lbl: '80 Tazminat B' },
    { val: 90, lbl: '90 Tazminat A' }
  ];

  return `
    <div class="coach-baraj-chips">
      ${barajList.map(b => `<span class="coach-baraj-chip ${targetScore >= b.val ? 'met' : ''}">${targetScore >= b.val ? '✓' : '·'} ${b.lbl}</span>`).join('')}
    </div>
    <div class="coach-calc-summary">
      <div class="coach-calc-stat">
        <span class="coach-calc-lbl">Gereken Doğru</span>
        <strong class="coach-calc-val">${reqNets} / 80</strong>
      </div>
      <div class="coach-calc-stat">
        <span class="coach-calc-lbl">Güvenli Hedef</span>
        <strong class="coach-calc-val" style="color:var(--accent)">${safeNets} Net</strong>
      </div>
      <div class="coach-calc-stat">
        <span class="coach-calc-lbl">Seviye Bandı</span>
        <strong class="coach-calc-val" style="font-size:13px">${tier}</strong>
      </div>
    </div>
    <div class="coach-calc-note">${icon('sparkles', 14)} Önerilen günlük tempo: <b>${dailyRec}</b> · Yanlışlar doğruyu götürmediği için <b>80 sorunun tamamını işaretle!</b></div>
    <div class="coach-split-list">
      ${split.map(s => `
        <div class="coach-split-item">
          <span>${s.sec}</span>
          <strong>${Math.max(1, s.target)} Doğru Hedef</strong>
        </div>
      `).join('')}
    </div>
  `;
}

function renderExamCoach() {
  const s = document.getElementById('screen-coach');
  if (!s) return;

  const p = typeof getActiveProfile === 'function' ? getActiveProfile() : { examType: 'YOKDIL', examBranch: 'saglik', targetScore: 70, targetYdtNet: 65, targetTytNet: 70, obpScore: 85, avatar: 'classic', name: 'Aday' };
  const examKey = _getCoachExamKey();
  const spec = EXAM_SPECS[examKey] || EXAM_SPECS.YOKDIL;
  const countdown = getExamCountdownInfo();
  const recPackId = _getRecommendedPackId();
  const recPack = EXAM_WORD_PACKS[recPackId];
  const mascotHtml = typeof renderDonkeyMascot === 'function'
    ? renderDonkeyMascot('scholar', 72, p.avatar)
    : '';

  const tabs = [
    { id: 'overview', label: 'Koç & Simülatör', icon: 'target' },
    { id: 'trials', label: 'Deneme Takibi', icon: 'trendingUp' },
    { id: 'anatomy', label: 'Sınav Anatomisi', icon: 'barChart' },
    { id: 'tactics', label: 'Taktik & Program', icon: 'zap' },
    { id: 'packs', label: 'Branş Paketleri', icon: 'books' },
  ];

  const examBadgeLabel = typeof getExamDisplayBadge === 'function'
    ? getExamDisplayBadge(p)
    : (p.examType === 'YDT' ? `YDT · Hedef ${p.targetYdtNet || 65} Net` : `${p.examType} · Hedef ${p.targetScore || 70} Puan`);

  let bodyHtml = '';

  if (_coachActiveTab === 'overview') {
    const simCurNet = calcYdtNet(_coachSimCorrect, _coachSimWrong);
    const simLoss = Math.round((_coachSimWrong / 4) * 100) / 100;

    bodyHtml = `
      <div class="coach-hero-card">
        <div class="coach-hero-left">${mascotHtml}</div>
        <div class="coach-hero-right">
          <div class="coach-hero-badge">${esc(examBadgeLabel)}</div>
          <div class="coach-hero-title">Koçun Badem Seninle!</div>
          <div class="coach-hero-desc">${typeof getMascotCoachQuote === 'function' ? esc(getMascotCoachQuote()) : 'Planlı çalışma ile hedefine ulaşacaksın.'}</div>
          <div class="coach-hero-meta">
            <span>${icon('calendar', 13)} ${countdown.label}</span>
            <span>${icon('award', 13)} Önerilen: ${esc(recPack.shortTitle)}</span>
          </div>
        </div>
      </div>

      <div class="coach-workout-cta">
        <div>
          <div class="coach-workout-title">${icon('rocket', 18)} Koçun Günlük Akıllı Antrenmanı</div>
          <div class="coach-workout-sub">Hata kumbaran + Tekrar zamanı + ${esc(recPack.shortTitle)} kelimelerinden 15 kartlık özel karma</div>
        </div>
        <div class="coach-workout-btns">
          <button class="coach-btn-primary" onclick="startCoachDailyWorkout('flash')">${icon('layers', 15)} Flash Başlat</button>
          <button class="coach-btn-outline" onclick="startCoachDailyWorkout('mc')">${icon('checkCircle', 15)} Test Çöz</button>
        </div>
      </div>

      <div class="coach-panel-card">
        <div class="coach-panel-head">
          <div>
            <div class="coach-panel-title">${icon('trendingUp', 16)} ${examKey === 'YDT' ? 'YDT Hedef Net, TYT & Sıralama Simülatörü' : 'Hedef Puan, Baraj & Bölüm Yol Haritası'}</div>
            <div class="coach-panel-sub">${examKey === 'YDT' ? 'Hedef YDT/TYT netini ayarla, tahmini sıralamanı ve 120 dk reçeteni gör' : 'Hedef puanını seç, Badem bölüm bazlı doğru hedefini ve barajları hesaplasın'}</div>
          </div>
          <div class="coach-exam-toggle">
            <button class="${examKey === 'YDT' ? 'active' : ''}" onclick="setCoachExamView('YDT')">YDT</button>
            <button class="${examKey === 'YOKDIL' ? 'active' : ''}" onclick="setCoachExamView('YOKDIL')">YÖKDİL</button>
            <button class="${examKey === 'YDS' ? 'active' : ''}" onclick="setCoachExamView('YDS')">YDS</button>
          </div>
        </div>
        ${examKey === 'YDT' ? `
          <div class="coach-sim-controls">
            <div class="coach-sim-box">
              <div class="coach-sim-box-head"><span>Hedef YDT Neti</span><b id="coach-ydt-slider-val">${_coachYdtNet} / 80 Net</b></div>
              <input id="coach-ydt-net-slider" type="range" min="30" max="80" step="1" value="${_coachYdtNet}" oninput="updateCoachYdtSim()">
            </div>
            <div class="coach-sim-box">
              <div class="coach-sim-box-head"><span>Hedef TYT Neti</span><b id="coach-tyt-slider-val">${_coachTytNet} / 120 Net</b></div>
              <input id="coach-tyt-net-slider" type="range" min="25" max="115" step="2" value="${_coachTytNet}" oninput="updateCoachYdtSim()">
            </div>
          </div>
          <div class="coach-dy-calc">
            <div class="coach-dy-title">${icon('zap', 13)} Hızlı D / Y → Net Hesaplayıcı (4 Yanlış 1 Doğruyu Götürür)</div>
            <div class="coach-dy-row">
              <div class="coach-dy-field">
                <label>Doğru (0–80)</label>
                <input id="coach-sim-d" type="number" min="0" max="80" value="${_coachSimCorrect}" oninput="updateCoachDyCalc()">
              </div>
              <div class="coach-dy-field">
                <label>Yanlış</label>
                <input id="coach-sim-w" type="number" min="0" max="80" value="${_coachSimWrong}" oninput="updateCoachDyCalc()">
              </div>
              <div class="coach-dy-res">
                <strong id="coach-dy-net-out">${simCurNet} Net</strong>
                <small id="coach-dy-loss-out">${simLoss > 0 ? `-${simLoss} net kaybı` : '0 kayıp'}</small>
              </div>
            </div>
          </div>
        ` : `
          <div class="coach-slider-row">
            <input type="range" min="45" max="95" step="5" value="${_coachCalcScore}" oninput="updateCoachScoreCalc(this.value)">
            <span class="coach-score-pill" id="coach-score-slider-val">${_coachCalcScore} Puan</span>
          </div>
        `}
        <div id="coach-roadmap-result">${_renderRoadmapResultHTML(_coachCalcScore)}</div>
        ${examKey === 'YDT' ? `
          <div style="margin-top:10px;display:flex;gap:8px;justify-content:flex-end">
            <button type="button" class="coach-btn-outline" onclick="if(typeof updateProfileExamQuick==='function')updateProfileExamQuick('YDT','ydt_dil',_coachYdtNet);renderExamCoach();showToast('YDT hedefin '+_coachYdtNet+' Net olarak kaydedildi!');">
              ${icon('checkCircle', 14)} ${_coachYdtNet} Neti Hedefim Yap
            </button>
          </div>
        ` : ''}
      </div>
    `;
  } else if (_coachActiveTab === 'trials') {
    const trials = getMockTrials();
    const lastTr = trials[0] || null;
    const bestNet = trials.length ? Math.max(...trials.map(t => t.net)) : 0;
    const targetNetNum = examKey === 'YDT' ? (p.targetYdtNet || _coachYdtNet) : Math.ceil((p.targetScore || _coachCalcScore) / 1.25);
    const gapNum = lastTr ? Math.round((targetNetNum - lastTr.net) * 100) / 100 : targetNetNum;
    const avgLost = trials.filter(t => t.exam === 'YDT').length
      ? (trials.filter(t => t.exam === 'YDT').reduce((a, b) => a + (b.lostNet || 0), 0) / trials.filter(t => t.exam === 'YDT').length).toFixed(2)
      : '0.00';

    bodyHtml = `
      <div class="coach-trial-kpis">
        <div class="coach-trial-kpi"><span>${lastTr ? lastTr.net : '—'}</span><small>Son Net (/80)</small></div>
        <div class="coach-trial-kpi"><span>${trials.length ? bestNet : '—'}</span><small>En Yüksek Net</small></div>
        <div class="coach-trial-kpi"><span style="color:var(--accent)">${lastTr ? (gapNum <= 0 ? 'Hedef Üstü!' : '+' + gapNum + ' Net') : targetNetNum + ' Net'}</span><small>${lastTr ? 'Hedefe Kalan' : 'Hedef Net'}</small></div>
        <div class="coach-trial-kpi"><span>${avgLost}</span><small>Ort. Yanlış Kaybı</small></div>
      </div>

      <div class="coach-diag-box">
        <b>${icon('sparkles', 14)} Koç Badem’in Deneme Teşhisi:</b> ${_buildTrialDiagnostic(trials, examKey, p)}
      </div>

      <div class="coach-panel-card">
        <div class="coach-panel-title" style="margin-bottom:10px">${icon('edit', 16)} Yeni Deneme Sınavı Kaydet</div>
        <form class="coach-trial-form" onsubmit="event.preventDefault(); addMockTrialFromForm();">
          <div class="auth-row-2">
            <div class="auth-field">
              <label>Sınav Türü</label>
              <select id="trial-exam">
                <option value="YDT" ${examKey === 'YDT' ? 'selected' : ''}>YDT (YKS-Dil · 4Y 1D)</option>
                <option value="YOKDIL" ${examKey === 'YOKDIL' ? 'selected' : ''}>YÖKDİL (Cezasız)</option>
                <option value="YDS" ${examKey === 'YDS' ? 'selected' : ''}>YDS (Cezasız)</option>
              </select>
            </div>
            <div class="auth-field">
              <label>Deneme Adı / Kaynak</label>
              <input id="trial-name" type="text" placeholder="Örn. 2024 Çıkmış YDT / Modadil #3">
            </div>
          </div>
          <div class="coach-trial-grid">
            <div class="auth-field">
              <label>Doğru (0–80)</label>
              <input id="trial-correct" type="number" min="0" max="80" value="60" required>
            </div>
            <div class="auth-field">
              <label>Yanlış (0–80)</label>
              <input id="trial-wrong" type="number" min="0" max="80" value="10" required>
            </div>
            <div class="auth-field">
              <label>Süre (dk)</label>
              <input id="trial-mins" type="number" min="10" max="240" value="${examKey === 'YDT' ? 115 : 170}">
            </div>
          </div>
          <div class="auth-row-2">
            <div class="auth-field">
              <label>TYT Neti (YDT ise opsiyonel)</label>
              <input id="trial-tyt" type="number" min="0" max="120" step="0.5" placeholder="${p.targetTytNet || 70}">
            </div>
            <div class="auth-field">
              <label>En Zorlanılan Bölüm</label>
              <select id="trial-weak">
                <option value="Reading / Okuma Parçaları">Reading / Okuma Parçaları</option>
                <option value="Situation & Diyalog">Situation &amp; Diyalog</option>
                <option value="Kelime & Phrasal Verbs">Kelime &amp; Phrasal Verbs</option>
                <option value="Dilbilgisi & Bağlaç / Cloze">Dilbilgisi &amp; Bağlaç / Cloze</option>
                <option value="Yakın Anlam & Paragraf Tamamlama">Yakın Anlam &amp; Paragraf Tam.</option>
                <option value="İ→T / T→İ Çeviri">İ→T / T→İ Çeviri</option>
              </select>
            </div>
          </div>
          <button type="submit" class="coach-btn-primary">${icon('checkCircle', 15)} Denemeyi Kaydet &amp; Analiz Et</button>
        </form>
      </div>

      <div class="coach-panel-card">
        <div class="coach-panel-title" style="margin-bottom:10px">${icon('listChecks', 16)} Kayıtlı Deneme Geçmişim (${trials.length})</div>
        ${trials.length === 0 ? `<div class="lb-empty" style="padding:18px">Henüz deneme kaydın yok. Yukarıdan ilk denemeni ekle!</div>` : `
          <div class="coach-trial-list">
            ${trials.map(tr => `
              <div class="coach-trial-card">
                <div class="coach-trial-top">
                  <div>
                    <div class="coach-trial-name">${esc(tr.title)}</div>
                    <div class="coach-trial-meta">${esc(tr.exam)} · ${esc(tr.date)} · ${tr.correct}D ${tr.wrong}Y ${tr.blank}B · ${tr.duration} dk${tr.tytNet ? ` · TYT ${tr.tytNet}N` : ''}</div>
                  </div>
                  <div style="display:flex;align-items:center;gap:6px">
                    <span class="coach-trial-net-pill">${tr.exam === 'YDT' ? `${tr.net} Net` : `${tr.score} Puan (${tr.net}D)`}</span>
                    <button type="button" class="coach-trial-del" onclick="deleteMockTrial('${escQ(tr.id)}')" aria-label="Sil">${icon('x', 14)}</button>
                  </div>
                </div>
                <div class="coach-sec-bar-wrap"><div class="coach-sec-bar-fill" style="width:${Math.min(100, Math.round((tr.net / 80) * 100))}%"></div></div>
                <div class="coach-trial-meta">Odak: <b>${esc(tr.weakSection)}</b>${tr.lostNet > 0 ? ` · Yanlış kaybı: -${tr.lostNet} net` : ''}</div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  } else if (_coachActiveTab === 'anatomy') {
    bodyHtml = `
      <div class="coach-panel-card">
        <div class="coach-panel-head">
          <div>
            <div class="coach-panel-title">${icon('bookOpen', 16)} ${esc(spec.name)}</div>
            <div class="coach-panel-sub">${esc(spec.difficultyNote)}</div>
          </div>
          <div class="coach-exam-toggle">
            <button class="${examKey === 'YDT' ? 'active' : ''}" onclick="setCoachExamView('YDT')">YDT</button>
            <button class="${examKey === 'YOKDIL' ? 'active' : ''}" onclick="setCoachExamView('YOKDIL')">YÖKDİL</button>
            <button class="${examKey === 'YDS' ? 'active' : ''}" onclick="setCoachExamView('YDS')">YDS</button>
          </div>
        </div>
        <div class="coach-spec-pills">
          <span>${icon('listChecks', 13)} ${spec.totalQuestions} Soru</span>
          <span>${icon('clock', 13)} ${spec.durationMin} Dakika</span>
          <span>${icon('star', 13)} Soru başı ${(spec.durationMin / spec.totalQuestions).toFixed(2)} dk</span>
          <span>${icon('shield', 13)} ${spec.wrongPenalty ? '4 yanlış 1 doğruyu götürür' : 'Yanlış doğruyu götürmez'}</span>
        </div>
        <div class="coach-sections-list">
          ${spec.sections.map(sec => {
            const pct = Math.round((sec.count / spec.totalQuestions) * 100);
            return `
              <div class="coach-sec-row">
                <div class="coach-sec-top">
                  <span class="coach-sec-name">${esc(sec.name)}</span>
                  <span class="coach-sec-meta"><b>${sec.count} soru</b> · ~${sec.timeMin} dk</span>
                </div>
                <div class="coach-sec-bar-wrap">
                  <div class="coach-sec-bar-fill" style="width:${Math.max(6, pct * 3)}%"></div>
                </div>
                <div class="coach-sec-tip">${esc(sec.keyTip)}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="coach-panel-card">
        <div class="coach-panel-title" style="margin-bottom:12px">${icon('repeat', 16)} YDT · YDS · YÖKDİL Karşılaştırma Tablosu</div>
        <div class="coach-compare-grid">
          ${EXAM_COMPARISON_POINTS.map(row => `
            <div class="coach-compare-row">
              <div class="coach-compare-lbl">${esc(row.label)}</div>
              <div class="coach-compare-cols">
                <div class="coach-compare-cell"><b>YDT:</b> ${esc(row.ydt)}</div>
                <div class="coach-compare-cell"><b>YDS:</b> ${esc(row.yds)}</div>
                <div class="coach-compare-cell"><b>YÖKDİL:</b> ${esc(row.yokdil)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (_coachActiveTab === 'tactics') {
    const weeklyPlan = _getWeeklyStudyPlan(examKey, p);
    bodyHtml = `
      <div class="coach-panel-card">
        <div class="coach-panel-head">
          <div>
            <div class="coach-panel-title">${icon('calendar', 16)} Kişisel 7 Günlük ${examKey} Çalışma Programın</div>
            <div class="coach-panel-sub">Hedefine göre haftalık dengeli tekrar, deneme ve net yükseltme rutini</div>
          </div>
          <div class="coach-exam-toggle">
            <button class="${examKey === 'YDT' ? 'active' : ''}" onclick="setCoachExamView('YDT')">YDT</button>
            <button class="${examKey === 'YOKDIL' ? 'active' : ''}" onclick="setCoachExamView('YOKDIL')">YÖKDİL</button>
            <button class="${examKey === 'YDS' ? 'active' : ''}" onclick="setCoachExamView('YDS')">YDS</button>
          </div>
        </div>
        <div class="coach-weekly-plan">
          ${weeklyPlan.map(w => `
            <div class="coach-week-item">
              <b>${w.day}</b>
              <span>${esc(w.focus)}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="coach-cheatsheet-grid">
        ${EXAM_CHEATSHEETS.map(cs => `
          <div class="coach-cheat-card">
            <div class="coach-cheat-title">${icon('sparkles', 14)} ${esc(cs.title)}</div>
            <ul class="coach-cheat-list">
              ${cs.items.map(it => `<li>${esc(it)}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>

      <div class="coach-tactics-list">
        ${COACH_PLAYBOOK.map(item => `
          <div class="coach-tactic-card">
            <span class="coach-tactic-badge">${esc(item.badge)}</span>
            <div class="coach-tactic-title">${esc(item.title)}</div>
            <div class="coach-tactic-summary">${esc(item.summary)}</div>
            <ul class="coach-tactic-steps">
              ${item.steps.map(st => `<li>${esc(st)}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
    `;
  } else if (_coachActiveTab === 'packs') {
    bodyHtml = `
      <div class="coach-packs-grid">
        ${Object.values(EXAM_WORD_PACKS).map(pack => {
          const isRec = pack.id === recPackId;
          return `
            <div class="coach-pack-card ${isRec ? 'recommended' : ''}">
              <div class="coach-pack-top">
                <span class="coach-pack-badge" style="color:${pack.accent};border-color:${pack.accent}40;background:${pack.accent}15">${esc(pack.badge)}</span>
                ${isRec ? `<span class="coach-pack-rec">${icon('sparkles', 11)} Sana Özel</span>` : ''}
              </div>
              <div class="coach-pack-title">${esc(pack.title)}</div>
              <div class="coach-pack-desc">${esc(pack.desc)}</div>
              <div class="coach-pack-meta">${pack.words.length} yüksek frekanslı sınav kelimesi</div>
              <div class="coach-pack-actions">
                <button class="coach-pack-btn primary" onclick="startExamPackSession('${escQ(pack.id)}', 'flash')">${icon('layers', 14)} Flash Kart</button>
                <button class="coach-pack-btn" onclick="startExamPackSession('${escQ(pack.id)}', 'mc')">${icon('checkCircle', 14)} Çoktan Seçmeli</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  s.innerHTML = `
    <div class="unit-header">
      <button class="back-btn" onclick="goHome()" aria-label="Geri">${icon('arrowLeft', 18)}</button>
      <div>
        <div class="unit-title-h">${icon('graduationCap', 18)} YDT · YDS · YÖKDİL Akıllı Koç</div>
        <div class="unit-sub">Sınav Analizi · Strateji · Branş Kelime Paketleri</div>
      </div>
    </div>
    <div class="coach-tabs-bar">
      ${tabs.map(t => `
        <button class="coach-tab-btn ${_coachActiveTab === t.id ? 'active' : ''}" onclick="setCoachTab('${t.id}')">
          ${icon(t.icon, 14)} <span>${t.label}</span>
        </button>
      `).join('')}
    </div>
    <div class="coach-scroll">
      ${bodyHtml}
    </div>
  `;
}

function startExamPackSession(packId, mode = 'flash') {
  const pack = EXAM_WORD_PACKS[packId];
  if (!pack) { showToast('Paket bulunamadı'); return; }

  const pool = shuffle(pack.words.map(w => {
    const wc = [w[0], w[1], w[2]];
    wc._unit = w[3] || 1;
    wc._packLabel = pack.shortTitle;
    return wc;
  }));

  if (mode === 'mc') {
    startMC(pool.slice(0, 15), `showExamCoach('packs')`, `${pack.shortTitle} Test`);
  } else {
    currentCards = pool;
    cardIndex = 0; known = []; unknown = [];
    _fcSwiping = false;
    _flashBackFn = `showExamCoach('packs')`;
    _flashTitle = pack.title;
    _flashUnitTagFn = () => pack.shortTitle;
    _pvMode = false;
    renderFlash();
    showScreen('screen-flash');
  }
}

function startCoachDailyWorkout(mode = 'flash') {
  const recPackId = _getRecommendedPackId();
  const pack = EXAM_WORD_PACKS[recPackId] || EXAM_WORD_PACKS.yokdil_saglik;
  const conjPack = EXAM_WORD_PACKS.baglac_ustasi;

  let pool = [];
  const seen = new Set();

  // 1. Prioritize error box words (up to 4)
  if (typeof errorBox !== 'undefined') {
    Object.values(errorBox).slice(0, 4).forEach(e => {
      const k = (e.word || '').toLowerCase();
      if (k && !seen.has(k)) {
        seen.add(k);
        const wc = [e.word, e.meaning, ''];
        wc._unit = e.unit || 1;
        wc._sourceTag = 'Hata Kumbarası';
        pool.push(wc);
      }
    });
  }

  // 2. Due SR words (up to 4)
  if (typeof _srGetDueWords === 'function') {
    _srGetDueWords().slice(0, 4).forEach(d => {
      const k = d.wordArr[0].toLowerCase();
      if (!seen.has(k)) {
        seen.add(k);
        const wc = [...d.wordArr];
        wc._unit = d.unit || 1;
        wc._sourceTag = 'Tekrar Zamanı';
        pool.push(wc);
      }
    });
  }

  // 3. Recommended exam branch pack + conjunctions
  const combinedPack = [...shuffle(pack.words).slice(0, 8), ...shuffle(conjPack.words).slice(0, 4)];
  combinedPack.forEach(w => {
    const k = w[0].toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      const wc = [w[0], w[1], w[2]];
      wc._unit = w[3] || 1;
      wc._sourceTag = pack.shortTitle;
      pool.push(wc);
    }
  });

  pool = shuffle(pool).slice(0, 15);
  if (pool.length === 0) {
    showToast('Antrenman için kelime bulunamadı!');
    return;
  }

  if (mode === 'mc') {
    startMC(pool, 'goHome()', `Koç Antrenmanı (${pack.shortTitle})`);
  } else {
    currentCards = pool;
    cardIndex = 0; known = []; unknown = [];
    _fcSwiping = false;
    _flashBackFn = 'goHome()';
    _flashTitle = 'Koçun Günlük Antrenmanı';
    _flashUnitTagFn = w => w._sourceTag || pack.shortTitle;
    _pvMode = false;
    renderFlash();
    showScreen('screen-flash');
  }
}

function updateCoachYdtCalc(val) {
  if (val !== undefined) _coachYdtNet = Math.max(30, Math.min(80, parseFloat(val) || 65));
  updateCoachYdtSim();
}

window.EXAM_SPECS = EXAM_SPECS;
window.EXAM_WORD_PACKS = EXAM_WORD_PACKS;
window.EXAM_CHEATSHEETS = EXAM_CHEATSHEETS;
window.getExamCountdownInfo = getExamCountdownInfo;
window.getMockTrials = getMockTrials;
window.calcYdtNet = calcYdtNet;
window.estimateYksDilStats = estimateYksDilStats;
window.showExamCoach = showExamCoach;
window.setCoachTab = setCoachTab;
window.setCoachExamView = setCoachExamView;
window.updateCoachScoreCalc = updateCoachScoreCalc;
window.updateCoachYdtSim = updateCoachYdtSim;
window.updateCoachYdtCalc = updateCoachYdtCalc;
window.updateCoachDyCalc = updateCoachDyCalc;
window.addMockTrialFromForm = addMockTrialFromForm;
window.deleteMockTrial = deleteMockTrial;
window.startExamPackSession = startExamPackSession;
window.startCoachDailyWorkout = startCoachDailyWorkout;
