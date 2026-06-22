import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: '硬件设计',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        电源、接口、保护器件、常用器件、无线通信等硬件相关知识，涵盖 DCDC、USB、RS485、TVS、MOS 管等。
      </>
    ),
  },
  {
    title: 'MCU 开发',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        STM32、WCH RISC-V (CH32V)、BLE 蓝牙 (CH592/CH584) 等 MCU 平台的开发经验和技术笔记。
      </>
    ),
  },
  {
    title: 'RTOS & 软件',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        RT-Thread、FreeRTOS 实时操作系统，嵌入式软件框架、常用组件、通信协议、OTA 升级等知识。
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
