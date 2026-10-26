import type { GenreId, HumorStyle } from '../../types'

export type TopicId = 'exam' | 'late' | 'deadline' | 'food' | 'general'
export type BeatId =
  | 'setup'
  | 'plan'
  | 'trouble'
  | 'friend'
  | 'escalate'
  | 'desperate'
  | 'twist'
  | 'punchline'

export interface TopicText {
  title: string
  place: string
  goal: string
  problem: string
  escalate: string
  desperate: string
  twist: string
  panic: string
  punch: string
  authority: { name: string; role: string }
}

export interface Ctx {
  hero: string
  friend: string
  auth: string
  t: TopicText
  excerpt: string
  reaction: string
  quip: string
  tail: string
  flavor: string
}

export interface Beat {
  scene: string
  caption: string
  speaker: string
  dialogue: string
}

export interface Pack {
  defaults: { hero: string; friends: string[] }
  roles: { hero: string; friend: string }
  topics: Record<TopicId, TopicText>
  genre: Record<GenreId, string>
  humor: Record<HumorStyle, { flavor: string; reactions: string[]; tail: string }>
  quips: string[]
  styleSuffix: (tag: string) => string
  title: (hero: string, t: TopicText) => string
  summary: (hero: string, t: TopicText) => string
  beats: Record<BeatId, (c: Ctx) => Beat>
}

