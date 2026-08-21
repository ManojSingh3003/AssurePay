import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import { Footer } from "@repo/ui";
import { AppbarClient } from "../components/AppbarClient";
import Link from "next/link";
import styles from "./landing.module.css";

export default async function Page() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col transition-colors relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-white dark:bg-zinc-950 -z-20"></div>
      
      {/* Dynamic Background */}
      <div className="grid-background opacity-40 dark:opacity-60 -z-10"></div>
      <div className={`${styles.sphere} ${styles.sphere1}`}></div>
      <div className={`${styles.sphere} ${styles.sphere2}`}></div>
      
      <AppbarClient user={session?.user} />

      <main className="grow flex flex-col w-full">
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <h1 className={styles.heroTitle}>
            Next-Gen <br />
            <span className={styles.highlightText}>Neo-Banking.</span>
          </h1>
          
          <p className={styles.heroSubtitle}>
            Experience lightning-fast P2P transfers and secure wallet management.
            AssurePay is crafted for the modern, demanding user.
          </p>

          <div className={styles.buttonGroup}>
            {session?.user ? (
              <Link href="/dashboard" className={styles.primaryButton}>
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/signup" className={styles.primaryButton}>
                  Get Started
                </Link>
                <Link href="/signin" className={styles.secondaryButton}>
                  Sign In
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.featuresSection}>
          <h2 className="text-3xl md:text-4xl font-bold text-center text-zinc-900 dark:text-white mb-12 opacity-0 animate-[slideUp_0.8s_ease_0.6s_forwards]">
            Why Choose AssurePay?
          </h2>
          
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>⚡</div>
              <h3 className={styles.featureTitle}>Lightning Fast</h3>
              <p className={styles.featureDescription}>
                Instant peer-to-peer transfers. Money moves as fast as you do, with zero artificial delays.
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🔒</div>
              <h3 className={styles.featureTitle}>Bank-Grade Security</h3>
              <p className={styles.featureDescription}>
                Your funds are protected by state-of-the-art encryption and modern authentication standards.
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>💎</div>
              <h3 className={styles.featureTitle}>Zero Hidden Fees</h3>
              <p className={styles.featureDescription}>
                What you see is what you get. We believe in complete transparency for all your transactions.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}