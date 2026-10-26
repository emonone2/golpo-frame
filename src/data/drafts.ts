import type { Bilingual } from '../lib/i18n'
import type { GenreId } from '../types'

interface Draft {
  caption: Bilingual
  dialogue: Bilingual
}

export const drafts: Record<GenreId, Draft[]> = {
  action: [
    {
      caption: { en: 'The clock is ticking.', bn: 'সময় ফুরিয়ে আসছে।' },
      dialogue: { en: "I won't back down!", bn: 'আমি পিছু হটব না!' },
    },
    {
      caption: { en: 'One move decides everything.', bn: 'একটি চালেই সব ঠিক হবে।' },
      dialogue: { en: 'Here I come!', bn: 'এই আমি আসছি!' },
    },
  ],
  romance: [
    {
      caption: { en: 'Their eyes met for a moment.', bn: 'এক মুহূর্তের জন্য চোখ মিলল।' },
      dialogue: { en: "I didn't expect to see you here.", bn: 'তোমাকে এখানে দেখব ভাবিনি।' },
    },
    {
      caption: { en: 'Her heart was louder than the rain.', bn: 'বৃষ্টির চেয়েও জোরে বাজছিল তার হৃদয়।' },
      dialogue: { en: 'Stay a little longer?', bn: 'আর একটু থাকবে?' },
    },
  ],
  fantasy: [
    {
      caption: { en: 'An old magic began to stir.', bn: 'এক পুরনো জাদু জেগে উঠল।' },
      dialogue: { en: 'The legend is true.', bn: 'কিংবদন্তিটা সত্যি ছিল।' },
    },
    {
      caption: { en: 'The gate shimmered open.', bn: 'দরজাটা ঝলমল করে খুলে গেল।' },
      dialogue: { en: 'Only the chosen may enter.', bn: 'শুধু বাছাই করা কেউই ঢুকতে পারে।' },
    },
  ],
  scifi: [
    {
      caption: { en: 'Systems came online, one by one.', bn: 'একে একে সিস্টেম চালু হলো।' },
      dialogue: { en: 'Signal detected. It is not ours.', bn: 'সংকেত পাওয়া গেছে। এটা আমাদের নয়।' },
    },
    {
      caption: { en: 'The city never slept.', bn: 'শহরটা কখনও ঘুমায় না।' },
      dialogue: { en: 'Run the scan again.', bn: 'স্ক্যানটা আবার চালাও।' },
    },
  ],
  horror: [
    {
      caption: { en: 'Something moved in the dark.', bn: 'অন্ধকারে কিছু একটা নড়ল।' },
      dialogue: { en: 'Did you hear that?', bn: 'শুনলে কিছু?' },
    },
    {
      caption: { en: 'The door was open. It had been locked.', bn: 'দরজা খোলা। অথচ ওটা তালাবন্ধ ছিল।' },
      dialogue: { en: "Don't turn around.", bn: 'পেছনে ফিরো না।' },
    },
  ],
  comedy: [
    {
      caption: { en: 'It seemed like a good idea at the time.', bn: 'তখন আইডিয়াটা ভালোই মনে হয়েছিল।' },
      dialogue: { en: 'Okay, who ate my biryani?!', bn: 'ঠিক আছে, আমার বিরিয়ানি কে খেয়েছে?!' },
    },
    {
      caption: { en: 'Nobody saw it coming.', bn: 'কেউ এটা আসতে দেখেনি।' },
      dialogue: { en: 'That was on purpose!', bn: 'ওটা ইচ্ছে করেই করেছি!' },
    },
  ],
}
