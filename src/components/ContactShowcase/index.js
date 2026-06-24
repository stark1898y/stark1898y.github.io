import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

export default function ContactShowcase() {
  return (
    <section className={styles.section}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          更多平台
        </Heading>
        <p className={styles.sectionDescription}>
          在其他平台也能找到我的技术分享
        </p>
        <div className="row">
          <div className={clsx('col col--6')}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>📝</span>
                <div>
                  <Heading as="h3" className={styles.cardTitle}>CSDN 博客</Heading>
                  <span className={styles.cardSubtitle}>技术文章 · 实战笔记</span>
                </div>
              </div>
              <p className={styles.cardDescription}>
                嵌入式开发技术博客，涵盖 STM32、RTOS、硬件设计、通信协议等内容，持续更新中。
              </p>
              <Link
                className={styles.cardLink}
                to="https://blog.csdn.net/gg1658608470?type=blog">
                访问 CSDN 博客 →
              </Link>
            </div>
          </div>
          <div className={clsx('col col--6')}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>💬</span>
                <div>
                  <Heading as="h3" className={styles.cardTitle}>微信公众号</Heading>
                  <span className={styles.cardSubtitle}>扫码关注 · 获取更新</span>
                </div>
              </div>
              <p className={styles.cardDescription}>
                关注微信公众号，获取嵌入式开发干货、开源项目动态和技术分享推送。
              </p>
              <div className={styles.qrcodeWrapper}>
                <img
                  className={styles.qrcode}
                  src="/img/wechat-qrcode.png"
                  alt="微信公众号二维码"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
