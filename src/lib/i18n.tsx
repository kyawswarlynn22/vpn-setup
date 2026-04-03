"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "en" | "mm";

const translations = {
  en: {
    brand: "Coder 21 VPN",
    checkStatus: "Check Status",
    contactUs: "Contact Us",
    footer: "All rights reserved.",

    // Status page
    statusTitle: "Check Your VPN Status",
    statusSubtitle: "Enter your email or Key ID to check your VPN usage and status.",
    searchPlaceholder: "Email address or Key ID...",
    search: "Search",
    noResults: "No results found",
    dataUsed: "Data Used",
    dataLimit: "Data Limit",
    unlimited: "Unlimited",
    server: "Server",
    expires: "Expires",
    expired: "Expired",
    daysLeft: "days left",
    created: "Created",

    // Contact page
    contactTitle: "Contact Us",
    contactSubtitle: "Have a question or need help? Reach out to us through any channel below.",

    // Admin login
    adminTitle: "Admin Login",
    adminSubtitle: "Enter admin password to manage Coder 21 VPN keys.",
    password: "Password",
    passwordPlaceholder: "Enter admin password",
    signIn: "Sign In",

    // Pricing page
    pricing: "Pricing",
    pricingTitle: "Outline Key Pricing Plans",
    pricingSubtitle: "Choose your best plan. Connect securely on any device, anytime.",
    currency: "MMK",
    thirtyDays: "30 Days",
    unlimitedDevices: "Unlimited Devices",
    devices: "Devices",
    popular: "Popular",
    bestValue: "Best Value",
    unlimitedBadge: "Unlimited",
    worksOn: "Connect securely on any device, anytime",
    retailTab: "Retail Price",
    resellerTab: "Reseller Price",
    resellerBanner: "20% Commission for Resellers!",
    resellerBannerDesc: "Buy at wholesale price and sell at retail price. Keep 20% profit on every sale.",
    retailLabel: "Retail",
    profitLabel: "Profit",
    commission20: "20% Commission",
    termsTitle: "Terms & Conditions",
    term1: "All plans are valid for 30 days from the date of activation.",
    term2: "Data usage is calculated based on total upload and download traffic.",
    term3: "Unused data does not carry over to the next billing period.",
    term4: "No refunds will be issued once a key has been activated.",
    term5: "Each key can be used on unlimited devices simultaneously.",
    term6: "We reserve the right to suspend or terminate accounts that violate our usage policy.",

    // FAQ page
    faq: "FAQ",
    faqTitle: "FAQ & How to Connect",
    faqSubtitle: "Learn how to set up your VPN and find answers to common questions.",
    howToConnect: "How to Connect",
    faqSection: "Frequently Asked Questions",

    guideAndroid: "Android",
    guideIOS: "iPhone / iPad",
    guideWindows: "Windows",
    guideMac: "macOS",

    downloadPlayStore: "Download from Google Play",
    downloadAppStore: "Download from App Store",
    downloadWindows: "Download for Windows",
    downloadMac: "Download from App Store",

    stepAndroid1Title: "Install Outline App",
    stepAndroid1Desc: "Download and install the Outline app from Google Play Store.",
    stepAndroid2Title: "Copy Your Access Key",
    stepAndroid2Desc: "Copy the ss:// access key you received from us.",
    stepAndroid3Title: "Add Server & Connect",
    stepAndroid3Desc: "Open the Outline app, tap 'Add Server', paste your key, and tap 'Connect'.",

    stepIOS1Title: "Install Outline App",
    stepIOS1Desc: "Download and install the Outline app from the App Store.",
    stepIOS2Title: "Copy Your Access Key",
    stepIOS2Desc: "Copy the ss:// access key you received from us.",
    stepIOS3Title: "Add Server & Connect",
    stepIOS3Desc: "Open the Outline app, tap 'Add Server', paste your key, and tap 'Connect'. Allow VPN permission when prompted.",

    stepWin1Title: "Download & Install",
    stepWin1Desc: "Download the Outline client for Windows and run the installer.",
    stepWin2Title: "Copy Your Access Key",
    stepWin2Desc: "Copy the ss:// access key you received from us.",
    stepWin3Title: "Add Server & Connect",
    stepWin3Desc: "Open Outline, click 'Add Server', paste your key, and click 'Connect'.",

    stepMac1Title: "Install Outline App",
    stepMac1Desc: "Download and install the Outline app from the Mac App Store.",
    stepMac2Title: "Copy Your Access Key",
    stepMac2Desc: "Copy the ss:// access key you received from us.",
    stepMac3Title: "Add Server & Connect",
    stepMac3Desc: "Open Outline, click 'Add Server', paste your key, and click 'Connect'. Allow VPN permission when prompted.",

    faq1Q: "What is Outline VPN?",
    faq1A: "Outline is a free and open-source VPN tool created by Jigsaw (Google). It uses the Shadowsocks protocol to provide a fast, secure, and reliable connection that is resistant to blocking.",
    faq2Q: "How do I get my access key?",
    faq2A: "After purchasing a plan, you will receive your unique ss:// access key via Telegram, Viber, or email. You can also check your key status on our website using your email or Key ID.",
    faq3Q: "How many devices can I use with one key?",
    faq3A: "Each key can be used on unlimited devices simultaneously. Install the Outline app on all your devices and use the same key.",
    faq4Q: "Is my connection secure?",
    faq4A: "Yes. Outline uses the Shadowsocks protocol which encrypts all your internet traffic. Your browsing activity is private and protected from third parties.",
    faq5Q: "What happens when my plan expires?",
    faq5A: "When your 30-day plan expires, the key will stop working. You can purchase a new plan to get a new key, or contact us to renew your existing key.",
    faq6Q: "What if the VPN is not connecting?",
    faq6A: "Try these steps: 1) Make sure you have internet access. 2) Check that you copied the full ss:// key correctly. 3) Try restarting the Outline app. 4) If still not working, contact us via Telegram or Viber for support.",

    // Key status
    active: "ACTIVE",
    keyStatus: "Status",
  },
  mm: {
    brand: "Coder 21 VPN",
    checkStatus: "VPN Data စစ်ဆေးရန်",
    contactUs: "ဆက်သွယ်ရန်",
    footer: "All rights reserved.",

    // Status page
    statusTitle: "VPN Data လက်ကျန် စစ်ဆေးရန်",
    statusSubtitle: "VPN Data လက်ကျန် စစ်ဆေးရန် အီးမေးလ် သို့မဟုတ် Key ID ထည့်ပါ။",
    searchPlaceholder: "အီးမေးလ် သို့မဟုတ် Key ID...",
    search: "ရှာဖွေရန်",
    noResults: "ရလဒ်မတွေ့ပါ",
    dataUsed: "အသုံးပြုပြီးဒေတာ",
    dataLimit: "ဒေတာကန့်သတ်ချက်",
    unlimited: "အကန့်အသတ်မဲ့",
    server: "ဆာဗာ",
    expires: "သက်တမ်းကုန်ဆုံးမည်ရက်",
    expired: "သက်တမ်းကုန်သွားပြီ",
    daysLeft: "ရက်ကျန်",
    created: "စတင်အသုံးပြုသည့်ရက်",

    // Contact page
    contactTitle: "ဆက်သွယ်ရန်",
    contactSubtitle: "ဝယ်ယူရန် သို့မဟုတ် မေးခွန်းရှိပါက အောက်ပါ ချန်နယ်တစ်ခုခုမှ ဆက်သွယ်ပါ။",

    // Admin login
    adminTitle: "အက်ဒမင်ဝင်ရောက်ရန်",
    adminSubtitle: "Coder 21 VPN keys များကို စီမံခန့်ခွဲရန် အက်ဒမင် စကားဝှက်ထည့်ပါ။",
    password: "စကားဝှက်",
    passwordPlaceholder: "အက်ဒမင် စကားဝှက်ထည့်ပါ",
    signIn: "ဝင်ရောက်ရန်",

    // Pricing page
    pricing: "စျေးနှုန်း",
    pricingTitle: "Outline Key စျေးနှုန်းအစီအစဉ်များ",
    pricingSubtitle: "သင့်အတွက် အကောင်းဆုံး အစီအစဉ်ကို ရွေးချယ်ပါ။ မည်သည့်စက်ပစ္စည်းတွင်မဆို လုံခြုံစွာ ချိတ်ဆက်နိုင်ပါသည်။",
    currency: "ကျပ်",
    thirtyDays: "ရက် ၃၀",
    unlimitedDevices: "Device အကန့်အသတ်မဲ့ အသုံးပြုနိုင်",
    devices: "Devices",
    popular: "လူကြိုက်အများဆုံး",
    bestValue: "အတန်ဆုံး",
    unlimitedBadge: "အကန့်အသတ်မဲ့",
    worksOn: "မည်သည့် OS အမျိုးအစားတွင် မဆို ချိတ်ဆက်နိုင်သည်",
    retailTab: "လက်လီစျေး",
    resellerTab: "လက်ကားစျေး",
    resellerBanner: "လက်ကားရောင်းချသူများအတွက် ကော်မရှင် ၂၀%!",
    resellerBannerDesc: "လက်ကားစျေးဖြင့် ဝယ်ယူပြီး လက်လီစျေးဖြင့် ရောင်းချနိုင်ပါသည်။ ရောင်းချမှုတစ်ခုတိုင်းအတွက် အမြတ် ၂၀% ရရှိနိုင်ပါသည်။။",
    retailLabel: "လက်လီ",
    profitLabel: "အမြတ်",
    commission20: "ကော်မရှင် ၂၀%",
    termsTitle: "စည်းမျဉ်းစည်းကမ်းများ",
    term1: "စတင်ဝယ်ယူသည့် နေ့မှစ၍ ရက် ၃၀ အတွင်းသာ အကျုံးဝင် အသုံးပြုနိုင်သည်။။",
    term2: "ဒေတာအသုံးပြုမှုကို စုစုပေါင်း upload နှင့် download traffic ပေါ်မူတည်၍ တွက်ချက်ပါသည်။",
    term3: "အသုံးမပြုရသေးသော ဒေတာသည် နောက်လသို့ ထပ်ပေါင်းထည့်ပေးမယ် မဟုတ်ပါ။",
    term4: "Key စတင်အသုံးပြုသည်နှင့် ငွေပြန်အမ်းမည်မဟုတ်ပါ။",
    term5: "Key တစ်ခုကို စက်ပစ္စည်းအကန့်အသတ်မဲ့ တစ်ပြိုင်နက်အသုံးပြုနိုင်ပါသည်။",
    term6: "အသုံးပြုမှုမူဝါဒကို ချိုးဖောက်သော အကောင့်များကို ဆိုင်းငံ့ သို့မဟုတ် ရပ်ဆိုင်းပိုင်ခွင့်ရှိပါသည်။",

    // FAQ page
    faq: "အမေးအဖြေ",
    faqTitle: "အမေးများသော မေးခွန်းများနှင့် ချိတ်ဆက်ပုံ အဆင့်ဆင့်",
    faqSubtitle: "မိမိအသုံးပြုသော Device ထည့်သို့ ထည့်သွင်းနည်းနှင့် အမေးများသော မေးခွန်းများ၏ အဖြေများ။",
    howToConnect: "ချိတ်ဆက်နည်း",
    faqSection: "အမေးများဆုံးမေးခွန်းများ",

    guideAndroid: "Android",
    guideIOS: "iPhone / iPad",
    guideWindows: "Windows",
    guideMac: "macOS",

    downloadPlayStore: "Google Play မှ ဒေါင်းလုဒ်ရယူပါ",
    downloadAppStore: "App Store မှ ဒေါင်းလုဒ်ရယူပါ",
    downloadWindows: "Windows အတွက် ဒေါင်းလုဒ်ရယူပါ",
    downloadMac: "App Store မှ ဒေါင်းလုဒ်ရယူပါ",

    stepAndroid1Title: "Outline App ထည့်သွင်းပါ",
    stepAndroid1Desc: "Google Play Store မှ Outline app ကို ဒေါင်းလုဒ်ဆွဲပြီး ထည့်သွင်းပါ။",
    stepAndroid2Title: "Access Key ကို ကူးယူပါ",
    stepAndroid2Desc: "ကျွန်ုပ်တို့ထံမှ ရရှိသော ss:// access key ကို ကူးယူပါ။",
    stepAndroid3Title: "Server ထည့်ပြီး ချိတ်ဆက်ပါ",
    stepAndroid3Desc: "Outline app ကိုဖွင့်ပါ၊ 'Add Server' ကိုနှိပ်ပါ၊ key ကို paste လုပ်ပြီး 'Connect' ကိုနှိပ်ပါ။",

    stepIOS1Title: "Outline App ထည့်သွင်းပါ",
    stepIOS1Desc: "App Store မှ Outline app ကို ဒေါင်းလုဒ်ဆွဲပြီး ထည့်သွင်းပါ။",
    stepIOS2Title: "Access Key ကို ကူးယူပါ",
    stepIOS2Desc: "ကျွန်ုပ်တို့ထံမှ ရရှိသော ss:// access key ကို ကူးယူပါ။",
    stepIOS3Title: "Server ထည့်ပြီး ချိတ်ဆက်ပါ",
    stepIOS3Desc: "Outline app ကိုဖွင့်ပါ၊ 'Add Server' ကိုနှိပ်ပါ၊ key ကို paste လုပ်ပြီး 'Connect' ကိုနှိပ်ပါ။ VPN ခွင့်ပြုချက်ကို ခွင့်ပြုပါ။",

    stepWin1Title: "ဒေါင်းလုဒ်ဆွဲပြီး ထည့်သွင်းပါ",
    stepWin1Desc: "Windows အတွက် Outline client ကို ဒေါင်းလုဒ်ဆွဲပြီး installer ကို run ပါ။",
    stepWin2Title: "Access Key ကို ကူးယူပါ",
    stepWin2Desc: "ကျွန်ုပ်တို့ထံမှ ရရှိသော ss:// access key ကို ကူးယူပါ။",
    stepWin3Title: "Server ထည့်ပြီး ချိတ်ဆက်ပါ",
    stepWin3Desc: "Outline ကိုဖွင့်ပါ၊ 'Add Server' ကိုနှိပ်ပါ၊ key ကို paste လုပ်ပြီး 'Connect' ကိုနှိပ်ပါ။",

    stepMac1Title: "Outline App ထည့်သွင်းပါ",
    stepMac1Desc: "Mac App Store မှ Outline app ကို ဒေါင်းလုဒ်ဆွဲပြီး ထည့်သွင်းပါ။",
    stepMac2Title: "Access Key ကို ကူးယူပါ",
    stepMac2Desc: "ကျွန်ုပ်တို့ထံမှ ရရှိသော ss:// access key ကို ကူးယူပါ။",
    stepMac3Title: "Server ထည့်ပြီး ချိတ်ဆက်ပါ",
    stepMac3Desc: "Outline ကိုဖွင့်ပါ၊ 'Add Server' ကိုနှိပ်ပါ၊ key ကို paste လုပ်ပြီး 'Connect' ကိုနှိပ်ပါ။ VPN ခွင့်ပြုချက်ကို ခွင့်ပြုပါ။",

    faq1Q: "Outline VPN ဆိုတာ ဘာလဲ?",
    faq1A: "Outline သည် Jigsaw (Google) မှ ဖန်တီးထားသော အခမဲ့ open-source VPN tool တစ်ခုဖြစ်ပါသည်။ Shadowsocks protocol ကို အသုံးပြုပြီး မြန်ဆန်၊ လုံခြုံ၊ ယုံကြည်စိတ်ချရသော လိုင်းဆွဲအားကို ပေးစွမ်းပါသည်။",
    faq2Q: "Access key ကို ဘယ်လိုရမလဲ?",
    faq2A: "Plan တစ်ခုကို ဝယ်ယူပြီးနောက် သင့်ကို ss:// access key ကို Telegram၊ Viber သို့မဟုတ် email မှတစ်ဆင့် ရရှိပါမည်။ သင့်အီးမေးလ် သို့မဟုတ် Key ID ဖြင့် ဤဝဘ်ဆိုဒ်တွင်လည်း key အခြေအနေကို စစ်ဆေးနိုင်ပါသည်။",
    faq3Q: "Key တစ်ခုနဲ့ စက်ပစ္စည်းဘယ်နှစ်ခု သုံးလို့ရလဲ?",
    faq3A: "Key တစ်ခုကို စက်ပစ္စည်းအကန့်အသတ်မဲ့ တစ်ပြိုင်နက် အသုံးပြုနိုင်ပါသည်။ သင့်စက်ပစ္စည်းအားလုံးတွင် Outline app ထည့်သွင်းပြီး key တစ်ခုတည်းကို အသုံးပြုပါ။",
    faq4Q: "ကျွန်ုပ်၏ ချိတ်ဆက်မှု လုံခြုံပါသလား?",
    faq4A: "ဟုတ်ကဲ့။ Outline သည် သင့်အင်တာနက် traffic အားလုံးကို encrypt လုပ်ပေးသော Shadowsocks protocol ကို အသုံးပြုပါသည်။ သင့် browsing activity သည် ကိုယ်ပိုင်ဖြစ်ပြီး third parties များမှ ကာကွယ်ထားပါသည်။",
    faq5Q: "အစီအစဉ် သက်တမ်းကုန်ရင် ဘာဖြစ်မလဲ?",
    faq5A: "သင့် ၃၀ ရက် အစီအစဉ် သက်တမ်းကုန်သောအခါ key သည် အလုပ်မလုပ်တော့တော့မည် မဟုတ်ပါ။ key အသစ်ရရန် အစီအစဉ်အသစ် ဝယ်ယူနိုင်ပါသည် သို့မဟုတ် လက်ရှိ key ကို သက်တမ်းတိုးရန် ကျွန်ုပ်တို့ကို ဆက်သွယ်ပါ။",
    faq6Q: "VPN ချိတ်ဆက်လို့ မရရင် ဘာလုပ်ရမလဲ?",
    faq6A: "ဤအဆင့်များ စမ်းကြည့်ပါ: ၁) အင်တာနက် ချိတ်ဆက်မှုရှိမရှိ စစ်ဆေးပါ။ ၂) ss:// key အပြည့်အစုံ မှန်ကန်စွာ ကူးယူထားမထား စစ်ဆေးပါ။ ၃) Outline app ကို restart လုပ်ကြည့်ပါ။ ၄) မရသေးပါက Telegram သို့မဟုတ် Viber မှတစ်ဆင့် ကျွန်ုပ်တို့ကို ဆက်သွယ်ပါ။",

    // Key status
    active: "အသုံးပြုနေ",
    keyStatus: "အခြေအနေ",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved === "en" || saved === "mm") setLangState(saved);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("lang", l);
  }

  function t(key: TranslationKey): string {
    return translations[lang][key] ?? translations.en[key] ?? key;
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
