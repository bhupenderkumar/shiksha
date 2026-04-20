import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/toast';
import { SCHOOL_INFO } from '@/lib/constants';
import { classService, type ClassType } from '@/services/classService';
import { sportsEnrollmentService } from '@/services/sportsEnrollmentService';

// ─── Language Types ────────────────────────────────────────────────────────────
type Lang = 'en' | 'hi';

// ─── Game Category ─────────────────────────────────────────────────────────────
type GameCategory = 'medal' | 'fun';

interface GameDetails {
  description: { en: string; hi: string };
  rules: { en: string[]; hi: string[] };
  players: { en: string; hi: string };
  duration: { en: string; hi: string };
  skillsLearned: { en: string[]; hi: string[] };
  funTip: { en: string; hi: string };
}

interface Game {
  en: string;
  hi: string;
  category: GameCategory;
  emoji: string;
  details?: GameDetails;
}

// ─── Game Details Database ─────────────────────────────────────────────────────
const gameDetailsDB: Record<string, GameDetails> = {
  'Ludo': {
    description: {
      en: 'A classic board game where players race their tokens from start to finish based on dice rolls. It teaches patience and strategy!',
      hi: 'एक क्लासिक बोर्ड गेम जहां खिलाड़ी पासे के आधार पर अपने टोकन को शुरू से अंत तक दौड़ाते हैं। यह धैर्य और रणनीति सिखाता है!',
    },
    rules: {
      en: ['Roll a 6 to bring a token out', 'Move tokens clockwise around the board', 'Land on opponent to send them back', 'First to get all 4 tokens home wins'],
      hi: ['टोकन बाहर लाने के लिए 6 लाएं', 'टोकनों को बोर्ड पर दक्षिणावर्त चलाएं', 'प्रतिद्वंद्वी पर उतरकर उन्हें वापस भेजें', 'पहले सभी 4 टोकन घर लाने वाला जीतता है'],
    },
    players: { en: '2-4 Players', hi: '2-4 खिलाड़ी' },
    duration: { en: '20-30 minutes', hi: '20-30 मिनट' },
    skillsLearned: {
      en: ['Patience', 'Counting', 'Strategy', 'Sportsmanship'],
      hi: ['धैर्य', 'गिनती', 'रणनीति', 'खेल भावना'],
    },
    funTip: { en: 'Cheer for your friends even when they roll a 6 before you! 🎉', hi: 'अपने दोस्तों का तब भी जश्न मनाएं जब वे आपसे पहले 6 लाएं! 🎉' },
  },
  'Chess': {
    description: {
      en: 'The king of board games! Chess develops critical thinking, planning, and problem-solving skills. Every move counts!',
      hi: 'बोर्ड गेम्स का राजा! शतरंज आलोचनात्मक सोच, योजना और समस्या-समाधान कौशल विकसित करता है। हर चाल मायने रखती है!',
    },
    rules: {
      en: ['Each piece moves in a specific pattern', 'Protect your King at all costs', 'Capture opponent\'s pieces strategically', 'Checkmate the opponent\'s King to win'],
      hi: ['हर मोहरा एक विशेष तरीके से चलता है', 'अपने राजा को हर कीमत पर बचाएं', 'रणनीतिक रूप से प्रतिद्वंद्वी के मोहरे पकड़ें', 'जीतने के लिए प्रतिद्वंद्वी के राजा को शह-मात दें'],
    },
    players: { en: '2 Players', hi: '2 खिलाड़ी' },
    duration: { en: '15-30 minutes', hi: '15-30 मिनट' },
    skillsLearned: {
      en: ['Critical Thinking', 'Planning', 'Focus', 'Decision Making'],
      hi: ['आलोचनात्मक सोच', 'योजना', 'एकाग्रता', 'निर्णय लेना'],
    },
    funTip: { en: 'Think 2 moves ahead — like a mini superhero! 🦸', hi: '2 चालें आगे सोचें — एक मिनी सुपरहीरो की तरह! 🦸' },
  },
  'Carrom Board': {
    description: {
      en: 'A tabletop game where players flick a striker to pocket carrom men. It\'s all about precision and gentle control!',
      hi: 'एक टेबलटॉप गेम जहां खिलाड़ी स्ट्राइकर से कैरम के गोटियों को पॉकेट में डालते हैं। यह सटीकता और नियंत्रण का खेल है!',
    },
    rules: {
      en: ['Use the striker to pocket your carrom men', 'Pocket the Queen and cover it', 'White or Black — choose your side', 'First to pocket all their pieces wins'],
      hi: ['स्ट्राइकर से अपनी गोटियां पॉकेट करें', 'रानी को पॉकेट करें और कवर करें', 'सफेद या काला — अपना पक्ष चुनें', 'पहले सभी गोटियां पॉकेट करने वाला जीतता है'],
    },
    players: { en: '2-4 Players', hi: '2-4 खिलाड़ी' },
    duration: { en: '15-25 minutes', hi: '15-25 मिनट' },
    skillsLearned: {
      en: ['Fine Motor Skills', 'Aim & Precision', 'Hand-eye Coordination', 'Patience'],
      hi: ['बारीक मोटर कौशल', 'निशाना और सटीकता', 'हाथ-आँख समन्वय', 'धैर्य'],
    },
    funTip: { en: 'Keep your striker smooth with a little powder — swoosh! 💨', hi: 'स्ट्राइकर को थोड़ा पाउडर लगाकर चिकना रखें — स्वूश! 💨' },
  },
  'Bowling Game': {
    description: {
      en: 'Roll the ball and knock down as many pins as possible! Great for building arm strength and coordination.',
      hi: 'गेंद लुढ़काएं और ज्यादा से ज्यादा पिन गिराएं! यह बाहों की ताकत और समन्वय बनाने के लिए बढ़िया है।',
    },
    rules: {
      en: ['Stand behind the line', 'Roll the ball to knock down pins', 'Each player gets 2 attempts per round', 'Most pins knocked down wins'],
      hi: ['लाइन के पीछे खड़े हों', 'पिन गिराने के लिए गेंद लुढ़काएं', 'हर खिलाड़ी को प्रति राउंड 2 प्रयास मिलते हैं', 'सबसे ज्यादा पिन गिराने वाला जीतता है'],
    },
    players: { en: 'Individual', hi: 'व्यक्तिगत' },
    duration: { en: '5-10 minutes per turn', hi: '5-10 मिनट प्रति बारी' },
    skillsLearned: {
      en: ['Aim', 'Arm Strength', 'Focus', 'Coordination'],
      hi: ['निशाना', 'बाजू की ताकत', 'एकाग्रता', 'समन्वय'],
    },
    funTip: { en: 'Imagine the pins are bowling to you — strike! 🎳', hi: 'सोचें कि पिन आपको बुला रहे हैं — स्ट्राइक! 🎳' },
  },
  'Basketball': {
    description: {
      en: 'Dribble, pass, and shoot! Basketball improves teamwork, agility, and height awareness. Score baskets to win!',
      hi: 'ड्रिबल करें, पास करें, और शूट करें! बास्केटबॉल टीमवर्क, चपलता और ऊंचाई जागरूकता में सुधार करता है। जीतने के लिए बास्केट स्कोर करें!',
    },
    rules: {
      en: ['Dribble the ball while moving', 'Pass to teammates', 'Shoot the ball into the hoop', 'Team with most baskets wins'],
      hi: ['चलते हुए गेंद को ड्रिबल करें', 'साथियों को पास दें', 'गेंद को हूप में डालें', 'सबसे ज्यादा बास्केट बनाने वाली टीम जीतती है'],
    },
    players: { en: 'Teams of 3-5', hi: '3-5 की टीम' },
    duration: { en: '15-20 minutes', hi: '15-20 मिनट' },
    skillsLearned: {
      en: ['Teamwork', 'Agility', 'Hand-eye Coordination', 'Physical Fitness'],
      hi: ['टीमवर्क', 'चपलता', 'हाथ-आँख समन्वय', 'शारीरिक फिटनेस'],
    },
    funTip: { en: 'Even if you miss, keep shooting — every pro was once a beginner! 🏀', hi: 'अगर मिस हो जाए, तो भी शूट करते रहें — हर प्रो कभी शुरुआती था! 🏀' },
  },
  'Chair Game (Musical Chairs)': {
    description: {
      en: 'Music plays, everyone walks around chairs. When the music stops — grab a seat fast! The most exciting party game ever!',
      hi: 'संगीत बजता है, सब कुर्सियों के चारों ओर चलते हैं। जब संगीत रुकता है — जल्दी से कुर्सी पकड़ो! सबसे रोमांचक पार्टी गेम!',
    },
    rules: {
      en: ['Walk around chairs when music plays', 'Sit down immediately when music stops', 'One chair is removed each round', 'Last person sitting wins!'],
      hi: ['संगीत बजने पर कुर्सियों के चारों ओर चलें', 'संगीत रुकने पर तुरंत बैठ जाएं', 'हर राउंड में एक कुर्सी हटाई जाती है', 'आखिरी बैठने वाला जीतता है!'],
    },
    players: { en: '5-15 Players', hi: '5-15 खिलाड़ी' },
    duration: { en: '10-15 minutes', hi: '10-15 मिनट' },
    skillsLearned: {
      en: ['Quick Reflexes', 'Listening', 'Alertness', 'Fun & Laughter'],
      hi: ['तेज प्रतिक्रिया', 'सुनना', 'सतर्कता', 'मस्ती और हंसी'],
    },
    funTip: { en: 'Stay close to a chair but don\'t bump into friends! 💺', hi: 'कुर्सी के पास रहें लेकिन दोस्तों से न टकराएं! 💺' },
  },
  'Simple Race': {
    description: {
      en: 'Ready, set, GO! The classic running race from start to finish line. It\'s pure speed and determination!',
      hi: 'तैयार, सेट, भागो! शुरुआत से फिनिश लाइन तक की क्लासिक दौड़। यह शुद्ध गति और दृढ़ संकल्प है!',
    },
    rules: {
      en: ['Stand at the start line', 'Wait for the whistle', 'Run as fast as you can', 'First to cross the finish line wins!'],
      hi: ['स्टार्ट लाइन पर खड़े हों', 'सीटी का इंतजार करें', 'जितना तेज हो सके दौड़ें', 'फिनिश लाइन पार करने वाला पहला जीतता है!'],
    },
    players: { en: '4-8 per heat', hi: 'प्रति हीट 4-8' },
    duration: { en: '2-5 minutes', hi: '2-5 मिनट' },
    skillsLearned: {
      en: ['Speed', 'Stamina', 'Determination', 'Sportsmanship'],
      hi: ['गति', 'सहनशक्ति', 'दृढ़ संकल्प', 'खेल भावना'],
    },
    funTip: { en: 'Pump your arms and look straight ahead — you\'re a rocket! 🚀', hi: 'अपनी बाजू चलाएं और सीधे आगे देखें — आप रॉकेट हैं! 🚀' },
  },
  'Frog Race': {
    description: {
      en: 'Hop like a frog from start to finish! Squat down and jump forward — it\'s hilarious and great for leg muscles!',
      hi: 'शुरू से अंत तक मेंढक की तरह कूदें! बैठकर आगे कूदें — यह मजेदार है और पैर की मांसपेशियों के लिए बढ़िया!',
    },
    rules: {
      en: ['Squat down in frog position', 'Jump forward like a frog', 'No standing up or running allowed', 'First frog to reach the finish wins!'],
      hi: ['मेंढक की तरह बैठें', 'मेंढक की तरह आगे कूदें', 'खड़े होना या दौड़ना मना है', 'फिनिश पर पहुंचने वाला पहला मेंढक जीतता है!'],
    },
    players: { en: '4-8 per heat', hi: 'प्रति हीट 4-8' },
    duration: { en: '3-5 minutes', hi: '3-5 मिनट' },
    skillsLearned: {
      en: ['Leg Strength', 'Balance', 'Coordination', 'Laughter'],
      hi: ['पैर की ताकत', 'संतुलन', 'समन्वय', 'हंसी'],
    },
    funTip: { en: 'Make frog sounds while hopping — ribbit ribbit! 🐸', hi: 'कूदते हुए मेंढक की आवाज निकालें — टर्र टर्र! 🐸' },
  },
  'Ball Collection Race': {
    description: {
      en: 'Balls are scattered in the field — run, collect as many balls as possible, and bring them back to your basket!',
      hi: 'मैदान में गेंदें बिखरी हैं — दौड़ें, ज्यादा से ज्यादा गेंदें इकट्ठा करें, और अपनी टोकरी में लाएं!',
    },
    rules: {
      en: ['Collect one ball at a time', 'Run back and drop it in your basket', 'No throwing — place balls gently', 'Most balls collected in time wins!'],
      hi: ['एक बार में एक गेंद उठाएं', 'वापस दौड़कर टोकरी में डालें', 'फेंकना मना — गेंद धीरे रखें', 'समय में सबसे ज्यादा गेंदें इकट्ठा करने वाला जीतता है!'],
    },
    players: { en: '4-10 Players', hi: '4-10 खिलाड़ी' },
    duration: { en: '5-8 minutes', hi: '5-8 मिनट' },
    skillsLearned: {
      en: ['Speed', 'Agility', 'Quick Thinking', 'Competition'],
      hi: ['गति', 'चपलता', 'तेज सोच', 'प्रतिस्पर्धा'],
    },
    funTip: { en: 'Plan your route — pick the closest balls first! ⚽', hi: 'अपना रास्ता बनाएं — पहले सबसे करीब वाली गेंदें उठाएं! ⚽' },
  },
  'Team Race': {
    description: {
      en: 'Teamwork makes the dream work! Run together as a team in a relay-style race. Pass the baton and cheer your teammates!',
      hi: 'टीमवर्क से सपने सच होते हैं! रिले-स्टाइल रेस में एक टीम के रूप में दौड़ें। बैटन पास करें और अपनी टीम का जोश बढ़ाएं!',
    },
    rules: {
      en: ['Teams of 4-5 members', 'Each member runs their leg', 'Pass the baton smoothly', 'Fastest team to finish wins!'],
      hi: ['4-5 सदस्यों की टीम', 'हर सदस्य अपना हिस्सा दौड़ता है', 'बैटन सही से पास करें', 'सबसे तेज टीम जीतती है!'],
    },
    players: { en: 'Teams of 4-5', hi: '4-5 की टीम' },
    duration: { en: '10-15 minutes', hi: '10-15 मिनट' },
    skillsLearned: {
      en: ['Teamwork', 'Coordination', 'Speed', 'Leadership'],
      hi: ['टीमवर्क', 'समन्वय', 'गति', 'नेतृत्व'],
    },
    funTip: { en: 'Cheer loud for your team — noise = energy! 🤝', hi: 'अपनी टीम के लिए जोर से चीयर करें — शोर = ऊर्जा! 🤝' },
  },
  'Rabbit Race': {
    description: {
      en: 'Hop hop hop! Like bunnies, children hop with both feet together from start to finish. Adorable and fun!',
      hi: 'कूद कूद कूद! खरगोश की तरह, बच्चे दोनों पैर एक साथ रखकर शुरू से अंत तक कूदते हैं। प्यारा और मजेदार!',
    },
    rules: {
      en: ['Keep both feet together', 'Hop forward — no running!', 'Stay in your lane', 'First bunny to finish wins!'],
      hi: ['दोनों पैर एक साथ रखें', 'आगे कूदें — दौड़ना मना!', 'अपनी लेन में रहें', 'पहले खत्म करने वाला खरगोश जीतता है!'],
    },
    players: { en: '4-8 per heat', hi: 'प्रति हीट 4-8' },
    duration: { en: '3-5 minutes', hi: '3-5 मिनट' },
    skillsLearned: {
      en: ['Balance', 'Leg Strength', 'Fun', 'Coordination'],
      hi: ['संतुलन', 'पैर की ताकत', 'मस्ती', 'समन्वय'],
    },
    funTip: { en: 'Wiggle your nose like a real rabbit! 🐰', hi: 'असली खरगोश की तरह नाक हिलाएं! 🐰' },
  },
  'Jump Race': {
    description: {
      en: 'A high-energy jumping race! Long jumps, high jumps — show off your best leaps and fly through the air!',
      hi: 'एक ऊर्जावान कूद दौड़! लंबी कूद, ऊंची कूद — अपनी बेहतरीन छलांग दिखाएं और हवा में उड़ें!',
    },
    rules: {
      en: ['Jump over obstacles in sequence', 'Land safely on both feet', 'Don\'t skip any obstacle', 'Fastest completion wins!'],
      hi: ['बाधाओं पर क्रम में कूदें', 'दोनों पैरों पर सुरक्षित उतरें', 'कोई बाधा न छोड़ें', 'सबसे तेज पूरा करने वाला जीतता है!'],
    },
    players: { en: '4-6 per heat', hi: 'प्रति हीट 4-6' },
    duration: { en: '3-5 minutes', hi: '3-5 मिनट' },
    skillsLearned: {
      en: ['Jumping Power', 'Agility', 'Courage', 'Body Control'],
      hi: ['कूदने की शक्ति', 'चपलता', 'साहस', 'शरीर नियंत्रण'],
    },
    funTip: { en: 'Bend your knees before jumping — spring like a kangaroo! 🦘', hi: 'कूदने से पहले घुटने मोड़ें — कंगारू की तरह उछलें! 🦘' },
  },
  'Hurdle Race': {
    description: {
      en: 'Sprint and jump over hurdles! This exciting race tests your speed and jumping ability together.',
      hi: 'दौड़ें और बाधाओं पर कूदें! यह रोमांचक दौड़ आपकी गति और कूदने की क्षमता दोनों की परीक्षा लेती है।',
    },
    rules: {
      en: ['Run towards each hurdle', 'Jump over without knocking it down', 'Continue to the finish line', 'Fastest runner wins!'],
      hi: ['हर बाधा की ओर दौड़ें', 'बिना गिराए ऊपर से कूदें', 'फिनिश लाइन तक जारी रखें', 'सबसे तेज दौड़ने वाला जीतता है!'],
    },
    players: { en: '4-6 per heat', hi: 'प्रति हीट 4-6' },
    duration: { en: '3-5 minutes', hi: '3-5 मिनट' },
    skillsLearned: {
      en: ['Speed', 'Agility', 'Jumping', 'Determination'],
      hi: ['गति', 'चपलता', 'कूदना', 'दृढ़ संकल्प'],
    },
    funTip: { en: 'Don\'t slow down — the hurdles are shorter than you think! 🏃‍♂️', hi: 'धीमे न हों — बाधाएं आपकी सोच से छोटी हैं! 🏃‍♂️' },
  },
  'Color Game': {
    description: {
      en: 'When a color is called out, run and touch that color! It\'s a colorful game of speed and recognition.',
      hi: 'जब रंग का नाम बोला जाए, दौड़कर उस रंग को छूएं! यह गति और पहचान का रंगीन खेल है।',
    },
    rules: {
      en: ['Teacher calls out a color', 'Run and touch that colored object', 'Last person is out', 'Last one standing wins!'],
      hi: ['शिक्षक रंग बोलता है', 'दौड़कर उस रंग की वस्तु छूएं', 'आखिरी व्यक्ति बाहर', 'आखिरी खड़ा व्यक्ति जीतता है!'],
    },
    players: { en: '10-20 Players', hi: '10-20 खिलाड़ी' },
    duration: { en: '10-15 minutes', hi: '10-15 मिनट' },
    skillsLearned: {
      en: ['Color Recognition', 'Quick Reflexes', 'Listening', 'Awareness'],
      hi: ['रंग पहचान', 'तेज प्रतिक्रिया', 'सुनना', 'जागरूकता'],
    },
    funTip: { en: 'Look around before the game starts — memorize where colors are! 🎨', hi: 'खेल शुरू होने से पहले चारों ओर देखें — याद रखें रंग कहाँ हैं! 🎨' },
  },
  'Match Same Race Game': {
    description: {
      en: 'Find the matching pair! Cards or objects are placed face-down — run, flip, and find the matches. Memory meets speed!',
      hi: 'मिलता जुलता जोड़ा ढूंढें! कार्ड या वस्तुएं उल्टी रखी हैं — दौड़ें, पलटें, और जोड़ा ढूंढें। याददाश्त और गति का मिलान!',
    },
    rules: {
      en: ['Run to the cards', 'Flip two at a time', 'If they match, keep them', 'Most pairs collected wins!'],
      hi: ['कार्ड की ओर दौड़ें', 'एक बार में दो पलटें', 'अगर मिलते हैं, तो रख लें', 'सबसे ज्यादा जोड़े इकट्ठा करने वाला जीतता है!'],
    },
    players: { en: '4-8 Players', hi: '4-8 खिलाड़ी' },
    duration: { en: '8-12 minutes', hi: '8-12 मिनट' },
    skillsLearned: {
      en: ['Memory', 'Speed', 'Observation', 'Focus'],
      hi: ['याददाश्त', 'गति', 'अवलोकन', 'एकाग्रता'],
    },
    funTip: { en: 'Pay attention to what others flip — you can learn from them! 🔗', hi: 'दूसरे क्या पलटते हैं ध्यान दें — उनसे सीख सकते हैं! 🔗' },
  },
  'Balance Game (Sit & Stand)': {
    description: {
      en: 'Test your balance! Follow commands to sit and stand — but with a twist! Try balancing on one foot or with eyes closed.',
      hi: 'अपना संतुलन जांचें! बैठने और खड़े होने के आदेशों का पालन करें — लेकिन एक ट्विस्ट के साथ! एक पैर पर या आंखें बंद करके संतुलन बनाएं।',
    },
    rules: {
      en: ['Follow the teacher\'s commands', 'Sit, stand, or balance as told', 'Don\'t wobble or fall!', 'Last one balanced wins!'],
      hi: ['शिक्षक के आदेशों का पालन करें', 'बताए अनुसार बैठें, खड़े हों या संतुलन बनाएं', 'डगमगाएं या गिरें नहीं!', 'आखिरी संतुलन बनाने वाला जीतता है!'],
    },
    players: { en: '10-20 Players', hi: '10-20 खिलाड़ी' },
    duration: { en: '10-15 minutes', hi: '10-15 मिनट' },
    skillsLearned: {
      en: ['Balance', 'Body Control', 'Listening', 'Core Strength'],
      hi: ['संतुलन', 'शरीर नियंत्रण', 'सुनना', 'कोर ताकत'],
    },
    funTip: { en: 'Focus on one point on the wall — it helps you balance! 🧘', hi: 'दीवार पर एक बिंदु पर ध्यान लगाएं — यह संतुलन में मदद करता है! 🧘' },
  },
  'Long Jump / Small Jump': {
    description: {
      en: 'How far can you jump? Take a running start and leap as far as possible! Test your explosive leg power.',
      hi: 'आप कितना दूर कूद सकते हैं? दौड़ते हुए आएं और जितना दूर हो सके कूदें! अपने पैरों की विस्फोटक शक्ति जांचें।',
    },
    rules: {
      en: ['Stand at or run to the jumping line', 'Jump as far as you can', 'Land on both feet', 'Longest distance wins!'],
      hi: ['जंपिंग लाइन पर खड़े हों या दौड़कर आएं', 'जितना दूर हो सके कूदें', 'दोनों पैरों पर उतरें', 'सबसे लंबी दूरी जीतती है!'],
    },
    players: { en: 'Individual', hi: 'व्यक्तिगत' },
    duration: { en: '2-3 minutes per turn', hi: '2-3 मिनट प्रति बारी' },
    skillsLearned: {
      en: ['Leg Power', 'Coordination', 'Technique', 'Confidence'],
      hi: ['पैर की शक्ति', 'समन्वय', 'तकनीक', 'आत्मविश्वास'],
    },
    funTip: { en: 'Swing your arms forward as you jump — it adds distance! 📏', hi: 'कूदते समय बाजू आगे की ओर झुलाएं — यह दूरी बढ़ाता है! 📏' },
  },
  'Badminton': {
    description: {
      en: 'Smash, drop, and rally! Badminton is a fast-paced racquet sport that improves reflexes and hand-eye coordination.',
      hi: 'स्मैश, ड्रॉप और रैली! बैडमिंटन एक तेज गति वाला रैकेट खेल है जो प्रतिक्रिया और हाथ-आँख समन्वय सुधारता है।',
    },
    rules: {
      en: ['Serve diagonally', 'Hit the shuttlecock over the net', 'Don\'t let it touch the ground on your side', 'Score 11 points to win!'],
      hi: ['तिरछे सर्व करें', 'शटलकॉक को जाल के ऊपर मारें', 'अपनी तरफ ज़मीन पर न गिरने दें', 'जीतने के लिए 11 अंक बनाएं!'],
    },
    players: { en: '2 Players (Singles)', hi: '2 खिलाड़ी (सिंगल्स)' },
    duration: { en: '10-15 minutes', hi: '10-15 मिनट' },
    skillsLearned: {
      en: ['Reflexes', 'Agility', 'Hand-eye Coordination', 'Stamina'],
      hi: ['प्रतिक्रिया', 'चपलता', 'हाथ-आँख समन्वय', 'सहनशक्ति'],
    },
    funTip: { en: 'Watch the shuttlecock, not the opponent — your eyes guide your racquet! 🏸', hi: 'शटलकॉक देखें, प्रतिद्वंद्वी नहीं — आपकी आंखें रैकेट को गाइड करती हैं! 🏸' },
  },
  'Chair Game': {
    description: {
      en: 'Music plays, everyone walks around chairs. When the music stops — grab a seat fast! The most thrilling party game!',
      hi: 'संगीत बजता है, सब कुर्सियों के चारों ओर चलते हैं। जब संगीत रुकता है — जल्दी से कुर्सी पकड़ो! सबसे रोमांचक पार्टी गेम!',
    },
    rules: {
      en: ['Walk around chairs when music plays', 'Sit down when music stops', 'One chair removed each round', 'Last person sitting wins!'],
      hi: ['संगीत बजने पर कुर्सियों के चारों ओर चलें', 'संगीत रुकने पर बैठ जाएं', 'हर राउंड में एक कुर्सी हटाई जाती है', 'आखिरी बैठने वाला जीतता है!'],
    },
    players: { en: '5-15 Players', hi: '5-15 खिलाड़ी' },
    duration: { en: '10-15 minutes', hi: '10-15 मिनट' },
    skillsLearned: {
      en: ['Quick Reflexes', 'Listening', 'Alertness', 'Fun'],
      hi: ['तेज प्रतिक्रिया', 'सुनना', 'सतर्कता', 'मस्ती'],
    },
    funTip: { en: 'Stay light on your feet — be ready to sit anytime! 💺', hi: 'पैरों पर हल्के रहें — कभी भी बैठने के लिए तैयार रहें! 💺' },
  },
  'Football': {
    description: {
      en: 'The world\'s most popular sport! Dribble, pass, and score goals. Football builds stamina, teamwork, and football IQ.',
      hi: 'दुनिया का सबसे लोकप्रिय खेल! ड्रिबल करें, पास करें, और गोल करें। फुटबॉल सहनशक्ति, टीमवर्क और फुटबॉल IQ बनाता है।',
    },
    rules: {
      en: ['No hands — feet only!', 'Pass to teammates', 'Score by kicking into the goal', 'Team with most goals wins!'],
      hi: ['हाथ नहीं — सिर्फ पैर!', 'साथियों को पास दें', 'गोल में किक करके स्कोर करें', 'सबसे ज्यादा गोल वाली टीम जीतती है!'],
    },
    players: { en: 'Teams of 5-7', hi: '5-7 की टीम' },
    duration: { en: '15-20 minutes', hi: '15-20 मिनट' },
    skillsLearned: {
      en: ['Teamwork', 'Stamina', 'Foot Coordination', 'Strategy'],
      hi: ['टीमवर्क', 'सहनशक्ति', 'पैर समन्वय', 'रणनीति'],
    },
    funTip: { en: 'Pass more than you dribble — teamwork scores goals! ⚽', hi: 'ड्रिबल से ज्यादा पास करें — टीमवर्क गोल करता है! ⚽' },
  },
  'Rhymes with Singing': {
    description: {
      en: 'Sing your favorite rhymes with actions! A wonderful activity that combines music, memory, and performance.',
      hi: 'अपनी पसंदीदा कविताएं एक्शन के साथ गाएं! एक शानदार गतिविधि जो संगीत, याददाश्त और प्रदर्शन को जोड़ती है।',
    },
    rules: {
      en: ['Sing clearly and loudly', 'Add matching actions', 'Express with facial emotions', 'Judges score on performance!'],
      hi: ['स्पष्ट और जोर से गाएं', 'मेल खाते एक्शन जोड़ें', 'चेहरे के भावों से व्यक्त करें', 'जजों द्वारा प्रदर्शन पर अंक!'],
    },
    players: { en: 'Individual or Groups', hi: 'व्यक्तिगत या समूह' },
    duration: { en: '3-5 minutes per performance', hi: '3-5 मिनट प्रति प्रदर्शन' },
    skillsLearned: {
      en: ['Memory', 'Confidence', 'Expression', 'Public Speaking'],
      hi: ['याददाश्त', 'आत्मविश्वास', 'अभिव्यक्ति', 'सार्वजनिक बोलना'],
    },
    funTip: { en: 'Smile while singing — smiles make everything better! 🎤', hi: 'गाते समय मुस्कुराएं — मुस्कान सब कुछ बेहतर बनाती है! 🎤' },
  },
  'Story with Actions': {
    description: {
      en: 'Tell a story and act it out! Children narrate a story while performing all the actions. Think of it as mini theater!',
      hi: 'कहानी सुनाएं और एक्ट करें! बच्चे कहानी सुनाते हुए सभी एक्शन करते हैं। इसे एक मिनी थिएटर की तरह सोचें!',
    },
    rules: {
      en: ['Choose a short story', 'Act out each scene', 'Use voice modulation', 'Make the audience laugh or feel emotions!'],
      hi: ['एक छोटी कहानी चुनें', 'हर दृश्य का अभिनय करें', 'आवाज बदलकर बोलें', 'दर्शकों को हंसाएं या भावुक करें!'],
    },
    players: { en: 'Individual or Groups', hi: 'व्यक्तिगत या समूह' },
    duration: { en: '5-8 minutes per performance', hi: '5-8 मिनट प्रति प्रदर्शन' },
    skillsLearned: {
      en: ['Creativity', 'Expression', 'Confidence', 'Communication'],
      hi: ['रचनात्मकता', 'अभिव्यक्ति', 'आत्मविश्वास', 'संवाद'],
    },
    funTip: { en: 'Be dramatic — the more expressive, the more fun! 🎭', hi: 'नाटकीय बनें — जितना ज्यादा अभिव्यक्त, उतना ज्यादा मज़ा! 🎭' },
  },
  'Action Game': {
    description: {
      en: 'Follow the leader! The teacher calls actions — jump, clap, spin, freeze! If you do the wrong action, you\'re out!',
      hi: 'नेता का पालन करें! शिक्षक एक्शन बोलता है — कूदो, ताली, घूमो, रुको! गलत एक्शन किया तो बाहर!',
    },
    rules: {
      en: ['Listen to the command carefully', 'Do the action quickly', 'Wrong action means you\'re out', 'Last one standing wins!'],
      hi: ['आदेश ध्यान से सुनें', 'जल्दी से एक्शन करें', 'गलत एक्शन मतलब बाहर', 'आखिरी खड़ा व्यक्ति जीतता है!'],
    },
    players: { en: '10-30 Players', hi: '10-30 खिलाड़ी' },
    duration: { en: '10-15 minutes', hi: '10-15 मिनट' },
    skillsLearned: {
      en: ['Listening', 'Quick Reflexes', 'Body Control', 'Focus'],
      hi: ['सुनना', 'तेज प्रतिक्रिया', 'शरीर नियंत्रण', 'एकाग्रता'],
    },
    funTip: { en: 'Don\'t watch others — trust your ears! 🎬', hi: 'दूसरों को न देखें — अपने कानों पर भरोसा करें! 🎬' },
  },
  'Balloon Race': {
    description: {
      en: 'Keep the balloon in the air while racing! Or carry it between your knees! A hilarious, bouncy race for everyone.',
      hi: 'दौड़ते हुए गुब्बारे को हवा में रखें! या घुटनों के बीच ले जाएं! सबके लिए एक मजेदार, उछलती दौड़।',
    },
    rules: {
      en: ['Keep the balloon in the air while running', 'Don\'t let it touch the ground', 'No holding the balloon with hands', 'First to reach finish with balloon wins!'],
      hi: ['दौड़ते हुए गुब्बारे को हवा में रखें', 'ज़मीन पर न गिरने दें', 'गुब्बारे को हाथ से न पकड़ें', 'गुब्बारे के साथ फिनिश तक पहुंचने वाला जीतता है!'],
    },
    players: { en: '4-8 per heat', hi: 'प्रति हीट 4-8' },
    duration: { en: '5-8 minutes', hi: '5-8 मिनट' },
    skillsLearned: {
      en: ['Coordination', 'Balance', 'Fun', 'Laughter'],
      hi: ['समन्वय', 'संतुलन', 'मस्ती', 'हंसी'],
    },
    funTip: { en: 'Gentle taps — balloons are delicate friends! 🎈', hi: 'हल्के से टच करें — गुब्बारे नाजुक दोस्त हैं! 🎈' },
  },
  'Cup and Ball Game': {
    description: {
      en: 'Balance a ball on a cup and race! Walk or run without dropping the ball — it needs a steady hand and focus.',
      hi: 'कप पर गेंद रखकर दौड़ें! गेंद गिराए बिना चलें या दौड़ें — इसमें स्थिर हाथ और एकाग्रता चाहिए।',
    },
    rules: {
      en: ['Place ball on the cup', 'Walk or run to the finish', 'If ball drops, go back to start', 'First to finish with ball on cup wins!'],
      hi: ['कप पर गेंद रखें', 'फिनिश तक चलें या दौड़ें', 'गेंद गिरी तो शुरू से वापस', 'कप पर गेंद के साथ फिनिश करने वाला जीतता है!'],
    },
    players: { en: '4-8 Players', hi: '4-8 खिलाड़ी' },
    duration: { en: '5-8 minutes', hi: '5-8 मिनट' },
    skillsLearned: {
      en: ['Steadiness', 'Balance', 'Patience', 'Focus'],
      hi: ['स्थिरता', 'संतुलन', 'धैर्य', 'एकाग्रता'],
    },
    funTip: { en: 'Look at the ball, not the finish line — slow and steady! 🥤', hi: 'गेंद को देखें, फिनिश लाइन नहीं — धीरे और स्थिर! 🥤' },
  },
  'Cup Tower Game': {
    description: {
      en: 'Stack cups into the tallest tower possible! A test of fine motor skills, patience, and steady hands.',
      hi: 'कप को सबसे ऊंचे टावर में लगाएं! बारीक मोटर कौशल, धैर्य और स्थिर हाथों की परीक्षा।',
    },
    rules: {
      en: ['Stack cups one on top of another', 'Build the tallest tower you can', 'If it falls, start over', 'Tallest standing tower wins!'],
      hi: ['कप एक के ऊपर एक लगाएं', 'जितना ऊंचा हो सके टावर बनाएं', 'गिर जाए तो फिर से शुरू', 'सबसे ऊंचा खड़ा टावर जीतता है!'],
    },
    players: { en: 'Individual', hi: 'व्यक्तिगत' },
    duration: { en: '3-5 minutes per turn', hi: '3-5 मिनट प्रति बारी' },
    skillsLearned: {
      en: ['Fine Motor Skills', 'Patience', 'Precision', 'Concentration'],
      hi: ['बारीक मोटर कौशल', 'धैर्य', 'सटीकता', 'एकाग्रता'],
    },
    funTip: { en: 'Breathe gently — even your breath can knock it down! 🏗️', hi: 'धीरे सांस लें — आपकी सांस भी इसे गिरा सकती है! 🏗️' },
  },
  'Balance Game Race': {
    description: {
      en: 'Carry an object (egg on spoon, book on head) while racing! Balance meets speed in this thrilling challenge.',
      hi: 'दौड़ते हुए एक वस्तु (चम्मच पर अंडा, सिर पर किताब) ले जाएं! इस रोमांचक चुनौती में संतुलन और गति मिलते हैं।',
    },
    rules: {
      en: ['Balance the object carefully', 'Walk or run to the finish', 'Don\'t drop it!', 'Fastest finisher wins!'],
      hi: ['वस्तु को ध्यान से संतुलित करें', 'फिनिश तक चलें या दौड़ें', 'गिराएं नहीं!', 'सबसे तेज फिनिश करने वाला जीतता है!'],
    },
    players: { en: '4-8 Players', hi: '4-8 खिलाड़ी' },
    duration: { en: '5-10 minutes', hi: '5-10 मिनट' },
    skillsLearned: {
      en: ['Balance', 'Coordination', 'Focus', 'Self-control'],
      hi: ['संतुलन', 'समन्वय', 'एकाग्रता', 'आत्म-नियंत्रण'],
    },
    funTip: { en: 'Walk heel-to-toe for better balance — like a tightrope walker! ⚖️', hi: 'बेहतर संतुलन के लिए एड़ी-पंजे चलें — रस्सी पर चलने वाले की तरह! ⚖️' },
  },
  'Reading (Hindi & English)': {
    description: {
      en: 'Reading competition! Read passages in Hindi and English clearly and fluently. Shows language skills and confidence.',
      hi: 'पठन प्रतियोगिता! हिंदी और अंग्रेज़ी में पैराग्राफ स्पष्ट और धाराप्रवाह पढ़ें। भाषा कौशल और आत्मविश्वास दिखाता है।',
    },
    rules: {
      en: ['Read the given passage clearly', 'Pronunciation and fluency matter', 'Expression and confidence are scored', 'Best reader wins medal!'],
      hi: ['दिया गया पैराग्राफ स्पष्ट पढ़ें', 'उच्चारण और प्रवाह मायने रखता है', 'अभिव्यक्ति और आत्मविश्वास पर अंक', 'सबसे अच्छा पाठक पदक जीतता है!'],
    },
    players: { en: 'Individual', hi: 'व्यक्तिगत' },
    duration: { en: '2-3 minutes per student', hi: '2-3 मिनट प्रति छात्र' },
    skillsLearned: {
      en: ['Reading Fluency', 'Pronunciation', 'Confidence', 'Language Skills'],
      hi: ['पढ़ने का प्रवाह', 'उच्चारण', 'आत्मविश्वास', 'भाषा कौशल'],
    },
    funTip: { en: 'Practice reading aloud at home — your voice is your superpower! 📖', hi: 'घर पर जोर से पढ़ने का अभ्यास करें — आपकी आवाज आपकी सुपरपावर है! 📖' },
  },
  'Writing (Hindi & English)': {
    description: {
      en: 'Beautiful handwriting competition! Write neatly in both Hindi and English. Judges look for clarity, neatness, and style.',
      hi: 'सुंदर लेखन प्रतियोगिता! हिंदी और अंग्रेज़ी दोनों में साफ लिखें। जज स्पष्टता, सफाई और शैली देखते हैं।',
    },
    rules: {
      en: ['Write the given text neatly', 'Use proper letter formation', 'Maintain straight lines and spacing', 'Neatest writing wins!'],
      hi: ['दिया गया पाठ साफ लिखें', 'सही अक्षर बनावट का प्रयोग करें', 'सीधी लाइन और सही जगह रखें', 'सबसे साफ लिखावट जीतती है!'],
    },
    players: { en: 'Individual', hi: 'व्यक्तिगत' },
    duration: { en: '10-15 minutes', hi: '10-15 मिनट' },
    skillsLearned: {
      en: ['Handwriting', 'Patience', 'Neatness', 'Fine Motor Skills'],
      hi: ['लिखावट', 'धैर्य', 'सफाई', 'बारीक मोटर कौशल'],
    },
    funTip: { en: 'Take a deep breath before writing — calm hands write beautifully! ✍️', hi: 'लिखने से पहले गहरी सांस लें — शांत हाथ सुंदर लिखते हैं! ✍️' },
  },
  'Table Game (Maths)': {
    description: {
      en: 'Math multiplication tables challenge! Recite tables quickly and accurately. Who knows their tables best?',
      hi: 'गणित पहाड़ा चुनौती! पहाड़े तेजी से और सही बोलें। किसको पहाड़े सबसे अच्छे आते हैं?',
    },
    rules: {
      en: ['Recite the given multiplication table', 'Speed and accuracy both count', 'Random tables may be asked', 'Fastest & most accurate wins!'],
      hi: ['दी गई तालिका बोलें', 'गति और सटीकता दोनों मायने रखती हैं', 'कोई भी तालिका पूछी जा सकती है', 'सबसे तेज और सबसे सटीक जीतता है!'],
    },
    players: { en: 'Individual', hi: 'व्यक्तिगत' },
    duration: { en: '2-3 minutes per student', hi: '2-3 मिनट प्रति छात्र' },
    skillsLearned: {
      en: ['Math Skills', 'Memory', 'Speed', 'Confidence'],
      hi: ['गणित कौशल', 'याददाश्त', 'गति', 'आत्मविश्वास'],
    },
    funTip: { en: 'Sing the tables like a song — it sticks better! 🔢', hi: 'पहाड़े गाने की तरह गाएं — बेहतर याद रहते हैं! 🔢' },
  },
  'Parent-Teacher Meeting (Unit Test 4)': {
    description: {
      en: 'Meet your child\'s teachers and discuss Unit Test 4 results. Understand your child\'s progress and areas for improvement.',
      hi: 'अपने बच्चे के शिक्षकों से मिलें और यूनिट टेस्ट 4 के परिणामों पर चर्चा करें। अपने बच्चे की प्रगति और सुधार के क्षेत्रों को समझें।',
    },
    rules: {
      en: ['Bring your child\'s diary', 'Discuss academic progress', 'Ask about areas of improvement', 'Collect report card'],
      hi: ['अपने बच्चे की डायरी लाएं', 'शैक्षिक प्रगति पर चर्चा करें', 'सुधार के क्षेत्रों के बारे में पूछें', 'रिपोर्ट कार्ड लें'],
    },
    players: { en: 'Parents & Teachers', hi: 'अभिभावक और शिक्षक' },
    duration: { en: '10-15 minutes per parent', hi: '10-15 मिनट प्रति अभिभावक' },
    skillsLearned: {
      en: ['Communication', 'Understanding', 'Planning', 'Support'],
      hi: ['संवाद', 'समझ', 'योजना', 'समर्थन'],
    },
    funTip: { en: 'Come with questions — teachers love involved parents! 📋', hi: 'सवाल लेकर आएं — शिक्षक सक्रिय अभिभावकों को पसंद करते हैं! 📋' },
  },
  'Certificate Distribution': {
    description: {
      en: 'The proud moment! All winners receive beautiful certificates recognizing their achievements during Sports Week.',
      hi: 'गर्व का पल! सभी विजेताओं को खेल सप्ताह में उनकी उपलब्धियों के लिए सुंदर प्रमाण पत्र मिलते हैं।',
    },
    rules: {
      en: ['Winners are called on stage', 'Certificates are presented by teachers', 'Applaud for all participants', 'Group photo for winners!'],
      hi: ['विजेताओं को मंच पर बुलाया जाता है', 'शिक्षक प्रमाण पत्र देते हैं', 'सभी प्रतिभागियों के लिए तालियां', 'विजेताओं का ग्रुप फोटो!'],
    },
    players: { en: 'All Winners', hi: 'सभी विजेता' },
    duration: { en: '30-45 minutes', hi: '30-45 मिनट' },
    skillsLearned: {
      en: ['Pride', 'Recognition', 'Motivation', 'Celebration'],
      hi: ['गर्व', 'पहचान', 'प्रेरणा', 'उत्सव'],
    },
    funTip: { en: 'Frame your certificate — you earned it! 📜', hi: 'अपना प्रमाण पत्र फ्रेम करें — आपने इसे कमाया है! 📜' },
  },
  'Medal Distribution': {
    description: {
      en: 'Gold, Silver, Bronze! The most exciting moment — winners receive shining medals for their outstanding performance.',
      hi: 'स्वर्ण, रजत, कांस्य! सबसे रोमांचक पल — विजेताओं को उनके उत्कृष्ट प्रदर्शन के लिए चमकदार पदक मिलते हैं।',
    },
    rules: {
      en: ['Winners come to the podium', 'Medals are awarded by principal', 'National-style celebration!', 'Parents can take photos!'],
      hi: ['विजेता मंच पर आएं', 'प्रधानाचार्य पदक देते हैं', 'राष्ट्रीय-शैली का उत्सव!', 'अभिभावक फोटो ले सकते हैं!'],
    },
    players: { en: 'Top 3 Winners per event', hi: 'प्रति इवेंट शीर्ष 3 विजेता' },
    duration: { en: '45-60 minutes', hi: '45-60 मिनट' },
    skillsLearned: {
      en: ['Achievement', 'Pride', 'Sportsmanship', 'Celebration'],
      hi: ['उपलब्धि', 'गर्व', 'खेल भावना', 'उत्सव'],
    },
    funTip: { en: 'Wear your medal proudly — you\'re a champion! 🥇', hi: 'अपना पदक गर्व से पहनें — आप चैंपियन हैं! 🥇' },
  },
};