export const EN: Pack = {
  defaults: { hero: 'Rafi', friends: ['Nusrat', 'Tamim'] },
  roles: { hero: 'Student protagonist', friend: 'Best friend' },
  topics: {
    exam: {
      title: 'The Upside-Down Paper',
      place: 'the exam hall',
      goal: 'ace this quiz',
      problem: 'the question paper makes no sense at all',
      escalate: 'everyone else is already writing, pens scratching like rain',
      desperate: 'answers with total confidence and a very dramatic pause',
      twist: 'the paper was upside down',
      panic: 'Why do I recognise nothing?!',
      punch: 'Lesson learned: always read the paper the right way up.',
      authority: { name: 'Mr. Karim', role: 'Invigilator' },
    },
    late: {
      title: 'The Great Gate Dash',
      place: 'the college gate',
      goal: 'reach class on time for once',
      problem: 'the alarm never rang and the bus has just left',
      escalate: 'the gate is closing while a line of students watches',
      desperate: 'sprints down the corridor like a movie hero',
      twist: 'the teacher was running even later',
      panic: 'Not again! I am so late!',
      punch: 'Being late is fine when the teacher is later.',
      authority: { name: 'Guard Uncle', role: 'Gate guard' },
    },
    deadline: {
      title: 'The Fake Deadline',
      place: 'a hostel room at midnight',
      goal: 'finish the assignment early for once',
      problem: 'the laptop is at 1% battery and the deadline is in an hour',
      escalate: 'the group chat is exploding with fifty panicked messages',
      desperate: 'types at superhuman speed with a snack in each hand',
      twist: 'the deadline had been extended by a day',
      panic: 'Battery, please hold on!',
      punch: 'The deadline was fake. The panic was real.',
      authority: { name: "Ma'am Rahman", role: 'Course teacher' },
    },
    food: {
      title: 'The Last Plate',
      place: 'the crowded canteen',
      goal: 'grab the last plate of biryani',
      problem: 'someone has just ordered the last plate',
      escalate: 'the queue grows longer while the smell of biryani fills the air',
      desperate: 'pleads politely with the biggest puppy eyes on campus',
      twist: 'the canteen uncle had secretly saved one plate',
      panic: 'No! Not the last plate!',
      punch: 'Friendship means sharing biryani. Mostly.',
      authority: { name: 'Canteen Uncle', role: 'Canteen owner' },
    },
    general: {
      title: 'Just Another Campus Day',
      place: 'the campus',
      goal: 'get through one normal day',
      problem: 'one tiny mix-up snowballs into a huge scene',
      escalate: 'half the campus is suddenly watching',
      desperate: 'tries to look perfectly calm',
      twist: 'it was a harmless misunderstanding all along',
      panic: 'This is not what I planned!',
      punch: 'On campus, no day is ever just a normal day.',
      authority: { name: 'Teacher', role: 'Class teacher' },
    },
  },
  genre: {
    action: 'bold speed lines and impact frames',
    romance: 'soft pastel glow and sparkles',
    fantasy: 'glowing magical atmosphere',
    scifi: 'neon lights and holographic details',
    horror: 'long shadows and a tense mood',
    comedy: 'bright colors and big expressions',
  },
  humor: {
    witty: {
      flavor: 'dry, deadpan framing',
      reactions: ['Technically, this is a learning experience.', 'I regret nothing. Mostly.', "Let's call this strategic improvisation."],
      tail: '',
    },
    slapstick: {
      flavor: 'exaggerated pratfalls with comic sound effects',
      reactions: ['AAAH! Everything is falling apart!', 'Nobody look at me!', 'Watch this move... oh no.'],
      tail: ' *thud*',
    },
    wholesome: {
      flavor: 'warm, gentle lighting',
      reactions: ["It's okay. I'll try again.", 'At least my friends are here.', "Deep breath. We've got this."],
      tail: ' At least we had each other.',
    },
    absurd: {
      flavor: 'surreal, over-the-top imagery',
      reactions: ['Time is a circle and I am late to it.', 'Even the ceiling fan is judging me.', 'I summon the ancient spirit of last-minute luck!'],
      tail: ' (A pigeon nodded in agreement.)',
    },
  },
  quips: ['I told you so. Kind of.', "I'm not laughing. I'm definitely laughing.", 'Should I film this? For safety?'],
  styleSuffix: (tag) => `Style: ${tag}.`,
  title: (hero, t) => `${hero}: ${t.title}`,
  summary: (hero, t) => `${hero} wanted to ${t.goal}, but ${t.problem}. In the end, ${t.twist}.`,
  beats: {
    setup: (c) => ({
      scene: `Wide shot: ${c.hero} at ${c.t.place}. The student's story: "${c.excerpt}"`,
      caption: `${c.hero} wanted to ${c.t.goal}.`,
      speaker: c.hero,
      dialogue: 'Today is going to be easy.',
    }),
    plan: (c) => ({
      scene: `Close-up: ${c.hero} looks confident while ${c.friend} raises an eyebrow.`,
      caption: 'The plan sounded perfect.',
      speaker: c.friend,
      dialogue: 'Are you sure about this plan?',
    }),
    trouble: (c) => ({
      scene: `${c.hero} freezes as ${c.t.problem}.`,
      caption: `Then, ${c.t.problem}.`,
      speaker: c.hero,
      dialogue: c.t.panic,
    }),
    friend: (c) => ({
      scene: `${c.friend} leans in, trying not to laugh.`,
      caption: 'Help arrived. Sort of.',
      speaker: c.friend,
      dialogue: c.quip,
    }),
    escalate: (c) => ({
      scene: `The panel fills with chaos: ${c.t.escalate}.`,
      caption: 'Somehow, it got worse.',
      speaker: c.auth,
      dialogue: 'Is there a problem here?',
    }),
    desperate: (c) => ({
      scene: `${c.hero} ${c.t.desperate}. Tone: ${c.flavor}.`,
      caption: `${c.hero} had one move left.`,
      speaker: c.hero,
      dialogue: c.reaction,
    }),
    twist: (c) => ({
      scene: `Reveal shot: ${c.t.twist}.`,
      caption: 'Then the truth came out.',
      speaker: c.auth,
      dialogue: `Relax, ${c.t.twist}.`,
    }),
    punchline: (c) => ({
      scene: `Final panel: ${c.hero} stares at the reader while ${c.friend} grins. Tone: ${c.flavor}.`,
      caption: 'The moral of the day.',
      speaker: c.hero,
      dialogue: `${c.t.punch}${c.tail}`,
    }),
  },
}

