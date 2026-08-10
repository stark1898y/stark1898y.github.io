import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import Mermaid from './Mermaid.vue'
import Breadcrumb from './Breadcrumb.vue'
import BackToTop from './BackToTop.vue'
import SidebarToggle from './SidebarToggle.vue'
import VisitorCounter from './VisitorCounter.vue'
import ForceFullNav from './ForceFullNav.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout: () =>
    h(Mermaid, null, () =>
      h(ForceFullNav, null, () =>
        h('div', null, [
          h(DefaultTheme.Layout, null, {
            'doc-before': () => h(Breadcrumb),
            'sidebar-nav-before': () => h(SidebarToggle),
          }),
          h(BackToTop),
          h(VisitorCounter),
        ]),
      ),
    ),
}