interface DaySchedule {
  date: string;
  dayLabel: { en: string; hi: string };
  tagline: { en: string; hi: string };
  color: string;
  bgGradient: string;
  icon: string;
  games: Game[];
  isSpecial?: boolean;
}

// ─── Sports Week Data ──────────────────────────────────────────────────────────
const sportsWeekDays: DaySchedule[] = [
  {
    date: '2026-02-16',
    dayLabel: { en: 'Day 1 — Monday, Feb 16', hi: 'दिन 1 — सोमवार, 16 फरवरी' },
    tagline: { en: 'Indoor Classics & Track Fun', hi: 'इनडोर क्लासिक्स और ट्रैक मस्ती' },
    color: 'from-blue-500 to-cyan-400',
    bgGradient: 'from-blue-50 to-cyan-50',
    icon: '🏁',
    games: [
      { en: 'Ludo', hi: 'लूडो', category: 'fun', emoji: '🎲' },
      { en: 'Chess', hi: 'शतरंज', category: 'medal', emoji: '♟️' },
      { en: 'Carrom Board', hi: 'कैरम बोर्ड', category: 'medal', emoji: '🎯' },
      { en: 'Bowling Game', hi: 'बॉलिंग गेम', category: 'fun', emoji: '🎳' },
      { en: 'Basketball', hi: 'बास्केटबॉल', category: 'medal', emoji: '🏀' },
      { en: 'Chair Game (Musical Chairs)', hi: 'कुर्सी का खेल (म्यूजिकल चेयर)', category: 'fun', emoji: '💺' },
      { en: 'Simple Race', hi: 'सिंपल रेस', category: 'medal', emoji: '🏃' },
      { en: 'Frog Race', hi: 'मेंढक दौड़', category: 'fun', emoji: '🐸' },
      { en: 'Ball Collection Race', hi: 'बॉल कलेक्शन रेस', category: 'fun', emoji: '⚽' },
      { en: 'Team Race', hi: 'टीम रेस', category: 'medal', emoji: '🤝' },
      { en: 'Rabbit Race', hi: 'खरगोश दौड़', category: 'fun', emoji: '🐰' },
    ],
  },
  {
    date: '2026-02-17',
    dayLabel: { en: 'Day 2 — Tuesday, Feb 17', hi: 'दिन 2 — मंगलवार, 17 फरवरी' },
    tagline: { en: 'Jump, Sprint & Balance', hi: 'कूदो, दौड़ो और संतुलन बनाओ' },
    color: 'from-orange-500 to-amber-400',
    bgGradient: 'from-orange-50 to-amber-50',
    icon: '🏅',
    games: [
      { en: 'Jump Race', hi: 'जंप रेस', category: 'medal', emoji: '🦘' },
      { en: 'Frog Race', hi: 'मेंढक दौड़', category: 'fun', emoji: '🐸' },
      { en: 'Hurdle Race', hi: 'बाधा दौड़', category: 'medal', emoji: '🏃‍♂️' },
      { en: 'Color Game', hi: 'रंगों का खेल', category: 'fun', emoji: '🎨' },
      { en: 'Match Same Race Game', hi: 'मैच सेम रेस गेम', category: 'fun', emoji: '🔗' },
      { en: 'Balance Game (Sit & Stand)', hi: 'बैलेंस गेम (बैठो और खड़े हो)', category: 'fun', emoji: '🧘' },
      { en: 'Long Jump / Small Jump', hi: 'लंबी कूद / छोटी कूद', category: 'medal', emoji: '📏' },
    ],
  },
  {
    date: '2026-02-18',
    dayLabel: { en: 'Day 3 — Wednesday, Feb 18', hi: 'दिन 3 — बुधवार, 18 फरवरी' },
    tagline: { en: 'Sports + Creative Arts', hi: 'खेल + रचनात्मक कला' },
    color: 'from-green-500 to-emerald-400',
    bgGradient: 'from-green-50 to-emerald-50',
    icon: '⚽',
    games: [
      { en: 'Basketball', hi: 'बास्केटबॉल', category: 'medal', emoji: '🏀' },
      { en: 'Badminton', hi: 'बैडमिंटन', category: 'medal', emoji: '🏸' },
      { en: 'Chair Game', hi: 'कुर्सी का खेल', category: 'fun', emoji: '💺' },
      { en: 'Football', hi: 'फुटबॉल', category: 'medal', emoji: '⚽' },
      { en: 'Rhymes with Singing', hi: 'गीत के साथ कविता', category: 'fun', emoji: '🎤' },
      { en: 'Story with Actions', hi: 'कहानी एक्शन के साथ', category: 'fun', emoji: '🎭' },
      { en: 'Action Game', hi: 'एक्शन गेम', category: 'fun', emoji: '🎬' },
      { en: 'Balloon Race', hi: 'गुब्बारा दौड़', category: 'fun', emoji: '🎈' },
    ],
  },
  {
    date: '2026-02-19',
    dayLabel: { en: 'Day 4 — Thursday, Feb 19', hi: 'दिन 4 — गुरुवार, 19 फरवरी' },
    tagline: { en: 'Brain Games & Skill Challenges', hi: 'दिमागी खेल और कौशल चुनौतियाँ' },
    color: 'from-purple-500 to-violet-400',
    bgGradient: 'from-purple-50 to-violet-50',
    icon: '🧠',
    games: [
      { en: 'Cup and Ball Game', hi: 'कप और बॉल गेम', category: 'fun', emoji: '🥤' },
      { en: 'Cup Tower Game', hi: 'कप टावर गेम', category: 'fun', emoji: '🏗️' },
      { en: 'Balance Game Race', hi: 'बैलेंस गेम रेस', category: 'medal', emoji: '⚖️' },
      { en: 'Reading (Hindi & English)', hi: 'पठन (हिंदी और अंग्रेज़ी)', category: 'medal', emoji: '📖' },
      { en: 'Writing (Hindi & English)', hi: 'लेखन (हिंदी और अंग्रेज़ी)', category: 'medal', emoji: '✍️' },
      { en: 'Table Game (Maths)', hi: 'पहाड़ा खेल (गणित)', category: 'medal', emoji: '🔢' },
    ],
  },
  {
    date: '2026-02-21',
    dayLabel: { en: 'Day 5 — Saturday, Feb 21', hi: 'दिन 5 — शनिवार, 21 फरवरी' },
    tagline: { en: 'PTM & Grand Prize Ceremony', hi: 'PTM और भव्य पुरस्कार समारोह' },
    color: 'from-yellow-500 to-amber-500',
    bgGradient: 'from-yellow-50 to-amber-50',
    icon: '🏆',
    isSpecial: true,
    games: [
      { en: 'Parent-Teacher Meeting (Unit Test 4)', hi: 'अभिभावक-शिक्षक बैठक (यूनिट टेस्ट 4)', category: 'medal', emoji: '📋' },
      { en: 'Certificate Distribution', hi: 'प्रमाण पत्र वितरण', category: 'medal', emoji: '📜' },
      { en: 'Medal Distribution', hi: 'पदक वितरण', category: 'medal', emoji: '🥇' },
    ],
  },
];

