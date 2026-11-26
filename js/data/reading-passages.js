// Curated YDT academic & general reading passages
const READING_PASSAGES = [
  {
    id: 1,
    title: "The Coffee Shop",
    level: "Beginner",
    text: "Every morning, Sarah walks to the small coffee shop on Main Street. She orders her usual coffee with milk and a croissant. The owner, Mr. Chen, always remembers her order. Sarah likes to sit by the window and watch people passing by. She reads the news on her phone while enjoying her coffee. The shop has a warm and friendly atmosphere. Many regular customers come here to start their day. Sarah has been a customer for three years now.",
    turkish: "Her sabah Sarah, Main Street'deki küçük kahve dükkanına yürüyerek gider. Her zamanki gibi sütlü kahve ve bir croissant order. Sahibi Bay Chen her zaman siparişini hatırlar. Sarah pencere kenarında oturmayı ve geçen insanları izlemeyi sever. Kahvesini yudumlarken telefonundan haberleri okur. Dükkanın sıcak ve dostça bir atmosferi vardır. Birçok düzenli müşteri buraya günlerine başlamak için gelir. Sarah artık üç yıldır müşteridir.",
    keywords: ["croissant", "atmosphere", "regular", "customer", "window", "order"]
  },
  {
    id: 2,
    title: "A Day in the Park",
    level: "Beginner",
    text: "Last Sunday, Tom went to the central park with his family. The weather was perfect - sunny with a gentle breeze. They brought a picnic basket full of sandwiches and fruits. Tom's children played on the swings and the slide while their parents sat on the grass. In the afternoon, they rented a boat and rowed around the lake. It was a peaceful and enjoyable day. They promised to come back again soon.",
    turkish: "Geçen pazar Tom ailesiyle merkezi parka gitti. Hava mükemmeldi - güneşli ve hafif bir esinti vardı. Sandviç ve meyvelerle dolu bir piknik sepeti getirdiler. Tom'un çocukları salıncaklarda ve kaydırakta oynarken, ebeveynleri çimlerin üstünde oturdu. Öğleden sonra bir tekne kiralayıp gölün etrafında kürek çektiler. Barışçıl ve keyifli bir gündü. Yakında tekrar gelmeye söz verdiler.",
    keywords: ["picnic", "breeze", "swings", "slide", "grass", "row", "peaceful"]
  },
  {
    id: 3,
    title: "The New Student",
    level: "Intermediate",
    text: "When Maria transferred to her new school, she felt nervous and anxious. On her first day, she couldn't find her classroom and arrived late. The teacher asked her to introduce herself in front of the class. She stood up, trembling slightly, and said her name and where she came from. Some students smiled kindly, but others seemed unimpressed. During lunch break, a girl named Emma approached her and offered to show her around. Maria felt relieved and grateful for the friendly welcome.",
    turkish: "Maria yeni okuluna geçtiğinde, gergin ve endişeli hissetti. İlk gününde sınıfını bulamadı ve geç kaldı. Öğretmen ondan sınıfın önünde kendini tanıtmasını istedi. Hafifçe titreyerek ayağa kalktı ve adını, nereden geldiğini söyledi. Bazı öğrenciler nazikçe gülümsedi, ama diğerleri etkilenmemiş görünüyordu. Teneffüs sırasında Emma adında bir kız ona yaklaştı ve etrafını gezdirmeyi teklif etti. Maria rahatlamış ve nazik karşılaması için minnettar hissetti.",
    keywords: ["transfer", "nervous", "anxious", "trembling", "relieved", "grateful", "approach"]
  },
  {
    id: 4,
    title: "The Job Interview",
    level: "Intermediate",
    text: "David had been preparing for this job interview for weeks. He researched the company, practiced common questions, and chose his best outfit. When he arrived, the lobby was modern and impressive. The receptionist gave him a form to fill out. After waiting for ten minutes, a woman in a professional suit escorted him to the conference room. The interview lasted about forty-five minutes. They discussed his experience, skills, and career goals. David felt confident about his performance and hoped to receive an offer soon.",
    turkish: "David haftalardır bu iş görüşmesi için hazırlanıyordu. Şirketi araştırdı, yaygın soruları pratik yaptı ve en iyi kıyafetini seçti. Geldiğinde lobisi modern ve etkileyiciydi. Resepsiyon görevlisi doldurması için ona bir form verdi. On dakika bekledikten sonra, profesyonel bir takım elbise giyen bir kadın onu konferans odasına götürdü. Görüşme yaklaşık kırk beş dakika sürdü. Deneyimini, becerilerini ve kariyer hedeflerini tartıştılar. David performansından emin hissetti ve yakında bir teklif almayı umuyordu.",
    keywords: ["interview", "lobby", "receptionist", "escort", "conference", "outfit", "confident"]
  },
  {
    id: 5,
    title: "Learning to Cook",
    level: "Beginner",
    text: "Last month, James decided to learn how to cook. He bought a recipe book and went to the grocery store to buy ingredients. His first attempt was a simple pasta dish. He followed the instructions carefully, but the sauce was too salty. He didn't give up. The second time, he used less salt and added some herbs. It tasted much better. Now he cooks for himself every day and even invited his friends for dinner last weekend. They praised his improvement and asked for the recipe.",
    turkish: "Geçen ay James yemek yapmayı öğrenmeye karar verdi. Bir yemek tarifi kitabı satın aldı ve malzemeler satın almak için markete gitti. İlk denemesi basit bir makarna yemeğiydi. Talimatları dikkatlice takip etti, ama sos çok tuzluydu. Vazgeçmedi. İkinci seferde daha az tuz kullandı ve biraz ot ekledi. Çok daha iyi tattı. Şimdi her gün kendine yemek pişiriyor ve geçen hafta sonu arkadaşlarını akşam yemeğine davet etti. Onlar James'in gelişimini övdüler ve tarif istediler.",
    keywords: ["recipe", "ingredient", "sauce", "herbs", "improvement", "praise", "attempt"]
  },
  {
    id: 6,
    title: "The Weekend Plans",
    level: "Beginner",
    text: "Sophie was looking forward to the weekend. She made several plans with her friends. On Saturday morning, they were going to the farmers market to buy fresh vegetables and fruits. In the afternoon, they planned to watch a movie at the cinema. Sunday was reserved for a hiking trip in the mountains. Sophie's friend Lisa offered to drive them in her car. They expected the weather to be clear and perfect for outdoor activities. Sophie was excited about spending time with her friends.",
    turkish: "Sophie hafta sonunu dört gözle bekliyordu. Arkadaşlarıyla birkaç plan yaptı. Cumartesi sabahı, taze sebze ve meyve satın almak için çiftçi pazarına gideceklermiş. Öğleden sonra sinemada film izlemeyi planladılar. Pazar günü dağlarda yürüyüş için ayrıldı. Sophie'nin arkadaşı Lisa arabasıyla onları götürmeyi teklif etti. Hava durumunun açık ve açık hava etkinlikleri için mükemmel olmasını beklediler. Sophie arkadaşlarıyla vakit geçirmek için heyecanlıydı.",
    keywords: ["farmers market", "vegetables", "hiking", "mountains", "outdoor", "excited", "reserved"]
  },
  {
    id: 7,
    title: "Moving to a New City",
    level: "Advanced",
    text: "Relocating to an unfamiliar city presented numerous challenges for the young professional. She had to find an affordable apartment, establish a reliable transportation system, and build a social network from scratch. The process of searching for housing online proved to be tedious and time-consuming. She scheduled multiple viewings and eventually signed a lease for a modest studio apartment near her workplace. Adjusting to the faster pace of city life required considerable patience and perseverance. Nevertheless, she gradually adapted to her new environment and began to feel a sense of belonging.",
    turkish: "Genç profesyonel için tanımadığı bir şehre taşınmak çok sayıda zorluk ortaya koydu. Uygun fiyatlı bir daire bulması, güvenilir bir ulaşım sistemi kurması ve sıfırdan bir sosyal ağ oluşturması gerekiyordu. Konut arama süreci yorucu ve zaman alıcıydı. Birçok gösterim planladı ve sonunda iş yerine yakın mütevazi bir stüdyo daire için lease imzaladı. Şehir hayatının daha hızlı temposuna alışmak, oldukça sabır ve azim gerektirdi. Yine de kademeli olarak yeni çevresine uyum sağladı ve bir aidiyet duygusu hissetmeye başladı.",
    keywords: ["relocating", "numerous", "affordable", "scratch", "tedious", "lease", "perseverance", "belonging"]
  },
  {
    id: 8,
    title: "The Book Club",
    level: "Intermediate",
    text: "Every Thursday evening, a group of literature enthusiasts gathers at the local library to discuss their latest read. The club has been operating for over five years and currently has fifteen members. This month they are analyzing a classic novel by a well-known author. Each member comes prepared with notes and questions to share. The discussions are always lively and thought-provoking. Some members agree on certain interpretations while others offer alternative perspectives. The club promotes a respectful environment where everyone's opinion is valued.",
    turkish: "Her perşembe akşamı, bir grup edebiyat meraklısı en son okudukları kitabı tartışmak için yerel kütüphanede buluşur. Kulüp beş yıldan fazla süredir faaliyet gösteriyor ve şu anda on beş üyesi var. Bu ay ünlü bir yazarın klasik bir romanını analiz ediyorlar. Her üye paylaşmak için notlar ve sorularla hazırlanır. Tartışmalar her zaman canlı ve düşündürücüdür. Bazı üyeler belirli yorumlar konusunda hemfikirken, diğerleri alternatif perspektifler sunuyor. Kulüp, herkesin fikrinin değerli görüldüğü saygılı bir ortamı teşvik ediyor.",
    keywords: ["literature", "enthusiast", "analyzing", "interpretations", "alternative", "perspective", "promotes"]
  },
  {
    id: 9,
    title: "Health and Lifestyle",
    level: "Intermediate",
    text: "Modern sedentary lifestyles have contributed to a significant increase in health problems worldwide. Medical experts recommend engaging in regular physical exercise and maintaining a balanced diet. Studies show that people who walk for at least thirty minutes daily experience reduced stress levels and improved sleep quality. Additionally, limiting screen time and taking regular breaks from work can prevent eye strain and back pain. Following these simple guidelines can lead to a healthier and more productive life.",
    turkish: "Modern hareketsiz yaşam tarzları dünya genelinde sağlık sorunlarının önemli ölçüde artmasına katkıda bulunmuştur. Tıp uzmanları düzenli fiziksel egzersiz yapmayı ve dengeli beslenmeyi öneriyor. Çalışmalar, günde en az otuz dakika yürüyen kişilerin stres seviyelerinde azalma ve uyku kalitesinde iyileşme yaşadığını gösteriyor. Ayrıca, ekran süresini sınırlamak ve işten düzenli molalar vermek göz yorgunluğunu ve sırt ağrısını önleyebilir. Bu basit yönergeleri takip etmek daha sağlıklı ve üretken bir yaşama yol açabilir.",
    keywords: ["sedentary", "contribute", "balanced diet", "stress", "productive", "guidelines", "prevent"]
  },
  {
    id: 10,
    title: "Technology and Communication",
    level: "Advanced",
    text: "The advent of smartphones has revolutionized the way people communicate and access information. While these devices have undoubtedly enhanced convenience and connectivity, they have also raised concerns about privacy and digital addiction. Many individuals spend excessive hours on social media platforms, often at the expense of real-world interactions. Furthermore, the constant bombardment of notifications can lead to decreased concentration and mental fatigue. Experts suggest implementing digital wellness strategies to maintain a healthy relationship with technology.",
    turkish: "Akıllı telefonların ortaya çıkışı, insanların iletişim kurma ve bilgiye erişme biçimini devrimleştirdi. Bu cihazlar kuşkusuz kolaylık ve bağlantıyı artırmış olsa da, gizlilik ve dijital bağımlılık konusunda endişeleri de artırmıştır. Birçok kişi gerçek dünya etkileşimleri pahasına sosyal medya platformlarında aşırı saatler geçiriyor. Üstelik sürekli bildiri bombardımanı konsantrasyonun azalmasına ve zihinsel yorgunluğa yol açabilir. Uzmanlar teknolojiyle sağlıklı bir ilişki sürdürmek için dijital sağlık stratejileri uygulamayı öneriyor.",
    keywords: ["advent", "revolutionized", "undoubtedly", "connectivity", "bombardment", "fatigue", "wellness"]
  }
];
