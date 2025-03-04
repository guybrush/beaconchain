<script lang="ts" setup>
import type {
  MenuBarButton, MenuBarEntry,
} from '~/types/menuBar'
import { useUserDashboardStore } from '~/stores/dashboard/useUserDashboardStore'
import {
  COOKIE_DASHBOARD_ID, type CookieDashboard, type Dashboard, type DashboardKey, type DashboardType,
} from '~/types/dashboard'

const { t: $t } = useTranslation()
const { width } = useWindowSize()
const route = useRoute()
const router = useRouter()
const showInDevelopment = Boolean(useRuntimeConfig().public.showInDevelopment)

const { isLoggedIn } = useUserStore()
const { dashboards } = useUserDashboardStore()
const {
  dashboardKey, dashboardType, isShared, setDashboardKey,
} = useDashboardKey()

const emit = defineEmits<{ (e: 'showCreation'): void }>()

const getDashboardName = (db: Dashboard): string => {
  if (isLoggedIn.value) {
    return db.name || `${$t('dashboard.title')} ${db.id}` // Just to be sure, we should not have dashboards without a name in prod
  }
  else {
    return db.id === COOKIE_DASHBOARD_ID.ACCOUNT
      ? $t('dashboard.account_dashboard')
      : $t('dashboard.validator_dashboard')
  }
}

const items = computed<MenuBarEntry[]>(() => {
  if (dashboards.value === undefined || isShared.value) {
    return []
  }

  const buttons: MenuBarEntry[] = []

  // if we are in a public dashboard and change the validators then the route does not get updated
  const fixedRoute = router.resolve({
    name: route.name!,
    params: { id: dashboardKey.value },
  })

  const addToSortedItems = (label: string, items?: MenuBarButton[]) => {
    if (items?.length) {
      const active = items.find(i => i.active || i.route === fixedRoute.path)
      const hasMoreItems = items.length > 1
      const count = hasMoreItems && width.value >= 520 ? ` (${items.length})` : ''
      buttons.push({
        active: !!active,
        command: !hasMoreItems ? items[0].command : undefined,
        disabledTooltip: !hasMoreItems ? items[0].disabledTooltip : undefined,
        dropdown: hasMoreItems,
        items: hasMoreItems ? items : undefined,
        label: label + count,
        route: !hasMoreItems ? items[0].route : undefined,
      })
    }
  }
  const createMenuBarButton = (
    type: DashboardType,
    label: string,
    id: DashboardKey,
  ): MenuBarButton => {
    if (type === dashboardType.value) {
      return {
        active: id === dashboardKey.value,
        command: () => setDashboardKey(id),
        label,
        route: `/dashboard/${id}`,
      }
    }

    if (type === 'validator') {
      return {
        label,
        route: `/dashboard/${id}`,
      }
    }
    return {
      label,
      route: `/account-dashboard/${id}`,
    }
  }
  addToSortedItems($t('dashboard.header.validator'), dashboards.value?.validator_dashboards?.map((db) => {
    const cd = db as CookieDashboard
    return createMenuBarButton('validator', getDashboardName(cd), `${cd.hash !== undefined ? cd.hash : cd.id}`)
  }))
  if (showInDevelopment) {
    addToSortedItems($t('dashboard.header.account'), dashboards.value?.validator_dashboards?.slice(0, 1).map((db) => {
      const cd = db as CookieDashboard
      return createMenuBarButton('account', getDashboardName(cd), `${cd.hash ?? cd.id}`)
    }))
  }
  const disabledTooltip = !showInDevelopment ? $t('common.coming_soon') : undefined
  const onNotificationsPage = dashboardType.value === 'notifications'
  addToSortedItems($t('notifications.title'), [ {
    active: onNotificationsPage,
    disabledTooltip,
    label: $t('notifications.title'),
    route: !onNotificationsPage ? '/notifications' : undefined,
  } ])

  return buttons
})
</script>

<template>
  <div class="header-container">
    <BcMenuBar
      class="menu-bar"
      :buttons="items"
    />
    <BcButton
      v-if="!isShared"
      variant="secondary"
      class="p-button-icon-only"
      @click="emit('showCreation')"
    >
      <IconPlus
        title="Add new dashboard"
        width="100%"
        height="100%"
      />
    </BcButton>
  </div>
</template>

<style lang="scss" scoped>
.header-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: var(--padding);
  padding-bottom: var(--padding-medium);
  margin-bottom: var(--padding-medium);
  min-width: 1px;
  gap: var(--padding);
  border-bottom: var(--container-border);

  .edit_button {
    border-color: var(--container-border-color);
    background-color: var(--container-background);
    color: var(--container-color);
    flex-shrink: 0;
  }

  .menu-bar {
    display: flex;
    flex-shrink: 1;
    overflow: hidden;
  }

  :deep(.p-menubar-root-list >.p-menuitem ) {
    min-width: 102px;
    >.p-menuitem-content:not(:has(.toggle)) {
      .button-content {
        justify-content: center;
      }
    }
  }

  :deep(.p-menubar-root-list .p-menuitem .p-submenu-list) {
    position: fixed;
  }

  @media (max-width: 519px) {
    gap: var(--padding-small);

    :deep(.p-menubar-root-list) {
      gap: var(--padding-small);
    }

    :deep(.p-menubar-root-list > .p-menuitem > .p-menuitem-content) {
      padding: var(--padding-small) var(--padding);
    }
  }
}
</style>