const upcomingEvents: { date: string; label: { en: string; hi: string }; emoji: string }[] = [
  { date: '2026-03-02', label: { en: 'Holi Celebration 🎉', hi: 'होली उत्सव 🎉' }, emoji: '🌈' },
  { date: '2026-03-09', label: { en: 'Final Year Exam Begins', hi: 'वार्षिक परीक्षा शुरू' }, emoji: '📝' },
];

// ─── Translations ──────────────────────────────────────────────────────────────
const t = {
  title: { en: 'Annual Sports Week 2026', hi: 'वार्षिक खेल सप्ताह 2026' },
  subtitle: {
    en: 'First Step Public School',
    hi: 'फर्स्ट स्टेप पब्लिक स्कूल',
  },
  heroTagline: {
    en: 'A week of sports, fun, learning & celebration!',
    hi: 'खेल, मस्ती, सीखने और उत्सव का एक सप्ताह!',
  },
  schedule: {
    en: 'Morning: Regular Classes | Afternoon: Sports & Games',
    hi: 'सुबह: नियमित कक्षाएं | दोपहर: खेल और गेम्स',
  },
  medalGames: { en: 'Medal & Certificate', hi: 'पदक और प्रमाण पत्र' },
  funGames: { en: 'Fun & Enjoyment', hi: 'मस्ती और आनंद' },
  daysToGo: { en: 'Days to Go', hi: 'दिन बाकी' },
  started: { en: "It's Sports Week!", hi: 'खेल सप्ताह शुरू!' },
  completed: { en: 'Sports Week Completed!', hi: 'खेल सप्ताह संपन्न!' },
  today: { en: "TODAY", hi: "आज" },
  upcoming: { en: 'Upcoming Events', hi: 'आगामी कार्यक्रम' },
  note: {
    en: 'Note: First half of each day is for regular academic work. Sports activities are held in the second half only.',
    hi: 'नोट: प्रत्येक दिन का पहला भाग नियमित पढ़ाई के लिए है। खेल गतिविधियाँ केवल दूसरे भाग में होंगी।',
  },
  parentNote: {
    en: 'Dear Parents, please encourage your children to participate in all activities. Winners will receive medals and certificates on Feb 21st during PTM.',
    hi: 'प्रिय अभिभावकों, कृपया अपने बच्चों को सभी गतिविधियों में भाग लेने के लिए प्रोत्साहित करें। विजेताओं को 21 फरवरी को PTM के दौरान पदक और प्रमाण पत्र दिए जाएंगे।',
  },
  backToHome: { en: '← Home', hi: '← होम' },
  languageToggle: { en: 'हिंदी', hi: 'English' },
  totalGames: { en: 'Total Games', hi: 'कुल खेल' },
  medalCount: { en: 'Medal Events', hi: 'पदक कार्यक्रम' },
  funCount: { en: 'Fun Games', hi: 'मज़ेदार खेल' },
  daysOfSports: { en: 'Days of Sports', hi: 'खेल के दिन' },
};