export const BN: Pack = {
  defaults: { hero: 'রাফি', friends: ['নুসরাত', 'তামিম'] },
  roles: { hero: 'মূল চরিত্র, শিক্ষার্থী', friend: 'ঘনিষ্ঠ বন্ধু' },
  topics: {
    exam: {
      title: 'উল্টো প্রশ্নপত্র',
      place: 'পরীক্ষার হলে',
      goal: 'কুইজে সেরা নম্বর পেতে',
      problem: 'প্রশ্নপত্রের কিছুই মাথায় ঢুকছে না',
      escalate: 'সবাই খসখস করে লিখে চলেছে, কলমের শব্দ যেন বৃষ্টি',
      desperate: 'পুরো আত্মবিশ্বাসে নাটকীয় বিরতি দিয়ে উত্তর লিখতে শুরু করে',
      twist: 'প্রশ্নপত্রটা উল্টো ধরা ছিল',
      panic: 'এ কী! কিছুই চিনতে পারছি না!',
      punch: 'শিক্ষা: প্রশ্নপত্র সবসময় সোজা করে ধরতে হয়।',
      authority: { name: 'করিম স্যার', role: 'পরীক্ষার পর্যবেক্ষক' },
    },
    late: {
      title: 'গেটের দৌড়',
      place: 'কলেজের গেটে',
      goal: 'একদিন সময়মতো ক্লাসে পৌঁছাতে',
      problem: 'অ্যালার্ম বাজেনি আর বাসটাও এইমাত্র ছেড়ে গেল',
      escalate: 'গেট বন্ধ হচ্ছে আর লাইন ধরে সবাই তাকিয়ে আছে',
      desperate: 'সিনেমার নায়কের মতো করিডর ধরে দৌড় দেয়',
      twist: 'স্যার নিজেই আরও দেরিতে এসেছিলেন',
      panic: 'সর্বনাশ! আবার দেরি!',
      punch: 'স্যার আরও দেরিতে এলে দেরি করাও দোষের নয়।',
      authority: { name: 'দারোয়ান কাকু', role: 'গেটের দারোয়ান' },
    },
    deadline: {
      title: 'নকল ডেডলাইন',
      place: 'মাঝরাতের হোস্টেল রুমে',
      goal: 'এবার আগেভাগেই অ্যাসাইনমেন্ট শেষ করতে',
      problem: 'ল্যাপটপে চার্জ মাত্র ১% আর ডেডলাইন এক ঘণ্টা পরে',
      escalate: 'গ্রুপ চ্যাটে পঞ্চাশটা আতঙ্কের মেসেজ জমে গেছে',
      desperate: 'দুই হাতে নাস্তা নিয়ে অবিশ্বাস্য গতিতে টাইপ করে',
      twist: 'ডেডলাইন আসলে একদিন বাড়ানো হয়েছিল',
      panic: 'চার্জ, প্লিজ আর একটু টিকে থাকো!',
      punch: 'ডেডলাইন নকল ছিল, আতঙ্কটা সত্যি।',
      authority: { name: 'রহমান ম্যাডাম', role: 'কোর্স টিচার' },
    },
    food: {
      title: 'শেষ প্লেট',
      place: 'ভিড়ে ঠাসা ক্যান্টিনে',
      goal: 'শেষ প্লেট বিরিয়ানিটা পেতে',
      problem: 'কেউ এইমাত্র শেষ প্লেটটা অর্ডার করে ফেলেছে',
      escalate: 'লম্বা লাইন জমে গেছে আর বিরিয়ানির গন্ধে ভরে গেছে চারদিক',
      desperate: 'নরম গলায় ভদ্র বক্তৃতা দিয়ে আবেদন জানায়',
      twist: 'ক্যান্টিন কাকু চুপি চুপি একটা প্লেট সরিয়ে রেখেছিলেন',
      panic: 'না! শেষ প্লেটটাও গেল!',
      punch: 'বন্ধুত্ব মানে বিরিয়ানি ভাগ করা। প্রায় সবসময়।',
      authority: { name: 'ক্যান্টিন কাকু', role: 'ক্যান্টিনের মালিক' },
    },
    general: {
      title: 'আরেকটা সাধারণ ক্যাম্পাস দিন',
      place: 'ক্যাম্পাসে',
      goal: 'একটা সাধারণ দিন কাটাতে',
      problem: 'ছোট একটা ভুল বোঝাবুঝি বিশাল কাণ্ড হয়ে দাঁড়ায়',
      escalate: 'আধা ক্যাম্পাস হঠাৎ তাকিয়ে আছে',
      desperate: 'খুব শান্ত থাকার ভান করে',
      twist: 'পুরোটাই নিরীহ একটা ভুল বোঝাবুঝি ছিল',
      panic: 'এটা তো আমি চাইনি!',
      punch: 'ক্যাম্পাস জীবনে কোনো দিনই শুধু সাধারণ হয় না।',
      authority: { name: 'শিক্ষক', role: 'ক্লাস টিচার' },
    },
  },
  genre: {
    action: 'জোরালো গতির রেখা ও ইমপ্যাক্ট ফ্রেম',
    romance: 'নরম প্যাস্টেল আভা ও ঝিলিক',
    fantasy: 'জাদুময় আলোকিত পরিবেশ',
    scifi: 'নিওন আলো ও হলোগ্রাম',
    horror: 'দীর্ঘ ছায়া ও থমথমে পরিবেশ',
    comedy: 'উজ্জ্বল রঙ ও বড় অভিব্যক্তি',
  },
  humor: {
    witty: {
      flavor: 'শুকনো, ভাবলেশহীন ফ্রেমিং',
      reactions: ['আসলে এটাও একটা শেখার অভিজ্ঞতা।', 'আমার কোনো আফসোস নেই। প্রায়।', 'একে বলে কৌশলী উপস্থিত বুদ্ধি।'],
      tail: '',
    },
    slapstick: {
      flavor: 'বাড়াবাড়ি রকমের আছাড় ও মজার শব্দ',
      reactions: ['আ-আ-আ! সব ভেঙে পড়ছে!', 'কেউ আমার দিকে তাকিয়ো না!', 'দেখো আমার চাল... ওহ না।'],
      tail: ' *ধপাস*',
    },
    wholesome: {
      flavor: 'উষ্ণ, নরম আলো',
      reactions: ['ঠিক আছে। আবার চেষ্টা করব।', 'অন্তত বন্ধুরা তো পাশে আছে।', 'লম্বা শ্বাস নাও। আমরা পারব।'],
      tail: ' অন্তত আমরা একসাথে ছিলাম।',
    },
    absurd: {
      flavor: 'উদ্ভট, অতিনাটকীয় দৃশ্য',
      reactions: ['সময় একটা বৃত্ত, আর আমি তাতে দেরি করে ফেলেছি।', 'সিলিং ফ্যানটাও আমাকে বিচার করছে।', 'আমি শেষ মুহূর্তের ভাগ্যের আদিম আত্মাকে ডাকছি!'],
      tail: ' (একটা পায়রা সায় দিয়ে মাথা নাড়ল।)',
    },
  },
  quips: ['আমি বলেছিলাম না? প্রায়।', 'আমি হাসছি না। আসলে হাসছি।', 'ভিডিও করব নাকি? নিরাপত্তার জন্য?'],
  styleSuffix: (tag) => `শৈলী: ${tag}।`,
  title: (hero, t) => `${hero}: ${t.title}`,
  summary: (hero, t) => `${hero} ${t.goal} চেয়েছিল, কিন্তু ${t.problem}। শেষে দেখা গেল ${t.twist}।`,
  beats: {
    setup: (c) => ({
      scene: `ওয়াইড শট: ${c.t.place}, কেন্দ্রে ${c.hero}। শিক্ষার্থীর বর্ণনা: "${c.excerpt}"`,
      caption: `${c.hero} ${c.t.goal} চেয়েছিল।`,
      speaker: c.hero,
      dialogue: 'আজ সব সহজ হবে।',
    }),
    plan: (c) => ({
      scene: `ক্লোজ-আপ: ${c.hero} আত্মবিশ্বাসী, আর ${c.friend} ভুরু তুলে তাকিয়ে আছে।`,
      caption: 'প্ল্যানটা শুনতে একদম নিখুঁত ছিল।',
      speaker: c.friend,
      dialogue: 'তুমি কি এই প্ল্যান নিয়ে নিশ্চিত?',
    }),
    trouble: (c) => ({
      scene: `${c.hero} থমকে যায়: ${c.t.problem}।`,
      caption: `তারপর টের পেল, ${c.t.problem}।`,
      speaker: c.hero,
      dialogue: c.t.panic,
    }),
    friend: (c) => ({
      scene: `${c.friend} ঝুঁকে এসে হাসি চাপার চেষ্টা করছে।`,
      caption: 'সাহায্য এল। এক রকম।',
      speaker: c.friend,
      dialogue: c.quip,
    }),
    escalate: (c) => ({
      scene: `প্যানেলজুড়ে বিশৃঙ্খলা: ${c.t.escalate}।`,
      caption: 'কোনোভাবে পরিস্থিতি আরও খারাপ হলো।',
      speaker: c.auth,
      dialogue: 'এখানে কোনো সমস্যা হচ্ছে?',
    }),
    desperate: (c) => ({
      scene: `${c.hero} ${c.t.desperate}। হাস্যরস: ${c.flavor}।`,
      caption: 'হাতে একটাই চাল বাকি ছিল।',
      speaker: c.hero,
      dialogue: c.reaction,
    }),
    twist: (c) => ({
      scene: `রিভিলের দৃশ্য: ${c.t.twist}।`,
      caption: 'তারপর সত্যিটা বেরিয়ে এল।',
      speaker: c.auth,
      dialogue: `নিশ্চিন্ত হও, ${c.t.twist}।`,
    }),
    punchline: (c) => ({
      scene: `শেষ প্যানেল: ${c.hero} পাঠকের দিকে তাকিয়ে, ${c.friend} হাসছে। হাস্যরস: ${c.flavor}।`,
      caption: 'আজকের শিক্ষা।',
      speaker: c.hero,
      dialogue: `${c.t.punch}${c.tail}`,
    }),
  },
}
