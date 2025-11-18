import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';

export default function Home() {
  const router = useRouter();
  const [locale, setLocale] = useState('en');

  useEffect(() => {
    setLocale(router.locale || 'en');
  }, [router.locale]);

  const t = {
    en: {
      title: 'Streamer Management System',
      subtitle: 'Professional platform for managing streamers across multiple platforms',
      features: 'Features',
      feature1: 'Multi-Platform Integration',
      feature1Desc: 'Support for YouTube, Twitch, TikTok, Kick, Instagram, and Facebook Gaming',
      feature2: 'Credit System',
      feature2Desc: 'Earn and spend credits for achievements and rewards',
      feature3: 'Performance Tracking',
      feature3Desc: 'Comprehensive analytics and performance reports',
      feature4: 'AI-Powered Insights',
      feature4Desc: 'Smart suggestions and automated content analysis',
      getStarted: 'Get Started',
      login: 'Login with Discord',
      learnMore: 'Learn More',
    },
    ar: {
      title: 'نظام إدارة البث المباشر',
      subtitle: 'منصة احترافية لإدارة البث عبر منصات متعددة',
      features: 'المميزات',
      feature1: 'تكامل متعدد المنصات',
      feature1Desc: 'دعم يوتيوب، تويتش، تيك توك، كيك، إنستغرام، وفيسبوك جيمنج',
      feature2: 'نظام الرصيد',
      feature2Desc: 'اكسب وأنفق الرصيد مقابل الإنجازات والمكافآت',
      feature3: 'تتبع الأداء',
      feature3Desc: 'تحليلات شاملة وتقارير أداء',
      feature4: 'رؤى مدعومة بالذكاء الاصطناعي',
      feature4Desc: 'اقتراحات ذكية وتحليل محتوى آلي',
      getStarted: 'ابدأ الآن',
      login: 'تسجيل الدخول بواسطة ديسكورد',
      learnMore: 'اعرف المزيد',
    },
  };

  const trans = t[locale] || t.en;

  const switchLanguage = (lang) => {
    router.push(router.pathname, router.asPath, { locale: lang });
  };

  return (
    <div className={styles.container} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <Head>
        <title>{trans.title}</title>
        <meta name="description" content="Professional Streamer Management System" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={styles.header}>
        <nav className={styles.nav}>
          <div className={styles.logo}>
            <h2>🎮 Streamer System</h2>
          </div>
          <div className={styles.langSwitcher}>
            <button 
              onClick={() => switchLanguage('en')}
              className={locale === 'en' ? styles.active : ''}
            >
              EN
            </button>
            <button 
              onClick={() => switchLanguage('ar')}
              className={locale === 'ar' ? styles.active : ''}
            >
              AR
            </button>
          </div>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.title}>{trans.title}</h1>
          <p className={styles.subtitle}>{trans.subtitle}</p>
          <div className={styles.cta}>
            <button className={styles.primaryButton} onClick={() => router.push('/api/auth/signin')}>
              {trans.login}
            </button>
            <button className={styles.secondaryButton}>
              {trans.learnMore}
            </button>
          </div>
        </section>

        <section className={styles.features}>
          <h2>{trans.features}</h2>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🌐</div>
              <h3>{trans.feature1}</h3>
              <p>{trans.feature1Desc}</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>💰</div>
              <h3>{trans.feature2}</h3>
              <p>{trans.feature2Desc}</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📊</div>
              <h3>{trans.feature3}</h3>
              <p>{trans.feature3Desc}</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🤖</div>
              <h3>{trans.feature4}</h3>
              <p>{trans.feature4Desc}</p>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2024 Streamer Management System. All rights reserved.</p>
      </footer>
    </div>
  );
}
