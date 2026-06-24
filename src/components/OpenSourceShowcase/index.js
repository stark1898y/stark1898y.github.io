import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const ProjectList = [
  {
    title: '功耗计算器',
    description: '嵌入式设备电池续航时间与电池容量的在线估算工具，支持锂电池/锂亚电池/碱性干电池，多工作模式配置，图表可视化。',
    link: '/open-source/power-calculator/',
    github: 'https://github.com/stark1898y/Power-Consumption-Calculator',
    tags: ['HTML', 'Python', 'Chart.js'],
  },
  {
    title: '气体浓度换算',
    description: '可燃气体 %VOL、ppm、%LEL 浓度单位在线换算工具，支持 8 种常见可燃气体，提供网页版、Python GUI、C 命令行三种实现。',
    link: '/open-source/gas-converter/',
    github: 'https://github.com/stark1898y/Gas_VOL_ppm_LEL',
    tags: ['HTML', 'Python', 'C'],
  },
];

function ProjectCard({title, description, link, github, tags}) {
  return (
    <div className={clsx('col col--6')}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <Heading as="h3" className={styles.cardTitle}>
            <Link to={link}>{title}</Link>
          </Heading>
          <div className={styles.tags}>
            {tags.map((tag, idx) => (
              <span key={idx} className={styles.tag}>{tag}</span>
            ))}
          </div>
        </div>
        <p className={styles.cardDescription}>{description}</p>
        <div className={styles.cardLinks}>
          <Link className={styles.cardLink} to={link}>
            查看详情 →
          </Link>
          <Link className={styles.cardLinkSecondary} to={github}>
            GitHub
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OpenSourceShowcase() {
  return (
    <section className={styles.section}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          开源项目
        </Heading>
        <p className={styles.sectionDescription}>
          个人开发的开源工具和计算器，可直接在线使用
        </p>
        <div className="row">
          {ProjectList.map((props, idx) => (
            <ProjectCard key={idx} {...props} />
          ))}
        </div>
        <div className={styles.moreLink}>
          <Link to="/open-source/">
            查看全部开源项目 →
          </Link>
        </div>
      </div>
    </section>
  );
}
