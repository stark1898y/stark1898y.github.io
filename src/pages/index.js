/*
 * @Author: stark1898y 1658608470@qq.com
 * @Date: 2026-06-22 10:42:38
 * @LastEditors: stark1898y 1658608470@qq.com
 * @LastEditTime: 2026-06-22 11:30:56
 * @FilePath: \stark1898y.github.io\src\pages\index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import OpenSourceShowcase from '@site/src/components/OpenSourceShowcase';
import ContactShowcase from '@site/src/components/ContactShowcase';

import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            开始探索 →
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="嵌入式开发知识库 - 硬件设计、MCU开发、RTOS、软件开发">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <OpenSourceShowcase />
        <ContactShowcase />
      </main>
    </Layout>
  );
}
