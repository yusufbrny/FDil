// Word synonyms, antonyms, and word-family metadata
const RAW_META = {
    // Unit 1
    'abandon': { s: ['leave', 'desert', 'forsake'], a: ['keep', 'stay', 'maintain'], f: ['abandonment', 'abandoned'] },
    'absolutely': { s: ['completely', 'totally', 'entirely'], a: ['partly', 'somewhat', 'doubtfully'], f: ['absolute'] },
    'accumulate': { s: ['gather', 'collect', 'amass'], a: ['scatter', 'disperse', 'lose'], f: ['accumulation'] },
    'acquire': { s: ['obtain', 'gain', 'get'], a: ['lose', 'forfeit', 'give up'], f: ['acquisition'] },
    'adherent': { s: ['supporter', 'follower', 'believer'], a: ['opponent', 'critic', 'enemy'], f: ['adhere', 'adherence'] },
    'adult': { s: ['grown-up', 'mature'], a: ['child', 'infant', 'minor'], f: ['adulthood'] },
    'approach': { s: ['method', 'strategy', 'nearing'], a: ['departure', 'leaving', 'retreat'], f: ['approachable'] },
    'aware': { s: ['conscious', 'mindful', 'informed'], a: ['unaware', 'ignorant', 'oblivious'], f: ['awareness'] },
    'blame': { s: ['accuse', 'fault', 'condemn'], a: ['praise', 'forgive', 'absolve'], f: ['blameless'] },
    'bold': { s: ['brave', 'daring', 'courageous'], a: ['timid', 'cowardly', 'fearful'], f: ['boldly', 'boldness'] },
    'circumstance': { s: ['situation', 'condition', 'event'], a: [], f: ['circumstantial'] },
    'competence': { s: ['ability', 'capability', 'skill'], a: ['incompetence', 'inability'], f: ['competent'] },
    'confess': { s: ['admit', 'acknowledge', 'own up'], a: ['deny', 'hide', 'conceal'], f: ['confession'] },
    'constructive': { s: ['helpful', 'positive', 'productive'], a: ['destructive', 'negative', 'harmful'], f: ['construct', 'construction'] },
    'contradict': { s: ['oppose', 'deny', 'dispute'], a: ['agree', 'confirm', 'support'], f: ['contradiction', 'contradictory'] },
    'decrease': { s: ['reduce', 'decline', 'drop'], a: ['increase', 'rise', 'grow'], f: ['decreasingly'] },
    'deficiency': { s: ['shortage', 'lack', 'weakness'], a: ['abundance', 'surplus', 'excess'], f: ['deficient'] },
    'destroy': { s: ['ruin', 'demolish', 'devastate'], a: ['build', 'create', 'construct'], f: ['destruction', 'destructive'] },
    'development': { s: ['growth', 'progress', 'advancement'], a: ['decline', 'regression', 'stagnation'], f: ['develop', 'developing'] },
    'disappear': { s: ['vanish', 'fade', 'evaporate'], a: ['appear', 'emerge', 'materialize'], f: ['disappearance'] },
    'dismiss': { s: ['fire', 'reject', 'discharge'], a: ['hire', 'accept', 'welcome'], f: ['dismissal', 'dismissive'] },
    'frequently': { s: ['often', 'regularly', 'repeatedly'], a: ['rarely', 'seldom', 'infrequently'], f: ['frequent', 'frequency'] },
    'generously': { s: ['liberally', 'freely', 'kindly'], a: ['selfishly', 'stingily', 'greedily'], f: ['generous', 'generosity'] },
    'independent': { s: ['free', 'self-reliant', 'autonomous'], a: ['dependent', 'reliant', 'controlled'], f: ['independence'] },
    'influential': { s: ['powerful', 'important', 'impactful'], a: ['insignificant', 'weak', 'powerless'], f: ['influence'] },
    'patience': { s: ['tolerance', 'endurance', 'calmness'], a: ['impatience', 'haste', 'agitation'], f: ['patient'] },
    'powerful': { s: ['strong', 'mighty', 'dominant'], a: ['weak', 'powerless', 'feeble'], f: ['power', 'powerfully'] },
    'productive': { s: ['fruitful', 'efficient', 'effective'], a: ['unproductive', 'useless', 'lazy'], f: ['produce', 'product'] },
    'valuable': { s: ['precious', 'costly', 'important'], a: ['worthless', 'cheap', 'useless'], f: ['value', 'invaluable'] },
    'visible': { s: ['clear', 'evident', 'observable'], a: ['invisible', 'hidden', 'obscure'], f: ['vision', 'visibility'] },

    // Unit 2
    'accept': { s: ['receive', 'take', 'admit'], a: ['reject', 'refuse', 'decline'], f: ['acceptance', 'acceptable'] },
    'advance': { s: ['progress', 'move forward', 'develop'], a: ['retreat', 'regress', 'go back'], f: ['advanced', 'advancement'] },
    'appropriate': { s: ['suitable', 'fitting', 'proper'], a: ['inappropriate', 'unsuitable', 'wrong'], f: ['appropriately'] },
    'attack': { s: ['assault', 'strike', 'charge'], a: ['defend', 'protect', 'guard'], f: ['attacker'] },
    'coherent': { s: ['logical', 'consistent', 'clear'], a: ['incoherent', 'confused', 'muddled'], f: ['coherence'] },
    'competent': { s: ['capable', 'skilled', 'proficient'], a: ['incompetent', 'unskilled', 'incapable'], f: ['competence'] },
    'confidence': { s: ['trust', 'belief', 'certainty'], a: ['doubt', 'insecurity', 'fear'], f: ['confident', 'confidently'] },
    'consistent': { s: ['steady', 'regular', 'reliable'], a: ['inconsistent', 'erratic', 'irregular'], f: ['consistency'] },
    'cruel': { s: ['brutal', 'harsh', 'ruthless'], a: ['kind', 'gentle', 'merciful'], f: ['cruelty'] },
    'dependent': { s: ['reliant', 'helpless', 'conditional'], a: ['independent', 'self-sufficient', 'free'], f: ['depend', 'dependence'] },
    'harmful': { s: ['damaging', 'destructive', 'detrimental'], a: ['harmless', 'safe', 'beneficial'], f: ['harm'] },
    'inevitable': { s: ['unavoidable', 'certain', 'inescapable'], a: ['avoidable', 'uncertain', 'preventable'], f: ['inevitably'] },
    'opportunity': { s: ['chance', 'occasion', 'opening'], a: ['disadvantage', 'obstacle'], f: ['opportune'] },
    'reliable': { s: ['trustworthy', 'dependable', 'consistent'], a: ['unreliable', 'untrustworthy', 'fickle'], f: ['rely', 'reliability'] },
    'useful': { s: ['helpful', 'beneficial', 'practical'], a: ['useless', 'worthless', 'ineffective'], f: ['use', 'utility'] },

    // Unit 3
    'absorb': { s: ['soak up', 'take in', 'assimilate'], a: ['emit', 'release', 'reject'], f: ['absorption'] },
    'acceptable': { s: ['satisfactory', 'adequate', 'tolerable'], a: ['unacceptable', 'bad', 'inadequate'], f: ['accept', 'acceptance'] },
    'accuracy': { s: ['precision', 'correctness', 'exactness'], a: ['inaccuracy', 'error', 'mistake'], f: ['accurate'] },
    'alternative': { s: ['option', 'choice', 'substitute'], a: ['obligation', 'necessity'], f: ['alternate'] },
    'confident': { s: ['assured', 'positive', 'bold'], a: ['insecure', 'doubtful', 'uncertain'], f: ['confidence'] },
    'deserve': { s: ['merit', 'earn', 'warrant'], a: ['fail', 'lose'], f: ['deserving'] },
    'donate': { s: ['give', 'contribute', 'present'], a: ['keep', 'take', 'receive'], f: ['donation', 'donor'] },
    'emerge': { s: ['appear', 'arise', 'surface'], a: ['disappear', 'hide', 'vanish'], f: ['emergence'] },
    'vital': { s: ['essential', 'crucial', 'important'], a: ['unimportant', 'trivial', 'minor'], f: ['vitality'] },
    'widespread': { s: ['common', 'extensive', 'prevalent'], a: ['rare', 'limited', 'uncommon'], f: ['wide'] },

    // Unit 4
    'accurate': { s: ['correct', 'precise', 'exact'], a: ['inaccurate', 'wrong', 'false'], f: ['accuracy', 'accurately'] },
    'create': { s: ['make', 'produce', 'generate'], a: ['destroy', 'ruin', 'demolish'], f: ['creation', 'creative'] },
    'definitely': { s: ['certainly', 'absolutely', 'surely'], a: ['possibly', 'doubtfully', 'uncertainly'], f: ['definite'] },
    'demand': { s: ['request', 'ask', 'require'], a: ['supply', 'offer', 'give'], f: ['demanding'] },
    'flexible': { s: ['adaptable', 'pliable', 'elastic'], a: ['rigid', 'stiff', 'inflexible'], f: ['flexibility'] },
    'fortunately': { s: ['luckily', 'happily', 'thankfully'], a: ['unfortunately', 'sadly', 'unluckily'], f: ['fortunate', 'fortune'] },
    'permanent': { s: ['lasting', 'enduring', 'perpetual'], a: ['temporary', 'brief', 'fleeting'], f: ['permanently', 'permanence'] },
    'profit': { s: ['gain', 'benefit', 'earnings'], a: ['loss', 'debt', 'expense'], f: ['profitable'] },
    'quality': { s: ['standard', 'excellence', 'feature'], a: ['inferiority', 'poorness'], f: ['qualitative'] },
    'specific': { s: ['particular', 'exact', 'definite'], a: ['general', 'vague', 'broad'], f: ['specifically', 'specify'] },

    // Unit 5
    'compulsory': { s: ['mandatory', 'required', 'obligatory'], a: ['optional', 'voluntary', 'elective'], f: ['compel', 'compulsion'] },
    'desire': { s: ['wish', 'want', 'craving'], a: ['dislike', 'hate', 'aversion'], f: ['desirable'] },
    'encourage': { s: ['motivate', 'inspire', 'support'], a: ['discourage', 'deter', 'hinder'], f: ['encouragement'] },
    'finally': { s: ['eventually', 'ultimately', 'lastly'], a: ['initially', 'firstly', 'beginning'], f: ['final', 'finalize'] },
    'majority': { s: ['bulk', 'mass', 'most'], a: ['minority', 'few'], f: ['major'] },
    'outstanding': { s: ['excellent', 'exceptional', 'remarkable'], a: ['ordinary', 'average', 'mediocre'], f: ['outstand'] },
    'prefer': { s: ['favor', 'choose', 'select'], a: ['reject', 'dislike'], f: ['preference', 'preferable'] },
    'recommend': { s: ['suggest', 'advise', 'endorse'], a: ['oppose', 'reject', 'discourage'], f: ['recommendation'] },
    'unnecessary': { s: ['needless', 'useless', 'redundant'], a: ['necessary', 'essential', 'vital'], f: ['necessity'] },
    'victorious': { s: ['winning', 'successful', 'triumphant'], a: ['defeated', 'losing', 'beaten'], f: ['victory'] },

    // Unit 6
    'actual': { s: ['real', 'true', 'factual'], a: ['fake', 'false', 'imaginary'], f: ['actually', 'actuality'] },
    'compare': { s: ['contrast', 'match', 'evaluate'], a: ['ignore', 'separate'], f: ['comparison', 'comparable'] },
    'damage': { s: ['harm', 'injury', 'destruction'], a: ['repair', 'benefit', 'improvement'], f: ['damaged'] },
    'enthusiastic': { s: ['eager', 'excited', 'passionate'], a: ['apathetic', 'uninterested', 'bored'], f: ['enthusiasm'] },
    'evidence': { s: ['proof', 'confirmation', 'data'], a: ['guess', 'assumption', 'rumor'], f: ['evident'] },
    'increase': { s: ['grow', 'rise', 'expand'], a: ['decrease', 'reduce', 'drop'], f: ['increasingly'] },
    'protect': { s: ['defend', 'guard', 'shield'], a: ['attack', 'harm', 'endanger'], f: ['protection', 'protective'] },
    'reasonable': { s: ['fair', 'logical', 'sensible'], a: ['unreasonable', 'irrational', 'absurd'], f: ['reason'] },
    'sufficient': { s: ['enough', 'adequate', 'ample'], a: ['insufficient', 'lacking', 'deficient'], f: ['sufficiency'] },

    // Unit 7
    'aggressive': { s: ['hostile', 'violent', 'forceful'], a: ['peaceful', 'calm', 'friendly'], f: ['aggression'] },
    'effective': { s: ['successful', 'efficient', 'productive'], a: ['ineffective', 'useless', 'weak'], f: ['effect', 'effectiveness'] },
    'huge': { s: ['enormous', 'massive', 'giant'], a: ['tiny', 'small', 'miniature'], f: ['hugely'] },
    'immediate': { s: ['instant', 'prompt', 'urgent'], a: ['delayed', 'late', 'slow'], f: ['immediately'] },
    'incredible': { s: ['unbelievable', 'amazing', 'extraordinary'], a: ['believable', 'ordinary', 'common'], f: ['incredibly'] },
    'obvious': { s: ['clear', 'evident', 'apparent'], a: ['hidden', 'obscure', 'unclear'], f: ['obviously'] },
    'overcome': { s: ['conquer', 'defeat', 'beat'], a: ['surrender', 'fail', 'yield'], f: [] },
    'talent': { s: ['skill', 'ability', 'gift'], a: ['inability', 'weakness'], f: ['talented'] },

    // Unit 8
    'adapt': { s: ['adjust', 'modify', 'conform'], a: ['refuse', 'misfit'], f: ['adaptation', 'adaptable'] },
    'certain': { s: ['sure', 'definite', 'confident'], a: ['uncertain', 'unsure', 'doubtful'], f: ['certainty'] },
    'complete': { s: ['finish', 'conclude', 'entire'], a: ['incomplete', 'partial', 'unfinished'], f: ['completion'] },
    'excellent': { s: ['superb', 'outstanding', 'great'], a: ['terrible', 'poor', 'bad'], f: ['excellence'] },
    'famous': { s: ['well-known', 'renowned', 'celebrated'], a: ['unknown', 'obscure', 'anonymous'], f: ['fame'] },
    'inspire': { s: ['motivate', 'encourage', 'stimulate'], a: ['discourage', 'depress'], f: ['inspiration'] },
    'progress': { s: ['advancement', 'improvement', 'growth'], a: ['decline', 'regression', 'stagnation'], f: ['progressive'] },

    // Unit 9
    'attractive': { s: ['appealing', 'charming', 'beautiful'], a: ['unattractive', 'ugly', 'repulsive'], f: ['attract', 'attraction'] },
    'critical': { s: ['crucial', 'vital', 'important'], a: ['unimportant', 'trivial', 'safe'], f: ['critic', 'criticism'] },
    'defeat': { s: ['beat', 'conquer', 'overcome'], a: ['win', 'succeed', 'triumph'], f: ['defeated'] },
    'honest': { s: ['truthful', 'sincere', 'frank'], a: ['dishonest', 'lying', 'deceitful'], f: ['honesty'] },
    'sensitive': { s: ['delicate', 'responsive', 'emotional'], a: ['insensitive', 'numb', 'tough'], f: ['sensitivity'] },

    // Unit 10
    'admire': { s: ['respect', 'appreciate', 'adore'], a: ['despise', 'hate', 'dislike'], f: ['admiration'] },
    'celebrate': { s: ['rejoice', 'party', 'honor'], a: ['mourn', 'ignore', 'lament'], f: ['celebration'] },
    'ignore': { s: ['disregard', 'neglect', 'overlook'], a: ['notice', 'heed', 'acknowledge'], f: ['ignorance', 'ignorant'] },
    'prove': { s: ['show', 'verify', 'demonstrate'], a: ['disprove', 'deny', 'refute'], f: ['proof'] },
    'unique': { s: ['one-of-a-kind', 'exclusive', 'rare'], a: ['common', 'ordinary', 'typical'], f: ['uniqueness'] }
};

// Dinamik ve akıllı arama algoritması: Eğer kelime tam olarak RAW_META içinde yoksa,
// Google Çeviri API veya harici bir servis olmadığı için varsayılan boş listeler döneriz,
// ancak kelimenin sonuna "s", "d", "ed", "ing" vs. ekleyip çıkartarak en yakın eşleşmeyi bulmaya çalışır.
function getWordMeta(word) {
    let w = word.toLowerCase().trim();
    if (RAW_META[w]) return { synonyms: RAW_META[w].s || [], antonyms: RAW_META[w].a || [], family: RAW_META[w].f || [] };

    // Temel çekim eklerini kontrol et (Akıllı eşleştirme)
    let bases = [
        w.replace(/s$/, ''), w.replace(/ed$/, ''), w.replace(/ing$/, ''), w.replace(/d$/, ''),
        w.replace(/ly$/, ''), w.replace(/ion$/, ''), w.replace(/ment$/, '')
    ];
    for (let base of bases) {
        if (RAW_META[base]) {
            return { synonyms: RAW_META[base].s || [], antonyms: RAW_META[base].a || [], family: RAW_META[base].f || [] };
        }
    }
    return { synonyms: [], antonyms: [], family: [] };
}