// ─── Floating Emoji Particles ──────────────────────────────────────────────────
const floatingEmojis = ['⚽', '🏀', '🏸', '🎯', '🏃', '🏅', '🎳', '🎲', '🏆', '🎈', '🐸', '🐰'];

function FloatingParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {floatingEmojis.map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl sm:text-3xl opacity-10"
          initial={{
            x: `${Math.random() * 100}vw`,
            y: `${110 + Math.random() * 20}vh`,
          }}
          animate={{
            y: `-10vh`,
            x: `${Math.random() * 100}vw`,
            rotate: [0, 360],
          }}
          transition={{
            duration: 15 + Math.random() * 20,
            repeat: Infinity,
            delay: i * 2,
            ease: 'linear',
          }}
        >
          {emoji}
        </motion.div>
      ))}
    </div>
  );
}

// ─── Countdown Component ───────────────────────────────────────────────────────
function Countdown({ lang }: { lang: Lang }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const startDate = new Date('2026-02-16T00:00:00');
  const endDate = new Date('2026-02-21T23:59:59');
  const diff = startDate.getTime() - now.getTime();
  const isOngoing = now >= startDate && now <= endDate;
  const isCompleted = now > endDate;

  if (isCompleted) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-center"
      >
        <div className="text-4xl mb-2">🏆</div>
        <p className="text-lg font-bold text-green-600">{t.completed[lang]}</p>
      </motion.div>
    );
  }

  if (isOngoing) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-center"
      >
        <div className="text-4xl mb-2">🔥</div>
        <p className="text-lg font-bold text-orange-600 animate-pulse">
          {t.started[lang]}
        </p>
      </motion.div>
    );
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  const timeBlocks = [
    { value: days, label: lang === 'en' ? 'Days' : 'दिन' },
    { value: hours, label: lang === 'en' ? 'Hours' : 'घंटे' },
    { value: minutes, label: lang === 'en' ? 'Min' : 'मिनट' },
    { value: seconds, label: lang === 'en' ? 'Sec' : 'सेकंड' },
  ];

  return (
    <div className="flex gap-3 justify-center">
      {timeBlocks.map((block, i) => (
        <motion.div
          key={i}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="flex flex-col items-center"
        >
          <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-lg">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={block.value}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {String(block.value).padStart(2, '0')}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="text-xs mt-1 text-muted-foreground font-medium">{block.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Stats Bar ─────────────────────────────────────────────────────────────────
function StatsBar({ lang }: { lang: Lang }) {
  const allGames = sportsWeekDays.flatMap((d) => d.games);
  const medalGames = allGames.filter((g) => g.category === 'medal');
  const funGames = allGames.filter((g) => g.category === 'fun');

  const stats = [
    { value: sportsWeekDays.length, label: t.daysOfSports[lang], emoji: '📅' },
    { value: allGames.length, label: t.totalGames[lang], emoji: '🎮' },
    { value: medalGames.length, label: t.medalCount[lang], emoji: '🏅' },
    { value: funGames.length, label: t.funCount[lang], emoji: '🎉' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
      {stats.map((s, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
          className="bg-card border rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="text-2xl mb-1">{s.emoji}</div>
          <motion.div
            className="text-3xl font-extrabold text-primary"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 + 0.2, type: 'spring' }}
          >
            {s.value}
          </motion.div>
          <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Game Detail Modal ─────────────────────────────────────────────────────────
function GameDetailModal({
  game,
  lang,
  open,
  onClose,
}: {
  game: Game | null;
  lang: Lang;
  open: boolean;
  onClose: () => void;
}) {
  if (!game) return null;
  const details = gameDetailsDB[game.en];
  const isMedal = game.category === 'medal';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl border-2 overflow-hidden" aria-describedby={undefined}>
        <VisuallyHidden.Root>
          <DialogTitle>Game Details</DialogTitle>
        </VisuallyHidden.Root>
        {/* Modal Header with gradient */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'relative p-6 pb-8 text-white overflow-hidden',
            isMedal
              ? 'bg-gradient-to-br from-amber-500 to-yellow-600'
              : 'bg-gradient-to-br from-sky-500 to-blue-600'
          )}
        >
          {/* Animated circles in background */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white/10"
                style={{
                  width: `${20 + Math.random() * 60}px`,
                  height: `${20 + Math.random() * 60}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="text-6xl mb-3 inline-block"
            >
              {game.emoji}
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-extrabold"
            >
              {game[lang]}
            </motion.h2>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-2 flex justify-center gap-2"
            >
              <Badge className={cn(
                'text-xs',
                isMedal
                  ? 'bg-white/20 hover:bg-white/30 text-white border-white/30'
                  : 'bg-white/20 hover:bg-white/30 text-white border-white/30'
              )}>
                {isMedal ? '🏅 ' + t.medalGames[lang] : '🎉 ' + t.funGames[lang]}
              </Badge>
            </motion.div>
          </div>
        </motion.div>

        {/* Modal Body */}
        {details ? (
          <div className="p-5 space-y-5">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <p className="text-muted-foreground text-sm leading-relaxed">
                {details.description[lang]}
              </p>
            </motion.div>

            {/* Quick Info Cards */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 gap-3"
            >
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-3 text-center border border-purple-200">
                <div className="text-lg mb-1">👥</div>
                <p className="text-xs text-muted-foreground">{lang === 'en' ? 'Players' : 'खिलाड़ी'}</p>
                <p className="font-bold text-sm">{details.players[lang]}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 text-center border border-green-200">
                <div className="text-lg mb-1">⏱️</div>
                <p className="text-xs text-muted-foreground">{lang === 'en' ? 'Duration' : 'अवधि'}</p>
                <p className="font-bold text-sm">{details.duration[lang]}</p>
              </div>
            </motion.div>

            {/* Rules */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                <span className="text-base">📜</span>
                {lang === 'en' ? 'Rules' : 'नियम'}
              </h3>
              <div className="space-y-2">
                {details.rules[lang].map((rule, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="flex items-start gap-2 text-sm"
                  >
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground">{rule}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Skills Learned */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                <span className="text-base">🌟</span>
                {lang === 'en' ? 'Skills Learned' : 'सीखने को मिलेगा'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {details.skillsLearned[lang].map((skill, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.08, type: 'spring', stiffness: 300 }}
                  >
                    <Badge variant="outline" className="text-xs bg-primary/5">
                      {skill}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Fun Tip */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45 }}
              className={cn(
                'rounded-xl p-4 border-2 border-dashed',
                isMedal
                  ? 'bg-amber-50 border-amber-300'
                  : 'bg-sky-50 border-sky-300'
              )}
            >
              <div className="flex items-start gap-2">
                <motion.span
                  className="text-xl flex-shrink-0"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  💡
                </motion.span>
                <div>
                  <p className="font-bold text-xs mb-1">{lang === 'en' ? 'Fun Tip!' : 'मज़ेदार टिप!'}</p>
                  <p className="text-sm text-muted-foreground">{details.funTip[lang]}</p>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            <p className="text-sm">{lang === 'en' ? 'Details coming soon!' : 'विवरण जल्द आ रहा है!'}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Game Card Component ───────────────────────────────────────────────────────
function GameCard({ game, lang, index, onSelect }: { game: Game; lang: Lang; index: number; onSelect: (game: Game) => void }) {
  const isMedal = game.category === 'medal';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onSelect(game)}
      className={cn(
        'relative rounded-xl p-3 sm:p-4 border-2 cursor-pointer transition-all group',
        isMedal
          ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300 hover:border-amber-400 hover:shadow-amber-200/50 hover:shadow-lg'
          : 'bg-gradient-to-br from-sky-50 to-blue-50 border-sky-300 hover:border-sky-400 hover:shadow-sky-200/50 hover:shadow-lg'
      )}
    >
      {isMedal && (
        <div className="absolute -top-2 -right-2">
          <motion.span
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
            className="text-lg"
          >
            🏅
          </motion.span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <motion.span
          className="text-xl sm:text-2xl flex-shrink-0"
          whileHover={{ scale: 1.3, rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.4 }}
        >
          {game.emoji}
        </motion.span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm sm:text-base leading-tight truncate">
            {game[lang]}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <Badge
              variant={isMedal ? 'default' : 'secondary'}
              className={cn(
                'text-[9px] sm:text-[10px]',
                isMedal
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-sky-100 text-sky-700'
              )}
            >
              {isMedal ? t.medalGames[lang] : t.funGames[lang]}
            </Badge>
          </div>
        </div>
        <motion.span
          className="text-muted-foreground text-xs opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          initial={false}
        >
          {lang === 'en' ? 'Tap →' : 'टैप →'}
        </motion.span>
      </div>
    </motion.div>
  );
}

// ─── Day Section Component ─────────────────────────────────────────────────────
function DaySection({ day, lang, index, onSelectGame }: { day: DaySchedule; lang: Lang; index: number; onSelectGame: (game: Game) => void }) {
  const today = new Date().toISOString().split('T')[0];
  const isToday = day.date === today;
  const isPast = new Date(day.date) < new Date(today);

  return (
    <motion.section
      initial={{ opacity: 0, x: index % 2 === 0 ? -60 : 60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, type: 'spring' }}
      className={cn(
        'relative rounded-3xl overflow-hidden border-2 shadow-lg',
        isToday && 'ring-4 ring-primary ring-offset-2 ring-offset-background',
        isPast && 'opacity-75'
      )}
    >
      {/* Sparkle effect for today */}
      {isToday && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full"
              style={{ left: `${15 + Math.random() * 70}%`, top: `${Math.random() * 30}%` }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.4,
              }}
            />
          ))}
        </div>
      )}

      {/* Day Header */}
      <div className={cn('bg-gradient-to-r p-5 sm:p-6 text-white relative overflow-hidden', day.color)}>
        {/* Animated wave background */}
        <div className="absolute inset-0 opacity-10 overflow-hidden">
          <motion.div
            className="absolute -bottom-4 left-0 right-0 h-16"
            style={{
              background: 'radial-gradient(ellipse at center, white 0%, transparent 70%)',
            }}
            animate={{ x: ['-20%', '20%', '-20%'] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: `${30 + Math.random() * 50}px`,
                height: `${30 + Math.random() * 50}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <motion.span
                className="text-3xl sm:text-4xl"
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {day.icon}
              </motion.span>
              <h2 className="text-xl sm:text-2xl font-extrabold">{day.dayLabel[lang]}</h2>
              {isToday && (
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Badge className="bg-white text-primary font-bold text-xs shadow-lg">{t.today[lang]}</Badge>
                </motion.span>
              )}
            </div>
            <p className="text-white/90 text-sm sm:text-base mt-1 font-medium">{day.tagline[lang]}</p>
          </div>
          <div className="flex gap-2 items-center">
            <Badge variant="outline" className="border-white/50 text-white text-xs backdrop-blur-sm">
              {day.games.length} {lang === 'en' ? 'Activities' : 'गतिविधियाँ'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Tap to explore hint */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="bg-muted/50 px-4 py-1.5 text-center border-b"
      >
        <p className="text-[11px] text-muted-foreground">
          {lang === 'en' ? '👆 Tap any activity to see full details, rules & tips' : '👆 पूरा विवरण, नियम और टिप्स देखने के लिए किसी भी गतिविधि पर टैप करें'}
        </p>
      </motion.div>

      {/* Games Grid */}
      <div className={cn('p-4 sm:p-6 bg-gradient-to-br', day.bgGradient)}>
        {day.isSpecial ? (
          <div className="space-y-4">
            {/* Special Day — PTM & Ceremony */}
            <div className="text-center px-4 py-6">
              <motion.div
                className="text-6xl mb-4"
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                🏆
              </motion.div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3">
                {lang === 'en'
                  ? 'Grand Closing Ceremony'
                  : 'भव्य समापन समारोह'}
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto mb-6">
                {lang === 'en'
                  ? 'Join us for the Parent-Teacher Meeting (Unit Test 4 Results) followed by the Medal & Certificate Distribution ceremony for all winners.'
                  : 'अभिभावक-शिक्षक बैठक (यूनिट टेस्ट 4 परिणाम) और उसके बाद सभी विजेताओं के लिए पदक और प्रमाण पत्र वितरण समारोह में शामिल हों।'}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {day.games.map((game, gi) => (
                <motion.div
                  key={gi}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: gi * 0.15, type: 'spring' }}
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelectGame(game)}
                  className="bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl p-4 text-center border-2 border-amber-300 cursor-pointer hover:shadow-lg hover:border-amber-400 transition-all group"
                >
                  <motion.div
                    className="text-3xl mb-2"
                    whileHover={{ scale: 1.3, rotate: [0, -10, 10, 0] }}
                  >
                    {game.emoji}
                  </motion.div>
                  <p className="font-bold text-sm">{game[lang]}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {lang === 'en' ? 'Tap for details →' : 'विवरण के लिए टैप →'}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {day.games.map((game, gi) => (
              <GameCard key={gi} game={game} lang={lang} index={gi} onSelect={onSelectGame} />
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}

// ─── Legend Component ──────────────────────────────────────────────────────────
function Legend({ lang }: { lang: Lang }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex flex-wrap justify-center gap-4 sm:gap-6"
    >
      <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-full px-4 py-2">
        <span className="text-lg">🏅</span>
        <span className="font-semibold text-sm">{t.medalGames[lang]}</span>
        <span className="text-xs text-muted-foreground">
          ({lang === 'en' ? 'Winners get medals & certificates' : 'विजेताओं को पदक और प्रमाण पत्र मिलेंगे'})
        </span>
      </div>
      <div className="flex items-center gap-2 bg-gradient-to-r from-sky-50 to-blue-50 border-2 border-sky-300 rounded-full px-4 py-2">
        <span className="text-lg">🎉</span>
        <span className="font-semibold text-sm">{t.funGames[lang]}</span>
        <span className="text-xs text-muted-foreground">
          ({lang === 'en' ? 'For fun & enjoyment' : 'मस्ती और आनंद के लिए'})
        </span>
      </div>
    </motion.div>
  );
}

// ─── Main Page Component ───────────────────────────────────────────────────────

// All medal game names for enrollment selection
const allMedalGameNames = sportsWeekDays
  .flatMap((d) => d.games)
  .filter((g) => g.category === 'medal')
  .reduce<Game[]>((acc, g) => {
    if (!acc.find((x) => x.en === g.en)) acc.push(g);
    return acc;
  }, []);

// ─── Enrollment Form ──────────────────────────────────────────────────────────
// Helper to build WhatsApp URL
function buildWhatsAppUrl(studentName: string, className: string, parentName: string, selectedGames: string[], lang: Lang) {
  // Use the first phone number from SCHOOL_INFO
  const rawPhone = SCHOOL_INFO.phone.split(',')[0].trim();
  const phone = rawPhone.replace(/[^0-9]/g, '');
  const whatsAppPhone = phone.startsWith('91') ? phone : `91${phone}`;

  const message = lang === 'en'
    ? `🏆 *Sports Week 2026 Enrollment*\n\n👦 Student: ${studentName}\n🎓 Class: ${className}\n👨‍👩‍👧 Parent: ${parentName}${selectedGames.length > 0 ? `\n🏅 Events: ${selectedGames.join(', ')}` : ''}\n\nPlease confirm my child's enrollment for Annual Sports Week. Thank you! 🙏`
    : `🏆 *खेल सप्ताह 2026 नामांकन*\n\n👦 छात्र: ${studentName}\n🎓 कक्षा: ${className}\n👨‍👩‍👧 अभिभावक: ${parentName}${selectedGames.length > 0 ? `\n🏅 इवेंट: ${selectedGames.join(', ')}` : ''}\n\nकृपया मेरे बच्चे के वार्षिक खेल सप्ताह के नामांकन की पुष्टि करें। धन्यवाद! 🙏`;

  return `https://wa.me/${whatsAppPhone}?text=${encodeURIComponent(message)}`;
}

function EnrollmentSection({ lang }: { lang: Lang }) {
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [enrollCount, setEnrollCount] = useState(0);

  // Form state
  const [studentName, setStudentName] = useState('');
  const [parentName, setParentName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [specialNotes, setSpecialNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await classService.getAllClasses();
        setClasses(data || []);
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setLoadingClasses(false);
      }
    };
    const fetchCount = async () => {
      try {
        const count = await sportsEnrollmentService.getEnrollmentCount();
        setEnrollCount(count);
      } catch { /* ignore */ }
    };
    fetchClasses();
    fetchCount();
  }, []);

  const toggleGame = (gameName: string) => {
    setSelectedGames((prev) =>
      prev.includes(gameName)
        ? prev.filter((g) => g !== gameName)
        : [...prev, gameName]
    );
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!studentName.trim()) {
      newErrors.studentName = lang === 'en' ? 'Student name is required' : 'छात्र का नाम आवश्यक है';
    }
    if (!parentName.trim()) {
      newErrors.parentName = lang === 'en' ? 'Parent name is required' : 'अभिभावक का नाम आवश्यक है';
    }
    if (!contactNumber.trim() || contactNumber.trim().length < 10) {
      newErrors.contactNumber = lang === 'en' ? 'Valid contact number required (10+ digits)' : 'वैध संपर्क नंबर आवश्यक (10+ अंक)';
    }
    if (!selectedClassId) {
      newErrors.classId = lang === 'en' ? 'Please select a class' : 'कृपया कक्षा चुनें';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      const selectedClass = classes.find((c) => c.id === selectedClassId);
      const className = selectedClass ? `${selectedClass.name} - ${selectedClass.section}` : '';

      // Check for duplicate enrollment
      const exists = await sportsEnrollmentService.checkExistingEnrollment(studentName.trim(), selectedClassId);
      if (exists) {
        toast.error(
          lang === 'en'
            ? 'This student is already enrolled for Sports Week!'
            : 'यह छात्र पहले से खेल सप्ताह के लिए नामांकित है!'
        );
        setSubmitting(false);
        return;
      }

      await sportsEnrollmentService.createEnrollment({
        studentName: studentName.trim(),
        parentName: parentName.trim(),
        contactNumber: contactNumber.trim(),
        classId: selectedClassId,
        className,
        selectedGames,
        specialNotes: specialNotes.trim() || undefined,
      });

      setEnrolled(true);
      setShowSuccessModal(true);
      setEnrollCount((prev) => prev + 1);
      toast.success(
        lang === 'en'
          ? `${studentName} enrolled for Sports Week! 🎉`
          : `${studentName} का खेल सप्ताह में नामांकन हो गया! 🎉`
      );

      // Open WhatsApp with pre-filled message
      const whatsAppUrl = buildWhatsAppUrl(studentName, className, parentName, selectedGames, lang);
      window.open(whatsAppUrl, '_blank');
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error(
        lang === 'en'
          ? 'Enrollment failed. Please try again.'
          : 'नामांकन विफल। कृपया पुनः प्रयास करें।'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setStudentName('');
    setParentName('');
    setContactNumber('');
    setSelectedClassId('');
    setSelectedGames([]);
    setSpecialNotes('');
    setErrors({});
    setEnrolled(false);
    setShowSuccessModal(false);
  };

  const selectedClassName = classes.find((c) => c.id === selectedClassId);
  const classDisplayName = selectedClassName ? `${selectedClassName.name} - ${selectedClassName.section}` : '';

  // WhatsApp URL for manual send button
  const whatsAppUrl = enrolled
    ? buildWhatsAppUrl(studentName, classDisplayName, parentName, selectedGames, lang)
    : '';

  // Success state — inline + modal
  if (enrolled) {
    return (
      <>
        {/* Success Modal */}
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
            <VisuallyHidden.Root>
              <DialogTitle>Enrollment Successful</DialogTitle>
            </VisuallyHidden.Root>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="text-7xl mb-4 inline-block"
              >
                🎉
              </motion.div>
              <h3 className="text-2xl font-extrabold mb-2">
                {lang === 'en' ? 'Enrollment Successful!' : 'नामांकन सफल!'}
              </h3>
              <p className="text-muted-foreground mb-4 text-sm">
                {lang === 'en'
                  ? `${studentName} is now registered for Annual Sports Week 2026!`
                  : `${studentName} अब वार्षिक खेल सप्ताह 2026 के लिए पंजीकृत है!`}
              </p>

              {/* WhatsApp CTA */}
              <div className="bg-green-50 rounded-xl border border-green-200 p-4 mb-4">
                <p className="text-sm font-medium mb-3">
                  {lang === 'en'
                    ? '📱 Send enrollment details to school via WhatsApp:'
                    : '📱 व्हाट्सएप पर स्कूल को नामांकन विवरण भेजें:'}
                </p>
                <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full gap-2 bg-[#25D366] hover:bg-[#1fb855] text-white" size="lg">
                    <span className="text-xl">💬</span>
                    {lang === 'en' ? 'Send on WhatsApp' : 'व्हाट्सएप पर भेजें'}
                  </Button>
                </a>
                <p className="text-[11px] text-muted-foreground mt-2">
                  {lang === 'en'
                    ? `School WhatsApp: ${SCHOOL_INFO.phone.split(',')[0].trim()}`
                    : `स्कूल व्हाट्सएप: ${SCHOOL_INFO.phone.split(',')[0].trim()}`}
                </p>
              </div>

              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => { setShowSuccessModal(false); resetForm(); }} className="gap-2">
                  {lang === 'en' ? '➕ Enroll Another' : '➕ एक और नामांकन'}
                </Button>
                <Button variant="ghost" onClick={() => setShowSuccessModal(false)}>
                  {lang === 'en' ? 'Close' : 'बंद करें'}
                </Button>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>

        {/* Inline Success State */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="text-7xl mb-4 inline-block"
          >
            🎉
          </motion.div>
          <h3 className="text-2xl font-extrabold mb-2">
            {lang === 'en' ? 'Enrollment Successful!' : 'नामांकन सफल!'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {lang === 'en'
              ? `${studentName} is now registered for Annual Sports Week 2026! See you on the field! 🏃`
              : `${studentName} अब वार्षिक खेल सप्ताह 2026 के लिए पंजीकृत है! मैदान पर मिलते हैं! 🏃`}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2 bg-[#25D366] hover:bg-[#1fb855] text-white">
                💬 {lang === 'en' ? 'Send on WhatsApp' : 'व्हाट्सएप पर भेजें'}
              </Button>
            </a>
            <Button onClick={resetForm} variant="outline" size="lg" className="gap-2">
              {lang === 'en' ? '➕ Enroll Another Child' : '➕ एक और बच्चे का नामांकन करें'}
            </Button>
          </div>
        </motion.div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enrollment counter */}
      {enrollCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Badge variant="outline" className="text-sm px-4 py-1.5 bg-green-50 border-green-300 text-green-700">
            <motion.span
              key={enrollCount}
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
              className="font-bold mr-1"
            >
              {enrollCount + 20}
            </motion.span>
            {lang === 'en' ? ' students already enrolled!' : ' छात्र पहले से नामांकित!'}
          </Badge>
        </motion.div>
      )}

      {/* Form Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Student Name */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <label className="text-sm font-semibold mb-1.5 block">
            {lang === 'en' ? '👦 Student Name' : '👦 छात्र का नाम'} <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder={lang === 'en' ? 'Enter student name' : 'छात्र का नाम दर्ज करें'}
            value={studentName}
            onChange={(e) => { setStudentName(e.target.value); setErrors((p) => ({ ...p, studentName: '' })); }}
            className={cn(errors.studentName && 'border-red-500')}
          />
          {errors.studentName && <p className="text-xs text-red-500 mt-1">{errors.studentName}</p>}
        </motion.div>

        {/* Parent Name */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
        >
          <label className="text-sm font-semibold mb-1.5 block">
            {lang === 'en' ? '👨‍👩‍👧 Parent Name' : '👨‍👩‍👧 अभिभावक का नाम'} <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder={lang === 'en' ? 'Enter parent/guardian name' : 'अभिभावक का नाम दर्ज करें'}
            value={parentName}
            onChange={(e) => { setParentName(e.target.value); setErrors((p) => ({ ...p, parentName: '' })); }}
            className={cn(errors.parentName && 'border-red-500')}
          />
          {errors.parentName && <p className="text-xs text-red-500 mt-1">{errors.parentName}</p>}
        </motion.div>

        {/* Contact Number */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <label className="text-sm font-semibold mb-1.5 block">
            {lang === 'en' ? '📱 Contact Number' : '📱 संपर्क नंबर'} <span className="text-red-500">*</span>
          </label>
          <Input
            type="tel"
            placeholder={lang === 'en' ? 'WhatsApp / Phone number' : 'व्हाट्सएप / फोन नंबर'}
            value={contactNumber}
            onChange={(e) => { setContactNumber(e.target.value); setErrors((p) => ({ ...p, contactNumber: '' })); }}
            className={cn(errors.contactNumber && 'border-red-500')}
          />
          {errors.contactNumber && <p className="text-xs text-red-500 mt-1">{errors.contactNumber}</p>}
        </motion.div>

        {/* Class Selection */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25 }}
        >
          <label className="text-sm font-semibold mb-1.5 block">
            {lang === 'en' ? '🎓 Class' : '🎓 कक्षा'} <span className="text-red-500">*</span>
          </label>
          {loadingClasses ? (
            <div className="h-10 bg-muted rounded-md animate-pulse" />
          ) : (
            <Select value={selectedClassId} onValueChange={(val) => { setSelectedClassId(val); setErrors((p) => ({ ...p, classId: '' })); }}>
              <SelectTrigger className={cn('bg-white border-input', errors.classId && 'border-red-500')}>
                <SelectValue placeholder={lang === 'en' ? 'Select class' : 'कक्षा चुनें'} />
              </SelectTrigger>
              <SelectContent className="bg-white border border-input shadow-xl">
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id} className="cursor-pointer hover:bg-gray-100">
                    {cls.name} - {cls.section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {errors.classId && <p className="text-xs text-red-500 mt-1">{errors.classId}</p>}
        </motion.div>
      </div>

      {/* Game Selection (optional — medal events) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        <label className="text-sm font-semibold mb-2 block">
          {lang === 'en'
            ? '🏅 Select Preferred Events (Optional — medal events)'
            : '🏅 पसंदीदा इवेंट चुनें (वैकल्पिक — पदक कार्यक्रम)'}
        </label>
        <div className="flex flex-wrap gap-2">
          {allMedalGameNames.map((game, i) => {
            const isSelected = selectedGames.includes(game.en);
            return (
              <motion.button
                key={i}
                type="button"
                onClick={() => toggleGame(game.en)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all',
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-md'
                    : 'bg-card border-border hover:border-primary/50'
                )}
              >
                <span>{game.emoji}</span>
                <span>{game[lang]}</span>
                {isSelected && <span>✓</span>}
              </motion.button>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground mt-1.5">
          {lang === 'en'
            ? 'All children participate in fun games automatically. Select medal events your child wants to compete in.'
            : 'सभी बच्चे मज़ेदार खेलों में स्वचालित रूप से भाग लेते हैं। पदक कार्यक्रम चुनें जिनमें आपका बच्चा प्रतिस्पर्धा करना चाहता है।'}
        </p>
      </motion.div>

      {/* Special Notes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.35 }}
      >
        <label className="text-sm font-semibold mb-1.5 block">
          {lang === 'en' ? '📝 Special Notes (Optional)' : '📝 विशेष नोट (वैकल्पिक)'}
        </label>
        <Input
          placeholder={lang === 'en' ? 'Any medical condition, allergy, or special requirement...' : 'कोई चिकित्सा स्थिति, एलर्जी, या विशेष आवश्यकता...'}
          value={specialNotes}
          onChange={(e) => setSpecialNotes(e.target.value)}
        />
      </motion.div>

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="pt-2"
      >
        <Button
          size="lg"
          className="w-full sm:w-auto gap-2 text-base"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block"
              >
                ⏳
              </motion.span>
              {lang === 'en' ? 'Enrolling...' : 'नामांकन हो रहा है...'}
            </>
          ) : (
            <>
              🏃 {lang === 'en' ? 'Enroll My Child for Sports Week' : 'मेरे बच्चे का खेल सप्ताह में नामांकन करें'}
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}
export default function AnnualSportsWeek() {
  const [lang, setLang] = useState<Lang>('en');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSelectGame = useCallback((game: Game) => {
    setSelectedGame(game);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setTimeout(() => setSelectedGame(null), 300);
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      <FloatingParticles />

      {/* Game Details Modal */}
      <GameDetailModal game={selectedGame} lang={lang} open={modalOpen} onClose={handleCloseModal} />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <img src="/assets/images/logo.PNG" alt="Logo" className="h-8 w-8 object-contain" />
            <div className="flex flex-col leading-tight">
              <span className="text-xs sm:text-sm font-bold">{t.subtitle[lang]}</span>
            </div>
          </Link>
          <div className="flex gap-2 items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="font-medium text-xs sm:text-sm"
            >
              🌐 {t.languageToggle[lang]}
            </Button>
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                {t.backToHome[lang]}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-orange-500/5 to-yellow-500/5" />

        {/* Animated Confetti-style background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#FFD93D'][i % 6],
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative container mx-auto px-4 py-10 sm:py-16 text-center">
          {/* Animated Trophy */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="mb-4"
          >
            <motion.span
              className="text-6xl sm:text-8xl inline-block"
              animate={{
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              🏆
            </motion.span>
          </motion.div>

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-orange-500 to-yellow-500 bg-clip-text text-transparent"
          >
            {t.title[lang]}
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg sm:text-xl text-muted-foreground mt-3 max-w-2xl mx-auto"
          >
            {t.heroTagline[lang]}
          </motion.p>

          {/* Schedule Note */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 text-sm font-medium text-primary"
          >
            <span>📚</span>
            {t.schedule[lang]}
            <span>🏃</span>
          </motion.div>

          {/* Countdown */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <Countdown lang={lang} />
          </motion.div>
        </div>
      </section>

      {/* Animated Sports Ticker */}
      <div className="overflow-hidden bg-gradient-to-r from-primary/10 via-orange-500/10 to-yellow-500/10 border-y py-2">
        <motion.div
          className="flex gap-6 whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        >
          {[...sportsWeekDays.flatMap(d => d.games), ...sportsWeekDays.flatMap(d => d.games)].map((game, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <span>{game.emoji}</span>
              <span>{game[lang]}</span>
              <span className="text-primary/30">•</span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* Stats */}
      <section className="container mx-auto px-4 py-8 sm:py-10">
        <StatsBar lang={lang} />
      </section>

      {/* Legend */}
      <section className="container mx-auto px-4 pb-6">
        <Legend lang={lang} />
      </section>

      {/* Day-by-Day Schedule */}
      <section className="container mx-auto px-4 py-6 sm:py-8 space-y-8 sm:space-y-12">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-3xl font-extrabold text-center"
        >
          {lang === 'en' ? '📋 Day-by-Day Schedule' : '📋 दिन-प्रतिदिन कार्यक्रम'}
        </motion.h2>

        {sportsWeekDays.map((day, i) => (
          <DaySection key={day.date} day={day} lang={lang} index={i} onSelectGame={handleSelectGame} />
        ))}
      </section>

      {/* Parent Note */}
      <section className="container mx-auto px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          {/* Important Note Box */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-6 sm:p-8 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-3xl flex-shrink-0">📢</span>
              <div>
                <h3 className="font-bold text-lg mb-2">
                  {lang === 'en' ? 'Important for Parents' : 'अभिभावकों के लिए महत्वपूर्ण'}
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  {t.parentNote[lang]}
                </p>
              </div>
            </div>
          </div>

          {/* Schedule Note */}
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border-2 border-amber-200 p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <span className="text-3xl flex-shrink-0">⏰</span>
              <div>
                <h3 className="font-bold text-lg mb-2">
                  {lang === 'en' ? 'Daily Schedule' : 'दैनिक कार्यक्रम'}
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  {t.note[lang]}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Enrollment Section */}
      <section id="enroll" className="container mx-auto px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 p-6 sm:p-8">
            <div className="text-center mb-6">
              <motion.span
                className="text-5xl inline-block mb-3"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✍️
              </motion.span>
              <h2 className="text-2xl sm:text-3xl font-extrabold">
                {lang === 'en' ? 'Enroll Your Child Now!' : 'अभी अपने बच्चे का नामांकन करें!'}
              </h2>
              <p className="text-muted-foreground text-sm mt-2">
                {lang === 'en'
                  ? 'Fill the form below to register your child for Annual Sports Week 2026'
                  : 'वार्षिक खेल सप्ताह 2026 के लिए अपने बच्चे का पंजीकरण करने के लिए नीचे फॉर्म भरें'}
              </p>
            </div>
            <EnrollmentSection lang={lang} />
          </div>
        </motion.div>
      </section>

      {/* Upcoming Events */}
      <section className="container mx-auto px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-6">
            {t.upcoming[lang]}
          </h2>
          <div className="space-y-4">
            {upcomingEvents.map((event, i) => (
              <motion.div
                key={i}
                initial={{ x: -30, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 bg-card border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-3xl">{event.emoji}</div>
                <div>
                  <p className="font-bold">{event.label[lang]}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.date).toLocaleDateString(lang === 'en' ? 'en-IN' : 'hi-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Floating Enroll Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end">
        <a href="#enroll">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Button
              size="lg"
              className="rounded-full shadow-lg gap-2 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              ✍️ {lang === 'en' ? 'Enroll My Child' : 'नामांकन करें'}
            </Button>
          </motion.div>
        </a>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-8">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <img src="/assets/images/logo.PNG" alt="Logo" className="h-8 w-8 object-contain" />
              <span className="font-bold">{t.subtitle[lang]}</span>
            </div>
            <div className="flex justify-center gap-3 mb-4">
              <Link to="/fee-structure">
                <Button variant="outline" size="sm" className="text-xs">
                  {lang === 'en' ? '📄 Fee Structure' : '📄 शुल्क संरचना'}
                </Button>
              </Link>
              <Link to="/admission-enquiry">
                <Button size="sm" className="text-xs">
                  {lang === 'en' ? '📝 Apply for Admission' : '📝 प्रवेश के लिए आवेदन करें'}
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              {lang === 'en'
                ? '© 2026 First Step Public School. All rights reserved.'
                : '© 2026 फर्स्ट स्टेप पब्लिक स्कूल। सर्वाधिकार सुरक्षित।'}
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
